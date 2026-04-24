import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  // Accept either the generator's field names (name, position, barcode) or
  // the legacy { label, bin } shape. `warehouseId` is still mandatory — it
  // anchors the location to a warehouse record.
  const name: string | undefined = body.name ?? body.label;
  if (!body.warehouseId || !name) {
    return res.status(400).json({ error: 'warehouseId and name (or label) are required.' });
  }

  const now = new Date();
  const doc = {
    warehouseId: body.warehouseId,
    name,
    label: name,
    barcode: body.barcode ?? null,
    type: body.type ?? 'bin',
    status: body.status ?? 'Active',
    zone: body.zone ?? null,
    zoneId: body.zoneId ?? null,
    aisle: body.aisle ?? null,
    rack: body.rack ?? null,
    shelf: body.shelf ?? null,
    bin: body.bin ?? body.position ?? null,
    position: body.position ?? body.bin ?? null,
    capacity: typeof body.capacity === 'number' ? body.capacity : null,
    occupied: typeof body.occupied === 'number' ? body.occupied : 0,
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
