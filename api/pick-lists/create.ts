import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  if (!body.pickListNumber && !body.orderId && !body.shipmentId) {
    return res.status(400).json({ error: 'pickListNumber, orderId, or shipmentId is required.' });
  }
  const now = new Date();
  const doc = {
    pickListNumber: body.pickListNumber ?? null,
    orderId: body.orderId ?? null,
    orderNumber: body.orderNumber ?? null,
    shipmentId: body.shipmentId ?? null,
    customer: body.customer ?? null,
    customerId: body.customerId ?? null,
    warehouseId: body.warehouseId ?? null,
    status: body.status ?? 'Pending',
    priority: body.priority ?? 'Normal',
    assignedTo: body.assignedTo ?? null,
    items: Array.isArray(body.items) ? body.items : [],
    notes: body.notes ?? '',
    pickedAt: body.pickedAt ?? null,
    completedAt: body.completedAt ?? null,
    createdAt: now,
    updatedAt: now,
  };
  try {
    const db = await getDb();
    const result = await db.collection('pick_lists').insertOne(doc);
    return res.status(201).json({
      success: true,
      pickList: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create pick list.';
    return res.status(500).json({ error: message });
  }
}
