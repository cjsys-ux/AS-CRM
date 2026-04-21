import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

// Default settings returned when nothing has been saved yet.
const DEFAULTS = {
  decorationMethods: ['Embroidery', 'Screen Print', 'DTG', 'DTF', 'Heat Transfer', 'Sublimation', 'Laser Engraving', 'Debossing', 'Embossing', 'Vinyl', 'Pad Print'],
  categories: ['Apparel', 'Drinkware', 'Bags', 'Accessories', 'Tech', 'Office', 'Other'],
  statuses: ['Active', 'Inactive', 'Draft', 'Discontinued'],
  currencies: ['USD', 'EUR', 'GBP', 'CNY', 'CAD'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ key: 'product-database' });
    const settings = (doc as any)?.value ?? DEFAULTS;
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings.';
    return res.status(500).json({ error: message });
  }
}
