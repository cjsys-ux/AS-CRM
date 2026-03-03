import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMgmtToken } from '../_mgmt-token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId query parameter is required.' });
  }

  const domain = process.env.AUTH0_DOMAIN ?? process.env.VITE_AUTH0_DOMAIN;
  if (!domain) {
    return res.status(500).json({ error: 'AUTH0_DOMAIN is not configured on the server.' });
  }

  let token: string;
  try {
    token = await getMgmtToken();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Management token error: ${message}` });
  }

  const url = new URL(`https://${domain}/api/v2/users/${encodeURIComponent(userId)}`);
  url.searchParams.set('fields', 'created_at,last_login,email_verified,blocked,user_metadata');

  const auth0Res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!auth0Res.ok) {
    const err = await auth0Res.json().catch(() => ({}));
    return res.status(auth0Res.status).json({ error: err.message || 'Failed to fetch user from Auth0.' });
  }

  const data = await auth0Res.json();
  return res.status(200).json({
    created_at: data.created_at ?? null,
    last_login: data.last_login ?? null,
    email_verified: data.email_verified ?? null,
    blocked: data.blocked ?? false,
    profile_image_key: data.user_metadata?.profile_image_key ?? null,
  });
}
