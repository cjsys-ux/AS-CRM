import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, ...fields } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  // Build the $set payload from only the fields that were provided
  const allowedFields = [
    'name', 'client', 'vendor', 'description', 'status', 'type',
    'yearlyQty', 'pricePerUnit', 'totalValue', 'priority', 'deployment',
    'projectManager', 'internalSKU', 'targetMargin', 'imageKey',
    'competitorName', 'competitorLink', 'competitorPrice',
    'htsCode', 'htsRate', 'htsBaseRate', 'htsSection301', 'sizeVariants',
  ];

  const setPayload: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowedFields) {
    if (key in fields && fields[key] !== undefined) {
      setPayload[key] = fields[key];
    }
  }

  if (Object.keys(setPayload).length === 1) {
    return res.status(400).json({ error: 'No valid fields provided for update.' });
  }

  // Build a filter that matches by _id (ObjectId) if the id is a valid hex string,
  // otherwise fall back to matching a custom string `id` field on the document.
  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const result = await db
      .collection('product_pipelines')
      .updateOne(filter, { $set: setPayload });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update project.';
    return res.status(500).json({ error: message });
  }
}
