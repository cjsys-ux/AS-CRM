import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId, text, author } = req.body ?? {};

  if (!customerId || !text) {
    return res.status(400).json({ error: 'customerId and text are required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      customerId,
      text,
      author: author ?? 'User',
      createdAt: new Date(),
    };

    const result = await db.collection('customer_notes').insertOne(doc);

    return res.status(201).json({
      note: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create note.';
    return res.status(500).json({ error: message });
  }
}
