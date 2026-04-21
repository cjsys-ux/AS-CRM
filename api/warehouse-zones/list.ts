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
    const zones = await db.collection('warehouse_zones').find(filter).sort({ name: 1 }).toArray();
    return res.status(200).json({
      success: true,
      zones: zones.map((z) => ({ ...z, id: z._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch zones.';
    return res.status(500).json({ error: message });
  }
}
