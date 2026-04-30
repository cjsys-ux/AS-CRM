import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId, firstName, lastName, email, phone, role, isPrimary } = req.body ?? {};
  if (!leadId || typeof leadId !== 'string') {
    return res.status(400).json({ error: 'leadId is required.' });
  }
  if (!firstName && !lastName) {
    return res.status(400).json({ error: 'firstName or lastName is required.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('lead_contacts');

    // First contact on the lead is automatically primary. If caller passed
    // isPrimary: true, demote any existing primary on this lead first.
    const existingCount = await collection.countDocuments({ leadId });
    const shouldBePrimary = existingCount === 0 || isPrimary === true;

    if (shouldBePrimary && existingCount > 0) {
      await collection.updateMany({ leadId, isPrimary: true }, { $set: { isPrimary: false, updatedAt: new Date() } });
    }

    const now = new Date();
    const doc = {
      leadId,
      firstName: typeof firstName === 'string' ? firstName.trim() : '',
      lastName: typeof lastName === 'string' ? lastName.trim() : '',
      email: typeof email === 'string' ? email.trim() : '',
      phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
      role: typeof role === 'string' && role.trim() ? role.trim() : null,
      isPrimary: shouldBePrimary,
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(doc);
    const id = result.insertedId.toString();

    // Soft-fail activity log
    try {
      const display = [doc.firstName, doc.lastName].filter(Boolean).join(' ').trim() || doc.email || 'Contact';
      await db.collection('lead_activities').insertOne({
        leadId,
        type: 'contact-added',
        content: `Added contact ${display}${doc.role ? ` (${doc.role})` : ''}`,
        details: doc.email ? `${doc.email}${doc.phone ? ' · ' + doc.phone : ''}` : undefined,
        user: 'You',
        userInitials: 'YO',
        timestamp: now.toISOString(),
        createdAt: now,
      });
    } catch { /* non-fatal */ }

    return res.status(201).json({ success: true, contact: { id, ...doc } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create contact.';
    return res.status(500).json({ error: message });
  }
}
