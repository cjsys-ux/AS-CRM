import { motion } from 'motion/react';
import { useState } from 'react';
import { DollarSign, TrendingUp, Package, AlertTriangle, Landmark, ArrowUpRight, Info, Calendar, Clock, ChevronRight, CheckCircle2, Shield, Target, Users, FileText, Zap, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, ReferenceLine, AreaChart, Area } from 'recharts';

const healthIndicators = [
  { label: 'Cash Health', status: 'green', title: 'Cash: Strong', detail: '$142K balance, 30-day forecast positive' },
  { label: 'Revenue Pace', status: 'green', title: 'Revenue: +41% vs LY', detail: '$583K MTD' },
  { label: 'Pipeline', status: 'yellow', title: 'Pipeline: Adequate', detail: '3.2x coverage but 3 leads unassigned' },
  { label: 'Operations', status: 'yellow', title: 'Ops: 3 delays', detail: '18 in production, 3 behind schedule' },
  { label: 'Service', status: 'orange', title: 'Service: 3 urgent', detail: '1 Amazon DC issue needs escalation' },
];

const statusColor: Record<string, string> = {
  green: 'bg-[#10B981]',
  yellow: 'bg-[#F59E0B]',
  orange: 'bg-[#F97316]',
  red: 'bg-[#EF4444]',
};

const revPacingData = [
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

const CurrentBarShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!height || height <= 0) return null;
  const opacity = payload?.isProjected ? 0.35 : 1;
  const radius = 3;
  return (
    <path
      d={`M${x},${y + height}L${x},${y + radius}Q${x},${y} ${x + radius},${y}L${x + width - radius},${y}Q${x + width},${y} ${x + width},${y + radius}L${x + width},${y + height}Z`}
      fill="#10B981"
      fillOpacity={opacity}
    />
  );
};

