import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Truck, Package, Users, BarChart3, Activity, Target, Clock, CheckCircle2, AlertTriangle, Zap, ArrowRight, ChevronDown, RefreshCw, Calendar, Boxes, ClipboardList, Factory, Building2, Phone, Mail, Star, Globe, Shield, XCircle, Landmark, FileText, CreditCard, Eye, Info, Trophy, ArrowUpRight, ArrowDownRight, Send, UserPlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, Cell, PieChart, Pie, ComposedChart, ReferenceLine } from 'recharts';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ExecutiveOverview } from './ExecutiveOverview';
import { apiGetJson } from '../lib/apiClient';

type Department = 'Executive' | 'Sales' | 'Operations' | 'Customer Service' | 'Finance';

const DEPARTMENTS: { id: Department; label: string; icon: any; color: string }[] = [
  { id: 'Executive', label: 'Executive Overview', icon: BarChart3, color: 'from-blue-600 to-indigo-600' },
  { id: 'Sales', label: 'Sales', icon: Target, color: 'from-emerald-600 to-teal-600' },
  { id: 'Operations', label: 'Operations', icon: Boxes, color: 'from-purple-600 to-violet-600' },
  { id: 'Customer Service', label: 'Customer Service', icon: Users, color: 'from-amber-600 to-orange-600' },
  { id: 'Finance', label: 'Finance', icon: DollarSign, color: 'from-cyan-600 to-blue-600' },
];

