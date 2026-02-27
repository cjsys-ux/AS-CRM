/**
 * Creates a Nodemailer SMTP transporter using credentials from environment
 * variables and caches it in module-level memory for reuse across warm
 * Lambda invocations.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let cachedTransporter: Transporter | null = null;

export function getMailer(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP environment variables are not fully configured.');
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465, // true for port 465 (SMTPS), false for 587 (STARTTLS)
    auth: { user, pass },
  });

  return cachedTransporter;
}
