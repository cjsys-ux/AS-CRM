import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';
import { getPublicS3Url } from '../_s3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const customer = await db.collection('customers').findOne(filter);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    return res.status(200).json({
      customer: {
        ...customer,
        id: customer._id.toString(),
        logo: customer.logoKey ? getPublicS3Url(customer.logoKey) : (customer.logo ?? null),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch customer.';
    return res.status(500).json({ error: message });
  }
}
