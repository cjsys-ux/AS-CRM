import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId, type, street, city, state, zip, country, isPrimary } = req.body ?? {};

  if (!customerId || !street) {
    return res.status(400).json({ error: 'customerId and street are required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      customerId,
      type: type ?? 'Shipping',
      street,
      city: city ?? '',
      state: state ?? '',
      zip: zip ?? '',
      country: country ?? null,
      isPrimary: isPrimary ?? false,
      createdAt: new Date(),
    };

    const result = await db.collection('customer_addresses').insertOne(doc);

    return res.status(201).json({
      address: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create address.';
    return res.status(500).json({ error: message });
  }
}
