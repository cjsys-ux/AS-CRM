import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { checklists } = req.body ?? {};

  if (!checklists || typeof checklists !== 'object') {
    return res.status(400).json({ error: 'checklists object is required.' });
  }

  try {
    const db = await getDb();
    await db.collection('pipeline_settings').updateOne(
      { key: 'checklists' },
      { $set: { key: 'checklists', checklists, updatedAt: new Date() } },
      { upsert: true }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save pipeline settings.';
    return res.status(500).json({ error: message });
  }
}
