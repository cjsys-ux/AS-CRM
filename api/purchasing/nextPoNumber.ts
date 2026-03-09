import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const year = new Date().getFullYear();
    const prefix = `PO-${year}-`;

    const existing = await db
      .collection('purchaseOrders')
      .find({ poNumber: { $regex: `^PO-${year}-\\d+$` } })
      .toArray();

    const nums = existing
      .map((o) => parseInt(o.poNumber.replace(prefix, ''), 10))
      .filter((n) => !isNaN(n));

    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;

    return res.status(200).json({ poNumber: `${prefix}${String(next).padStart(3, '0')}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate PO number.';
    return res.status(500).json({ error: message });
  }
}
