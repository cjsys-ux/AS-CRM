import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

// Returns invoices associated with the given vendor. The schema allows either
// `vendorId` or `vendor` (name) on the invoice document.
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
    const invoices = await db
      .collection('invoices')
      .find({ vendorId })
      .sort({ date: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      invoices: invoices.map((inv) => ({ ...inv, id: inv._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vendor invoices.';
    return res.status(500).json({ error: message });
  }
}
