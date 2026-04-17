import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vendorId, overallScore, tier, metrics, incidents, reviewDate, reviewedBy } = req.body ?? {};
  if (!vendorId) {
    return res.status(400).json({ error: 'vendorId is required.' });
  }

  const now = new Date().toISOString();
  const doc = {
    vendorId,
    overallScore: Number(overallScore) || 0,
    tier: tier ?? 'New',
    metrics: Array.isArray(metrics) ? metrics : [],
    incidents: Array.isArray(incidents) ? incidents : [],
    reviewDate: reviewDate ?? now.split('T')[0],
    reviewedBy: reviewedBy ?? '',
    updatedAt: now,
  };

  try {
    const db = await getDb();
    await db.collection('vendorScorecards').updateOne(
      { vendorId },
      { $set: doc, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
    return res.status(200).json({ success: true, scorecard: doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save scorecard.';
    return res.status(500).json({ error: message });
  }
}
