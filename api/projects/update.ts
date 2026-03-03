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

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id as string);
  } catch {
    return res.status(400).json({ error: 'Invalid id format.' });
  }

  // Build the $set payload from only the fields that were provided
  const allowedFields = [
    'name', 'client', 'vendor', 'description', 'status', 'type',
    'yearlyQty', 'pricePerUnit', 'totalValue', 'priority', 'deployment',
    'projectManager', 'internalSKU', 'targetMargin', 'imageKey',
    'competitorName', 'competitorLink', 'competitorPrice',
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

  try {
    const db = await getDb();
    const result = await db
      .collection('projects')
      .updateOne({ _id: objectId }, { $set: setPayload });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update project.';
    return res.status(500).json({ error: message });
  }
}
