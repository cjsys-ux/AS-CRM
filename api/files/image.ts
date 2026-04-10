import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getS3Bucket, getS3Client } from '../_s3';

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
    const response = await s3.send(command);

    res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
    if (response.ContentLength != null) {
      res.setHeader('Content-Length', String(response.ContentLength));
    }
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const stream = response.Body;
    if (stream instanceof Readable) {
      stream.pipe(res);
    } else if (stream && typeof (stream as any).transformToByteArray === 'function') {
      // Lambda / SDK v3 may return a non-Node Readable (e.g. SdkStreamMixin)
      const bytes = await (stream as any).transformToByteArray();
      res.end(Buffer.from(bytes));
    } else {
      res.status(500).json({ error: 'Unexpected S3 response body type.' });
    }
  } catch (error: any) {
    if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ error: 'Image not found.' });
    }
    if (error?.$metadata?.httpStatusCode === 403) {
      return res.status(403).json({ error: 'Access denied to image.' });
    }
    const message = error instanceof Error ? error.message : 'Failed to load image.';
    return res.status(500).json({ error: message });
  }
}
