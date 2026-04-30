import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';
import { findDuplicates } from './_dedup';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phone, company, contactName, excludeLeadId } = req.body ?? {};

  if (!email && !phone && !company) {
    return res.status(200).json({ success: true, matches: [] });
  }

  try {
    const db = await getDb();
    const matches = await findDuplicates(
      db,
      { email, phone, company, contactName },
      typeof excludeLeadId === 'string' ? excludeLeadId : undefined,
    );
    return res.status(200).json({ success: true, matches });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check duplicates.';
    return res.status(500).json({ error: message });
  }
}
