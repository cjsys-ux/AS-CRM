import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

// Matches the reference scheme in
// `src/Use as reference/src/supabase/functions/server/index.tsx:2099-2118`:
// every PO (sample or regular) shares one sequential counter formatted as
// `PO-NNNNN` starting at 10001. Legacy `SAMPLE-NNNNN` and this project's
// earlier `SMPL-YYYY-NNNN` format are scanned on first seed so the counter
// can't hand out a number that already exists.

const COUNTER_ID = 'purchaseOrderSeq';
const MIN_SEQ = 10000; // $inc adds 1, so the first allocated number is PO-10001

function extractSeq(poNumber: unknown): number | null {
  if (typeof poNumber !== 'string') return null;
  const match =
    poNumber.match(/^PO-(\d+)/) ||
    poNumber.match(/^SAMPLE-(\d+)/) ||
    poNumber.match(/^SMPL-\d{4}-(\d+)/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const counters = db.collection<{ _id: string; seq: number }>('counters');

    // First-time seed: prime the counter from the max existing PO number
    // so we don't hand out a number that's already in use. Safe under
    // concurrent cold starts — $setOnInsert only fires on the insert path.
    const existing = await counters.findOne({ _id: COUNTER_ID });
    if (!existing) {
      const pos = await db
        .collection('purchaseOrders')
        .find({}, { projection: { poNumber: 1 } })
        .toArray();
      let maxNum = MIN_SEQ;
      for (const po of pos) {
        const n = extractSeq((po as { poNumber?: unknown }).poNumber);
        if (n !== null && n > maxNum) maxNum = n;
      }
      await counters.updateOne(
        { _id: COUNTER_ID },
        { $setOnInsert: { seq: maxNum } },
        { upsert: true },
      );
    }

    const doc = await counters.findOneAndUpdate(
      { _id: COUNTER_ID },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );

    const seq = typeof doc?.seq === 'number' ? doc.seq : MIN_SEQ + 1;
    const poNumber = `PO-${String(seq).padStart(5, '0')}`;

    return res.status(200).json({ poNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate PO number.';
    return res.status(500).json({ error: message });
  }
}
