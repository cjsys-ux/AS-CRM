import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';
import { runPipeline, type RawLeadInput } from './_pipeline';

/**
 * Public lead-capture endpoint. Embed forms post here. CORS-open, IP rate-limited.
 *
 * Hardening:
 *  - Honeypot field `_hp`: silently succeed if filled in (bots fill all fields).
 *  - IP rate limit: max 30 submissions per IP per 15 minutes.
 *  - Silent merge on exact-email match: increments formSubmitCount instead of duplicating.
 *  - Payload size capped, unknown fields dropped.
 *  - Returns only `{ success: true }` (no leadId echo).
 */

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 30;

const ALLOWED_KEYS: (keyof RawLeadInput)[] = [
  'title', 'company', 'contactName', 'contactFirstName', 'contactLastName',
  'contactEmail', 'contactPhone', 'amount', 'source', 'sourceCategory', 'sourceDetail',
  'productType', 'inHandsDate', 'notes', 'quantity', 'tags',
  'utm', 'referrer', 'landingPage', 'gclid', 'fbclid', 'captureFormId',
];

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function getIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0];
  return (req.socket as any)?.remoteAddress ?? 'unknown';
}

function isLikelyEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeString(v: unknown, maxLen = 1000): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

function pickAllowedFields(body: any): RawLeadInput {
  const out: RawLeadInput = {};
  for (const key of ALLOWED_KEYS) {
    const val = body?.[key];
    if (val === undefined || val === null) continue;
    if (key === 'utm' && typeof val === 'object') {
      out.utm = {
        source: sanitizeString(val.source, 200) ?? undefined,
        medium: sanitizeString(val.medium, 200) ?? undefined,
        campaign: sanitizeString(val.campaign, 200) ?? undefined,
        term: sanitizeString(val.term, 200) ?? undefined,
        content: sanitizeString(val.content, 200) ?? undefined,
      };
    } else if (key === 'tags' && Array.isArray(val)) {
      out.tags = val
        .filter((x) => typeof x === 'string')
        .slice(0, 20)
        .map((x: string) => x.slice(0, 80));
    } else if (key === 'amount' || key === 'quantity') {
      const n = typeof val === 'number' ? val : Number(val);
      if (Number.isFinite(n)) (out as any)[key] = n;
    } else {
      const s = sanitizeString(val, key === 'notes' ? 4000 : 500);
      if (s) (out as any)[key] = s;
    }
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Honeypot — quietly accept and discard.
  const honeypot = (req.body as any)?._hp;
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return res.status(200).json({ success: true });
  }

  const ip = getIp(req);
  const ua = sanitizeString(req.headers['user-agent'], 500);

  let db;
  try {
    db = await getDb();
  } catch {
    return res.status(500).json({ error: 'Service unavailable.' });
  }

  // Rate limit
  try {
    const sinceDate = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recent = await db.collection('captureRateLimit').countDocuments({
      ip,
      createdAt: { $gte: sinceDate },
    });
    if (recent >= RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Too many requests.' });
    }
    await db.collection('captureRateLimit').insertOne({ ip, createdAt: new Date() });
  } catch {
    // If rate-limit collection fails, fail open — don't block real submissions.
  }

  const cleaned = pickAllowedFields(req.body ?? {});

  if (!isLikelyEmail(cleaned.contactEmail) && !cleaned.contactPhone) {
    return res.status(400).json({ error: 'Either a valid email or phone is required.' });
  }
  if (!cleaned.title && !cleaned.company && !cleaned.contactName) {
    return res.status(400).json({ error: 'Provide a title, company, or contact name.' });
  }

  cleaned.title = cleaned.title ?? cleaned.company ?? cleaned.contactName ?? 'Inbound Lead';
  cleaned.capturedAt = new Date().toISOString();
  cleaned.ipAddress = ip;
  cleaned.userAgent = ua;
  cleaned.source = cleaned.source ?? 'Website';

  try {
    const { doc, exactEmailMatch } = await runPipeline(db, cleaned);

    if (exactEmailMatch) {
      // Silent merge — increment formSubmitCount, refresh attribution touchpoints,
      // bump lastActivity. Don't overwrite existing owner/stage/probability.
      await db.collection('salesLeads').updateOne(
        { _id: toObjectId(exactEmailMatch.leadId) },
        {
          $inc: { formSubmitCount: 1 },
          $set: {
            lastActivity: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(cleaned.utm ? { lastCaptureUtm: cleaned.utm } : {}),
            ...(cleaned.referrer ? { lastCaptureReferrer: cleaned.referrer } : {}),
            ...(cleaned.landingPage ? { lastCaptureLandingPage: cleaned.landingPage } : {}),
            lastCapturedAt: cleaned.capturedAt,
          },
        },
      );
      return res.status(200).json({ success: true });
    }

    await db.collection('salesLeads').insertOne(doc);
    return res.status(201).json({ success: true });
  } catch (error: any) {
    if (error?.code === 11000) {
      // Concurrent insert with same email — treat as silent success.
      return res.status(200).json({ success: true });
    }
    const message = error instanceof Error ? error.message : 'Failed to capture lead.';
    return res.status(500).json({ error: message });
  }
}

function toObjectId(id: string) {
  // Lazy import to avoid bundling cost on cold start when not needed.
  const { ObjectId } = require('mongodb');
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}
