import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';

const ALLOWED_FIELDS = [
  'title', 'company', 'companyId', 'contactName', 'contactFirstName', 'contactLastName',
  'contactEmail', 'contactPhone', 'contactId', 'amount', 'stage', 'source', 'productType',
  'inHandsDate', 'owner', 'ownerInitials', 'notes', 'probability', 'quantity', 'tags',
  'documents', 'lastActivity',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, ...fields } = req.body ?? {};
  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  const setPayload: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const key of ALLOWED_FIELDS) {
    if (key in fields && fields[key] !== undefined) {
      setPayload[key] = fields[key];
    }
  }
  // When the stage moves, also bump lastActivity so cards re-sort.
  if ('stage' in fields) {
    setPayload.lastActivity = new Date().toISOString();
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const result = await db.collection('salesLeads').updateOne(filter, { $set: setPayload });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Sales lead not found.' });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update sales lead.';
    return res.status(500).json({ error: message });
  }
}
