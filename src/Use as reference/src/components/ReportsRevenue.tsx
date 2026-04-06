import { useState } from 'react';
import { Download, ChevronDown, Info } from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, BarChart, Area, AreaChart, Cell,
} from 'recharts';

const tabs = [
  '10-Year History', 'Monthly (YoY)', 'Monthly (MoM)', 'By Class', 'By Client', 'By Product Category', 'By Geography',
];

// 10-Year Revenue Data
const tenYearData = [
  { year: '2016', revenue: 4200, netIncome: 500, annotation: 'WYD Vatican Deal' },
  { year: '2017', revenue: 922, netIncome: -145, annotation: '' },
  { year: '2018', revenue: 2980, netIncome: 65, annotation: '' },
  { year: '2019', revenue: 8960, netIncome: -32, annotation: 'Blissy/Invative e-comm peak' },
  { year: '2020', revenue: 11340, netIncome: 575, annotation: 'COVID PPE boom' },
  { year: '2021', revenue: 3690, netIncome: -802, annotation: 'E-commerce collapse' },
  { year: '2022', revenue: 3970, netIncome: -229, annotation: '' },
  { year: '2023', revenue: 1780, netIncome: -237, annotation: 'Bottom — restructuring' },
  { year: '2024', revenue: 2840, netIncome: 190, annotation: 'IPF/Amazon JV launches' },
  { year: '2025', revenue: 7900, netIncome: 1070, annotation: 'Amazon explosion' },
  { year: '2026', revenue: 1820, netIncome: 420, annotation: 'YTD' },
];

const tenYearTable = [
  { year: '2016', revenue: '$4.2M', cogs: '$3.2M', gp: '$1.0M', gpPct: '23.8%', opex: '$420K', ni: '+$500K', niPct: '11.9%', clients: 42, revPerClient: '$100K' },
  { year: '2017', revenue: '$922K', cogs: '$780K', gp: '$142K', gpPct: '15.4%', opex: '$287K', ni: '-$145K', niPct: '-15.7%', clients: 28, revPerClient: '$33K' },
  { year: '2018', revenue: '$2.98M', cogs: '$2.4M', gp: '$580K', gpPct: '19.5%', opex: '$515K', ni: '+$65K', niPct: '2.2%', clients: 65, revPerClient: '$46K' },
  { year: '2019', revenue: '$8.96M', cogs: '$7.3M', gp: '$1.66M', gpPct: '18.5%', opex: '$1.69M', ni: '-$32K', niPct: '-0.4%', clients: 180, revPerClient: '$50K' },
  { year: '2020', revenue: '$11.34M', cogs: '$8.9M', gp: '$2.44M', gpPct: '21.5%', opex: '$1.87M', ni: '+$575K', niPct: '5.1%', clients: 250, revPerClient: '$45K' },
  { year: '2021', revenue: '$3.69M', cogs: '$3.1M', gp: '$590K', gpPct: '16.0%', opex: '$1.39M', ni: '-$802K', niPct: '-21.7%', clients: 145, revPerClient: '$25K' },
  { year: '2022', revenue: '$3.97M', cogs: '$3.2M', gp: '$770K', gpPct: '19.4%', opex: '$999K', ni: '-$229K', niPct: '-5.8%', clients: 112, revPerClient: '$35K' },
  { year: '2023', revenue: '$1.78M', cogs: '$1.4M', gp: '$380K', gpPct: '21.3%', opex: '$617K', ni: '-$237K', niPct: '-13.3%', clients: 87, revPerClient: '$20K', highlight: 'red' },
  { year: '2024', revenue: '$2.84M', cogs: '$2.2M', gp: '$640K', gpPct: '22.5%', opex: '$450K', ni: '+$190K', niPct: '6.7%', clients: 91, revPerClient: '$31K' },
  { year: '2025', revenue: '$7.9M', cogs: '$6.1M', gp: '$1.8M', gpPct: '22.8%', opex: '$730K', ni: '+$1.07M', niPct: '13.5%', clients: 95, revPerClient: '$83K', highlight: 'green' },
  { year: '2026', revenue: '$1.82M', cogs: '$1.4M', gp: '$420K', gpPct: '23.1%', opex: '$210K', ni: '+$420K', niPct: '23.1%', clients: 48, revPerClient: '$38K' },
];

