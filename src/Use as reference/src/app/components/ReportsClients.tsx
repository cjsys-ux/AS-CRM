import { useState } from 'react';
import { Download, TrendingUp, TrendingDown, Minus, AlertTriangle, Star, Phone } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';

const tabs = ['Lifetime Value', 'Spend Trajectory', 'Retention & Churn', 'Concentration Analysis', 'Dormant Clients', 'Client Segmentation'];

const clvData = [
  { name: 'IPF International', tenure: 24, revenue: 8740, orders: 85, status: 'Active' },
  { name: 'Baptist Health', tenure: 72, revenue: 1420, orders: 120, status: 'Active' },
  { name: 'Cintas', tenure: 18, revenue: 450, orders: 28, status: 'Active' },
  { name: 'Hard Rock Int\'l', tenure: 96, revenue: 2100, orders: 180, status: 'Declining' },
  { name: 'Royal Caribbean', tenure: 84, revenue: 1850, orders: 145, status: 'Declining' },
  { name: 'FPL/NextEra', tenure: 60, revenue: 680, orders: 55, status: 'Active' },
  { name: 'Nicklaus Children\'s', tenure: 48, revenue: 580, orders: 42, status: 'Active' },
  { name: 'Goliath Entertainment', tenure: 36, revenue: 850, orders: 65, status: 'Lost' },
];

const cohortData = [
  { cohort: '2019', y1: 100, y2: 72, y3: 58, y4: 45, y5: 38, y6: 35, y7: 32 },
  { cohort: '2020', y1: 100, y2: 65, y3: 48, y4: 38, y5: 34, y6: 31 },
  { cohort: '2021', y1: 100, y2: 55, y3: 42, y4: 35, y5: 30 },
  { cohort: '2022', y1: 100, y2: 74, y3: 38, y4: 35 },
  { cohort: '2023', y1: 100, y2: 68, y3: 52 },
  { cohort: '2024', y1: 100, y2: 78 },
  { cohort: '2025', y1: 100 },
];

const concentrationData = [
  { client: 'IPF International', pct: 76.2, cumulative: 76.2 },
  { client: 'Baptist Health', pct: 4.8, cumulative: 81.0 },
  { client: 'Cintas', pct: 4.1, cumulative: 85.1 },
  { client: 'Nicklaus Children\'s', pct: 2.8, cumulative: 87.9 },
  { client: 'FPL/NextEra', pct: 2.2, cumulative: 90.1 },
  { client: 'Other (82)', pct: 9.9, cumulative: 100 },
];

const dormantData = [
  { client: 'Goliath Entertainment', industry: 'Entertainment', lastOrder: 'Dec 2024', months: 16, lifetime: '$850K', peak: '$450K', priority: 'Hot' },
  { client: 'Pinnacle Hotels', industry: 'Hospitality', lastOrder: 'Oct 2024', months: 18, lifetime: '$420K', peak: '$180K', priority: 'Hot' },
  { client: 'Miami Heat Stores', industry: 'Sports/Retail', lastOrder: 'Aug 2024', months: 20, lifetime: '$310K', peak: '$145K', priority: 'Warm' },
  { client: 'Brightline Trains', industry: 'Transportation', lastOrder: 'Jun 2024', months: 22, lifetime: '$185K', peak: '$85K', priority: 'Warm' },
  { client: 'Ocean Reef Club', industry: 'Hospitality', lastOrder: 'Mar 2024', months: 25, lifetime: '$120K', peak: '$65K', priority: 'Cool' },
  { client: 'AutoNation Corp', industry: 'Automotive', lastOrder: 'Jan 2024', months: 27, lifetime: '$95K', peak: '$42K', priority: 'Cool' },
];

const segData = [
  { tier: 'Enterprise', def: '$100K+/year', clients: 8, revenue: '$6.8M', pct: '86%' },
  { tier: 'Mid-Market', def: '$25K-$100K', clients: 12, revenue: '$420K', pct: '5%' },
  { tier: 'SMB', def: '$5K-$25K', clients: 35, revenue: '$240K', pct: '3%' },
  { tier: 'Small', def: '<$5K', clients: 32, revenue: '$48K', pct: '1%' },
];

const heatColor = (val: number) => {
  if (val >= 70) return 'bg-emerald-600 text-white';
  if (val >= 50) return 'bg-emerald-400 text-white';
  if (val >= 35) return 'bg-emerald-200 text-emerald-900';
  if (val >= 20) return 'bg-amber-200 text-amber-900';
  return 'bg-red-200 text-red-900';
};

