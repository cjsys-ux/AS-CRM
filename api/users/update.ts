import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getMgmtToken } from '../_mgmt-token';
import { getS3Client, getS3Bucket } from '../_s3';

/** Extract an S3 object key from one of our URLs (proxy or direct S3).
 *  Returns null if the URL doesn't look like an object we own. */
function extractS3Key(url: string): string | null {
  // Proxy format: /api/files/image?key=Profile-images/...
  try {
    const u = new URL(url, 'http://x');
    if (u.pathname.endsWith('/image')) {
      const k = u.searchParams.get('key');
      if (k) return k;
    }
  } catch { /* not parseable as URL */ }
  // Legacy direct S3 URL formats
  let idx = url.indexOf('/Profile-images/');
  if (idx !== -1) return url.slice(idx + 1);
  idx = url.indexOf('/uploads/');
  if (idx !== -1) return url.slice(idx + 1);
  return null;
}

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

  const { userId, firstName, lastName, email, phone, role, status, profileImage, oldProfileImage } = req.body ?? {};

  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
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

  if (profileImage !== undefined) {
    patch.picture = profileImage;
  }

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }

  // Delete the previous profile image from S3 when a new one is uploaded.
  if (profileImage !== undefined && typeof oldProfileImage === 'string') {
    const oldKey = extractS3Key(oldProfileImage);
    if (oldKey) {
      try {
        const s3 = getS3Client();
        const bucket = getS3Bucket();
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: oldKey }));
      } catch {
        // Non-fatal: log and continue even if the old image can't be deleted.
        console.error('Failed to delete old profile image from S3:', oldKey);
      }
    }
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
      profileImage: updated.picture ?? '',
    },
  });
}
