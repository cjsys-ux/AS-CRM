import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    orderName,
    client,
    status,
    priority,
    quantity,
    completed,
    startDate,
    dueDate,
    assignedTo,
    quality,
  } = req.body ?? {};

  if (!orderName) {
    return res.status(400).json({ error: 'orderName is required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      orderName: orderName as string,
      client: client ?? '',
      status: status ?? 'Pending',
      priority: priority ?? 'Medium',
      quantity: typeof quantity === 'number' ? quantity : 0,
      completed: typeof completed === 'number' ? completed : 0,
      startDate: startDate ?? new Date().toISOString().split('T')[0],
      dueDate: dueDate ?? null,
      assignedTo: assignedTo ?? '',
      quality: typeof quality === 'number' ? quality : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('productionOrders').insertOne(doc);

    return res.status(201).json({
      success: true,
      order: {
        id: result.insertedId.toString(),
        ...doc,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create production order.';
    return res.status(500).json({ error: message });
  }
}
