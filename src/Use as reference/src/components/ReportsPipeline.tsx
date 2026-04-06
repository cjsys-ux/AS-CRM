import { useState } from 'react';
import { Download, AlertCircle, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ComposedChart, Cell,
  PieChart, Pie,
} from 'recharts';

const tabs = ['Pipeline Velocity', 'Win/Loss Analysis', 'Deal Aging', 'Sales Team Scorecard', 'Forecast', 'Lead Source Analysis', 'Quote Accuracy'];

const funnelData = [
  { stage: 'Lead Received', deals: 45, value: 892, avgDays: 2.1, convRate: 68, sla: 3 },
  { stage: 'Qualified', deals: 31, value: 724, avgDays: 3.8, convRate: 74, sla: 5 },
  { stage: 'Quote Sent', deals: 23, value: 615, avgDays: 4.2, convRate: 65, sla: 5 },
  { stage: 'Design Ready', deals: 15, value: 458, avgDays: 8.5, convRate: 80, sla: 7 },
  { stage: 'Order Request', deals: 12, value: 382, avgDays: 2.3, convRate: 92, sla: 3 },
  { stage: 'Closed Won', deals: 11, value: 351, avgDays: 0, convRate: 100, sla: 0 },
];

const winLossData = [
  { month: 'Oct', wins: 8, losses: 5 },
  { month: 'Nov', wins: 10, losses: 4 },
  { month: 'Dec', wins: 7, losses: 6 },
  { month: 'Jan', wins: 9, losses: 3 },
  { month: 'Feb', wins: 11, losses: 4 },
  { month: 'Mar', wins: 12, losses: 3 },
];

const lossReasons = [
  { name: 'Price', value: 32, color: '#EF4444' },
  { name: 'Timing/Budget', value: 24, color: '#F59E0B' },
  { name: 'Competitor', value: 18, color: '#3B82F6' },
  { name: 'Went Silent', value: 15, color: '#94A3B8' },
  { name: 'Cancelled', value: 8, color: '#7C3AED' },
  { name: 'Other', value: 3, color: '#64748B' },
];

const dealAgingData = [
  { deal: 'Baptist Health Q2 Apparel', value: '$45K', stage: 'Design Ready', owner: 'Tina H.', daysOpen: 28, daysInStage: 14, lastActivity: '3 days ago', sla: 'Red' },
  { deal: 'Cintas Safety Gear Reorder', value: '$32K', stage: 'Quote Sent', owner: 'Tina H.', daysOpen: 18, daysInStage: 8, lastActivity: '1 day ago', sla: 'Yellow' },
  { deal: 'FPL Earth Day Promo', value: '$28K', stage: 'Order Request', owner: 'Tina H.', daysOpen: 12, daysInStage: 3, lastActivity: 'Today', sla: 'Green' },
  { deal: 'Nicklaus Children Fundraiser', value: '$22K', stage: 'Qualified', owner: 'Tina H.', daysOpen: 8, daysInStage: 5, lastActivity: '2 days ago', sla: 'Green' },
  { deal: 'Royal Caribbean Cruise Packs', value: '$68K', stage: 'Design Ready', owner: 'Tina H.', daysOpen: 35, daysInStage: 22, lastActivity: '12 days ago', sla: 'Red' },
];

const forecastData = [
  { month: 'Apr', committed: 120, probable: 85, possible: 45, stretch: 20 },
  { month: 'May', committed: 95, probable: 110, possible: 65, stretch: 35 },
  { month: 'Jun', committed: 60, probable: 95, possible: 80, stretch: 50 },
  { month: 'Jul', committed: 30, probable: 70, possible: 95, stretch: 60 },
  { month: 'Aug', committed: 10, probable: 50, possible: 85, stretch: 70 },
  { month: 'Sep', committed: 0, probable: 30, possible: 70, stretch: 80 },
];

const leadSourceData = [
  { source: 'Referral', leads: 4, pipeline: '$86K', won: '$42K', winRate: '52%', cac: '$0', roi: '∞' },
  { source: 'Existing Client', leads: 6, pipeline: '$124K', won: '$68K', winRate: '58%', cac: '$0', roi: '∞' },
  { source: 'Website', leads: 3, pipeline: '$28K', won: '$0', winRate: '0%', cac: '~$67', roi: 'TBD' },
  { source: 'LinkedIn', leads: 2, pipeline: '$15K', won: '$0', winRate: '0%', cac: '$0', roi: 'TBD' },
  { source: 'One Percent Media', leads: 1, pipeline: '$4K', won: '$0', winRate: '0%', cac: '$2,000', roi: '-$2,000', bad: true },
  { source: 'Cold Outreach', leads: 3, pipeline: '$12K', won: '$0', winRate: '0%', cac: '~$500', roi: 'TBD' },
];

