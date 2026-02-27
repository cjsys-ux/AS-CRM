import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMgmtToken } from '../_mgmt-token';

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, firstName, lastName, email, phone, role, status } = req.body ?? {};

  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }

  const domain = process.env.AUTH0_DOMAIN;
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

  const patch: Record<string, unknown> = {};

  if (firstName !== undefined || lastName !== undefined) {
    const first = firstName ?? '';
    const last = lastName ?? '';
    patch.name = `${first} ${last}`.trim();
    patch.given_name = first;
    patch.family_name = last;
  }

  if (email !== undefined) {
    patch.email = email;
    patch.email_verified = false;
  }

  if (status !== undefined) {
    patch.blocked = status === 'Inactive';
  }

  const metaPatch: Record<string, string> = {};
  if (phone !== undefined) metaPatch.phone = phone;
  if (role !== undefined) metaPatch.role = role;
  if (Object.keys(metaPatch).length > 0) {
    patch.user_metadata = metaPatch;
  }

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }

  // Auth0 user IDs contain '|' which must be percent-encoded in URL paths
  const encodedId = encodeURIComponent(userId as string);

  const auth0Res = await fetch(`https://${domain}/api/v2/users/${encodedId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

  if (!auth0Res.ok) {
    const err = await auth0Res.json().catch(() => ({}));
    if (auth0Res.status === 404) return res.status(404).json({ error: 'User not found in Auth0.' });
    if (auth0Res.status === 409) return res.status(409).json({ error: 'A user with this email address already exists.' });
    return res.status(auth0Res.status).json({ error: err.message || 'Failed to update user in Auth0.' });
  }

  const updated = await auth0Res.json();

  return res.status(200).json({
    user: {
      id: updated.user_id,
      name: updated.name,
      email: updated.email,
      phone: updated.user_metadata?.phone ?? '',
      role: updated.user_metadata?.role ?? '',
      status: updated.blocked ? 'Inactive' : 'Active',
      lastLogin: updated.last_login ? formatRelativeDate(updated.last_login) : 'Never',
      created: updated.created_at ?? '',
    },
  });
}
