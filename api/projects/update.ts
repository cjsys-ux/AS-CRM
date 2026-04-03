import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, ...fields } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  // Map incoming form field names → MongoDB collection field names,
  // mirroring the translation done in create.ts.
  const fieldMap: Record<string, string> = {
    name: 'title',
    type: 'itemType',
    deployment: 'dueDate',
    projectManager: 'assignedManager',
  };

  // Fields that pass through with the same name
  const passthroughFields = [
    'client', 'vendor', 'description', 'status',
    'yearlyQty', 'pricePerUnit', 'totalValue', 'priority',
    'internalSKU', 'targetMargin', 'imageKey',
    'competitorName', 'competitorLink', 'competitorPrice',
    // Also accept direct MongoDB field names (e.g. from ProductDetails PATCH)
    'title', 'itemType', 'dueDate', 'assignedManager',
    'projectNumber',
  ];

  const setPayload: Record<string, unknown> = { updatedAt: new Date() };

  for (const [formKey, mongoKey] of Object.entries(fieldMap)) {
    if (formKey in fields && fields[formKey] !== undefined) {
      // Special coercions to match create.ts behaviour
      if (formKey === 'type') {
        setPayload[mongoKey] = fields[formKey];
      } else if (formKey === 'name') {
        setPayload[mongoKey] = fields[formKey];
      } else if (formKey === 'deployment') {
        setPayload[mongoKey] = fields[formKey];
      } else if (formKey === 'projectManager') {
        setPayload[mongoKey] = fields[formKey];
      } else {
        setPayload[mongoKey] = fields[formKey];
      }
    }
  }

  for (const key of passthroughFields) {
    if (key in fields && fields[key] !== undefined) {
      setPayload[key] = fields[key];
    }
  }

  if (Object.keys(setPayload).length === 1) {
    return res.status(400).json({ error: 'No valid fields provided for update.' });
  }

  // Normalize priority to lowercase if present
  if (typeof setPayload.priority === 'string') {
    setPayload.priority = setPayload.priority.toLowerCase();
  }

  // Build filter: try ObjectId first, fall back to the custom string `id` field
  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const result = await db
      .collection('projects')
      .updateOne(filter, { $set: setPayload });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update project.';
    return res.status(500).json({ error: message });
  }
}
