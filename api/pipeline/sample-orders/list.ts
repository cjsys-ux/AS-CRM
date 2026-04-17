import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required.' });
  }

  try {
    const db = await getDb();
    const orders = await db
      .collection('pipeline_sample_orders')
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      orders: orders.map((o) => ({ ...o, id: (o._id as ObjectId).toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sample orders.';
    return res.status(500).json({ error: message });
  }
}
