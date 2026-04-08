import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const warehouses = await db.collection('warehouses').find({}).sort({ name: 1 }).toArray();
    return res.status(200).json({
      success: true,
      warehouses: warehouses.map((w) => ({
        id: w._id.toString(),
        name: w.name ?? '',
        address: w.address ?? '',
        city: w.city ?? '',
        state: w.state ?? '',
        zip: w.zip ?? '',
        country: w.country ?? 'US',
        manager: w.manager ?? '',
        phone: w.phone ?? '',
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch warehouses.';
    return res.status(500).json({ error: message });
  }
}
