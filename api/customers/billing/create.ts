import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId, invoiceNumber, amount, dueDate, description, status } = req.body ?? {};
  if (!customerId) {
    return res.status(400).json({ error: 'customerId is required.' });
  }
  if (!invoiceNumber) {
    return res.status(400).json({ error: 'invoiceNumber is required.' });
  }

  const now = new Date().toISOString();
  const doc = {
    customerId,
    invoiceNumber,
    amount: typeof amount === 'number' ? amount : Number(amount) || 0,
    dueDate: dueDate ?? null,
    description: description ?? '',
    status: status ?? 'Open',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('customer_invoices').insertOne(doc);
    return res.status(201).json({
      success: true,
      invoice: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create invoice.';
    return res.status(500).json({ error: message });
  }
}
