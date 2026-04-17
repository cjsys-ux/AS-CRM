import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';
import { logTimelineEvent } from '../../_timeline';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    productId,
    length, lengthUnit,
    width, widthUnit,
    height, heightUnit,
    productWeight, productWeightUnit,
    shippingWeight, shippingWeightUnit,
    materialCompositions,
    careInstructions,
    variantSpecs,
  } = req.body ?? {};

  if (!productId) {
    return res.status(400).json({ error: 'productId is required.' });
  }

  try {
    const db = await getDb();

    const update = {
      $set: {
        productId,
        length: length ?? null,
        lengthUnit: lengthUnit ?? 'in',
        width: width ?? null,
        widthUnit: widthUnit ?? 'in',
        height: height ?? null,
        heightUnit: heightUnit ?? 'in',
        productWeight: productWeight ?? null,
        productWeightUnit: productWeightUnit ?? 'lbs',
        shippingWeight: shippingWeight ?? null,
        shippingWeightUnit: shippingWeightUnit ?? 'lbs',
        materialCompositions: materialCompositions ?? [],
        careInstructions: careInstructions ?? '',
        variantSpecs: variantSpecs ?? {},
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    };

    await db.collection('pipeline_specs').updateOne(
      { productId },
      update,
      { upsert: true }
    );

    await logTimelineEvent(db, {
      productId,
      type: 'edit',
      title: 'Specifications updated',
      description: 'Dimensions, weights, materials, and care instructions saved',
      icon: 'edit',
      color: 'orange',
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save specifications.';
    return res.status(500).json({ error: message });
  }
}
