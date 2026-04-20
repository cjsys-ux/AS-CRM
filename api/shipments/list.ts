import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, poId, vendorId, customerId } = req.query;

  const filter: Record<string, unknown> = {};
  if (typeof orderId === 'string' && orderId) filter.orderId = orderId;
  if (typeof poId === 'string' && poId) filter.poId = poId;
  if (typeof vendorId === 'string' && vendorId) filter.vendorId = vendorId;
  if (typeof customerId === 'string' && customerId) filter.customerId = customerId;

  try {
    const db = await getDb();
    const shipments = await db
      .collection('shipments')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      shipments: shipments.map((s) => ({ ...s, id: s._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch shipments.';
    return res.status(500).json({ error: message });
  }
}
