import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticator } from 'otplib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, secret } = req.body ?? {};
  if (!code || !secret) {
    return res.status(400).json({ error: 'code and secret are required.' });
  }

  const isValid = authenticator.verify({ token: code, secret });
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid code. Please try again.' });
  }

  return res.status(200).json({ success: true });
}
