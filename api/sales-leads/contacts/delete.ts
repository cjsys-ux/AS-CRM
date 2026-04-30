import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body ?? {};
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id is required.' });
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id) };
  } catch {
    return res.status(400).json({ error: 'Invalid contact id.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('lead_contacts');

    const target = await collection.findOne(filter);
    if (!target) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    const total = await collection.countDocuments({ leadId: target.leadId });
    if (total <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only contact. Add another contact first.' });
    }

    await collection.deleteOne(filter);

    // If the deleted one was primary, promote the oldest remaining contact.
    if (target.isPrimary) {
      const next = await collection.findOne({ leadId: target.leadId }, { sort: { createdAt: 1 } });
      if (next) {
        await collection.updateOne({ _id: next._id }, { $set: { isPrimary: true, updatedAt: new Date() } });
      }
    }

    // Soft-fail activity log
    try {
      const display = [target.firstName, target.lastName].filter(Boolean).join(' ').trim() || target.email || 'Contact';
      await db.collection('lead_activities').insertOne({
        leadId: target.leadId,
        type: 'contact-removed',
        content: `Removed contact ${display}`,
        user: 'You',
        userInitials: 'YO',
        timestamp: new Date().toISOString(),
        createdAt: new Date(),
      });
    } catch { /* non-fatal */ }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete contact.';
    return res.status(500).json({ error: message });
  }
}