// YoY data
const yoyData = [
  { month: 'Jan', '2026': 580, '2025': 420, '2024': 210, '2023': 145 },
  { month: 'Feb', '2026': 620, '2025': 480, '2024': 230, '2023': 150 },
  { month: 'Mar', '2026': 620, '2025': 440, '2024': 240, '2023': 135 },
  { month: 'Apr', '2026': null, '2025': 560, '2024': 220, '2023': 155 },
  { month: 'May', '2026': null, '2025': 680, '2024': 250, '2023': 140 },
  { month: 'Jun', '2026': null, '2025': 720, '2024': 280, '2023': 160 },
  { month: 'Jul', '2026': null, '2025': 750, '2024': 240, '2023': 145 },
  { month: 'Aug', '2026': null, '2025': 690, '2024': 260, '2023': 130 },
  { month: 'Sep', '2026': null, '2025': 710, '2024': 230, '2023': 155 },
  { month: 'Oct', '2026': null, '2025': 780, '2024': 250, '2023': 140 },
  { month: 'Nov', '2026': null, '2025': 820, '2024': 210, '2023': 165 },
  { month: 'Dec', '2026': null, '2025': 850, '2024': 220, '2023': 160 },
];

// By Class data
const classMonthlyData = [
  { month: 'Jan', ppe: 420, promo: 160 },
  { month: 'Feb', ppe: 460, promo: 160 },
  { month: 'Mar', ppe: 450, promo: 170 },
  { month: 'Apr', ppe: 410, promo: 150 },
  { month: 'May', ppe: 520, promo: 160 },
  { month: 'Jun', ppe: 560, promo: 160 },
  { month: 'Jul', ppe: 580, promo: 170 },
  { month: 'Aug', ppe: 530, promo: 160 },
  { month: 'Sep', ppe: 550, promo: 160 },
  { month: 'Oct', ppe: 610, promo: 170 },
  { month: 'Nov', ppe: 640, promo: 180 },
  { month: 'Dec', ppe: 670, promo: 180 },
];

const clientData = [
  { rank: 1, client: 'IPF International', '2022': '$1.2M', '2023': '$640K', '2024': '$2.1M', '2025': '$6.1M', '2026': '$1.4M', runRate: '$5.6M', yoyChange: '+166%', status: 'Active' },
  { rank: 2, client: 'Baptist Health', '2022': '$180K', '2023': '$95K', '2024': '$120K', '2025': '$210K', '2026': '$62K', runRate: '$248K', yoyChange: '+18%', status: 'Active' },
  { rank: 3, client: 'Cintas', '2022': '$0', '2023': '$0', '2024': '$45K', '2025': '$320K', '2026': '$85K', runRate: '$340K', yoyChange: '+611%', status: 'Active' },
  { rank: 4, client: 'Nicklaus Children\'s', '2022': '$95K', '2023': '$82K', '2024': '$78K', '2025': '$145K', '2026': '$38K', runRate: '$152K', yoyChange: '+86%', status: 'Active' },
  { rank: 5, client: 'Royal Caribbean', '2022': '$220K', '2023': '$85K', '2024': '$42K', '2025': '$68K', '2026': '$12K', runRate: '$48K', yoyChange: '-38%', status: 'Declining' },
  { rank: 6, client: 'Hard Rock Int\'l', '2022': '$340K', '2023': '$120K', '2024': '$95K', '2025': '$78K', '2026': '$15K', runRate: '$60K', yoyChange: '-23%', status: 'Declining' },
  { rank: 7, client: 'FPL/NextEra', '2022': '$85K', '2023': '$92K', '2024': '$110K', '2025': '$135K', '2026': '$42K', runRate: '$168K', yoyChange: '+25%', status: 'Active' },
  { rank: 8, client: 'Goliath Entertainment', '2022': '$450K', '2023': '$280K', '2024': '$120K', '2025': '$0', '2026': '$0', runRate: '$0', yoyChange: '-100%', status: 'Lost' },
];