const concentrationData = [
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

const cashSparkline = [
  { w: 1, v: 118 }, { w: 2, v: 112 }, { w: 3, v: 124 }, { w: 4, v: 119 },
  { w: 5, v: 128 }, { w: 6, v: 135 }, { w: 7, v: 130 }, { w: 8, v: 142 },
];

const revSparkline = [
  { m: 1, v: 380 }, { m: 2, v: 420 }, { m: 3, v: 390 }, { m: 4, v: 440 },
  { m: 5, v: 460 }, { m: 6, v: 480 }, { m: 7, v: 450 }, { m: 8, v: 470 },
  { m: 9, v: 490 }, { m: 10, v: 510 }, { m: 11, v: 520 }, { m: 12, v: 583 },
];

const actionItems = [
  {
    priority: 'critical',
    title: 'Amazon DEN4 — PO not received (3 days)',
    detail: 'Denver DC reports PO#4521 not received. UPS shows delivered. Michael is filing a claim but Amazon may need a call from you if not resolved by tomorrow.',
    actions: ['Review Details'],
    bg: 'bg-[#FEE2E2]', border: 'border-l-4 border-[#EF4444]',
  },
  {
    priority: 'high',
    title: 'LOC Decision: Schedule bank meetings?',
    detail: 'Equipment debt at $179K, 9 months to payoff. Should we start bank conversations now with the 2024-2025 growth narrative, or wait for 2026 year-end financials?',
    actions: ['Start Now', 'Defer to Q4'],
    bg: 'bg-[#FFF7ED]', border: 'border-l-4 border-[#F59E0B]',
  },
  {
    priority: 'high',
    title: 'The One Percent Media Performance Review',
    detail: '$2K/month, 1 lead generated in March, $0 closed. Referrals and upsells outperform at $0 cost. Recommend restructuring or replacing.',
    actions: ['Schedule Review', 'Continue as-is'],
    bg: 'bg-[#FFF7ED]', border: 'border-l-4 border-[#F59E0B]',
  },
  {
    priority: 'high',
    title: 'Fairmont Hotels — Embroidery Delay',
    detail: 'Client event is April 18, decorator is 5 days behind. Tina needs authorization to expedite at additional $1,200 cost.',
    actions: ['Approve Expedite', 'Discuss with Tina'],
    bg: 'bg-[#FFF7ED]', border: 'border-l-4 border-[#F59E0B]',
  },
  {
    priority: 'normal',
    title: 'Iron Bound Safety — Trademark Attorney Budget',
    detail: 'Legal structure for brand contracts was a 2026 priority. Need to allocate budget and select attorney. Estimated $15-25K.',
    actions: ['Schedule for April'],
    bg: 'bg-[#EFF6FF]', border: 'border-l-4 border-[#3B82F6]',
  },
  {
    priority: 'normal',
    title: 'Hire Decision: Additional 1099 Sales Reps',
    detail: 'APEX recommends testing 2-3 independent reps in Q2. Zero fixed cost, commission only. Need your approval on commission structure and territories.',
    actions: ['Review Proposal'],
    bg: 'bg-[#EFF6FF]', border: 'border-l-4 border-[#3B82F6]',
  },
];

const keyDates = [
  {
    group: 'This Week (Mar 30 - Apr 5)',
    items: [
      { date: 'Mar 31', text: 'TX Oscar Project IHD (in-hands date)', value: '$75K', tint: '' },
      { date: 'Apr 1', text: 'Payroll', value: '$22.4K', tint: 'text-[#F59E0B]' },
      { date: 'Apr 1', text: 'Equipment payment to parents', value: '$20K', tint: 'text-[#F59E0B]' },
      { date: 'Apr 1', text: 'SBA EIDL payment', value: '$731', tint: 'text-[#F59E0B]' },
      { date: 'Apr 2', text: 'KSE Supplies shipment arrives at Turkana', value: '', tint: 'text-[#3B82F6]' },
      { date: 'Apr 3', text: 'The One Percent Media monthly review', value: '', tint: '' },
    ],
  },
  {
    group: 'Next Week (Apr 6 - 12)',
    items: [
      { date: 'Apr 8', text: 'Arctic Trax sample ETA at Amazon for approval', value: '', tint: 'text-[#3B82F6]' },
      { date: 'Apr 10', text: 'Amazon SKU decision expected (Safety Vests)', value: '$142K', tint: 'text-[#3B82F6]' },
      { date: 'Apr 12', text: 'SC Promo ocean shipment ETA Long Beach', value: '', tint: 'text-[#3B82F6]' },
    ],
  },
  {
    group: 'Apr 13 - 30',
    items: [
      { date: 'Apr 15', text: 'IPF payment expected', value: '$210,000', tint: 'text-[#10B981] font-bold' },
      { date: 'Apr 15', text: 'Estimated sales tax filing', value: '', tint: 'text-[#F59E0B]' },
      { date: 'Apr 18', text: 'Fairmont Hotels event (embroidery must arrive by Apr 16)', value: '', tint: 'text-[#EF4444]' },
      { date: 'Apr 20', text: 'CoreTex sunscreen deployment ship date', value: '', tint: 'text-[#3B82F6]' },
      { date: 'Apr 25', text: 'KSE thermal blankets ship to Amazon DCs', value: '', tint: 'text-[#3B82F6]' },
      { date: 'Apr 30', text: 'March financial close (Omar Consulting)', value: '', tint: '' },
    ],
  },
];

const scorecardItems = [
  { goal: 'Monthly Revenue', target: '$650K', actual: '$583K', pct: 90, status: 'yellow' },
  { goal: 'Promo Revenue', target: '$180K', actual: '$135K', pct: 75, status: 'yellow' },
  { goal: 'New Clients', target: '4', actual: '2', pct: 50, status: 'red' },
  { goal: 'Equipment Payoff', target: '$20K/mo', actual: '$20K', pct: 100, status: 'green' },
  { goal: 'Concentration', target: '<65%', actual: '77%', pct: 0, status: 'red' },
  { goal: 'On-Time Delivery', target: '95%', actual: '91%', pct: 91, status: 'yellow' },
];

export function ExecutiveOverview() {
  const [revToggle, setRevToggle] = useState<'Total' | 'Promo' | 'PPE'>('Total');
  const [expandedAction, setExpandedAction] = useState<number | null>(null);

  return (
    <>
      {/* Row 1 — Business Health Score Bar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4 mb-6 overflow-x-auto">
        <div className="flex lg:grid lg:grid-cols-5 lg:divide-x divide-[#E2E8F0] gap-3 lg:gap-0 min-w-max lg:min-w-0">
          {healthIndicators.map(h => (
            <div key={h.label} className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 first:pl-0 last:pr-0 shrink-0 lg:shrink">
              <div className={`w-3 h-3 rounded-full shrink-0 ${statusColor[h.status]}`} />
              <div className="min-w-0">
                <p className="text-[11px] lg:text-[12px] font-semibold text-[#1E293B] whitespace-nowrap lg:whitespace-normal lg:truncate">{h.title}</p>
                <p className="text-[10px] text-[#64748B] whitespace-nowrap lg:whitespace-normal lg:truncate">{h.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Row 2 — 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Cash Position */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">CASH POSITION</p>
              <h3 className="text-[20px] md:text-[28px] font-bold text-[#1E293B]">$142,350</h3>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><Landmark className="w-4 h-4 text-white" /></div>
          </div>
          <div className="space-y-0.5 text-[11px] mb-2">
            <p className="text-[#3B82F6]">AR Outstanding: $487K</p>
            <p className="text-[#F59E0B]">AP Due (30d): $216K</p>
            <p className="font-semibold text-[#1E293B]">Net Working Capital: $497K</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#10B981] font-semibold mb-2"><ArrowUpRight className="w-3 h-3" />+$18K vs last week</div>
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={cashSparkline}>
              <defs key="defs"><linearGradient id="cashSpark" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.2} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
              <Area key="area" type="monotone" dataKey="v" stroke="#10B981" strokeWidth={1.5} fill="url(#cashSpark)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue MTD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">REVENUE (MTD)</p>
              <h3 className="text-[20px] md:text-[28px] font-bold text-[#1E293B]">$583,000</h3>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><TrendingUp className="w-4 h-4 text-white" /></div>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden mb-1.5">
            <div className="bg-[#3B82F6]" style={{ width: '77%' }} title="PPE $448K" />
            <div className="bg-[#10B981]" style={{ width: '23%' }} title="Promo $135K" />
          </div>
          <div className="flex justify-between text-[9px] text-[#64748B] mb-1"><span>PPE $448K (77%)</span><span>Promo $135K (23%)</span></div>
          <p className="text-[10px] text-[#10B981] font-semibold">vs LY March: $412K (+41%)</p>
          <div className="mt-1"><p className="text-[10px] text-[#64748B] mb-0.5">YTD: $1.82M (87% of target)</p><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#10B981] rounded-full" style={{ width: '87%' }} /></div></div>
          <div className="mt-1.5">
            <ResponsiveContainer width="100%" height={35}>
              <AreaChart data={revSparkline}>
                <defs key="defs"><linearGradient id="revSpark" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.2} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs>
                <Area key="area" type="monotone" dataKey="v" stroke="#10B981" strokeWidth={1.5} fill="url(#revSpark)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Active Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">ACTIVE ORDERS</p>
              <h3 className="text-[20px] md:text-[28px] font-bold text-[#1E293B]">34</h3>
            </div>
            <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-white" /></div>
          </div>
          <div className="space-y-0.5 text-[11px]">
            <p className="text-[#1E293B]">In Production: 18 <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F59E0B] ml-1" title="delays" /></p>
            <p className="text-[#1E293B]">In Transit: 11</p>
            <p className="text-[#1E293B]">Ready to Ship: 7</p>
            <p className="text-[#EF4444] font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Behind schedule: 3</p>
          </div>
        </motion.div>

        {/* Open Issues */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">OPEN ISSUES</p>
              <h3 className="text-[20px] md:text-[28px] font-bold text-[#1E293B]">14</h3>
            </div>
            <div className="w-10 h-10 bg-[#F97066] rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-white" /></div>
          </div>
          <div className="space-y-0.5 text-[11px]">
            <p className="text-[#EF4444] font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />Urgent: 3</p>
            <p className="text-[#3B82F6]">Amazon-related: 5</p>
            <p className="text-[#F59E0B]">SLA compliance: 87%</p>
            <p className="text-[#64748B]">Avg resolution: 2.4 days</p>
          </div>
        </motion.div>
      </div>

      {/* Row 3 — Revenue Pacing + Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1E293B]">2026 vs 2025 Revenue</h3>
              <p className="text-[12px] text-[#64748B]">Monthly pacing</p>
            </div>
            <div className="flex gap-1">
              {(['Total', 'Promo', 'PPE'] as const).map(t => (
                <button key={t} onClick={() => setRevToggle(t)} className={`px-2 py-1 text-[10px] font-semibold rounded-full ${revToggle === t ? 'bg-[#1E40AF] text-white' : 'bg-slate-100 text-[#64748B]'}`}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={revPacingData} barGap={2}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis key="xaxis" dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis key="yaxis" stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}K`} />
              <Tooltip key="tooltip" contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 11 }} formatter={(v: number | null) => v ? [`$${v}K`, ''] : ['-', '']} />
              <Bar key="bar-2025" dataKey="2025" fill="#1B2A4A" radius={[3, 3, 0, 0]} barSize={14} name="2025 Actual" />
              <Bar key="bar-current" dataKey="current" fill="#10B981" radius={[3, 3, 0, 0]} barSize={14} name="2026 Actual" shape={CurrentBarShape} />
              <Line key="line-target" type="monotone" dataKey="target" stroke="#1E40AF" strokeWidth={2} strokeDasharray="6 4" dot={false} name="2026 Target" />
              <ReferenceLine key="ref-mar" x="Mar" stroke="#3B82F6" strokeDasharray="4 4" strokeOpacity={0.3} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-[#64748B]">
            <span className="flex items-center gap-1"><div className="w-3 h-2 bg-[#1B2A4A] rounded-sm" />2025 Actual</span>
            <span className="flex items-center gap-1"><div className="w-3 h-2 bg-[#10B981] rounded-sm" />2026 Actual</span>
            <span className="flex items-center gap-1"><div className="w-6 border-t-2 border-dashed border-[#1E40AF]" />2026 Target</span>
          </div>
          <p className="text-[10px] text-[#64748B] mt-2 font-semibold">2026 YTD: $1.82M | 2025 YTD: $1.34M | Growth: +36%</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">Revenue Concentration</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Diversification tracking</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={concentrationData}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis key="xaxis" dataKey="month" stroke="#94a3b8" tick={{ fontSize: 9 }} />
              <YAxis key="yaxis" stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
              <Tooltip key="tooltip" contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 11 }} formatter={(v: number) => [`${v}%`, '']} />
              <Area key="area-ppe" type="monotone" dataKey="ppe" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} name="PPE / Amazon" />
              <Area key="area-promo" type="monotone" dataKey="promo" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.5} name="Promo" />
              <ReferenceLine key="ref-50" y={50} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Target: No channel >50%', fontSize: 9, fill: '#EF4444', position: 'insideTopRight' }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-[#64748B]">
            <span className="flex items-center gap-1"><div className="w-3 h-2 bg-[#3B82F6] rounded-sm" />PPE / Amazon</span>
            <span className="flex items-center gap-1"><div className="w-3 h-2 bg-[#10B981] rounded-sm" />Promo</span>
          </div>
          <p className="text-[10px] text-[#1E293B] mt-2">IPF/Amazon: <span className="text-[#3B82F6] font-bold">77%</span> of MTD revenue | Target: <span className="text-[#EF4444] font-bold">&lt;50%</span> by EOY</p>
          <p className="text-[9px] text-[#64748B] mt-0.5">Promo must grow from $1.87M to $5M+ to reach 50/50 balance</p>
        </motion.div>
      </div>

      {/* Row 4 — Three Domain Summary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Finance Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="border-t-2 border-[#1B2A4A]" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-[#1E293B]">Finance</h3>
              <button className="text-[10px] text-[#3B82F6] font-semibold flex items-center gap-0.5 hover:underline">View Full <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-1.5 text-[11px] mb-3">
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]" />Cash: $142,350</p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]" />30-day forecast: $94,750</p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#64748B]" />Equipment debt: $179K remaining <span className="inline-block w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-1"><span className="block h-full bg-[#10B981] rounded-full" style={{ width: '25%' }} /></span></p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" />DSO: 52 days <span className="text-[9px] text-[#64748B]">(target &lt;45)</span></p>
            </div>
            <div className="space-y-1.5 mb-3">
              <div className="px-2.5 py-1.5 bg-[#EFF6FF] rounded text-[10px] text-[#1E40AF] flex items-center gap-1"><Info className="w-3 h-3 shrink-0" />IPF payment of $210K expected April 15</div>
              <div className="px-2.5 py-1.5 bg-[#FFF7ED] rounded text-[10px] text-[#9A3412] flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" />3 promo invoices over 60 days ($22K)</div>
            </div>
            <div className="px-2.5 py-2 bg-slate-50 rounded text-[10px] text-[#64748B]">
              <p>Revenue: $583K | GP: $141K (24.2%) | Net: $68K</p>
              <p>Net margin: 11.7% vs 13.5% target</p>
            </div>
          </div>
        </motion.div>

        {/* Sales Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="border-t-2 border-[#10B981]" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-[#1E293B]">Sales</h3>
              <button className="text-[10px] text-[#3B82F6] font-semibold flex items-center gap-0.5 hover:underline">View Full <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-1.5 text-[11px] mb-3">
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]" />Won MTD: $318K (12 deals)</p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]" />Pipeline: $847K (34 deals)</p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" />Win rate: 42% <span className="text-[9px] text-[#64748B]">(target 50%)</span></p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" />New clients MTD: 2 <span className="text-[9px] text-[#64748B]">(target 4)</span></p>
            </div>
            <div className="space-y-1.5 mb-3">
              <div className="px-2.5 py-1.5 bg-[#FFF7ED] rounded text-[10px] text-[#9A3412] flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" />5 deals stalled 7+ days ($54K)</div>
              <div className="px-2.5 py-1.5 bg-[#FFFBEB] rounded text-[10px] text-[#92400E] flex items-center gap-1"><Info className="w-3 h-3 shrink-0" />$615K sitting in Design Ready</div>
              <div className="px-2.5 py-1.5 bg-[#FEE2E2] rounded text-[10px] text-[#991B1B] flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" />One Percent Media: 1 lead, $2K spend</div>
            </div>
            <div className="px-2.5 py-2 bg-slate-50 rounded text-[10px] text-[#64748B] space-y-0.5">
              <p>Tina: 3 deals closed, 5 follow-ups due today</p>
              <p>Melody: 6 leads generated, 18 reactivation contacts</p>
            </div>
          </div>
        </motion.div>

        {/* Operations Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="border-t-2 border-[#7C3AED]" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-[#1E293B]">Operations</h3>
              <button className="text-[10px] text-[#3B82F6] font-semibold flex items-center gap-0.5 hover:underline">View Full <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-1.5 text-[11px] mb-3">
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]" />In production: 18 orders</p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]" />In transit: 11 shipments ($284K)</p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" />On-time rate: 91% <span className="text-[9px] text-[#64748B]">(target 95%)</span></p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" />Warehouse: 68% capacity</p>
            </div>
            <div className="space-y-1.5 mb-3">
              <div className="px-2.5 py-1.5 bg-[#FEE2E2] rounded text-[10px] text-[#991B1B] flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" />3 orders behind schedule</div>
              <div className="px-2.5 py-1.5 bg-[#EFF6FF] rounded text-[10px] text-[#1E40AF] flex items-center gap-1"><Info className="w-3 h-3 shrink-0" />PO#4510 — waiting on Amazon DC schedule</div>
              <div className="px-2.5 py-1.5 bg-[#FFF7ED] rounded text-[10px] text-[#9A3412] flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" />SC Promo on-time at 75%</div>
            </div>
            <div className="px-2.5 py-2 bg-slate-50 rounded text-[10px] text-[#64748B] space-y-0.5">
              <p className="font-semibold text-[#3B82F6]">Amazon Deployments</p>
              <p>Next 7 days: 2 deployments ($117K)</p>
              <p>Next 30 days: 4 deployments ($423K)</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 5 — CEO Action Items + Key Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="lg:col-span-3 bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="border-l-4 border-[#EF4444] p-5">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Requires Your Attention</h3>
            <p className="text-[11px] text-[#64748B] mb-1">Items that need Patrick's decision or input</p>
            <p className="text-[10px] text-[#64748B] mb-4">6 items requiring attention — <span className="text-[#EF4444] font-bold">1 critical</span>, <span className="text-[#F59E0B] font-bold">3 high</span>, <span className="text-[#3B82F6] font-bold">2 normal</span></p>
            <div className="space-y-2">
              {actionItems.map((item, idx) => (
                <div key={idx} className={`${item.bg} ${item.border} rounded-lg px-4 py-3 cursor-pointer transition-all hover:shadow-md`} onClick={() => setExpandedAction(expandedAction === idx ? null : idx)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${item.priority === 'critical' ? 'bg-[#EF4444] text-white' : item.priority === 'high' ? 'bg-[#F59E0B] text-white' : 'bg-[#3B82F6] text-white'}`}>{item.priority}</span>
                      <p className="text-[12px] font-semibold text-[#1E293B]">{item.title}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-[#94A3B8] transition-transform ${expandedAction === idx ? 'rotate-90' : ''}`} />
                  </div>
                  {expandedAction === idx && (
                    <div className="mt-2">
                      <p className="text-[11px] text-[#475569] mb-2">{item.detail}</p>
                      <div className="flex gap-2">
                        {item.actions.map(a => (
                          <button key={a} className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[10px] font-semibold text-[#1E293B] hover:bg-slate-50 shadow-sm">{a}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">Upcoming</h3>
          <p className="text-[11px] text-[#64748B] mb-4">Next 30 days</p>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {keyDates.map(group => (
              <div key={group.group}>
                <p className="text-[11px] font-bold text-[#1E293B] mb-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />{group.group}</p>
                <div className="space-y-1.5 pl-5">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="font-semibold text-[#1E293B] w-12 shrink-0">{item.date}</span>
                      <span className={`flex-1 ${item.tint || 'text-[#475569]'}`}>{item.text}</span>
                      {item.value && <span className="font-bold text-[#1E293B] shrink-0">{item.value}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 6 — Business Scorecard */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4 overflow-x-auto">
        <div className="flex lg:grid lg:grid-cols-6 lg:divide-x divide-[#E2E8F0] gap-4 lg:gap-0 min-w-max lg:min-w-0">
          {scorecardItems.map(s => (
            <div key={s.goal} className="px-3 lg:px-4 text-center first:pl-0 last:pr-0 min-w-[100px] shrink-0 lg:shrink">
              <p className="text-[10px] font-semibold text-[#64748B] uppercase mb-1">{s.goal}</p>
              <p className="text-[16px] font-bold text-[#1E293B] mb-0.5">{s.actual}</p>
              <p className="text-[9px] text-[#64748B] mb-1">Target: {s.target}</p>
              {s.goal !== 'Concentration' ? (
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.status === 'green' ? 'bg-[#10B981]' : s.status === 'yellow' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`} style={{ width: `${Math.min(s.pct, 100)}%` }} />
                </div>
              ) : (
                <div className="text-[9px] text-[#EF4444] font-bold">Above target</div>
              )}
              <div className={`w-2 h-2 rounded-full mx-auto mt-1.5 ${statusColor[s.status]}`} />
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}