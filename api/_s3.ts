import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let cachedS3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (cachedS3Client) return cachedS3Client;

  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error('AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY must be configured.');
  }

  cachedS3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return cachedS3Client;
}

export function getS3Bucket(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not configured.');
  }
  return bucket;
}

export function getPublicS3Url(key: string): string {
  const customBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;
  if (customBaseUrl) {
    return `${customBaseUrl.replace(/\/$/, '')}/${key}`;
  }

  const region = process.env.AWS_REGION;
  const bucket = getS3Bucket();

  if (!region) {
    throw new Error('AWS_REGION is not configured.');
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Generate a short-lived presigned GET URL for an S3 object. Use this
 * (instead of `getPublicS3Url`) whenever the bucket may not be configured
 * for anonymous public reads — which is the safe default.
 *
 * Returns null when the key is empty so callers can chain into a fallback.
 */
export async function getReadUrl(
  key: string | null | undefined,
  ttlSeconds: number = 7 * 24 * 60 * 60,
): Promise<string | null> {
  if (!key) return null;
  try {
    const client = getS3Client();
    return await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: getS3Bucket(), Key: key }),
      { expiresIn: ttlSeconds },
    );
  } catch {
    return null;
  }
}
