import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, tabId } = req.query;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required.' });
  }

  try {
    const db = await getDb();
    const query: Record<string, unknown> = { productId };
    if (tabId) query.tabId = tabId;

    const docs = await db.collection('pipeline_checklists').find(query).toArray();

    // Return as { tabId: [{ id, label, completed }] }
    const result: Record<string, { id: string; label: string; completed: boolean }[]> = {};
    for (const doc of docs) {
      if (doc.tabId && doc.items) {
        result[doc.tabId] = doc.items;
      }
    }

    return res.status(200).json({ success: true, checklists: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get checklist.';
    return res.status(500).json({ error: message });
  }
}
