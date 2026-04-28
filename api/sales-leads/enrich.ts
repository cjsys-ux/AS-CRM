import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';
import { enrich } from './_enrichment';
import { computeScore, type SourceCategory } from './_scoring';

/**
 * Re-runs enrichment + scoring for a single lead. Idempotent.
 * POST `{ leadId }`.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId } = req.body ?? {};
  if (!leadId || typeof leadId !== 'string') {
    return res.status(400).json({ error: 'leadId is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(leadId) };
  } catch {
    filter = { id: leadId };
  }

  try {
    const db = await getDb();
    const doc = await db.collection('salesLeads').findOne(filter);
    if (!doc) return res.status(404).json({ error: 'Sales lead not found.' });

    const enrichment = await enrich(db, {
      email: (doc.contactEmail as string) ?? null,
      company: (doc.company as string) ?? null,
    });

    const { score, breakdown } = computeScore({
      sourceCategory: (doc.sourceCategory as SourceCategory | null) ?? null,
      emailType: enrichment.emailType,
      normalizedPhone: (doc.normalizedPhone as string | null) ?? null,
      amount: typeof doc.amount === 'number' ? doc.amount : Number(doc.amount) || 0,
      isExistingCustomer: enrichment.isExistingCustomer,
      disqualifiedReason: (doc.disqualifiedReason as string | null) ?? null,
    });

    await db.collection('salesLeads').updateOne(filter, {
      $set: {
        emailDomain: enrichment.emailDomain,
        emailType: enrichment.emailType,
        enrichedCompany: enrichment.enrichedCompany,
        enrichmentRunAt: enrichment.enrichmentRunAt,
        enrichmentVersion: enrichment.enrichmentVersion,
        isExistingCustomer: enrichment.isExistingCustomer,
        ...(enrichment.matchedCustomerId && !doc.companyId
          ? { companyId: enrichment.matchedCustomerId }
          : {}),
        ...(enrichment.matchedContactId && !doc.contactId
          ? { contactId: enrichment.matchedContactId }
          : {}),
        score,
        scoreBreakdown: breakdown,
        scoreUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    return res.status(200).json({
      success: true,
      enrichment: { ...enrichment, score, scoreBreakdown: breakdown },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to enrich lead.';
    return res.status(500).json({ error: message });
  }
}
