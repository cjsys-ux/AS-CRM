// Shared mock data for the Executive Overview redesign variants.
// The original ExecutiveOverview.tsx keeps its own inline copies; only the
// Editorial and Kinetic variants import from here.

export const healthIndicators = [
  { label: 'Cash Health', status: 'green', title: 'Cash: Strong', detail: '$142K balance, 30-day forecast positive' },
  { label: 'Revenue Pace', status: 'green', title: 'Revenue: +41% vs LY', detail: '$583K MTD' },
  { label: 'Pipeline', status: 'yellow', title: 'Pipeline: Adequate', detail: '3.2x coverage but 3 leads unassigned' },
  { label: 'Operations', status: 'yellow', title: 'Ops: 3 delays', detail: '18 in production, 3 behind schedule' },
  { label: 'Service', status: 'orange', title: 'Service: 3 urgent', detail: '1 Amazon DC issue needs escalation' },
] as const;

export const revPacingData = [
  { month: 'Jan', '2025': 380, current: 520, isProjected: false, target: 540, delta: '+37%' },
  { month: 'Feb', '2025': 410, current: 560, isProjected: false, target: 560, delta: '+37%' },
  { month: 'Mar', '2025': 412, current: 583, isProjected: false, target: 650, delta: '+41%' },
  { month: 'Apr', '2025': 440, current: 620, isProjected: true, target: 650, delta: '' },
  { month: 'May', '2025': 460, current: 640, isProjected: true, target: 660, delta: '' },
  { month: 'Jun', '2025': 480, current: 660, isProjected: true, target: 670, delta: '' },
  { month: 'Jul', '2025': 450, current: 640, isProjected: true, target: 660, delta: '' },
  { month: 'Aug', '2025': 470, current: 660, isProjected: true, target: 670, delta: '' },
  { month: 'Sep', '2025': 490, current: 680, isProjected: true, target: 680, delta: '' },
  { month: 'Oct', '2025': 510, current: 700, isProjected: true, target: 690, delta: '' },
  { month: 'Nov', '2025': 520, current: 710, isProjected: true, target: 700, delta: '' },
  { month: 'Dec', '2025': 500, current: 690, isProjected: true, target: 700, delta: '' },
];

export const concentrationData = [
  { month: 'Apr 25', ppe: 72, promo: 28 },
  { month: 'May', ppe: 73, promo: 27 },
  { month: 'Jun', ppe: 71, promo: 29 },
  { month: 'Jul', ppe: 74, promo: 26 },
  { month: 'Aug', ppe: 75, promo: 25 },
  { month: 'Sep', ppe: 73, promo: 27 },
  { month: 'Oct', ppe: 74, promo: 26 },
  { month: 'Nov', ppe: 72, promo: 28 },
  { month: 'Dec', ppe: 74, promo: 26 },
  { month: 'Jan 26', ppe: 75, promo: 25 },
  { month: 'Feb', ppe: 76, promo: 24 },
  { month: 'Mar', ppe: 77, promo: 23 },
];

export const cashSparkline = [
  { w: 1, v: 118 }, { w: 2, v: 112 }, { w: 3, v: 124 }, { w: 4, v: 119 },
  { w: 5, v: 128 }, { w: 6, v: 135 }, { w: 7, v: 130 }, { w: 8, v: 142 },
];

export const revSparkline = [
  { m: 1, v: 380 }, { m: 2, v: 420 }, { m: 3, v: 390 }, { m: 4, v: 440 },
  { m: 5, v: 460 }, { m: 6, v: 480 }, { m: 7, v: 450 }, { m: 8, v: 470 },
  { m: 9, v: 490 }, { m: 10, v: 510 }, { m: 11, v: 520 }, { m: 12, v: 583 },
];

export type ActionPriority = 'critical' | 'high' | 'normal';

