import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, category, fileName } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  const updates: Record<string, unknown> = {};
  if (typeof category === 'string') {
    updates.category = category.trim().length > 0 ? category.trim() : null;
  }
  if (typeof fileName === 'string' && fileName.trim().length > 0) {
    updates.fileName = fileName.trim();
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No supported fields to update.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('uploads');
    const result = await collection.findOneAndUpdate(
      filter,
      { $set: updates },
      { returnDocument: 'after' },
    );

    const doc = (result as unknown as { value?: Record<string, unknown> | null })?.value
      ?? (result as unknown as Record<string, unknown> | null);

    if (!doc) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const raw = doc as Record<string, unknown>;
    return res.status(200).json({
      upload: {
        ...raw,
        id: raw._id ? (raw._id as ObjectId).toString() : (raw.id as string | undefined),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update file.';
    return res.status(500).json({ error: message });
  }
}
