import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, poId, vendorId } = req.query;
  const filter: Record<string, unknown> = {};
  if (typeof orderId === 'string' && orderId) filter.orderId = orderId;
  if (typeof poId === 'string' && poId) filter.poId = poId;
  if (typeof vendorId === 'string' && vendorId) filter.vendorId = vendorId;

  try {
    const db = await getDb();
    const receipts = await db
      .collection('receiving')
      .find(filter)
      .sort({ receivedAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      receiving: receipts.map((r) => ({ ...r, id: r._id.toString() })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch receiving records.';
    return res.status(500).json({ error: message });
  }
}
