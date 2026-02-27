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

  const host = process.env.OUTLOOK_SMTP_HOST;
  const port = process.env.OUTLOOK_SMTP_PORT;
  const user = process.env.OUTLOOK_SMTP_USER;
  const pass = process.env.OUTLOOK_SMTP_PASSWORD;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP environment variables are not fully configured.');
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: process.env.OUTLOOK_SMTP_SECURE === 'true',
    requireTLS: true,
    auth: { user, pass },
  });

  return cachedTransporter;
}
