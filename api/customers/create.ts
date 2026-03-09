import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    logo,
    industry,
    size,
    status,
    phone,
    website,
    paymentTerms,
    resaleCert,
    logoKey,
    certKey,
    spend,
  } = req.body ?? {};

  if (!name) {
    return res.status(400).json({ error: 'name is required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      name,
      logo: logo ?? null,
      industry: industry ?? null,
      size: size ?? null,
      status: status ?? 'Active',
      phone: phone ?? null,
      website: website ?? null,
      paymentTerms: paymentTerms ?? null,
      resaleCert: resaleCert ?? false,
      logoKey: logoKey ?? null,
      certKey: certKey ?? null,
      spend: typeof spend === 'number' ? spend : 0,
      createdAt: new Date(),
    };

    const result = await db.collection('customers').insertOne(doc);

    return res.status(201).json({
      customer: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create customer.';
    return res.status(500).json({ error: message });
  }
}
