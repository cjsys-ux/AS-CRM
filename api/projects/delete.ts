import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query.id as string | undefined;

  if (!id) {
    return res.status(400).json({ error: 'id query parameter is required.' });
  }

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: 'Invalid id format.' });
  }

  try {
    const db = await getDb();
    const result = await db.collection('projects').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete project.';
    return res.status(500).json({ error: message });
  }
}
