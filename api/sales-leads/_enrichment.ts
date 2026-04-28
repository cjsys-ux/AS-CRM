import dns from 'node:dns/promises';
import type { Db } from 'mongodb';
import disposableDomainsList from 'disposable-email-domains';
import { extractEmailDomain, normalizeCompany } from './_normalize';
import type { EmailType } from './_scoring';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'ymail.com', 'rocketmail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'hotmail.co.uk',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'aim.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'gmx.com', 'gmx.net', 'gmx.de',
  'zoho.com', 'mail.com', 'fastmail.com', 'tutanota.com', 'yandex.com', 'yandex.ru', 'mail.ru',
]);

const DISPOSABLE_DOMAINS = new Set<string>(disposableDomainsList as string[]);

const DOMAIN_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface DomainCacheEntry {
  domain: string;
  emailType: EmailType;
  hasMx: boolean;
  refreshedAt: Date;
}

async function classifyDomain(db: Db, domain: string): Promise<{ emailType: EmailType; hasMx: boolean }> {
  if (FREE_EMAIL_DOMAINS.has(domain)) return { emailType: 'personal', hasMx: true };
  if (DISPOSABLE_DOMAINS.has(domain)) return { emailType: 'disposable', hasMx: true };

  const cache = db.collection<DomainCacheEntry>('domainCache');
  const now = Date.now();
  const cached = await cache.findOne({ domain });
  if (cached && now - new Date(cached.refreshedAt).getTime() < DOMAIN_CACHE_TTL_MS) {
    return { emailType: cached.emailType, hasMx: cached.hasMx };
  }

  let hasMx = false;
  try {
    const records = await dns.resolveMx(domain);
    hasMx = Array.isArray(records) && records.length > 0;
  } catch {
    hasMx = false;
  }

  const emailType: EmailType = hasMx ? 'business' : 'unknown';
  await cache.updateOne(
    { domain },
    { $set: { domain, emailType, hasMx, refreshedAt: new Date() } },
    { upsert: true },
  );
  return { emailType, hasMx };
}

function deriveCompanyFromDomain(domain: string): string | null {
  if (FREE_EMAIL_DOMAINS.has(domain) || DISPOSABLE_DOMAINS.has(domain)) return null;
  const parts = domain.split('.');
  if (parts.length < 2) return null;
  let core = parts[0];
  if (['mail', 'smtp', 'mx', 'email'].includes(core) && parts.length >= 3) {
    core = parts[1];
  }
  if (!core) return null;
  return core.charAt(0).toUpperCase() + core.slice(1);
}

export interface EnrichmentInput {
  email?: string | null;
  company?: string | null;
}

export interface EnrichmentOutput {
  emailDomain: string | null;
  emailType: EmailType;
  enrichedCompany: string | null;
  isExistingCustomer: boolean;
  matchedCustomerId: string | null;
  matchedContactId: string | null;
  enrichmentRunAt: string;
  enrichmentVersion: number;
}

export const ENRICHMENT_VERSION = 1;

export async function enrich(db: Db, input: EnrichmentInput): Promise<EnrichmentOutput> {
  const emailDomain = extractEmailDomain(input.email ?? null);
  let emailType: EmailType = 'unknown';
  let enrichedCompany: string | null = null;

  if (emailDomain) {
    const cls = await classifyDomain(db, emailDomain);
    emailType = cls.emailType;
    enrichedCompany = deriveCompanyFromDomain(emailDomain);
  }

  let isExistingCustomer = false;
  let matchedCustomerId: string | null = null;
  let matchedContactId: string | null = null;

  if (input.email) {
    const lower = input.email.trim().toLowerCase();

    const contact = await db.collection('contacts').findOne(
      { email: { $regex: `^${escapeRegex(lower)}$`, $options: 'i' } },
      { projection: { _id: 1, customerId: 1, companyId: 1 } },
    );
    if (contact) {
      isExistingCustomer = true;
      matchedContactId = contact._id.toString();
      matchedCustomerId = (contact.customerId || contact.companyId || null)?.toString() ?? null;
    } else if (emailDomain && emailType === 'business') {
      const companyKey = normalizeCompany(input.company ?? null);
      const customer = companyKey
        ? await db.collection('customers').findOne(
            {
              $or: [
                { domain: emailDomain },
                { website: { $regex: escapeRegex(emailDomain), $options: 'i' } },
                { name: { $regex: `^${escapeRegex(companyKey)}$`, $options: 'i' } },
              ],
            },
            { projection: { _id: 1 } },
          )
        : null;
      if (customer) {
        isExistingCustomer = true;
        matchedCustomerId = customer._id.toString();
      }
    }
  }

  return {
    emailDomain,
    emailType,
    enrichedCompany,
    isExistingCustomer,
    matchedCustomerId,
    matchedContactId,
    enrichmentRunAt: new Date().toISOString(),
    enrichmentVersion: ENRICHMENT_VERSION,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
