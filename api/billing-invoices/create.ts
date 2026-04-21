import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

const ALLOWED_FIELDS = [
  'invoiceNumber', 'customer', 'customerId', 'salesRep', 'amount', 'amountPaid',
  'issueDate', 'dueDate', 'status', 'items', 'notes',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  if (!body.invoiceNumber) {
    return res.status(400).json({ error: 'invoiceNumber is required.' });
  }
  const doc: Record<string, unknown> = { createdAt: new Date(), updatedAt: new Date() };
  for (const key of ALLOWED_FIELDS) {
    if (key in body && body[key] !== undefined) doc[key] = body[key];
  }
  try {
    const db = await getDb();
    const result = await db.collection('billing_invoices').insertOne(doc);
    return res.status(201).json({
      success: true,
      invoice: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create invoice.';
    return res.status(500).json({ error: message });
  }
}
