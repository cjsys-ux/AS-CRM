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
    const messages = await db
      .collection('pipeline_chat')
      .find({ productId })
      .sort({ createdAt: 1 })
      .toArray();

    return res.status(200).json({
      messages: messages.map((m) => ({ ...m, id: (m._id as ObjectId).toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch messages.';
    return res.status(500).json({ error: message });
  }
}
