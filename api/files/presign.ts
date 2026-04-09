import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Bucket, getS3Client, getPublicS3Url } from '../_s3';

const PRESIGN_EXPIRY_SECONDS = 300;

function normalizePart(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requiredVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET'] as const;
  const missingVars = requiredVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    console.error('Presign: missing env vars:', missingVars.join(', '));
    return res.status(500).json({ error: `Missing environment variables: ${missingVars.join(', ')}` });
  }

  const { fileName, fileType, entityType, entityId } = req.body ?? {};

  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'fileName and fileType are required.' });
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

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType as string,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: PRESIGN_EXPIRY_SECONDS,
    });

    return res.status(200).json({
      uploadUrl,
      key,
      fileUrl: getPublicS3Url(key),
      expiresIn: PRESIGN_EXPIRY_SECONDS,
    });
  } catch (error) {
    console.error('Presign error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate presigned URL.';
    return res.status(500).json({ error: message });
  }
}
