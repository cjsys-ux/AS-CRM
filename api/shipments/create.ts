import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  if (!body.trackingNumber && !body.orderId && !body.poId) {
    return res.status(400).json({ error: 'trackingNumber or orderId or poId is required.' });
  }

  const now = new Date();
  const doc = {
    trackingNumber: body.trackingNumber ?? null,
    carrier: body.carrier ?? null,
    service: body.service ?? null,
    orderId: body.orderId ?? null,
    poId: body.poId ?? null,
    vendorId: body.vendorId ?? null,
    customerId: body.customerId ?? null,
    status: body.status ?? 'Pending',
    shipDate: body.shipDate ?? null,
    estimatedDelivery: body.estimatedDelivery ?? null,
    deliveredAt: body.deliveredAt ?? null,
    fromAddress: body.fromAddress ?? null,
    toAddress: body.toAddress ?? null,
    lineItems: Array.isArray(body.lineItems) ? body.lineItems : [],
    notes: body.notes ?? '',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('shipments').insertOne(doc);
    return res.status(201).json({
      success: true,
      shipment: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create shipment.';
    return res.status(500).json({ error: message });
  }
}
