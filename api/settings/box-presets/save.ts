import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  const value = Array.isArray(body.presets) ? body.presets : body;
  const now = new Date();
  try {
    const db = await getDb();
    await db.collection('settings').updateOne(
      { key: 'box-presets' },
      { $set: { key: 'box-presets', value, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save box presets.';
    return res.status(500).json({ error: message });
  }
}
