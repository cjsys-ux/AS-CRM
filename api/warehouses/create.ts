import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  if (!body.name) {
    return res.status(400).json({ error: 'name is required.' });
  }
  const now = new Date();
  const doc = {
    name: body.name,
    code: body.code ?? null,
    address: body.address ?? '',
    address2: body.address2 ?? '',
    city: body.city ?? '',
    state: body.state ?? '',
    zip: body.zip ?? '',
    country: body.country ?? 'US',
    timezone: body.timezone ?? null,
    manager: body.manager ?? '',
    phone: body.phone ?? '',
    email: body.email ?? '',
    status: body.status ?? 'Active',
    capacity: typeof body.capacity === 'number' ? body.capacity : null,
    notes: body.notes ?? '',
    createdAt: now,
    updatedAt: now,
  };
  try {
    const db = await getDb();
    const result = await db.collection('warehouses').insertOne(doc);
    return res.status(201).json({
      success: true,
      warehouse: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create warehouse.';
    return res.status(500).json({ error: message });
  }
}
