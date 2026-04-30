import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = String(email).trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@')) return null;
  return trimmed;
}

export function extractEmailDomain(email: string | null | undefined): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const at = normalized.lastIndexOf('@');
  if (at < 0) return null;
  const domain = normalized.slice(at + 1);
  return domain || null;
}

export function normalizePhone(phone: string | null | undefined, defaultCountry: 'US' = 'US'): string | null {
  if (!phone) return null;
  const raw = String(phone).trim();
  if (!raw) return null;
  try {
    const parsed = parsePhoneNumberFromString(raw, defaultCountry);
    if (parsed && parsed.isValid()) {
      return parsed.number;
    }
  } catch {
    // fall through
  }
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

export function normalizeCompany(company: string | null | undefined): string | null {
  if (!company) return null;
  const trimmed = String(company).trim().replace(/\s+/g, ' ');
  return trimmed.toLowerCase() || null;
}
