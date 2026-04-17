import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';
import { logTimelineEvent } from '../../_timeline';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const vendor = await db.collection('pipeline_vendors').findOne(filter);
    const result = await db.collection('pipeline_vendors').deleteOne(filter);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    if (vendor?.productId) {
      await logTimelineEvent(db, {
        productId: vendor.productId,
        type: 'milestone',
        title: 'Vendor unlinked',
        description: vendor.vendorName ?? 'Vendor removed from product',
        icon: 'alert',
        color: 'red',
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete vendor.';
    return res.status(500).json({ error: message });
  }
}
