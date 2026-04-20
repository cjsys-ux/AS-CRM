import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

// Returns the set of products linked to this vendor through the pipeline.
// The `pipeline_vendors` collection stores a row per product-vendor link;
// this aggregates by productId and enriches with spec info where available.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const vendorId = req.query.vendorId;
  if (typeof vendorId !== 'string' || !vendorId) {
    return res.status(400).json({ error: 'vendorId query parameter is required.' });
  }

  try {
    const db = await getDb();

    const links = await db
      .collection('pipeline_vendors')
      .find({ globalVendorId: vendorId })
      .sort({ createdAt: -1 })
      .toArray();

    const productIds = Array.from(new Set(links.map((l: any) => l.productId).filter(Boolean)));
    const specs = productIds.length
      ? await db.collection('pipeline_specs').find({ productId: { $in: productIds } }).toArray()
      : [];
    const specsByProductId: Record<string, any> = {};
    for (const s of specs) specsByProductId[(s as any).productId] = s;

    // Deduplicate links by productId, keeping the most recent.
    const byProductId: Record<string, any> = {};
    for (const link of links) {
      const pid = (link as any).productId;
      if (!pid) continue;
      if (!byProductId[pid]) byProductId[pid] = link;
    }

    const products = Object.entries(byProductId).map(([productId, link]: [string, any]) => {
      const spec = specsByProductId[productId] ?? {};
      return {
        id: productId,
        productId,
        name: spec.productName ?? spec.name ?? link.vendorName ?? 'Unnamed product',
        sku: spec.sku ?? null,
        category: spec.category ?? null,
        subcategory: spec.subcategory ?? null,
        vendor: link.vendorName ?? null,
        status: spec.status ?? link.status ?? null,
        basePrice: typeof spec.basePrice === 'number' ? spec.basePrice : null,
        image: spec.image ?? spec.thumbnail ?? null,
        description: spec.description ?? null,
      };
    });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vendor products.';
    return res.status(500).json({ error: message });
  }
}
