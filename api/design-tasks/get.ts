import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query.id;
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ error: 'id query parameter is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id) };
  } catch {
    filter = { id };
  }

  try {
    const db = await getDb();
    const task = await db.collection('design_tasks').findOne(filter);
    if (!task) {
      return res.status(404).json({ error: 'Design task not found.' });
    }
    return res.status(200).json({
      success: true,
      task: { ...task, id: task._id.toString() },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch design task.';
    return res.status(500).json({ error: message });
  }
}
