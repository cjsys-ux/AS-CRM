import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';
import { runPipeline, type RawLeadInput } from './_pipeline';

/**
 * Authenticated create — UI calls this. Runs through the same pipeline as
 * the public capture endpoint so that manual creates also pick up enrichment
 * and dedup. Behavior diverges from capture.ts:
 *  - Honors caller-provided owner / ownerInitials / probability / stage.
 *  - Surfaces dedup matches as a 409 with the existing lead id, instead of
 *    silently merging.
 *  - Validates closed-lost requires disqualifiedReason.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body ?? {}) as RawLeadInput;

  if (!body.title) {
    return res.status(400).json({ error: 'title is required.' });
  }
  if (body.stage === 'closed-lost' && !body.disqualifiedReason) {
    return res.status(400).json({ error: 'disqualifiedReason is required when stage is closed-lost.' });
  }

  try {
    const db = await getDb();
    const { doc, exactEmailMatch } = await runPipeline(db, body);

    if (exactEmailMatch) {
      return res.status(409).json({
        error: 'A lead already exists with this email address.',
        duplicateLeadId: exactEmailMatch.leadId,
        duplicate: exactEmailMatch.preview,
      });
    }

    const result = await db.collection('salesLeads').insertOne(doc);
    return res.status(201).json({
      success: true,
      lead: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error: any) {
    if (error?.code === 11000 && error?.keyPattern?.normalizedEmail) {
      const db = await getDb();
      const existing = await db
        .collection('salesLeads')
        .findOne(
          { normalizedEmail: (error?.keyValue?.normalizedEmail as string) ?? null },
          { projection: { title: 1, company: 1, contactName: 1 } },
        );
      return res.status(409).json({
        error: 'A lead already exists with this email address.',
        duplicateLeadId: existing ? existing._id.toString() : null,
        duplicate: existing ?? null,
      });
    }
    const message = error instanceof Error ? error.message : 'Failed to create sales lead.';
    return res.status(500).json({ error: message });
  }
}