const productCatData = [
  { category: 'PPE Gloves', revenue: 2800, pct: 35.4, margin: 18.2 },
  { category: 'PPE Sunscreen', revenue: 1200, pct: 15.2, margin: 22.1 },
  { category: 'PPE Thermal', revenue: 950, pct: 12.0, margin: 19.5 },
  { category: 'PPE Holsters', revenue: 680, pct: 8.6, margin: 24.3 },
  { category: 'Apparel', revenue: 620, pct: 7.8, margin: 38.5 },
  { category: 'Drinkware', revenue: 480, pct: 6.1, margin: 42.1 },
  { category: 'Tech Accessories', revenue: 380, pct: 4.8, margin: 35.2 },
  { category: 'Bags/Totes', revenue: 320, pct: 4.1, margin: 40.8 },
  { category: 'Writing', revenue: 260, pct: 3.3, margin: 45.2 },
  { category: 'Custom Packaging', revenue: 210, pct: 2.7, margin: 28.9 },
];

const geoData = [
  { state: 'Florida', revenue: '$3.2M', clients: 42, orders: 380, avgOrder: '$8.4K', growth: '+45%' },
  { state: 'Texas', revenue: '$1.1M', clients: 15, orders: 120, avgOrder: '$9.2K', growth: '+28%' },
  { state: 'California', revenue: '$890K', clients: 12, orders: 95, avgOrder: '$9.4K', growth: '+15%' },
  { state: 'New York', revenue: '$620K', clients: 8, orders: 72, avgOrder: '$8.6K', growth: '+8%' },
  { state: 'Georgia', revenue: '$480K', clients: 6, orders: 58, avgOrder: '$8.3K', growth: '+52%' },
  { state: 'Ohio', revenue: '$340K', clients: 5, orders: 42, avgOrder: '$8.1K', growth: '+12%' },
];

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-800 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? (p.dataKey === 'netIncome' ? `${p.value >= 0 ? '+' : ''}$${(p.value / 1000).toFixed(0)}K` : `$${(p.value / 1000).toFixed(1)}M`) : p.value}
        </p>
      ))}
    </div>
  );
};

