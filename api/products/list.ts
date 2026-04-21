import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

// Returns a flat product catalog. We don't yet have a dedicated products
// collection — surface the pipeline spec rows, one per product, so the
// order/drawer product pickers have something to match against.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();

    const [catalog, specs] = await Promise.all([
      db.collection('products').find({}).sort({ name: 1 }).toArray(),
      db.collection('pipeline_specs').find({}).sort({ productName: 1 }).toArray(),
    ]);

    const mapped = [
      ...catalog.map((p: any) => ({ ...p, id: p._id.toString() })),
      ...specs.map((s: any) => ({
        id: s.productId ?? s._id.toString(),
        name: s.productName ?? s.name ?? 'Unnamed Product',
        sku: s.sku ?? null,
        category: s.category ?? null,
        subcategory: s.subcategory ?? null,
        basePrice: typeof s.basePrice === 'number' ? s.basePrice : null,
        image: s.image ?? s.thumbnail ?? null,
        description: s.description ?? '',
        source: 'pipeline',
      })),
    ];

    // De-duplicate by id (products collection wins over pipeline_specs).
    const byId = new Map<string, any>();
    for (const item of mapped) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }

    return res.status(200).json({
      success: true,
      products: Array.from(byId.values()),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products.';
    return res.status(500).json({ error: message });
  }
}
