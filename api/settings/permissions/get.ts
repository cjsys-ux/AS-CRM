import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ key: 'permissions' });
    return res.status(200).json({
      success: true,
      permissions: (doc && doc.permissions) || {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get permissions.';
    return res.status(500).json({ error: message });
  }
}
