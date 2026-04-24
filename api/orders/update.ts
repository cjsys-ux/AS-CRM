import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import type { Db } from 'mongodb';
import { getDb } from '../_mongodb';
import { nextReceiptNumber } from '../receiving/create';

const ALLOWED_FIELDS = [
  'customer', 'customerId', 'email', 'status', 'paymentStatus',
  'items', 'total', 'shipping', 'date', 'notes',
  'projectName', 'eventType', 'stage', 'inHandsDate', 'terms', 'currency',
  'taxRate', 'defaultMargin', 'customerPO', 'isSampleOrder',
  'introduction', 'billingContact', 'billingAddress',
  'shippingContact', 'shippingAddress', 'subtotal', 'taxAmount',
  'totalMargin', 'lineItems', 'orderDate', 'sourcePONumber', 'sourcePOId',
  'project', 'shipDate', 'vendor', 'shipToAddresses', 'contacts', 'documents',
  'trackingNumber', 'carrier',
];

// Matches reference behaviour at
// `Use as reference/src/supabase/functions/server/index.tsx:2481-2551`:
// when an order flips to Shipped, create a corresponding receiving row
// so the Warehouse module can intake it. Idempotent via the
// sourceOrderId + sourceOrderType filter.
async function ensureReceivingForShippedOrder(db: Db, order: Record<string, any>): Promise<void> {
  const sourceOrderId = String(order._id ?? order.id ?? '');
  if (!sourceOrderId) return;

  const sourceOrderType = order.isSampleOrder ? 'sample-order' : 'order';
  const existing = await db
    .collection('receiving')
    .findOne({ sourceOrderId, sourceOrderType });
  if (existing) return;

  const lineItems = Array.isArray(order.lineItems) ? order.lineItems : [];
  const items = lineItems.map((li: any) => ({
    sku: li.sku || '',
    name: li.description || li.name || li.sku || 'Item',
    expectedQty: typeof li.quantity === 'number' ? li.quantity : (typeof li.qty === 'number' ? li.qty : 1),
    receivedQty: 0,
    location: '',
    imageUrl: li.imageUrl || (li.imageKey ? `/api/files/image?key=${encodeURIComponent(li.imageKey)}` : ''),
  }));

  const now = new Date();
  const receiptNumber = await nextReceiptNumber(db);
  await db.collection('receiving').insertOne({
    receiptNumber,
    orderId: sourceOrderId,
    poId: order.sourcePOId ?? null,
    poNumber: order.sourcePONumber ?? order.orderNumber ?? null,
    vendor: order.vendor ?? order.customer ?? '',
    vendorId: order.vendorId ?? null,
    status: 'In Transit',
    condition: 'Good',
    expectedDate: order.inHandsDate || order.shipDate || null,
    items,
    lineItems: items,
    carrier: order.carrier ?? order.shipping ?? '',
    carrierType: null,
    trackingNumber: order.trackingNumber ?? '',
    notes: `Auto-created from ${sourceOrderType} ${order.orderNumber ?? sourceOrderId} — status changed to Shipped`,
    sourceOrderId,
    sourceOrderType,
    customerName: order.customer ?? '',
    projectName: order.projectName ?? order.project ?? '',
    projectNumber: order.projectNumber ?? '',
    isSample: order.isSampleOrder === true,
    receivedAt: null,
    receivedBy: null,
    createdAt: now,
    updatedAt: now,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, ...fields } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  const setPayload: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of ALLOWED_FIELDS) {
    if (key in fields && fields[key] !== undefined) {
      setPayload[key] = fields[key];
    }
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const previous = await db.collection('orders').findOne(filter);
    const result = await db
      .collection('orders')
      .updateOne(filter, { $set: setPayload });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Only act on a transition TO Shipped — avoid duplicate receiving rows
    // when the status is re-saved unchanged.
    const newStatus = typeof setPayload.status === 'string' ? setPayload.status : null;
    if (newStatus === 'Shipped' && previous && previous.status !== 'Shipped') {
      const merged = { ...previous, ...setPayload };
      try {
        await ensureReceivingForShippedOrder(db, merged);
      } catch (err) {
        console.error('Failed to auto-create receiving row for shipped order:', err);
        // Non-blocking — the order update itself succeeded.
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order.';
    return res.status(500).json({ error: message });
  }
}
