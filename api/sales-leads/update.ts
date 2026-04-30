import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';
import { extractEmailDomain, normalizeEmail, normalizePhone } from './_normalize';
import { computeScore, type EmailType, type SourceCategory } from './_scoring';

const ALLOWED_FIELDS = [
  'title', 'company', 'companyId', 'contactName', 'contactFirstName', 'contactLastName',
  'contactEmail', 'contactPhone', 'contactId', 'amount', 'stage', 'source', 'productType',
  'inHandsDate', 'owner', 'ownerInitials', 'notes', 'probability', 'quantity', 'tags',
  'documents', 'lastActivity',
  'sourceCategory', 'sourceDetail', 'disqualifiedReason',
  'emailType', 'isExistingCustomer', 'enrichedCompany',
  'sourceOrderId', 'sourceOrderNumber', 'orderLinkedAt',
  'lineItems', 'shipToAddresses', 'amountIsManual',
];

const SCORE_TRIGGER_FIELDS = new Set([
  'contactEmail', 'contactPhone', 'amount', 'sourceCategory',
  'disqualifiedReason', 'emailType', 'isExistingCustomer',
]);

const VALID_SOURCE_CATEGORIES: SourceCategory[] = [
  'organic', 'paid', 'referral', 'direct', 'email', 'social', 'outbound',
];

// Fields whose user-facing edits we surface in the activity feed.
// Excluded on purpose:
//   - stage / disqualifiedReason → already logged via stage-change.
//   - documents → logged separately as file-upload.
//   - probability, lastActivity → auto-bumped alongside stage.
//   - ownerInitials → derived from owner.
//   - companyId / contactId → opaque ids, not user-meaningful.
//   - emailType / isExistingCustomer / enrichedCompany / score* /
//     normalized* / enrichmentRunAt / sourceOrderId* → enrichment / link
//     bookkeeping, not direct edits.
const EDITABLE_LOGGABLE_FIELDS: Record<string, string> = {
  title: 'Title',
  company: 'Company',
  contactName: 'Contact name',
  contactFirstName: 'First name',
  contactLastName: 'Last name',
  contactEmail: 'Email',
  contactPhone: 'Phone',
  amount: 'Amount',
  source: 'Lead source',
  sourceCategory: 'Source category',
  sourceDetail: 'Source detail',
  productType: 'Product',
  inHandsDate: 'In-hands date',
  owner: 'Owner',
  notes: 'Notes',
  quantity: 'Quantity',
  tags: 'Tags',
};

function valuesEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

