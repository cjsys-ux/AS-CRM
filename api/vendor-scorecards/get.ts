import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const vendorId = req.query.vendorId;
  if (typeof vendorId !== 'string' || !vendorId) {
    return res.status(400).json({ error: 'vendorId query parameter is required.' });
  }

  try {
    const db = await getDb();
    const scorecard = await db.collection('vendorScorecards').findOne({ vendorId });
    if (!scorecard) {
      return res.status(200).json({ success: true, scorecard: null });
    }
    const { _id, ...rest } = scorecard as any;
    return res.status(200).json({ success: true, scorecard: rest });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch scorecard.';
    return res.status(500).json({ error: message });
  }
}
