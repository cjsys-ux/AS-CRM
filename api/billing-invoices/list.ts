import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const invoices = await db
      .collection('billing_invoices')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json({
      success: true,
      invoices: invoices.map((inv) => ({ ...inv, id: inv._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch billing invoices.';
    return res.status(500).json({ error: message });
  }
}
