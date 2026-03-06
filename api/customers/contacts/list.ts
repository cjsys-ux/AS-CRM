import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: 'customerId is required.' });
  }

  try {
    const db = await getDb();
    const contacts = await db.collection('customer_contacts')
      .find({ customerId: customerId as string })
      .sort({ createdAt: 1 })
      .toArray();

    return res.status(200).json({
      contacts: contacts.map((c) => ({ ...c, id: c._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contacts.';
    return res.status(500).json({ error: message });
  }
}
