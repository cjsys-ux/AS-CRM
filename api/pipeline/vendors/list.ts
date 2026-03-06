import type { VercelRequest, VercelResponse } from '@vercel/node';
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
    const vendors = await db
      .collection('pipeline_vendors')
      .find({ productId })
      .sort({ priority: 1, createdAt: 1 })
      .toArray();

    return res.status(200).json({
      vendors: vendors.map((v) => ({ ...v, id: v._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vendors.';
    return res.status(500).json({ error: message });
  }
}
