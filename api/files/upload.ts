import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Bucket, getS3Client } from '../_s3';

export const config = {
  maxDuration: 30,
};

const MAX_BASE64_SIZE = 6_000_000; // ~4.5 MB decoded

function normalizePart(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileName, fileType, entityType, entityId, fileData } = req.body ?? {};

  if (!fileName || !fileType || !fileData) {
    return res.status(400).json({ error: 'fileName, fileType, and fileData are required.' });
  }

  if (typeof fileData === 'string' && fileData.length > MAX_BASE64_SIZE) {
    return res.status(413).json({ error: 'File is too large. Maximum size is ~4.5 MB.' });
  }

  try {
    const bucket = getS3Bucket();
    const s3 = getS3Client();

    const safeFileName = normalizePart(fileName as string);

    let key: string;
    if ((entityType as string) === 'profile' && entityId) {
      const safeId = normalizePart(entityId as string);
      const ext = safeFileName.includes('.') ? safeFileName.split('.').pop()! : 'jpg';
      key = `profile-images/${safeId}/profile.${ext}`;
    } else {
      const scope = normalizePart(entityType || 'general');
      const scopeId = normalizePart(entityId || 'unscoped');
      key = `uploads/${scope}/${scopeId}/${Date.now()}-${safeFileName}`;
    }

    const buffer = Buffer.from(fileData as string, 'base64');

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: fileType as string,
      }),
    );

    return res.status(200).json({
      key,
      fileUrl: `/api/files/image?key=${encodeURIComponent(key)}&t=${Date.now()}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.';
    return res.status(500).json({ error: message });
  }
}
