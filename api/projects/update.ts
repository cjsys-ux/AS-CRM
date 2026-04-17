import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';
import { logTimelineEvent } from '../_timeline';

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  client: 'Customer',
  vendor: 'Vendor',
  description: 'Description',
  status: 'Status',
  type: 'Type',
  yearlyQty: 'Yearly Quantity',
  pricePerUnit: 'Price / Unit',
  totalValue: 'Total Value',
  priority: 'Priority',
  deployment: 'Deployment',
  projectManager: 'Project Manager',
  internalSKU: 'Internal SKU',
  targetMargin: 'Target Margin',
  imageKey: 'Product Image',
  competitorName: 'Competitor Name',
  competitorLink: 'Competitor Link',
  competitorPrice: 'Competitor Price',
  htsCode: 'HTS Code',
  htsRate: 'HTS Rate',
  htsBaseRate: 'HTS Base Rate',
  htsSection301: 'Section 301',
  sizeVariants: 'Size Variants',
  artTemplateKey: 'Art Template',
  artTemplateName: 'Art Template Name',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, ...fields } = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  // Build the $set payload from only the fields that were provided
  const allowedFields = [
    'name', 'client', 'vendor', 'description', 'status', 'type',
    'yearlyQty', 'pricePerUnit', 'totalValue', 'priority', 'deployment',
    'projectManager', 'internalSKU', 'targetMargin', 'imageKey',
    'competitorName', 'competitorLink', 'competitorPrice',
    'htsCode', 'htsRate', 'htsBaseRate', 'htsSection301', 'sizeVariants',
    'artTemplateKey', 'artTemplateName',
  ];

  const setPayload: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowedFields) {
    if (key in fields && fields[key] !== undefined) {
      setPayload[key] = fields[key];
    }
  }

  if (Object.keys(setPayload).length === 1) {
    return res.status(400).json({ error: 'No valid fields provided for update.' });
  }

  // Build a filter that matches by _id (ObjectId) if the id is a valid hex string,
  // otherwise fall back to matching a custom string `id` field on the document.
  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const result = await db
      .collection('product_pipelines')
      .updateOne(filter, { $set: setPayload });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Timeline: summarize which fields were touched. Status changes get their
    // own event type; everything else is an "edit".
    const changedKeys = Object.keys(setPayload).filter((k) => k !== 'updatedAt');
    if (changedKeys.length > 0) {
      const productIdStr = id as string;
      if (changedKeys.includes('status')) {
        await logTimelineEvent(db, {
          productId: productIdStr,
          type: 'status_change',
          title: 'Status updated',
          description: `Status changed to "${setPayload.status}"`,
          icon: 'check',
          color: 'green',
        });
      }
      const nonStatus = changedKeys.filter((k) => k !== 'status');
      if (nonStatus.length > 0) {
        const labels = nonStatus.map((k) => FIELD_LABELS[k] ?? k).join(', ');
        await logTimelineEvent(db, {
          productId: productIdStr,
          type: 'edit',
          title: 'Product information updated',
          description: `Updated: ${labels}`,
          icon: 'edit',
          color: 'orange',
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update project.';
    return res.status(500).json({ error: message });
  }
}
