import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';
import { getReadUrl } from '../_s3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const customers = await db.collection('customers').find({}).sort({ name: 1 }).toArray();

    const enriched = await Promise.all(
      customers.map(async (c) => ({
        ...c,
        id: c._id.toString(),
        logo: c.logoKey ? (await getReadUrl(c.logoKey)) : (c.logo ?? null),
      })),
    );

    return res.status(200).json({
      success: true,
      customers: enriched,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch customers.';
    return res.status(500).json({ error: message });
  }
}
