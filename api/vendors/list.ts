import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';
import { getPublicS3Url } from '../_s3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const vendors = await db.collection('vendors').find({}).sort({ vendorName: 1 }).toArray();

    return res.status(200).json({
      vendors: vendors.map((v) => ({
        ...v,
        id: v._id.toString(),
        logo: v.logoKey ? getPublicS3Url(v.logoKey) : null,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vendors.';
    return res.status(500).json({ error: message });
  }
}
