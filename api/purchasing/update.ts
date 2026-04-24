import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

const ALLOWED_FIELDS = [
  'poDate',
  'project',
  'vendor',
  'customer',
  'status',
  'shipDate',
  'inHandsDate',
  'total',
  'priority',
  'contact',
  'contactDetails',
  'isSample',
  'shippingMethod',
  'carrierAccount',
  'isBlindShip',
  'shipToAddress',
  'lineItems',
  'customLineItems',
  'salesTaxRate',
  'taxStatus',
  'artworkDetails',
  'timelineEvents',
  'notes',
  'trackingNumber',
  'carrier',
];

// Fields that should mirror from a PO update onto any linked order so a user
// who edits the PO (ship date, tracking, carrier) doesn't have to re-enter the
// same values on the order side.
const MIRROR_TO_ORDER: Array<keyof typeof FIELD_MAP> = [
  'shipDate',
  'trackingNumber',
  'carrier',
  'inHandsDate',
];
// Null proxy so TS narrows; the actual map is identity-keyed.
const FIELD_MAP = {
  shipDate: 'shipDate',
  trackingNumber: 'trackingNumber',
  carrier: 'carrier',
  inHandsDate: 'inHandsDate',
} as const;

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
    const result = await db
      .collection('purchaseOrders')
      .updateOne(filter, { $set: setPayload });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Purchase order not found.' });
    }

    // Mirror ship/tracking/in-hands changes onto any linked order(s) so the
    // Orders table + detail view reflect the latest PO shipping info.
    const mirrorPayload: Record<string, unknown> = {};
    for (const key of MIRROR_TO_ORDER) {
      if (key in setPayload) mirrorPayload[FIELD_MAP[key]] = setPayload[key];
    }
    if (Object.keys(mirrorPayload).length > 0) {
      const poIdStr = typeof id === 'string' ? id : String(id);
      try {
        await db.collection('orders').updateMany(
          { $or: [{ sourcePOId: poIdStr }, { sourcePONumber: (setPayload.poNumber as string) ?? undefined }] },
          { $set: { ...mirrorPayload, updatedAt: new Date() } },
        );
      } catch (err) {
        console.error('Failed to mirror PO fields to linked order(s):', err);
        // Non-blocking — the PO update itself succeeded.
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update purchase order.';
    return res.status(500).json({ error: message });
  }
}
