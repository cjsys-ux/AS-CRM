import { motion } from 'motion/react';
import { useState } from 'react';
import { Shield, Package, Truck, DollarSign, FlaskConical, Percent, AlertTriangle, Info, ChevronRight, Search, Plus, ArrowUpRight, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

// ─── Data ───
const skuPipelineColumns = [
  { id: 'concept', title: 'Concept', color: '#94A3B8', cards: [
    { sku: 'IBS-3100', name: 'High-Vis Safety Vest', brand: 'Iron Bound Safety', brandColor: '#3B82F6', note: 'Researching Amazon demand + pricing competitive analysis', owner: 'Truscott', date: 'Mar 15' },
    { sku: 'AT-2100', name: 'Insulated Work Gloves', brand: 'Arctic Trax', brandColor: '#14B8A6', note: 'Evaluating 2 factories in China for thermal lining', owner: 'Liz', date: 'Mar 20' },
    { sku: 'KP-1000', name: 'Knee Pad Insert', brand: 'New Brand TBD', brandColor: '#94A3B8', note: 'Patrick evaluating new product category expansion', owner: 'Patrick', date: 'Mar 28' },
  ]},
  { id: 'sourcing', title: 'Sourcing', color: '#3B82F6', cards: [
    { sku: 'IBS-3100', name: 'Safety Vest', brand: 'Iron Bound Safety', brandColor: '#3B82F6', note: '3 factory quotes received. SC Promo: $4.20, Factory B: $4.85, Factory C: $3.95', owner: 'Liz', date: 'Mar 10', extra: 'Target margin: 22%' },
    { sku: 'AT-3050', name: 'Thermal Blanket', brand: 'Arctic Trax', brandColor: '#14B8A6', note: 'KSE Supplies quote: $6.80/unit. Evaluating Indian alt.', owner: 'Truscott', date: 'Mar 12' },
    { sku: 'IBS-4300', name: 'Safety Harness', brand: 'Iron Bound Safety', brandColor: '#3B82F6', note: 'Initial vendor outreach — 2 responses pending', owner: 'Liz', date: 'Mar 25' },
    { sku: 'SS-1300', name: 'Tool Holster Pro', brand: 'Scan Sling', brandColor: '#7C3AED', note: 'Single source — Hit Promo evaluating', owner: 'Truscott', date: 'Mar 22' },
  ]},
  { id: 'sampling', title: 'Sampling', color: '#7C3AED', cards: [
    { sku: 'IBS-4200', name: 'Anti-Fog Safety Glasses', brand: 'Iron Bound Safety', brandColor: '#3B82F6', note: 'Factory sample received Mar 22 — QC passed', owner: 'Truscott', date: 'Mar 22', status: 'READY TO SUBMIT', statusColor: '#10B981' },
    { sku: 'IBS-2300', name: 'Cut-Resistant Gloves', brand: 'Iron Bound Safety', brandColor: '#3B82F6', note: 'Pre-production sample shipped from SC Promo Mar 18', owner: 'Liz', date: 'Mar 18', status: 'IN TRANSIT', statusColor: '#3B82F6', extra: 'ETA: Apr 2' },
    { sku: 'SS-1200', name: 'Scan Sling Pro', brand: 'Scan Sling', brandColor: '#7C3AED', note: 'Amazon rejected first sample — too bulky. Revising design.', owner: 'Truscott', date: 'Mar 5', status: 'REVISION NEEDED', statusColor: '#EF4444' },
    { sku: 'AT-1060', name: 'Thermal Socks', brand: 'Arctic Trax', brandColor: '#14B8A6', note: 'Minor color issue, revision requested', owner: 'Liz', date: 'Mar 20', status: 'REVISION', statusColor: '#F59E0B' },
  ]},
  { id: 'approval', title: 'Awaiting Approval', color: '#F59E0B', cards: [
    { sku: 'IBS-3100', name: 'Safety Vest', brand: 'Iron Bound Safety', brandColor: '#3B82F6', note: 'Submitted to Amazon Mar 10 — awaiting buyer review', owner: 'Truscott', date: 'Mar 10', status: 'PENDING', statusColor: '#F59E0B', days: 26 },
    { sku: 'AT-2050', name: 'Thermal Gloves', brand: 'Arctic Trax', brandColor: '#14B8A6', note: 'Submitted Mar 20', owner: 'Truscott', date: 'Mar 20', status: 'PENDING', statusColor: '#F59E0B', days: 16 },
    { sku: 'IBS-4200', name: 'Anti-Fog Glasses', brand: 'Iron Bound Safety', brandColor: '#3B82F6', note: 'Submitted Mar 25', owner: 'Truscott', date: 'Mar 25', status: 'PENDING', statusColor: '#F59E0B', days: 11 },
    { sku: 'IBS-3200', name: 'Hi-Vis Vest', brand: 'Iron Bound Safety', brandColor: '#3B82F6', note: 'Submitted Mar 28', owner: 'Truscott', date: 'Mar 28', status: 'PENDING', statusColor: '#10B981', days: 8 },
    { sku: 'SS-1200', name: 'Scan Sling Pro (Rev)', brand: 'Scan Sling', brandColor: '#7C3AED', note: 'Revised sample resubmitted Mar 30', owner: 'Truscott', date: 'Mar 30', status: 'RESUBMITTED', statusColor: '#3B82F6', days: 6 },
  ]},
  { id: 'approved', title: 'Approved', color: '#10B981', cards: [
    { sku: 'CTX-100', name: 'Sunscreen Packets', brand: 'CoreTex', brandColor: '#14B8A6', note: 'Approved. Setting up pricing in Amazon system.', owner: 'Truscott', date: 'Mar 5', status: 'AWAITING FIRST PO', statusColor: '#3B82F6' },
    { sku: 'AT-1050', name: 'Thermal Socks', brand: 'Arctic Trax', brandColor: '#14B8A6', note: 'Approved. First deployment PO expected Apr 15.', owner: 'Truscott', date: 'Mar 8', status: 'PO EXPECTED', statusColor: '#10B981' },
    { sku: 'IBS-2400', name: 'Welding Gloves', brand: 'Iron Bound Safety', brandColor: '#3B82F6', note: 'Approved Mar 28. Awaiting inventory build.', owner: 'Liz', date: 'Mar 28', status: 'SETUP', statusColor: '#3B82F6' },
  ]},
];

const activeSkus = [
  { sku: 'IBS-2240', name: 'Iron Bound Safety Gloves', rev: '$128K', units: '4,200' },
  { sku: 'IBS-2100', name: 'Iron Bound Nitrile Gloves', rev: '$85K', units: '3,100' },
  { sku: 'AT-1000', name: 'Arctic Trax Thermal Gloves', rev: '$62K', units: '2,800' },
  { sku: 'CTX-100', name: 'CoreTex Sunscreen', rev: '$48K', units: '6,000' },
  { sku: 'SS-1000', name: 'Scan Sling Holster', rev: '$35K', units: '1,200' },
  { sku: 'AT-1020', name: 'Arctic Trax Beanies', rev: '$22K', units: '1,800' },
  { sku: 'IBS-2050', name: 'Mechanic Gloves', rev: '$18K', units: '900' },
  { sku: 'KSE-500', name: 'KSE Thermal Blankets', rev: '$15K', units: '600' },
  { sku: 'IBS-2150', name: 'Impact Gloves', rev: '$12K', units: '750' },
  { sku: 'AT-1030', name: 'Neck Gaiter', rev: '$8K', units: '1,100' },
  { sku: 'SS-1100', name: 'Scan Sling Mini', rev: '$6K', units: '400' },
  { sku: 'IBS-2250', name: 'Chemical Gloves', rev: '$4K', units: '350' },
  { sku: 'AT-1040', name: 'Ear Warmers', rev: '$3K', units: '500' },
  { sku: 'SS-1050', name: 'Badge Holder', rev: '$1.5K', units: '200' },
  { sku: 'IBS-2350', name: 'Cut-5 Gloves', rev: '$0.5K', units: '100' },
];

const deployments = [
  { po: 'PO-4510', product: 'Iron Bound Gloves IBS-2240', brand: 'IBS', units: 4000, dcs: 8, shipped: 0, remaining: 4000, value: '$72,000', status: 'Waiting on Amazon', statusColor: '#F59E0B', eta: '—' },
  { po: 'PO-4508', product: 'Arctic Trax Beanies AT-1020', brand: 'AT', units: 3000, dcs: 6, shipped: 3, remaining: 1500, value: '$45,000', status: 'Partially shipped', statusColor: '#3B82F6', eta: 'Apr 5' },
  { po: 'PO-4522', product: 'Squincher Hydration', brand: '—', units: 6000, dcs: 12, shipped: 0, remaining: 6000, value: '$38,000', status: 'In transit to Turkana', statusColor: '#7C3AED', eta: 'Apr 8' },
  { po: 'PO-4530', product: 'Iron Bound Gloves IBS-2240', brand: 'IBS', units: 5000, dcs: 10, shipped: 0, remaining: 5000, value: '$128,000', status: 'In production (60%)', statusColor: '#F59E0B', eta: 'May 10' },
  { po: 'PO-4535', product: 'CoreTex Sunscreen CTX-100', brand: 'CTX', units: 8000, dcs: 15, shipped: 0, remaining: 8000, value: '$85,000', status: 'Packaging phase', statusColor: '#14B8A6', eta: 'Apr 20' },
  { po: 'PO-4540', product: 'KSE Thermal Blankets', brand: 'KSE', units: 2500, dcs: 5, shipped: 0, remaining: 2500, value: '$55,000', status: 'Mfg complete', statusColor: '#10B981', eta: 'Apr 25' },
];

const inventoryData = [
  { sku: 'IBS-2240', product: 'Iron Bound Gloves', brand: 'IBS', location: 'Turkana', units: 6200, value: '$124,000', dos: 42, reorder: 'Stocked', reorderColor: '#10B981' },
  { sku: 'IBS-2240', product: 'Iron Bound Gloves', brand: 'IBS', location: 'Warehouse', units: 1800, value: '$36,000', dos: 12, reorder: 'Low', reorderColor: '#F59E0B' },
  { sku: 'IBS-2100', product: 'Nitrile Gloves', brand: 'IBS', location: 'Turkana', units: 4100, value: '$82,000', dos: 35, reorder: 'Stocked', reorderColor: '#10B981' },
  { sku: 'AT-1000', product: 'Thermal Gloves', brand: 'AT', location: 'In Transit', units: 2800, value: '$56,000', dos: 0, reorder: 'Incoming', reorderColor: '#3B82F6' },
  { sku: 'CTX-100', product: 'Sunscreen Packets', brand: 'CTX', location: 'Turkana', units: 3200, value: '$48,000', dos: 18, reorder: 'Stocked', reorderColor: '#10B981' },
  { sku: 'SS-1000', product: 'Scan Sling Holster', brand: 'SS', location: 'Warehouse', units: 800, value: '$24,000', dos: 22, reorder: 'Stocked', reorderColor: '#10B981' },
  { sku: 'AT-1020', product: 'Arctic Trax Beanies', brand: 'AT', location: 'Warehouse', units: 1500, value: '$22,500', dos: 8, reorder: 'Reorder', reorderColor: '#F97316' },
];

const brandSparkIBS = [{ m: 1, v: 180 }, { m: 2, v: 210 }, { m: 3, v: 240 }, { m: 4, v: 255 }, { m: 5, v: 270 }, { m: 6, v: 285 }];
const brandSparkAT = [{ m: 1, v: 62 }, { m: 2, v: 75 }, { m: 3, v: 82 }, { m: 4, v: 90 }, { m: 5, v: 98 }, { m: 6, v: 108 }];
const brandSparkSS = [{ m: 1, v: 28 }, { m: 2, v: 35 }, { m: 3, v: 38 }, { m: 4, v: 42 }, { m: 5, v: 48 }, { m: 6, v: 55 }];

const channels = [
  { name: 'Amazon Direct', skus: 15, rev: '$448K MTD', deploys: 6, status: 'Active', statusColor: '#10B981', note: 'Next: PO-4510 (awaiting DC schedule)' },
  { name: 'Cintas', skus: 2, rev: '$38K MTD', deploys: 0, status: 'Active', statusColor: '#10B981', note: 'Opportunity: expand 2 → 10+ SKUs' },
  { name: 'Amazon Business (B2B)', skus: 5, rev: '$12K MTD', deploys: 0, status: 'Growing', statusColor: '#F59E0B', note: 'Low volume — needs marketing push' },
  { name: 'Grainger', skus: 0, rev: '$0', deploys: 0, status: 'Prospect', statusColor: '#F97316', note: 'Introduction made — needs follow-up' },
];

const sampleTracker = [
  { group: 'Factory Sampling', items: [
    { name: 'Cut-Resistant Gloves IBS-2300', detail: 'SC Promo → Expected Apr 2', status: 'In Transit', statusColor: '#3B82F6' },
    { name: 'Insulated Gloves AT-2100', detail: 'Factory C → Expected Apr 10', status: 'In Production', statusColor: '#7C3AED' },
  ]},
  { group: 'Pre-Production Review', items: [
    { name: 'Anti-Fog Glasses IBS-4200', detail: 'QC Passed ✅ — Ready to submit', status: 'Ready', statusColor: '#10B981' },
    { name: 'Safety Vest IBS-3100', detail: 'Awaiting Patrick review — 3 days', status: 'Review', statusColor: '#F59E0B' },
    { name: 'Thermal Socks AT-1060', detail: 'Minor color issue, revision', status: 'Revision', statusColor: '#F59E0B' },
    { name: 'Knee Pad KP-1000', detail: 'Design phase, no sample yet', status: 'Design', statusColor: '#94A3B8' },
  ]},
  { group: 'Amazon Review', items: [
    { name: 'Safety Vest IBS-3100', detail: 'Submitted Mar 10 — 26 days', status: 'Overdue', statusColor: '#EF4444', days: 26 },
    { name: 'Thermal Gloves AT-2050', detail: 'Submitted Mar 20 — 16 days', status: 'Late', statusColor: '#F97316', days: 16 },
    { name: 'Anti-Fog Glasses IBS-4200', detail: 'Submitted Mar 25 — 11 days', status: 'Pending', statusColor: '#F59E0B', days: 11 },
    { name: 'Scan Sling Pro SS-1200', detail: 'REJECTED — Revision needed', status: 'Rejected', statusColor: '#EF4444' },
    { name: 'Hi-Vis Vest IBS-3200', detail: 'Submitted Mar 28 — 8 days', status: 'On Track', statusColor: '#10B981', days: 8 },
  ]},
];

// ─── Component ───
export function IronBoundSafetyDashboard() {
  const [brandFilter, setBrandFilter] = useState('All');
  const [deployTab, setDeployTab] = useState<'In Progress' | 'Upcoming' | 'Completed'>('In Progress');
  const [invTab, setInvTab] = useState('All');

  const daysBadge = (d?: number) => {
    if (d === undefined) return null;
    const bg = d > 21 ? '#FEE2E2' : d > 14 ? '#FFEDD5' : d > 7 ? '#FEF3C7' : '#D1FAE5';
    const tx = d > 21 ? '#991B1B' : d > 14 ? '#9A3412' : d > 7 ? '#92400E' : '#065F46';
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap" style={{ backgroundColor: bg, color: tx }}>{d}d</span>;
  };

  return (
    <>
      {/* Row 1 — KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">APPROVED SKUS</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">15</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Pipeline: 8 pending approval</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">Target: 50+ by EOY 2026</p>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-[#3B82F6] rounded-full" style={{ width: '30%' }} /></div>
            </div>
            <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center shrink-0"><BarChart3 className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">INVENTORY VALUE</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$842,000</h3>
              <p className="text-[10px] text-[#64748B] mt-1">WH: $218K | Turkana: $485K | Transit: $139K</p>
              <div className="flex items-center gap-1 mt-0.5"><ArrowUpRight className="w-3 h-3 text-[#10B981]" /><span className="text-[10px] text-[#10B981] font-semibold">32,400 units on hand</span></div>
            </div>
            <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">ACTIVE DEPLOYMENTS</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">6</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Value: $423,000</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">DCs awaiting shipment: 24</p>
            </div>
            <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center shrink-0"><Truck className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">PPE REVENUE (MTD)</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">$448,000</h3>
              <div className="flex items-center gap-1 mt-1"><ArrowUpRight className="w-3 h-3 text-[#10B981]" /><span className="text-[10px] text-[#10B981] font-semibold">vs $310K LY (+45%)</span></div>
              <p className="text-[10px] text-[#64748B] mt-0.5">YTD: $1.64M | Run: $6.56M</p>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center shrink-0"><DollarSign className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">SAMPLES & APPROVALS</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#1E293B]">11</h3>
              <p className="text-[10px] text-[#64748B] mt-1">Pre-prod: 4 | Amazon: 5 | Factory: 2</p>
              <p className="text-[10px] text-[#F59E0B] font-semibold mt-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />3 awaiting &gt;14 days</p>
            </div>
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center shrink-0"><FlaskConical className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px] mb-1">GROSS MARGIN (PPE)</p>
              <h3 className="text-[18px] md:text-[24px] font-bold text-[#3B82F6]">18.5%</h3>
              <div className="flex items-center gap-1 mt-1"><Info className="w-3 h-3 text-[#64748B]" /><span className="text-[10px] text-[#64748B]">Compressed by IPF billing</span></div>
              <p className="text-[10px] text-[#64748B] mt-0.5">Rev: $448K | Cost: $365K</p>
            </div>
            <div className="w-10 h-10 bg-[#14B8A6] rounded-full flex items-center justify-center shrink-0"><Percent className="w-4 h-4 text-white" /></div>
          </div>
        </motion.div>
      </div>

      {/* Row 2 — SKU Pipeline Kanban */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-[16px] font-semibold text-[#1E293B]">SKU Pipeline</h3>
            <p className="text-[12px] text-[#64748B]">Product lifecycle from concept to revenue</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              {['All', 'Iron Bound Safety', 'Arctic Trax', 'Scan Sling'].map(b => (
                <button key={b} onClick={() => setBrandFilter(b)} className={`px-2 py-1 text-[10px] font-semibold rounded-full transition-all ${brandFilter === b ? 'bg-[#3B82F6] text-white' : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'}`}>{b === 'Iron Bound Safety' ? 'IBS' : b === 'Arctic Trax' ? 'AT' : b === 'Scan Sling' ? 'SS' : b}</button>
              ))}
            </div>
            <button className="px-3 py-1.5 bg-[#3B82F6] text-white text-[11px] font-bold rounded-lg hover:bg-blue-600 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add SKU</button>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ minHeight: 380 }}>
          {skuPipelineColumns.map(col => {
            const filtered = brandFilter === 'All' ? col.cards : col.cards.filter(c => c.brand.includes(brandFilter) || (brandFilter === 'Iron Bound Safety' && c.brand === 'Iron Bound Safety') || (brandFilter === 'Arctic Trax' && c.brand === 'Arctic Trax') || (brandFilter === 'Scan Sling' && c.brand === 'Scan Sling'));
            return (
              <div key={col.id} className="min-w-[210px] flex-1 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]" style={{ borderTop: `4px solid ${col.color}` }}>
                <div className="p-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#1E293B]">{col.title}</span>
                    <span className="text-[10px] font-bold text-[#64748B] bg-white px-1.5 py-0.5 rounded-full border border-[#E2E8F0]">{filtered.length}</span>
                  </div>
                  {col.id === 'approval' && <span className="text-[10px] font-bold text-[#EF4444]">3 over 14 days</span>}
                </div>
                <div className="p-2 space-y-2 max-h-[340px] overflow-y-auto">
                  {filtered.map((card, ci) => (
                    <div key={`${card.sku}-${ci}`} className="bg-white rounded-lg p-3 border border-[#E2E8F0] cursor-pointer hover:shadow-md transition-shadow" style={{ borderLeft: `3px solid ${card.brandColor}` }}>
                      <p className="text-[11px] font-semibold text-[#1E293B] leading-tight mb-1">{card.name}</p>
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-[#64748B]">{card.sku}</span>
                        <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-full text-white" style={{ backgroundColor: card.brandColor }}>{card.brand === 'Iron Bound Safety' ? 'IBS' : card.brand === 'Arctic Trax' ? 'AT' : card.brand === 'Scan Sling' ? 'SS' : card.brand === 'New Brand TBD' ? 'TBD' : card.brand}</span>
                        {card.status && <span className="px-1.5 py-0.5 text-[8px] font-bold rounded text-white" style={{ backgroundColor: card.statusColor }}>{card.status}</span>}
                        {card.days !== undefined && daysBadge(card.days)}
                      </div>
                      <p className="text-[10px] text-[#64748B] leading-snug">{card.note}</p>
                      {card.extra && <p className="text-[10px] text-[#3B82F6] font-semibold mt-1">{card.extra}</p>}
                      <p className="text-[9px] text-[#94A3B8] mt-1">{card.owner} | {card.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Active SKUs column */}
          <div className="min-w-[210px] flex-1 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]" style={{ borderTop: '4px solid #10B981' }}>
            <div className="p-3 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#1E293B]">Active SKUs</span>
                <span className="text-[10px] font-bold text-white bg-[#10B981] px-1.5 py-0.5 rounded-full">15</span>
              </div>
            </div>
            <div className="p-2 space-y-1 max-h-[340px] overflow-y-auto">
              {activeSkus.map(s => (
                <div key={s.sku} className="flex items-center justify-between px-2 py-1.5 bg-white rounded border border-[#E2E8F0] hover:bg-slate-50 cursor-pointer">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#1E293B] truncate">{s.sku} — {s.name}</p>
                    <p className="text-[9px] text-[#64748B]">Rev: {s.rev} | {s.units} units</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0 ml-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 3 — Deployments + Inventory (55/45) */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-6 bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1E293B]">Active Deployments</h3>
              <p className="text-[12px] text-[#64748B]">All current Amazon PO shipments</p>
            </div>
            <div className="flex gap-1">
              {(['In Progress', 'Upcoming', 'Completed'] as const).map(t => (
                <button key={t} onClick={() => setDeployTab(t)} className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${deployTab === t ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead><tr className="bg-slate-50 border-b border-[#E2E8F0]">
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">PO #</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">Product</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">Units</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">DCs</th>
                <th className="text-right px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">Value</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">Status</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">ETA</th>
              </tr></thead>
              <tbody>
                {deployments.map(d => (
                  <tr key={d.po} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                    <td className="px-2 py-2.5 font-semibold text-[#3B82F6] whitespace-nowrap">{d.po}</td>
                    <td className="px-2 py-2.5 text-[#1E293B] whitespace-nowrap">{d.product}</td>
                    <td className="px-2 py-2.5 text-center text-[#1E293B]">{d.units.toLocaleString()}</td>
                    <td className="px-2 py-2.5 text-center">
                      <div className="flex gap-0.5 justify-center">
                        {Array.from({ length: Math.min(d.dcs, 8) }).map((_, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i < d.shipped ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`} />
                        ))}
                        {d.dcs > 8 && <span className="text-[9px] text-[#64748B]">+{d.dcs - 8}</span>}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right font-semibold text-[#1E293B] whitespace-nowrap">{d.value}</td>
                    <td className="px-2 py-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap" style={{ backgroundColor: d.statusColor }}>{d.status}</span></td>
                    <td className="px-2 py-2.5 text-center text-[#64748B] whitespace-nowrap">{d.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-[11px] text-[#64748B] flex flex-wrap justify-between gap-2">
            <span>Total: $423,000</span>
            <span>DCs pending: 24</span>
            <span>Est: Apr 5 - May 15</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-5 bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-[16px] font-semibold text-[#1E293B]">Inventory Across Locations</h3>
              <p className="text-[12px] text-[#64748B]">Real-time stock levels</p>
            </div>
            <div className="flex gap-1">
              {['All', 'Warehouse', 'Turkana', 'Transit'].map(t => (
                <button key={t} onClick={() => setInvTab(t)} className={`px-2 py-1 text-[10px] font-semibold rounded-full ${invTab === t ? 'bg-[#1B2A4A] text-white' : 'bg-slate-100 text-[#64748B]'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-[11px]"><span className="text-[#64748B]">WH:</span> <span className="font-bold text-[#1E293B]">8,200 ($218K)</span></div>
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-[11px]"><span className="text-[#64748B]">Turkana:</span> <span className="font-bold text-[#1E293B]">18,400 ($485K)</span></div>
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-[11px]"><span className="text-[#64748B]">Transit:</span> <span className="font-bold text-[#1E293B]">5,800 ($139K)</span></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead><tr className="bg-slate-50 border-b border-[#E2E8F0]">
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">SKU</th>
                <th className="text-left px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">Location</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">Units</th>
                <th className="text-right px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">Value</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">DoS</th>
                <th className="text-center px-2 py-2 font-semibold text-[#64748B] text-[10px] uppercase whitespace-nowrap">Status</th>
              </tr></thead>
              <tbody>
                {inventoryData.filter(d => invTab === 'All' || d.location.toLowerCase().includes(invTab.toLowerCase())).map((d, i) => (
                  <tr key={`${d.sku}-${d.location}-${i}`} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                    <td className="px-2 py-2 whitespace-nowrap"><p className="font-medium text-[#1E293B]">{d.sku}</p><p className="text-[10px] text-[#64748B]">{d.product}</p></td>
                    <td className="px-2 py-2 text-[#64748B] whitespace-nowrap">{d.location}</td>
                    <td className="px-2 py-2 text-center text-[#1E293B]">{d.units.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right font-semibold text-[#1E293B] whitespace-nowrap">{d.value}</td>
                    <td className="px-2 py-2 text-center text-[#64748B]">{d.dos || '—'}</td>
                    <td className="px-2 py-2 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap" style={{ backgroundColor: `${d.reorderColor}20`, color: d.reorderColor }}>{d.reorder}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Row 4 — Brand Performance + Samples + IPF Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">Brand Revenue</h3>
          <p className="text-[12px] text-[#64748B] mb-4">MTD by brand</p>
          <div className="space-y-4">
            {[
              { name: 'Iron Bound Safety', rev: '$285,000', units: '12,400', skus: 8, pipeline: 4, customers: 'Amazon, Cintas', color: '#3B82F6', data: brandSparkIBS },
              { name: 'Arctic Trax', rev: '$108,000', units: '8,200', skus: 4, pipeline: 3, customers: 'Amazon', color: '#14B8A6', data: brandSparkAT },
              { name: 'Scan Sling', rev: '$55,000', units: '2,400', skus: 3, pipeline: 1, customers: 'Amazon, Amazon Business', color: '#7C3AED', data: brandSparkSS },
            ].map(b => (
              <div key={b.name} className="p-3 rounded-lg border border-[#E2E8F0]" style={{ borderLeft: `3px solid ${b.color}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-[#1E293B]">{b.name}</span>
                  <span className="text-[14px] font-bold text-[#1E293B]">{b.rev}</span>
                </div>
                <p className="text-[10px] text-[#64748B]">Units: {b.units} | SKUs: {b.skus} | Pipeline: {b.pipeline}</p>
                <p className="text-[10px] text-[#64748B]">{b.customers}</p>
                <ResponsiveContainer width="100%" height={30}>
                  <AreaChart data={b.data}>
                    <defs><linearGradient id={`grad-${b.name}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={b.color} stopOpacity={0.2} /><stop offset="100%" stopColor={b.color} stopOpacity={0} /></linearGradient></defs>
                    <Area type="monotone" dataKey="v" stroke={b.color} strokeWidth={1.5} fill={`url(#grad-${b.name})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-[11px] text-[#64748B] text-center">
            Total PPE Revenue MTD: $448,000 across 15 active SKUs
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 md:p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">Sample Status</h3>
          <p className="text-[12px] text-[#64748B] mb-4">All samples in progress</p>
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {sampleTracker.map(group => (
              <div key={group.group}>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">{group.group} ({group.items.length})</p>
                <div className="space-y-1.5">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 px-2.5 py-2 bg-[#F8FAFC] rounded-lg">
                      <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.statusColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#1E293B] truncate">{item.name}</p>
                        <p className="text-[10px] text-[#64748B]">{item.detail}</p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 whitespace-nowrap" style={{ backgroundColor: `${item.statusColor}20`, color: item.statusColor }}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-[11px] text-[#64748B] text-center">
            Avg Amazon approval: 18 days | Target: &lt;14 days
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-[#F0F7FF] rounded-lg border-l-[3px] border-l-[#3B82F6] border border-[#E2E8F0] p-4 md:p-6 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1E293B]">IPF / Amazon Financials</h3>
          <p className="text-[12px] text-[#64748B] mb-4">Billing & payment tracking</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8F0]"><p className="text-[10px] text-[#64748B]">Invoiced YTD</p><p className="text-[14px] font-bold text-[#1E293B]">$1.64M</p></div>
            <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8F0]"><p className="text-[10px] text-[#64748B]">Collected YTD</p><p className="text-[14px] font-bold text-[#1E293B]">$1.12M</p></div>
            <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8F0]"><p className="text-[10px] text-[#64748B]">Outstanding AR</p><p className="text-[14px] font-bold text-[#3B82F6]">$412,000</p></div>
            <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8F0]"><p className="text-[10px] text-[#64748B]">Avg Days to Pay</p><p className="text-[14px] font-bold text-[#F59E0B]">94 days</p></div>
          </div>
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#1E293B] mb-2">Next Expected Payments</p>
            <div className="space-y-1.5">
              {[
                { date: 'Apr 15', amount: '$210,000', inv: 'IPF-2026-018', highlight: true },
                { date: 'Apr 30', amount: '$85,000', inv: 'IPF-2026-019' },
                { date: 'May 12', amount: '$117,000', inv: 'IPF-2026-020' },
              ].map(p => (
                <div key={p.inv} className={`flex items-center justify-between px-3 py-2 rounded-lg ${p.highlight ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-[#E2E8F0]'}`}>
                  <div><p className="text-[11px] font-semibold text-[#1E293B]">{p.date}</p><p className="text-[10px] text-[#64748B]">{p.inv}</p></div>
                  <span className="text-[13px] font-bold text-[#1E293B]">{p.amount}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#1E293B] mb-2">Net 90 Cycle</p>
            {[
              { inv: 'IPF-2026-018', amount: '$210K', elapsed: 73, total: 90 },
              { inv: 'IPF-2026-019', amount: '$85K', elapsed: 42, total: 90 },
              { inv: 'IPF-2026-020', amount: '$117K', elapsed: 18, total: 90 },
            ].map(inv => (
              <div key={inv.inv} className="mb-2">
                <div className="flex justify-between text-[10px] text-[#64748B] mb-0.5"><span>{inv.inv} ({inv.amount})</span><span>{inv.elapsed}/{inv.total}d</span></div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${(inv.elapsed / inv.total) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8F0] text-[10px] text-[#64748B]">
            <div className="flex items-center gap-1 mb-0.5"><Info className="w-3 h-3 text-[#3B82F6]" /><span className="font-semibold text-[#1E293B]">Margin Note</span></div>
            IPF billing: Cost + 50% of gross profit. Reported margin on AS books is compressed. Actual economic margin is healthy.
          </div>
        </motion.div>
      </div>

      {/* Row 5 — Distribution Channel Status Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
          {channels.map(ch => (
            <div key={ch.name} className="px-4 py-3 sm:py-2 first:pl-0 last:pr-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[13px] font-semibold text-[#1E293B]">{ch.name}</h4>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.statusColor }} />
                <span className="text-[10px] font-bold" style={{ color: ch.statusColor }}>{ch.status}</span>
              </div>
              <p className="text-[11px] text-[#1E293B]">{ch.skus} SKUs | {ch.rev}{ch.deploys > 0 ? ` | ${ch.deploys} deployments` : ''}</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">{ch.note}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
