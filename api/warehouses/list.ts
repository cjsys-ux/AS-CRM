import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

// Default HQ warehouse — seeded on first list call so the Order Sample
// drawer (and the Warehouses settings tab) always have it available as a
// ship-to option. Matched by `code` so a user renaming it won't cause
// us to reinsert a duplicate.
const DEFAULT_MIAMI_WAREHOUSE = {
  name: 'Miami Warehouse',
  code: 'MIA-HQ',
  address: '2726 NW 72nd Ave',
  address2: '',
  city: 'Miami',
  state: 'FL',
  zip: '33122',
  country: 'US',
  timezone: null,
  manager: '',
  phone: '',
  email: '',
  status: 'Active',
  capacity: null,
  notes: '',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();

    const now = new Date();
    await db.collection('warehouses').updateOne(
      { code: DEFAULT_MIAMI_WAREHOUSE.code },
      {
        $setOnInsert: {
          ...DEFAULT_MIAMI_WAREHOUSE,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    const warehouses = await db.collection('warehouses').find({}).sort({ name: 1 }).toArray();
    return res.status(200).json({
      success: true,
      warehouses: warehouses.map((w) => ({ ...w, id: w._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch warehouses.';
    return res.status(500).json({ error: message });
  }
}
