import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMgmtToken, getAuth0Domain } from '../_mgmt-token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // userId is passed as a query parameter: DELETE /api/users/delete?userId=auth0|abc123
  const userId = req.query.userId as string | undefined;

  if (!userId) {
    return res.status(400).json({ error: 'userId query parameter is required.' });
  }

  let domain: string;
  let token: string;
  try {
    domain = getAuth0Domain();
    token = await getMgmtToken();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Management token error: ${message}` });
  }

  // Auth0 user IDs contain '|' which must be percent-encoded in URL paths
  const encodedId = encodeURIComponent(userId);

  const auth0Res = await fetch(`https://${domain}/api/v2/users/${encodedId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (auth0Res.status === 204) {
    return res.status(200).json({ success: true });
  }

  if (auth0Res.status === 404) {
    return res.status(404).json({ error: 'User not found in Auth0.' });
  }

  const err = await auth0Res.json().catch(() => ({}));
  return res.status(auth0Res.status).json({ error: err.message || 'Failed to delete user from Auth0.' });
}
