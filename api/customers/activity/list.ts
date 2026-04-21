import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

// Assembles a customer activity feed from (1) any rows persisted on the
// dedicated `customer_activity` collection, (2) notes, and (3) invoices.
// Returns the merged list sorted newest-first.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const customerId = req.query.customerId;
  if (typeof customerId !== 'string' || !customerId) {
    return res.status(400).json({ error: 'customerId query parameter is required.' });
  }

  try {
    const db = await getDb();

    const [logged, notes, invoices] = await Promise.all([
      db.collection('customer_activity').find({ customerId }).sort({ createdAt: -1 }).limit(50).toArray(),
      db.collection('customer_notes').find({ customerId }).sort({ createdAt: -1 }).limit(25).toArray(),
      db.collection('customer_invoices').find({ customerId }).sort({ createdAt: -1 }).limit(25).toArray(),
    ]);

    type Activity = { id: string; customerId: string; type: string; description: string; amount: number | null; createdAt: string };

    const items: Activity[] = [
      ...logged.map((a: any) => ({
        id: a._id.toString(),
        customerId: a.customerId,
        type: a.type ?? 'Activity',
        description: a.description ?? '',
        amount: typeof a.amount === 'number' ? a.amount : null,
        createdAt: a.createdAt ?? new Date().toISOString(),
      })),
      ...notes.map((n: any) => ({
        id: `note-${n._id.toString()}`,
        customerId: n.customerId,
        type: 'Note',
        description: n.text ?? '',
        amount: null,
        createdAt: n.createdAt ?? new Date().toISOString(),
      })),
      ...invoices.map((inv: any) => ({
        id: `inv-${inv._id.toString()}`,
        customerId: inv.customerId,
        type: 'Invoice',
        description: `Invoice ${inv.invoiceNumber ?? ''} — ${inv.status ?? 'Open'}`,
        amount: typeof inv.amount === 'number' ? inv.amount : null,
        createdAt: inv.createdAt ?? new Date().toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({ success: true, activities: items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activity.';
    return res.status(500).json({ error: message });
  }
}
