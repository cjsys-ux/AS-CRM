import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMailer } from '../_mailer';
import { getDb } from '../_mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html, text, leadId, userInitials, user } = req.body ?? {};

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: 'to, subject, and either html or text are required.' });
  }

  const from = process.env.SMTP_FROM;
  if (!from) {
    return res.status(500).json({ error: 'SMTP_FROM is not configured on the server.' });
  }

  let mailer: ReturnType<typeof getMailer>;
  try {
    mailer = getMailer();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Mailer configuration error: ${message}` });
  }

  try {
    await mailer.sendMail({ from, to, subject, html, text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(502).json({ error: `Failed to send email: ${message}` });
  }

  // Soft-fail activity log when a lead context was provided.
  if (typeof leadId === 'string' && leadId.trim()) {
    try {
      const db = await getDb();
      const bodyText = typeof text === 'string' ? text : (typeof html === 'string' ? html.replace(/<[^>]*>/g, ' ') : '');
      await db.collection('lead_activities').insertOne({
        leadId,
        type: 'email',
        content: `Email sent to ${to}: ${subject}`,
        details: bodyText.slice(0, 800),
        user: typeof user === 'string' && user ? user : 'You',
        userInitials: typeof userInitials === 'string' && userInitials ? userInitials.toUpperCase().slice(0, 2) : 'YO',
        timestamp: new Date().toISOString(),
        createdAt: new Date(),
      });
    } catch { /* non-fatal */ }
  }

  return res.status(200).json({ success: true });
}
