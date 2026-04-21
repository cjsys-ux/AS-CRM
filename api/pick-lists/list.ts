import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const lists = await db.collection('pick_lists').find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({
      success: true,
      pickLists: lists.map((p) => ({ ...p, id: p._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pick lists.';
    return res.status(500).json({ error: message });
  }
}
