import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    productId,
    length, lengthUnit,
    width, widthUnit,
    height, heightUnit,
    primaryPackaging,
    packagingMaterial,
    specialRequirements,
  } = req.body ?? {};

  if (!productId) {
    return res.status(400).json({ error: 'productId is required.' });
  }

  try {
    const db = await getDb();

    await db.collection('pipeline_packaging').updateOne(
      { productId },
      {
        $set: {
          productId,
          length: length ?? null,
          lengthUnit: lengthUnit ?? 'in',
          width: width ?? null,
          widthUnit: widthUnit ?? 'in',
          height: height ?? null,
          heightUnit: heightUnit ?? 'in',
          primaryPackaging: primaryPackaging ?? '',
          packagingMaterial: packagingMaterial ?? '',
          specialRequirements: specialRequirements ?? '',
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save packaging.';
    return res.status(500).json({ error: message });
  }
}
