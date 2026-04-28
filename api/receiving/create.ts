import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Db } from 'mongodb';
import { getDb } from '../_mongodb';

// Matches the reference scheme (Use as reference/.../server/index.tsx:2491):
// sequential RCV-NNNN starting from max existing + 1, min 1001.
export async function nextReceiptNumber(db: Db): Promise<string> {
  const rows = await db
    .collection('receiving')
    .find({}, { projection: { receiptNumber: 1 } })
    .toArray();
  let maxNum = 1000;
  for (const r of rows) {
    const rn = (r as { receiptNumber?: unknown }).receiptNumber;
    if (typeof rn !== 'string') continue;
    const match = rn.match(/RCV-(\d+)$/);
    if (!match) continue;
    const n = parseInt(match[1], 10);
    if (Number.isFinite(n) && n > maxNum) maxNum = n;
  }
  return `RCV-${String(maxNum + 1).padStart(4, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  if (!body.orderId && !body.poId) {
    return res.status(400).json({ error: 'orderId or poId is required.' });
  }

  const now = new Date();

  try {
    const db = await getDb();
    const receiptNumber = typeof body.receiptNumber === 'string' && body.receiptNumber
      ? body.receiptNumber
      : await nextReceiptNumber(db);

    const doc = {
      receiptNumber,
      orderId: body.orderId ?? null,
      poId: body.poId ?? null,
      vendorId: body.vendorId ?? null,
      receivedAt: body.receivedAt ?? now.toISOString(),
      receivedBy: body.receivedBy ?? null,
      status: body.status ?? 'Received',
      condition: body.condition ?? 'Good',
      lineItems: Array.isArray(body.lineItems) ? body.lineItems : [],
      items: Array.isArray(body.items) ? body.items : (Array.isArray(body.lineItems) ? body.lineItems : []),
      notes: body.notes ?? '',
      createdAt: now,
      updatedAt: now,
    };
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
