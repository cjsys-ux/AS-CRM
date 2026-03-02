import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const domain = process.env.VITE_AUTH0_DOMAIN ?? process.env.AUTH0_DOMAIN;
  const clientId = process.env.VITE_AUTH0_CLIENT_ID;
  // Optional: required only when the Auth0 app type is "Regular Web Application"
  // (confidential client). Set AUTH0_CLIENT_SECRET in Vercel if logins return
  // "unauthorized_client".
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;

  if (!domain || !clientId) {
    return res.status(500).json({
      error: 'Auth0 environment variables are not configured on the server.',
    });
  }

  // Exchange credentials for tokens (server-to-server, no CORS)
  const tokenRes = await fetch(`https://${domain}/oauth/token`, {
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

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    // Provide a clear, actionable message when the Password grant type is not
    // enabled for this Auth0 application.
    if (err.error === 'unauthorized_client') {
      return res.status(401).json({
        error:
          'Login is not enabled for this Auth0 application. In your Auth0 Dashboard, ' +
          'go to Applications → [your app] → Settings → Advanced Settings → Grant Types ' +
          'and enable the Password grant.',
      });
    }
    return res.status(tokenRes.status).json({
      error: err.error_description || err.message || 'Invalid email or password.',
    });
  }

  const tokens = await tokenRes.json();

  // Fetch user profile
  const userRes = await fetch(`https://${domain}/userinfo`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    return res.status(502).json({ error: 'Failed to retrieve user profile from Auth0.' });
  }

  const user = await userRes.json();
  return res.status(200).json({ tokens, user });
}
