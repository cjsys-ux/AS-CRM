import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMgmtToken } from '../_mgmt-token';
import { getMailer } from '../_mailer';
import { renderInviteEmail } from '../_templates/invite-email';

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

  // Step 2: Send a password-change ticket so the new user can set their own password
  // Requires the M2M app to have the `create:user_tickets` scope
  const ticketRes = await fetch(`https://${domain}/api/v2/tickets/password-change`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: newUser.user_id,
      mark_email_as_verified: true,
      includeEmailInRedirect: false,
    }),
  });

  // Capture the ticket URL so we can send it in our own custom email.
  // A ticket failure is non-fatal — the user is created and the admin can
  // resend the invite later. We log the error but still return success.
  let activationLink: string | null = null;
  let ticketError: string | null = null;
  if (ticketRes.ok) {
    const ticketData = await ticketRes.json().catch(() => ({}));
    activationLink = ticketData.ticket ?? null;
  } else {
    const ticketErr = await ticketRes.json().catch(() => ({}));
    ticketError = ticketErr.message || `HTTP ${ticketRes.status}`;
    console.error('Failed to create password-change ticket:', ticketError);
  }

  // Send the branded invite email via our own SMTP mailer (non-fatal).
  let emailSent = false;
  let emailError: string | null = null;
  if (activationLink) {
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
      ticketCreated: activationLink !== null,
      ticketError,
      emailSent,
      emailError,
    },
  });
}