export function ReportsRevenue() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('All Time');
  const [showAnnotations, setShowAnnotations] = useState(true);

  return (
    <div className="flex-1 overflow-auto bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 border-b border-slate-200">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === i
                  ? 'bg-white text-emerald-700 border border-slate-200 border-b-white -mb-px font-semibold'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Title Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{tabs[activeTab]}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 0 && 'The full story of the business from startup through resurgence'}
              {activeTab === 1 && 'Every month of the current year vs previous years'}
              {activeTab === 2 && 'Sequential progression within the current year'}
              {activeTab === 3 && 'Granular breakdown of PPE vs Promo performance'}
              {activeTab === 4 && 'Client-level revenue in full detail'}
              {activeTab === 5 && 'Revenue breakdown by product category'}
              {activeTab === 6 && 'Geographic revenue distribution'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option>All Time</option>
              <option>Last 12 Months</option>
              <option>Last 90 Days</option>
              <option>YTD</option>
              <option>Custom Range</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* TAB 0: 10-Year History */}
        {activeTab === 0 && (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-3 mb-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAnnotations}
                  onChange={() => setShowAnnotations(!showAnnotations)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-600 font-medium">Show annotations</span>
              </label>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={tenYearData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}M`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v >= 0 ? '+' : ''}$${Math.abs(v)}K`} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#1B2A4A" radius={[4, 4, 0, 0]} barSize={40}>
                    {tenYearData.map((entry, i) => (
                      <Cell key={i} fill={entry.year === '2023' ? '#FCA5A5' : entry.year === '2025' ? '#10B981' : '#1B2A4A'} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="netIncome" name="Net Income" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} />
                </ComposedChart>
              </ResponsiveContainer>
              {showAnnotations && (
                <div className="flex flex-wrap gap-2 mt-4 border-t border-slate-100 pt-4">
                  {tenYearData.filter(d => d.annotation).map(d => (
                    <span key={d.year} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                      <span className="font-bold">{d.year}:</span> {d.annotation}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Lifetime Revenue', value: '$49.6M', color: 'text-slate-900' },
                { label: 'Best Revenue Year', value: '$11.34M (2020)', color: 'text-blue-700' },
                { label: 'Best Profit Year', value: '$1.07M (2025)', color: 'text-emerald-700' },
                { label: 'CAGR (2023-2025)', value: '+111%', color: 'text-purple-700' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium mb-1">{kpi.label}</p>
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Year', 'Revenue', 'COGS', 'Gross Profit', 'GP%', 'OpEx', 'Net Income', 'NI%', 'Clients', 'Rev/Client'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tenYearTable.map(row => (
                      <tr
                        key={row.year}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          row.highlight === 'red' ? 'bg-red-50/50' : row.highlight === 'green' ? 'bg-green-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{row.year}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-800 font-medium">{row.revenue}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{row.cogs}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-800">{row.gp}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{row.gpPct}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{row.opex}</td>
                        <td className={`px-4 py-2.5 text-sm font-semibold ${row.ni.startsWith('+') ? 'text-emerald-700' : 'text-red-600'}`}>{row.ni}</td>
                        <td className={`px-4 py-2.5 text-sm ${row.niPct.startsWith('-') ? 'text-red-600' : 'text-emerald-700'}`}>{row.niPct}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{row.clients}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{row.revPerClient}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 1: Monthly YoY */}
        {activeTab === 1 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Year over Year Comparison ($K)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={yoyData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                  <Tooltip formatter={(v: any) => [`$${v}K`, '']} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="2026" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} name="2026" connectNulls={false} />
                  <Line type="monotone" dataKey="2025" stroke="#1B2A4A" strokeWidth={2} dot={{ r: 3 }} name="2025" />
                  <Line type="monotone" dataKey="2024" stroke="#3B82F6" strokeWidth={1.5} dot={{ r: 3 }} name="2024" strokeOpacity={0.7} />
                  <Line type="monotone" dataKey="2023" stroke="#94A3B8" strokeWidth={1.5} dot={{ r: 2 }} name="2023" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                <span className="font-bold">2026 YTD: $1.82M</span> | 2025 same period: $1.34M | Growth: <span className="font-bold text-emerald-700">+36%</span> | Projected Full Year: $8.7M (based on current run rate)
              </p>
            </div>
          </>
        )}

        {/* TAB 2: Monthly MoM */}
        {activeTab === 2 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Month over Month Revenue Trend ($K)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={yoyData.filter(d => d['2026'] !== null)} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                <Tooltip formatter={(v: any) => [`$${v}K`, '']} />
                <Bar dataKey="2026" fill="#10B981" radius={[4, 4, 0, 0]} barSize={50} name="2026 Revenue" />
                <Line type="monotone" dataKey="2025" stroke="#1B2A4A" strokeWidth={2} strokeDasharray="5 5" name="2025 (comparison)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TAB 3: By Class */}
        {activeTab === 3 && (
          <>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <h3 className="text-sm font-bold text-slate-800">PPE / Amazon</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Revenue YTD', value: '$1.40M' },
                    { label: 'Run Rate', value: '$5.6M' },
                    { label: 'Avg Margin', value: '18.5%' },
                  ].map(m => (
                    <div key={m.label} className="bg-blue-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-blue-600 font-medium">{m.label}</p>
                      <p className="text-sm font-bold text-blue-800">{m.value}</p>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={classMonthlyData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                    <Tooltip formatter={(v: any) => [`$${v}K`, '']} />
                    <Area type="monotone" dataKey="ppe" fill="#3B82F6" fillOpacity={0.15} stroke="#3B82F6" strokeWidth={2} name="PPE" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-bold text-slate-800">Promo</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Revenue YTD', value: '$420K' },
                    { label: 'Run Rate', value: '$1.68M' },
                    { label: 'Avg Margin', value: '42.8%' },
                  ].map(m => (
                    <div key={m.label} className="bg-emerald-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-emerald-600 font-medium">{m.label}</p>
                      <p className="text-sm font-bold text-emerald-800">{m.value}</p>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={classMonthlyData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                    <Tooltip formatter={(v: any) => [`$${v}K`, '']} />
                    <Area type="monotone" dataKey="promo" fill="#10B981" fillOpacity={0.15} stroke="#10B981" strokeWidth={2} name="Promo" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Concentration Trend */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-1">Concentration Trend — PPE vs Promo % of Total Revenue</h3>
              <p className="text-xs text-red-500 font-medium mb-3 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> PPE: 77% — Target: {'<'}50% by EOY 2026
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={classMonthlyData.map(d => ({ ...d, ppePct: Math.round(d.ppe / (d.ppe + d.promo) * 100), promoPct: Math.round(d.promo / (d.ppe + d.promo) * 100) }))}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => [`${v}%`, '']} />
                  <Area type="monotone" dataKey="ppePct" stackId="1" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" name="PPE %" />
                  <Area type="monotone" dataKey="promoPct" stackId="1" fill="#10B981" fillOpacity={0.3} stroke="#10B981" name="Promo %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* TAB 4: By Client */}
        {activeTab === 4 && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Active Clients', value: '87', sub: 'Growing: 34 | Flat: 28 | Declining: 15' },
                { label: 'Top Client Concentration', value: 'IPF 76%', sub: 'of 2025 revenue' },
                { label: 'Median Revenue Growth', value: '+12% YoY', sub: 'across active clients' },
                { label: 'Est. Uncaptured Wallet', value: '$1.2M', sub: 'from top 20 accounts' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{c.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Rank', 'Client', '2022', '2023', '2024', '2025', '2026 YTD', 'Run Rate', 'YoY Change', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.map(row => (
                      <tr key={row.rank} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        row.status === 'Lost' ? 'bg-red-50/40' : row.status === 'Declining' ? 'bg-amber-50/40' : ''
                      }`}>
                        <td className="px-4 py-2.5 text-sm font-medium text-slate-500">{row.rank}</td>
                        <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{row.client}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{row['2022']}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{row['2023']}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{row['2024']}</td>
                        <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{row['2025']}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-700">{row['2026']}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{row.runRate}</td>
                        <td className={`px-4 py-2.5 text-sm font-semibold ${row.yoyChange.startsWith('+') ? 'text-emerald-700' : 'text-red-600'}`}>{row.yoyChange}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            row.status === 'Active' ? 'bg-green-100 text-green-700' :
                            row.status === 'Declining' ? 'bg-amber-100 text-amber-700' :
                            row.status === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 5: By Product Category */}
        {activeTab === 5 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Revenue by Product Category ($K)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productCatData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} width={100} />
                  <Tooltip formatter={(v: any) => [`$${v}K`, 'Revenue']} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                    {productCatData.map((e, i) => (
                      <Cell key={i} fill={e.margin > 35 ? '#10B981' : e.margin > 20 ? '#F59E0B' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded" /> Margin {'>'} 35%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded" /> Margin 20-35%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" /> Margin {'<'} 20%</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Category', 'Revenue', '% of Total', 'Gross Margin', 'GM%'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productCatData.map(r => (
                    <tr key={r.category} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.category}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-800">${r.revenue}K</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.pct}%</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">${Math.round(r.revenue * r.margin / 100)}K</td>
                      <td className={`px-4 py-2.5 text-sm font-medium ${r.margin > 35 ? 'text-emerald-700' : r.margin > 20 ? 'text-amber-600' : 'text-blue-600'}`}>{r.margin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 6: By Geography */}
        {activeTab === 6 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['State/Region', 'Revenue', 'Clients', 'Orders', 'Avg Order', 'Growth vs LY'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {geoData.map(r => (
                  <tr key={r.state} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{r.state}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.revenue}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.clients}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.orders}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.avgOrder}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-emerald-700">{r.growth}</td>
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
