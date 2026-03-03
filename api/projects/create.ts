import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    client,
    vendor,
    description,
    status,
    type,
    yearlyQty,
    pricePerUnit,
    totalValue,
    priority,
    deployment,
    projectManager,
    internalSKU,
    targetMargin,
    imageKey,
    competitorName,
    competitorLink,
    competitorPrice,
  } = req.body ?? {};

  if (!name) {
    return res.status(400).json({ error: 'name is required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      name,
      client: client ?? null,
      vendor: vendor ?? null,
      description: description ?? null,
      status: status ?? 'New Product',
      type: type ?? null,
      yearlyQty: typeof yearlyQty === 'number' ? yearlyQty : null,
      pricePerUnit: typeof pricePerUnit === 'number' ? pricePerUnit : null,
      totalValue: typeof totalValue === 'number' ? totalValue : null,
      priority: priority ?? 'Medium',
      deployment: deployment ?? null,
      projectManager: projectManager ?? null,
      internalSKU: internalSKU ?? null,
      targetMargin: targetMargin ?? null,
      imageKey: imageKey ?? null,
      competitorName: competitorName ?? null,
      competitorLink: competitorLink ?? null,
      competitorPrice: competitorPrice ?? null,
      createdAt: new Date(),
    };

    const result = await db.collection('projects').insertOne(doc);

    return res.status(201).json({
      project: {
        id: result.insertedId.toString(),
        ...doc,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create project.';
    return res.status(500).json({ error: message });
  }
}
