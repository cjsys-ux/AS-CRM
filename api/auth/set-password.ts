import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getMgmtToken } from '../_mgmt-token';

function verifyInviteToken(token: string): { userId: string; email: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const secret = process.env.INVITE_TOKEN_SECRET ?? process.env.AUTH0_MGMT_CLIENT_SECRET ?? '';
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!decoded.userId || !decoded.email || !decoded.exp) return null;
    if (Date.now() > decoded.exp) return null;
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, password } = req.body ?? {};

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }

  const verified = verifyInviteToken(token as string);
  if (!verified) {
    return res.status(401).json({ error: 'Invalid or expired invite link.' });
  }

  const { userId, email } = verified;

  const domain = process.env.VITE_AUTH0_DOMAIN ?? process.env.AUTH0_DOMAIN;
  const clientId = process.env.VITE_AUTH0_CLIENT_ID;
  if (!domain || !clientId) {
    return res.status(500).json({ error: 'Auth0 environment variables are not configured.' });
  }

  // Set the user's password via Management API
  let mgmtToken: string;
  try {
    mgmtToken = await getMgmtToken();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Management token error: ${message}` });
  }

  const userUrl = `https://${domain}/api/v2/users/${encodeURIComponent(userId)}`;
  const patchHeaders = { Authorization: `Bearer ${mgmtToken}`, 'Content-Type': 'application/json' };

  // Auth0 does not allow updating password and email_verified in the same request.
  // connection is required when changing a password for a database user.
  let patchRes: Response;
  try {
    patchRes = await fetch(userUrl, {
      method: 'PATCH',
      headers: patchHeaders,
      body: JSON.stringify({ password, connection: 'Username-Password-Authentication' }),
    });
  } catch (fetchErr) {
    console.error('Password PATCH fetch error:', fetchErr);
    return res.status(502).json({
      error: 'Unable to reach Auth0 to set password. Please try again later.',
    });
  }

  if (!patchRes.ok) {
    const err = await patchRes.json().catch(() => ({}));
    return res.status(patchRes.status).json({
      error: err.message || 'Failed to set password. Please check password requirements and try again.',
    });
  }

  // Mark email as verified in a separate request (non-fatal — password is already set)
  try {
    const verifyRes = await fetch(userUrl, {
      method: 'PATCH',
      headers: patchHeaders,
      body: JSON.stringify({ email_verified: true }),
    });
    if (!verifyRes.ok) {
      const verifyErr = await verifyRes.json().catch(() => ({}));
      console.error('Failed to mark email_verified:', verifyErr.message || verifyRes.status);
    }
  } catch (verifyFetchErr) {
    console.error('email_verified PATCH fetch error:', verifyFetchErr);
  }

  // Auto-login: exchange credentials for tokens
  let tokenRes: Response;
  try {
    tokenRes = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        realm: 'Username-Password-Authentication',
        username: email,
        password,
        client_id: clientId,
        scope: 'openid profile email',
      }),
    });
  } catch (tokenFetchErr) {
    console.error('Auto-login fetch error:', tokenFetchErr);
    return res.status(200).json({
      success: true,
      autoLogin: false,
      email,
      message: 'Password set successfully. Please log in manually.',
    });
  }

  if (!tokenRes.ok) {
    const tokenErr = await tokenRes.json().catch(() => ({}));
    console.error(
      'Auto-login failed:',
      tokenErr.error || tokenRes.status,
      tokenErr.error_description || ''
    );
    return res.status(200).json({
      success: true,
      autoLogin: false,
      email,
      message: 'Password set successfully. Please log in manually.',
    });
  }

  const tokens = await tokenRes.json();

  let userRes: Response;
  try {
    userRes = await fetch(`https://${domain}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
  } catch (userFetchErr) {
    console.error('Userinfo fetch error:', userFetchErr);
    return res.status(200).json({
      success: true,
      autoLogin: false,
      email,
      message: 'Password set successfully. Please log in manually.',
    });
  }

  if (!userRes.ok) {
    return res.status(200).json({
      success: true,
      autoLogin: false,
      email,
      message: 'Password set successfully. Please log in manually.',
    });
  }

  const user = await userRes.json();
  return res.status(200).json({ success: true, autoLogin: true, tokens, user, email });
}
