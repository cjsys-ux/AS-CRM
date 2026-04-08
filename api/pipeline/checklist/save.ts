import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, tabId, items } = req.body ?? {};

  if (!productId || !tabId || !Array.isArray(items)) {
    return res.status(400).json({ error: 'productId, tabId, and items are required.' });
  }

  try {
    const db = await getDb();
    await db.collection('pipeline_checklists').updateOne(
      { productId, tabId },
      { $set: { productId, tabId, items, updatedAt: new Date() } },
      { upsert: true }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save checklist.';
    return res.status(500).json({ error: message });
  }
}
