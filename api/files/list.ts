import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { entityType, entityTypes, entityId } = req.query;

  try {
    const db = await getDb();
    const collection = db.collection('uploads');

    const filter: Record<string, unknown> = {};
    if (typeof entityTypes === 'string' && entityTypes.length > 0) {
      const list = entityTypes.split(',').map((s) => s.trim()).filter(Boolean);
      if (list.length > 0) filter.entityType = { $in: list };
    } else if (entityType) {
      filter.entityType = entityType;
    }
    if (entityId) filter.entityId = entityId;

    const uploads = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(250)
      .toArray();

    return res.status(200).json({
      uploads: uploads.map((item) => ({
        ...item,
        id: (item._id as ObjectId).toString(),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load uploads.';
    return res.status(500).json({ error: message });
  }
}
