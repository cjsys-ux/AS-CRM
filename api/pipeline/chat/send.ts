import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, message, user, attachmentKey, attachmentName, attachmentType, attachmentSize } = req.body ?? {};

  if (!productId || !message) {
    return res.status(400).json({ error: 'productId and message are required.' });
  }

  try {
    const db = await getDb();

    const now = new Date();
    const doc: Record<string, unknown> = {
      productId,
      message,
      user: user ?? 'You',
      timestamp: now.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      }),
      isCurrentUser: true,
      createdAt: now,
    };

    if (attachmentKey) {
      doc.attachment = {
        key: attachmentKey,
        name: attachmentName ?? '',
        type: attachmentType ?? '',
        size: attachmentSize ?? '',
      };
    }

    const result = await db.collection('pipeline_chat').insertOne(doc);

    return res.status(201).json({
      message: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message.';
    return res.status(500).json({ error: message });
  }
}
