import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_mongodb';

/**
 * One-shot admin endpoint. Creates the indexes that back lead generation
 * features (dedup, scoring, source filters). Safe to re-run; createIndex
 * is idempotent for unchanged specs.
 *
 * Protect with a shared secret in `LEAD_INDEX_ADMIN_TOKEN` env var.
 * POST with header `x-admin-token: <token>`.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expected = process.env.LEAD_INDEX_ADMIN_TOKEN;
  const provided = req.headers['x-admin-token'];
  if (!expected || provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('salesLeads');

    const created: string[] = [];
    created.push(
      await collection.createIndex(
        { normalizedEmail: 1 },
        { unique: true, sparse: true, name: 'normalizedEmail_unique' },
      ),
    );
    created.push(await collection.createIndex({ normalizedPhone: 1 }, { sparse: true, name: 'normalizedPhone' }));
    created.push(await collection.createIndex({ emailDomain: 1 }, { sparse: true, name: 'emailDomain' }));
    created.push(await collection.createIndex({ score: -1 }, { name: 'score_desc' }));
    created.push(await collection.createIndex({ owner: 1, createdAt: -1 }, { name: 'owner_createdAt' }));
    created.push(await collection.createIndex({ sourceCategory: 1 }, { sparse: true, name: 'sourceCategory' }));

    // Phase 2 supporting collections
    const rateLimit = db.collection('captureRateLimit');
    created.push(
      await rateLimit.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 60 * 60, name: 'captureRateLimit_ttl' },
      ),
    );
    created.push(await rateLimit.createIndex({ ip: 1, createdAt: -1 }, { name: 'captureRateLimit_ip' }));

    const domainCache = db.collection('domainCache');
    created.push(await domainCache.createIndex({ domain: 1 }, { unique: true, name: 'domainCache_domain' }));

    return res.status(200).json({ success: true, indexes: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to ensure indexes.';
    return res.status(500).json({ error: message });
  }
}
