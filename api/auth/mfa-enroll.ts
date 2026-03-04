import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMgmtToken } from '../_mgmt-token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email } = req.body ?? {};
  if (!userId || !email) {
    return res.status(400).json({ error: 'userId and email are required.' });
  }

  if (userId.startsWith('local|')) {
    return res.status(400).json({ error: 'MFA enrollment is not supported for local development accounts.' });
  }

  const domain = process.env.AUTH0_DOMAIN ?? process.env.VITE_AUTH0_DOMAIN;
  if (!domain) {
    return res.status(500).json({ error: 'Auth0 environment variables are not configured.' });
  }

  let mgmtToken: string;
  try {
    mgmtToken = await getMgmtToken();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Management token error: ${message}` });
  }

  const enrollRes = await fetch(
    `https://${domain}/api/v2/users/${encodeURIComponent(userId)}/authentication-methods`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${mgmtToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'totp' }),
    }
  );

  if (!enrollRes.ok) {
    const err = await enrollRes.json().catch(() => ({}));
    return res.status(enrollRes.status).json({ error: err.message || 'Failed to start MFA enrollment.' });
  }

  const data = await enrollRes.json();
  const secret: string = data.totp_secret;
  const issuer = 'ActivateSwag';
  const barcodeUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

  return res.status(200).json({ methodId: data.id, secret, barcodeUri });
}
