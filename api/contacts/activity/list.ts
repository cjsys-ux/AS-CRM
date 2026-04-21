import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

// Aggregates a contact activity feed from (1) rows on `contact_activity`,
// (2) emails sent, and (3) tickets opened. Newest-first.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contactId = req.query.contactId;
  if (typeof contactId !== 'string' || !contactId) {
    return res.status(400).json({ error: 'contactId query parameter is required.' });
  }

  try {
    const db = await getDb();
    const [logged, emails, tickets] = await Promise.all([
      db.collection('contact_activity').find({ contactId }).sort({ createdAt: -1 }).limit(50).toArray(),
      db.collection('contact_emails').find({ contactId }).sort({ sentAt: -1 }).limit(25).toArray(),
      db.collection('contact_tickets').find({ contactId }).sort({ createdAt: -1 }).limit(25).toArray(),
    ]);

    type Activity = { id: string; contactId: string; type: string; description: string; createdAt: string };
    const items: Activity[] = [
      ...logged.map((a: any) => ({
        id: a._id.toString(),
        contactId: a.contactId,
        type: a.type ?? 'Activity',
        description: a.description ?? '',
        createdAt: a.createdAt ?? new Date().toISOString(),
      })),
      ...emails.map((e: any) => ({
        id: `email-${e._id.toString()}`,
        contactId: e.contactId,
        type: 'Email',
        description: e.subject ?? '(no subject)',
        createdAt: e.sentAt ?? e.createdAt ?? new Date().toISOString(),
      })),
      ...tickets.map((t: any) => ({
        id: `ticket-${t._id.toString()}`,
        contactId: t.contactId,
        type: 'Ticket',
        description: `${t.subject ?? ''} — ${t.status ?? 'Open'}`,
        createdAt: t.createdAt ?? new Date().toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({ success: true, activities: items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activity.';
    return res.status(500).json({ error: message });
  }
}
