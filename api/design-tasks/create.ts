import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  if (!body.title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  const now = new Date();
  const doc = {
    title: body.title,
    description: body.description ?? '',
    customer: body.customer ?? null,
    customerId: body.customerId ?? null,
    assignedTo: body.assignedTo ?? null,
    assignedToId: body.assignedToId ?? null,
    status: body.status ?? 'To Do',
    priority: body.priority ?? 'Medium',
    dueDate: body.dueDate ?? null,
    startDate: body.startDate ?? null,
    linkedOrderId: body.linkedOrderId ?? null,
    linkedOrderNumber: body.linkedOrderNumber ?? null,
    linkedPOId: body.linkedPOId ?? null,
    linkedPONumber: body.linkedPONumber ?? null,
    productId: body.productId ?? null,
    productName: body.productName ?? null,
    productImage: body.productImage ?? null,
    sku: body.sku ?? null,
    quantity: typeof body.quantity === 'number' ? body.quantity : null,
    colors: Array.isArray(body.colors) ? body.colors : [],
    decorationMethod: body.decorationMethod ?? null,
    imprintLocations: Array.isArray(body.imprintLocations) ? body.imprintLocations : [],
    vendor: body.vendor ?? null,
    vendorId: body.vendorId ?? null,
    attachments: Array.isArray(body.attachments) ? body.attachments : [],
    revisions: Array.isArray(body.revisions) ? body.revisions : [],
    approvals: Array.isArray(body.approvals) ? body.approvals : [],
    notes: body.notes ?? '',
    tags: Array.isArray(body.tags) ? body.tags : [],
    progress: typeof body.progress === 'number' ? body.progress : 0,
    createdBy: body.createdBy ?? null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('design_tasks').insertOne(doc);
    return res.status(201).json({
      success: true,
      task: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create design task.';
    return res.status(500).json({ error: message });
  }
}
