// ─── Project Number Utilities ───
// ADP-XXXXX = Amazon Distribution Project (Pipeline)
// PP-XXXXX  = Promo Project (Orders)
// Legacy PRJ-XXXXX treated as ADP-

export type ProjectNumberType = 'adp' | 'pp' | 'unknown';

export function getProjectNumberType(pn: string): ProjectNumberType {
  if (!pn) return 'unknown';
  if (pn.startsWith('ADP-') || pn.startsWith('PRJ-')) return 'adp';
  if (pn.startsWith('PP-')) return 'pp';
  return 'unknown';
}

export function getProjectBadgeClasses(pn: string): string {
  const type = getProjectNumberType(pn);
  if (type === 'pp') {
    return 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300';
  }
  // ADP / default — emerald
  return 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300';
}

export function getProjectBadgeStaticClasses(pn: string): string {
  const type = getProjectNumberType(pn);
  if (type === 'pp') {
    return 'text-blue-700 bg-blue-50 border-blue-200';
  }
  return 'text-emerald-700 bg-emerald-50 border-emerald-200';
}

export function getProjectIconColor(pn: string): string {
  const type = getProjectNumberType(pn);
  if (type === 'pp') return 'text-blue-500';
  return 'text-emerald-500';
}

export function getDeepLinkKey(pn: string): string {
  const type = getProjectNumberType(pn);
  if (type === 'pp') return 'orders_deep_link_projectNumber';
  return 'pipeline_deep_link_projectNumber';
}

export function getDeepLinkTarget(pn: string): string {
  const type = getProjectNumberType(pn);
  if (type === 'pp') return 'orders';
  return 'pipeline';
}
