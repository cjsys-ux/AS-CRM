import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getMgmtToken } from '../_mgmt-token';
import { getMailer } from '../_mailer';
import { renderInviteEmail } from '../_templates/invite-email';

/** Generate a signed invite token containing userId and email, valid for 7 days */
function createInviteToken(userId: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  const secret = process.env.INVITE_TOKEN_SECRET ?? process.env.AUTH0_MGMT_CLIENT_SECRET ?? '';
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/** Generate a random password that satisfies Auth0's default password policy */
function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*';
  const all = upper + lower + digits + special;

  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  for (let i = 4; i < 16; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  // Shuffle
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, phone, role, status } = req.body ?? {};

  if (!firstName || !email) {
    return res.status(400).json({ error: 'firstName and email are required.' });
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

  const tempPassword = generateTempPassword();
  const fullName = `${firstName} ${lastName ?? ''}`.trim();

  // Step 1: Create the user in Auth0
  const createRes = await fetch(`https://${domain}/api/v2/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      connection: 'Username-Password-Authentication',
      email,
      name: fullName,
      given_name: firstName,
      family_name: lastName ?? '',
      password: tempPassword,
      blocked: status === 'Inactive',
      email_verified: false,
      verify_email: false, // suppress Auth0's own verification email — we send our own invite
      user_metadata: {
        phone: phone ?? '',
        role: role ?? 'Sales Rep',
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    if (createRes.status === 409) {
      return res.status(409).json({ error: 'A user with this email address already exists.' });
    }
    return res.status(createRes.status).json({ error: err.message || 'Failed to create user in Auth0.' });
  }

  const newUser = await createRes.json();

  // Step 2: Generate a signed invite token linking to our custom set-password page
  const host = req.headers.host ?? '';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const appUrl = process.env.APP_URL ?? `${protocol}://${host}`;
  const inviteToken = createInviteToken(newUser.user_id, email);
  const activationLink = `${appUrl}/set-password?token=${inviteToken}`;

  // Send the branded invite email via our own SMTP mailer (non-fatal).
  let emailSent = false;
  let emailError: string | null = null;
  try {
    const mailer = getMailer();
    const html = renderInviteEmail({
      firstName,
      companyName: process.env.COMPANY_NAME ?? 'ActivateSwag',
      activationLink,
      currentYear: new Date().getFullYear().toString(),
    });
    await mailer.sendMail({
      from: process.env.OUTLOOK_FROM_EMAIL ?? 'noreply@activateswag.com',
      to: email,
      subject: 'Welcome to ActivateSwag \u2013 Create Your Password',
      html,
    });
    emailSent = true;
  } catch (mailErr) {
    emailError = mailErr instanceof Error ? mailErr.message : String(mailErr);
    console.error('Failed to send invite email:', emailError);
  }

  return res.status(201).json({
    user: {
      id: newUser.user_id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.user_metadata?.phone ?? '',
      role: newUser.user_metadata?.role ?? role ?? 'Sales Rep',
      status: newUser.blocked ? 'Inactive' : 'Active',
      lastLogin: 'Never',
      created: newUser.created_at ?? new Date().toISOString(),
    },
    invite: {
      inviteTokenCreated: true,
      emailSent,
      emailError,
    },
  });
}
