const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;

export interface Auth0User {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface AuthTokens {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

// Calls Auth0's Resource Owner Password Grant endpoint.
// Auth0 dashboard requirements:
//   1. Application → Advanced → Grant Types → enable "Password"
//   2. Tenant Settings → API Authorization → Default Directory = "Username-Password-Authentication"
//   3. Application → Settings → Allowed Web Origins → add your dev/prod URLs
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ tokens: AuthTokens; user: Auth0User }> {
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
    throw new Error(
      'Auth0 is not configured. Add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID to .env.local'
    );
  }

  let tokenRes: Response;
  try {
    tokenRes = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        realm: 'Username-Password-Authentication',
        username: email,
        password,
        client_id: AUTH0_CLIENT_ID,
        scope: 'openid profile email',
      }),
    });
  } catch {
    throw new Error(
      `Unable to reach Auth0 (${AUTH0_DOMAIN}). Check your internet connection and that the domain is correct.`
    );
  }

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    throw new Error(
      err.error_description || err.message || 'Invalid email or password.'
    );
  }

  const tokens: AuthTokens = await tokenRes.json();

  const userRes = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error('Failed to retrieve user profile from Auth0.');
  }

  const user: Auth0User = await userRes.json();
  return { tokens, user };
}
