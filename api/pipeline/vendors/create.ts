import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';
import { logTimelineEvent } from '../../_timeline';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    productId,
    vendorName,
    logo,
    status,
    contactName,
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
    priority,
    moq,
    pricingTiers,
  } = req.body ?? {};

  if (!productId || !vendorName) {
    return res.status(400).json({ error: 'productId and vendorName are required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      productId,
      vendorName,
      logo: logo ?? null,
      status: status ?? 'Active',
      contactName: contactName ?? null,
      globalVendorId: req.body.globalVendorId ?? null,
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
      priority: typeof priority === 'number' ? priority : 99,
      moq: typeof moq === 'number' ? moq : null,
      pricingTiers: pricingTiers ?? [],
      createdAt: new Date(),
    };

    const result = await db.collection('pipeline_vendors').insertOne(doc);

    await logTimelineEvent(db, {
      productId,
      type: 'milestone',
      title: 'Vendor linked',
      description: `${vendorName}${country ? ` · ${country}` : ''}`,
      icon: 'package',
      color: 'indigo',
    });

    return res.status(201).json({
      vendor: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create vendor.';
    return res.status(500).json({ error: message });
  }
}
