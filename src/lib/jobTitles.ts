// Canonical list of user job titles. Persisted on the Auth0 user_metadata.jobTitle
// field. SALES_TITLES gates which users appear in the Sales module's deal-owner
// pickers.

export const JOB_TITLES = [
  'Salesperson',
  'Sales Manager',
  'Operations',
  'Designer',
  'Customer Service',
  'Admin',
  'Other',
] as const;

export type JobTitle = (typeof JOB_TITLES)[number];

export const DEFAULT_JOB_TITLE: JobTitle = 'Salesperson';

// Titles whose users are eligible to own a deal in the Sales module.
export const SALES_TITLES: readonly JobTitle[] = ['Salesperson', 'Sales Manager'];

export function isSalesTitle(title: string | null | undefined): boolean {
  return !!title && (SALES_TITLES as readonly string[]).includes(title);
}
