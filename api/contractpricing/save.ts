import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    vendorId,
    decorationType,
    year,
    pricingMatrix,
    quantityBrackets,
    additionalCharges,
    personalization,
    packagingShipping,
    termsAndConditions,
    notes,
    effectiveDate,
  } = req.body ?? {};

  if (!vendorId || !decorationType || !year) {
    return res.status(400).json({ error: 'vendorId, decorationType and year are required.' });
  }

  const now = new Date().toISOString();
  const item = {
    vendorId,
    decorationType,
    year,
    pricingMatrix: pricingMatrix ?? [],
    quantityBrackets: quantityBrackets ?? [],
    additionalCharges: additionalCharges ?? [],
    personalization: personalization ?? [],
    packagingShipping: packagingShipping ?? [],
    termsAndConditions: termsAndConditions ?? '',
    notes: notes ?? '',
    effectiveDate: effectiveDate ?? '',
    updatedAt: now,
  };

  try {
    const db = await getDb();
    await db.collection('contractPricing').updateOne(
      { vendorId, decorationType, year },
      { $set: item, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
    return res.status(200).json({ success: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save contract pricing.';
    return res.status(500).json({ error: message });
  }
}
