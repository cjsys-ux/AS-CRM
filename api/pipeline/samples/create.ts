import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    productId,
    sampleName,
    sampleType,
    version,
    vendorName,
    requestDate,
    receivedDate,
    trackingNumber,
    carrier,
    comparisonToPrevious,
    imageAngle,
    imageKeys,
    issuesToFix,
    notes,
  } = req.body ?? {};

  if (!productId || !sampleName) {
    return res.status(400).json({ error: 'productId and sampleName are required.' });
  }

  try {
    const db = await getDb();

    const doc = {
      productId,
      sampleName,
      sampleType: sampleType ?? 'Factory Sample',
      version: version ?? '',
      vendorName: vendorName ?? '',
      requestDate: requestDate ?? null,
      receivedDate: receivedDate ?? null,
      trackingNumber: trackingNumber ?? '',
      carrier: carrier ?? '',
      comparisonToPrevious: comparisonToPrevious ?? 'N/A (First Sample)',
      imageAngle: imageAngle ?? 'Front',
      imageKeys: imageKeys ?? [],
      issuesToFix: issuesToFix ?? [],
      notes: notes ?? '',
      createdAt: new Date(),
    };

    const result = await db.collection('pipeline_samples').insertOne(doc);

    // Mirror the sample into Sample Tracking so it shows in both sections.
    const normalizedType = /competitor/i.test(String(sampleType ?? ''))
      ? 'competitor'
      : 'pre-production';
    const trackingStatus = receivedDate ? 'Delivered' : 'Submitted';
    const versionSuffix = version ? ` (${version})` : '';
    const trackingDoc = {
      productId,
      productName: `${sampleName}${versionSuffix}`,
      clientName: '',
      sampleType: normalizedType,
      variants: [],
      vendor: vendorName ?? '',
      destinations: [],
      additionalNotes: notes ?? '',
      inHandsDate: receivedDate ?? requestDate ?? null,
      competitorLink: '',
      totalCost: 0,
      status: trackingStatus,
      linkedSampleId: result.insertedId.toString(),
      createdAt: new Date(),
    };
    const trackingResult = await db
      .collection('pipeline_sample_orders')
      .insertOne(trackingDoc);

    // Log timeline event
    await db.collection('pipeline_timeline').insertOne({
      productId,
      type: 'milestone',
      title: 'Sample Added',
      description: `Sample "${sampleName}" (${sampleType}) was added`,
      user: 'System',
      timestamp: new Date().toISOString(),
      icon: 'package',
      color: 'blue',
      createdAt: new Date(),
    });

    return res.status(201).json({
      sample: { id: result.insertedId.toString(), ...doc },
      trackingOrder: { id: trackingResult.insertedId.toString(), ...trackingDoc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create sample.';
    return res.status(500).json({ error: message });
  }
}
