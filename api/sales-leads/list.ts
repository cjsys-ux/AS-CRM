import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const filter: Record<string, unknown> = {};
  const { minScore, owner, sourceCategory } = req.query;

  if (typeof minScore === 'string' && minScore.trim() !== '') {
    const n = Number(minScore);
    if (Number.isFinite(n)) filter.score = { $gte: n };
  }
  if (typeof owner === 'string' && owner.trim() !== '') {
    filter.owner = owner;
  }
  if (typeof sourceCategory === 'string' && sourceCategory.trim() !== '') {
    filter.sourceCategory = sourceCategory;
  }

  try {
    const db = await getDb();
    const leads = await db
      .collection('salesLeads')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      leads: leads.map((l) => ({ ...l, id: l._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sales leads.';
    return res.status(500).json({ error: message });
  }
}
