import { useState } from 'react';
import { Download, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const tabs = ['P&L Summary', 'P&L by Class', 'Expense Breakdown', 'Margin Analysis', 'Cash Flow Detail', 'AR Aging Detail', 'AP Detail', 'Budget vs Actual'];

const plData = [
  { item: 'Revenue', current: 583000, prior: 547000, ly: 412000, bold: true },
  { item: 'COGS', current: -442280, prior: -415720, ly: -310000 },
  { item: 'Gross Profit', current: 140720, prior: 131280, ly: 102000, bold: true },
  { item: 'Gross Margin %', current: 24.1, prior: 24.0, ly: 25.2, isPct: true },
  { item: '---', divider: true },
  { item: 'Wages & Related', current: -29200, prior: -28500, ly: -26000 },
  { item: 'Professional Fees', current: -3533, prior: -3533, ly: -3200 },
  { item: 'Dues & Subscriptions', current: -4325, prior: -4325, ly: -3800 },
  { item: 'Marketing', current: -2000, prior: -2000, ly: -1500 },
  { item: 'Merchant Processing', current: -3425, prior: -3200, ly: -2400 },
  { item: 'Rent & Facilities', current: -3500, prior: -3500, ly: -3500 },
  { item: 'Shipping & Fulfillment', current: -6800, prior: -5900, ly: -4200 },
  { item: 'Insurance', current: -1900, prior: -1900, ly: -1800 },
  { item: 'Equipment Payments', current: -20000, prior: -20000, ly: -20000 },
  { item: 'SBA EIDL', current: -731, prior: -731, ly: -731 },
  { item: 'Other', current: -2500, prior: -2100, ly: -1800 },
  { item: 'Total Operating Expenses', current: -77914, prior: -75689, ly: -68931, bold: true },
  { item: 'Net Operating Income', current: 62806, prior: 55591, ly: 33069, bold: true },
  { item: 'Interest & Other', current: -741, prior: -741, ly: -741 },
  { item: 'Net Income', current: 62065, prior: 54850, ly: 32328, bold: true },
  { item: 'Net Margin %', current: 10.6, prior: 10.0, ly: 7.8, isPct: true, bold: true },
];

const plByClassData = [
  { item: 'Revenue', ppe: 448000, promo: 135000, shared: null, total: 583000, bold: true },
  { item: 'COGS', ppe: -365100, promo: -77180, shared: null, total: -442280 },
  { item: 'Gross Profit', ppe: 82900, promo: 57820, shared: null, total: 140720, bold: true },
  { item: 'Gross Margin %', ppe: 18.5, promo: 42.8, shared: null, total: 24.1, isPct: true, bold: true },
  { item: 'Shared Allocation', ppe: -42380, promo: -35534, shared: -77914, total: 0 },
  { item: 'Contribution Margin', ppe: 40520, promo: 22286, shared: null, total: 62806, bold: true },
  { item: 'Contribution %', ppe: 9.0, promo: 16.5, shared: null, total: 10.8, isPct: true },
];

const expenseData = [
  { name: 'Wages', value: 29200, color: '#3B82F6' },
  { name: 'Equipment', value: 20000, color: '#7C3AED' },
  { name: 'Shipping', value: 6800, color: '#10B981' },
  { name: 'Subscriptions', value: 4325, color: '#F59E0B' },
  { name: 'Rent', value: 3500, color: '#EF4444' },
  { name: 'Prof. Fees', value: 3533, color: '#14B8A6' },
  { name: 'Processing', value: 3425, color: '#8B5CF6' },
  { name: 'Other', value: 7131, color: '#94A3B8' },
];

const arData = [
  { invoice: 'INV-2026-089', client: 'IPF International', amount: '$142,000', date: '01/15/26', due: '04/15/26', days: 79, bucket: '61-90', status: 'Outstanding' },
  { invoice: 'INV-2026-094', client: 'IPF International', amount: '$98,000', date: '02/01/26', due: '05/02/26', days: 62, bucket: '61-90', status: 'Outstanding' },
  { invoice: 'INV-2026-102', client: 'IPF International', amount: '$172,000', date: '02/20/26', due: '05/21/26', days: 43, bucket: '31-60', status: 'Outstanding' },
  { invoice: 'INV-2026-078', client: 'Baptist Health', amount: '$18,500', date: '03/05/26', due: '04/04/26', days: 30, bucket: 'Current', status: 'Outstanding' },
  { invoice: 'INV-2026-082', client: 'Cintas', amount: '$32,200', date: '03/10/26', due: '04/09/26', days: 25, bucket: 'Current', status: 'Outstanding' },
  { invoice: 'INV-2026-085', client: 'FPL/NextEra', amount: '$24,500', date: '03/15/26', due: '04/14/26', days: 20, bucket: 'Current', status: 'Outstanding' },
];

const fmt = (v: number | null, isPct?: boolean) => {
  if (v === null) return '—';
  if (isPct) return `${v.toFixed(1)}%`;
  const neg = v < 0;
  const abs = Math.abs(v);
  if (abs >= 1000000) return `${neg ? '(' : ''}$${(abs / 1000000).toFixed(2)}M${neg ? ')' : ''}`;
  if (abs >= 1000) return `${neg ? '(' : ''}$${(abs / 1000).toFixed(1)}K${neg ? ')' : ''}`;
  return `${neg ? '(' : ''}$${abs.toFixed(0)}${neg ? ')' : ''}`;
};

const change = (curr: number, prev: number, isPct?: boolean) => {
  if (isPct) { const d = curr - prev; return `${d >= 0 ? '+' : ''}${d.toFixed(1)} pts`; }
  const d = curr - prev;
  const pct = prev !== 0 ? ((d / Math.abs(prev)) * 100).toFixed(1) : '—';
  return { dollar: fmt(d), pct: `${Number(pct) >= 0 ? '+' : ''}${pct}%` };
};

export function ReportsFinancial() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 overflow-auto bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 border-b border-slate-200">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-3.5 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === i ? 'bg-white text-slate-800 border border-slate-200 border-b-white -mb-px font-semibold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{tabs[activeTab]}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 0 && 'Full income statement with comparison columns'}
              {activeTab === 1 && 'P&L broken out by PPE, Promo, and Shared allocation'}
              {activeTab === 2 && 'Monthly expense composition and trends'}
              {activeTab === 3 && 'Deep-dive margin by client, product, vendor, job'}
              {activeTab === 4 && 'Cash flow waterfall and 13-week forecast'}
              {activeTab === 5 && 'AR aging schedule with IPF breakdown'}
              {activeTab === 6 && 'AP schedule with payment calendar'}
              {activeTab === 7 && 'Budget vs actual variance analysis'}
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* TAB 0: P&L Summary */}
        {activeTab === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[200px]"></th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Period</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prior Period</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">$ Change</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">% Change</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Same Period LY</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">$ Change</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {plData.map((row, i) => {
                    if (row.divider) return <tr key={i} className="h-2 bg-slate-50"><td colSpan={8}></td></tr>;
                    const c1 = change(row.current, row.prior, row.isPct);
                    const c2 = change(row.current, row.ly, row.isPct);
                    const isNeg1 = typeof c1 === 'string' ? c1.startsWith('-') : c1.dollar.startsWith('(');
                    const isNeg2 = typeof c2 === 'string' ? c2.startsWith('-') : c2.dollar.startsWith('(');
                    return (
                      <tr key={i} className={`border-b border-slate-100 ${row.bold ? 'bg-slate-50/50' : ''} hover:bg-slate-50 transition-colors`}>
                        <td className={`px-4 py-2 text-sm ${row.bold ? 'font-bold text-slate-900' : 'text-slate-700 pl-8'}`}>{row.item}</td>
                        <td className={`px-4 py-2 text-sm text-right ${row.bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{fmt(row.current, row.isPct)}</td>
                        <td className="px-4 py-2 text-sm text-right text-slate-600">{fmt(row.prior, row.isPct)}</td>
                        <td className={`px-4 py-2 text-sm text-right ${isNeg1 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {typeof c1 === 'string' ? c1 : c1.dollar}
                        </td>
                        <td className={`px-4 py-2 text-sm text-right ${isNeg1 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {typeof c1 === 'string' ? '' : c1.pct}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-slate-600">{fmt(row.ly, row.isPct)}</td>
                        <td className={`px-4 py-2 text-sm text-right ${isNeg2 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {typeof c2 === 'string' ? c2 : c2.dollar}
                        </td>
                        <td className={`px-4 py-2 text-sm text-right ${isNeg2 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {typeof c2 === 'string' ? '' : c2.pct}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 1: P&L by Class */}
        {activeTab === 1 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[200px]"></th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-bold text-blue-600 uppercase tracking-wider">PPE</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Promo</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shared</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-700 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plByClassData.map((row, i) => (
                      <tr key={i} className={`border-b border-slate-100 ${row.bold ? 'bg-slate-50/50' : ''}`}>
                        <td className={`px-4 py-2.5 text-sm ${row.bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{row.item}</td>
                        <td className={`px-4 py-2.5 text-sm text-right ${row.bold ? 'font-bold' : ''} ${row.item === 'Gross Margin %' && row.ppe && row.ppe < 20 ? 'text-amber-600' : 'text-slate-800'}`}>
                          {fmt(row.ppe, row.isPct)}
                        </td>
                        <td className={`px-4 py-2.5 text-sm text-right ${row.bold ? 'font-bold' : ''} ${row.item === 'Gross Margin %' && row.promo && row.promo > 35 ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {fmt(row.promo, row.isPct)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-right text-slate-500">{fmt(row.shared, row.isPct)}</td>
                        <td className={`px-4 py-2.5 text-sm text-right ${row.bold ? 'font-bold text-slate-900' : 'text-slate-800'}`}>{fmt(row.total, row.isPct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
              <span className="font-bold">Note:</span> PPE Gross Margin compressed by IPF billing structure. Actual economic margin is higher. Shared allocation by revenue weight (PPE 77%, Promo 23%).
            </div>
          </>
        )}

        {/* TAB 2: Expense Breakdown */}
        {activeTab === 2 && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Monthly Expense Composition</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {expenseData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`$${(v / 1000).toFixed(1)}K`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-sm font-bold text-slate-700 -mt-2">Total OpEx: $77,914/month</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Category', 'Current', '% of Rev', 'Budget', 'Variance'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenseData.map(e => (
                    <tr key={e.name} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                        {e.name}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">${(e.value / 1000).toFixed(1)}K</td>
                      <td className="px-4 py-2.5 text-sm text-slate-500">{(e.value / 583000 * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-sm text-slate-500">${(e.value / 1000 * 1.05).toFixed(1)}K</td>
                      <td className="px-4 py-2.5 text-sm text-emerald-700">Under</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Margin Analysis */}
        {activeTab === 3 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex gap-2">
                {['By Client', 'By Product', 'By Vendor', 'By Job'].map((d, i) => (
                  <button key={d} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${i === 0 ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{d}</button>
                ))}
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Client', 'Revenue', 'COGS', 'Gross Profit', 'GM%', 'vs Average', 'Trend'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { client: 'IPF International', rev: '$448K', cogs: '$365K', gp: '$83K', gm: '18.5%', vs: '-5.6 pts', bad: true },
                  { client: 'Baptist Health', rev: '$62K', cogs: '$35K', gp: '$27K', gm: '43.5%', vs: '+19.4 pts', bad: false },
                  { client: 'Cintas', rev: '$85K', cogs: '$52K', gp: '$33K', gm: '38.8%', vs: '+14.7 pts', bad: false },
                  { client: 'FPL/NextEra', rev: '$42K', cogs: '$25K', gp: '$17K', gm: '40.5%', vs: '+16.4 pts', bad: false },
                  { client: 'Royal Caribbean', rev: '$12K', cogs: '$8K', gp: '$4K', gm: '33.3%', vs: '+9.2 pts', bad: false },
                ].map(r => (
                  <tr key={r.client} className={`border-b border-slate-100 hover:bg-slate-50 ${r.bad ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.client}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{r.rev}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.cogs}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-800">{r.gp}</td>
                    <td className={`px-4 py-2.5 text-sm font-semibold ${r.bad ? 'text-red-600' : 'text-emerald-700'}`}>{r.gm}</td>
                    <td className={`px-4 py-2.5 text-sm ${r.vs.startsWith('-') ? 'text-red-600' : 'text-emerald-700'}`}>{r.vs}</td>
                    <td className="px-4 py-2.5">{r.bad ? <TrendingDown className="w-4 h-4 text-red-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: Cash Flow */}
        {activeTab === 4 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'DSO (Promo)', value: '52 days', color: 'text-blue-700' },
                { label: 'DSO (IPF)', value: '92 days', color: 'text-amber-600' },
                { label: 'Cash Conversion Cycle', value: '24 days', color: 'text-emerald-700' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                  <p className={`text-xl font-bold ${c.color} mt-1`}>{c.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Cash Flow Trend (Monthly)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={[
                  { month: 'Oct', inflow: 520, outflow: -480, net: 40 },
                  { month: 'Nov', inflow: 580, outflow: -510, net: 70 },
                  { month: 'Dec', inflow: 640, outflow: -545, net: 95 },
                  { month: 'Jan', inflow: 490, outflow: -470, net: 20 },
                  { month: 'Feb', inflow: 560, outflow: -505, net: 55 },
                  { month: 'Mar', inflow: 620, outflow: -520, net: 100 },
                ]} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                  <Tooltip formatter={(v: any) => [`$${v}K`, '']} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="inflow" fill="#10B981" name="Inflows" radius={[3, 3, 0, 0]} barSize={30} />
                  <Bar dataKey="outflow" fill="#EF4444" name="Outflows" radius={[3, 3, 0, 0]} barSize={30} />
                  <Line type="monotone" dataKey="net" stroke="#1B2A4A" strokeWidth={2.5} name="Net" dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* TAB 5: AR Aging */}
        {activeTab === 5 && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total AR', value: '$487,200', sub: 'IPF: $412K (84.6%)' },
                { label: 'DSO', value: '52d / 92d', sub: 'Promo / IPF' },
                { label: 'AR > 60 Days', value: '$76,600', sub: '15.7% of total' },
                { label: 'Bad Debt Exposure', value: '$12,500', sub: 'Invoices 90+ days' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{c.value}</p>
                  <p className="text-[10px] text-slate-400">{c.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Invoice #', 'Client', 'Amount', 'Invoice Date', 'Due Date', 'Days Out', 'Aging Bucket', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {arData.map(r => (
                    <tr key={r.invoice} className={`border-b border-slate-100 hover:bg-slate-50 ${
                      r.bucket === '61-90' ? 'bg-orange-50/30' : r.bucket === '31-60' ? 'bg-amber-50/30' : ''
                    }`}>
                      <td className="px-4 py-2.5 text-sm font-mono text-slate-800">{r.invoice}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.client}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.amount}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.date}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.due}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{r.days}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.bucket === 'Current' ? 'bg-green-100 text-green-700' :
                          r.bucket === '31-60' ? 'bg-amber-100 text-amber-700' :
                          r.bucket === '61-90' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>{r.bucket}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 6: AP Detail */}
        {activeTab === 6 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Invoice #', 'Vendor', 'Amount', 'Due Date', 'Days Until Due', 'Status', 'Priority'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { inv: 'AP-3421', vendor: 'SC Promo', amount: '$45,200', due: '04/15/26', daysUntil: 11, status: 'Due Soon', priority: 'Strategic Terms' },
                  { inv: 'AP-3418', vendor: 'Unigloves', amount: '$28,500', due: '04/08/26', daysUntil: 4, status: 'Due This Week', priority: '' },
                  { inv: 'AP-3415', vendor: 'RIM Freight', amount: '$12,800', due: '04/05/26', daysUntil: 1, status: 'Due Tomorrow', priority: '' },
                  { inv: 'AP-3410', vendor: 'Equipment Lease', amount: '$20,000', due: '04/01/26', daysUntil: -3, status: 'Overdue', priority: '' },
                ].map(r => (
                  <tr key={r.inv} className={`border-b border-slate-100 hover:bg-slate-50 ${r.status === 'Overdue' ? 'bg-red-50/30' : r.daysUntil <= 3 ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-2.5 text-sm font-mono text-slate-800">{r.inv}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.vendor}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.amount}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.due}</td>
                    <td className={`px-4 py-2.5 text-sm font-medium ${r.daysUntil < 0 ? 'text-red-600' : r.daysUntil <= 3 ? 'text-amber-600' : 'text-slate-700'}`}>{r.daysUntil < 0 ? `${Math.abs(r.daysUntil)} overdue` : `${r.daysUntil} days`}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                        r.status === 'Due Tomorrow' ? 'bg-orange-100 text-orange-700' :
                        r.status === 'Due This Week' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {r.priority && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">{r.priority}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 7: Budget vs Actual */}
        {activeTab === 7 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Category', 'Budget', 'Actual', '$ Variance', '% Variance', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: 'Revenue', budget: '$560K', actual: '$583K', varD: '+$23K', varP: '+4.1%', status: 'good' },
                  { cat: 'COGS', budget: '$425K', actual: '$442K', varD: '-$17K', varP: '-4.0%', status: 'warn' },
                  { cat: 'Gross Profit', budget: '$135K', actual: '$141K', varD: '+$6K', varP: '+4.4%', status: 'good' },
                  { cat: 'Wages', budget: '$30K', actual: '$29.2K', varD: '+$800', varP: '+2.7%', status: 'good' },
                  { cat: 'Shipping', budget: '$5.5K', actual: '$6.8K', varD: '-$1.3K', varP: '-23.6%', status: 'bad' },
                  { cat: 'Marketing', budget: '$2K', actual: '$2K', varD: '$0', varP: '0%', status: 'good' },
                  { cat: 'Net Income', budget: '$52K', actual: '$62K', varD: '+$10K', varP: '+19.4%', status: 'good' },
                ].map(r => (
                  <tr key={r.cat} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.cat}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.budget}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.actual}</td>
                    <td className={`px-4 py-2.5 text-sm font-medium ${r.varD.startsWith('+') ? 'text-emerald-700' : r.varD.startsWith('-') ? 'text-red-600' : 'text-slate-600'}`}>{r.varD}</td>
                    <td className={`px-4 py-2.5 text-sm ${r.varP.startsWith('+') ? 'text-emerald-700' : r.varP.startsWith('-') ? 'text-red-600' : 'text-slate-600'}`}>{r.varP}</td>
                    <td className="px-4 py-2.5">
                      {r.status === 'good' && <span className="text-emerald-600">✓</span>}
                      {r.status === 'warn' && <span className="text-amber-500">⚠</span>}
                      {r.status === 'bad' && <span className="text-red-500">✗</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
