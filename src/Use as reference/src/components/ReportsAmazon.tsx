import { useState } from 'react';
import { Download, Package, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, Cell, LineChart, Line } from 'recharts';

const tabs = ['SKU Performance', 'Deployment History', 'DC Distribution', 'IPF Billing Reconciliation', 'Brand Performance', 'Inventory & Reorder'];

const skuData = [
  { sku: 'IBS-GL-001', brand: 'Iron Bound Safety', product: 'Nitrile Work Gloves (L)', price: '$18.99', cost: '$8.20', margin: '56.8%', units: 42000, revenue: '$798K', dcs: 12, status: 'Active' },
  { sku: 'IBS-GL-002', brand: 'Iron Bound Safety', product: 'Nitrile Work Gloves (XL)', price: '$18.99', cost: '$8.20', margin: '56.8%', units: 38000, revenue: '$722K', dcs: 12, status: 'Active' },
  { sku: 'AT-TH-001', brand: 'Arctic Trax', product: 'Thermal Work Gloves', price: '$24.99', cost: '$11.50', margin: '54.0%', units: 28000, revenue: '$700K', dcs: 8, status: 'Active' },
  { sku: 'IBS-SC-001', brand: 'Iron Bound Safety', product: 'SPF 50 Sunscreen 4oz', price: '$12.99', cost: '$4.80', margin: '63.0%', units: 52000, revenue: '$675K', dcs: 15, status: 'Active' },
  { sku: 'SS-HL-001', brand: 'Scan Sling', product: 'Scanner Holster Universal', price: '$34.99', cost: '$14.20', margin: '59.4%', units: 15000, revenue: '$525K', dcs: 10, status: 'Active' },
];

const deploymentData = [
  { po: 'PO-2026-042', sku: 'IBS-GL-001', units: 5000, value: '$41K', orderDate: '03/01', shipDate: '03/15', dcs: '8 DCs', status: 'Completed', leadTime: 14, onTime: true },
  { po: 'PO-2026-038', sku: 'AT-TH-001', units: 3000, value: '$34.5K', orderDate: '02/20', shipDate: '03/08', dcs: '6 DCs', status: 'Completed', leadTime: 16, onTime: true },
  { po: 'PO-2026-045', sku: 'IBS-SC-001', units: 8000, value: '$38.4K', orderDate: '03/10', shipDate: '—', dcs: '10 DCs', status: 'In Progress', leadTime: null, onTime: null },
  { po: 'PO-2026-032', sku: 'SS-HL-001', units: 2000, value: '$28.4K', orderDate: '02/10', shipDate: '03/01', dcs: '5 DCs', status: 'Completed', leadTime: 19, onTime: false },
];

const ipfData = [
  { asInvoice: 'INV-2026-089', ipfPO: 'IPF-4521', amount: '$142,000', invoiced: '01/15/26', expected: '04/15/26', actual: '—', days: 79, amazonRef: 'AMZ-7842', status: 'Outstanding' },
  { asInvoice: 'INV-2026-094', ipfPO: 'IPF-4535', amount: '$98,000', invoiced: '02/01/26', expected: '05/02/26', actual: '—', days: 62, amazonRef: 'AMZ-7918', status: 'Outstanding' },
  { asInvoice: 'INV-2026-078', ipfPO: 'IPF-4498', amount: '$85,000', invoiced: '12/15/25', expected: '03/15/26', actual: '03/18/26', days: 93, amazonRef: 'AMZ-7756', status: 'Paid' },
  { asInvoice: 'INV-2026-072', ipfPO: 'IPF-4482', amount: '$112,000', invoiced: '11/20/25', expected: '02/18/26', actual: '02/22/26', days: 94, amazonRef: 'AMZ-7698', status: 'Paid' },
];

const brandData = [
  { brand: 'Iron Bound Safety', revenue: '$2.2M', units: '132K', skus: 8, margin: '57.2%', customers: 'Amazon, Cintas', trend: 'Growing' },
  { brand: 'Arctic Trax', revenue: '$700K', units: '28K', skus: 3, margin: '54.0%', customers: 'Amazon', trend: 'Growing' },
  { brand: 'Scan Sling', revenue: '$525K', units: '15K', skus: 2, margin: '59.4%', customers: 'Amazon', trend: 'Stable' },
];

const inventoryData = [
  { sku: 'IBS-GL-001', product: 'Nitrile Gloves (L)', location: 'Airport Industrial', onHand: 8500, reserved: 2000, available: 6500, reorder: 5000, dos: 32, status: 'In Stock' },
  { sku: 'IBS-SC-001', product: 'SPF 50 Sunscreen', location: 'Airport Industrial', onHand: 3200, reserved: 1500, available: 1700, reorder: 3000, dos: 8, status: 'Low Stock' },
  { sku: 'AT-TH-001', product: 'Thermal Gloves', location: 'Airport Industrial', onHand: 1200, reserved: 800, available: 400, reorder: 2000, dos: 4, status: 'Reorder Needed' },
  { sku: 'SS-HL-001', product: 'Scanner Holster', location: 'Turkana', onHand: 4200, reserved: 500, available: 3700, reorder: 2000, dos: 45, status: 'In Stock' },
];

