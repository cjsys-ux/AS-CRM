import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    productId,
    productName,
    clientName,
    sampleType,
    variants,
    vendor,
    destinations,
    additionalNotes,
    inHandsDate,
    competitorLink,
    totalCost,
  } = req.body ?? {};

  if (!productId) {
    return res.status(400).json({ error: 'productId is required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      productId,
      productName: productName ?? '',
      clientName: clientName ?? '',
      sampleType: sampleType ?? 'competitor',
      variants: variants ?? [],
      vendor: vendor ?? '',
      destinations: destinations ?? [],
      additionalNotes: additionalNotes ?? '',
      inHandsDate: inHandsDate ?? null,
      competitorLink: competitorLink ?? '',
      totalCost: typeof totalCost === 'number' ? totalCost : 0,
      status: 'Pending',
      createdAt: new Date(),
    };

    const result = await db.collection('pipeline_sample_orders').insertOne(doc);

    // Log timeline event
    await db.collection('pipeline_timeline').insertOne({
      productId,
      type: 'milestone',
      title: 'Sample Order Placed',
      description: `Sample order placed with ${vendor ?? 'vendor'} (${sampleType})`,
      user: 'System',
      timestamp: new Date().toISOString(),
      icon: 'package',
      color: 'purple',
      createdAt: new Date(),
    });

    return res.status(201).json({
      order: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create sample order.';
    return res.status(500).json({ error: message });
  }
}
