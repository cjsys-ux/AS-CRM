import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const year = new Date().getFullYear();
    const counterId = `samplePo:${year}`;

    const doc = await db.collection<{ _id: string; seq: number }>('counters').findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );

    const seq = typeof doc?.seq === 'number' ? doc.seq : 1;
    const poNumber = `SMPL-${year}-${String(seq).padStart(4, '0')}`;

    return res.status(200).json({ poNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate sample PO number.';
    return res.status(500).json({ error: message });
  }
}
