import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  vendors:        ['Primary Vendor Linked', 'Pricing Confirmed', 'Shipping Terms Agreed', 'Lead Time Confirmed'],
  specifications: ['Product Dimensions', 'Material Specifications', 'Weight & Shipping Info', 'Compliance Documents'],
  packaging:      ['Packaging Mockup', 'Packaging Template', 'Dieline/CAD Files', 'Packaging Spec Sheet'],
  samples:        ['Sample Request Submitted', 'Sample Received', 'Quality Review Completed', 'Sample Documentation'],
  files:          ['Product Images Uploaded', 'Spec Sheets Uploaded', 'Vendor Quotes Filed', 'Compliance Docs Filed'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const doc = await db.collection('pipeline_settings').findOne({ key: 'checklists' });

    if (doc && doc.checklists) {
      return res.status(200).json({ success: true, checklists: doc.checklists });
    }

    // Return defaults if nothing saved yet
    return res.status(200).json({ success: true, checklists: DEFAULT_CHECKLISTS });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get pipeline settings.';
    return res.status(500).json({ error: message });
  }
}
