import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

const ALLOWED_FIELDS = [
  'image', 'activateSwagInvoice', 'orderDate', 'deliveryDate', 'productName',
  'productId', 'amazonPO', 'hasSizeVariants', 'orderType', 'sizes', 'totalQty',
  'amazonPPU', 'amazonProductRevenue', 'amazonShippingRevenue', 'totalAmazonRevenue',
  'productCostPPU', 'totalProductCost', 'shippingCost', 'totalCost',
  'totalProfit', 'gpMargin', 'ipfProfit', 'activateProfit',
  'activateSwagPPU', 'activateSwagRevenue', 'activateProductRev', 'activateShippingRev',
  'payoutDate', 'amazonPaid',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  const doc: Record<string, unknown> = { createdAt: new Date(), updatedAt: new Date() };
  for (const key of ALLOWED_FIELDS) {
    if (key in body && body[key] !== undefined) doc[key] = body[key];
  }
  try {
    const db = await getDb();
    const result = await db.collection('amazon_orders').insertOne(doc);
    return res.status(201).json({
      success: true,
      order: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create Amazon order.';
    return res.status(500).json({ error: message });
  }
}
