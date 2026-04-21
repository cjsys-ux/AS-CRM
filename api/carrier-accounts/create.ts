import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { label, carrier, accountNumber, nickname, notes } = req.body ?? {};
  if (!label && !carrier) {
    return res.status(400).json({ error: 'label or carrier is required.' });
  }

  const now = new Date();
  const doc = {
    label: label ?? carrier ?? '',
    carrier: carrier ?? null,
    accountNumber: accountNumber ?? null,
    nickname: nickname ?? null,
    notes: notes ?? '',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('carrier_accounts').insertOne(doc);
    return res.status(201).json({
      success: true,
      account: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create carrier account.';
    return res.status(500).json({ error: message });
  }
}
