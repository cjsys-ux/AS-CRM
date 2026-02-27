/**
 * Fetches a short-lived Auth0 Management API access token using
 * the machine-to-machine client credentials grant.
 *
 * Token is cached in module-level memory for reuse across warm Lambda
 * invocations. A 60-second buffer before expiry triggers a refresh.
 */

let cachedToken: string | null = null;
let tokenExpiresAt = 0; // Unix ms

export async function getMgmtToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_MGMT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;
  const audience = process.env.AUTH0_MGMT_AUDIENCE;

  if (!domain || !clientId || !clientSecret || !audience) {
    throw new Error('Auth0 management API environment variables are not fully configured.');
  }

  const res = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || err.message || `Failed to fetch Management API token (${res.status}).`);
  }

  const data = await res.json();
  cachedToken = data.access_token as string;
  // data.expires_in is in seconds — convert to ms
  tokenExpiresAt = now + (data.expires_in as number) * 1000;

  return cachedToken;
}
