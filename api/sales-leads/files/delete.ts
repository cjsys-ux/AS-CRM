import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body ?? {};
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id) };
  } catch {
    return res.status(400).json({ error: 'Invalid file id.' });
  }

  try {
    const db = await getDb();
    const target = await db.collection('lead_files').findOne(filter);
    if (!target) {
      return res.status(404).json({ error: 'File not found.' });
    }

    await db.collection('lead_files').deleteOne(filter);

    // Note: we leave the S3 object in place. A bucket lifecycle policy can
    // sweep orphans cheaper than a per-delete S3 call.

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete file.';
    return res.status(500).json({ error: message });
  }
}
