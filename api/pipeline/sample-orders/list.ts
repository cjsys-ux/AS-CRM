import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required.' });
  }

  try {
    const db = await getDb();

    const [legacy, samplePOs] = await Promise.all([
      db
        .collection('pipeline_sample_orders')
        .find({ productId })
        .toArray(),
      db
        .collection('purchaseOrders')
        .find({ productId, isSample: true })
        .toArray(),
    ]);

    const legacyRows = legacy.map((o) => ({
      ...o,
      id: (o._id as ObjectId).toString(),
    }));

    const poRows = samplePOs.map((po) => ({
      id: (po._id as ObjectId).toString(),
      poNumber: po.poNumber,
      poDate: po.poDate,
      productId: po.productId,
      projectNumber: po.projectNumber ?? null,
      productName: po.project ?? null,
      project: po.project ?? null,
      clientName: po.customer ?? null,
      customer: po.customer ?? null,
      vendor: po.vendor ?? null,
      status: po.status ?? 'Created',
      sampleType: po.sampleType ?? null,
      variants: Array.isArray(po.variants) ? po.variants : [],
      destinations: Array.isArray(po.destinations) ? po.destinations : [],
      shipToAddresses: Array.isArray(po.shipToAddresses) ? po.shipToAddresses : [],
      contacts: Array.isArray(po.contacts) ? po.contacts : [],
      additionalNotes: po.additionalNotes ?? '',
      total: typeof po.total === 'number' ? po.total : 0,
      totalCost: typeof po.total === 'number' ? po.total : 0,
      inHandsDate: po.inHandsDate ?? null,
      createdAt: po.createdAt ?? null,
      isSample: true,
    }));

    const orders = [...legacyRows, ...poRows].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return res.status(200).json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sample orders.';
    return res.status(500).json({ error: message });
  }
}
