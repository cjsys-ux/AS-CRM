import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const filter: Record<string, unknown> = {};
  if (typeof req.query.warehouseId === 'string' && req.query.warehouseId) filter.warehouseId = req.query.warehouseId;
  if (typeof req.query.customerId === 'string' && req.query.customerId) filter.customerId = req.query.customerId;
  try {
    const db = await getDb();
    const items = await db.collection('inventory').find(filter).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({
      success: true,
      items: items.map((i) => ({ ...i, id: i._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch inventory.';
    return res.status(500).json({ error: message });
  }
}
