import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';
import { getMgmtToken } from '../_mgmt-token';

// ---------------------------------------------------------------------------
// Token helpers
// Token format: base64url(JSON payload) + "." + HMAC-SHA256 signature
// ---------------------------------------------------------------------------

interface InvitePayload {
  sub: string;       // Auth0 user_id
  email: string;
  firstName: string;
  exp: number;       // Unix ms expiry
}

export function signInviteToken(payload: InvitePayload, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyInviteToken(token: string, secret: string): InvitePayload | null {
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;

  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = createHmac('sha256', secret).update(data).digest('base64url');

  try {
    const sigBuf = Buffer.from(sig, 'base64url');
    const expBuf = Buffer.from(expected, 'base64url');
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  let payload: InvitePayload;
  try {
    payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!payload.exp || payload.exp < Date.now()) return null;
  if (!payload.sub || !payload.email) return null;

  return payload;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.INVITE_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'INVITE_SECRET is not configured on the server.' });
  }

  // -------------------------------------------------------------------------
  // GET /api/auth/setup-password?token=xxx  →  validate token
  // -------------------------------------------------------------------------
  if (req.method === 'GET') {
    const token = req.query.token as string | undefined;
    if (!token) {
      return res.status(400).json({ valid: false, error: 'token is required' });
    }

    const payload = verifyInviteToken(token, secret);
    if (!payload) {
      return res.status(200).json({ valid: false });
    }

    return res.status(200).json({
      valid: true,
      firstName: payload.firstName,
      email: payload.email,
    });
  }

  // -------------------------------------------------------------------------
  // POST /api/auth/setup-password  →  set password
  // -------------------------------------------------------------------------
  if (req.method === 'POST') {
    const { token, password } = req.body ?? {};

    if (!token || !password) {
      return res.status(400).json({ error: 'token and password are required.' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const payload = verifyInviteToken(token, secret);
    if (!payload) {
      return res.status(400).json({ error: 'Invalid or expired invite link.' });
    }

    const domain = process.env.AUTH0_DOMAIN;
    if (!domain) {
      return res.status(500).json({ error: 'AUTH0_DOMAIN is not configured on the server.' });
    }

    let mgmtToken: string;
    try {
      mgmtToken = await getMgmtToken();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({ error: `Management token error: ${message}` });
    }

    // Update the user's password and mark email as verified via Auth0 Management API
    const patchRes = await fetch(
      `https://${domain}/api/v2/users/${encodeURIComponent(payload.sub)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          connection: 'Username-Password-Authentication',
          email_verified: true,
        }),
      }
    );

    if (!patchRes.ok) {
      const err = await patchRes.json().catch(() => ({}));
      console.error('Auth0 password update failed:', err);
      return res.status(500).json({ error: err.message || 'Failed to set password.' });
    }

    return res.status(200).json({ success: true, email: payload.email });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
