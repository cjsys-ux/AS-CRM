import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    title,
    company,
    companyId,
    contactName,
    contactFirstName,
    contactLastName,
    contactEmail,
    contactPhone,
    contactId,
    amount,
    stage,
    source,
    productType,
    inHandsDate,
    owner,
    ownerInitials,
    notes,
    probability,
    quantity,
    tags,
    documents,
  } = req.body ?? {};

  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  const now = new Date().toISOString();
  const doc = {
    title,
    company: company ?? '',
    companyId: companyId ?? null,
    contactName: contactName ?? '',
    contactFirstName: contactFirstName ?? '',
    contactLastName: contactLastName ?? '',
    contactEmail: contactEmail ?? '',
    contactPhone: contactPhone ?? '',
    contactId: contactId ?? null,
    amount: typeof amount === 'number' ? amount : Number(amount) || 0,
    stage: stage ?? 'lead-received',
    source: source ?? 'Website',
    productType: productType ?? 'Apparel',
    inHandsDate: inHandsDate ?? '',
    owner: owner ?? '',
    ownerInitials: ownerInitials ?? '',
    notes: notes ?? '',
    probability: typeof probability === 'number' ? probability : Number(probability) || 10,
    quantity: typeof quantity === 'number' ? quantity : Number(quantity) || 0,
    tags: Array.isArray(tags) ? tags : [],
    documents: Array.isArray(documents) ? documents : [],
    createdAt: now,
    lastActivity: now,
    updatedAt: now,
  };

  try {
    const db = await getDb();
    const result = await db.collection('salesLeads').insertOne(doc);
    return res.status(201).json({
      success: true,
      lead: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create sales lead.';
    return res.status(500).json({ error: message });
  }
}
