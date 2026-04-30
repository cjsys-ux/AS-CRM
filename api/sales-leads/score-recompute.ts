import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';
import { computeScore, type EmailType, type SourceCategory } from './_scoring';

/**
 * Recompute the lead score(s).
 *  - With { leadId }: recomputes a single lead.
 *  - With { staleHours }: recomputes leads whose scoreUpdatedAt is older than that.
 *  - With no body: recomputes everything, capped at 500 per call.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId, staleHours, limit } = req.body ?? {};
  const cap = typeof limit === 'number' && limit > 0 ? Math.min(limit, 500) : 500;

  try {
    const db = await getDb();
    const collection = db.collection('salesLeads');

    let filter: Record<string, unknown> = {};
    if (leadId && typeof leadId === 'string') {
      try { filter = { _id: new ObjectId(leadId) }; } catch { filter = { id: leadId }; }
    } else if (typeof staleHours === 'number' && staleHours > 0) {
      const cutoff = new Date(Date.now() - staleHours * 60 * 60 * 1000).toISOString();
      filter = { $or: [{ scoreUpdatedAt: { $lt: cutoff } }, { scoreUpdatedAt: { $exists: false } }] };
    }

    const docs = await collection.find(filter).limit(cap).toArray();

    let updated = 0;
    for (const doc of docs) {
      const { score, breakdown } = computeScore({
        sourceCategory: (doc.sourceCategory as SourceCategory | null) ?? null,
        emailType: (doc.emailType as EmailType | null) ?? 'unknown',
        normalizedPhone: (doc.normalizedPhone as string | null) ?? null,
        amount: typeof doc.amount === 'number' ? doc.amount : Number(doc.amount) || 0,
        isExistingCustomer: Boolean(doc.isExistingCustomer),
        disqualifiedReason: (doc.disqualifiedReason as string | null) ?? null,
      });
      if (doc.score !== score) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { score, scoreBreakdown: breakdown, scoreUpdatedAt: new Date().toISOString() } },
        );
        updated++;
      }
    }

    return res.status(200).json({ success: true, scanned: docs.length, updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to recompute scores.';
    return res.status(500).json({ error: message });
  }
}
