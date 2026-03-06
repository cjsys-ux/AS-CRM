import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMgmtToken } from '../_mgmt-token';
import { getMailer } from '../_mailer';
import { renderResetPasswordEmail } from '../_templates/reset-password-email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body ?? {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const domain = process.env.AUTH0_DOMAIN ?? process.env.VITE_AUTH0_DOMAIN;
  if (!domain) {
    return res.status(500).json({ error: 'AUTH0_DOMAIN is not configured.' });
  }

  const from = process.env.OUTLOOK_FROM_EMAIL ?? 'noreply@activateswag.com';

  let token: string;
  try {
    token = await getMgmtToken();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Management token error: ${message}` });
  }

  // Look up user by email
  const searchUrl = new URL(`https://${domain}/api/v2/users-by-email`);
  searchUrl.searchParams.set('email', email);
  searchUrl.searchParams.set('fields', 'user_id,given_name,blocked');

  const userRes = await fetch(searchUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userRes.ok) {
    return res.status(502).json({ error: 'Failed to look up account.' });
  }

  const users = await userRes.json();

  // No account found — return neutral success (don't reveal if email is registered)
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(200).json({ success: true });
  }

  const user = users[0];

  // Account is inactive
  if (user.blocked) {
    return res.status(403).json({
      error: 'Your account is temporarily inactive and cannot be used to log in at this time. Please contact support@activateswag.com for assistance.',
    });
  }

  // Generate a 24-hour password reset ticket via Auth0 Management API
  const ticketRes = await fetch(`https://${domain}/api/v2/tickets/password-change`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: user.user_id,
      ttl_sec: 86400,
      mark_email_as_verified: true,
    }),
  });

  if (!ticketRes.ok) {
    const err = await ticketRes.json().catch(() => ({}));
    return res.status(502).json({ error: err.message || 'Failed to generate reset link.' });
  }

  const { ticket } = await ticketRes.json();

  const html = renderResetPasswordEmail({
    firstName: user.given_name || 'there',
    resetLink: ticket,
    currentYear: new Date().getFullYear().toString(),
  });

  let mailer: ReturnType<typeof getMailer>;
  try {
    mailer = getMailer();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Mailer configuration error: ${message}` });
  }

  try {
    await mailer.sendMail({
      from,
      to: email,
      subject: 'Reset Your ActivateSwag Password',
      html,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(502).json({ error: `Failed to send email: ${message}` });
  }

  return res.status(200).json({ success: true });
}
