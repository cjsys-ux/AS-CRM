import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

const ALLOWED_FIELDS = [
  'priority', 'type', 'client', 'clientLogo', 'contact', 'contactEmail',
  'contactPhone', 'desc', 'fullDesc', 'owner', 'ownerInitials', 'age',
  'status', 'category', 'lastActivity', 'created', 'slaRemaining',
  'relatedOrder', 'orderValue', 'product', 'vendor', 'orderDate',
  'promisedDate', 'tracking', 'impact', 'resolution', 'resolutionStatus',
  'rootCause', 'financialImpact', 'amazonInfo', 'timeline', 'attachments',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body ?? {};
  const doc: Record<string, unknown> = { createdAt: new Date(), updatedAt: new Date() };
  for (const key of ALLOWED_FIELDS) {
    if (key in body && body[key] !== undefined) doc[key] = body[key];
  }
  try {
    const db = await getDb();
    const result = await db.collection('tickets').insertOne(doc);
    return res.status(201).json({
      success: true,
      ticket: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create ticket.';
    return res.status(500).json({ error: message });
  }
}
