import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  if (!body.warehouseId || !body.label) {
    return res.status(400).json({ error: 'warehouseId and label are required.' });
  }
  const now = new Date();
  const doc = {
    warehouseId: body.warehouseId,
    zoneId: body.zoneId ?? null,
    label: body.label,
    type: body.type ?? 'Bin',
    aisle: body.aisle ?? null,
    rack: body.rack ?? null,
    shelf: body.shelf ?? null,
    bin: body.bin ?? null,
    capacity: typeof body.capacity === 'number' ? body.capacity : null,
    notes: body.notes ?? '',
    createdAt: now,
    updatedAt: now,
  };
  try {
    const db = await getDb();
    const result = await db.collection('warehouse_locations').insertOne(doc);
    return res.status(201).json({
      success: true,
      location: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create location.';
    return res.status(500).json({ error: message });
  }
}
