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

  // Build filter: try ObjectId first (24-char hex), fall back to the custom
  // string `id` field used by documents like { id: "project-1769539090876" }.
  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id) };
  } catch {
    filter = { id };
  }

  try {
    const db = await getDb();
    const result = await db.collection('projects').deleteOne(filter);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete project.';
    return res.status(500).json({ error: message });
  }
}
