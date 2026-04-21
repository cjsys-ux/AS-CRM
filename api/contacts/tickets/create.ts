import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contactId, subject, description, priority, status, assignedTo } = req.body ?? {};
  if (!contactId || !subject) {
    return res.status(400).json({ error: 'contactId and subject are required.' });
  }

  const now = new Date().toISOString();
  const doc = {
    contactId,
    subject,
    description: description ?? '',
    priority: priority ?? 'Medium',
    status: status ?? 'Open',
    assignedTo: assignedTo ?? null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('contact_tickets').insertOne(doc);
    return res.status(201).json({
      success: true,
      ticket: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create ticket.';
    return res.status(500).json({ error: message });
  }
}
