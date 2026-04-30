import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

const DEFAULTS = {
  monthlyRevenueGoal: 0,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ key: 'company-goals' });
    const stored = (doc as any)?.value && typeof (doc as any).value === 'object'
      ? (doc as any).value
      : {};
    const goals = {
      monthlyRevenueGoal: typeof stored.monthlyRevenueGoal === 'number' && stored.monthlyRevenueGoal >= 0
        ? stored.monthlyRevenueGoal
        : DEFAULTS.monthlyRevenueGoal,
    };
    return res.status(200).json({ success: true, goals });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch company goals.';
    return res.status(500).json({ error: message });
  }
}
