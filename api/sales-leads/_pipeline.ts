import type { Db } from 'mongodb';
import { extractEmailDomain, normalizeEmail, normalizePhone } from './_normalize';
import { computeScore, type SourceCategory } from './_scoring';
import { enrich } from './_enrichment';
import { findDuplicates, type DedupMatch } from './_dedup';

export interface RawLeadInput {
  title?: string;
  company?: string | null;
  companyId?: string | null;
  contactName?: string | null;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactId?: string | null;
  amount?: number | string | null;
  stage?: string | null;
  source?: string | null;
  sourceCategory?: SourceCategory | null;
  sourceDetail?: string | null;
  productType?: string | null;
  inHandsDate?: string | null;
  owner?: string | null;
  ownerInitials?: string | null;
  notes?: string | null;
  probability?: number | string | null;
  quantity?: number | string | null;
  tags?: string[] | null;
  documents?: any[] | null;
  disqualifiedReason?: string | null;
  // Attribution (Phase 2 — only set on public capture)
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string } | null;
  referrer?: string | null;
  landingPage?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  capturedAt?: string | null;
  captureFormId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface PipelineResult {
  doc: Record<string, unknown>;
  duplicates: DedupMatch[];
  exactEmailMatch: DedupMatch | null;
}

const VALID_SOURCE_CATEGORIES: SourceCategory[] = [
  'organic', 'paid', 'referral', 'direct', 'email', 'social', 'outbound',
];

/**
 * Run the lead-creation pipeline: normalize → enrich → dedup → score → return
 * the prepared document plus any duplicate matches the caller should react to.
 *
 * The caller decides what to do with duplicates:
 *  - Public capture endpoint: silently merge into the exact-email match.
 *  - Authenticated UI create: 409 with the duplicate id.
 *
 * This function never writes to the DB.
 */
export async function runPipeline(db: Db, input: RawLeadInput): Promise<PipelineResult> {
  const normalizedEmail = normalizeEmail(input.contactEmail ?? null);
  const normalizedPhone = normalizePhone(input.contactPhone ?? null);
  const emailDomain = extractEmailDomain(input.contactEmail ?? null);

  const enrichment = await enrich(db, {
    email: input.contactEmail ?? null,
    company: input.company ?? null,
  });

  const duplicates = await findDuplicates(db, {
    email: input.contactEmail ?? null,
    phone: input.contactPhone ?? null,
    company: input.company ?? null,
    contactName: input.contactName
      ?? `${input.contactFirstName ?? ''} ${input.contactLastName ?? ''}`.trim(),
  });
  const exactEmailMatch = duplicates.find((m) => m.matchScore >= 100) ?? null;

  const sourceCategory =
    input.sourceCategory && VALID_SOURCE_CATEGORIES.includes(input.sourceCategory)
      ? input.sourceCategory
      : null;

  const numericAmount = typeof input.amount === 'number' ? input.amount : Number(input.amount) || 0;

  const { score, breakdown } = computeScore({
    sourceCategory,
    emailType: enrichment.emailType,
    normalizedPhone,
    amount: numericAmount,
    isExistingCustomer: enrichment.isExistingCustomer,
    disqualifiedReason: input.disqualifiedReason ?? null,
  });

  const now = new Date().toISOString();
  const incomingStage = input.stage ?? 'lead-received';

  const doc: Record<string, unknown> = {
    title: input.title ?? '',
    company: input.company ?? enrichment.enrichedCompany ?? '',
    companyId: input.companyId ?? enrichment.matchedCustomerId ?? null,
    contactName: input.contactName
      ?? `${input.contactFirstName ?? ''} ${input.contactLastName ?? ''}`.trim(),
    contactFirstName: input.contactFirstName ?? '',
    contactLastName: input.contactLastName ?? '',
    contactEmail: input.contactEmail ?? '',
    contactPhone: input.contactPhone ?? '',
    contactId: input.contactId ?? enrichment.matchedContactId ?? null,
    amount: numericAmount,
    stage: incomingStage,
    source: input.source ?? 'Website',
    sourceCategory,
    sourceDetail: input.sourceDetail ?? null,
    productType: input.productType ?? 'Apparel',
    inHandsDate: input.inHandsDate ?? '',
    owner: input.owner ?? '',
    ownerInitials: input.ownerInitials ?? '',
    notes: input.notes ?? '',
    probability:
      typeof input.probability === 'number'
        ? input.probability
        : Number(input.probability) || 10,
    quantity: typeof input.quantity === 'number' ? input.quantity : Number(input.quantity) || 0,
    tags: Array.isArray(input.tags) ? input.tags : [],
    documents: Array.isArray(input.documents) ? input.documents : [],
    normalizedEmail,
    normalizedPhone,
    emailDomain,
    emailType: enrichment.emailType,
    enrichedCompany: enrichment.enrichedCompany,
    enrichmentRunAt: enrichment.enrichmentRunAt,
    enrichmentVersion: enrichment.enrichmentVersion,
    isExistingCustomer: enrichment.isExistingCustomer,
    formSubmitCount: 0,
    score,
    scoreBreakdown: breakdown,
    scoreUpdatedAt: now,
    disqualifiedReason: input.disqualifiedReason ?? null,
    // Attribution (will be {} / null when called from authed UI)
    utm: input.utm ?? null,
    referrer: input.referrer ?? null,
    landingPage: input.landingPage ?? null,
    gclid: input.gclid ?? null,
    fbclid: input.fbclid ?? null,
    capturedAt: input.capturedAt ?? null,
    captureFormId: input.captureFormId ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: now,
    lastActivity: now,
    updatedAt: now,
  };

  return { doc, duplicates, exactEmailMatch };
}
