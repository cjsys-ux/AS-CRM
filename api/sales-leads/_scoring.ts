export type SourceCategory =
  | 'organic'
  | 'paid'
  | 'referral'
  | 'direct'
  | 'email'
  | 'social'
  | 'outbound';

export type EmailType = 'business' | 'personal' | 'disposable' | 'unknown';

export interface ScoreInput {
  sourceCategory?: SourceCategory | null;
  emailType?: EmailType | null;
  normalizedPhone?: string | null;
  amount?: number | null;
  isExistingCustomer?: boolean | null;
  disqualifiedReason?: string | null;
}

export interface ScoreBreakdown {
  source: number;
  email: number;
  phone: number;
  amount: number;
  existingCustomer: number;
  disposablePenalty: number;
  disqualifiedPenalty: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

const SOURCE_WEIGHTS: Record<SourceCategory, number> = {
  referral: 25,
  organic: 20,
  paid: 15,
  outbound: 12,
  direct: 10,
  email: 8,
  social: 5,
};

export function computeScore(input: ScoreInput): ScoreResult {
  const breakdown: ScoreBreakdown = {
    source: input.sourceCategory ? SOURCE_WEIGHTS[input.sourceCategory] ?? 0 : 0,
    email: input.emailType === 'business' ? 15 : input.emailType === 'personal' ? 5 : 0,
    phone: input.normalizedPhone ? 10 : 0,
    amount:
      typeof input.amount === 'number' && input.amount >= 5000
        ? 20
        : typeof input.amount === 'number' && input.amount >= 1000
        ? 10
        : 0,
    existingCustomer: input.isExistingCustomer ? 15 : 0,
    disposablePenalty: input.emailType === 'disposable' ? -30 : 0,
    disqualifiedPenalty: input.disqualifiedReason ? -50 : 0,
  };

  const total =
    breakdown.source +
    breakdown.email +
    breakdown.phone +
    breakdown.amount +
    breakdown.existingCustomer +
    breakdown.disposablePenalty +
    breakdown.disqualifiedPenalty;

  return {
    score: Math.max(0, Math.min(100, total)),
    breakdown,
  };
}

export function scoreTier(score: number): 'cold' | 'warm' | 'hot' {
  if (score >= 71) return 'hot';
  if (score >= 41) return 'warm';
  return 'cold';
}
