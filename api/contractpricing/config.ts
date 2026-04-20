import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = await getDb();

  if (req.method === 'GET') {
    const vendorId = req.query.vendorId;
    if (typeof vendorId !== 'string' || !vendorId) {
      return res.status(400).json({ error: 'vendorId query parameter is required.' });
    }
    try {
      const doc = await db.collection('contractPricingConfig').findOne({ vendorId });
      return res.status(200).json({
        success: true,
        enabledTypes: (doc as any)?.enabledTypes ?? [],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch config.';
      return res.status(500).json({ error: message });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { vendorId, enabledTypes } = req.body ?? {};
    if (!vendorId) {
      return res.status(400).json({ error: 'vendorId is required.' });
    }
    const now = new Date().toISOString();
    try {
      await db.collection('contractPricingConfig').updateOne(
        { vendorId },
        { $set: { vendorId, enabledTypes: enabledTypes ?? [], updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
      return res.status(200).json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save config.';
      return res.status(500).json({ error: message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
