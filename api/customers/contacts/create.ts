import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId, firstName, lastName, email, phone, role } = req.body ?? {};

  if (!customerId || !firstName) {
    return res.status(400).json({ error: 'customerId and firstName are required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      customerId,
      firstName,
      lastName: lastName ?? '',
      email: email ?? null,
      phone: phone ?? null,
      role: role ?? null,
      createdAt: new Date(),
    };

    const result = await db.collection('customer_contacts').insertOne(doc);

    return res.status(201).json({
      contact: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create contact.';
    return res.status(500).json({ error: message });
  }
}
