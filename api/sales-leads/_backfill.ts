import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';
import { extractEmailDomain, normalizeEmail, normalizePhone } from './_normalize';
import { computeScore, type EmailType, type SourceCategory } from './_scoring';

/**
 * One-shot admin endpoint. Walks every existing lead and populates
 * normalizedEmail, normalizedPhone, emailDomain, score, scoreBreakdown, scoreUpdatedAt
 * if missing. Safe to re-run.
 *
 * POST with header `x-admin-token: <LEAD_INDEX_ADMIN_TOKEN>`.
 *
 * NOTE: run AFTER _ensureIndexes.ts. The unique sparse index on normalizedEmail
 * means a duplicate-email collision will throw on backfill — those records
 * are reported back so an operator can manually merge them.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expected = process.env.LEAD_INDEX_ADMIN_TOKEN;
  const provided = req.headers['x-admin-token'];
  if (!expected || provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('salesLeads');

    const cursor = collection.find({});
    let scanned = 0;
    let updated = 0;
    const conflicts: Array<{ id: string; email: string; reason: string }> = [];

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc) break;
      scanned++;

      const setPayload: Record<string, unknown> = {};

      if (doc.normalizedEmail === undefined) {
        setPayload.normalizedEmail = normalizeEmail(doc.contactEmail);
      }
      if (doc.normalizedPhone === undefined) {
        setPayload.normalizedPhone = normalizePhone(doc.contactPhone);
      }
      if (doc.emailDomain === undefined) {
        setPayload.emailDomain = extractEmailDomain(doc.contactEmail);
      }
      if (doc.score === undefined) {
        const { score, breakdown } = computeScore({
          sourceCategory: (doc.sourceCategory as SourceCategory | null) ?? null,
          emailType: (doc.emailType as EmailType | null) ?? 'unknown',
          normalizedPhone: typeof setPayload.normalizedPhone === 'string'
            ? (setPayload.normalizedPhone as string)
            : (doc.normalizedPhone as string | null) ?? null,
          amount: typeof doc.amount === 'number' ? doc.amount : Number(doc.amount) || 0,
          isExistingCustomer: Boolean(doc.isExistingCustomer),
          disqualifiedReason: (doc.disqualifiedReason as string | null) ?? null,
        });
        setPayload.score = score;
        setPayload.scoreBreakdown = breakdown;
        setPayload.scoreUpdatedAt = new Date().toISOString();
      }
      if (doc.formSubmitCount === undefined) {
        setPayload.formSubmitCount = 0;
      }

      if (Object.keys(setPayload).length === 0) continue;

      try {
        await collection.updateOne({ _id: doc._id }, { $set: setPayload });
        updated++;
      } catch (err: any) {
        if (err?.code === 11000) {
          conflicts.push({
            id: doc._id.toString(),
            email: (doc.contactEmail as string) || '',
            reason: 'duplicate normalizedEmail',
          });
        } else {
          throw err;
        }
      }
    }

    return res.status(200).json({ success: true, scanned, updated, conflicts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to backfill leads.';
    return res.status(500).json({ error: message });
  }
}
