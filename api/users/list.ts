import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMgmtToken } from '../_mgmt-token';

interface Auth0UserRecord {
  user_id: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  user_metadata?: { phone?: string; role?: string };
  last_login?: string;
  created_at?: string;
  blocked?: boolean;
}

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function mapUser(u: Auth0UserRecord) {
  return {
    id: u.user_id,
    name: u.name ?? `${u.given_name ?? ''} ${u.family_name ?? ''}`.trim(),
    email: u.email ?? '',
    phone: u.user_metadata?.phone ?? '',
    role: u.user_metadata?.role ?? 'Sales Rep',
    status: u.blocked ? 'Inactive' : 'Active',
    lastLogin: u.last_login ? formatRelativeDate(u.last_login) : 'Never',
    created: u.created_at ?? '',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const domain = process.env.VITE_AUTH0_DOMAIN ?? process.env.AUTH0_DOMAIN;
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

  const fields = [
    'user_id', 'name', 'given_name', 'family_name',
    'email', 'user_metadata', 'last_login', 'created_at', 'blocked',
  ].join(',');

  const url = new URL(`https://${domain}/api/v2/users`);
  url.searchParams.set('per_page', '100');
  url.searchParams.set('include_totals', 'false');
  url.searchParams.set('fields', fields);
  url.searchParams.set('sort', 'created_at:-1');

  const auth0Res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!auth0Res.ok) {
    const err = await auth0Res.json().catch(() => ({}));
    return res.status(auth0Res.status).json({ error: err.message || 'Failed to fetch users from Auth0.' });
  }

  const auth0Users = (await auth0Res.json()) as Auth0UserRecord[];
  return res.status(200).json({ users: auth0Users.map(mapUser) });
}
