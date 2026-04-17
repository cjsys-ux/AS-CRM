import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';
import { logTimelineEvent } from '../../_timeline';

const ALLOWED_FIELDS = [
  'vendorName', 'logo', 'status', 'contactName', 'email', 'phone',
  'wechatId', 'vendorType', 'accountType', 'website', 'paymentTerms',
  'accountNumber', 'country', 'fobCity', 'fobState', 'productsSupplied',
  'notes', 'priority', 'moq', 'pricingTiers',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, ...fields } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  const setPayload: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of ALLOWED_FIELDS) {
    if (key in fields && fields[key] !== undefined) {
      setPayload[key] = fields[key];
    }
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const result = await db.collection('pipeline_vendors').updateOne(filter, { $set: setPayload });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    // Only log semantic edits, not sortOrder/priority-only reorders (which
    // happen on every drag-and-drop and would flood the timeline).
    const changedKeys = Object.keys(setPayload).filter((k) => k !== 'updatedAt');
    const isReorderOnly = changedKeys.length === 1 && (changedKeys[0] === 'priority' || changedKeys[0] === 'sortOrder');
    if (!isReorderOnly && changedKeys.length > 0) {
      const updated = await db.collection('pipeline_vendors').findOne(filter);
      if (updated?.productId) {
        const isPricingChange = changedKeys.includes('pricingTiers') || changedKeys.includes('moq');
        await logTimelineEvent(db, {
          productId: updated.productId,
          type: 'edit',
          title: isPricingChange ? 'Vendor pricing updated' : 'Vendor updated',
          description: updated.vendorName ?? 'Vendor details saved',
          icon: 'edit',
          color: 'indigo',
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update vendor.';
    return res.status(500).json({ error: message });
  }
}
