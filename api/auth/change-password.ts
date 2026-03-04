import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMgmtToken } from '../_mgmt-token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email, currentPassword, newPassword } = req.body ?? {};
  if (!userId || !email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'userId, email, currentPassword, and newPassword are required.' });
  }

  const authDomain = process.env.VITE_AUTH0_DOMAIN ?? process.env.AUTH0_DOMAIN;
  const mgmtDomain = process.env.AUTH0_DOMAIN ?? process.env.VITE_AUTH0_DOMAIN;
  const clientId = process.env.VITE_AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;

  if (!authDomain || !mgmtDomain || !clientId) {
    return res.status(500).json({ error: 'Auth0 environment variables are not configured.' });
  }

  // Step 1: Verify current password via Resource Owner Password Grant
  const verifyRes = await fetch(`https://${authDomain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      realm: 'Username-Password-Authentication',
      username: email,
      password: currentPassword,
      client_id: clientId,
      ...(clientSecret ? { client_secret: clientSecret } : {}),
      scope: 'openid',
    }),
  });

  if (!verifyRes.ok) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  // Step 2: Set new password via Management API
  let mgmtToken: string;
  try {
    mgmtToken = await getMgmtToken();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Management token error: ${message}` });
  }

  const patchRes = await fetch(
    `https://${mgmtDomain}/api/v2/users/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mgmtToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword, connection: 'Username-Password-Authentication' }),
    }
  );

  if (!patchRes.ok) {
    const err = await patchRes.json().catch(() => ({}));
    return res.status(patchRes.status).json({
      error: err.message || 'Failed to update password. Please check password requirements and try again.',
    });
  }

  return res.status(200).json({ success: true });
}
