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

// Calls the serverless proxy at /api/auth/login which handles the
// Auth0 token exchange server-side (avoids browser CORS restrictions).
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ tokens: AuthTokens; user: Auth0User }> {
  let res: Response;
  try {
    res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(
      'Unable to reach the login server. Check your internet connection.'
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Invalid email or password.');
  }

  return { tokens: data.tokens, user: data.user };
}
