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

    // Generate a project ID and number matching the existing collection format
    const timestamp = Date.now();
    const projectId = `project-${timestamp}`;

    // Derive a short numeric suffix for ADP-XXXXX (last 5 digits of timestamp)
    const existingCount = await db.collection('projects').countDocuments();
    const projectNumber = `ADP-${String(existingCount + 1).padStart(5, '0')}`;

    // Map form field names to the MongoDB field names used by the collection
    const doc = {
      id: projectId,
      projectNumber,
      title: name,
      client: client ?? null,
      vendor: vendor ?? null,
      description: description ?? null,
      status: status ?? 'New Product',
      itemType: type ?? null,
      yearlyQty: typeof yearlyQty === 'number' ? yearlyQty : null,
      pricePerUnit: pricePerUnit != null ? String(pricePerUnit) : null,
      totalValue: typeof totalValue === 'number' ? totalValue : null,
      priority: (priority ?? 'Medium').toLowerCase(),
      dueDate: deployment ?? null,
      assignedManager: projectManager ?? null,
      internalSKU: internalSKU ?? null,
      targetMargin: targetMargin ?? null,
      imageKey: imageKey ?? null,
      competitorName: competitorName ?? null,
      competitorLink: competitorLink ?? null,
      competitorPrice: competitorPrice ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('projects').insertOne(doc);

    return res.status(201).json({
      project: {
        ...doc,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create project.';
    return res.status(500).json({ error: message });
  }
}
