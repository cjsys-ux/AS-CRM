import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

// Returns the purchase orders placed with a given vendor. Matches on either
// the stored vendor display name or a vendorId field on the PO document.
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

    // Resolve the vendor so we can match POs stored by display name.
    let vendorDoc: any = null;
    try {
      vendorDoc = await db.collection('vendors').findOne({ _id: new ObjectId(vendorId) });
    } catch {
      vendorDoc = await db.collection('vendors').findOne({ id: vendorId });
    }
    const vendorName = vendorDoc?.vendorName ?? vendorDoc?.name ?? null;

    const filter: any = { $or: [{ vendorId }] };
    if (vendorName) filter.$or.push({ vendor: vendorName });

    const orders = await db
      .collection('purchaseOrders')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      purchaseOrders: orders.map((o) => ({ ...o, id: o._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vendor purchase orders.';
    return res.status(500).json({ error: message });
  }
}
