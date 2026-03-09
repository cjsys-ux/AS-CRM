import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { purchaseOrderId, text, user } = req.body ?? {};

  if (!purchaseOrderId || !text) {
    return res.status(400).json({ error: 'purchaseOrderId and text are required.' });
  }

  const note = {
    id: new ObjectId().toString(),
    text: text as string,
    user: (user as string) ?? 'User',
    date: new Date().toISOString(),
  };

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(purchaseOrderId as string) };
  } catch {
    filter = { id: purchaseOrderId as string };
  }

  try {
    const db = await getDb();
    const result = await db
      .collection('purchaseOrders')
      .updateOne(filter, {
        $push: { notes: note } as any,
        $set: { updatedAt: new Date() },
      });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Purchase order not found.' });
    }

    return res.status(201).json({ note });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add note.';
    return res.status(500).json({ error: message });
  }
}
