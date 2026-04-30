import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  const incoming = (body && typeof body === 'object' && body.goals && typeof body.goals === 'object')
    ? body.goals
    : body;

  const monthlyRevenueGoal = Number(incoming?.monthlyRevenueGoal);
  if (!Number.isFinite(monthlyRevenueGoal) || monthlyRevenueGoal < 0) {
    return res.status(400).json({ error: 'monthlyRevenueGoal must be a non-negative number.' });
  }

  const value = { monthlyRevenueGoal };
  const now = new Date();
  try {
    const db = await getDb();
    await db.collection('settings').updateOne(
      { key: 'company-goals' },
      { $set: { key: 'company-goals', value, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    return res.status(200).json({ success: true, goals: value });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save company goals.';
    return res.status(500).json({ error: message });
  }
}
