import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId } = req.query;
  if (!leadId || typeof leadId !== 'string') {
    return res.status(400).json({ error: 'leadId query parameter is required.' });
  }

  try {
    const db = await getDb();
    const rows = await db
      .collection('lead_contacts')
      .find({ leadId })
      .sort({ isPrimary: -1, createdAt: 1 })
      .toArray();

    return res.status(200).json({
      success: true,
      contacts: rows.map((r) => ({ ...r, id: r._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list contacts.';
    return res.status(500).json({ error: message });
  }
}
