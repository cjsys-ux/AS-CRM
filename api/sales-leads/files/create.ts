import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

/**
 * Register a file already uploaded to S3 (via /api/files/presign + the S3 PUT).
 * The frontend uploads, then calls this with the resulting key + metadata.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId, name, key, type, size, uploadedBy } = req.body ?? {};
  if (!leadId || typeof leadId !== 'string') {
    return res.status(400).json({ error: 'leadId is required.' });
  }
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required.' });
  }
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'key is required.' });
  }

  try {
    const db = await getDb();
    const now = new Date();
    const doc = {
      leadId,
      name,
      key,
      type: typeof type === 'string' ? type : 'application/octet-stream',
      size: typeof size === 'number' ? size : 0,
      uploadedBy: typeof uploadedBy === 'string' && uploadedBy ? uploadedBy : 'You',
      uploadedAt: now,
    };
    const result = await db.collection('lead_files').insertOne(doc);
    const id = result.insertedId.toString();

    // Soft-fail activity log
    try {
      const sizeKB = doc.size > 0 ? `${(doc.size / 1024).toFixed(1)} KB` : null;
      await db.collection('lead_activities').insertOne({
        leadId,
        type: 'file-upload',
        content: `Uploaded ${name}`,
        details: sizeKB ? `${sizeKB}${doc.type ? ' · ' + doc.type : ''}` : (doc.type || undefined),
        user: doc.uploadedBy,
        userInitials: doc.uploadedBy.slice(0, 2).toUpperCase(),
        timestamp: now.toISOString(),
        createdAt: now,
      });
    } catch { /* non-fatal */ }

    return res.status(201).json({ success: true, file: { id, ...doc } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to register file.';
    return res.status(500).json({ error: message });
  }
}
