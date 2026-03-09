import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${rand}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    customer,
    email,
    status,
    paymentStatus,
    items,
    total,
    shipping,
    date,
    notes,
    createdBy,
  } = req.body ?? {};

  if (!customer || !email) {
    return res.status(400).json({ error: 'customer and email are required.' });
  }

  try {
    const db = await getDb();

    const orderNumber = generateOrderNumber();

    const doc = {
      orderNumber,
      customer: customer as string,
      email: email as string,
      status: status ?? 'Pending',
      paymentStatus: paymentStatus ?? 'Pending',
      items: typeof items === 'number' ? items : 1,
      total: total ?? '$0.00',
      shipping: shipping ?? 'Standard',
      date: date ?? new Date().toISOString().split('T')[0],
      notes: notes ?? '',
      createdBy: createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(doc);

    return res.status(201).json({
      order: {
        id: result.insertedId.toString(),
        ...doc,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order.';
    return res.status(500).json({ error: message });
  }
}
