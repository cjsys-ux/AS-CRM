import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contactId = req.query.contactId;
  if (typeof contactId !== 'string' || !contactId) {
    return res.status(400).json({ error: 'contactId query parameter is required.' });
  }

  try {
    const db = await getDb();
    const documents = await db
      .collection('contact_documents')
      .find({ contactId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      documents: documents.map((d) => ({ ...d, id: d._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch documents.';
    return res.status(500).json({ error: message });
  }
}
