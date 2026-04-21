import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  if (!body.warehouseId || !body.name) {
    return res.status(400).json({ error: 'warehouseId and name are required.' });
  }
  const now = new Date();
  const doc = {
    warehouseId: body.warehouseId,
    name: body.name,
    type: body.type ?? 'General',
    color: body.color ?? null,
    notes: body.notes ?? '',
    createdAt: now,
    updatedAt: now,
  };
  try {
    const db = await getDb();
    const result = await db.collection('warehouse_zones').insertOne(doc);
    return res.status(201).json({ success: true, zone: { id: result.insertedId.toString(), ...doc } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create zone.';
    return res.status(500).json({ error: message });
  }
}
