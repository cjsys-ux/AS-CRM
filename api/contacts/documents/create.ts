import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

// Stores a document reference against a contact. The actual file bytes are
// expected to already be in S3 via /api/files/upload (or presign+complete);
// this endpoint records the metadata row.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contactId, name, type, size, fileKey, fileUrl, uploadedBy } = req.body ?? {};
  if (!contactId || !name || !fileKey) {
    return res.status(400).json({ error: 'contactId, name and fileKey are required.' });
  }

  const now = new Date();
  const doc = {
    contactId,
    name,
    type: type ?? 'Other',
    size: size ?? null,
    fileKey,
    fileUrl: fileUrl ?? null,
    uploadedBy: uploadedBy ?? null,
    createdAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('contact_documents').insertOne(doc);
    return res.status(201).json({
      success: true,
      document: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create document.';
    return res.status(500).json({ error: message });
  }
}
