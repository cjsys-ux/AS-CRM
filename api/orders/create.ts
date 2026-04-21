import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${rand}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  const { customer, email, createdBy } = body;

  if (!customer || !email) {
    return res.status(400).json({ error: 'customer and email are required.' });
  }

  try {
    const db = await getDb();

    const orderNumber = generateOrderNumber();

    const doc: Record<string, unknown> = {
      orderNumber,
      customer: customer as string,
      customerId: body.customerId ?? null,
      email: email as string,
      status: body.status ?? 'Pending',
      paymentStatus: body.paymentStatus ?? 'Pending',
      items: typeof body.items === 'number' ? body.items : 1,
      total: body.total ?? '$0.00',
      shipping: body.shipping ?? 'Standard',
      date: body.date ?? new Date().toISOString().split('T')[0],
      notes: body.notes ?? '',
      projectName: body.projectName ?? null,
      eventType: body.eventType ?? null,
      stage: body.stage ?? null,
      inHandsDate: body.inHandsDate ?? null,
      terms: body.terms ?? null,
      currency: body.currency ?? 'USD',
      taxRate: typeof body.taxRate === 'number' ? body.taxRate : null,
      defaultMargin: typeof body.defaultMargin === 'number' ? body.defaultMargin : null,
      customerPO: body.customerPO ?? null,
      isSampleOrder: body.isSampleOrder === true,
      introduction: body.introduction ?? '',
      billingContact: body.billingContact ?? null,
      billingAddress: body.billingAddress ?? null,
      shippingContact: body.shippingContact ?? null,
      shippingAddress: body.shippingAddress ?? null,
      subtotal: body.subtotal ?? null,
      taxAmount: body.taxAmount ?? null,
      totalMargin: body.totalMargin ?? null,
      lineItems: Array.isArray(body.lineItems) ? body.lineItems : [],
      sourcePONumber: body.sourcePONumber ?? null,
      sourcePOId: body.sourcePOId ?? null,
      project: body.project ?? null,
      shipDate: body.shipDate ?? null,
      vendor: body.vendor ?? null,
      shipToAddresses: Array.isArray(body.shipToAddresses) ? body.shipToAddresses : [],
      contacts: Array.isArray(body.contacts) ? body.contacts : [],
      documents: Array.isArray(body.documents) ? body.documents : [],
      createdBy: createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(doc);

    return res.status(201).json({
      order: {
        id: result.insertedId.toString(),
        ...doc,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order.';
    return res.status(500).json({ error: message });
  }
}