export const actionItems: Array<{
  priority: ActionPriority;
  title: string;
  detail: string;
  actions: string[];
}> = [
  {
    priority: 'critical',
    title: 'Amazon DEN4 — PO not received (3 days)',
    detail: 'Denver DC reports PO#4521 not received. UPS shows delivered. Michael is filing a claim but Amazon may need a call from you if not resolved by tomorrow.',
    actions: ['Review Details'],
  },
  {
    priority: 'high',
    title: 'LOC Decision: Schedule bank meetings?',
    detail: 'Equipment debt at $179K, 9 months to payoff. Should we start bank conversations now with the 2024-2025 growth narrative, or wait for 2026 year-end financials?',
    actions: ['Start Now', 'Defer to Q4'],
  },
  {
    priority: 'high',
    title: 'The One Percent Media Performance Review',
    detail: '$2K/month, 1 lead generated in March, $0 closed. Referrals and upsells outperform at $0 cost. Recommend restructuring or replacing.',
    actions: ['Schedule Review', 'Continue as-is'],
  },
  {
    priority: 'high',
    title: 'Fairmont Hotels — Embroidery Delay',
    detail: 'Client event is April 18, decorator is 5 days behind. Tina needs authorization to expedite at additional $1,200 cost.',
    actions: ['Approve Expedite', 'Discuss with Tina'],
  },
  {
    priority: 'normal',
    title: 'Iron Bound Safety — Trademark Attorney Budget',
    detail: 'Legal structure for brand contracts was a 2026 priority. Need to allocate budget and select attorney. Estimated $15-25K.',
    actions: ['Schedule for April'],
  },
  {
    priority: 'normal',
    title: 'Hire Decision: Additional 1099 Sales Reps',
    detail: 'APEX recommends testing 2-3 independent reps in Q2. Zero fixed cost, commission only. Need your approval on commission structure and territories.',
    actions: ['Review Proposal'],
  },
];

export const keyDates = [
  {
    group: 'This Week (Mar 30 - Apr 5)',
    items: [
      { date: 'Mar 31', text: 'TX Oscar Project IHD (in-hands date)', value: '$75K', kind: 'neutral' as const },
      { date: 'Apr 1', text: 'Payroll', value: '$22.4K', kind: 'warn' as const },
      { date: 'Apr 1', text: 'Equipment payment to parents', value: '$20K', kind: 'warn' as const },
      { date: 'Apr 1', text: 'SBA EIDL payment', value: '$731', kind: 'warn' as const },
      { date: 'Apr 2', text: 'KSE Supplies shipment arrives at Turkana', value: '', kind: 'info' as const },
      { date: 'Apr 3', text: 'The One Percent Media monthly review', value: '', kind: 'neutral' as const },
    ],
  },
  {
    group: 'Next Week (Apr 6 - 12)',
    items: [
      { date: 'Apr 8', text: 'Arctic Trax sample ETA at Amazon for approval', value: '', kind: 'info' as const },
      { date: 'Apr 10', text: 'Amazon SKU decision expected (Safety Vests)', value: '$142K', kind: 'info' as const },
      { date: 'Apr 12', text: 'SC Promo ocean shipment ETA Long Beach', value: '', kind: 'info' as const },
    ],
  },
  {
    group: 'Apr 13 - 30',
    items: [
      { date: 'Apr 15', text: 'IPF payment expected', value: '$210,000', kind: 'good' as const },
      { date: 'Apr 15', text: 'Estimated sales tax filing', value: '', kind: 'warn' as const },
      { date: 'Apr 18', text: 'Fairmont Hotels event (embroidery must arrive by Apr 16)', value: '', kind: 'critical' as const },
      { date: 'Apr 20', text: 'CoreTex sunscreen deployment ship date', value: '', kind: 'info' as const },
      { date: 'Apr 25', text: 'KSE thermal blankets ship to Amazon DCs', value: '', kind: 'info' as const },
      { date: 'Apr 30', text: 'March financial close (Omar Consulting)', value: '', kind: 'neutral' as const },
    ],
  },
];

export const scorecardItems = [
  { goal: 'Monthly Revenue', target: '$650K', actual: '$583K', pct: 90, status: 'yellow' as const },
  { goal: 'Promo Revenue', target: '$180K', actual: '$135K', pct: 75, status: 'yellow' as const },
  { goal: 'New Clients', target: '4', actual: '2', pct: 50, status: 'red' as const },
  { goal: 'Equipment Payoff', target: '$20K/mo', actual: '$20K', pct: 100, status: 'green' as const },
  { goal: 'Concentration', target: '<65%', actual: '77%', pct: 0, status: 'red' as const },
  { goal: 'On-Time Delivery', target: '95%', actual: '91%', pct: 91, status: 'yellow' as const },
];

export const topMetrics = {
  cash: { value: 142350, ar: 487000, apDue: 216000, nwc: 497000, deltaWeek: 18000 },
  revenue: { mtd: 583000, ppeShare: 0.77, promoShare: 0.23, ppeAmt: 448000, promoAmt: 135000, lastYear: 412000, ytd: 1820000, ytdPctTarget: 0.87 },
  orders: { active: 34, production: 18, transit: 11, ready: 7, behind: 3 },
  issues: { open: 14, urgent: 3, amazonRelated: 5, slaPct: 87, avgResDays: 2.4 },
};
