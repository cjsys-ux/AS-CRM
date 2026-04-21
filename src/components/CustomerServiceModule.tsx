import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { Headphones, Plus, AlertTriangle, Search, Mail, Phone, Paperclip, Flag, CheckCircle2, Clock, ChevronRight, Send, MessageSquare, ArrowRight, X, Shield, Info, BarChart3, Users, TrendingDown, ArrowUpRight, Zap, Filter, SortAsc, ExternalLink, FileText, Hash, Building2, User, Tag, Calendar, MapPin, Package, Truck, CreditCard, Eye, ChevronDown, RefreshCw, Target, Activity, MoreHorizontal, Link2, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

// ─── Types ───
interface Ticket {
  id: string;
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  type: string;
  client: string;
  clientLogo?: string;
  contact?: string;
  contactEmail?: string;
  contactPhone?: string;
  desc: string;
  fullDesc?: string;
  owner: string;
  ownerInitials?: string;
  age: string;
  status: string;
  category: 'Promo' | 'Amazon';
  lastActivity: string;
  created?: string;
  slaRemaining?: string;
  relatedOrder?: string;
  orderValue?: string;
  product?: string;
  vendor?: string;
  orderDate?: string;
  promisedDate?: string;
  tracking?: string;
  impact?: string;
  resolution?: string;
  resolutionStatus?: string;
  rootCause?: string;
  financialImpact?: { label: string; value: string }[];
  amazonInfo?: { dc: string; po: string; contact: string; ipfRef?: string; sku: string; units: number; impactLevel: string; riskNote?: string; protocol?: { step: string; status: 'done' | 'progress' | 'pending' }[] };
  timeline: { time: string; person: string; text: string; type: 'note' | 'status' | 'email' | 'call' | 'file' | 'approval' | 'escalation' }[];
  attachments?: { name: string; type: string }[];
}

// ─── Data ───
const SEED_TICKETS: Ticket[] = [
  {
    id: '#CS-1247', priority: 'Urgent', type: 'Misprint / Decoration Error', client: 'Coca-Cola FL', clientLogo: 'CC', contact: 'Maria Rodriguez, Marketing Manager', contactEmail: 'maria.rodriguez@cocacola.com', contactPhone: '(404) 555-0147',
    desc: 'Logo color mismatch on 500 polo shirts — client rejected delivery',
    fullDesc: 'Client received 500 polo shirts and reports the logo color is mismatched — the navy blue appears as a dark purple. Client has rejected the entire delivery. Photos attached. Need resolution plan ASAP — these are for a company event on April 5.',
    owner: 'Tina Hunter', ownerInitials: 'TH', age: '1d 4h', status: 'In Progress', category: 'Promo', lastActivity: '10:42 AM', created: 'Mar 29, 2026 at 2:15 PM', slaRemaining: '12h remaining',
    relatedOrder: '#ORD-2026-0847', orderValue: '$32,000', product: '500x Custom Polo Shirts — Gildan 64000, Navy, Embroidered Logo', vendor: 'SanMar (blank) + StitchDirect (embroidery)',
    orderDate: 'Mar 15, 2026', promisedDate: 'Apr 1, 2026', tracking: '1Z999AA10123456784',
    impact: 'Client event April 5 — 3 business days to resolve or client will be without merchandise for their event',
    resolution: 'Vendor (StitchDirect) is reprinting 500 units with corrected color profile. Rush production authorized. New ETA: April 4. UPS Next Day Air return label sent for original shipment. Patrick approved expedite cost ($1,200).',
    resolutionStatus: 'Awaiting reprint completion', rootCause: 'Vendor error',
    financialImpact: [{ label: 'Original order value', value: '$32,000' }, { label: 'Reprint cost', value: '$8,500' }, { label: 'Expedite shipping', value: '$1,200' }, { label: 'Credit/refund to client', value: '$0' }, { label: 'Net impact', value: '-$9,700' }],
    attachments: [{ name: 'misprint-photo-1.jpg', type: 'image' }, { name: 'misprint-photo-2.jpg', type: 'image' }, { name: 'misprint-photo-3.jpg', type: 'image' }, { name: 'client-email.pdf', type: 'pdf' }],
    timeline: [
      { time: 'Apr 1, 10:42 AM', person: 'Tina Hunter', text: 'Spoke with StitchDirect. They acknowledge the color mismatch was on their end — wrong Pantone profile loaded. Reprinting 500 units rush, ETA Apr 4. They are covering $3,000 of reprint cost.', type: 'note' },
      { time: 'Apr 1, 9:15 AM', person: 'System', text: 'Status changed: New → In Progress', type: 'status' },
      { time: 'Mar 31, 4:30 PM', person: 'Tina Hunter', text: 'Sent return label to Maria at Coca-Cola. She confirmed they\'ll have the wrong shipment ready for pickup tomorrow.', type: 'note' },
      { time: 'Mar 31, 2:00 PM', person: 'Patrick Lowenthal', text: 'Approved $1,200 expedite cost. Priority is getting correct product to client before April 5 event. Discuss vendor credit with StitchDirect.', type: 'approval' },
      { time: 'Mar 31, 11:00 AM', person: 'Tina Hunter', text: 'Maria — we\'ve identified the issue and are reprinting immediately. New delivery expected April 4 via overnight. We sincerely apologize for the error.', type: 'email' },
      { time: 'Mar 30, 3:15 PM', person: 'Tina Hunter', text: 'Received photos from client. Confirmed — the embroidery thread color is wrong. Navy should be PMS 289, was printed in PMS 2768 (purple tint). Contacting StitchDirect.', type: 'note' },
      { time: 'Mar 30, 2:15 PM', person: 'Liz', text: 'Ticket created from client email.', type: 'note' },
    ],
  },
  {
    id: '#CS-1245', priority: 'Urgent', type: 'DC Not Received', client: 'Amazon - DEN4', clientLogo: 'AZ', desc: 'Denver DC reports PO #4521 not received — shipped 3/15 via UPS',
    owner: 'Michael Roos', ownerInitials: 'MR', age: '3d', status: 'Investigating', category: 'Amazon', lastActivity: '10:15 AM', created: 'Mar 30, 2026', slaRemaining: 'SLA BREACHED',
    amazonInfo: { dc: 'DEN4 — Denver, CO', po: 'PO-4521', contact: 'Sarah Kim (denver-dc@amazon.com)', ipfRef: 'IPF-2026-PO-0847', sku: 'IBS-2240 — Iron Bound Safety Gloves', units: 500, impactLevel: 'High — Amazon DC complaint could affect relationship', riskNote: 'This DC has had 0 prior issues. Resolution within 48 hours recommended to maintain perfect track record.',
      protocol: [{ step: 'File UPS claim (if shipping issue)', status: 'done' }, { step: 'Contact Amazon DC with proof of delivery', status: 'progress' }, { step: 'Ship replacement if needed', status: 'pending' }, { step: 'Update IPF/Anshu if escalation needed', status: 'pending' }, { step: 'Document resolution for future reference', status: 'pending' }] },
    timeline: [
      { time: 'Apr 1, 10:15 AM', person: 'Michael', text: 'Escalated to UPS claims department. Awaiting investigation. Claim #UPS-2026-44521.', type: 'escalation' },
      { time: 'Mar 31, 3:00 PM', person: 'Michael', text: 'UPS tracking shows delivered to dock 3/18. Requesting POD signature from UPS.', type: 'note' },
      { time: 'Mar 30, 9:00 AM', person: 'System', text: 'Ticket created from Amazon DC notification.', type: 'note' },
    ],
  },
  {
    id: '#CS-1244', priority: 'Urgent', type: 'Lost Shipment', client: 'Fairmont Hotels', clientLogo: 'FH', desc: 'UPS shows delivered but client says not received — 200 tote bags',
    owner: 'Liz', ownerInitials: 'LZ', age: '2d', status: 'Escalated', category: 'Promo', lastActivity: 'Yesterday', created: 'Mar 30, 2026',
    timeline: [
      { time: 'Mar 31, 2:00 PM', person: 'Liz', text: 'Filed UPS claim. Preparing replacement shipment as backup plan.', type: 'note' },
      { time: 'Mar 30, 4:00 PM', person: 'Liz', text: 'Client confirms not received at front desk or mailroom. Checking with building management.', type: 'note' },
    ],
  },
  {
    id: '#CS-1248', priority: 'High', type: 'Vendor Out of Stock', client: 'Oscar Health', clientLogo: 'OH', desc: 'SanMar out of stock on Gildan 5000 in Navy XL — need alternative',
    owner: 'Liz', ownerInitials: 'LZ', age: '0d', status: 'New', category: 'Promo', lastActivity: '9:30 AM', created: 'Apr 1, 2026',
    timeline: [{ time: 'Apr 1, 9:30 AM', person: 'Liz', text: 'SanMar shows Gildan 5000 Navy XL backordered 3 weeks. Checking S&S Activewear and alphabroder.', type: 'note' }],
  },
  {
    id: '#CS-1246', priority: 'High', type: 'Short Shipment', client: 'Amazon - SBD1', clientLogo: 'AZ', desc: 'San Bernardino DC received 480 of 500 units — 20 short',
    owner: 'Michael Roos', ownerInitials: 'MR', age: '2d', status: 'In Progress', category: 'Amazon', lastActivity: 'Yesterday', created: 'Mar 30, 2026',
    amazonInfo: { dc: 'SBD1 — San Bernardino, CA', po: 'PO-4518', contact: 'Warehouse Team', sku: 'IBS-2240 — Iron Bound Safety Gloves', units: 20, impactLevel: 'Medium — short shipment, needs resolution within 48h' },
    timeline: [{ time: 'Mar 31, 11:00 AM', person: 'Michael', text: 'Confirmed count discrepancy with Turkana warehouse. Picking 20 replacement units, shipping via UPS Next Day.', type: 'note' }],
  },
  {
    id: '#CS-1243', priority: 'High', type: 'Production Delay', client: 'Securiti', clientLogo: 'SE', desc: 'Embroidery vendor behind schedule — 2 weeks late on 300 jackets',
    owner: 'Tina Hunter', ownerInitials: 'TH', age: '5d', status: 'Waiting on Vendor', category: 'Promo', lastActivity: '2 days ago', created: 'Mar 27, 2026',
    timeline: [{ time: 'Mar 28, 3:00 PM', person: 'Tina', text: 'Vendor (StitchCraft) says backlog due to machine down. New ETA pushed to Apr 10. Client notified.', type: 'note' }],
  },
  {
    id: '#CS-1249', priority: 'Normal', type: 'Wrong Address', client: 'U of Miami', clientLogo: 'UM', desc: 'Shipped to old campus address — need redirect or reship',
    owner: 'Unassigned', ownerInitials: '??', age: '0d', status: 'New', category: 'Promo', lastActivity: 'Just now', created: 'Apr 1, 2026',
    timeline: [{ time: 'Apr 1, 11:00 AM', person: 'System', text: 'Ticket auto-created from UPS shipping alert — address mismatch detected.', type: 'note' }],
  },
  {
    id: '#CS-1242', priority: 'Normal', type: 'Vendor Out of Stock', client: 'Clear Spring', clientLogo: 'CS', desc: 'Hit Promo discontinued item #P4320 — sourcing replacement',
    owner: 'Melody', ownerInitials: 'ML', age: '4d', status: 'Sourcing', category: 'Promo', lastActivity: 'Yesterday', created: 'Mar 28, 2026',
    timeline: [{ time: 'Mar 30, 10:00 AM', person: 'Melody', text: 'Found 3 viable alternatives from Hit Promo catalog. Sending comparison sheet to client.', type: 'note' }],
  },
  {
    id: '#CS-1241', priority: 'Normal', type: 'Shipping Delay', client: 'Pinnacle Live', clientLogo: 'PL', desc: 'Unishippers shows delay — ETA pushed 3 days due to weather',
    owner: 'Liz', ownerInitials: 'LZ', age: '3d', status: 'Monitoring', category: 'Promo', lastActivity: '2 days ago', created: 'Mar 29, 2026',
    timeline: [{ time: 'Mar 29, 2:00 PM', person: 'Liz', text: 'Carrier reports weather delay in midwest corridor. Updated ETA to Apr 4. Notified client.', type: 'note' }],
  },
];

const priorityConfig: Record<string, { color: string; bg: string; gradient: string; border: string }> = {
  Urgent: { color: 'text-red-600', bg: 'bg-red-500', gradient: 'from-red-500 to-red-600', border: 'border-red-400' },
  High: { color: 'text-amber-600', bg: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', border: 'border-amber-400' },
  Normal: { color: 'text-blue-600', bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400' },
  Low: { color: 'text-slate-500', bg: 'bg-slate-400', gradient: 'from-slate-400 to-slate-500', border: 'border-slate-300' },
};

const statusConfig: Record<string, { bg: string; text: string; dot: string; ringColor: string }> = {
  'New': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', ringColor: 'ring-blue-500' },
  'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ringColor: 'ring-amber-500' },
  'Investigating': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', ringColor: 'ring-purple-500' },
  'Escalated': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', ringColor: 'ring-red-500' },
  'Waiting on Vendor': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', ringColor: 'ring-orange-500' },
  'Sourcing': { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', ringColor: 'ring-teal-500' },
  'Monitoring': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', ringColor: 'ring-slate-400' },
  'Resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ringColor: 'ring-emerald-500' },
};
const getS = (s: string) => statusConfig[s] || statusConfig['Monitoring'];

const timelineConfig: Record<string, { icon: any; bg: string; iconBg: string; iconColor: string; label: string }> = {
  note: { icon: MessageSquare, bg: 'bg-white border-slate-200', iconBg: 'bg-slate-100', iconColor: 'text-slate-500', label: 'Note' },
  status: { icon: ArrowRight, bg: 'bg-blue-50/80 border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', label: 'Status Change' },
  email: { icon: Mail, bg: 'bg-emerald-50/80 border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', label: 'Email Sent' },
  call: { icon: Phone, bg: 'bg-violet-50/80 border-violet-200', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', label: 'Call Logged' },
  file: { icon: Paperclip, bg: 'bg-white border-slate-200', iconBg: 'bg-slate-100', iconColor: 'text-slate-500', label: 'File Attached' },
  approval: { icon: CheckCircle2, bg: 'bg-emerald-50/80 border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', label: 'Approval' },
  escalation: { icon: Flag, bg: 'bg-red-50/80 border-red-200', iconBg: 'bg-red-100', iconColor: 'text-red-600', label: 'Escalation' },
};

// Dashboard data
const trendData = [
  { week: 'W1', opened: 8, resolved: 5 }, { week: 'W2', opened: 6, resolved: 7 }, { week: 'W3', opened: 10, resolved: 8 },
  { week: 'W4', opened: 12, resolved: 9 }, { week: 'W5', opened: 7, resolved: 10 }, { week: 'W6', opened: 9, resolved: 11 },
  { week: 'W7', opened: 8, resolved: 10 }, { week: 'W8', opened: 6, resolved: 8 },
];
const categoryData = [
  { name: 'Vendor OOS', count: 3, color: '#10B981' }, { name: 'DC Not Received', count: 2, color: '#3B82F6' },
  { name: 'Shipping Delay', count: 2, color: '#F59E0B' }, { name: 'Short/Missing', count: 2, color: '#8B5CF6' },
  { name: 'Production Delay', count: 2, color: '#F97316' }, { name: 'Misprint/Error', count: 1, color: '#EF4444' },
];
const teamData = [
  { name: 'Michael Roos', initials: 'MR', open: 4, resolved7d: 6, avg: '2.1d', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Liz (PH)', initials: 'LP', open: 4, resolved7d: 5, avg: '2.8d', gradient: 'from-emerald-500 to-emerald-600' },
  { name: 'Tina Hunter', initials: 'TH', open: 3, resolved7d: 4, avg: '3.2d', gradient: 'from-amber-500 to-amber-600' },
  { name: 'Melody (PH)', initials: 'MP', open: 2, resolved7d: 3, avg: '1.9d', gradient: 'from-purple-500 to-purple-600' },
  { name: 'Truscott Miller', initials: 'TM', open: 1, resolved7d: 2, avg: '2.5d', gradient: 'from-slate-500 to-slate-600' },
];
const resolutionRates = [
  { type: 'Vendor OOS', resolved: 6, avgTime: '3.1 days', trend: 'improving' as const },
  { type: 'Shipping Delay', resolved: 5, avgTime: '1.8 days', trend: 'stable' as const },
  { type: 'Production Delay', resolved: 3, avgTime: '5.2 days', trend: 'worsening' as const },
  { type: 'Misprint/Error', resolved: 2, avgTime: '4.0 days', trend: 'stable' as const },
  { type: 'Amazon DC Issues', resolved: 4, avgTime: '2.8 days', trend: 'improving' as const },
];

// ─── Owner avatar gradient mapping ───
const ownerGradient = (initials: string) => {
  const map: Record<string, string> = { 'TH': 'from-rose-500 to-pink-600', 'MR': 'from-blue-500 to-indigo-600', 'LZ': 'from-emerald-500 to-teal-600', 'ML': 'from-violet-500 to-purple-600', 'TM': 'from-amber-500 to-orange-600', '??': 'from-slate-400 to-slate-500' };
  return map[initials] || 'from-slate-500 to-slate-600';
};
const clientGradient = (logo: string) => {
  const map: Record<string, string> = { 'CC': 'from-red-500 to-red-600', 'AZ': 'from-orange-400 to-amber-500', 'FH': 'from-blue-600 to-indigo-700', 'OH': 'from-emerald-500 to-green-600', 'SE': 'from-violet-500 to-purple-600', 'UM': 'from-orange-500 to-orange-600', 'CS': 'from-teal-500 to-cyan-600', 'PL': 'from-pink-500 to-rose-600' };
  return map[logo] || 'from-slate-500 to-slate-600';
};

// ─── Create Ticket Drawer ───
function CreateTicketDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [businessLine, setBusinessLine] = useState<'Promo' | 'Amazon'>('Promo');
  const [priority, setPriority] = useState('Normal');
  const [issueType, setIssueType] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [assignTo, setAssignTo] = useState('Unassigned');

  const promoTypes = ['Vendor Out of Stock', 'Shipping Delay', 'Production Delay', 'Misprint/Error', 'Wrong Item', 'Wrong Address', 'Damage in Transit', 'Client Complaint', 'Billing Issue', 'Other'];
  const amazonTypes = ['DC Not Received', 'Short Shipment', 'Wrong Item', 'Damaged', 'Late Delivery', 'Quality Complaint', 'Return/Replacement', 'Other'];
  const slaMap: Record<string, string> = { Urgent: '4 hours', High: '24 hours', Normal: '48 hours', Low: '72 hours' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed right-0 top-0 h-full w-full md:w-[560px] bg-white shadow-2xl z-[61] flex flex-col">
            <div className="bg-gradient-to-r from-[#F97066] to-rose-500 px-6 md:px-8 py-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.05, rotate: 360 }} transition={{ duration: 0.6 }} className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Create Ticket</h2>
                    <p className="text-rose-100 text-sm">Log a new customer service issue</p>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm">
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Line</label>
                <div className="flex gap-2">
                  {(['Promo', 'Amazon'] as const).map(bl => (
                    <motion.button key={bl} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setBusinessLine(bl); setIssueType(''); }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${businessLine === bl
                        ? bl === 'Promo' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {bl === 'Promo' ? 'Promo' : 'Amazon / PPE'}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all">
                    <option>Urgent</option><option>High</option><option>Normal</option><option>Low</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">SLA: {slaMap[priority]}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Type</label>
                  <select value={issueType} onChange={e => setIssueType(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all">
                    <option value="">Select type...</option>
                    {(businessLine === 'Promo' ? promoTypes : amazonTypes).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Client</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} type="text" placeholder="Search client..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Related Order # <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} type="text" placeholder="ORD-2026-..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all" />
                </div>
              </div>
              {businessLine === 'Amazon' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-3">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Amazon-Specific Fields</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Amazon PO #</label><input type="text" placeholder="PO-XXXX" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Amazon DC</label><select className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white"><option value="">Select DC...</option><option>DEN4 — Denver</option><option>SBD1 — San Bernardino</option><option>ONT6 — Ontario</option><option>MDW2 — Chicago</option><option>BNA3 — Nashville</option></select></div>
                  </div>
                </motion.div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} type="text" placeholder="Brief description" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the issue in detail..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Attachments</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-rose-300 transition-colors cursor-pointer group">
                  <Paperclip className="w-6 h-6 text-slate-300 group-hover:text-rose-400 mx-auto mb-2 transition-colors" />
                  <p className="text-sm text-slate-500">Drag & drop or click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">Photos, PDFs, emails — max 10MB each</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assign To</label>
                <select value={assignTo} onChange={e => setAssignTo(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all">
                  <option>Unassigned</option><option>Michael Roos</option><option>Liz</option><option>Tina Hunter</option><option>Melody</option><option>Truscott Miller</option>
                </select>
              </div>
            </div>
            <div className="border-t border-slate-200 px-6 md:px-8 py-4 bg-slate-50">
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors">Cancel</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="flex-[2] py-2.5 bg-gradient-to-r from-[#F97066] to-rose-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl transition-all">Create Ticket</motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───
export function CustomerServiceModule() {
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('#CS-1247');
  const [activeTab, setActiveTab] = useState<string>('All Tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [isDashboardView, setIsDashboardView] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [sortBy, setSortBy] = useState('Priority');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/tickets/list');
        if (!res.ok) return;
        const data = await res.json();
        const list: Ticket[] = Array.isArray(data) ? data : (data.tickets || []);
        if (!cancelled && list.length > 0) setTickets(list);
      } catch {
        // fall back to SEED_TICKETS
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const createTicket = async (draft: Partial<Ticket>): Promise<Ticket | null> => {
    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const saved: Ticket = data.ticket ?? null;
      if (saved) setTickets(prev => [saved, ...prev]);
      return saved;
    } catch {
      return null;
    }
  };

  const updateTicket = async (id: string, patch: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
    try {
      await fetch('/api/tickets/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
    } catch {
      // optimistic update already applied
    }
  };

  const deleteTicket = async (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    if (selectedTicketId === id) setSelectedTicketId(null);
    try {
      await fetch('/api/tickets/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // optimistic delete already applied
    }
  };

  // Keep these as no-unused references for future wiring
  void createTicket; void updateTicket; void deleteTicket;

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;
  const filteredTickets = tickets.filter(t => {
    if (searchQuery && !t.client.toLowerCase().includes(searchQuery.toLowerCase()) && !t.id.toLowerCase().includes(searchQuery.toLowerCase()) && !t.desc.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeTab === 'Unassigned') return t.owner === 'Unassigned';
    if (activeTab === 'Amazon Issues') return t.category === 'Amazon';
    if (activeTab === 'Promo Issues') return t.category === 'Promo';
    return true;
  });
  const urgentCount = tickets.filter(t => t.priority === 'Urgent').length;
  const unassignedCount = tickets.filter(t => t.owner === 'Unassigned').length;

  useEffect(() => { if (detailRef.current) detailRef.current.scrollTop = 0; }, [selectedTicketId]);

  // ─── Dashboard View ───
  if (isDashboardView) {
    return (
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">CS Dashboard</h2>
              <p className="text-slate-500 text-sm">Team performance & ticket analytics</p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsDashboardView(false)} className="px-5 py-2.5 bg-gradient-to-r from-[#F97066] to-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-500/20 hover:shadow-xl transition-all flex items-center gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Queue
            </motion.button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'OPEN TICKETS', value: '14', sub: 'Promo: 9 | Amazon: 5', icon: Mail, bgColor: 'from-rose-500 to-rose-600' },
              { label: 'URGENT ISSUES', value: '3', sub: '1 Amazon DC | 1 misprint | 1 lost', icon: AlertTriangle, bgColor: 'from-red-500 to-red-600', pulse: true },
              { label: 'AVG RESOLUTION', value: '2.4d', sub: 'Improved from 3.1 days', icon: Clock, bgColor: 'from-emerald-500 to-emerald-600' },
              { label: 'RESOLVED (7D)', value: '8', sub: '8 of 12 target (67%)', icon: CheckCircle2, bgColor: 'from-emerald-500 to-emerald-600' },
              { label: 'SLA COMPLIANCE', value: '87%', sub: 'Target: 95% — 2 breached', icon: Shield, bgColor: 'from-amber-500 to-amber-600' },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] md:text-[24px] font-bold text-slate-900">{kpi.value}</h3>
                      {kpi.pulse && <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{kpi.sub}</p>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${kpi.bgColor} rounded-xl flex items-center justify-center shrink-0 shadow-md`}><kpi.icon className="w-4 h-4 text-white" /></div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="text-sm font-bold text-slate-900">Ticket Volume Trend</h3><p className="text-xs text-slate-500">Last 8 weeks — opened vs resolved</p></div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full border border-emerald-200">↓ Trending positive</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="csResG3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="csOpnG3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F97066" stopOpacity={0.15} /><stop offset="95%" stopColor="#F97066" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 10 }} /><YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2.5} fill="url(#csResG3)" dot={{ fill: '#10B981', r: 3 }} name="Resolved" />
                  <Area type="monotone" dataKey="opened" stroke="#F97066" strokeWidth={2.5} fill="url(#csOpnG3)" dot={{ fill: '#F97066', r: 3 }} name="Opened" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Issues by Category</h3>
              <p className="text-xs text-slate-500 mb-4">Current open tickets</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={110} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>{categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Team Workload</h3>
              <div className="space-y-3">
                {teamData.map(m => (
                  <div key={m.name} className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${m.gradient} rounded-full flex items-center justify-center shrink-0 shadow-md`}><span className="text-[10px] font-bold text-white">{m.initials}</span></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-[12px] mb-1"><span className="font-medium text-slate-900 truncate">{m.name}</span><span className="text-slate-500 shrink-0">Open: <span className="font-bold text-slate-700">{m.open}</span> · Resolved: {m.resolved7d} · Avg: {m.avg}</span></div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${m.open >= 4 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(m.open / 6) * 100}%` }} /></div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2.5 bg-red-50 rounded-xl border border-red-200 mt-2">
                  <span className="text-[12px] font-bold text-red-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {unassignedCount} unassigned ticket{unassignedCount !== 1 ? 's' : ''}</span>
                  <button className="px-3 py-1 bg-red-500 text-white text-[11px] font-bold rounded-lg hover:bg-red-600 transition-colors shadow-sm">Assign Now</button>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Resolution Rates by Type</h3>
              <p className="text-xs text-slate-500 mb-4">Last 30 days</p>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-[12px]">
                  <thead><tr className="bg-slate-50"><th className="text-left px-3 py-2.5 font-semibold text-slate-500 text-[10px] uppercase">Type</th><th className="text-center px-2 py-2.5 font-semibold text-slate-500 text-[10px] uppercase">Resolved</th><th className="text-center px-2 py-2.5 font-semibold text-slate-500 text-[10px] uppercase">Avg Time</th><th className="text-center px-2 py-2.5 font-semibold text-slate-500 text-[10px] uppercase">Trend</th></tr></thead>
                  <tbody>{resolutionRates.map(r => (
                    <tr key={r.type} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-medium text-slate-900">{r.type}</td>
                      <td className="px-2 py-2.5 text-center font-semibold text-slate-900">{r.resolved}</td>
                      <td className="px-2 py-2.5 text-center text-slate-500">{r.avgTime}</td>
                      <td className="px-2 py-2.5 text-center">
                        {r.trend === 'improving' && <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold"><ArrowDownRight className="w-3 h-3" />improving</span>}
                        {r.trend === 'stable' && <span className="text-slate-400 font-semibold">→ stable</span>}
                        {r.trend === 'worsening' && <span className="inline-flex items-center gap-0.5 text-red-500 font-semibold"><ArrowUpRight className="w-3 h-3" />worsening</span>}
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Queue View ───
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F97066] to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Customer Service</h2>
                <p className="text-slate-500 text-sm">Manage and resolve customer issues</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 flex-wrap">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreateDrawer(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#F97066] to-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 transition-all flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Ticket
            </motion.button>
            {unassignedCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-2.5 py-1.5 bg-red-50 text-red-600 text-[11px] font-bold rounded-full border border-red-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />{unassignedCount} unassigned
              </motion.span>
            )}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsDashboardView(true)} className="px-3.5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" /> Dashboard
            </motion.button>
          </motion.div>
        </div>
        {/* Quick Stats + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {['All Tickets', 'My Tickets', 'Unassigned', 'Amazon Issues', 'Promo Issues'].map(tab => (
              <motion.button key={tab} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-lg whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#1B2A4A] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}>
                {tab}
                {tab === 'Unassigned' && unassignedCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full">{unassignedCount}</span>}
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{urgentCount} urgent</span>
            <span className="w-px h-3 bg-slate-200" />
            <span>{tickets.length} total</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Ticket List */}
        <div className={`${selectedTicket ? 'hidden md:flex md:w-[380px] lg:w-[420px]' : 'flex-1 max-w-[700px]'} border-r border-slate-200 bg-white flex flex-col shrink-0`}>
          {/* Search + Sort */}
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} type="text" placeholder="Search tickets, clients, issues..." className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}</span>
              <div className="relative">
                <button onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 font-medium">
                  <SortAsc className="w-3 h-3" /> Sort: {sortBy} <ChevronDown className="w-3 h-3" />
                </button>
                {showSortMenu && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-6 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 min-w-[140px]">
                    {['Priority', 'Age', 'Last Activity', 'Client'].map(s => (
                      <button key={s} onClick={() => { setSortBy(s); setShowSortMenu(false); }} className={`block w-full text-left px-3 py-1.5 text-[12px] hover:bg-slate-50 ${sortBy === s ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-600'}`}>{s}</button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket cards */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredTickets.map((t, i) => {
                const pc = priorityConfig[t.priority];
                const sc = getS(t.status);
                const isSelected = selectedTicketId === t.id;
                const isUnassigned = t.owner === 'Unassigned';
                return (
                  <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} onClick={() => setSelectedTicketId(t.id)}
                    className={`relative px-4 py-4 border-b border-slate-100 cursor-pointer transition-all group ${isSelected ? 'bg-blue-50/60' : isUnassigned ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-slate-50/70'}`}>
                    {/* Priority bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full transition-all ${isSelected ? 'bg-blue-500' : pc.bg}`} />

                    <div className="flex gap-3">
                      {/* Client avatar */}
                      <div className={`w-10 h-10 bg-gradient-to-br ${clientGradient(t.clientLogo || '')} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-[11px] font-bold text-white">{t.clientLogo || '?'}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Row 1: ID + Client + Age */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[11px] font-bold text-blue-600">{t.id}</span>
                          <span className="text-[13px] font-semibold text-slate-900 truncate">{t.client}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-auto font-medium">{t.age}</span>
                        </div>

                        {/* Row 2: Type + desc */}
                        <p className="text-[11px] text-slate-500 truncate mb-2">{t.type} — {t.desc}</p>

                        {/* Row 3: Status + Owner + Category + Last Activity */}
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{t.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className={`w-4 h-4 bg-gradient-to-br ${ownerGradient(t.ownerInitials || '??')} rounded-full flex items-center justify-center`}>
                              <span className="text-[7px] font-bold text-white">{t.ownerInitials || '??'}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{t.owner.split(' ')[0]}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${t.category === 'Amazon' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{t.category}</span>
                          <span className="text-[9px] text-slate-400 ml-auto">{t.lastActivity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Urgent pulse indicator */}
                    {t.priority === 'Urgent' && !isSelected && (
                      <div className="absolute top-2 right-3">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Ticket Detail */}
        {selectedTicket ? (
          <motion.div key={selectedTicket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-slate-50/80 to-white">
            {/* Detail Header — richer with colored accent */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
              {/* Color accent bar based on priority */}
              <div className={`h-1 w-full bg-gradient-to-r ${priorityConfig[selectedTicket.priority].gradient}`} />
              <div className="px-4 md:px-6 py-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <button onClick={() => setSelectedTicketId(null)} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors mt-0.5"><ChevronRight className="w-4 h-4 rotate-180 text-slate-500" /></button>
                    <div className={`w-11 h-11 bg-gradient-to-br ${clientGradient(selectedTicket.clientLogo || '')} rounded-xl flex items-center justify-center shadow-md shrink-0`}>
                      <span className="text-sm font-bold text-white">{selectedTicket.clientLogo || '?'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-[16px] md:text-[18px] font-bold text-slate-900">{selectedTicket.id}</h3>
                        <span className="text-[14px] font-semibold text-slate-700">·</span>
                        <span className="text-[14px] font-semibold text-slate-700">{selectedTicket.client}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${getS(selectedTicket.status).bg} ${getS(selectedTicket.status).text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getS(selectedTicket.status).dot}`} />{selectedTicket.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${priorityConfig[selectedTicket.priority].bg}`}>{selectedTicket.priority}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedTicket.category === 'Amazon' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{selectedTicket.category}</span>
                        {selectedTicket.slaRemaining && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5 ${selectedTicket.slaRemaining.includes('BREACHED') ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                            <Clock className="w-3 h-3" />{selectedTicket.slaRemaining}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`w-6 h-6 bg-gradient-to-br ${ownerGradient(selectedTicket.ownerInitials || '??')} rounded-full flex items-center justify-center shadow-sm`}>
                          <span className="text-[8px] font-bold text-white">{selectedTicket.ownerInitials || '??'}</span>
                        </div>
                        <span className="text-[12px] font-semibold text-slate-700">{selectedTicket.owner}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Age: {selectedTicket.age} · Created: {selectedTicket.created?.split(' at')[0]}</p>
                    </div>
                    <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Body */}
            <div ref={detailRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
              {/* Client & Order Info */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Client & Order Information</h4>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                    <div className="flex items-start gap-3"><User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Client</span><span className="font-semibold text-slate-900">{selectedTicket.client}</span></div></div>
                    {selectedTicket.contact && <div className="flex items-start gap-3"><Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Contact</span><span className="text-slate-700">{selectedTicket.contact}</span>{selectedTicket.contactEmail && <p className="text-[11px] text-blue-600">{selectedTicket.contactEmail}</p>}</div></div>}
                    {selectedTicket.relatedOrder && <div className="flex items-start gap-3"><FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Order</span><span className="font-semibold text-blue-600 hover:underline cursor-pointer">{selectedTicket.relatedOrder}</span>{selectedTicket.orderValue && <span className="text-slate-500 ml-1">({selectedTicket.orderValue})</span>}</div></div>}
                    {selectedTicket.vendor && <div className="flex items-start gap-3"><Package className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Vendor</span><span className="text-slate-700">{selectedTicket.vendor}</span></div></div>}
                    {selectedTicket.product && <div className="sm:col-span-2 flex items-start gap-3"><Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Product</span><span className="text-slate-700">{selectedTicket.product}</span></div></div>}
                    {selectedTicket.tracking && <div className="flex items-start gap-3"><Truck className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Tracking</span><span className="text-blue-600 font-mono text-[11px] hover:underline cursor-pointer">{selectedTicket.tracking}</span></div></div>}
                  </div>
                </div>
              </motion.div>

              {/* Amazon Info */}
              {selectedTicket.amazonInfo && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
                  <div className="bg-blue-50 px-5 py-2.5 border-b border-blue-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <h4 className="text-[12px] font-bold text-blue-700 uppercase tracking-wider">Amazon DC Information</h4>
                  </div>
                  <div className="p-5 bg-blue-50/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px] mb-4">
                      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Distribution Center</span><span className="font-semibold text-slate-900">{selectedTicket.amazonInfo.dc}</span></div>
                      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Amazon PO</span><span className="font-semibold text-slate-900">{selectedTicket.amazonInfo.po}</span></div>
                      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Contact</span><span className="text-slate-700">{selectedTicket.amazonInfo.contact}</span></div>
                      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">SKU</span><span className="text-slate-700">{selectedTicket.amazonInfo.sku}</span></div>
                      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Units Affected</span><span className="font-bold text-slate-900">{selectedTicket.amazonInfo.units}</span></div>
                      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Impact Level</span><span className="font-semibold text-red-600">{selectedTicket.amazonInfo.impactLevel}</span></div>
                    </div>
                    {selectedTicket.amazonInfo.protocol && (
                      <div className="bg-white rounded-xl p-4 border border-blue-200 mb-3">
                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-3">Amazon Resolution Protocol</p>
                        <div className="space-y-2">
                          {selectedTicket.amazonInfo.protocol.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 text-[12px]">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s.status === 'done' ? 'bg-emerald-100' : s.status === 'progress' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                {s.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                {s.status === 'progress' && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />}
                                {s.status === 'pending' && <Clock className="w-3.5 h-3.5 text-slate-300" />}
                              </div>
                              <span className={`flex-1 ${s.status === 'done' ? 'text-slate-400 line-through' : s.status === 'progress' ? 'text-blue-700 font-semibold' : 'text-slate-400'}`}>
                                Step {i + 1}: {s.step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedTicket.amazonInfo.riskNote && (
                      <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                        <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700">{selectedTicket.amazonInfo.riskNote}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Issue */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Issue Description</h4>
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-900">{selectedTicket.type}</span>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{selectedTicket.fullDesc || selectedTicket.desc}</p>
                  {selectedTicket.impact && (
                    <div className="mt-4 px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div><p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-0.5">Impact</p><p className="text-[12px] text-red-700">{selectedTicket.impact}</p></div>
                    </div>
                  )}
                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Attachments ({selectedTicket.attachments.length})</p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedTicket.attachments.map((a, i) => (
                          <motion.div key={i} whileHover={{ scale: 1.03, y: -1 }} className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition-all shadow-sm">
                            {a.type === 'image' ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <FileText className="w-3.5 h-3.5 text-slate-400" />}
                            <span className="font-medium">{a.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Resolution */}
              {selectedTicket.resolution && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-emerald-50 px-5 py-2.5 border-b border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-[12px] font-bold text-emerald-700 uppercase tracking-wider">Resolution Plan</h4>
                    {selectedTicket.resolutionStatus && <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">{selectedTicket.resolutionStatus}</span>}
                  </div>
                  <div className="p-5">
                    {selectedTicket.rootCause && (
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Root Cause:</span>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-lg text-[11px] font-semibold">{selectedTicket.rootCause}</span>
                      </div>
                    )}
                    <p className="text-[13px] text-slate-600 leading-relaxed mb-4">{selectedTicket.resolution}</p>
                    {selectedTicket.financialImpact && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-slate-400" /> Financial Impact</p>
                        <div className="space-y-0">
                          {selectedTicket.financialImpact.map((fi, i) => (
                            <div key={fi.label} className={`flex justify-between text-[12px] py-2 ${i < selectedTicket.financialImpact!.length - 1 ? 'border-b border-slate-200' : 'pt-2 border-t-2 border-slate-300'}`}>
                              <span className={`${i === selectedTicket.financialImpact!.length - 1 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>{fi.label}</span>
                              <span className={`font-semibold ${fi.value.startsWith('-') ? 'text-red-600' : i === selectedTicket.financialImpact!.length - 1 ? 'text-red-600 font-bold' : 'text-slate-900'}`}>{fi.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Activity Timeline */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Activity Timeline</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">{selectedTicket.timeline.length} entries</span>
                </div>
                <div className="p-5">
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-200" />
                    <div className="space-y-4">
                      {selectedTicket.timeline.map((entry, i) => {
                        const cfg = timelineConfig[entry.type] || timelineConfig.note;
                        const Icon = cfg.icon;
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }} className="flex items-start gap-3 relative">
                            <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.iconBg} border-2 border-white shadow-sm`}>
                              <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                            </div>
                            <div className={`flex-1 p-3 rounded-xl border ${cfg.bg} hover:shadow-sm transition-shadow`}>
                              <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-semibold text-slate-900">{entry.person}</span>
                                  <span className="px-1.5 py-0.5 bg-white rounded text-[9px] font-semibold text-slate-400 border border-slate-200">{cfg.label}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">{entry.time}</span>
                              </div>
                              <p className="text-[12px] text-slate-600 leading-relaxed">{entry.text}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Bar */}
            <div className="bg-white border-t border-slate-200 px-4 md:px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input value={noteText} onChange={e => setNoteText(e.target.value)} type="text" placeholder="Add a note..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 pr-12 transition-all" />
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all"><Send className="w-3.5 h-3.5" /></motion.button>
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { icon: Mail, label: 'Email', color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' },
                    { icon: Phone, label: 'Call', color: 'hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200' },
                    { icon: Paperclip, label: 'Attach', color: 'hover:bg-slate-100 hover:text-slate-600' },
                    { icon: Link2, label: 'Link', color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' },
                  ].map(action => (
                    <motion.button key={action.label} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} title={action.label}
                      className={`p-2.5 bg-white text-slate-400 rounded-xl border border-slate-200 transition-all ${action.color}`}>
                      <action.icon className="w-4 h-4" />
                    </motion.button>
                  ))}
                </div>
                <div className="hidden sm:flex items-center gap-1.5 ml-1">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-3.5 py-2.5 bg-red-50 text-red-600 text-[12px] font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1.5 border border-red-200"><Flag className="w-3.5 h-3.5" /> Escalate</motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-3.5 py-2.5 bg-emerald-50 text-emerald-600 text-[12px] font-semibold rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Resolve</motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50/80 to-white">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Headphones className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 font-semibold">Select a ticket to view details</p>
              <p className="text-xs text-slate-400 mt-1">{filteredTickets.length} tickets in queue</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                {urgentCount > 0 && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-full border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />{urgentCount} urgent</span>}
                {unassignedCount > 0 && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-full border border-amber-200">{unassignedCount} unassigned</span>}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <CreateTicketDrawer isOpen={showCreateDrawer} onClose={() => setShowCreateDrawer(false)} />
    </div>
  );
}
