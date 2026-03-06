import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getMgmtToken } from '../_mgmt-token';

function verifyResetToken(token: string): { userId: string; email: string } | null {
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
  // GET — pre-validate the reset token before the user fills the form.
  if (req.method === 'GET') {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ valid: false, error: 'Token required.' });
    }
    const verified = verifyResetToken(token);
    if (!verified) {
      return res.status(200).json({ valid: false });
    }
    return res.status(200).json({ valid: true, email: verified.email });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, password } = req.body ?? {};

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }

  const verified = verifyResetToken(token as string);
  if (!verified) {
    return res.status(401).json({ error: 'Invalid or expired reset link.' });
  }

  const { userId, email } = verified;

  const mgmtDomain = process.env.AUTH0_DOMAIN ?? process.env.VITE_AUTH0_DOMAIN;
  const authDomain = process.env.VITE_AUTH0_DOMAIN ?? process.env.AUTH0_DOMAIN;
  const clientId = process.env.VITE_AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  if (!mgmtDomain || !authDomain || !clientId) {
    return res.status(500).json({ error: 'Auth0 environment variables are not configured.' });
  }

  let mgmtToken: string;
  try {
    mgmtToken = await getMgmtToken();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Management token error: ${message}` });
  }

  const userUrl = `https://${mgmtDomain}/api/v2/users/${encodeURIComponent(userId)}`;
  const patchHeaders = { Authorization: `Bearer ${mgmtToken}`, 'Content-Type': 'application/json' };

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
      error: 'Unable to reach Auth0 to reset password. Please try again later.',
    });
  }

  if (!patchRes.ok) {
    const err = await patchRes.json().catch(() => ({}));
    return res.status(patchRes.status).json({
      error: err.message || 'Failed to reset password. Please check password requirements and try again.',
    });
  }

  // Auto-login: exchange credentials for tokens
  let tokenRes: Response;
  try {
    tokenRes = await fetch(`https://${authDomain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        realm: 'Username-Password-Authentication',
        username: email,
        password,
        client_id: clientId,
        ...(clientSecret ? { client_secret: clientSecret } : {}),
        scope: 'openid profile email',
      }),
    });
  } catch (tokenFetchErr) {
    console.error('Auto-login fetch error:', tokenFetchErr);
    return res.status(200).json({
      success: true,
      autoLogin: false,
      email,
      message: 'Password reset successfully. Please log in manually.',
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
      message: 'Password reset successfully. Please log in manually.',
    });
  }

  const tokens = await tokenRes.json();

  let userRes: Response;
  try {
    userRes = await fetch(`https://${authDomain}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
  } catch (userFetchErr) {
    console.error('Userinfo fetch error:', userFetchErr);
    return res.status(200).json({
      success: true,
      autoLogin: false,
      email,
      message: 'Password reset successfully. Please log in manually.',
    });
  }

  if (!userRes.ok) {
    return res.status(200).json({
      success: true,
      autoLogin: false,
      email,
      message: 'Password reset successfully. Please log in manually.',
    });
  }

  const user = await userRes.json();
  return res.status(200).json({ success: true, autoLogin: true, tokens, user, email });
}
