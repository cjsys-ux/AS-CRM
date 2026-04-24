import { useState } from 'react';
import { Download, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

const tabs = ['Fulfillment Metrics', 'Vendor Scorecard', 'Shipping Cost Analysis', 'Production Timeline', 'Warehouse Utilization', 'Quality & Returns'];

const fulfillmentTrend = [
  { month: 'Oct', promo: 92, ppe: 96 }, { month: 'Nov', promo: 94, ppe: 97 }, { month: 'Dec', promo: 91, ppe: 95 },
  { month: 'Jan', promo: 93, ppe: 98 }, { month: 'Feb', promo: 95, ppe: 97 }, { month: 'Mar', promo: 96, ppe: 98 },
];

const vendorData = [
  { vendor: 'Unigloves International', spend: '$1.8M', orders: 42, onTime: '96%', quality: 2, leadTime: '14 days', cost: 'Stable', score: 'A', color: 'bg-green-100 text-green-700' },
  { vendor: 'SC Promo', spend: '$420K', orders: 28, onTime: '75%', quality: 5, leadTime: '21 days', cost: '+3%', score: 'C', color: 'bg-orange-100 text-orange-700' },
  { vendor: 'Alphabroder', spend: '$180K', orders: 65, onTime: '92%', quality: 1, leadTime: '5 days', cost: 'Stable', score: 'B+', color: 'bg-emerald-100 text-emerald-700' },
  { vendor: 'SanMar', spend: '$145K', orders: 58, onTime: '94%', quality: 0, leadTime: '4 days', cost: '-1%', score: 'A', color: 'bg-green-100 text-green-700' },
  { vendor: 'RIM Freight', spend: '$95K', orders: 18, onTime: '88%', quality: 1, leadTime: '28 days', cost: '+5%', score: 'B', color: 'bg-yellow-100 text-yellow-700' },
];

const shippingTrend = [
  { month: 'Oct', spend: 32, pctRev: 5.8 }, { month: 'Nov', spend: 35, pctRev: 5.5 }, { month: 'Dec', spend: 38, pctRev: 5.3 },
  { month: 'Jan', spend: 30, pctRev: 5.2 }, { month: 'Feb', spend: 34, pctRev: 5.1 }, { month: 'Mar', spend: 36, pctRev: 4.9 },
];

const productionData = [
  { order: 'ORD-2026-089', client: 'Baptist Health', product: 'Custom Polo Shirts x500', start: '03/15', planned: '04/10', status: 'On Track', days: '0 ahead', risk: 'Green' },
  { order: 'ORD-2026-082', client: 'Cintas', product: 'Safety Gloves x2000', start: '03/01', planned: '04/05', status: 'On Track', days: '2 ahead', risk: 'Green' },
  { order: 'ORD-2026-078', client: 'FPL/NextEra', product: 'Earth Day Totes x1500', start: '02/20', planned: '03/28', status: 'At Risk', days: '5 behind', risk: 'Yellow' },
  { order: 'ORD-2026-075', client: 'Nicklaus', product: 'Fundraiser Caps x800', start: '02/15', planned: '03/25', status: 'Delayed', days: '10 behind', risk: 'Red' },
];

export function ReportsOperations() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex-1 overflow-auto bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 border-b border-slate-200">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-3.5 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === i ? 'bg-white text-purple-700 border border-slate-200 border-b-white -mb-px font-semibold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}>{tab}</button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">{tabs[activeTab]}</h2>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Fulfillment */}
        {activeTab === 0 && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'On-Time Delivery', value: '96.2%', icon: CheckCircle, color: 'text-emerald-700' },
                { label: 'Avg Fulfillment Time', value: '4.2 days', icon: Clock, color: 'text-blue-700' },
                { label: 'Orders Fulfilled', value: '342', icon: CheckCircle, color: 'text-slate-900' },
                { label: 'Perfect Order Rate', value: '91.8%', icon: CheckCircle, color: 'text-emerald-700' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                  <p className={`text-xl font-bold ${c.color} mt-1`}>{c.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">On-Time Delivery Trend (%)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={fulfillmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[85, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: any) => [`${v}%`, '']} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="promo" stroke="#10B981" strokeWidth={2} name="Promo" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="ppe" stroke="#3B82F6" strokeWidth={2} name="PPE" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey={() => 95} stroke="#EF4444" strokeWidth={1} strokeDasharray="5 5" name="Target (95%)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Vendor Scorecard */}
        {activeTab === 1 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Vendor', 'Spend (12mo)', 'Orders', 'On-Time %', 'Quality Issues', 'Avg Lead Time', 'Cost Trend', 'Score'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendorData.map(r => (
                  <tr key={r.vendor} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{r.vendor}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.spend}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.orders}</td>
                    <td className={`px-4 py-2.5 text-sm font-medium ${parseInt(r.onTime) >= 90 ? 'text-emerald-700' : 'text-red-600'}`}>{r.onTime}</td>
                    <td className={`px-4 py-2.5 text-sm ${r.quality > 3 ? 'text-red-600 font-medium' : 'text-slate-600'}`}>{r.quality}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.leadTime}</td>
                    <td className={`px-4 py-2.5 text-sm ${r.cost.startsWith('+') ? 'text-red-600' : r.cost.startsWith('-') ? 'text-emerald-700' : 'text-slate-600'}`}>{r.cost}</td>
                    <td className="px-4 py-2.5"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${r.color}`}>{r.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Shipping Cost */}
        {activeTab === 2 && (
          <>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm text-slate-700">
              <span className="font-bold">Total shipping spend:</span> $421K (2025) | <span className="font-bold">% of revenue:</span> 5.3% | <span className="font-bold">Avg cost per shipment:</span> $148
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Monthly Shipping Spend & % of Revenue</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={shippingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}K`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="spend" fill="#7C3AED" name="Shipping Spend ($K)" radius={[4, 4, 0, 0]} barSize={35} />
                  <Line yAxisId="right" type="monotone" dataKey="pctRev" stroke="#EF4444" strokeWidth={2} name="% of Revenue" dot={{ r: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Production Timeline */}
        {activeTab === 3 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Order #', 'Client', 'Product', 'Start', 'Planned Complete', 'Status', 'Days Ahead/Behind', 'Risk'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productionData.map(r => (
                  <tr key={r.order} className={`border-b border-slate-100 hover:bg-slate-50 ${r.risk === 'Red' ? 'bg-red-50/30' : r.risk === 'Yellow' ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-4 py-2.5 text-sm font-mono text-slate-800">{r.order}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.client}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700 max-w-[200px] truncate">{r.product}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.start}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.planned}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'On Track' ? 'bg-green-100 text-green-700' : r.status === 'At Risk' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>{r.status}</span>
                    </td>
                    <td className={`px-4 py-2.5 text-sm font-medium ${r.days.includes('behind') ? 'text-red-600' : 'text-emerald-700'}`}>{r.days}</td>
                    <td className="px-4 py-2.5"><span className={`w-3 h-3 rounded-full inline-block ${r.risk === 'Green' ? 'bg-green-500' : r.risk === 'Yellow' ? 'bg-amber-500' : 'bg-red-500'}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Warehouse */}
        {activeTab === 4 && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Current Warehouse Capacity</h3>
              <div className="flex h-10 rounded-lg overflow-hidden">
                <div className="bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '40%' }}>PPE 40%</div>
                <div className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '20%' }}>Promo 20%</div>
                <div className="bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '18%' }}>Pick&Pack 18%</div>
                <div className="bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '10%' }}>Stage 10%</div>
                <div className="bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600" style={{ width: '12%' }}>Avail 12%</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Metric', 'This Month', 'Last Month', 'Change'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { m: 'Inbound shipments received', curr: 42, prev: 38, change: '+10.5%' },
                    { m: 'Orders picked & packed', curr: 156, prev: 142, change: '+9.9%' },
                    { m: 'Outbound shipments', curr: 148, prev: 135, change: '+9.6%' },
                    { m: 'Average dwell time (days)', curr: 8.2, prev: 9.1, change: '-9.9%' },
                  ].map(r => (
                    <tr key={r.m} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-sm text-slate-800">{r.m}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{r.curr}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.prev}</td>
                      <td className={`px-4 py-2.5 text-sm font-medium ${r.change.startsWith('+') ? 'text-emerald-700' : 'text-emerald-700'}`}>{r.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Quality & Returns */}
        {activeTab === 5 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Quality Incidents MTD', value: '8' },
                { label: 'Return Rate', value: '1.2%' },
                { label: 'Cost of Quality', value: '$4,200' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{c.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Date', 'Order #', 'Client', 'Issue Type', 'Vendor', 'Resolution', 'Cost', 'Days'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: '03/28', order: 'ORD-089', client: 'Baptist', type: 'Misprint', vendor: 'SC Promo', res: 'Reprint', cost: '$1,200', days: 5 },
                    { date: '03/22', order: 'ORD-082', client: 'Cintas', type: 'Short Ship', vendor: 'Unigloves', res: 'Expedited ship', cost: '$380', days: 2 },
                    { date: '03/15', order: 'ORD-078', client: 'FPL', type: 'Wrong Item', vendor: 'Alphabroder', res: 'Replacement', cost: '$950', days: 4 },
                  ].map(r => (
                    <tr key={r.order} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.date}</td>
                      <td className="px-4 py-2.5 text-sm font-mono text-slate-800">{r.order}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.client}</td>
                      <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">{r.type}</span></td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.vendor}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.res}</td>
                      <td className="px-4 py-2.5 text-sm font-medium text-red-600">{r.cost}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{r.days}</td>
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
