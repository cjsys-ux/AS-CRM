import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { purchaseOrderId, noteId } = req.body ?? {};

  if (!purchaseOrderId || !noteId) {
    return res.status(400).json({ error: 'purchaseOrderId and noteId are required.' });
  }

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
        $pull: { notes: { id: noteId } } as any,
        $set: { updatedAt: new Date() },
      });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Purchase order not found.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete note.';
    return res.status(500).json({ error: message });
  }
}
