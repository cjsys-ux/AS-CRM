import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const orders = await db
      .collection('productionOrders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      orders: orders.map((o) => ({
        ...o,
        id: o._id.toString(),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch production orders.';
    return res.status(500).json({ error: message });
  }
}
