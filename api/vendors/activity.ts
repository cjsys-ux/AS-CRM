import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

// Assembles a vendor-scoped activity feed from (1) any rows persisted on the
// dedicated `vendorActivity` collection and (2) events derived from POs the
// vendor is on. Returns the combined list sorted newest-first.
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
    const logged = await db
      .collection('vendorActivity')
      .find({ vendorId })
      .sort({ date: -1 })
      .toArray();

    // Derive synthetic events from POs so users see something even if the
    // dedicated activity collection is empty.
    let vendorDoc: any = null;
    try {
      vendorDoc = await db.collection('vendors').findOne({ _id: new ObjectId(vendorId) });
    } catch {
      vendorDoc = await db.collection('vendors').findOne({ id: vendorId });
    }
    const vendorName = vendorDoc?.vendorName ?? vendorDoc?.name ?? null;

    const poFilter: any = { $or: [{ vendorId }] };
    if (vendorName) poFilter.$or.push({ vendor: vendorName });
    const pos = await db
      .collection('purchaseOrders')
      .find(poFilter)
      .project({ poNumber: 1, poDate: 1, createdAt: 1, total: 1, status: 1 })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    const synthetic = pos.map((po) => ({
      id: `po-${po._id.toString()}`,
      vendorId,
      date: po.poDate ?? (po.createdAt instanceof Date ? po.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      type: 'Purchase Order',
      description: `PO ${po.poNumber ?? ''} — ${po.status ?? 'Created'}`,
      amount: typeof po.total === 'number' ? po.total : null,
      createdAt: po.createdAt,
    }));

    const all = [
      ...logged.map((a: any) => ({ ...a, id: a._id.toString() })),
      ...synthetic,
    ].sort((a, b) => (new Date(b.createdAt || b.date).getTime()) - (new Date(a.createdAt || a.date).getTime()));

    return res.status(200).json({ success: true, activity: all });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vendor activity.';
    return res.status(500).json({ error: message });
  }
}
