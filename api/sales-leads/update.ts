import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';
import { extractEmailDomain, normalizeEmail, normalizePhone } from './_normalize';
import { computeScore, type EmailType, type SourceCategory } from './_scoring';

const ALLOWED_FIELDS = [
  'title', 'company', 'companyId', 'contactName', 'contactFirstName', 'contactLastName',
  'contactEmail', 'contactPhone', 'contactId', 'amount', 'stage', 'source', 'productType',
  'inHandsDate', 'owner', 'ownerInitials', 'notes', 'probability', 'quantity', 'tags',
  'documents', 'lastActivity',
  'sourceCategory', 'sourceDetail', 'disqualifiedReason',
  'emailType', 'isExistingCustomer', 'enrichedCompany',
  'sourceOrderId', 'sourceOrderNumber', 'orderLinkedAt',
];

const SCORE_TRIGGER_FIELDS = new Set([
  'contactEmail', 'contactPhone', 'amount', 'sourceCategory',
  'disqualifiedReason', 'emailType', 'isExistingCustomer',
]);

const VALID_SOURCE_CATEGORIES: SourceCategory[] = [
  'organic', 'paid', 'referral', 'direct', 'email', 'social', 'outbound',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, ...fields } = req.body ?? {};
  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  if (
    fields.sourceCategory !== undefined &&
    fields.sourceCategory !== null &&
    !VALID_SOURCE_CATEGORIES.includes(fields.sourceCategory)
  ) {
    return res.status(400).json({ error: `sourceCategory must be one of: ${VALID_SOURCE_CATEGORIES.join(', ')}` });
  }

  const setPayload: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  let scoreNeedsRecompute = false;

  for (const key of ALLOWED_FIELDS) {
    if (key in fields && fields[key] !== undefined) {
      setPayload[key] = fields[key];
      if (SCORE_TRIGGER_FIELDS.has(key)) scoreNeedsRecompute = true;
    }
  }

  if ('contactEmail' in fields) {
    setPayload.normalizedEmail = normalizeEmail(fields.contactEmail);
    setPayload.emailDomain = extractEmailDomain(fields.contactEmail);
  }
  if ('contactPhone' in fields) {
    setPayload.normalizedPhone = normalizePhone(fields.contactPhone);
  }

  if ('stage' in fields) {
    setPayload.lastActivity = new Date().toISOString();
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const collection = db.collection('salesLeads');

    if (fields.stage === 'closed-lost') {
      const existing = await collection.findOne(filter, { projection: { disqualifiedReason: 1 } });
      const incomingReason = setPayload.disqualifiedReason ?? existing?.disqualifiedReason ?? null;
      if (!incomingReason) {
        return res.status(400).json({ error: 'disqualifiedReason is required when stage is closed-lost.' });
      }
    }

    if (scoreNeedsRecompute) {
      const existing = await collection.findOne(filter);
      if (!existing) {
        return res.status(404).json({ error: 'Sales lead not found.' });
      }
      const merged = { ...existing, ...setPayload } as Record<string, unknown>;
      const { score, breakdown } = computeScore({
        sourceCategory: (merged.sourceCategory as SourceCategory | null) ?? null,
        emailType: (merged.emailType as EmailType | null) ?? 'unknown',
        normalizedPhone: (merged.normalizedPhone as string | null) ?? null,
        amount: typeof merged.amount === 'number' ? (merged.amount as number) : Number(merged.amount) || 0,
        isExistingCustomer: Boolean(merged.isExistingCustomer),
        disqualifiedReason: (merged.disqualifiedReason as string | null) ?? null,
      });
      setPayload.score = score;
      setPayload.scoreBreakdown = breakdown;
      setPayload.scoreUpdatedAt = new Date().toISOString();
    }

    const result = await collection.updateOne(filter, { $set: setPayload });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Sales lead not found.' });
    }
    return res.status(200).json({ success: true });
  } catch (error: any) {
    if (error?.code === 11000 && error?.keyPattern?.normalizedEmail) {
      return res.status(409).json({ error: 'Another lead already uses this email address.' });
    }
    const message = error instanceof Error ? error.message : 'Failed to update sales lead.';
    return res.status(500).json({ error: message });
  }
}
