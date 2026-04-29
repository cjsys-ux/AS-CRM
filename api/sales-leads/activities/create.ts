import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_mongodb';

export const ACTIVITY_TYPES = [
  'created', 'stage-change', 'note', 'task', 'call', 'email', 'order-linked', 'system',
] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    leadId,
    type,
    content,
    details,
    user,
    userInitials,
    fromStage,
    toStage,
    taskCompleted,
    taskDueDate,
    orderId,
    orderNumber,
  } = req.body ?? {};

  if (!leadId || typeof leadId !== 'string') {
    return res.status(400).json({ error: 'leadId is required.' });
  }
  if (!type || !ACTIVITY_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${ACTIVITY_TYPES.join(', ')}` });
  }
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content is required.' });
  }

  try {
    const db = await getDb();
    const now = new Date();
    const doc = {
      leadId,
      type,
      content,
      details: typeof details === 'string' ? details : '',
      user: typeof user === 'string' && user.trim() ? user : 'You',
      userInitials: typeof userInitials === 'string' && userInitials.trim() ? userInitials.toUpperCase().slice(0, 2) : 'YO',
      timestamp: now.toISOString(),
      createdAt: now,
      ...(fromStage ? { fromStage } : {}),
      ...(toStage ? { toStage } : {}),
      ...(typeof taskCompleted === 'boolean' ? { taskCompleted } : {}),
      ...(taskDueDate ? { taskDueDate } : {}),
      ...(orderId ? { orderId } : {}),
      ...(orderNumber ? { orderNumber } : {}),
    };
    const result = await db.collection('lead_activities').insertOne(doc);
    return res.status(201).json({
      success: true,
      activity: { id: result.insertedId.toString(), ...doc },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create activity.';
    return res.status(500).json({ error: message });
  }
}
