import { useState } from 'react';
import { Download, AlertTriangle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, LineChart, Line } from 'recharts';

const tabs = ['Channel ROI', 'Lead Attribution', 'Campaign Performance', 'Content Analytics', 'Marketing Spend'];

const channelData = [
  { channel: 'Referral', spend: 0, leads: 4, pipeline: '$86K', won: '$42K', cac: '$0', ltv: '$45K', roi: '∞', payback: '0' },
  { channel: 'Existing Client Upsell', spend: 0, leads: 6, pipeline: '$124K', won: '$68K', cac: '$0', ltv: '$52K', roi: '∞', payback: '0' },
  { channel: 'Website / Inbound', spend: 200, leads: 3, pipeline: '$28K', won: '$0', cac: '~$67', ltv: 'TBD', roi: 'TBD', payback: 'TBD' },
  { channel: 'LinkedIn (organic)', spend: 0, leads: 2, pipeline: '$15K', won: '$0', cac: '$0', ltv: 'TBD', roi: 'TBD', payback: 'TBD' },
  { channel: 'The One Percent Media', spend: 2000, leads: 1, pipeline: '$4K', won: '$0', cac: '$2,000', ltv: 'TBD', roi: '-$2,000', payback: 'Never', bad: true },
  { channel: 'Cold Outreach (Melody)', spend: 1500, leads: 3, pipeline: '$12K', won: '$0', cac: '~$500', ltv: 'TBD', roi: 'TBD', payback: 'TBD' },
];

const chartData = channelData.map(c => ({
  name: c.channel.length > 20 ? c.channel.slice(0, 18) + '...' : c.channel,
  spend: c.spend,
  won: parseInt(c.won.replace(/[$K,]/g, '')) || 0,
}));

const spendData = [
  { cat: 'The One Percent Media', monthly: '$2,000', annual: '$24,000', pctRev: '0.30%', trend: 'Flat' },
  { cat: 'BNI Membership', monthly: '$117', annual: '$1,398', pctRev: '0.02%', trend: 'Flat' },
  { cat: 'Events', monthly: 'Variable', annual: '~$3,000', pctRev: '0.04%', trend: '—' },
  { cat: 'Total', monthly: '~$2,300', annual: '~$28,400', pctRev: '0.36%', trend: '', bold: true },
];

export function ReportsMarketing() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 overflow-auto bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 border-b border-slate-200">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-3.5 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === i ? 'bg-white text-red-600 border border-slate-200 border-b-white -mb-px font-semibold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}>{tab}</button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">{tabs[activeTab]}</h2>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Channel ROI */}
        {activeTab === 0 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Spend vs Revenue Won by Channel ($K)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} width={120} />
                  <Tooltip formatter={(v: any) => [`$${v}K`, '']} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="spend" fill="#EF4444" name="Spend ($K)" barSize={14} radius={[0, 3, 3, 0]} />
                  <Bar dataKey="won" fill="#10B981" name="Revenue Won ($K)" barSize={14} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Channel', 'Monthly Spend', 'Leads', 'Pipeline $', 'Won $', 'CAC', 'LTV', 'ROI', 'Payback'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {channelData.map(r => (
                    <tr key={r.channel} className={`border-b border-slate-100 hover:bg-slate-50 ${r.bad ? 'bg-red-50/30' : r.roi === '∞' ? 'bg-green-50/30' : ''}`}>
                      <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{r.channel}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-700">${r.spend.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-700">{r.leads}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-700">{r.pipeline}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-slate-800">{r.won}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-600">{r.cac}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-600">{r.ltv}</td>
                      <td className={`px-3 py-2.5 text-sm font-bold ${r.roi === '∞' ? 'text-emerald-700' : r.bad ? 'text-red-600' : 'text-slate-600'}`}>{r.roi}</td>
                      <td className={`px-3 py-2.5 text-sm ${r.payback === 'Never' ? 'text-red-600 font-medium' : 'text-slate-600'}`}>{r.payback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800">
                <span className="font-bold">Best ROI:</span> Referrals ($0 CAC, $42K won) and Existing Client Upsell ($0 CAC, $68K won)
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800">
                <span className="font-bold">Worst ROI:</span> The One Percent Media ($2K/mo, 1 lead, $0 won). Recommend reallocation.
              </div>
            </div>
          </>
        )}

        {/* Lead Attribution */}
        {activeTab === 1 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-slate-500 text-sm mb-2">Lead attribution analysis requires tracking data from CRM touchpoints.</p>
            <p className="text-xs text-slate-400">Configure first-touch and last-touch attribution in Settings to enable this report.</p>
          </div>
        )}

        {/* Campaign Performance */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-800">Email Campaigns (Mailchimp)</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Campaign', 'Date', 'Sent', 'Open Rate', 'Click Rate', 'Leads', 'Revenue'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Spring Safety Promo', date: '03/15/26', sent: 1200, open: '28%', click: '4.2%', leads: 3, rev: '$0' },
                    { name: 'Q1 Product Catalog', date: '02/01/26', sent: 1450, open: '32%', click: '5.1%', leads: 5, rev: '$12K' },
                    { name: 'Holiday Gift Guide', date: '11/20/25', sent: 1300, open: '35%', click: '6.8%', leads: 8, rev: '$28K' },
                  ].map(r => (
                    <tr key={r.name} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.name}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.date}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.sent.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.open}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.click}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.leads}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.rev}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-800">Social Media (The One Percent Media)</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Month', 'Posts', 'Impressions', 'Engagement', 'Leads', 'Revenue'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: 'March 2026', posts: 12, impressions: '4,200', engagement: '2.1%', leads: 0, rev: '$0' },
                    { month: 'February 2026', posts: 10, impressions: '3,800', engagement: '1.8%', leads: 1, rev: '$0' },
                    { month: 'January 2026', posts: 8, impressions: '3,100', engagement: '1.5%', leads: 0, rev: '$0' },
                  ].map(r => (
                    <tr key={r.month} className="border-b border-slate-100 hover:bg-slate-50 bg-red-50/20">
                      <td className="px-4 py-2.5 text-sm text-slate-800">{r.month}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.posts}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.impressions}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.engagement}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.leads}</td>
                      <td className="px-4 py-2.5 text-sm text-red-600 font-medium">{r.rev}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Analytics */}
        {activeTab === 3 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-slate-500 text-sm mb-2">Connect Google Analytics and social platforms to enable content analytics.</p>
            <p className="text-xs text-slate-400">Website traffic, search rankings, and social metrics will appear here once connected.</p>
          </div>
        )}

        {/* Marketing Spend */}
        {activeTab === 4 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Category', 'Monthly', 'Annual', '% of Revenue', 'Trend'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spendData.map(r => (
                    <tr key={r.cat} className={`border-b border-slate-100 ${r.bold ? 'bg-slate-50 font-bold' : 'hover:bg-slate-50'}`}>
                      <td className={`px-4 py-2.5 text-sm ${r.bold ? 'font-bold text-slate-900' : 'text-slate-800'}`}>{r.cat}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.monthly}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.annual}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.pctRev}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-500">{r.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-red-800 mb-2">Marketing Investment Gap</h3>
                  <div className="space-y-1 text-xs text-red-700">
                    <p><span className="font-bold">Current marketing spend as % of revenue: 0.36%</span></p>
                    <p>Industry average for growth companies: <span className="font-bold">5-10%</span></p>
                    <p className="mt-2 font-semibold">If targeting $200M in 3 years, marketing investment needs to increase significantly from ~$28K/year to $400K-$1M+/year.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
