import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';
import { getReadUrl } from '../../_s3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId } = req.query;
  if (!leadId || typeof leadId !== 'string') {
    return res.status(400).json({ error: 'leadId query parameter is required.' });
  }

  try {
    const db = await getDb();
    const rows = await db
      .collection('lead_files')
      .find({ leadId })
      .sort({ uploadedAt: -1 })
      .toArray();

    const enriched = await Promise.all(
      rows.map(async (r) => ({
        ...r,
        id: r._id.toString(),
        url: r.key ? await getReadUrl(r.key as string) : null,
      })),
    );

    return res.status(200).json({ success: true, files: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list files.';
    return res.status(500).json({ error: message });
  }
}
