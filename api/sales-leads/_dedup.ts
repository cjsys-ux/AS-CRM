import type { Db } from 'mongodb';
import { extractEmailDomain, normalizeCompany, normalizeEmail, normalizePhone } from './_normalize';

export interface DedupCandidate {
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  contactName?: string | null;
}

export interface DedupMatch {
  leadId: string;
  matchScore: number;
  reason: 'email' | 'phone' | 'domain+name' | 'company+domain';
  preview: {
    title?: string;
    company?: string;
    contactEmail?: string;
    contactName?: string;
    stage?: string;
    owner?: string;
  };
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  const prev = new Array(n + 1).fill(0).map((_, i) => i);
  const curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

export async function findDuplicates(db: Db, candidate: DedupCandidate, excludeLeadId?: string): Promise<DedupMatch[]> {
  const matches = new Map<string, DedupMatch>();
  const collection = db.collection('salesLeads');

  const normalizedEmail = normalizeEmail(candidate.email ?? null);
  const normalizedPhone = normalizePhone(candidate.phone ?? null);
  const emailDomain = extractEmailDomain(candidate.email ?? null);
  const companyKey = normalizeCompany(candidate.company ?? null);
  const contactNameLower = candidate.contactName ? candidate.contactName.trim().toLowerCase() : null;

  const upsert = (id: string, match: DedupMatch) => {
    if (excludeLeadId && id === excludeLeadId) return;
    const existing = matches.get(id);
    if (!existing || existing.matchScore < match.matchScore) {
      matches.set(id, match);
    }
  };

  const previewOf = (doc: any): DedupMatch['preview'] => ({
    title: doc.title,
    company: doc.company,
    contactEmail: doc.contactEmail,
    contactName: doc.contactName,
    stage: doc.stage,
    owner: doc.owner,
  });

  if (normalizedEmail) {
    const docs = await collection
      .find({ normalizedEmail })
      .project({ title: 1, company: 1, contactEmail: 1, contactName: 1, stage: 1, owner: 1 })
      .toArray();
    for (const doc of docs) {
      upsert(doc._id.toString(), {
        leadId: doc._id.toString(),
        matchScore: 100,
        reason: 'email',
        preview: previewOf(doc),
      });
    }
  }

  if (normalizedPhone) {
    const docs = await collection
      .find({ normalizedPhone })
      .project({ title: 1, company: 1, contactEmail: 1, contactName: 1, stage: 1, owner: 1 })
      .toArray();
    for (const doc of docs) {
      upsert(doc._id.toString(), {
        leadId: doc._id.toString(),
        matchScore: 85,
        reason: 'phone',
        preview: previewOf(doc),
      });
    }
  }

  if (emailDomain && contactNameLower) {
    const docs = await collection
      .find({ emailDomain })
      .project({ title: 1, company: 1, contactEmail: 1, contactName: 1, stage: 1, owner: 1 })
      .limit(50)
      .toArray();
    for (const doc of docs) {
      const otherName = (doc.contactName ?? '').toString().trim().toLowerCase();
      if (otherName && levenshtein(otherName, contactNameLower) <= 2) {
        upsert(doc._id.toString(), {
          leadId: doc._id.toString(),
          matchScore: 70,
          reason: 'domain+name',
          preview: previewOf(doc),
        });
      }
    }
  }

  if (emailDomain && companyKey) {
    const docs = await collection
      .find({ emailDomain })
      .project({ title: 1, company: 1, contactEmail: 1, contactName: 1, stage: 1, owner: 1 })
      .limit(50)
      .toArray();
    for (const doc of docs) {
      const otherCompany = normalizeCompany(doc.company);
      if (otherCompany && otherCompany === companyKey) {
        upsert(doc._id.toString(), {
          leadId: doc._id.toString(),
          matchScore: 60,
          reason: 'company+domain',
          preview: previewOf(doc),
        });
      }
    }
  }

  return Array.from(matches.values()).sort((a, b) => b.matchScore - a.matchScore);
}
