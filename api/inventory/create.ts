import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  if (!body.name && !body.sku) {
    return res.status(400).json({ error: 'name or sku is required.' });
  }
  const now = new Date();
  const doc = {
    name: body.name ?? '',
    sku: body.sku ?? null,
    category: body.category ?? null,
    subcategory: body.subcategory ?? null,
    description: body.description ?? '',
    status: body.status ?? 'Active',
    vendor: body.vendor ?? null,
    vendorId: body.vendorId ?? null,
    customer: body.customer ?? null,
    customerId: body.customerId ?? null,
    warehouseId: body.warehouseId ?? null,
    locationId: body.locationId ?? null,
    locationLabel: body.locationLabel ?? null,
    quantity: typeof body.quantity === 'number' ? body.quantity : 0,
    onHand: typeof body.onHand === 'number' ? body.onHand : (typeof body.quantity === 'number' ? body.quantity : 0),
    reserved: typeof body.reserved === 'number' ? body.reserved : 0,
    onOrder: typeof body.onOrder === 'number' ? body.onOrder : 0,
    reorderPoint: typeof body.reorderPoint === 'number' ? body.reorderPoint : null,
    reorderQty: typeof body.reorderQty === 'number' ? body.reorderQty : null,
    unitCost: typeof body.unitCost === 'number' ? body.unitCost : null,
    unitPrice: typeof body.unitPrice === 'number' ? body.unitPrice : null,
    currency: body.currency ?? 'USD',
    uom: body.uom ?? 'EA',
    imageUrl: body.imageUrl ?? null,
    imageKey: body.imageKey ?? null,
    weight: body.weight ?? null,
    dimensions: body.dimensions ?? null,
    sizes: Array.isArray(body.sizes) ? body.sizes : [],
    colors: Array.isArray(body.colors) ? body.colors : [],
    variants: Array.isArray(body.variants) ? body.variants : [],
    serialNumbers: Array.isArray(body.serialNumbers) ? body.serialNumbers : [],
    lotNumber: body.lotNumber ?? null,
    expirationDate: body.expirationDate ?? null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    notes: body.notes ?? '',
    createdAt: now,
    updatedAt: now,
  };
  try {
    const db = await getDb();
    const result = await db.collection('inventory').insertOne(doc);
    return res.status(201).json({
      success: true,
      item: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create inventory item.';
    return res.status(500).json({ error: message });
  }
}
