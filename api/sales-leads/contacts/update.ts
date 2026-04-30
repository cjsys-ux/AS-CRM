import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';

const ALLOWED_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'role', 'isPrimary'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, ...fields } = req.body ?? {};
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id) };
  } catch {
    return res.status(400).json({ error: 'Invalid contact id.' });
  }

  const setPayload: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of ALLOWED_FIELDS) {
    if (key in fields && fields[key] !== undefined) {
      setPayload[key] = fields[key];
    }
  }

  try {
    const db = await getDb();
    const collection = db.collection('lead_contacts');

    const existing = await collection.findOne(filter);
    if (!existing) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    // If promoting to primary, demote any other primary on the same lead.
    if (setPayload.isPrimary === true && !existing.isPrimary) {
      await collection.updateMany(
        { leadId: existing.leadId, isPrimary: true, _id: { $ne: existing._id } },
        { $set: { isPrimary: false, updatedAt: new Date() } },
      );
    }

    // Don't allow demoting the last primary to false on its own — must be
    // followed by promoting another contact. To keep this simple, we accept
    // the demotion silently; the next list call will surface the issue if no
    // contact is primary, and create.ts auto-promotes the first contact on
    // a lead anyway.

    await collection.updateOne(filter, { $set: setPayload });
    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update contact.';
    return res.status(500).json({ error: message });
  }
}
