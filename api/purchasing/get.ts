import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const order = await db.collection('purchaseOrders').findOne(filter);

    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found.' });
    }

    return res.status(200).json({
      purchaseOrder: {
        ...order,
        id: order._id.toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch purchase order.';
    return res.status(500).json({ error: message });
  }
}