export function ReportsClients() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 overflow-auto bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 border-b border-slate-200">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-3.5 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === i ? 'bg-white text-teal-700 border border-slate-200 border-b-white -mb-px font-semibold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}>{tab}</button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{tabs[activeTab]}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 0 && 'Client value mapped by tenure and total revenue'}
              {activeTab === 1 && 'Individual client spending trends over time'}
              {activeTab === 2 && 'Cohort retention and revenue retention heatmap'}
              {activeTab === 3 && 'Track and visualize concentration risk over time'}
              {activeTab === 4 && 'Reactivation target list — 163+ dormant clients'}
              {activeTab === 5 && 'Client segmentation by industry, size, tier'}
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* CLV */}
        {activeTab === 0 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Client Lifetime Value — Tenure vs Revenue</h3>
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="tenure" name="Tenure (months)" tick={{ fontSize: 11, fill: '#64748B' }} label={{ value: 'Tenure (months)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis dataKey="revenue" name="Revenue ($K)" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                  <ZAxis dataKey="orders" range={[50, 400]} name="Orders" />
                  <Tooltip formatter={(v: any, name: string) => [name === 'Revenue ($K)' ? `$${v}K` : v, name]} />
                  <Scatter data={clvData} fill="#14B8A6">
                    {clvData.map((e, i) => (
                      <Cell key={i} fill={e.status === 'Active' ? '#10B981' : e.status === 'Declining' ? '#F59E0B' : '#EF4444'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 text-[10px] text-slate-500 justify-center">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Active</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Declining</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> Lost</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Rank', 'Client', 'First Order', 'Tenure', 'Lifetime Revenue', '# Orders', 'Avg Order', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clvData.sort((a, b) => b.revenue - a.revenue).map((r, i) => (
                    <tr key={r.name} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-sm text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{r.name}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{`${Math.floor(r.tenure / 12)}y ${r.tenure % 12}m ago`}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.tenure} months</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-800">${r.revenue}K</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.orders}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">${Math.round(r.revenue / r.orders * 1000).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.status === 'Active' ? 'bg-green-100 text-green-700' :
                          r.status === 'Declining' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                Average CLV: $2,084K | Median CLV: $765K
              </div>
            </div>
          </>
        )}

        {/* Retention & Churn */}
        {activeTab === 2 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Cohort Retention Heatmap (% of cohort still active)</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-bold text-slate-500 uppercase">Cohort</th>
                      {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7'].map(h => (
                        <th key={h} className="px-3 py-2 text-center text-[11px] font-bold text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map(row => (
                      <tr key={row.cohort}>
                        <td className="px-3 py-2 text-sm font-semibold text-slate-800">{row.cohort}</td>
                        {[row.y1, row.y2, row.y3, row.y4, row.y5, row.y6, row.y7].map((val, i) => (
                          <td key={i} className="px-1 py-1">
                            {val !== undefined ? (
                              <div className={`text-center text-xs font-bold rounded-lg py-2 ${heatColor(val)}`}>{val}%</div>
                            ) : <div className="text-center text-xs text-slate-300 py-2">—</div>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Clients Lost (12+ months)', value: '163', color: 'text-red-600' },
                { label: 'Revenue Lost from Churn', value: '~$2.1M', color: 'text-red-600' },
                { label: '2024 Cohort Retention', value: '78%', color: 'text-emerald-700' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                  <p className={`text-xl font-bold ${c.color} mt-1`}>{c.value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Concentration */}
        {activeTab === 3 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Client Revenue Concentration (Pareto)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={concentrationData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="client" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: any) => [`${v}%`, '']} />
                  <Bar dataKey="pct" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={45} name="% of Revenue">
                    {concentrationData.map((e, i) => (
                      <Cell key={i} fill={i === 0 ? '#EF4444' : '#14B8A6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <div className="p-4 bg-red-50 border-b border-red-200">
                <h3 className="text-sm font-bold text-red-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Concentration Risk Scorecard</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Risk Factor', 'Current', 'Target', 'Status', 'Trend'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { factor: 'Single client concentration', current: '76% (IPF)', target: '<30%', status: 'Red', trend: 'Worsening' },
                    { factor: 'Top 5 client concentration', current: '89%', target: '<60%', status: 'Red', trend: 'Stable' },
                    { factor: 'Single channel concentration', current: '77% (PPE)', target: '<50%', status: 'Red', trend: 'Worsening' },
                    { factor: 'Client diversification', current: '87 clients', target: '150+', status: 'Yellow', trend: 'Improving' },
                  ].map(r => (
                    <tr key={r.factor} className="border-b border-slate-100">
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.factor}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{r.current}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.target}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status === 'Red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm flex items-center gap-1">
                        {r.trend === 'Worsening' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                        {r.trend === 'Stable' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                        {r.trend === 'Improving' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                        <span className="text-slate-600">{r.trend}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Dormant Clients */}
        {activeTab === 4 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Dormant Clients', value: '163', sub: 'No order in 6+ months' },
                { label: 'Est. Addressable Revenue', value: '$2.1M', sub: 'Annual potential' },
                { label: 'By Priority', value: '28 Hot | 45 Warm | 90 Cool', sub: '' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{c.value}</p>
                  {c.sub && <p className="text-[10px] text-slate-400">{c.sub}</p>}
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Client', 'Industry', 'Last Order', 'Months Dormant', 'Lifetime Revenue', 'Peak Annual', 'Priority', 'Action'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dormantData.map(r => (
                    <tr key={r.client} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{r.client}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.industry}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.lastOrder}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{r.months}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-800">{r.lifetime}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.peak}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.priority === 'Hot' ? 'bg-red-100 text-red-700' :
                          r.priority === 'Warm' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>{r.priority}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-[11px] font-semibold hover:bg-teal-100 transition-colors">
                          <Phone className="w-3 h-3" /> Contact
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Segmentation */}
        {activeTab === 5 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex gap-2">
                {['By Revenue Tier', 'By Industry', 'By Geography'].map((d, i) => (
                  <button key={d} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${i === 0 ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{d}</button>
                ))}
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Tier', 'Definition', 'Clients', 'Revenue', '% of Total'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segData.map(r => (
                  <tr key={r.tier} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{r.tier}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.def}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{r.clients}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.revenue}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-slate-700">{r.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Spend Trajectory placeholder */}
        {activeTab === 1 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-slate-500 text-sm">Select a client to view their individual spend trajectory and full profile.</p>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {clvData.filter(c => c.status === 'Active').map(c => (
                <button key={c.name} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left hover:bg-slate-100 transition-colors">
                  <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500">${c.revenue}K lifetime</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
