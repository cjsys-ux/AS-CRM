import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId, type, limit } = req.query;
  if (!leadId || typeof leadId !== 'string') {
    return res.status(400).json({ error: 'leadId query parameter is required.' });
  }

  const filter: Record<string, unknown> = { leadId };
  if (typeof type === 'string' && type.trim() !== '' && type !== 'all') {
    filter.type = type;
  }

  const cap = typeof limit === 'string' && limit.trim() !== '' ? Math.min(Number(limit) || 200, 500) : 200;

  try {
    const db = await getDb();
    const rows = await db
      .collection('lead_activities')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(cap)
      .toArray();

    return res.status(200).json({
      success: true,
      activities: rows.map((r) => ({ ...r, id: r._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list activities.';
    return res.status(500).json({ error: message });
  }
}
