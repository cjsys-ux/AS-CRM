import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { permissions } = req.body ?? {};
  if (!permissions || typeof permissions !== 'object') {
    return res.status(400).json({ error: 'permissions object is required.' });
  }
  try {
    const db = await getDb();
    await db.collection('settings').updateOne(
      { key: 'permissions' },
      { $set: { key: 'permissions', permissions, updatedAt: new Date() } },
      { upsert: true },
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save permissions.';
    return res.status(500).json({ error: message });
  }
}
