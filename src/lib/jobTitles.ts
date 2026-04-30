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

// Titles whose users are eligible to own a deal in the Sales module. Admins
// (the title) are included alongside Salesperson and Sales Manager because
// admins commonly own deals too — the role-level Admin / Super Admin bypass
// in isAdminRole below covers permission-tier admins separately.
export const SALES_TITLES: readonly JobTitle[] = ['Salesperson', 'Sales Manager', 'Admin'];

export function isSalesTitle(title: string | null | undefined): boolean {
  return !!title && (SALES_TITLES as readonly string[]).includes(title);
}

// Roles that bypass job-title gating — admins act as if they hold every job
// title, so they always appear in pickers like the Sales deal-owner dropdown.
export const ADMIN_ROLES = ['Admin', 'Super Admin'] as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

// Is this user eligible to be selected as a deal owner? True for admins
// (regardless of jobTitle) or anyone tagged with a sales-facing title.
export function isSalesEligibleUser(
  user: { role?: string | null; jobTitle?: string | null }
): boolean {
  if (isAdminRole(user.role)) return true;
  return isSalesTitle(user.jobTitle);
}