function summarizeValue(field: string, v: any): string {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.length === 0 ? '—' : `${v.length} item${v.length === 1 ? '' : 's'}`;
  if (field === 'amount') {
    const n = Number(v);
    return Number.isFinite(n) ? `$${n.toLocaleString()}` : String(v);
  }
  if (field === 'inHandsDate') {
    const d = new Date(String(v));
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const s = String(v);
  return s.length > 60 ? s.slice(0, 57) + '…' : s;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, ...fields } = req.body ?? {};
  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }

  if (
    fields.sourceCategory !== undefined &&
    fields.sourceCategory !== null &&
    !VALID_SOURCE_CATEGORIES.includes(fields.sourceCategory)
  ) {
    return res.status(400).json({ error: `sourceCategory must be one of: ${VALID_SOURCE_CATEGORIES.join(', ')}` });
  }

  const setPayload: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  let scoreNeedsRecompute = false;

  for (const key of ALLOWED_FIELDS) {
    if (key in fields && fields[key] !== undefined) {
      setPayload[key] = fields[key];
      if (SCORE_TRIGGER_FIELDS.has(key)) scoreNeedsRecompute = true;
    }
  }

  if ('contactEmail' in fields) {
    setPayload.normalizedEmail = normalizeEmail(fields.contactEmail);
    setPayload.emailDomain = extractEmailDomain(fields.contactEmail);
  }
  if ('contactPhone' in fields) {
    setPayload.normalizedPhone = normalizePhone(fields.contactPhone);
  }

  if ('stage' in fields) {
    setPayload.lastActivity = new Date().toISOString();
  }

  // Auto-derive amount from line items when lineItems changes and the caller
  // didn't also explicitly send amount or set amountIsManual.
  if ('lineItems' in fields && Array.isArray(fields.lineItems) && !('amount' in fields)) {
    try {
      const sum = (fields.lineItems as any[]).reduce((acc, item) => {
        const t = Number(item?.total);
        return acc + (Number.isFinite(t) ? t : 0);
      }, 0);
      // Only auto-set if the existing amount wasn't manually overridden.
      // We let amountIsManual gate this; default false means auto-derive.
      // (Will check existing.amountIsManual below after fetch.)
      (setPayload as any).__autoDeriveAmount = sum;
    } catch { /* non-fatal */ }
  }

  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }

  try {
    const db = await getDb();
    const collection = db.collection('salesLeads');

    // Single fetch of existing — used for closed-lost validation, score
    // recompute baseline, and activity-diff comparison.
    const existing = await collection.findOne(filter);
    if (!existing) {
      return res.status(404).json({ error: 'Sales lead not found.' });
    }

    if (fields.stage === 'closed-lost') {
      const incomingReason = setPayload.disqualifiedReason ?? existing.disqualifiedReason ?? null;
      if (!incomingReason) {
        return res.status(400).json({ error: 'disqualifiedReason is required when stage is closed-lost.' });
      }
    }

    if (scoreNeedsRecompute) {
      const merged = { ...existing, ...setPayload } as Record<string, unknown>;
      const { score, breakdown } = computeScore({
        sourceCategory: (merged.sourceCategory as SourceCategory | null) ?? null,
        emailType: (merged.emailType as EmailType | null) ?? 'unknown',
        normalizedPhone: (merged.normalizedPhone as string | null) ?? null,
        amount: typeof merged.amount === 'number' ? (merged.amount as number) : Number(merged.amount) || 0,
        isExistingCustomer: Boolean(merged.isExistingCustomer),
        disqualifiedReason: (merged.disqualifiedReason as string | null) ?? null,
      });
      setPayload.score = score;
      setPayload.scoreBreakdown = breakdown;
      setPayload.scoreUpdatedAt = new Date().toISOString();
    }

    const beforeStage: string | null = (existing.stage as string | null) ?? null;

    // Apply auto-derived amount if the existing record isn't manually pinned.
    if ('__autoDeriveAmount' in setPayload) {
      const auto = (setPayload as any).__autoDeriveAmount;
      delete (setPayload as any).__autoDeriveAmount;
      if (!existing.amountIsManual) {
        setPayload.amount = auto;
      }
    }

    const result = await collection.updateOne(filter, { $set: setPayload });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Sales lead not found.' });
    }

    // ─── Activity logging (all soft-fail; never blocks the primary write) ───
    const leadIdStr = String(id);
    const stageChanged = 'stage' in fields && fields.stage !== beforeStage;

    // Line item add/remove diff
    if ('lineItems' in fields && Array.isArray(fields.lineItems)) {
      try {
        const before: any[] = Array.isArray(existing.lineItems) ? (existing.lineItems as any[]) : [];
        const after: any[] = fields.lineItems;
        const beforeIds = new Set(before.map((x) => x?.id).filter(Boolean));
        const afterIds = new Set(after.map((x) => x?.id).filter(Boolean));
        const added = after.filter((x) => x?.id && !beforeIds.has(x.id));
        const removed = before.filter((x) => x?.id && !afterIds.has(x.id));
        for (const item of added) {
          await db.collection('lead_activities').insertOne({
            leadId: leadIdStr,
            type: 'lineitem-added',
            content: `Added line item: ${item.name ?? 'Item'}`,
            details: `${item.quantity ?? 0} × $${Number(item.unitPrice ?? 0).toLocaleString()} = $${Number(item.total ?? 0).toLocaleString()}${item.decoration ? '\nDecoration: ' + item.decoration : ''}`,
            user: 'You',
            userInitials: 'YO',
            timestamp: new Date().toISOString(),
            createdAt: new Date(),
          });
        }
        for (const item of removed) {
          await db.collection('lead_activities').insertOne({
            leadId: leadIdStr,
            type: 'lineitem-removed',
            content: `Removed line item: ${item.name ?? 'Item'}`,
            user: 'You',
            userInitials: 'YO',
            timestamp: new Date().toISOString(),
            createdAt: new Date(),
          });
        }
      } catch { /* non-fatal */ }
    }

    // Ship-to add/remove diff
    if ('shipToAddresses' in fields && Array.isArray(fields.shipToAddresses)) {
      try {
        const before: any[] = Array.isArray(existing.shipToAddresses) ? (existing.shipToAddresses as any[]) : [];
        const after: any[] = fields.shipToAddresses;
        const beforeIds = new Set(before.map((x) => x?.id).filter(Boolean));
        const afterIds = new Set(after.map((x) => x?.id).filter(Boolean));
        const added = after.filter((x) => x?.id && !beforeIds.has(x.id));
        const removed = before.filter((x) => x?.id && !afterIds.has(x.id));
        for (const addr of added) {
          const cityState = [addr.city, addr.state].filter(Boolean).join(', ');
          await db.collection('lead_activities').insertOne({
            leadId: leadIdStr,
            type: 'shipto-added',
            content: `Added ship-to: ${addr.label || cityState || 'Address'}`,
            details: [addr.recipient, addr.line1, cityState, addr.zip].filter(Boolean).join('\n'),
            user: 'You',
            userInitials: 'YO',
            timestamp: new Date().toISOString(),
            createdAt: new Date(),
          });
        }
        for (const addr of removed) {
          await db.collection('lead_activities').insertOne({
            leadId: leadIdStr,
            type: 'shipto-removed',
            content: `Removed ship-to: ${addr.label || addr.city || 'Address'}`,
            user: 'You',
            userInitials: 'YO',
            timestamp: new Date().toISOString(),
            createdAt: new Date(),
          });
        }
      } catch { /* non-fatal */ }
    }

    // Stage transitions
    if (stageChanged) {
      try {
        await db.collection('lead_activities').insertOne({
          leadId: leadIdStr,
          type: 'stage-change',
          content: `Stage changed${beforeStage ? ` from ${beforeStage}` : ''} to ${fields.stage}`,
          fromStage: beforeStage,
          toStage: fields.stage,
          user: 'System',
          userInitials: 'SY',
          timestamp: new Date().toISOString(),
          createdAt: new Date(),
        });
      } catch { /* non-fatal */ }
    }

    // File uploads (newly-added documents only)
    if ('documents' in fields) {
      try {
        const before: any[] = Array.isArray(existing.documents) ? (existing.documents as any[]) : [];
        const after: any[] = Array.isArray(fields.documents) ? fields.documents : [];
        const beforeKey = (d: any) => `${d?.name ?? ''}|${d?.size ?? ''}|${d?.type ?? ''}`;
        const beforeKeys = new Set(before.map(beforeKey));
        const added = after.filter(d => !beforeKeys.has(beforeKey(d)));
        for (const doc of added) {
          await db.collection('lead_activities').insertOne({
            leadId: leadIdStr,
            type: 'file-upload',
            content: `Uploaded ${doc?.name ?? 'a file'}`,
            details: doc?.size ? `${(Number(doc.size) / 1024).toFixed(1)} KB${doc?.type ? ' · ' + doc.type : ''}` : undefined,
            user: 'You',
            userInitials: 'YO',
            timestamp: new Date().toISOString(),
            createdAt: new Date(),
          });
        }
      } catch { /* non-fatal */ }
    }

    // User-meaningful field edits (single grouped activity per PATCH).
    try {
      const changes: Array<{ field: string; label: string; from: any; to: any }> = [];
      for (const [field, label] of Object.entries(EDITABLE_LOGGABLE_FIELDS)) {
        if (!(field in fields)) continue;
        const before = (existing as any)[field];
        const after = (fields as any)[field];
        if (valuesEqual(before, after)) continue;
        changes.push({ field, label, from: before, to: after });
      }
      if (changes.length > 0) {
        let content: string;
        let details: string | undefined;
        if (changes.length === 1) {
          const c = changes[0];
          content = `Changed ${c.label}: ${summarizeValue(c.field, c.from)} → ${summarizeValue(c.field, c.to)}`;
        } else if (changes.length <= 3) {
          content = `Updated ${changes.map(c => c.label).join(', ')}`;
          details = changes.map(c => `${c.label}: ${summarizeValue(c.field, c.from)} → ${summarizeValue(c.field, c.to)}`).join('\n');
        } else {
          content = `Updated ${changes.length} fields`;
          details = changes.map(c => `${c.label}: ${summarizeValue(c.field, c.from)} → ${summarizeValue(c.field, c.to)}`).join('\n');
        }
        await db.collection('lead_activities').insertOne({
          leadId: leadIdStr,
          type: 'edit',
          content,
          details,
          user: 'You',
          userInitials: 'YO',
          timestamp: new Date().toISOString(),
          createdAt: new Date(),
        });
      }
    } catch { /* non-fatal */ }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    if (error?.code === 11000 && error?.keyPattern?.normalizedEmail) {
      return res.status(409).json({ error: 'Another lead already uses this email address.' });
    }
    const message = error instanceof Error ? error.message : 'Failed to update sales lead.';
    return res.status(500).json({ error: message });
  }
}
