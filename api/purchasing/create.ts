import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    poNumber,
    poDate,
    project,
    vendor,
    customer,
    status,
    shipDate,
    inHandsDate,
    total,
    priority,
    contact,
    isSample,
    shippingMethod,
    carrierAccount,
    isBlindShip,
    shipToAddress,
    lineItems,
    customLineItems,
    salesTaxRate,
    taxStatus,
    contactDetails,
    artworkDetails,
    createdBy,
    productId,
    projectNumber,
    vendorId,
    sampleType,
    variants,
    destinations,
    contacts,
    shipToAddresses,
    additionalNotes,
    competitorLink,
    splitFromGroup,
    vendorDropShip,
    contactId,
  } = req.body ?? {};

  if (!poNumber) {
    return res.status(400).json({ error: 'poNumber is required.' });
  }

  try {
    const db = await getDb();

    // Ensure PO number is unique
    const existing = await db.collection('purchaseOrders').findOne({ poNumber });
    if (existing) {
      return res.status(409).json({ error: `A purchase order with PO number "${poNumber}" already exists.` });
    }

    const resolvedShipToAddresses = Array.isArray(shipToAddresses) ? shipToAddresses : [];
    const resolvedShipToAddress = shipToAddress ?? resolvedShipToAddresses[0] ?? null;

    const doc = {
      poNumber: poNumber as string,
      poDate: poDate ?? new Date().toISOString().split('T')[0],
      project: project ?? null,
      projectNumber: projectNumber ?? null,
      productId: productId ?? null,
      vendor: vendor ?? null,
      vendorId: vendorId ?? null,
      customer: customer ?? null,
      status: status ?? 'Created',
      shipDate: shipDate ?? null,
      inHandsDate: inHandsDate ?? null,
      total: typeof total === 'number' ? total : 0,
      priority: priority ?? '1st Choice',
      contact: contact ?? null,
      contactId: contactId ?? null,
      contacts: Array.isArray(contacts) ? contacts : [],
      isSample: isSample === true,
      sampleType: sampleType ?? null,
      shippingMethod: shippingMethod ?? 'Ground',
      carrierAccount: carrierAccount ?? 'No carrier account',
      isBlindShip: isBlindShip === true,
      shipToAddress: resolvedShipToAddress,
      shipToAddresses: resolvedShipToAddresses,
      lineItems: Array.isArray(lineItems) ? lineItems : [],
      customLineItems: Array.isArray(customLineItems) ? customLineItems : [],
      variants: Array.isArray(variants) ? variants : [],
      destinations: Array.isArray(destinations) ? destinations : [],
      additionalNotes: additionalNotes ?? '',
      competitorLink: competitorLink ?? null,
      splitFromGroup: splitFromGroup ?? null,
      vendorDropShip: typeof vendorDropShip === 'boolean' ? vendorDropShip : null,
      salesTaxRate: typeof salesTaxRate === 'number' ? salesTaxRate : 0.07,
      taxStatus: taxStatus ?? 'standard',
      contactDetails: contactDetails ?? {},
      artworkDetails: artworkDetails ?? {},
      notes: [],
      timelineEvents: [
        {
          id: '1',
          date: new Date().toISOString(),
          title: 'Purchase Order Created',
          description: `PO #${poNumber} was created`,
          user: createdBy ?? 'User',
          type: 'created',
        },
      ],
      createdBy: createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('purchaseOrders').insertOne(doc);

    return res.status(201).json({
      success: true,
      purchaseOrder: {
        id: result.insertedId.toString(),
        ...doc,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create purchase order.';
    return res.status(500).json({ error: message });
  }
}