function StatCard({ title, value, change, subtitle, trend, icon: Icon, bgColor, delay = 0 }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-black text-slate-900">{value}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 bg-gradient-to-br ${bgColor} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1">
          {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
          <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>{change}</span>
          <span className="text-[10px] text-slate-400 ml-1">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

function ChartCard({ title, children, delay = 0, className = '' }: { title: string; children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm ${className}`}>
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

function ActionItem({ icon: Icon, title, value, color, onClick }: { icon: any; title: string; value: string | number; color: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
      <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-slate-900">{title}</span>
      </div>
      <span className="text-sm font-bold text-slate-700">{value}</span>
      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
    </div>
  );
}

// ─── Sales Dashboard (Command Center) ───
function SalesDashboard({ data: _data }: { data: any }) {
  const [clientTab, setClientTab] = useState<'Active' | 'Declining' | 'Dormant' | 'New'>('Active');
  const [revToggle, setRevToggle] = useState<'Total' | 'Promo' | 'PPE'>('Total');

  const revPacing = [
    { month: 'Jan', ly: 520, ty: 610, target: 650 },
    { month: 'Feb', ly: 410, ty: 627, target: 650 },
    { month: 'Mar', ly: 412, ty: 583, target: 650 },
    { month: 'Apr', ly: 680, ty: null, target: 700, proj: 720 },
    { month: 'May', ly: 890, ty: null, target: 800, proj: 850 },
    { month: 'Jun', ly: 520, ty: null, target: 650, proj: 680 },
    { month: 'Jul', ly: 480, ty: null, target: 600, proj: 620 },
    { month: 'Aug', ly: 750, ty: null, target: 750, proj: 780 },
    { month: 'Sep', ly: 620, ty: null, target: 700, proj: 710 },
    { month: 'Oct', ly: 810, ty: null, target: 800, proj: 830 },
    { month: 'Nov', ly: 920, ty: null, target: 850, proj: 900 },
    { month: 'Dec', ly: 880, ty: null, target: 800, proj: 860 },
  ];

  const funnelStages = [
    { stage: 'Lead Received', deals: 19, value: '$42K', pct: 100, conv: '47%', color: '#93C5FD', warn: '19 deals at $42K — most unsized' },
    { stage: 'Qualified', deals: 8, value: '$86K', pct: 72, conv: '75%', color: '#60A5FA' },
    { stage: 'Order Request', deals: 15, value: '$189K', pct: 58, conv: '80%', color: '#3B82F6' },
    { stage: 'Design Ready', deals: 21, value: '$615K', pct: 45, conv: '85%', color: '#2563EB', info: '$615K — largest concentration' },
    { stage: 'Pending Payment', deals: 6, value: '$38K', pct: 30, conv: '92%', color: '#10B981' },
    { stage: 'Closed Won', deals: 12, value: '$318K', pct: 20, conv: '—', color: '#059669' },
  ];

  const clients = [
    { name: 'IPF Sourcing (Amazon)', ly: '$6,034,000', ytd: '$1,640,000', run: '$6.56M', vs: '+9%', trend: 'up' as const, last: 'Mar 22' },
    { name: 'Coca-Cola FL', ly: '$306,000', ytd: '$92,000', run: '$368K', vs: '+20%', trend: 'up' as const, last: 'Mar 18' },
    { name: 'Fairmont Hotels', ly: '$196,000', ytd: '$68,000', run: '$272K', vs: '+39%', trend: 'up' as const, last: 'Mar 10' },
    { name: 'Oscar Health', ly: '$193,000', ytd: '$48,000', run: '$192K', vs: '~0%', trend: 'flat' as const, last: 'Feb 28' },
    { name: 'Securiti', ly: '$138,000', ytd: '$32,000', run: '$128K', vs: '-7%', trend: 'down' as const, last: 'Feb 15' },
    { name: 'Clear Spring Healthcare', ly: '$131,000', ytd: '$41,000', run: '$164K', vs: '+25%', trend: 'up' as const, last: 'Mar 5' },
    { name: 'U of Miami', ly: '$73,000', ytd: '$18,000', run: '$72K', vs: '~0%', trend: 'flat' as const, last: 'Jan 30' },
    { name: 'Pinnacle Live', ly: '$68,000', ytd: '$0', run: '$0', vs: '-100%', trend: 'down' as const, last: 'Nov 2025' },
  ];

  const topDeals = [
    { name: 'Amazon — New SKU (Safety Vests)', value: '$142,000', type: 'PPE' as const, stage: 'Sample / Approval', stageColor: '#3B82F6', owner: 'Truscott', age: 18, note: 'Amazon reviewing sample — decision Apr 10', prob: 70, weighted: '$99,400' },
    { name: 'TX Oscar Project for OMG', value: '$75,000', type: 'Promo' as const, stage: 'Order Request', stageColor: '#F59E0B', owner: 'Tina', age: 12, note: 'Quote sent, awaiting client approval', prob: 60, weighted: '$45,000' },
    { name: 'Coca-Cola FL — Summer Campaign', value: '$52,000', type: 'Promo' as const, stage: 'Design Ready', stageColor: '#14B8A6', owner: 'Tina', age: 8, note: 'Shannon completing mockups — 3 options', prob: 80, weighted: '$41,600' },
    { name: 'Amazon — Squincher Replenishment', value: '$48,000', type: 'PPE' as const, stage: 'Order Request', stageColor: '#F59E0B', owner: 'Michael', age: 5, note: 'Auto-reorder trigger from 3 DCs', prob: 90, weighted: '$43,200' },
    { name: 'Securiti — Annual Rebrand Kit', value: '$38,000', type: 'Promo' as const, stage: 'Lead Received', stageColor: '#94A3B8', owner: 'Tina', age: 3, note: 'Could be $100K+ if we win apparel', prob: 30, weighted: '$11,400', upsell: true },
    { name: 'Clear Spring — Q3 Wellness Kits', value: '$28,000', type: 'Promo' as const, stage: 'Qualified', stageColor: '#60A5FA', owner: 'Tina', age: 6, note: 'Budget confirmed, selecting products', prob: 55, weighted: '$15,400' },
  ];

  const leadSources = [
    { source: 'Existing Client (upsell)', leads: 6, pipeline: '$124K', won: '$68K', cac: '$0', roi: '∞', good: true },
    { source: 'Referral', leads: 4, pipeline: '$86K', won: '$42K', cac: '$0', roi: '∞', good: true },
    { source: 'Website / Inbound', leads: 3, pipeline: '$28K', won: '$0', cac: '~$200', roi: 'TBD' },
    { source: 'LinkedIn (organic)', leads: 2, pipeline: '$15K', won: '$0', cac: '$0', roi: 'TBD' },
    { source: 'Cold Outreach (Melody)', leads: 3, pipeline: '$12K', won: '$0', cac: '~$500', roi: 'TBD' },
    { source: 'The One Percent Media', leads: 1, pipeline: '$4K', won: '$0', cac: '$2,000', roi: '-$2,000', bad: true },
  ];

  const scorecard = [
    { label: 'Revenue', target: '$650K', actual: '$583K', pct: 90, note: '$67K remaining, 2 days left' },
    { label: 'New Clients', target: '4', actual: '2', pct: 50, note: 'Need 2 more new clients' },
    { label: 'Promo Revenue', target: '$180K', actual: '$135K', pct: 75, note: '$45K gap — focus Design Ready' },
    { label: 'Proposals Sent', target: '20', actual: '16', pct: 80, note: 'On track' },
    { label: 'Reactivated Clients', target: '5', actual: '1', pct: 20, note: 'Melody has 18 in progress' },
    { label: 'Avg Deal Size', target: '$15K', actual: '$12.4K', pct: 83, note: 'Too many small deals' },
  ];

  const stalledDeals = [
    { deal: 'Pinnacle Live — Annual Event', value: '$18,000', stage: 'Design Ready', lastAct: 'Feb 28', days: 30, owner: 'Tina' },
    { deal: 'Clear Spring — Q2 Order', value: '$22,000', stage: 'Design Ready', lastAct: 'Mar 15', days: 15, owner: 'Tina' },
    { deal: 'Securiti — Tech Kit Bundles', value: '$8,200', stage: 'Lead Received', lastAct: 'Mar 20', days: 10, owner: 'Liz' },
    { deal: 'UOnline Swag', value: '$3,500', stage: 'Order Request', lastAct: 'Mar 20', days: 10, owner: 'Tina' },
    { deal: 'Small Biz Corp — Promo Starter', value: '$2,800', stage: 'Qualified', lastAct: 'Mar 12', days: 18, owner: 'Melody' },
  ];

  const scColor = (pct: number) => pct >= 85 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <>
      {/* Row 1 - KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">REVENUE (MTD)</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$583,000</h3>
              <div className="flex gap-1 mt-1 flex-wrap"><span className="px-1.5 py-0.5 bg-blue-100 text-[#3B82F6] text-[10px] font-bold rounded-full">PPE: $448K</span><span className="px-1.5 py-0.5 bg-emerald-100 text-[#10B981] text-[10px] font-bold rounded-full">Promo: $135K</span></div>
              <div className="flex items-center gap-1 mt-1"><ArrowUpRight className="w-3 h-3 text-[#10B981]" /><span className="text-[10px] text-[#10B981] font-semibold">vs $412K last Mar (+41%)</span></div>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><DollarSign className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">REVENUE (YTD)</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$1.82M</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Target: $2.1M | Pacing: 87%</p>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-[#10B981] rounded-full" style={{ width: '87%' }} /></div>
              <div className="flex items-center gap-1 mt-1"><ArrowUpRight className="w-3 h-3 text-[#10B981]" /><span className="text-[10px] text-[#10B981] font-semibold">vs $1.34M LY (+36%)</span></div>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><TrendingUp className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">ACTIVE PIPELINE</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$847,000</h3>
              <p className="text-[11px] text-[#64748B] mt-1">34 active deals</p>
              <p className="text-[10px] text-[#3B82F6] font-semibold mt-0.5">Coverage: 3.2x monthly target</p>
            </div>
            <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center shrink-0"><Target className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">WON (MTD)</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$318,000</h3>
              <p className="text-[11px] text-[#64748B] mt-1">12 deals closed</p>
              <div className="flex items-center gap-1 mt-0.5"><ArrowUpRight className="w-3 h-3 text-[#10B981]" /><span className="text-[10px] text-[#10B981] font-semibold">vs $245K last Mar (+30%)</span></div>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><Trophy className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">AVG DEAL SIZE</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$12,400</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Promo: $8.2K | PPE: $34.5K</p>
              <div className="flex items-center gap-1 mt-0.5"><ArrowUpRight className="w-3 h-3 text-[#10B981]" /><span className="text-[10px] text-[#10B981] font-semibold">vs $9.8K LY (+27%)</span></div>
            </div>
            <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center shrink-0"><BarChart3 className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">WIN RATE (MTD)</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">42%</h3>
              <p className="text-[11px] text-[#64748B] mt-1">12 won / 29 decisions</p>
              <div className="flex items-center gap-1 mt-0.5"><ArrowUpRight className="w-3 h-3 text-[#10B981]" /><span className="text-[10px] text-[#10B981] font-semibold">vs 38% last Mar (+4 pts)</span></div>
            </div>
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center shrink-0"><Target className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
      </div>

      {/* Row 2 - Revenue Pacing + Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1E293B]">Revenue Pacing</h3>
              <p className="text-[12px] text-[#64748B]">2026 vs 2025 — monthly comparison</p>
            </div>
            <div className="flex gap-1">
              {(['Total', 'Promo', 'PPE'] as const).map(t => (
                <button key={t} onClick={() => setRevToggle(t)} className={`px-2 py-1 text-[10px] font-semibold rounded-full ${revToggle === t ? 'bg-[#10B981] text-white' : 'bg-slate-100 text-[#64748B]'}`}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={revPacing}>
              <CartesianGrid key="rev-grid" strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis key="rev-x" dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis key="rev-y" stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}K`} />
              <Tooltip key="rev-tip" contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 11 }} formatter={(v: number) => [`$${v}K`, '']} />
              <Bar key="rev-ly" dataKey="ly" fill="#1B2A4A" radius={[3, 3, 0, 0]} name="2025 Actual" barSize={14} />
              <Bar key="rev-ty" dataKey="ty" fill="#10B981" radius={[3, 3, 0, 0]} name="2026 Actual" barSize={14} />
              <Bar key="rev-proj" dataKey="proj" fill="#A7F3D0" radius={[3, 3, 0, 0]} name="2026 Projected" barSize={14} opacity={0.6} />
              <ReferenceLine key="rev-ref" y={650} stroke="#10B981" strokeDasharray="6 4" label={{ value: 'Target', fontSize: 9, fill: '#10B981' }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-[#64748B]">
            <span className="flex items-center gap-1"><div className="w-3 h-2 bg-[#1B2A4A] rounded-sm" />2025</span>
            <span className="flex items-center gap-1"><div className="w-3 h-2 bg-[#10B981] rounded-sm" />2026</span>
            <span className="flex items-center gap-1"><div className="w-3 h-2 bg-[#A7F3D0] rounded-sm" />Projected</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">Pipeline by Stage</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Current active deals</p>
          <div className="space-y-2">
            {funnelStages.map((s, i) => (
              <div key={s.stage} className="group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-full rounded-lg overflow-hidden" style={{ maxWidth: `${s.pct}%` }}>
                    <div className="px-3 py-2 rounded-lg flex items-center justify-between" style={{ backgroundColor: s.color }}>
                      <span className="text-[11px] font-semibold text-white truncate">{s.stage}</span>
                      <span className="text-[10px] font-bold text-white whitespace-nowrap ml-2">{s.deals} | {s.value}</span>
                    </div>
                  </div>
                  {s.conv !== '—' && <span className="text-[10px] text-[#64748B] whitespace-nowrap">{s.conv} →</span>}
                </div>
                {'warn' in s && s.warn && <p className="text-[10px] text-[#F59E0B] mt-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{s.warn}</p>}
                {'info' in s && s.info && <p className="text-[10px] text-[#3B82F6] mt-0.5 flex items-center gap-1"><Info className="w-3 h-3" />{s.info}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3 - Client Performance + Top Deals (55/45) */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-6 bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1E293B]">Client Performance</h3>
              <p className="text-[12px] text-[#64748B]">Top accounts — this year vs last year</p>
            </div>
          </div>
          <div className="flex gap-1 mb-4">
            {(['Active', 'Declining', 'Dormant', 'New'] as const).map(t => (
              <button key={t} onClick={() => setClientTab(t)} className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${clientTab === t ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'}`}>{t}</button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead><tr className="bg-slate-50 border-b border-[#E2E8F0]">
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Client</th>
                <th className="text-right px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">2025</th>
                <th className="text-right px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">2026 YTD</th>
                <th className="text-right px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Run Rate</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">vs LY</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Last Order</th>
              </tr></thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.name} className={`border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer ${c.vs === '-100%' ? 'bg-red-50' : c.trend === 'down' ? 'bg-amber-50' : ''}`}>
                    <td className="px-2 py-2.5 font-medium text-[#1E293B] whitespace-nowrap">{c.name}</td>
                    <td className="px-2 py-2.5 text-right text-[#64748B]">{c.ly}</td>
                    <td className="px-2 py-2.5 text-right font-semibold text-[#1E293B]">{c.ytd}</td>
                    <td className="px-2 py-2.5 text-right text-[#64748B]">{c.run}</td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`font-bold ${c.trend === 'up' ? 'text-[#10B981]' : c.trend === 'down' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                        {c.trend === 'up' ? '↑' : c.trend === 'down' ? '↓' : '→'} {c.vs}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center text-[#64748B]">{c.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-[11px] text-[#64748B] flex justify-between">
            <span>Active: 87 | Growing: 34 | Flat: 28 | Declining: 15</span>
            <span>Uncaptured spend: ~$1.2M</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="lg:col-span-5 bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">Top Deals in Pipeline</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Highest value open opportunities</p>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {topDeals.map((d, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-[#E2E8F0] hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeft: `3px solid ${d.type === 'PPE' ? '#3B82F6' : '#10B981'}` }}>
                <div className="flex items-start justify-between mb-1">
                  <p className="text-[12px] font-semibold text-[#1E293B] leading-tight">{d.name}</p>
                  <span className="text-[13px] font-bold text-[#1E293B] whitespace-nowrap ml-2">{d.value}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${d.type === 'PPE' ? 'bg-blue-100 text-[#3B82F6]' : 'bg-emerald-100 text-[#10B981]'}`}>{d.type}</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded text-white" style={{ backgroundColor: d.stageColor }}>{d.stage}</span>
                  {'upsell' in d && d.upsell && <span className="px-1.5 py-0.5 bg-emerald-100 text-[#10B981] text-[9px] font-bold rounded">Upsell</span>}
                </div>
                <p className="text-[10px] text-[#64748B]">{d.note}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-[#94A3B8]">{d.owner} | {d.age}d</span>
                  <span className="text-[10px] text-[#7C3AED] font-semibold">{d.prob}% → {d.weighted}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 px-3 py-2 bg-purple-50 rounded-lg text-[11px] text-[#7C3AED] text-center font-semibold">
            Weighted pipeline: $412,000
          </div>
        </motion.div>
      </div>

      {/* Row 4 - Three panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">Team Activity</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Last 7 days</p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center"><span className="text-[9px] font-bold text-white">TH</span></div>
                <div><p className="text-[12px] font-semibold text-[#1E293B]">Tina Hunter</p><p className="text-[10px] text-[#64748B]">Account Executive</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                <div className="bg-slate-50 rounded px-2 py-1.5"><p className="text-[#64748B]">Emails</p><p className="font-bold text-[#1E293B]">28</p></div>
                <div className="bg-slate-50 rounded px-2 py-1.5"><p className="text-[#64748B]">Calls</p><p className="font-bold text-[#1E293B]">12</p></div>
                <div className="bg-slate-50 rounded px-2 py-1.5"><p className="text-[#64748B]">Proposals</p><p className="font-bold text-[#1E293B]">4</p></div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#64748B]">Deals closed: <span className="font-bold text-[#10B981]">3 ($68K)</span></span>
                <span className="text-[#F59E0B] font-semibold">5 follow-ups due</span>
              </div>
            </div>
            <div className="border-t border-[#E2E8F0] pt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"><span className="text-[9px] font-bold text-white">M</span></div>
                <div><p className="text-[12px] font-semibold text-[#1E293B]">Melody</p><p className="text-[10px] text-[#64748B]">Inside Sales / Biz Dev</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                <div className="bg-slate-50 rounded px-2 py-1.5"><p className="text-[#64748B]">Outreach</p><p className="font-bold text-[#1E293B]">85</p></div>
                <div className="bg-slate-50 rounded px-2 py-1.5"><p className="text-[#64748B]">LinkedIn</p><p className="font-bold text-[#1E293B]">34</p></div>
                <div className="bg-slate-50 rounded px-2 py-1.5"><p className="text-[#64748B]">Leads</p><p className="font-bold text-[#1E293B]">6</p></div>
              </div>
              <p className="text-[10px] text-[#64748B]">Focus: <span className="font-semibold text-[#3B82F6]">Dormant client outreach</span> (18 contacts)</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex justify-between text-[10px]">
            <span className="text-[#EF4444] font-semibold">Unassigned leads: 3</span>
            <span className="text-[#F59E0B] font-semibold">Overdue follow-ups: 7</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">Lead Sources</h3>
          <p className="text-[12px] text-[#64748B] mb-4">MTD — where are leads coming from?</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead><tr className="bg-slate-50 border-b border-[#E2E8F0]">
                <th className="text-left px-1.5 py-1.5 font-semibold text-[#64748B] text-[9px] uppercase">Source</th>
                <th className="text-center px-1 py-1.5 font-semibold text-[#64748B] text-[9px] uppercase">Leads</th>
                <th className="text-center px-1 py-1.5 font-semibold text-[#64748B] text-[9px] uppercase">Pipeline</th>
                <th className="text-center px-1 py-1.5 font-semibold text-[#64748B] text-[9px] uppercase">Won</th>
                <th className="text-center px-1 py-1.5 font-semibold text-[#64748B] text-[9px] uppercase">CAC</th>
              </tr></thead>
              <tbody>
                {leadSources.map(s => (
                  <tr key={s.source} className={`border-b border-[#E2E8F0] ${'bad' in s ? 'bg-red-50' : 'good' in s ? 'bg-emerald-50' : ''}`}>
                    <td className="px-1.5 py-2 font-medium text-[#1E293B]">{s.source}</td>
                    <td className="px-1 py-2 text-center text-[#1E293B]">{s.leads}</td>
                    <td className="px-1 py-2 text-center text-[#1E293B]">{s.pipeline}</td>
                    <td className="px-1 py-2 text-center font-semibold text-[#10B981]">{s.won}</td>
                    <td className="px-1 py-2 text-center text-[#64748B]">{s.cac}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-[10px] text-[#64748B]">
            <p className="font-semibold text-[#1E293B] mb-0.5">Insight:</p>
            <p>Highest ROI: Referrals & Upsells ($0 CAC). <span className="text-[#EF4444] font-semibold">One Percent Media needs ROI review</span> ($2K/mo, 1 lead).</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">March Scorecard</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Monthly targets vs actual</p>
          <div className="space-y-3">
            {scorecard.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-[#1E293B]">{s.label}</span>
                  <span className="text-[#64748B]">{s.actual} / {s.target}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(s.pct, 100)}%`, backgroundColor: scColor(s.pct) }} />
                </div>
                <p className="text-[9px] mt-0.5" style={{ color: scColor(s.pct) }}>{s.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full border-4 flex items-center justify-center" style={{ borderColor: '#F59E0B' }}>
              <span className="text-[20px] font-black text-[#F59E0B]">B-</span>
            </div>
            <p className="text-[10px] text-[#64748B] flex-1">On track for revenue but behind on new business and reactivation</p>
          </div>
        </motion.div>
      </div>

      {/* Row 5 - Stalled Deals Alert Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="bg-[#FFFBEB] rounded-lg border border-[#E2E8F0] border-l-[3px] border-l-[#F59E0B] p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          <h3 className="text-[14px] font-semibold text-[#1E293B]">Stalled Deals — No Activity in 7+ Days</h3>
          <span className="text-[11px] text-[#64748B]">5 deals worth $54,500</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {stalledDeals.map(d => (
            <div key={d.deal} className="min-w-[200px] bg-white rounded-lg p-3 border border-[#E2E8F0] shrink-0">
              <p className="text-[12px] font-semibold text-[#1E293B] mb-1">{d.deal}</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-[#1E293B]">{d.value}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: d.days > 14 ? '#FEE2E2' : '#FEF3C7', color: d.days > 14 ? '#991B1B' : '#92400E' }}>{d.days}d stalled</span>
              </div>
              <p className="text-[10px] text-[#64748B]">{d.stage} | {d.owner}</p>
              <div className="flex gap-1 mt-2">
                <button className="px-2 py-1 bg-[#1B2A4A] text-white text-[9px] font-bold rounded hover:bg-slate-800 flex items-center gap-1"><Send className="w-2.5 h-2.5" />Follow-up</button>
                <button className="px-2 py-1 bg-slate-100 text-[#64748B] text-[9px] font-bold rounded hover:bg-slate-200">Reassign</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ─── Operations Dashboard (Command Center) ───
function OperationsDashboard({ data: _data }: { data: any }) {
  const [pipelineFilter, setPipelineFilter] = useState<'All' | 'Promo' | 'Amazon'>('All');
  const [logisticsTab, setLogisticsTab] = useState<'Inbound' | 'Outbound' | 'Amazon DC'>('Inbound');

  type KCard = { name: string; value: string; type: 'Promo' | 'PPE'; owner: string; note: string; due: string; status: string; progress?: number; vendor?: string; delayed_note?: string; via?: string; dcProgress?: string };
  type KCol = { id: string; title: string; color: string; count: number; value: string; delayed?: number; cards: KCard[] };

  const kanbanColumns: KCol[] = [
    { id: 'sourcing', title: 'Sourcing', color: '#94A3B8', count: 5, value: '$87K', cards: [
      { name: 'Oscar Health — Custom Jackets', value: '$18,500', type: 'Promo', owner: 'Liz', note: 'Awaiting vendor quotes', due: 'Apr 28', status: '' },
      { name: 'Amazon — Safety Vest IBS-3100', value: '$42,000', type: 'PPE', owner: 'Liz', note: 'Sampling 3 factories', due: 'May 15', status: '' },
      { name: 'Securiti — Tech Kit Bundles', value: '$8,200', type: 'Promo', owner: 'Tina', note: 'Pricing from Hit Promo', due: 'Apr 18', status: '' },
    ]},
    { id: 'sample', title: 'Sample / Approval', color: '#3B82F6', count: 4, value: '$156K', cards: [
      { name: 'Amazon — Arctic Trax Thermal Gloves', value: '$95,000', type: 'PPE', owner: 'Truscott', note: 'Sample shipped to Amazon', due: 'May 30', status: 'Sample ETA: Apr 8' },
      { name: 'Coca-Cola FL — Summer Event Kit', value: '$32,000', type: 'Promo', owner: 'Tina', note: 'Client reviewing mockups', due: 'Apr 22', status: '' },
    ]},
    { id: 'production', title: 'In Production', color: '#F59E0B', count: 8, value: '$412K', delayed: 3, cards: [
      { name: 'Amazon — Iron Bound Gloves PO#4530', value: '$128,000', type: 'PPE', owner: 'Truscott', note: 'Production 60% complete', due: 'May 10', status: 'ON TRACK', progress: 60, vendor: 'SC Promo' },
      { name: 'Amazon — CoreTex Sunscreen', value: '$85,000', type: 'PPE', owner: 'Michael', note: 'Packaging phase', due: 'Apr 20', status: 'ON TRACK', vendor: 'CoreTex' },
      { name: 'Fairmont Hotels — Robes', value: '$24,000', type: 'Promo', owner: 'Tina', note: 'Embroidery in progress', due: 'Apr 15', status: 'DELAYED', delayed_note: 'Decorator behind 5 days' },
      { name: 'Amazon — KSE Blankets PO#4525', value: '$48,000', type: 'PPE', owner: 'Truscott', note: 'Mfg complete, preparing shipment', due: 'Apr 25', status: 'ON TRACK' },
    ]},
    { id: 'transit', title: 'In Transit', color: '#8B5CF6', count: 6, value: '$284K', cards: [
      { name: 'Amazon — Gloves PO#4518', value: '$62,000', type: 'PPE', owner: 'Michael', note: 'Departed Ningbo 3/20, ETA 4/12', due: 'Apr 12', status: 'ON SCHEDULE', via: 'Ocean / RIM Freight' },
      { name: 'Amazon — Squincher PO#4522', value: '$38,000', type: 'PPE', owner: 'Michael', note: 'Shipped UPS Ground 3/28', due: 'Apr 2', status: 'IN TRANSIT', via: 'Turkana' },
      { name: 'U of Miami — Event Swag', value: '$12,000', type: 'Promo', owner: 'Liz', note: 'Shipped 3/27, ETA 3/31', due: 'Mar 31', status: 'ARRIVING TODAY', via: 'UPS Ground' },
    ]},
    { id: 'receiving', title: 'Receiving / QC', color: '#14B8A6', count: 3, value: '$94K', cards: [
      { name: 'Amazon — PGK Slings PO#4515', value: '$52,000', type: 'PPE', owner: 'Truscott', note: 'QC in progress at Turkana', due: 'Apr 10', status: '480/500 inspected' },
      { name: 'Coca-Cola FL — Q2 Drinkware', value: '$28,000', type: 'Promo', owner: 'Tina', note: 'Received at warehouse 3/28', due: 'Apr 5', status: '' },
    ]},
    { id: 'ready', title: 'Ready to Ship', color: '#10B981', count: 7, value: '$198K', cards: [
      { name: 'Amazon — Gloves PO#4510', value: '$72,000', type: 'PPE', owner: 'Michael', note: 'At Turkana — awaiting DC schedule', due: 'Apr 5', status: 'WAITING ON AMAZON' },
      { name: 'Oscar Health — Welcome Kits', value: '$14,000', type: 'Promo', owner: 'Liz', note: 'Pickup scheduled 3/31', due: 'Mar 31', status: '' },
      { name: 'Amazon — Beanies PO#4508', value: '$45,000', type: 'PPE', owner: 'Michael', note: '3 of 6 DCs shipped', due: 'Apr 3', status: 'PARTIALLY SHIPPED', dcProgress: '3/6 DCs' },
    ]},
  ];

  const inboundShipments = [
    { shipment: 'SC Promo → RIM → Warehouse', origin: 'Ningbo, China', carrier: 'Ocean / RIM', eta: 'Dep 3/20 → ETA 4/12', status: 'In Transit', sc: '#10B981', value: '$62,000' },
    { shipment: 'KSE Supplies → Turkana', origin: 'Mumbai, India', carrier: 'Air Freight', eta: 'Dep 3/25 → ETA 4/2', status: 'In Transit', sc: '#10B981', value: '$48,000' },
    { shipment: 'PGK Solutions → Warehouse', origin: 'Shenzhen, China', carrier: 'Ocean', eta: 'Dep 3/15 → ETA 4/8', status: 'Customs', sc: '#F59E0B', value: '$35,000' },
    { shipment: 'SanMar → Warehouse', origin: 'Domestic', carrier: 'UPS Ground', eta: 'Ship 3/28 → ETA 3/31', status: 'Arriving Today', sc: '#10B981', value: '$8,200' },
    { shipment: 'CoreTex → Turkana', origin: 'Domestic', carrier: 'Freight', eta: 'Ship 3/26 → ETA 4/1', status: 'In Transit', sc: '#10B981', value: '$85,000' },
  ];

  const vendorList = [
    { name: 'SC Promo Inv', orders: 12, onTime: 75, issues: 1, leadTime: '42 days', trend: 'worsening' as const },
    { name: 'Turkana Tools', orders: 8, onTime: 94, issues: 0, leadTime: '5 days', trend: 'stable' as const },
    { name: 'CoreTex Products', orders: 3, onTime: 100, issues: 0, leadTime: '12 days', trend: 'improving' as const },
    { name: 'KSE Supplies', orders: 4, onTime: 88, issues: 0, leadTime: '28 days', trend: 'stable' as const },
    { name: 'SanMar', orders: 15, onTime: 97, issues: 0, leadTime: '3 days', trend: 'stable' as const },
    { name: 'PGK Solutions', orders: 5, onTime: 80, issues: 1, leadTime: '38 days', trend: 'worsening' as const },
    { name: 'Hit Promo', orders: 9, onTime: 92, issues: 0, leadTime: '4 days', trend: 'stable' as const },
  ];

  const whZones = [
    { name: 'PPE Storage', pct: 40, color: '#3B82F6' },
    { name: 'Promo Inventory', pct: 20, color: '#10B981' },
    { name: 'Pick & Pack', pct: 18, color: '#8B5CF6' },
    { name: 'Staging', pct: 10, color: '#F59E0B' },
    { name: 'Available', pct: 12, color: '#E2E8F0' },
  ];

  const sBadge = (s: string) => {
    if (!s) return null;
    const bg = s === 'DELAYED' ? '#FEE2E2' : s === 'ARRIVING TODAY' ? '#D1FAE5' : (s === 'WAITING ON AMAZON' || s === 'PARTIALLY SHIPPED') ? '#FEF3C7' : '#D1FAE5';
    const tx = s === 'DELAYED' ? '#991B1B' : s === 'ARRIVING TODAY' ? '#065F46' : (s === 'WAITING ON AMAZON' || s === 'PARTIALLY SHIPPED') ? '#92400E' : '#065F46';
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap" style={{ backgroundColor: bg, color: tx }}>{s}</span>;
  };

  return (
    <>
      {/* Row 1 - KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">ACTIVE ORDERS</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">34</h3>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 bg-emerald-100 text-[#10B981] text-[10px] font-bold rounded-full">Promo: 21</span>
                <span className="px-1.5 py-0.5 bg-blue-100 text-[#3B82F6] text-[10px] font-bold rounded-full">Amazon: 13</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center shrink-0"><ShoppingCart className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">IN PRODUCTION</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">18</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Overseas: 8 | Domestic: 10</p>
              <div className="flex items-center gap-1 mt-0.5"><AlertTriangle className="w-3 h-3 text-[#F59E0B]" /><span className="text-[10px] font-semibold text-[#F59E0B]">3 behind schedule</span></div>
            </div>
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center shrink-0"><Factory className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">IN TRANSIT</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">11</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Ocean: 4 | Air: 2 | Ground: 5</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">Value: $284,000</p>
            </div>
            <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center shrink-0"><Truck className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">READY TO SHIP</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">7</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Warehouse: 4 | Turkana: 3</p>
              <p className="text-[10px] font-semibold text-[#10B981] mt-0.5">2 shipping today</p>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">WAREHOUSE CAPACITY</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#F59E0B]">68%</h3>
              <p className="text-[11px] text-[#64748B] mt-1">2,040 / 3,000 sq ft</p>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '68%' }} /></div>
            </div>
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center shrink-0"><Boxes className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">SHIPMENTS THIS WEEK</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">12</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Completed: 8 | Pending: 4</p>
              <p className="text-[10px] text-[#10B981] font-semibold mt-0.5">On-time: 91%</p>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
      </div>

      {/* Row 2 - Production Pipeline Kanban */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Production Pipeline</h3>
            <p className="text-[12px] text-[#64748B]">All active orders by stage</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              {(['All', 'Promo', 'Amazon'] as const).map(f => (
                <button key={f} onClick={() => setPipelineFilter(f)} className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all ${pipelineFilter === f ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'}`}>{f === 'Amazon' ? 'Amazon Only' : f === 'Promo' ? 'Promo Only' : f}</button>
              ))}
            </div>
            <button className="px-3 py-1.5 bg-[#7C3AED] text-white text-[11px] font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> View Gantt</button>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ minHeight: 400 }}>
          {kanbanColumns.map(col => {
            const fc = col.cards.filter(c => pipelineFilter === 'All' || (pipelineFilter === 'Promo' ? c.type === 'Promo' : c.type === 'PPE'));
            return (
              <div key={col.id} className="min-w-[220px] flex-1 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]" style={{ borderTop: `4px solid ${col.color}` }}>
                <div className="p-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#1E293B]">{col.title}</span>
                    {col.delayed ? <span className="text-[10px] font-bold text-[#EF4444]">{col.delayed} delayed</span> : null}
                  </div>
                  <span className="text-[10px] text-[#64748B]">{col.count} orders | {col.value}</span>
                </div>
                <div className="p-2 space-y-2 max-h-[340px] overflow-y-auto">
                  {fc.map((card, ci) => (
                    <div key={ci} className={`bg-white rounded-lg p-3 border border-[#E2E8F0] cursor-pointer hover:shadow-md transition-shadow ${card.status === 'DELAYED' ? 'bg-[#FEF2F2]' : ''}`} style={{ borderLeft: `3px solid ${card.type === 'PPE' ? '#3B82F6' : '#10B981'}` }}>
                      <p className="text-[12px] font-semibold text-[#1E293B] leading-tight mb-1">{card.name}</p>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[11px] font-bold text-[#1E293B]">{card.value}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${card.type === 'PPE' ? 'bg-blue-100 text-[#3B82F6]' : 'bg-emerald-100 text-[#10B981]'}`}>{card.type === 'PPE' ? 'PPE' : 'Promo'}</span>
                      </div>
                      <p className="text-[10px] text-[#64748B] mb-1">{card.note}</p>
                      {card.progress !== undefined && <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-1"><div className="h-full bg-[#10B981] rounded-full" style={{ width: `${card.progress}%` }} /></div>}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-[#64748B]">Due: {card.due}</span>
                        {sBadge(card.status)}
                      </div>
                      {card.delayed_note && <p className="text-[10px] text-[#EF4444] font-semibold mt-1">{card.delayed_note}</p>}
                      {card.dcProgress && <p className="text-[10px] text-[#F59E0B] font-semibold mt-1">{card.dcProgress}</p>}
                      <p className="text-[10px] text-[#94A3B8] mt-1">Owner: {card.owner}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Row 3 - Logistics + Vendor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-6 bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1E293B]">Active Shipments</h3>
              <p className="text-[12px] text-[#64748B]">All inbound and outbound in transit</p>
            </div>
          </div>
          <div className="flex gap-1 mb-4">
            {(['Inbound', 'Outbound', 'Amazon DC'] as const).map(t => (
              <button key={t} onClick={() => setLogisticsTab(t)} className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${logisticsTab === t ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'}`}>{t === 'Inbound' ? 'Inbound to Warehouse' : t === 'Outbound' ? 'Outbound to Clients' : 'Amazon DC Distribution'}</button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead><tr className="bg-slate-50 border-b border-[#E2E8F0]">
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Shipment</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Origin</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Carrier</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">ETD/ETA</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Status</th>
                <th className="text-right px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Value</th>
              </tr></thead>
              <tbody>
                {inboundShipments.map((s, i) => (
                  <tr key={i} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="px-2 py-2.5 font-medium text-[#1E293B] whitespace-nowrap">{s.shipment}</td>
                    <td className="px-2 py-2.5 text-[#64748B] whitespace-nowrap">{s.origin}</td>
                    <td className="px-2 py-2.5 text-[#64748B] whitespace-nowrap">{s.carrier}</td>
                    <td className="px-2 py-2.5 text-[#64748B] whitespace-nowrap">{s.eta}</td>
                    <td className="px-2 py-2.5"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.sc }} /><span className="text-[#1E293B] font-medium">{s.status}</span></div></td>
                    <td className="px-2 py-2.5 text-right font-semibold text-[#1E293B]">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-[11px] text-[#64748B] flex justify-between">
            <span>Total in transit: $238,200</span>
            <span>Avg: 18d overseas / 3d domestic</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-5 bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Vendor Performance</h3>
            <p className="text-[12px] text-[#64748B]">Last 90 days</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead><tr className="bg-slate-50 border-b border-[#E2E8F0]">
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Vendor</th>
                <th className="text-center px-1 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Ord</th>
                <th className="text-center px-1 py-2 font-semibold text-[#64748B] text-[10px] uppercase">On-Time</th>
                <th className="text-center px-1 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Iss</th>
                <th className="text-center px-1 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Lead</th>
                <th className="text-center px-1 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Trend</th>
              </tr></thead>
              <tbody>
                {vendorList.map(v => (
                  <tr key={v.name} className={`border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer ${v.onTime < 80 ? 'bg-red-50' : v.onTime < 90 ? 'bg-amber-50' : ''}`}>
                    <td className="px-2 py-2 font-medium text-[#1E293B]">{v.name}</td>
                    <td className="px-1 py-2 text-center text-[#1E293B]">{v.orders}</td>
                    <td className="px-1 py-2 text-center font-bold" style={{ color: v.onTime >= 90 ? '#10B981' : v.onTime >= 80 ? '#F59E0B' : '#EF4444' }}>{v.onTime}%</td>
                    <td className="px-1 py-2 text-center text-[#1E293B]">{v.issues}</td>
                    <td className="px-1 py-2 text-center text-[#64748B]">{v.leadTime}</td>
                    <td className="px-1 py-2 text-center">
                      {v.trend === 'improving' && <span className="text-[#10B981] font-semibold text-[11px]">↓ faster</span>}
                      {v.trend === 'stable' && <span className="text-[#94A3B8] font-semibold text-[11px]">→ stable</span>}
                      {v.trend === 'worsening' && <span className="text-[#EF4444] font-semibold text-[11px]">↑ slower</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-[11px] text-[#64748B] text-center">
            Avg on-time: 88% | Target: 95%
          </div>
        </motion.div>
      </div>

      {/* Row 4 - Three panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-[#F0F7FF] rounded-lg border-l-[3px] border-l-[#3B82F6] border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">Amazon Deployments</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Upcoming distribution schedule</p>
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Next 7 Days</p>
            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
              <p className="text-[12px] font-bold text-[#1E293B]">PO#4510 — Iron Bound Gloves → 8 DCs</p>
              <p className="text-[10px] text-[#64748B] mt-1">Ready at Turkana — awaiting DC schedule</p>
              <p className="text-[10px] text-[#64748B]">Units: 4,000 | LTL Freight</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex gap-0.5">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="w-3 h-3 rounded-sm bg-[#E2E8F0] border border-slate-300" />)}</div>
                <span className="px-1.5 py-0.5 bg-[#FEF3C7] text-[#92400E] text-[9px] font-bold rounded">WAITING</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
              <p className="text-[12px] font-bold text-[#1E293B]">PO#4508 — Arctic Trax Beanies → 6 DCs</p>
              <p className="text-[10px] text-[#64748B] mt-1">Partially shipped — 1,500 of 3,000 units</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex gap-0.5">{Array.from({ length: 6 }).map((_, i) => <div key={i} className={`w-3 h-3 rounded-sm border ${i < 3 ? 'bg-[#10B981] border-[#10B981]' : 'bg-[#E2E8F0] border-slate-300'}`} />)}</div>
                <span className="text-[10px] font-semibold text-[#10B981]">3/6 DCs</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-2">Next 14 Days</p>
            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
              <p className="text-[12px] font-bold text-[#1E293B]">PO#4522 — Squincher Hydration → 12 DCs</p>
              <p className="text-[10px] text-[#64748B] mt-1">In transit to Turkana • Units: 6,000</p>
              <p className="text-[10px] text-[#64748B]">ETA Turkana: Apr 2 → Ship DCs: Apr 5-8</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex gap-0.5">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-2.5 h-2.5 rounded-sm bg-[#E2E8F0] border border-slate-300" />)}</div>
                <span className="text-[10px] text-[#64748B]">0/12 DCs</span>
              </div>
            </div>
          </div>
          <div className="mt-4 px-3 py-2 bg-white rounded-lg text-[11px] text-[#64748B] text-center border border-[#E2E8F0]">
            Deployment value (30 days): $423,000
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B] mb-4">Airport Industrial — 3,000 sq ft</h3>
          <div className="flex rounded-lg overflow-hidden h-6 mb-2">
            {whZones.map(z => (
              <div key={z.name} className="relative" style={{ width: `${z.pct}%`, backgroundColor: z.color }} title={z.name}>
                {z.pct >= 15 && <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-sm">{z.pct}%</span>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
            {whZones.map(z => (
              <div key={z.name} className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ backgroundColor: z.color }} /><span className="text-[9px] text-[#64748B]">{z.name}</span></div>
            ))}
          </div>
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#1E293B] uppercase tracking-wider mb-2">Activity Today</p>
            <div className="space-y-1 text-[11px] text-[#64748B]">
              <p>• Inbound: 2 shipments expected</p>
              <p>• Pick & pack: 4 orders</p>
              <p>• Outbound: UPS 2PM, Freight 4PM</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#1E293B] uppercase tracking-wider mb-2">Team</p>
            <div className="flex flex-col gap-1.5">
              {['Xerixes Guzman', 'Carlos Jiron'].map(n => (
                <div key={n} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center"><span className="text-[8px] font-bold text-white">{n.split(' ').map(x => x[0]).join('')}</span></div>
                  <span className="text-[11px] text-[#1E293B]">{n}</span>
                  <span className="px-1 py-0.5 bg-emerald-100 text-[#10B981] text-[8px] font-bold rounded">ON SITE</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-3 py-2.5 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-[11px] font-bold text-[#1E293B] mb-1">Turkana Overflow</p>
            <p className="text-[10px] text-[#64748B]">14,200 units | Repack: 2 | Outbound: 3 deployments</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-white rounded-lg border-l-[3px] border-l-[#EF4444] border border-[#E2E8F0] p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">At-Risk Orders</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Requires attention</p>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            <p className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider">Behind Schedule</p>
            <div className="bg-[#FEF2F2] rounded-lg p-3 border border-red-200">
              <p className="text-[12px] font-bold text-[#1E293B]">Fairmont Hotels — Robes & Amenities</p>
              <p className="text-[10px] text-[#64748B] mt-1">$24,000 | Due: Apr 15 | <span className="text-[#EF4444] font-semibold">Delayed 5 days</span></p>
              <p className="text-[10px] text-[#64748B]">Decorator behind on embroidery</p>
              <p className="text-[10px] text-[#64748B]">Impact: Client event Apr 18 — 3 day buffer</p>
              <p className="text-[10px] text-[#94A3B8] mt-1">Owner: Tina | Action: Call decorator</p>
            </div>
            <div className="bg-[#FEF2F2] rounded-lg p-3 border border-red-200">
              <p className="text-[12px] font-bold text-[#1E293B]">Amazon PO#4515 — PGK Scan Slings</p>
              <p className="text-[10px] text-[#64748B] mt-1">$52,000 | Due: Apr 10 | <span className="text-[#EF4444] font-semibold">QC: 2 defects</span></p>
              <p className="text-[10px] text-[#64748B]">2 of 500 defective — can ship 498</p>
              <p className="text-[10px] text-[#94A3B8] mt-1">Owner: Truscott | Action: Approve partial ship</p>
            </div>
            <p className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider mt-2">At Risk</p>
            <div className="bg-[#FFFBEB] rounded-lg p-3 border border-amber-200">
              <p className="text-[12px] font-bold text-[#1E293B]">SC Promo — Ocean Shipment RIM-44521</p>
              <p className="text-[10px] text-[#64748B] mt-1">$62,000 | ETA: Apr 12 | <span className="text-[#F59E0B] font-semibold">Weather delays possible</span></p>
              <p className="text-[10px] text-[#64748B]">Pacific weather advisory — 2-3 day delay</p>
              <p className="text-[10px] text-[#94A3B8] mt-1">Owner: Michael | Action: Monitor daily</p>
            </div>
            <div className="bg-[#FFFBEB] rounded-lg p-3 border border-amber-200">
              <p className="text-[12px] font-bold text-[#1E293B]">Securiti — Tech Kit Bundles</p>
              <p className="text-[10px] text-[#64748B] mt-1">$8,200 | Due: Apr 18 | <span className="text-[#F59E0B] font-semibold">Vendor slow to quote</span></p>
              <p className="text-[10px] text-[#64748B]">Hit Promo no pricing in 5 days</p>
              <p className="text-[10px] text-[#94A3B8] mt-1">Owner: Liz | Action: Escalate</p>
            </div>
          </div>
          <div className="mt-4 px-3 py-2 bg-slate-50 rounded-lg text-[11px] text-[#64748B] text-center">
            4 at-risk | $146,200 | Avg overdue: 2.3 days
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Customer Service Dashboard (Command Center) ───
function CustomerServiceDashboard({ data: _data }: { data: any }) {
  const [ticketFilter, setTicketFilter] = useState<'All' | 'Promo' | 'Amazon' | 'Urgent'>('All');
  const [ticketSort, setTicketSort] = useState('Priority');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const tickets = [
    { id: '#CS-1247', priority: 'Urgent', type: 'Misprint', client: 'Coca-Cola FL', desc: 'Logo color mismatch on 500 polo shirts — client rejected delivery', owner: 'Tina', age: '1d', status: 'In Progress', category: 'Promo' },
    { id: '#CS-1245', priority: 'Urgent', type: 'DC Not Received', client: 'Amazon - DEN4', desc: 'Denver DC reports PO #4521 not received — shipped 3/15 via UPS', owner: 'Michael', age: '3d', status: 'Investigating', category: 'Amazon' },
    { id: '#CS-1244', priority: 'Urgent', type: 'Lost Shipment', client: 'Fairmont Hotels', desc: 'UPS shows delivered but client says not received — 200 tote bags', owner: 'Liz', age: '2d', status: 'Escalated', category: 'Promo' },
    { id: '#CS-1248', priority: 'High', type: 'Vendor OOS', client: 'Oscar Health', desc: 'SanMar out of stock on Gildan 5000 in Navy XL — need alternative', owner: 'Liz', age: '0d', status: 'New', category: 'Promo' },
    { id: '#CS-1246', priority: 'High', type: 'Short Shipment', client: 'Amazon - SBD1', desc: 'San Bernardino DC received 480 of 500 units — 20 short', owner: 'Michael', age: '2d', status: 'In Progress', category: 'Amazon' },
    { id: '#CS-1243', priority: 'High', type: 'Production Delay', client: 'Securiti', desc: 'Embroidery vendor behind schedule — 2 weeks late on 300 jackets', owner: 'Tina', age: '5d', status: 'Waiting on Vendor', category: 'Promo' },
    { id: '#CS-1249', priority: 'Normal', type: 'Wrong Address', client: 'U of Miami', desc: 'Shipped to old campus address — need redirect or reship', owner: 'Liz', age: '0d', status: 'New', category: 'Promo' },
    { id: '#CS-1242', priority: 'Normal', type: 'Vendor OOS', client: 'Clear Spring', desc: 'Hit Promo discontinued item #P4320 — sourcing replacement', owner: 'Melody', age: '4d', status: 'Sourcing', category: 'Promo' },
    { id: '#CS-1241', priority: 'Normal', type: 'Shipping Delay', client: 'Pinnacle Live', desc: 'Unishippers shows delay — ETA pushed 3 days', owner: 'Liz', age: '3d', status: 'Monitoring', category: 'Promo' },
  ];

  const filteredTickets = tickets.filter(t => {
    if (ticketFilter === 'All') return true;
    if (ticketFilter === 'Promo') return t.category === 'Promo';
    if (ticketFilter === 'Amazon') return t.category === 'Amazon';
    if (ticketFilter === 'Urgent') return t.priority === 'Urgent';
    return true;
  });

  const trendData = [
    { week: 'W1', opened: 8, resolved: 5 },
    { week: 'W2', opened: 6, resolved: 7 },
    { week: 'W3', opened: 10, resolved: 8 },
    { week: 'W4', opened: 12, resolved: 9 },
    { week: 'W5', opened: 7, resolved: 10 },
    { week: 'W6', opened: 9, resolved: 11 },
    { week: 'W7', opened: 8, resolved: 10 },
    { week: 'W8', opened: 6, resolved: 8 },
  ];

  const categoryData = [
    { name: 'Vendor OOS / Replacement', count: 3, type: 'Promo' },
    { name: 'DC Order Not Received', count: 2, type: 'Amazon' },
    { name: 'Shipping Delay', count: 2, type: 'Promo' },
    { name: 'Short / Missing Units', count: 2, type: 'Amazon' },
    { name: 'Production Delay', count: 2, type: 'Promo' },
    { name: 'Misprint / Decoration Error', count: 1, type: 'Promo' },
    { name: 'Wrong Item Received', count: 1, type: 'Amazon' },
    { name: 'Wrong Item Delivered', count: 1, type: 'Promo' },
  ];

  const teamWorkload = [
    { name: 'Michael Roos', tickets: 4 },
    { name: 'Liz (PH)', tickets: 4 },
    { name: 'Tina Hunter', tickets: 3 },
    { name: 'Melody (PH)', tickets: 2 },
    { name: 'Truscott Miller', tickets: 1 },
  ];

  const resolutionRates = [
    { type: 'Vendor OOS', resolved: 6, avgTime: '3.1 days', trend: 'improving' as const },
    { type: 'Shipping Delay', resolved: 5, avgTime: '1.8 days', trend: 'stable' as const },
    { type: 'Production Delay', resolved: 3, avgTime: '5.2 days', trend: 'worsening' as const },
    { type: 'Misprint/Error', resolved: 2, avgTime: '4.0 days', trend: 'stable' as const },
    { type: 'Amazon DC Issues', resolved: 4, avgTime: '2.8 days', trend: 'improving' as const },
  ];

  const activityFeed = [
    { time: '10:42 AM', person: 'Tina', text: 'Added note to #CS-1247: "Vendor reprinting 500 units, new ETA April 4"', breach: false },
    { time: '10:15 AM', person: 'Michael', text: 'Escalated #CS-1245 to UPS claims department', breach: false },
    { time: '9:30 AM', person: 'Liz', text: 'Created ticket #CS-1248: Oscar Health — SanMar out of stock', breach: false },
    { time: '9:12 AM', person: 'Melody', text: 'Resolved #CS-1238: Replacement item approved by client', breach: false },
    { time: 'Yesterday 4:45 PM', person: 'Truscott', text: 'Assigned to #CS-1246: Amazon SBD1 short shipment', breach: false },
    { time: 'Yesterday 2:30 PM', person: 'System', text: 'SLA breach on #CS-1240 (resolved 6 hours late)', breach: true },
  ];

  const priorityColor = (p: string) => p === 'Urgent' ? '#EF4444' : p === 'High' ? '#F59E0B' : p === 'Normal' ? '#3B82F6' : '#94A3B8';
  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      'New': { bg: '#DBEAFE', text: '#1E40AF' }, 'In Progress': { bg: '#FEF3C7', text: '#92400E' },
      'Investigating': { bg: '#EDE9FE', text: '#5B21B6' }, 'Escalated': { bg: '#FEE2E2', text: '#991B1B' },
      'Waiting on Vendor': { bg: '#FFEDD5', text: '#9A3412' }, 'Sourcing': { bg: '#CCFBF1', text: '#115E59' },
      'Monitoring': { bg: '#F1F5F9', text: '#475569' },
    };
    const c = map[s] || { bg: '#F1F5F9', text: '#475569' };
    return <span className="px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap" style={{ backgroundColor: c.bg, color: c.text }}>{s}</span>;
  };

  return (
    <>
      {/* Row 1 - KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">OPEN TICKETS</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">14</h3>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5 bg-emerald-100 text-[#10B981] text-[11px] font-bold rounded-full">Promo: 9</span>
                <span className="px-2 py-0.5 bg-blue-100 text-[#3B82F6] text-[11px] font-bold rounded-full">Amazon: 5</span>
              </div>
              <div className="flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 text-[#EF4444]" /><span className="text-[11px] font-semibold text-[#EF4444]">3 unassigned</span></div>
            </div>
            <div className="w-11 h-11 bg-[#F97066] rounded-full flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#FEF2F2] rounded-lg border border-red-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">URGENT ISSUES</p>
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] md:text-[24px] font-bold text-[#EF4444]">3</h3>
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444]"></span></span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1 leading-tight">1 Amazon DC complaint • 1 misprint • 1 lost shipment</p>
            </div>
            <div className="w-11 h-11 bg-[#EF4444] rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">AVG RESOLUTION TIME</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">2.4 days</h3>
              <div className="flex items-center gap-1 mt-1"><TrendingDown className="w-3.5 h-3.5 text-[#10B981]" /><span className="text-[12px] font-semibold text-[#10B981]">Improved from 3.1 days</span></div>
            </div>
            <div className="w-11 h-11 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">RESOLVED THIS WEEK</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">8</h3>
              <p className="text-[12px] text-[#64748B] mt-1">Promo: 5 | Amazon: 3</p>
              <div className="mt-1.5">
                <div className="flex justify-between text-[10px] text-[#64748B] mb-0.5"><span>8 of 12 target</span><span>67%</span></div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#10B981] rounded-full" style={{ width: '67%' }} /></div>
              </div>
            </div>
            <div className="w-11 h-11 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">SLA COMPLIANCE (MTD)</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#F59E0B]">87%</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Target: 95% — 2 tickets breached SLA</p>
            </div>
            <div className="w-11 h-11 bg-[#F59E0B] rounded-full flex items-center justify-center shrink-0"><Shield className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>
      </div>

      {/* Row 2 - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="mb-1">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Open Tickets by Category</h3>
            <p className="text-[12px] text-[#64748B]">Current active issues</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 4]} />
              <YAxis type="category" dataKey="name" width={170} stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.type === 'Amazon' ? '#3B82F6' : '#10B981'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#10B981]" /><span className="text-[11px] text-[#64748B]">Promo</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#3B82F6]" /><span className="text-[11px] text-[#64748B]">Amazon/PPE</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1E293B]">Ticket Volume Trend</h3>
              <p className="text-[12px] text-[#64748B]">Last 8 weeks — opened vs resolved</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-[#10B981] text-[11px] font-bold rounded-full border border-emerald-200">Trending positive</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="csResG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                <linearGradient id="csOpnG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F97066" stopOpacity={0.15} /><stop offset="95%" stopColor="#F97066" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 20]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2.5} fill="url(#csResG)" dot={{ fill: '#10B981', r: 3 }} name="Resolved" />
              <Area type="monotone" dataKey="opened" stroke="#F97066" strokeWidth={2.5} fill="url(#csOpnG)" dot={{ fill: '#F97066', r: 3 }} name="Opened" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#10B981]" /><span className="text-[11px] text-[#64748B]">Resolved</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#F97066]" /><span className="text-[11px] text-[#64748B]">Opened</span></div>
          </div>
        </motion.div>
      </div>

      {/* Row 3 - Active Tickets (60%) + Amazon Issues (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-3 bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[16px] font-semibold text-[#1E293B]">Active Tickets</h3>
              <div className="flex gap-1 ml-2">
                {(['All', 'Promo', 'Amazon', 'Urgent'] as const).map(f => (
                  <button key={f} onClick={() => setTicketFilter(f)} className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all ${ticketFilter === f ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'}`}>{f}</button>
                ))}
              </div>
            </div>
            <select value={ticketSort} onChange={e => setTicketSort(e.target.value)} className="text-[11px] border border-[#E2E8F0] rounded-lg px-2 py-1 text-[#64748B] bg-white">
              <option>Priority</option><option>Age</option><option>Client</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="bg-slate-50 border-b border-[#E2E8F0]">
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[11px] uppercase">Pri</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[11px] uppercase">Ticket</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[11px] uppercase">Type</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[11px] uppercase">Client</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[11px] uppercase max-w-[200px]">Description</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[11px] uppercase">Owner</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[11px] uppercase">Age</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[11px] uppercase">Status</th>
              </tr></thead>
              <tbody>
                {filteredTickets.map(t => (
                  <tr key={t.id} onClick={() => setExpandedTicket(expandedTicket === t.id ? null : t.id)} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                    <td className="px-2 py-2.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: priorityColor(t.priority) }} /></td>
                    <td className="px-2 py-2.5 font-semibold text-[#3B82F6] whitespace-nowrap">{t.id}</td>
                    <td className="px-2 py-2.5 text-[#1E293B] whitespace-nowrap">{t.type}</td>
                    <td className="px-2 py-2.5 text-[#1E293B] font-medium whitespace-nowrap">{t.client}</td>
                    <td className="px-2 py-2.5 text-[#64748B] max-w-[200px] truncate">{t.desc}</td>
                    <td className="px-2 py-2.5 text-[#1E293B] whitespace-nowrap">{t.owner}</td>
                    <td className="px-2 py-2.5 whitespace-nowrap"><span className={`text-[12px] font-semibold ${t.priority === 'Urgent' ? 'text-[#EF4444]' : 'text-[#64748B]'}`}>{t.age}</span></td>
                    <td className="px-2 py-2.5">{statusBadge(t.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-[#64748B]">
            <span>Showing {filteredTickets.length} of 14 tickets</span>
            <div className="flex gap-1">
              <button className="px-2.5 py-1 bg-[#1B2A4A] text-white rounded text-[11px] font-semibold">1</button>
              <button className="px-2.5 py-1 bg-slate-100 text-[#64748B] rounded text-[11px] hover:bg-slate-200">2</button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-[#F0F7FF] rounded-lg border-l-[3px] border-l-[#3B82F6] border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="mb-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Amazon / PPE Issues</h3>
            <p className="text-[12px] text-[#64748B]">These impact the IPF relationship — resolve with urgency</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-[#FEE2E2] text-[#991B1B] text-[10px] font-bold rounded">URGENT</span>
                <span className="px-2 py-0.5 bg-[#FEE2E2] text-[#EF4444] text-[10px] font-bold rounded-full">3 days</span>
              </div>
              <p className="text-[13px] font-bold text-[#1E293B] mb-1">DEN4 — PO #4521 Not Received</p>
              <p className="text-[11px] text-[#64748B] leading-relaxed">Shipped 3/15 via UPS • Tracking: 1Z999AA10123456784</p>
              <p className="text-[11px] text-[#64748B]">Amazon contact: Sarah Kim (denver-dc@amazon.com)</p>
              <p className="text-[11px] text-[#64748B]">Owner: <span className="font-semibold text-[#1E293B]">Michael Roos</span></p>
              <div className="mt-2 px-2.5 py-1.5 bg-amber-50 rounded text-[11px] text-amber-800 font-medium">Action: File UPS claim, provide Amazon with proof of delivery</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold rounded">HIGH</span>
                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#F59E0B] text-[10px] font-bold rounded-full">2 days</span>
              </div>
              <p className="text-[13px] font-bold text-[#1E293B] mb-1">SBD1 — Short Shipment (20 units)</p>
              <p className="text-[11px] text-[#64748B] leading-relaxed">PO #4518 • Iron Bound Safety Gloves SKU IBS-2240</p>
              <p className="text-[11px] text-[#64748B]">Received 480 of 500</p>
              <p className="text-[11px] text-[#64748B]">Owner: <span className="font-semibold text-[#1E293B]">Michael Roos</span></p>
              <div className="mt-2 px-2.5 py-1.5 bg-amber-50 rounded text-[11px] text-amber-800 font-medium">Action: Ship replacement 20 units within 48 hours</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold rounded">HIGH</span>
                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#F59E0B] text-[10px] font-bold rounded-full">1 day</span>
              </div>
              <p className="text-[13px] font-bold text-[#1E293B] mb-1">ONT6 — Wrong Item Received</p>
              <p className="text-[11px] text-[#64748B] leading-relaxed">PO #4512 • Ordered Arctic Trax thermal, received Scan Sling holsters</p>
              <p className="text-[11px] text-[#64748B]">Owner: <span className="font-semibold text-[#1E293B]">Truscott Miller</span></p>
              <div className="mt-2 px-2.5 py-1.5 bg-amber-50 rounded text-[11px] text-amber-800 font-medium">Action: Arrange return pickup, expedite correct shipment</div>
            </div>
          </div>
          <div className="mt-4 px-3 py-2 bg-slate-100 rounded-lg text-[11px] text-[#64748B] text-center">
            5 Amazon issues MTD | Avg resolution: 3.2 days | 0 unresolved past SLA
          </div>
        </motion.div>
      </div>

      {/* Row 4 - Three panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <h3 className="text-[16px] font-semibold text-[#1E293B] mb-4">Team Workload</h3>
          <div className="space-y-3">
            {teamWorkload.map(m => (
              <div key={m.name} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white">{m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[12px] mb-0.5">
                    <span className="font-medium text-[#1E293B]">{m.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1E293B]">{m.tickets}</span>
                      {m.tickets >= 5 && <span className="px-1.5 py-0.5 bg-[#FFEDD5] text-[#9A3412] text-[9px] font-bold rounded">At capacity</span>}
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${m.tickets >= 5 ? 'bg-[#F59E0B]' : m.tickets >= 4 ? 'bg-[#3B82F6]' : 'bg-[#10B981]'}`} style={{ width: `${(m.tickets / 6) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2.5 bg-[#FEF2F2] rounded-lg border border-red-200 mt-2">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /><span className="text-[12px] font-bold text-[#EF4444]">Unassigned: 3</span></div>
              <button className="px-2.5 py-1 bg-[#EF4444] text-white text-[11px] font-bold rounded-lg hover:bg-red-600 transition-colors">Assign Now</button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="mb-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Resolution Rates by Type</h3>
            <p className="text-[12px] text-[#64748B]">Last 30 days</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
            <table className="w-full text-[12px]">
              <thead><tr className="bg-slate-50">
                <th className="text-left px-2.5 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Type</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Resolved</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Avg Time</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase">Trend</th>
              </tr></thead>
              <tbody>
                {resolutionRates.map(r => (
                  <tr key={r.type} className={`border-t border-[#E2E8F0] ${r.trend === 'worsening' ? 'bg-red-50' : 'hover:bg-[#F8FAFC]'}`}>
                    <td className="px-2.5 py-2 font-medium text-[#1E293B]">{r.type}</td>
                    <td className="px-2 py-2 text-center font-semibold text-[#1E293B]">{r.resolved}</td>
                    <td className="px-2 py-2 text-center text-[#64748B]">{r.avgTime}</td>
                    <td className="px-2 py-2 text-center">
                      {r.trend === 'improving' && <span className="text-[#10B981] font-semibold">↓ improving</span>}
                      {r.trend === 'stable' && <span className="text-[#94A3B8] font-semibold">→ stable</span>}
                      {r.trend === 'worsening' && <span className="text-[#EF4444] font-semibold">↑ worsening</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="mb-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Activity Log</h3>
            <p className="text-[12px] text-[#64748B]">Latest updates</p>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {activityFeed.map((a, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-2 rounded-lg ${a.breach ? 'bg-[#FEF2F2] border border-red-200' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${a.person === 'System' ? 'bg-red-100' : 'bg-slate-100'}`}>
                  {a.person === 'System' ? <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" /> : <span className="text-[9px] font-bold text-[#64748B]">{a.person.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#94A3B8] mb-0.5">{a.time}</p>
                  <p className="text-[13px] text-[#1E293B] leading-snug"><span className="font-semibold">{a.person}</span> {a.text}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 text-[12px] text-[#3B82F6] font-semibold hover:underline">View full log</button>
        </motion.div>
      </div>
    </>
  );
}

// ─── Finance Dashboard (Command Center) ───
function FinanceDashboard({ data }: { data: any }) {
  const [cfView, setCfView] = useState<'weekly' | 'monthly'>('weekly');

  const weeklyForecast = [
    { week: 'W1', month: 'Apr', inflow: 85000, outflow: -68000, balance: 159350 },
    { week: 'W2', month: 'Apr', inflow: 42000, outflow: -55000, balance: 146350 },
    { week: 'W3', month: 'Apr', inflow: 210000, outflow: -72000, balance: 284350 },
    { week: 'W4', month: 'Apr', inflow: 38000, outflow: -61000, balance: 261350 },
    { week: 'W5', month: 'May', inflow: 65000, outflow: -78000, balance: 248350 },
    { week: 'W6', month: 'May', inflow: 48000, outflow: -52000, balance: 244350 },
    { week: 'W7', month: 'May', inflow: 72000, outflow: -69000, balance: 247350 },
    { week: 'W8', month: 'May', inflow: 55000, outflow: -63000, balance: 239350 },
    { week: 'W9', month: 'Jun', inflow: 91000, outflow: -74000, balance: 256350 },
    { week: 'W10', month: 'Jun', inflow: 44000, outflow: -58000, balance: 242350 },
    { week: 'W11', month: 'Jun', inflow: 68000, outflow: -71000, balance: 239350 },
    { week: 'W12', month: 'Jun', inflow: 52000, outflow: -65000, balance: 226350 },
    { week: 'W13', month: 'Jul', inflow: 78000, outflow: -70000, balance: 234350 },
  ];

  const revenueByClass = [
    { name: 'PPE / Amazon', value: 448000, color: '#3B82F6' },
    { name: 'Promo', value: 135000, color: '#10B981' },
  ];

  const arAging = [
    { bucket: 'Current (0-30 days)', amount: 312400, invoices: 18, pct: 64, color: '#10B981' },
    { bucket: '31-60 days', amount: 98200, invoices: 7, pct: 20, color: '#F59E0B' },
    { bucket: '61-90 days', amount: 64100, invoices: 4, pct: 13, color: '#F97316' },
    { bucket: '90+ days', amount: 12500, invoices: 2, pct: 3, color: '#EF4444' },
  ];

  const apSchedule = [
    { period: 'Due This Week', color: '#EF4444', items: [{ name: 'Payroll', amount: 22400 }, { name: 'Parents (Equipment)', amount: 20000 }, { name: 'SBA EIDL', amount: 731 }] },
    { period: 'Due Next Week', color: '#F59E0B', items: [{ name: 'SC Promo Inv', amount: 38200 }, { name: 'Unishippers (UPS)', amount: 12400 }] },
    { period: 'Due in 15-30 Days', color: '#94A3B8', items: [{ name: 'Turkana Tools', amount: 45000 }, { name: 'SanMar', amount: 8900 }, { name: 'Other vendors', amount: 14200 }] },
  ];

  const gmSparkline = [
    { month: 'Oct', promo: 32.1, ppe: 19.8 },
    { month: 'Nov', promo: 33.0, ppe: 19.5 },
    { month: 'Dec', promo: 32.8, ppe: 19.2 },
    { month: 'Jan', promo: 33.5, ppe: 19.0 },
    { month: 'Feb', promo: 33.8, ppe: 19.1 },
    { month: 'Mar', promo: 34.2, ppe: 18.7 },
  ];

  const debtMonths = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const paidMonths = 3;
  const revenueMTD = 583000;
  const apDue30 = 215800;

  return (
    <>
      {/* Row 1 - KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">CASH BALANCE</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$142,350</h3>
              <div className="flex items-center gap-1 mt-1"><TrendingUp className="w-3.5 h-3.5 text-[#10B981]" /><span className="text-[12px] font-semibold text-[#10B981]">+$18,200 vs last week</span></div>
            </div>
            <div className="w-11 h-11 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><Landmark className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">TOTAL AR OUTSTANDING</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$487,200</h3>
              <p className="text-[12px] text-[#64748B] mt-1">IPF/Amazon: $412,000 | Promo: $75,200</p>
            </div>
            <div className="w-11 h-11 bg-[#3B82F6] rounded-full flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">AP DUE NEXT 30 DAYS</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$215,800</h3>
              <p className="text-[12px] text-[#F59E0B] font-semibold mt-1">Due this week: $68,400</p>
            </div>
            <div className="w-11 h-11 bg-[#F59E0B] rounded-full flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">REVENUE (MTD)</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$583,000</h3>
              <div className="flex gap-1.5 mt-1.5">
                <span className="px-2 py-0.5 bg-blue-100 text-[#3B82F6] text-[11px] font-bold rounded-full">PPE $448K</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-[#10B981] text-[11px] font-bold rounded-full">Promo $135K</span>
              </div>
            </div>
            <div className="w-11 h-11 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><DollarSign className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">30-DAY CASH FORECAST</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$94,750</h3>
              <p className="text-[12px] text-[#10B981] font-semibold mt-1">Sufficient runway</p>
            </div>
            <div className="w-11 h-11 bg-[#8B5CF6] rounded-full flex items-center justify-center shrink-0"><Eye className="w-5 h-5 text-white" /></div>
          </div>
        </motion.div>
      </div>

      {/* Row 2 - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1E293B]">Cash Flow Forecast</h3>
              <p className="text-[12px] text-[#64748B]">13-week forward projection</p>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setCfView('weekly')} className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${cfView === 'weekly' ? 'bg-white text-[#1E293B] shadow-sm' : 'text-[#64748B]'}`}>Weekly</button>
              <button onClick={() => setCfView('monthly')} className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${cfView === 'monthly' ? 'bg-white text-[#1E293B] shadow-sm' : 'text-[#64748B]'}`}>Monthly</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={weeklyForecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="finInflowG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.9} /><stop offset="100%" stopColor="#10B981" stopOpacity={0.7} /></linearGradient>
                <linearGradient id="finOutflowG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.7} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0.9} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(Math.abs(v)/1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: 12 }} formatter={(value: any, name: string) => [`$${Math.abs(Number(value)).toLocaleString()}`, name]} />
              <ReferenceLine yAxisId="right" y={50000} stroke="#EF4444" strokeDasharray="5 5" label={{ value: 'Min $50K', position: 'left', fontSize: 10, fill: '#EF4444' }} />
              <Bar key="bar-inflow" yAxisId="left" dataKey="inflow" fill="url(#finInflowG)" radius={[3, 3, 0, 0]} name="Inflows" />
              <Bar key="bar-outflow" yAxisId="left" dataKey="outflow" fill="url(#finOutflowG)" radius={[0, 0, 3, 3]} name="Outflows" />
              <Line key="line-balance" yAxisId="right" type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Cash Balance" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#10B981]" /><span className="text-[11px] text-[#64748B]">Inflows</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#EF4444]" /><span className="text-[11px] text-[#64748B]">Outflows</span></div>
            <div className="flex items-center gap-1.5"><div className="w-6 h-0 border-t-2 border-dashed border-[#3B82F6]" /><span className="text-[11px] text-[#64748B]">Cash Balance</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="mb-1">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Revenue by Class</h3>
            <p className="text-[12px] text-[#64748B]">Month-to-date breakdown</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <PieChart width={220} height={220}>
                  <Pie data={revenueByClass} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value" nameKey="name">
                    {revenueByClass.map((entry, idx) => <Cell key={`rev-class-${idx}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[22px] font-bold text-[#1E293B]">$583K</span>
                <span className="text-[11px] text-[#64748B]">Total MTD</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {revenueByClass.map(r => (
              <div key={r.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-[11px] text-[#64748B] font-medium">{r.name} — ${(r.value/1000).toFixed(0)}K ({Math.round(r.value / revenueMTD * 100)}%)</span>
              </div>
            ))}
          </div>
          <div className="mt-4 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-amber-800">Concentration Alert</p>
              <p className="text-[11px] text-amber-700">PPE at 77% of revenue — Target: &lt;50% by EOY</p>
            </div>
          </div>
          <p className="text-[11px] text-[#64748B] text-center mt-2">vs. Last Month: PPE 74% | Promo 26%</p>
        </motion.div>
      </div>

      {/* Row 3 - AR Aging & AP Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Accounts Receivable Aging</h3>
            <button className="text-[12px] text-[#3B82F6] font-semibold hover:underline">View All</button>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            {arAging.map(a => <div key={a.bucket} className="h-full" style={{ width: `${a.pct}%`, backgroundColor: a.color }} />)}
          </div>
          <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
            <table className="w-full text-[13px]">
              <thead><tr className="bg-slate-50">
                <th className="text-left px-3 py-2 font-semibold text-[#64748B]">Bucket</th>
                <th className="text-right px-3 py-2 font-semibold text-[#64748B]">Amount</th>
                <th className="text-right px-3 py-2 font-semibold text-[#64748B]">Inv.</th>
                <th className="text-right px-3 py-2 font-semibold text-[#64748B]">%</th>
              </tr></thead>
              <tbody>{arAging.map(a => (
                <tr key={a.bucket} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                  <td className="px-3 py-2.5 font-medium text-[#1E293B] flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />{a.bucket}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-[#1E293B]">${a.amount.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-[#64748B]">{a.invoices}</td>
                  <td className="px-3 py-2.5 text-right text-[#64748B]">{a.pct}%</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="mt-4 bg-[#1B2A4A] rounded-lg p-4 text-white">
            <h4 className="text-[13px] font-bold mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4" /> IPF/Amazon Receivables</h4>
            <div className="grid grid-cols-3 gap-3 text-[12px] mb-3">
              <div><p className="text-slate-400 text-[10px]">Outstanding</p><p className="font-bold">$412,000</p></div>
              <div><p className="text-slate-400 text-[10px]">Next Payment</p><p className="font-bold">$210,000</p><p className="text-slate-400 text-[10px]">April 15</p></div>
              <div><p className="text-slate-400 text-[10px]">Days Until</p><p className="font-bold">17</p></div>
            </div>
            <div className="relative h-2 bg-slate-600 rounded-full overflow-hidden"><div className="h-full bg-[#10B981] rounded-full" style={{ width: '81%' }} /></div>
            <p className="text-[10px] text-slate-400 mt-1">Net 90 cycle — 73 of 90 days elapsed</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Accounts Payable Schedule</h3>
            <button className="text-[12px] text-[#3B82F6] font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-5">
            {apSchedule.map(period => (
              <div key={period.period}>
                <div className="flex items-center gap-2 mb-2"><div className="w-1 h-5 rounded-full" style={{ backgroundColor: period.color }} /><h4 className="text-[13px] font-bold text-[#1E293B]">{period.period}</h4></div>
                <div className="space-y-1.5 ml-3">
                  {period.items.map(item => (
                    <div key={item.name} className="flex items-center justify-between px-3 py-2 bg-[#F8FAFC] rounded-lg hover:bg-slate-100 transition-colors">
                      <span className="text-[13px] text-[#1E293B] font-medium">{item.name}</span>
                      <span className="text-[13px] font-semibold text-[#1E293B]">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#1E293B]">Total Due 30 Days</span>
            <span className="text-[18px] font-bold text-[#1E293B]">${apDue30.toLocaleString()}</span>
          </div>
        </motion.div>
      </div>

      {/* Row 4 - Gross Margin & Debt Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="mb-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Gross Margin by Class</h3>
            <p className="text-[12px] text-[#64748B]">MTD vs Target</p>
          </div>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-semibold text-[#1E293B]">Promo Gross Margin</span>
              <span className="text-[20px] font-bold text-[#10B981]">34.2%</span>
            </div>
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981] rounded-full" style={{ width: '34.2%' }} />
              <div className="absolute top-0 h-full w-0.5 bg-[#1E293B]" style={{ left: '35%' }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-[#64748B]">vs. Last Month: 33.8% (+0.4 pts)</span>
              <span className="text-[11px] text-[#64748B] font-semibold">Target: 35%</span>
            </div>
          </div>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-[#1E293B]">PPE Gross Margin</span>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-[#64748B] cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-52 bg-[#1E293B] text-white text-[11px] p-2 rounded-lg shadow-lg z-10">Compressed by IPF billing structure. Actual economic margin is higher.</div>
                </div>
              </div>
              <span className="text-[20px] font-bold text-[#3B82F6]">18.7%</span>
            </div>
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#3B82F6] rounded-full" style={{ width: '18.7%' }} /></div>
            <span className="text-[11px] text-[#64748B] mt-1 block">vs. Last Month: 19.1% (-0.4 pts)</span>
          </div>
          <div className="mb-4 px-3 py-2.5 bg-slate-50 rounded-lg">
            <p className="text-[13px] text-[#64748B]"><span className="font-semibold">Blended GM%: 24.3%</span></p>
            <p className="text-[11px] text-[#64748B] mt-0.5">Note: Blended margin declines as PPE grows as % of revenue. Track Promo GM% as the primary health metric.</p>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={gmSparkline}>
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis domain={[15, 40]} hide />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(v: any) => `${v}%`} />
              <Line type="monotone" dataKey="promo" stroke="#10B981" strokeWidth={2} dot={{ r: 2.5 }} name="Promo GM%" />
              <Line type="monotone" dataKey="ppe" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2.5 }} name="PPE GM%" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-1">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#10B981]" /><span className="text-[10px] text-[#64748B]">Promo GM%</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#3B82F6]" /><span className="text-[10px] text-[#64748B]">PPE GM%</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="mb-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B]">Equipment Debt Paydown</h3>
            <p className="text-[12px] text-[#64748B]">Goal: Clear by December 2026</p>
          </div>
          <div className="flex justify-center mb-4">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#10B981" strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * 0.75}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-bold text-[#1E293B]">$179,000</span>
                <span className="text-[11px] text-[#64748B]">remaining</span>
              </div>
            </div>
          </div>
          <p className="text-center text-[12px] text-[#64748B] mb-4">of $239,000 original balance</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="px-3 py-2.5 bg-[#F8FAFC] rounded-lg">
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Paid to Date</p>
              <p className="text-[14px] font-bold text-[#10B981] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> $60,000</p>
            </div>
            <div className="px-3 py-2.5 bg-[#F8FAFC] rounded-lg">
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Monthly Payment</p>
              <p className="text-[14px] font-bold text-[#1E293B]">$20,000</p>
            </div>
            <div className="px-3 py-2.5 bg-[#F8FAFC] rounded-lg">
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Projected Payoff</p>
              <p className="text-[14px] font-bold text-[#1E293B]">Dec 2026</p>
            </div>
            <div className="px-3 py-2.5 bg-[#F8FAFC] rounded-lg">
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Months Remaining</p>
              <p className="text-[14px] font-bold text-[#1E293B]">9</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            {debtMonths.map((m, i) => (
              <div key={m} className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full border-2 ${i < paidMonths ? 'bg-[#10B981] border-[#10B981]' : 'bg-white border-[#E2E8F0]'}`} />
                <span className="text-[9px] text-[#64748B] font-medium">{m}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Main Dashboard Export ───
export function Dashboard({ initialDepartment }: { initialDepartment?: Department } = {}) {
  const [department, setDepartment] = useState<Department>(initialDepartment || 'Executive');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data sources in parallel for live stats
      const [ordersRes, inventoryRes, customersRes, shipmentsRes, vendorsRes, posRes, pickRes, leadsRes, productionRes] = await Promise.all([
        apiGetJson('/api/orders/list', { orders: [] }),
        apiGetJson('/api/inventory/list', { items: [] }),
        apiGetJson('/api/customers/list', { customers: [] }),
        apiGetJson('/api/shipments/list', { shipments: [] }),
        apiGetJson('/api/vendors/list', { vendors: [] }),
        apiGetJson('/api/purchasing/list', { purchaseOrders: [] }),
        apiGetJson('/api/pick-lists/list', { pickLists: [] }),
        apiGetJson('/api/sales-leads/list', { leads: [] }),
        apiGetJson('/api/production/list', { orders: [] }),
      ]);

      const orders = ordersRes.orders || [];
      const inventory = inventoryRes.items || inventoryRes.inventory || [];
      const customers = customersRes.customers || [];
      const shipments = shipmentsRes.shipments || [];
      const vendors = vendorsRes.vendors || [];
      const pos = posRes.purchaseOrders || [];
      const pickLists = pickRes.pickLists || [];
      const leads = leadsRes.leads || [];
      const production = productionRes.orders || productionRes.productionOrders || [];

      // Orders by status
      const ordersByStatus = {
        pending: orders.filter((o: any) => o.status === 'Pending' || o.status === 'New').length,
        inProgress: orders.filter((o: any) => o.status === 'In Progress' || o.status === 'Processing').length,
        shipped: orders.filter((o: any) => o.status === 'Shipped').length,
        delivered: orders.filter((o: any) => o.status === 'Delivered' || o.status === 'Completed').length,
      };

      // Inventory stats
      const lowStockItems = inventory.filter((i: any) => i.quantity <= (i.minStock || 0)).length;
      const inventoryValue = inventory.reduce((s: number, i: any) => s + ((parseFloat(String(i.unitCost || '0').replace('$', '')) || 0) * (i.quantity || 0)), 0);

      // PO stats
      const activePOs = pos.filter((p: any) => p.status !== 'Delivered' && p.status !== 'Cancelled' && p.status !== 'Completed').length;
      const pendingPOs = pos.filter((p: any) => p.status === 'Draft' || p.status === 'Pending').length;

      // Sales leads
      const activeDeals = leads.filter((l: any) => l.stage !== 'closed-lost' && l.stage !== 'closed-won').length;
      const pipelineValue = leads.filter((l: any) => l.stage !== 'closed-lost' && l.stage !== 'closed-won').reduce((s: number, l: any) => s + (l.amount || 0), 0);
      const wonValue = leads.filter((l: any) => l.stage === 'closed-won').reduce((s: number, l: any) => s + (l.amount || 0), 0);
      const lostDeals = leads.filter((l: any) => l.stage === 'closed-lost').length;
      const wonDeals = leads.filter((l: any) => l.stage === 'closed-won').length;
      const winRate = (wonDeals + lostDeals) > 0 ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) : 0;
      const avgDealSize = activeDeals > 0 ? Math.round(pipelineValue / activeDeals) : 0;
      const staleLeads = leads.filter((l: any) => {
        if (l.stage === 'closed-won' || l.stage === 'closed-lost') return false;
        const daysSince = l.lastActivity ? Math.floor((Date.now() - new Date(l.lastActivity).getTime()) / 86400000) : 999;
        return daysSince > 7;
      }).length;

      // Top deals
      const topDeals = leads
        .filter((l: any) => l.stage !== 'closed-lost' && l.stage !== 'closed-won')
        .sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0))
        .slice(0, 5)
        .map((l: any) => ({ title: l.title, company: l.company, amount: l.amount }));

      // Shipment stats
      const activeShipments = shipments.filter((s: any) => s.status === 'In Transit' || s.status === 'Shipped').length;

      // Pick list stats
      const openPickLists = pickLists.filter((p: any) => p.status !== 'Completed' && p.status !== 'Packed').length;
      const pendingPicks = pickLists.filter((p: any) => p.status === 'Pending').length;
      const inProgressPicks = pickLists.filter((p: any) => p.status === 'In Progress').length;
      const completedPicks = pickLists.filter((p: any) => p.status === 'Completed').length;

      setData({
        activeOrders: orders.filter((o: any) => o.status !== 'Delivered' && o.status !== 'Completed' && o.status !== 'Cancelled').length,
        ordersByStatus,
        totalInventory: inventory.length,
        lowStockItems,
        inventoryValue: Math.round(inventoryValue),
        totalCustomers: customers.length,
        totalContacts: 0,
        totalVendors: vendors.length,
        activeShipments,
        activePOs,
        pendingPOs,
        openPickLists,
        pendingPicks,
        inProgressPicks,
        completedPicks,
        activeDeals,
        pipelineValue,
        wonValue,
        lostDeals,
        winRate,
        avgDealSize,
        staleLeads,
        topDeals: topDeals.length > 0 ? topDeals : [{ title: 'No deals yet', amount: 0, company: 'Create deals in Sales Leads' }],
        pendingReceiving: 0,
        totalRevenue: orders.reduce((s: number, o: any) => s + (parseFloat(String(o.total || '0').replace('$', '').replace(',', '')) || 0), 0) || 71000,
        avgOrderValue: orders.length > 0 ? Math.round(orders.reduce((s: number, o: any) => s + (parseFloat(String(o.total || '0').replace('$', '').replace(',', '')) || 0), 0) / orders.length) : 0,
        readyToShip: pickLists.filter((p: any) => p.status === 'Completed').length,
        inProduction: production.filter((p: any) => p.status === 'In Progress' || p.status === 'In Production').length,
        pendingProduction: production.filter((p: any) => p.status === 'Pending' || p.status === 'Planned').length,
        delayedProduction: production.filter((p: any) => p.status === 'Delayed').length,
        completedProduction: production.filter((p: any) => p.status === 'Completed').length,
        vendorSpend: pos.reduce((s: number, p: any) => s + (parseFloat(String(p.total || '0').replace('$', '').replace(',', '')) || 0), 0),
        outstandingPOValue: pos.filter((p: any) => p.status !== 'Delivered' && p.status !== 'Cancelled').reduce((s: number, p: any) => s + (parseFloat(String(p.total || '0').replace('$', '').replace(',', '')) || 0), 0),
      });
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const currentDept = DEPARTMENTS.find(d => d.id === department)!;
  const DeptIcon = currentDept.icon;

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Command Center</h2>
            <p className="text-slate-500 text-sm">Real-time overview of your operations</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Department Dropdown */}
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className={`flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r ${currentDept.color} text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all`}>
                <DeptIcon className="w-4 h-4" />
                <span className="text-sm">{currentDept.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-slate-200 shadow-xl z-30 py-1 overflow-hidden">
                  {DEPARTMENTS.map(d => {
                    const DIco = d.icon;
                    return (
                      <button key={d.id} onClick={() => { setDepartment(d.id); setDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${department === d.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
                        <div className={`w-7 h-7 bg-gradient-to-br ${d.color} rounded-lg flex items-center justify-center`}><DIco className="w-3.5 h-3.5 text-white" /></div>
                        {d.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
            <button onClick={fetchDashboardData} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-sm text-slate-500">Loading dashboard data...</span>
            </div>
          </div>
        ) : (
          <>
            {department === 'Executive' && <ExecutiveOverview />}
            {department === 'Sales' && <SalesDashboard data={data} />}
            {department === 'Operations' && <OperationsDashboard data={data} />}
            {department === 'Customer Service' && <CustomerServiceDashboard data={data} />}
            {department === 'Finance' && <FinanceDashboard data={data} />}
          </>
        )}
      </div>
    </div>
  );
}