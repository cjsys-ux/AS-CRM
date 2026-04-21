import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  if (!body.orderId && !body.poId) {
    return res.status(400).json({ error: 'orderId or poId is required.' });
  }

  const now = new Date();
  const doc = {
    orderId: body.orderId ?? null,
    poId: body.poId ?? null,
    vendorId: body.vendorId ?? null,
    receivedAt: body.receivedAt ?? now.toISOString(),
    receivedBy: body.receivedBy ?? null,
    status: body.status ?? 'Received',
    condition: body.condition ?? 'Good',
    lineItems: Array.isArray(body.lineItems) ? body.lineItems : [],
    notes: body.notes ?? '',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('receiving').insertOne(doc);
    return res.status(201).json({
      success: true,
      record: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create receiving record.';
    return res.status(500).json({ error: message });
  }
}
