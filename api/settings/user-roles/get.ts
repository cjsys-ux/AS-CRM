import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

const DEFAULT_ROLES = ['Admin', 'Editor', 'Viewer'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ key: 'user-roles' });
    const roles = (doc && Array.isArray(doc.roles) && doc.roles.length > 0) ? doc.roles : DEFAULT_ROLES;
    return res.status(200).json({ success: true, settings: { roles } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user roles.';
    return res.status(500).json({ error: message });
  }
}
