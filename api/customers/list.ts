import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';
import { getPublicS3Url } from '../_s3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const customers = await db.collection('customers').find({}).sort({ name: 1 }).toArray();

    return res.status(200).json({
      success: true,
      customers: customers.map((c) => ({
        ...c,
        id: c._id.toString(),
        logo: c.logoKey ? getPublicS3Url(c.logoKey) : (c.logo ?? null),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch customers.';
    return res.status(500).json({ error: message });
  }
}
