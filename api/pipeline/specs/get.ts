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
    const spec = await db.collection('pipeline_specs').findOne({ productId });

    return res.status(200).json({ spec: spec ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch specifications.';
    return res.status(500).json({ error: message });
  }
}
