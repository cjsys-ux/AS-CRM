import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Bucket, getS3Client } from '../_s3';

const SIGNED_URL_EXPIRY = 3600; // 1 hour

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key } = req.query;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'key query parameter is required.' });
  }

  try {
    const s3 = getS3Client();
    const bucket = getS3Bucket();

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: SIGNED_URL_EXPIRY });

    res.setHeader('Cache-Control', 'private, max-age=3500');
    return res.redirect(302, signedUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate image URL.';
    return res.status(500).json({ error: message });
  }
}