export function ReportsAmazon() {
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
          <h2 className="text-lg font-bold text-slate-900">{tabs[activeTab]}</h2>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* SKU Performance */}
        {activeTab === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['SKU', 'Brand', 'Product', 'Amazon Price', 'Our Cost', 'Margin', 'Units Sold', 'Revenue', 'DCs', 'Status'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skuData.map(r => (
                  <tr key={r.sku} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-sm font-mono text-slate-800">{r.sku}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{r.brand}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-900 max-w-[180px] truncate" title={r.product}>{r.product}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{r.price}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{r.cost}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-emerald-700">{r.margin}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{r.units.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-slate-800">{r.revenue}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{r.dcs}</td>
                    <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Deployment */}
        {activeTab === 1 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['PO #', 'SKU', 'Units', 'Value', 'Order Date', 'Ship Date', 'DCs', 'Status', 'Lead Time', 'On-Time'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deploymentData.map(r => (
                  <tr key={r.po} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-sm font-mono text-slate-800">{r.po}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{r.sku}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{r.units.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-slate-800">{r.value}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{r.orderDate}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{r.shipDate}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{r.dcs}</td>
                    <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span></td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{r.leadTime ? `${r.leadTime}d` : '—'}</td>
                    <td className="px-3 py-2.5">{r.onTime === true ? <span className="text-emerald-600">✓</span> : r.onTime === false ? <span className="text-red-600">✗</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DC Distribution */}
        {activeTab === 2 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['DC Code', 'Location', 'Shipments', 'Units', 'Value', 'Last Ship', 'Avg Lead Time'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { dc: 'TPA1', loc: 'Tampa, FL', ship: 28, units: '18K', value: '$156K', last: '03/28', lead: '3 days' },
                  { dc: 'MDW2', loc: 'Chicago, IL', ship: 22, units: '14K', value: '$122K', last: '03/25', lead: '5 days' },
                  { dc: 'DFW5', loc: 'Dallas, TX', ship: 18, units: '12K', value: '$98K', last: '03/22', lead: '4 days' },
                  { dc: 'ONT8', loc: 'Ontario, CA', ship: 15, units: '10K', value: '$85K', last: '03/20', lead: '6 days' },
                  { dc: 'BNA3', loc: 'Nashville, TN', ship: 12, units: '8K', value: '$68K', last: '03/18', lead: '4 days' },
                ].map(r => (
                  <tr key={r.dc} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-sm font-mono font-bold text-blue-700">{r.dc}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-800">{r.loc}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{r.ship}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{r.units}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.value}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.last}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.lead}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* IPF Billing */}
        {activeTab === 3 && (
          <>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Total Invoiced (YTD)', value: '$1.64M' },
                { label: 'Total Collected', value: '$1.12M' },
                { label: 'Outstanding', value: '$412K' },
                { label: 'Avg Days to Payment', value: '94 days' },
                { label: 'Longest Outstanding', value: '79 days' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
                  <p className="text-xs text-blue-600 font-medium">{c.label}</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{c.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-800">IPF Billing Reconciliation</h3>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold ml-2">CRITICAL</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-50/50 border-b border-blue-200">
                    {['AS Invoice #', 'IPF PO', 'Amount', 'Invoiced', 'Expected (Net 90)', 'Actual', 'Days Out', 'Amazon Ref', 'Status'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold text-blue-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ipfData.map(r => (
                    <tr key={r.asInvoice} className="border-b border-slate-100 hover:bg-blue-50/30">
                      <td className="px-3 py-2.5 text-sm font-mono text-slate-800">{r.asInvoice}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-slate-800">{r.ipfPO}</td>
                      <td className="px-3 py-2.5 text-sm font-bold text-slate-900">{r.amount}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-600">{r.invoiced}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-600">{r.expected}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-600">{r.actual}</td>
                      <td className={`px-3 py-2.5 text-sm font-medium ${r.days > 90 ? 'text-red-600' : 'text-slate-700'}`}>{r.days}</td>
                      <td className="px-3 py-2.5 text-sm font-mono text-slate-600">{r.amazonRef}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Brand Performance */}
        {activeTab === 4 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Brand', 'Revenue (12mo)', 'Units', 'SKUs', 'Avg Margin', 'Customers', 'Trend'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brandData.map(r => (
                  <tr key={r.brand} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-sm font-bold text-slate-900">{r.brand}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{r.revenue}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{r.units}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.skus}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-emerald-700">{r.margin}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{r.customers}</td>
                    <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.trend === 'Growing' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{r.trend}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Inventory & Reorder */}
        {activeTab === 5 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['SKU', 'Product', 'Location', 'On Hand', 'Reserved', 'Available', 'Reorder Pt', 'Days Supply', 'Status'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryData.map(r => (
                  <tr key={r.sku} className={`border-b border-slate-100 hover:bg-slate-50 ${r.status === 'Reorder Needed' ? 'bg-orange-50/30' : r.status === 'Low Stock' ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-3 py-2.5 text-sm font-mono text-slate-800">{r.sku}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-900 max-w-[160px] truncate">{r.product}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{r.location}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{r.onHand.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{r.reserved.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-slate-800">{r.available.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">{r.reorder.toLocaleString()}</td>
                    <td className={`px-3 py-2.5 text-sm font-medium ${r.dos <= 7 ? 'text-red-600' : r.dos <= 14 ? 'text-amber-600' : 'text-slate-700'}`}>{r.dos} days</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'In Stock' ? 'bg-green-100 text-green-700' :
                        r.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'
                      }`}>{r.status}</span>
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
