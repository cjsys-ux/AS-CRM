import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';

const ALLOWED_FIELDS = ['type', 'street', 'city', 'state', 'zip', 'country', 'isPrimary'];

// Updates any customer_addresses row. When `isPrimary` is being set to true,
// clears the primary flag on every other address for that customer in the
// same transaction so exactly one primary exists.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
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

    // Look up the row so we can scope the unset-others step to the same customer.
    const existing = await db.collection('customer_addresses').findOne(filter);
    if (!existing) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    if (setPayload.isPrimary === true) {
      await db.collection('customer_addresses').updateMany(
        { customerId: existing.customerId, _id: { $ne: existing._id } },
        { $set: { isPrimary: false, updatedAt: new Date() } }
      );
    }

    await db.collection('customer_addresses').updateOne(filter, { $set: setPayload });
    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update address.';
    return res.status(500).json({ error: message });
  }
}
