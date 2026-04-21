import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

const DEFAULTS = [
  { id: 'default-small', label: 'Small Box', length: 12, width: 9, height: 4, weight: 0.5, unit: 'in', weightUnit: 'lbs' },
  { id: 'default-medium', label: 'Medium Box', length: 16, width: 12, height: 8, weight: 1, unit: 'in', weightUnit: 'lbs' },
  { id: 'default-large', label: 'Large Box', length: 24, width: 18, height: 12, weight: 2, unit: 'in', weightUnit: 'lbs' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ key: 'box-presets' });
    const presets = Array.isArray((doc as any)?.value) ? (doc as any).value : DEFAULTS;
    return res.status(200).json({ success: true, presets });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch box presets.';
    return res.status(500).json({ error: message });
  }
}
