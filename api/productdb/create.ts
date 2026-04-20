import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  if (!body.name) {
    return res.status(400).json({ error: 'name is required.' });
  }

  const now = new Date();
  const doc = {
    name: body.name,
    sku: body.sku ?? null,
    category: body.category ?? null,
    subcategory: body.subcategory ?? null,
    description: body.description ?? '',
    status: body.status ?? 'Active',
    price: body.price ?? null,
    basePrice: typeof body.basePrice === 'number' ? body.basePrice : null,
    cost: body.cost ?? null,
    currency: body.currency ?? 'USD',
    vendor: body.vendor ?? null,
    vendorId: body.vendorId ?? null,
    decorationMethods: Array.isArray(body.decorationMethods) ? body.decorationMethods : [],
    imageUrl: body.imageUrl ?? null,
    imageKey: body.imageKey ?? null,
    images: Array.isArray(body.images) ? body.images : [],
    sizes: Array.isArray(body.sizes) ? body.sizes : [],
    colors: Array.isArray(body.colors) ? body.colors : [],
    variants: Array.isArray(body.variants) ? body.variants : [],
    specifications: body.specifications ?? {},
    tags: Array.isArray(body.tags) ? body.tags : [],
    notes: body.notes ?? '',
    weight: body.weight ?? null,
    dimensions: body.dimensions ?? null,
    material: body.material ?? null,
    minOrderQty: typeof body.minOrderQty === 'number' ? body.minOrderQty : null,
    leadTime: body.leadTime ?? null,
    countryOfOrigin: body.countryOfOrigin ?? null,
    customerIds: Array.isArray(body.customerIds) ? body.customerIds : [],
    createdBy: body.createdBy ?? null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('productdb').insertOne(doc);
    return res.status(201).json({
      success: true,
      product: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create product.';
    return res.status(500).json({ error: message });
  }
}