export function ReportsPipeline() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 overflow-auto bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 border-b border-slate-200">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-3.5 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === i ? 'bg-white text-blue-700 border border-slate-200 border-b-white -mb-px font-semibold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}>{tab}</button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{tabs[activeTab]}</h2>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Pipeline Velocity */}
        {activeTab === 0 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Pipeline Funnel — Stage Performance</h3>
              <div className="space-y-2">
                {funnelData.map((s, i) => {
                  const widthPct = (s.deals / funnelData[0].deals) * 100;
                  const overSla = s.avgDays > s.sla && s.sla > 0;
                  return (
                    <div key={s.stage} className="flex items-center gap-4">
                      <div className="w-32 text-right text-xs font-medium text-slate-700 flex-shrink-0">{s.stage}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full flex items-center px-3 transition-all ${overSla ? 'bg-red-400' : 'bg-blue-500'}`}
                          style={{ width: `${Math.max(widthPct, 10)}%` }}
                        >
                          <span className="text-[10px] font-bold text-white whitespace-nowrap">{s.deals} deals · ${s.value}K</span>
                        </div>
                      </div>
                      <div className="w-24 text-right flex-shrink-0">
                        <span className={`text-xs font-medium ${overSla ? 'text-red-600' : 'text-slate-600'}`}>{s.avgDays}d avg</span>
                      </div>
                      <div className="w-16 text-right flex-shrink-0">
                        <span className="text-xs text-slate-500">{s.convRate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
              <span className="font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Bottleneck:</span> Design Ready stage has the longest average duration (8.5 days, over 7-day SLA) with $458K in value sitting idle.
            </div>
          </>
        )}

        {/* Win/Loss */}
        {activeTab === 1 && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Win/Loss Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={winLossData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="wins" fill="#10B981" name="Won" radius={[3, 3, 0, 0]} barSize={25} />
                  <Bar dataKey="losses" fill="#EF4444" name="Lost" radius={[3, 3, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Loss Reason Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={lossReasons} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}>
                    {lossReasons.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Deal Aging */}
        {activeTab === 2 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Deal', 'Value', 'Stage', 'Owner', 'Days Open', 'Days in Stage', 'Last Activity', 'SLA'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dealAgingData.map(r => (
                  <tr key={r.deal} className={`border-b border-slate-100 hover:bg-slate-50 ${r.sla === 'Red' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900 max-w-[220px] truncate">{r.deal}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{r.value}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{r.stage}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.owner}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{r.daysOpen}</td>
                    <td className={`px-4 py-2.5 text-sm font-medium ${r.daysInStage > 14 ? 'text-red-600' : r.daysInStage > 7 ? 'text-amber-600' : 'text-slate-700'}`}>{r.daysInStage}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.lastActivity}</td>
                    <td className="px-4 py-2.5">
                      <span className={`w-3 h-3 rounded-full inline-block ${r.sla === 'Green' ? 'bg-green-500' : r.sla === 'Yellow' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Team Scorecard */}
        {activeTab === 3 && (
          <div className="grid grid-cols-2 gap-6">
            {[
              { name: 'Tina Hunter', role: 'Sales Manager', metrics: [
                { m: 'Revenue Closed', mtd: '$68K', target: '$80K', pct: 85 },
                { m: 'Deals Closed', mtd: '3', target: '5', pct: 60 },
                { m: 'Proposals Sent', mtd: '4', target: '8', pct: 50 },
                { m: 'Pipeline Generated', mtd: '$142K', target: '$100K', pct: 142 },
                { m: 'Avg Deal Size', mtd: '$22.7K', target: '$15K', pct: 151 },
                { m: 'Win Rate', mtd: '42%', target: '50%', pct: 84 },
              ]},
              { name: 'Melody', role: 'Business Development', metrics: [
                { m: 'Outreach Contacts', mtd: '119', target: '150', pct: 79 },
                { m: 'Leads Generated', mtd: '6', target: '10', pct: 60 },
                { m: 'Qualified Leads', mtd: '2', target: '4', pct: 50 },
                { m: 'Reactivation Contacts', mtd: '18', target: '25', pct: 72 },
                { m: 'Meetings Booked', mtd: '4', target: '6', pct: 67 },
              ]},
            ].map(person => (
              <div key={person.name} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800">{person.name}</h3>
                  <p className="text-xs text-slate-500">{person.role}</p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Metric', 'MTD', 'Target', '%'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {person.metrics.map(m => (
                      <tr key={m.m} className="border-b border-slate-50">
                        <td className="px-4 py-2 text-xs text-slate-700">{m.m}</td>
                        <td className="px-4 py-2 text-xs font-semibold text-slate-900">{m.mtd}</td>
                        <td className="px-4 py-2 text-xs text-slate-500">{m.target}</td>
                        <td className="px-4 py-2">
                          <span className={`text-xs font-bold ${m.pct >= 100 ? 'text-emerald-700' : m.pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{m.pct}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Forecast */}
        {activeTab === 4 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">6-Month Revenue Forecast ($K)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                <Tooltip formatter={(v: any) => [`$${v}K`, '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="committed" stackId="a" fill="#047857" name="Committed" radius={[0, 0, 0, 0]} />
                <Bar dataKey="probable" stackId="a" fill="#10B981" name="Probable (80%)" />
                <Bar dataKey="possible" stackId="a" fill="#6EE7B7" name="Possible (50%)" />
                <Bar dataKey="stretch" stackId="a" fill="#D1FAE5" name="Stretch (20%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Lead Source */}
        {activeTab === 5 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Source', 'Leads', 'Pipeline $', 'Won $', 'Win Rate', 'CAC', 'ROI'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leadSourceData.map(r => (
                    <tr key={r.source} className={`border-b border-slate-100 hover:bg-slate-50 ${r.bad ? 'bg-red-50/30' : r.roi === '∞' ? 'bg-green-50/30' : ''}`}>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.source}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.leads}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.pipeline}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.won}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.winRate}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.cac}</td>
                      <td className={`px-4 py-2.5 text-sm font-semibold ${r.roi === '∞' ? 'text-emerald-700' : r.bad ? 'text-red-600' : 'text-slate-600'}`}>{r.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 mb-3">
              <span className="font-bold">Best ROI:</span> Referrals ($0 CAC, $42K won) and Existing Client Upsell ($0 CAC, $68K won)
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800">
              <span className="font-bold">Worst ROI:</span> The One Percent Media ($2K/month, 1 lead, $0 won). Recommendation: Reallocate budget to referral programs.
            </div>
          </>
        )}

        {/* Quote Accuracy */}
        {activeTab === 6 && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Avg Quote Accuracy', value: '88%', color: 'text-blue-700' },
                { label: 'Jobs Underquoted', value: '14%', color: 'text-amber-600' },
                { label: 'Avg Margin Erosion', value: '-$1,200/job', color: 'text-red-600' },
                { label: 'Total Margin Lost MTD', value: '-$8,400', color: 'text-red-600' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                  <p className={`text-xl font-bold ${c.color} mt-1`}>{c.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Job #', 'Client', 'Quoted Cost', 'Actual Cost', 'Variance', 'Quoted Margin', 'Actual Margin', 'Difference'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { job: 'J-2026-042', client: 'Baptist Health', qCost: '$8,200', aCost: '$9,800', var: '+$1,600', qMargin: '38%', aMargin: '26%', diff: '-12 pts', bad: true },
                    { job: 'J-2026-039', client: 'FPL/NextEra', qCost: '$5,400', aCost: '$5,200', var: '-$200', qMargin: '42%', aMargin: '44%', diff: '+2 pts' },
                    { job: 'J-2026-035', client: 'Cintas', qCost: '$12,500', aCost: '$13,100', var: '+$600', qMargin: '35%', aMargin: '32%', diff: '-3 pts' },
                  ].map(r => (
                    <tr key={r.job} className={`border-b border-slate-100 hover:bg-slate-50 ${r.bad ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-2.5 text-sm font-mono text-slate-800">{r.job}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.client}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.qCost}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.aCost}</td>
                      <td className={`px-4 py-2.5 text-sm font-medium ${r.var.startsWith('+') ? 'text-red-600' : 'text-emerald-700'}`}>{r.var}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.qMargin}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.aMargin}</td>
                      <td className={`px-4 py-2.5 text-sm font-semibold ${r.diff.startsWith('-') ? 'text-red-600' : 'text-emerald-700'}`}>{r.diff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
