import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const vendorId = req.query.vendorId;
  if (typeof vendorId !== 'string' || !vendorId) {
    return res.status(400).json({ error: 'vendorId query parameter is required.' });
  }

  try {
    const db = await getDb();
    const docs = await db.collection('contractPricing').find({ vendorId }).toArray();
    const items = docs.map((d: any) => {
      const { _id, ...rest } = d;
      return { id: _id.toString(), ...rest };
    });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contract pricing.';
    return res.status(500).json({ error: message });
  }
}
