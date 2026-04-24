import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const filter: Record<string, unknown> = {};
  if (typeof req.query.warehouseId === 'string' && req.query.warehouseId) {
    filter.warehouseId = req.query.warehouseId;
  }
  try {
    const db = await getDb();
    const locations = await db.collection('warehouse_locations').find(filter).sort({ name: 1, label: 1 }).toArray();
    return res.status(200).json({
      success: true,
      locations: locations.map((l) => ({ ...l, id: l._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch locations.';
    return res.status(500).json({ error: message });
  }
}
