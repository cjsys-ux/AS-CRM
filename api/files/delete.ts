import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';
import { getS3Client, getS3Bucket } from '../_s3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const upload = await db.collection('uploads').findOne(filter);

    if (!upload) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Delete from S3 if key exists
    if (upload.key) {
      try {
        const s3 = getS3Client();
        const bucket = getS3Bucket();
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: upload.key }));
      } catch {
        // Non-fatal: continue even if S3 delete fails
      }
    }

    await db.collection('uploads').deleteOne(filter);

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete file.';
    return res.status(500).json({ error: message });
  }
}
