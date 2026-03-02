import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';
import { getPublicS3Url } from '../_s3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, fileName, fileType, size, entityType, entityId, uploadedBy } = req.body ?? {};

  if (!key || !fileName) {
    return res.status(400).json({ error: 'key and fileName are required.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('uploads');

    const doc = {
      key,
      fileName,
      fileType: fileType ?? null,
      size: typeof size === 'number' ? size : null,
      entityType: entityType ?? 'general',
      entityId: entityId ?? null,
      uploadedBy: uploadedBy ?? null,
      fileUrl: getPublicS3Url(key),
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return res.status(201).json({
      upload: {
        id: result.insertedId,
        ...doc,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to persist upload metadata.';
    return res.status(500).json({ error: message });
  }
}
