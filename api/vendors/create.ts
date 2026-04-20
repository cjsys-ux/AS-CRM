import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    vendorName,
    logoKey,
    status,
    contactName,
    firstName,
    lastName,
    email,
    phone,
    wechatId,
    vendorType,
    accountType,
    website,
    paymentTerms,
    accountNumber,
    country,
    fobCity,
    fobState,
    productsSupplied,
    notes,
    supportsDropShipping,
    addresses,
    contacts,
    documents,
  } = req.body ?? {};

  if (!vendorName) {
    return res.status(400).json({ error: 'vendorName is required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      vendorName,
      logoKey: logoKey ?? null,
      status: status ?? 'Active',
      contactName: contactName ?? null,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      email: email ?? null,
      phone: phone ?? null,
      wechatId: wechatId ?? null,
      vendorType: vendorType ?? 'Distributor',
      accountType: accountType ?? 'Standalone',
      website: website ?? null,
      paymentTerms: paymentTerms ?? null,
      accountNumber: accountNumber ?? null,
      country: country ?? null,
      fobCity: fobCity ?? null,
      fobState: fobState ?? null,
      productsSupplied: productsSupplied ?? [],
      notes: notes ?? null,
      supportsDropShipping: supportsDropShipping ?? true,
      addresses: addresses ?? [],
      contacts: contacts ?? [],
      documents: documents ?? [],
      createdAt: new Date(),
    };

    const result = await db.collection('vendors').insertOne(doc);

    return res.status(201).json({
      vendor: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create vendor.';
    return res.status(500).json({ error: message });
  }
}
