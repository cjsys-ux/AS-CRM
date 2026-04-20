import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

// Records an email-sent log entry against a contact. Actual message
// transport is handled elsewhere; this endpoint just persists the row.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contactId, subject, body, from, to, status, sentAt } = req.body ?? {};
  if (!contactId) {
    return res.status(400).json({ error: 'contactId is required.' });
  }

  const now = new Date().toISOString();
  const doc = {
    contactId,
    subject: subject ?? '',
    body: body ?? '',
    from: from ?? null,
    to: to ?? null,
    status: status ?? 'Sent',
    sentAt: sentAt ?? now,
    createdAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('contact_emails').insertOne(doc);
    return res.status(201).json({
      success: true,
      email: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create email.';
    return res.status(500).json({ error: message });
  }
}
