import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    email,
    phone,
    company,
    position,
    type,
    country,
    status,
    createdBy,
  } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required.' });
  }

  try {
    const db = await getDb();

    const now = new Date();
    const doc = {
      name,
      email,
      phone: phone ?? null,
      company: company ?? null,
      position: position ?? null,
      type: type ?? 'Customer',
      country: country ?? 'United States',
      status: status ?? 'Active',
      lastContact: now,
      createdBy: createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('contacts').insertOne(doc);

    return res.status(201).json({
      contact: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create contact.';
    return res.status(500).json({ error: message });
  }
}
