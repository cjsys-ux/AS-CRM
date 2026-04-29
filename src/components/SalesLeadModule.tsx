import { motion, AnimatePresence } from 'motion/react';
import {
  Target, Plus, Search, X, ChevronDown, RefreshCw, GripVertical, DollarSign,
  Calendar, User, Clock, ArrowRight, MoreHorizontal, Edit, Trash2, Phone, Mail,
  TrendingUp, Zap, MessageSquare, FileText, Building2,
  BarChart3, AlertTriangle, CheckCircle2, Sparkles, XCircle, ChevronUp, Loader2, Upload, Paperclip,
  List, LayoutGrid, Code
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef, DragEvent } from 'react';
import { toast } from 'sonner';
import { SalesLeadDetailView } from './SalesLeadDetailView';
import { PhoneInput } from './PhoneInput';
import { LeadCaptureFormSnippet } from './LeadCaptureFormSnippet';

const headers_json = { 'Content-Type': 'application/json' };

const PIPELINE_STAGES = [
  { id: 'lead-received', label: 'Lead Received', color: '#3b82f6', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'ring-blue-500', weight: 0.10 },
  { id: 'qualified-buyer', label: 'Qualified Buyer', color: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', ring: 'ring-cyan-500', weight: 0.25 },
  { id: 'order-request', label: 'Order Request', color: '#f59e0b', gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: 'ring-amber-500', weight: 0.50 },
  { id: 'design-ready', label: 'Design Ready', color: '#8b5cf6', gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', ring: 'ring-violet-500', weight: 0.60 },
  { id: 'pending-payment', label: 'Pending Payment', color: '#10b981', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-500', weight: 0.90 },
  { id: 'closed-won', label: 'Closed Won', color: '#16a34a', gradient: 'from-green-600 to-green-700', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', ring: 'ring-green-500', weight: 1.0 },
  { id: 'closed-lost', label: 'Closed Lost', color: '#ef4444', gradient: 'from-red-500 to-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', ring: 'ring-red-500', weight: 0 },
];

const LEAD_SOURCES = ['Website', 'Referral', 'Trade Show', 'Cold Outreach', 'Social Media', 'Google Ads', 'Email Campaign', 'LinkedIn', 'Partner', 'Inbound Call', 'RFQ Portal'];
const PRODUCT_TYPES = ['Apparel', 'Drinkware', 'Bags', 'Tech', 'Office', 'Outdoor', 'Stickers', 'Hats', 'Pens', 'Custom'];

const SOURCE_CATEGORIES = [
  { value: 'organic', label: 'Organic' },
  { value: 'paid', label: 'Paid Ads' },
  { value: 'referral', label: 'Referral' },
  { value: 'direct', label: 'Direct' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' },
  { value: 'outbound', label: 'Outbound' },
] as const;

const DISQUALIFIED_REASONS = [
  { value: 'bad-fit', label: 'Bad Fit' },
  { value: 'budget', label: 'No Budget' },
  { value: 'timing', label: 'Bad Timing' },
  { value: 'competitor', label: 'Went with Competitor' },
  { value: 'no-response', label: 'No Response' },
  { value: 'spam', label: 'Spam / Invalid' },
  { value: 'duplicate', label: 'Duplicate' },
] as const;

interface ScoreBreakdown {
  source: number;
  email: number;
  phone: number;
  amount: number;
  existingCustomer: number;
  disposablePenalty: number;
  disqualifiedPenalty: number;
}

interface SalesLead {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  contactName: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail: string;
  contactPhone: string;
  amount: number;
  stage: string;
  source: string;
  sourceCategory?: string | null;
  sourceDetail?: string | null;
  productType: string;
  inHandsDate: string;
  createdAt: string;
  lastActivity: string;
  owner: string;
  ownerInitials: string;
  notes: string;
  probability: number;
  quantity: number;
  tags: string[];
  documents?: { name: string; size: number; type: string; dataUrl?: string }[];
  score?: number;
  scoreBreakdown?: ScoreBreakdown;
  scoreUpdatedAt?: string;
  disqualifiedReason?: string | null;
  emailType?: 'business' | 'personal' | 'disposable' | 'unknown' | null;
  isExistingCustomer?: boolean;
  enrichedCompany?: string | null;
  sourceOrderId?: string | null;
  sourceOrderNumber?: string | null;
  orderLinkedAt?: string | null;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contactName?: string;
  contact?: string;
  status?: string;
  contacts?: { id: string; firstName?: string; lastName?: string; name?: string; email?: string; phone?: string }[];
}

// ────── Custom Dropdown ──────
function CustomDropdown({ label, value, options, onChange, icon: Icon }: {
  label: string; value: string; options: { value: string; label: string; color?: string; icon?: any }[];
  onChange: (v: string) => void; icon?: any;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = options.find(o => o.value === value);

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative" ref={ref}>
        <button
          type="button" onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl text-sm text-slate-900 hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        >
          <div className="flex items-center gap-2">
            {selected?.color && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selected.color }} />}
            {Icon && !selected?.color && <Icon className="w-4 h-4 text-slate-400" />}
            <span>{selected?.label || value}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 max-h-56 overflow-y-auto"
            >
              <div className="py-1">
                {options.map(opt => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                      value === opt.value ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.color && <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />}
                    {opt.label}
                    {value === opt.value && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ────── Currency Formatter ──────
function formatCurrency(value: string): string {
  const num = value.replace(/[^0-9.]/g, '');
  const parts = num.split('.');
  const intPart = parts[0] || '';
  const decPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return formatted + decPart;
}

function parseCurrency(value: string): string {
  return value.replace(/,/g, '');
}

// ────── Score Badge ──────
function ScoreBadge({ score, breakdown, size = 'sm' }: { score?: number; breakdown?: ScoreBreakdown; size?: 'sm' | 'md' }) {
  if (typeof score !== 'number') return null;
  const tier = score >= 71 ? 'hot' : score >= 41 ? 'warm' : 'cold';
  const styles = tier === 'hot'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : tier === 'warm'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';
  const sizeCls = size === 'md' ? 'px-2 py-0.5 text-[11px]' : 'px-1.5 py-0.5 text-[10px]';
  const tooltip = breakdown
    ? `Source ${breakdown.source} · Email ${breakdown.email} · Phone ${breakdown.phone} · Amount ${breakdown.amount} · Existing ${breakdown.existingCustomer} · Disposable ${breakdown.disposablePenalty} · Disqualified ${breakdown.disqualifiedPenalty}`
    : `Lead score`;
  return (
    <span title={tooltip} className={`inline-flex items-center gap-1 rounded-md border font-bold ${sizeCls} ${styles}`}>
      <Sparkles className="w-2.5 h-2.5" />
      {score}
    </span>
  );
}

// ────── Dedup Warning Modal ──────
interface DedupMatch {
  leadId: string;
  matchScore: number;
  reason: 'email' | 'phone' | 'domain+name' | 'company+domain';
  preview: { title?: string; company?: string; contactEmail?: string; contactName?: string; stage?: string; owner?: string };
}

function DedupWarningModal({
  matches, onClose, onCreateAnyway, onOpenExisting, blocking,
}: {
  matches: DedupMatch[];
  onClose: () => void;
  onCreateAnyway: () => void;
  onOpenExisting: (leadId: string) => void;
  blocking: boolean;
}) {
  if (matches.length === 0) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold">{blocking ? 'Duplicate lead detected' : 'Possible duplicate'}</h3>
              <p className="text-[11px] text-white/85">{blocking ? 'A lead with this email already exists.' : 'We found leads that may match this contact.'}</p>
            </div>
          </div>
          <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
            {matches.map((m) => (
              <button key={m.leadId} type="button" onClick={() => onOpenExisting(m.leadId)} className="w-full text-left px-3 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-900 truncate">{m.preview.title || '(no title)'}</span>
                  <span className="ml-auto text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{m.matchScore}% · {m.reason}</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{m.preview.company} · {m.preview.contactName} · {m.preview.contactEmail}</div>
              </button>
            ))}
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
            <button onClick={onClose} className="flex-1 px-3 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-white transition-colors">Cancel</button>
            {!blocking && (
              <button onClick={onCreateAnyway} className="flex-1 px-3 py-2 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors">Create anyway</button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ────── Disqualify Modal ──────
function DisqualifyModal({ onConfirm, onClose }: { onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState<string>('');
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center gap-3">
            <XCircle className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold">Mark lead as Closed Lost</h3>
              <p className="text-[11px] text-white/85">Pick a reason so we can track why deals slip.</p>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {DISQUALIFIED_REASONS.map((r) => (
              <button key={r.value} type="button" onClick={() => setReason(r.value)} className={`w-full text-left px-3 py-2.5 border-2 rounded-xl text-sm transition-all ${reason === r.value ? 'border-red-400 bg-red-50 text-red-700 font-semibold' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                {r.label}
              </button>
            ))}
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
            <button onClick={onClose} className="flex-1 px-3 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-white transition-colors">Cancel</button>
            <button disabled={!reason} onClick={() => reason && onConfirm(reason)} className="flex-1 px-3 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Confirm</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ────── Closed Won Modal ──────
interface CloseWonOrderInput {
  customer: string;
  email: string;
  total: number;
  items: number;
  inHandsDate: string;
  productType: string;
  notes: string;
}

function CloseWonModal({
  lead, onClose, onCreateOrder, onSkip,
}: {
  lead: SalesLead;
  onClose: () => void;
  onCreateOrder: (input: CloseWonOrderInput) => Promise<void>;
  onSkip: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    customer: lead.company || '',
    email: lead.contactEmail || '',
    total: lead.amount ? String(lead.amount) : '',
    items: lead.quantity ? String(lead.quantity) : '1',
    inHandsDate: lead.inHandsDate || '',
    productType: lead.productType || '',
    notes: lead.notes || '',
  });
  const [submitting, setSubmitting] = useState<'create' | 'skip' | null>(null);

  const customerOk = form.customer.trim().length > 0;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const canCreate = customerOk && emailOk && !submitting;

  const handleCreate = async () => {
    if (!canCreate) return;
    setSubmitting('create');
    try {
      await onCreateOrder({
        customer: form.customer.trim(),
        email: form.email.trim(),
        total: Number(form.total) || 0,
        items: Number(form.items) || 1,
        inHandsDate: form.inHandsDate,
        productType: form.productType.trim(),
        notes: form.notes.trim(),
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleSkip = async () => {
    setSubmitting('skip');
    try {
      await onSkip();
    } finally {
      setSubmitting(null);
    }
  };

  const inputCls = "w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";
  const labelCls = "block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider";

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-tight">Won the deal — create an order?</h3>
              <p className="text-[11px] text-white/85 truncate">{lead.title}</p>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Customer *</label>
                <input value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} className={inputCls + (customerOk ? '' : ' border-red-300')} placeholder="Customer name" />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls + (emailOk ? '' : ' border-red-300')} placeholder="email@company.com" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Total ($)</label>
                <input value={form.total} onChange={e => setForm({ ...form, total: e.target.value.replace(/[^0-9.]/g, '') })} className={inputCls} placeholder="0.00" />
              </div>
              <div>
                <label className={labelCls}>Items</label>
                <input type="number" value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} className={inputCls} placeholder="1" />
              </div>
              <div>
                <label className={labelCls}>In-Hands</label>
                <input type="date" value={form.inHandsDate} onChange={e => setForm({ ...form, inHandsDate: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Product Type</label>
              <input value={form.productType} onChange={e => setForm({ ...form, productType: e.target.value })} className={inputCls} placeholder="e.g., Apparel" />
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls + " resize-none"} placeholder="Optional notes for the order…" />
            </div>

            {(!customerOk || !emailOk) && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Customer and a valid email are required to create an order.
              </p>
            )}
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row gap-2">
            <button
              onClick={onClose}
              disabled={submitting !== null}
              className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-md hover:bg-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSkip}
              disabled={submitting !== null}
              className="flex-1 sm:flex-initial px-3 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-white transition-colors disabled:opacity-50"
              title="Mark as won but don't create an order (e.g., invoice-only deal)"
            >
              {submitting === 'skip' ? 'Saving…' : 'Skip — won, no order'}
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="flex-1 sm:flex-initial px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-semibold rounded-md hover:shadow-md hover:shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {submitting === 'create' ? 'Creating…' : <><CheckCircle2 className="w-3.5 h-3.5" /> Create order</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ────── Create/Edit Lead Drawer ──────
function LeadDrawer({ isOpen, onClose, onSave, lead, onOpenExistingLead }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; lead?: SalesLead | null; onOpenExistingLead?: (leadId: string) => void }) {
  const [form, setForm] = useState({
    title: '', company: '', companyId: '', contactFirstName: '', contactLastName: '', contactEmail: '', contactPhone: '',
    amount: '', stage: 'lead-received', source: 'Website', sourceCategory: '', sourceDetail: '',
    productType: 'Apparel', inHandsDate: '', owner: '', notes: '', quantity: '',
    contactId: '', disqualifiedReason: '',
  });
  const [dedupMatches, setDedupMatches] = useState<DedupMatch[]>([]);
  const [showDedup, setShowDedup] = useState(false);
  const [dedupBlocking, setDedupBlocking] = useState(false);
  const [isExistingCompany, setIsExistingCompany] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [documents, setDocuments] = useState<{ name: string; size: number; type: string; dataUrl?: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name?: string; firstName?: string; lastName?: string; email?: string }[]>([]);
  const [showOwnerList, setShowOwnerList] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [selectedCustomerContacts, setSelectedCustomerContacts] = useState<any[]>([]);
  const [showContactList, setShowContactList] = useState(false);
  const custRef = useRef<HTMLDivElement>(null);
  const ownerRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const prospectRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProspectMatches, setShowProspectMatches] = useState(false);
  const [productCategories, setProductCategories] = useState<string[] | null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (custRef.current && !custRef.current.contains(e.target as Node)) setShowCustomerList(false);
      if (ownerRef.current && !ownerRef.current.contains(e.target as Node)) setShowOwnerList(false);
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) setShowContactList(false);
      if (prospectRef.current && !prospectRef.current.contains(e.target as Node)) setShowProspectMatches(false);
    };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (isOpen && users.length === 0) {
      fetch('/api/users/list', { headers: headers_json })
        .then(r => r.json())
        .then(data => { if (data.success) setUsers(data.users || []); })
        .catch(() => {});
    }
    if (isOpen && productCategories === null) {
      fetch('/api/settings/product-database/get', { headers: headers_json })
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.settings?.categories)) {
            setProductCategories(data.settings.categories);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (lead) {
      const nameParts = (lead.contactName || '').split(' ');
      setForm({
        title: lead.title, company: lead.company, companyId: lead.companyId || '',
        contactFirstName: lead.contactFirstName || nameParts[0] || '',
        contactLastName: lead.contactLastName || nameParts.slice(1).join(' ') || '',
        contactEmail: lead.contactEmail, contactPhone: lead.contactPhone,
        amount: lead.amount ? formatCurrency(String(lead.amount)) : '', stage: lead.stage, source: lead.source,
        sourceCategory: lead.sourceCategory || '', sourceDetail: lead.sourceDetail || '',
        productType: lead.productType,
        inHandsDate: lead.inHandsDate, owner: lead.owner, notes: lead.notes,
        quantity: String(lead.quantity || ''),
        contactId: '', disqualifiedReason: lead.disqualifiedReason || '',
      });
      setIsExistingCompany(!!lead.companyId);
      setDocuments(lead.documents || []);
    } else {
      setForm({ title: '', company: '', companyId: '', contactFirstName: '', contactLastName: '', contactEmail: '', contactPhone: '', amount: '', stage: 'lead-received', source: 'Website', sourceCategory: '', sourceDetail: '', productType: 'Apparel', inHandsDate: '', owner: '', notes: '', quantity: '', contactId: '', disqualifiedReason: '' });
      setIsExistingCompany(false);
      setDocuments([]);
    }
    setDedupMatches([]);
    setShowDedup(false);
    setDedupBlocking(false);
    setCustomerSearch('');
    setOwnerSearch('');
    setSelectedCustomerContacts([]);
  }, [lead, isOpen]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      const res = await fetch('/api/customers/list', { headers: headers_json });
      const data = await res.json();
      if (data.success) setCustomers(data.customers || []);
    } catch { }
    finally { setLoadingCustomers(false); }
  }, []);

  useEffect(() => { if (isOpen && customers.length === 0) fetchCustomers(); }, [isOpen]);

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.contactName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.contact?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectCustomer = (cust: Customer) => {
    const contacts = cust.contacts || [];
    setSelectedCustomerContacts(contacts);
    setForm({ ...form, company: cust.name, companyId: cust.id, contactFirstName: '', contactLastName: '', contactEmail: '', contactPhone: '', contactId: '' });
    setCustomerSearch(cust.name);
    setShowCustomerList(false);
    if (contacts.length > 0) setShowContactList(true);
  };

  const selectContact = (contact: any) => {
    const firstName = contact.firstName || (contact.name ? contact.name.split(' ')[0] : '');
    const lastName = contact.lastName || (contact.name ? contact.name.split(' ').slice(1).join(' ') : '');
    setForm({ ...form, contactFirstName: firstName, contactLastName: lastName, contactEmail: contact.email || '', contactPhone: contact.phone || '', contactId: contact.id || '' });
    setShowContactList(false);
  };

  const filteredUsers = users.filter(u => {
    const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return name.toLowerCase().includes(ownerSearch.toLowerCase());
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => { setDocuments(prev => [...prev, { name: file.name, size: file.size, type: file.type, dataUrl: reader.result as string }]); };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeDocument = (index: number) => { setDocuments(prev => prev.filter((_, i) => i !== index)); };

  const checkDedupOnEmailBlur = useCallback(async () => {
    if (lead) return; // editing existing — skip dedup
    if (!form.contactEmail || !form.contactEmail.includes('@')) return;
    try {
      const res = await fetch('/api/sales-leads/dedup-check', {
        method: 'POST',
        headers: headers_json,
        body: JSON.stringify({
          email: form.contactEmail,
          phone: form.contactPhone,
          company: form.company,
          contactName: `${form.contactFirstName} ${form.contactLastName}`.trim(),
        }),
      });
      const data = await res.json();
      const matches: DedupMatch[] = data.matches || [];
      const strong = matches.filter((m) => m.matchScore >= 70);
      if (strong.length > 0) {
        setDedupMatches(strong);
        setDedupBlocking(strong[0].matchScore >= 100);
        setShowDedup(true);
      }
    } catch { /* non-fatal */ }
  }, [form.contactEmail, form.contactPhone, form.company, form.contactFirstName, form.contactLastName, lead]);

  const submitForm = () => {
    if (!form.title.trim()) { toast.error('Deal title is required'); return; }
    if (!form.company.trim()) { toast.error('Company name is required'); return; }
    if (isExistingCompany && form.companyId && !form.contactFirstName && !form.contactLastName) {
      toast.error('Please select a contact for this customer. If no contacts exist, go to the customer record and add one first.');
      return;
    }
    if (form.stage === 'closed-lost' && !form.disqualifiedReason) {
      toast.error('Pick a reason — closed-lost leads need one.');
      return;
    }
    const contactName = `${form.contactFirstName} ${form.contactLastName}`.trim();
    const initials = form.owner ? form.owner.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AS';
    onSave({
      ...form, contactName, contactFirstName: form.contactFirstName, contactLastName: form.contactLastName,
      amount: parseFloat(parseCurrency(form.amount)) || 0, quantity: parseInt(form.quantity) || 0, ownerInitials: initials,
      probability: PIPELINE_STAGES.find(s => s.id === form.stage)?.weight ? (PIPELINE_STAGES.find(s => s.id === form.stage)!.weight * 100) : 10,
      tags: form.productType ? [form.productType] : [], documents, ...(lead ? { id: lead.id } : {}),
      sourceCategory: form.sourceCategory || null,
      sourceDetail: form.sourceDetail || null,
      disqualifiedReason: form.disqualifiedReason || null,
    });
  };

  const handleSubmit = submitForm;

  const inputCls = "w-full px-4 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-50" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/15 backdrop-blur rounded-lg flex items-center justify-center border border-white/20">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{lead ? 'Edit Deal' : 'Create Deal'}</h2>
                    <p className="text-[11px] text-white/70">Fill out the deal details below</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/15 rounded-lg transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Deal Info Section */}
              <div>
                <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-3.5 bg-indigo-500 rounded-full" /> Deal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Deal Title *</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Custom Shirts" className={inputCls} />
                  </div>

                  {/* Company: existing or new toggle */}
                  <div>
                    <label className={labelCls}>Company *</label>
                    <div className="flex gap-2 mb-2">
                      <button type="button" onClick={() => { setIsExistingCompany(false); setForm({ ...form, companyId: '', contactId: '' }); setSelectedCustomerContacts([]); }}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${!isExistingCompany ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        <Plus className="w-3 h-3 inline mr-1" /> New Prospect
                      </button>
                      <button type="button" onClick={() => setIsExistingCompany(true)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${isExistingCompany ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        <Building2 className="w-3 h-3 inline mr-1" /> Existing Customer
                      </button>
                    </div>

                    {isExistingCompany ? (
                      <div className="relative" ref={custRef}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowCustomerList(true); }} onFocus={() => setShowCustomerList(true)} placeholder="Search existing customers..." className={inputCls + " pl-10"} />
                          {loadingCustomers && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
                        </div>
                        {form.companyId && (
                          <div className="mt-1.5 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-xs font-semibold text-indigo-700">{form.company}</span>
                            <button onClick={() => { setForm({ ...form, company: '', companyId: '', contactFirstName: '', contactLastName: '', contactEmail: '', contactPhone: '', contactId: '' }); setCustomerSearch(''); setSelectedCustomerContacts([]); }} className="ml-auto p-0.5 hover:bg-indigo-100 rounded">
                              <X className="w-3 h-3 text-indigo-500" />
                            </button>
                          </div>
                        )}
                        <AnimatePresence>
                          {showCustomerList && customerSearch && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 max-h-48 overflow-y-auto">
                              {filteredCustomers.length === 0 ? (
                                <div className="px-4 py-6 text-center">
                                  <p className="text-xs text-slate-400">No customers found</p>
                                  <button type="button" onClick={() => { setIsExistingCompany(false); setForm({ ...form, company: customerSearch }); setShowCustomerList(false); }} className="mt-2 text-xs text-indigo-600 font-semibold hover:underline">+ Add as new prospect</button>
                                </div>
                              ) : filteredCustomers.map(cust => (
                                <button key={cust.id} type="button" onClick={() => selectCustomer(cust)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0 transition-colors">
                                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-white">{cust.name?.substring(0, 2).toUpperCase()}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 truncate">{cust.name}</div>
                                    <div className="text-[11px] text-slate-500 truncate">{(cust.contacts?.length || 0)} contact{(cust.contacts?.length || 0) !== 1 ? 's' : ''}</div>
                                  </div>
                                  {cust.status && <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${cust.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{cust.status}</span>}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="relative" ref={prospectRef}>
                        <input
                          value={form.company}
                          onChange={e => { setForm({ ...form, company: e.target.value }); setShowProspectMatches(true); }}
                          onFocus={() => setShowProspectMatches(true)}
                          placeholder="Company name"
                          className={inputCls}
                        />
                        <AnimatePresence>
                          {showProspectMatches && form.company.trim().length >= 2 && (() => {
                            const q = form.company.trim().toLowerCase();
                            const prospectMatches = customers
                              .filter(c => c.name?.toLowerCase().includes(q))
                              .slice(0, 6);
                            if (prospectMatches.length === 0) return null;
                            return (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 max-h-60 overflow-y-auto"
                              >
                                <div className="px-3 py-2 border-b border-slate-100 bg-amber-50/60">
                                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertTriangle className="w-3 h-3" /> Existing customer match — link instead?
                                  </p>
                                </div>
                                {prospectMatches.map(cust => (
                                  <button
                                    key={cust.id}
                                    type="button"
                                    onClick={() => {
                                      setIsExistingCompany(true);
                                      selectCustomer(cust);
                                      setShowProspectMatches(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0 transition-colors"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center shrink-0">
                                      <span className="text-[10px] font-bold text-white">{cust.name?.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold text-slate-900 truncate">{cust.name}</div>
                                      <div className="text-[11px] text-slate-500 truncate">{(cust.contacts?.length || 0)} contact{(cust.contacts?.length || 0) !== 1 ? 's' : ''}</div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setShowProspectMatches(false)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-t border-slate-100"
                                >
                                  <span className="text-[11px] text-slate-500">
                                    Continue with new prospect: <span className="font-semibold text-slate-700">{form.company}</span>
                                  </span>
                                </button>
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Deal Amount ($)</label>
                      <input value={form.amount} onChange={e => setForm({ ...form, amount: formatCurrency(e.target.value) })} placeholder="0.00" className={inputCls} />
                    </div>
                    <CustomDropdown label="Pipeline Stage" value={form.stage} options={PIPELINE_STAGES.map(s => ({ value: s.id, label: s.label, color: s.color }))} onChange={v => setForm({ ...form, stage: v })} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <CustomDropdown label="Lead Source" value={form.source} options={LEAD_SOURCES.map(s => ({ value: s, label: s }))} onChange={v => setForm({ ...form, source: v })} />
                    <CustomDropdown label="Product Type" value={form.productType} options={(productCategories ?? PRODUCT_TYPES).map(s => ({ value: s, label: s }))} onChange={v => setForm({ ...form, productType: v })} />
                    <div>
                      <label className={labelCls}>Quantity</label>
                      <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="500" className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <CustomDropdown
                      label="Source Category"
                      value={form.sourceCategory || ''}
                      options={[{ value: '', label: '— None —' }, ...SOURCE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))]}
                      onChange={v => setForm({ ...form, sourceCategory: v })}
                    />
                    <div>
                      <label className={labelCls}>Source Detail</label>
                      <input value={form.sourceDetail} onChange={e => setForm({ ...form, sourceDetail: e.target.value })} placeholder="e.g., google-ads, ASI-Vegas-26" className={inputCls} />
                    </div>
                  </div>

                  {form.stage === 'closed-lost' && (
                    <div>
                      <label className={labelCls}>Disqualification Reason *</label>
                      <select value={form.disqualifiedReason} onChange={e => setForm({ ...form, disqualifiedReason: e.target.value })} className={inputCls}>
                        <option value="">Pick a reason…</option>
                        {DISQUALIFIED_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>In-Hands Date</label>
                      <input type="date" value={form.inHandsDate} onChange={e => setForm({ ...form, inHandsDate: e.target.value })} className={inputCls} />
                    </div>
                    <div ref={ownerRef}>
                      <label className={labelCls}>Deal Owner</label>
                      <div className="relative">
                        <input value={form.owner} onChange={e => { setForm({ ...form, owner: e.target.value }); setOwnerSearch(e.target.value); setShowOwnerList(true); }} onFocus={() => { setOwnerSearch(form.owner); setShowOwnerList(true); }} placeholder="Select deal owner..." className={inputCls} />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <AnimatePresence>
                          {showOwnerList && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 max-h-48 overflow-y-auto">
                              {filteredUsers.length === 0 ? (
                                <div className="px-4 py-4 text-center text-xs text-slate-400">No users found</div>
                              ) : filteredUsers.map(user => {
                                const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
                                return (
                                  <button key={user.id} type="button" onClick={() => { setForm({ ...form, owner: name }); setShowOwnerList(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0 transition-colors">
                                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center shrink-0">
                                      <span className="text-[10px] font-bold text-white">{name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-slate-900">{name}</div>
                                      {user.email && <div className="text-[11px] text-slate-500">{user.email}</div>}
                                    </div>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div>
                <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-3.5 bg-indigo-500 rounded-full" /> Contact Details
                </h3>
                <div className="space-y-3">
                  {isExistingCompany && form.companyId && (
                    <div ref={contactRef}>
                      <label className={labelCls}>Select Contact</label>
                      {selectedCustomerContacts.length > 0 ? (
                        <div className="relative">
                          <button type="button" onClick={() => setShowContactList(!showContactList)} className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl text-sm hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all">
                            <span className={form.contactFirstName ? 'text-slate-900' : 'text-slate-400'}>{form.contactFirstName ? `${form.contactFirstName} ${form.contactLastName}`.trim() : 'Choose a contact...'}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showContactList ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {showContactList && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 max-h-48 overflow-y-auto">
                                {selectedCustomerContacts.map((contact: any) => {
                                  const cName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
                                  return (
                                    <button key={contact.id} type="button" onClick={() => selectContact(contact)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0 transition-colors">
                                      <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shrink-0"><User className="w-3.5 h-3.5 text-white" /></div>
                                      <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-900 truncate">{cName}</div>
                                        <div className="text-[11px] text-slate-500 truncate">{contact.email || ''}</div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                          <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            No contacts found for this customer. Please add a contact to the customer record first.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>First Name</label>
                      <input value={form.contactFirstName} onChange={e => setForm({ ...form, contactFirstName: e.target.value })} placeholder="First name" className={inputCls + (isExistingCompany && form.companyId ? ' opacity-60' : '')} disabled={isExistingCompany && !!form.companyId} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name</label>
                      <input value={form.contactLastName} onChange={e => setForm({ ...form, contactLastName: e.target.value })} placeholder="Last name" className={inputCls + (isExistingCompany && form.companyId ? ' opacity-60' : '')} disabled={isExistingCompany && !!form.companyId} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} onBlur={checkDedupOnEmailBlur} placeholder="email@company.com" className={inputCls + (isExistingCompany && form.companyId ? ' opacity-60' : '')} disabled={isExistingCompany && !!form.companyId} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <PhoneInput
                        value={form.contactPhone}
                        onChange={(v) => setForm({ ...form, contactPhone: v })}
                        placeholder="(xxx) xxx - xxxx"
                        disabled={isExistingCompany && !!form.companyId}
                        className={`flex items-stretch w-full bg-slate-50/80 border-2 border-slate-200 rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all${isExistingCompany && form.companyId ? ' opacity-60' : ''}`}
                        inputClassName="flex-1 min-w-0 bg-transparent border-0 outline-none px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-3.5 bg-indigo-500 rounded-full" /> Documents
                </h3>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
                  <Upload className="w-4 h-4" /> Upload Documents
                </button>
                {documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700 truncate">{doc.name}</div>
                          <div className="text-[11px] text-slate-400">{(doc.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button onClick={() => removeDocument(i)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-3.5 bg-indigo-500 rounded-full" /> Notes
                </h3>
                <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional details about this deal..." className={inputCls + " resize-none"} />
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex gap-3">
              <button onClick={onClose} className="flex-1 px-3 py-2.5 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="flex-1 px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {lead ? 'Update Deal' : 'Create Deal'}
              </motion.button>
            </div>
          </motion.div>
          {showDedup && (
            <DedupWarningModal
              matches={dedupMatches}
              blocking={dedupBlocking}
              onClose={() => setShowDedup(false)}
              onCreateAnyway={() => setShowDedup(false)}
              onOpenExisting={(leadId) => {
                setShowDedup(false);
                onClose();
                onOpenExistingLead?.(leadId);
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ────── Deal Card (Draggable) ──────
function DealCard({ lead, stage, onEdit, onDelete, onMove, onDragStart, isSelected, onSelect, onView }: {
  lead: SalesLead; stage: typeof PIPELINE_STAGES[0];
  onEdit: () => void; onDelete: () => void; onMove: (newStage: string) => void;
  onDragStart: (e: DragEvent, leadId: string) => void;
  isSelected: boolean; onSelect: (id: string) => void;
  onView: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const daysSinceActivity = lead.lastActivity ? Math.floor((Date.now() - new Date(lead.lastActivity).getTime()) / 86400000) : 0;
  const isStale = daysSinceActivity > 7;

  const inHandsLabel = lead.inHandsDate
    ? new Date(lead.inHandsDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      draggable
      onDragStart={(e: any) => onDragStart(e, lead.id)}
      className={`group relative bg-white border rounded-md transition-all cursor-grab active:cursor-grabbing
        ${isSelected ? 'border-indigo-400 ring-1 ring-indigo-400/40' : 'border-slate-200 hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]'}
      `}
    >
      <div className="px-3 pt-2.5 pb-2">
        {/* Title row */}
        <div className="flex items-start gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(lead.id); }}
            aria-label={isSelected ? 'Deselect' : 'Select'}
            className={`mt-[3px] w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0 transition-all
              ${isSelected
                ? 'bg-indigo-600 border border-indigo-600'
                : 'border border-slate-300 bg-white opacity-0 group-hover:opacity-100 hover:border-indigo-400'}`}
          >
            {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="text-left flex-1 min-w-0"
          >
            <h4 className="text-[13px] font-semibold text-slate-900 truncate leading-snug">{lead.title}</h4>
            {lead.company && (
              <p className="text-[11.5px] text-slate-500 truncate mt-px">{lead.company}</p>
            )}
          </button>
          <ScoreBadge score={lead.score} breakdown={lead.scoreBreakdown} />
        </div>

        {/* Amount + qty + in-hands — single typographic line */}
        {(lead.amount > 0 || inHandsLabel) && (
          <div className="mt-2 flex items-baseline gap-2 text-[12px]">
            {lead.amount > 0 && (
              <span className="font-semibold text-slate-900 tabular-nums">${lead.amount.toLocaleString()}</span>
            )}
            {lead.quantity > 0 && (
              <span className="text-slate-400 tabular-nums">{lead.quantity.toLocaleString()} units</span>
            )}
            {inHandsLabel && (
              <span className="ml-auto text-slate-500 tabular-nums">In-hands {inHandsLabel}</span>
            )}
          </div>
        )}

        {/* Footer: owner / product / actions */}
        <div className="mt-2 flex items-center gap-2">
          {lead.ownerInitials && (
            <div
              className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center shrink-0"
              title={lead.owner}
            >
              <span className="text-[9px] font-semibold text-white tracking-wide">{lead.ownerInitials}</span>
            </div>
          )}
          {lead.productType && (
            <span className="text-[11px] text-slate-500 truncate">{lead.productType}</span>
          )}
          {isStale && (
            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-amber-700">
              <AlertTriangle className="w-2.5 h-2.5" />Stale
            </span>
          )}
          <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              title="Call"
            >
              <Phone className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              title="Email"
            >
              <Mail className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ────── Main Module ──────
export function SalesLeadModule() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editLead, setEditLead] = useState<SalesLead | null>(null);
  const [viewingLead, setViewingLead] = useState<SalesLead | null>(null);
  const [showMetrics, setShowMetrics] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [ownerFilter, setOwnerFilter] = useState('All Owners');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStage, setBulkStage] = useState('');
  const [bulkOwner, setBulkOwner] = useState('');
  const [showBulkOwnerList, setShowBulkOwnerList] = useState(false);
  const [bulkUsers, setBulkUsers] = useState<{ id: string; name?: string; firstName?: string; lastName?: string }[]>([]);
  const bulkOwnerRef = useRef<HTMLDivElement>(null);
  const [minScoreFilter, setMinScoreFilter] = useState('All Scores');
  const [sourceCategoryFilter, setSourceCategoryFilter] = useState('All Categories');
  const [pendingDisqualify, setPendingDisqualify] = useState<
    | { kind: 'single'; lead: SalesLead }
    | { kind: 'bulk'; ids: string[] }
    | null
  >(null);
  const [pendingCloseWon, setPendingCloseWon] = useState<{ lead: SalesLead } | null>(null);
  const [embedOpen, setEmbedOpen] = useState(false);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (bulkOwnerRef.current && !bulkOwnerRef.current.contains(e.target as Node)) setShowBulkOwnerList(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map(id =>
        fetch('/api/sales-leads/delete', {
          method: 'DELETE',
          headers: headers_json,
          body: JSON.stringify({ id }),
        })
      ));
      toast.success(`${ids.length} deal(s) deleted`);
      clearSelection();
      fetchLeads();
    } catch { toast.error('Error deleting deals'); }
  };

  const performBulkStatusUpdate = async (ids: string[], newStage: string, disqualifiedReason?: string) => {
    const stageInfo = PIPELINE_STAGES.find(s => s.id === newStage);
    try {
      await Promise.all(ids.map(id => {
        const lead = leads.find(l => l.id === id);
        if (!lead) return Promise.resolve();
        const body: any = { id, stage: newStage, probability: (stageInfo?.weight || 0) * 100 };
        if (disqualifiedReason) body.disqualifiedReason = disqualifiedReason;
        return fetch('/api/sales-leads/update', {
          method: 'PATCH',
          headers: headers_json,
          body: JSON.stringify(body),
        });
      }));
      toast.success(`${ids.length} deal(s) moved to ${stageInfo?.label}`);
      clearSelection();
      setBulkStage('');
      fetchLeads();
    } catch { toast.error('Error updating deals'); }
  };

  const handleBulkStatusUpdate = async (newStage: string) => {
    const ids = [...selectedIds];
    if (newStage === 'closed-won') {
      toast.error('Move deals to Closed Won one at a time so each can spawn its own order.');
      setBulkStage('');
      return;
    }
    if (newStage === 'closed-lost') {
      const needsReason = ids.some(id => {
        const l = leads.find(x => x.id === id);
        return l && !l.disqualifiedReason;
      });
      if (needsReason) {
        setPendingDisqualify({ kind: 'bulk', ids });
        return;
      }
    }
    await performBulkStatusUpdate(ids, newStage);
  };

  const handleBulkOwnerUpdate = async (newOwner: string) => {
    const ids = [...selectedIds];
    const initials = newOwner.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    try {
      await Promise.all(ids.map(id => {
        const lead = leads.find(l => l.id === id);
        if (!lead) return Promise.resolve();
        return fetch('/api/sales-leads/update', {
          method: 'PATCH',
          headers: headers_json,
          body: JSON.stringify({ id, owner: newOwner, ownerInitials: initials }),
        });
      }));
      toast.success(`${ids.length} deal(s) assigned to ${newOwner}`);
      clearSelection();
      setBulkOwner('');
      setShowBulkOwnerList(false);
      fetchLeads();
    } catch { toast.error('Error updating deals'); }
  };

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sales-leads/list', { headers: headers_json });
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) { console.error('Error fetching leads:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleSave = async (data: any) => {
    try {
      const isEdit = !!data.id;
      if (isEdit) {
        const res = await fetch('/api/sales-leads/update', {
          method: 'PATCH',
          headers: headers_json,
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) { toast.error(result.error || 'Failed'); return; }
        toast.success('Deal updated!');
      } else {
        const { id: _ignored, ...body } = data;
        void _ignored;
        const res = await fetch('/api/sales-leads/create', {
          method: 'POST',
          headers: headers_json,
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (res.status === 409 && result.duplicateLeadId) {
          toast.error('A lead already exists with this email — opening that record.');
          await fetchLeads();
          setDrawerOpen(false);
          setEditLead(null);
          // jump to the duplicate after the list refreshes
          setTimeout(() => {
            setLeads((current) => {
              const target = current.find(l => l.id === result.duplicateLeadId);
              if (target) setViewingLead(target);
              return current;
            });
          }, 0);
          return;
        }
        if (!res.ok) { toast.error(result.error || 'Failed'); return; }
        toast.success('Deal created!');
      }
      setDrawerOpen(false);
      setEditLead(null);
      fetchLeads();
    } catch { toast.error('Error saving deal'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/sales-leads/delete', {
        method: 'DELETE',
        headers: headers_json,
        body: JSON.stringify({ id }),
      });
      toast.success('Deal deleted');
      fetchLeads();
    } catch { toast.error('Error deleting'); }
  };

  const performMove = async (lead: SalesLead, newStage: string, disqualifiedReason?: string) => {
    const stageInfo = PIPELINE_STAGES.find(s => s.id === newStage);
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === lead.id
      ? { ...l, stage: newStage, probability: (stageInfo?.weight || 0) * 100, lastActivity: new Date().toISOString(), ...(disqualifiedReason ? { disqualifiedReason } : {}) }
      : l));
    try {
      const body: any = { id: lead.id, stage: newStage, probability: (stageInfo?.weight || 0) * 100 };
      if (disqualifiedReason) body.disqualifiedReason = disqualifiedReason;
      const res = await fetch('/api/sales-leads/update', {
        method: 'PATCH',
        headers: headers_json,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Update failed');
      }
      toast.success(`Moved to ${stageInfo?.label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error moving deal');
      fetchLeads();
    }
  };

  const performCloseWon = async (lead: SalesLead, orderInput: CloseWonOrderInput) => {
    // Create the order first.
    const orderRes = await fetch('/api/orders/create', {
      method: 'POST',
      headers: headers_json,
      body: JSON.stringify({
        customer: orderInput.customer,
        email: orderInput.email,
        customerId: lead.companyId ?? null,
        sourceLeadId: lead.id,
        items: orderInput.items,
        total: orderInput.total > 0 ? `$${orderInput.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
        subtotal: orderInput.total,
        inHandsDate: orderInput.inHandsDate || null,
        notes: orderInput.notes,
        projectName: lead.title,
        contacts: [{
          firstName: lead.contactFirstName,
          lastName: lead.contactLastName,
          name: lead.contactName,
          email: lead.contactEmail,
          phone: lead.contactPhone,
          contactId: lead.contactId,
        }],
        lineItems: orderInput.productType ? [{
          productType: orderInput.productType,
          quantity: orderInput.items,
          total: orderInput.total,
        }] : [],
        documents: lead.documents ?? [],
        status: 'Pending',
        paymentStatus: 'Pending',
      }),
    });
    if (!orderRes.ok) {
      const data = await orderRes.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to create order');
    }
    const orderData = await orderRes.json();
    const order = orderData.order;
    if (!order || !order.id) throw new Error('Order response missing id');

    // Then move the lead to closed-won and link it.
    const stageInfo = PIPELINE_STAGES.find(s => s.id === 'closed-won');
    setLeads(prev => prev.map(l => l.id === lead.id
      ? {
          ...l,
          stage: 'closed-won',
          probability: 100,
          lastActivity: new Date().toISOString(),
          sourceOrderId: order.id,
          sourceOrderNumber: order.orderNumber ?? null,
          orderLinkedAt: new Date().toISOString(),
        }
      : l));

    const updateRes = await fetch('/api/sales-leads/update', {
      method: 'PATCH',
      headers: headers_json,
      body: JSON.stringify({
        id: lead.id,
        stage: 'closed-won',
        probability: (stageInfo?.weight || 1) * 100,
        sourceOrderId: order.id,
        sourceOrderNumber: order.orderNumber ?? null,
        orderLinkedAt: new Date().toISOString(),
      }),
    });
    if (!updateRes.ok) {
      // Order was created but lead update failed — surface clearly so the user can retry.
      toast.error(`Order ${order.orderNumber} created, but the deal didn't update. Retry the move.`);
      fetchLeads();
      return;
    }

    toast.success(`Order ${order.orderNumber} created`, {
      action: { label: 'View', onClick: () => { window.location.hash = `#orders/${order.id}`; } },
    });
  };

  const handleMove = async (lead: SalesLead, newStage: string) => {
    if (lead.stage === newStage) return;
    if (newStage === 'closed-lost' && !lead.disqualifiedReason) {
      setPendingDisqualify({ kind: 'single', lead });
      return;
    }
    if (newStage === 'closed-won') {
      if (lead.sourceOrderId) {
        // Already linked — just transition silently and surface a toast.
        await performMove(lead, newStage);
        toast.message(`Already linked to ${lead.sourceOrderNumber || 'an order'}`, {
          action: { label: 'View', onClick: () => { window.location.hash = `#orders/${lead.sourceOrderId}`; } },
        });
        return;
      }
      setPendingCloseWon({ lead });
      return;
    }
    await performMove(lead, newStage);
  };

  // Drag handlers
  const onDragStart = (e: DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(leadId);
  };
  const onDragOver = (e: DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };
  const onDragLeave = () => { setDragOverStage(null); };
  const onDrop = (e: DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.stage !== stageId) handleMove(lead, stageId);
    setDragOverStage(null);
    setDraggedLeadId(null);
  };
  const onDragEnd = () => { setDragOverStage(null); setDraggedLeadId(null); };

  const owners = [...new Set(leads.map(l => l.owner).filter(Boolean))];
  const filteredLeads = leads.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      if (!l.title.toLowerCase().includes(q) && !l.company.toLowerCase().includes(q) && !l.id.toLowerCase().includes(q) && !l.contactName?.toLowerCase().includes(q)) return false;
    }
    if (sourceFilter !== 'All Sources' && l.source !== sourceFilter) return false;
    if (ownerFilter !== 'All Owners' && l.owner !== ownerFilter) return false;
    if (sourceCategoryFilter !== 'All Categories' && l.sourceCategory !== sourceCategoryFilter) return false;
    if (minScoreFilter !== 'All Scores') {
      const threshold = minScoreFilter === 'Hot 71+' ? 71 : minScoreFilter === 'Warm 41+' ? 41 : 0;
      if ((l.score ?? 0) < threshold) return false;
    }
    return true;
  });

  // Always show all stages including closed-lost
  const visibleStages = PIPELINE_STAGES;

  const totalPipelineValue = filteredLeads.filter(l => l.stage !== 'closed-lost' && l.stage !== 'closed-won').reduce((s, l) => s + l.amount, 0);
  const weightedValue = filteredLeads.filter(l => l.stage !== 'closed-lost' && l.stage !== 'closed-won').reduce((s, l) => s + l.amount * ((l.probability || 0) / 100), 0);
  const wonValue = filteredLeads.filter(l => l.stage === 'closed-won').reduce((s, l) => s + l.amount, 0);
  const lostValue = filteredLeads.filter(l => l.stage === 'closed-lost').reduce((s, l) => s + l.amount, 0);
  const activeDeals = filteredLeads.filter(l => l.stage !== 'closed-lost' && l.stage !== 'closed-won').length;

  // When viewing a specific lead, update from latest data
  const currentViewingLead = viewingLead ? leads.find(l => l.id === viewingLead.id) || viewingLead : null;

  if (currentViewingLead) {
    return (
      <>
        <SalesLeadDetailView
          lead={currentViewingLead}
          onBack={() => setViewingLead(null)}
          onEdit={() => { setEditLead(currentViewingLead); setDrawerOpen(true); }}
          onDelete={async () => { await handleDelete(currentViewingLead.id); setViewingLead(null); }}
          onStageChange={(lead, newStage) => handleMove(lead, newStage)}
        />
        <LeadDrawer
          isOpen={drawerOpen}
          onClose={() => { setDrawerOpen(false); setEditLead(null); }}
          onSave={handleSave}
          lead={editLead}
          onOpenExistingLead={(leadId) => {
            const target = leads.find(l => l.id === leadId);
            if (target) {
              setDrawerOpen(false);
              setEditLead(null);
              setViewingLead(target);
            }
          }}
        />
        {pendingDisqualify && (
          <DisqualifyModal
            onClose={() => setPendingDisqualify(null)}
            onConfirm={async (reason) => {
              const action = pendingDisqualify;
              setPendingDisqualify(null);
              if (action.kind === 'single') {
                await performMove(action.lead, 'closed-lost', reason);
              } else {
                await performBulkStatusUpdate(action.ids, 'closed-lost', reason);
              }
            }}
          />
        )}
        {pendingCloseWon && (
          <CloseWonModal
            lead={pendingCloseWon.lead}
            onClose={() => setPendingCloseWon(null)}
            onCreateOrder={async (orderInput) => {
              const action = pendingCloseWon;
              setPendingCloseWon(null);
              try {
                await performCloseWon(action.lead, orderInput);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to create order');
                setPendingCloseWon(action);
              }
            }}
            onSkip={async () => {
              const action = pendingCloseWon;
              setPendingCloseWon(null);
              await performMove(action.lead, 'closed-won');
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden h-full">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="max-w-[2200px] mx-auto flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-3 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 leading-none">Deals</h1>
              <span className="text-sm text-slate-500 leading-none">
                {activeDeals} active <span className="text-slate-300">·</span> {filteredLeads.length} total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('board')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-colors ${viewMode === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Board</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-colors ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
              <button
                onClick={() => setEmbedOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                title="Embed lead capture form"
              >
                <Code className="w-3.5 h-3.5" /> <span className="hidden md:inline">Embed</span>
              </button>
              <button
                onClick={fetchLeads}
                className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="w-px h-5 bg-slate-200 mx-0.5" />
              <button
                onClick={() => { setEditLead(null); setDrawerOpen(true); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-lg hover:shadow-md hover:shadow-indigo-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Create deal
              </button>
            </div>
          </div>
        </div>

        {/* Metrics — inline strip */}
        {showMetrics && (
          <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-2 border-b border-slate-100 bg-white">
            <div className="max-w-[2200px] mx-auto flex flex-wrap items-baseline gap-x-6 gap-y-1.5 text-[13px]">
              <span className="text-slate-500">Pipeline <strong className="text-slate-900 font-semibold tabular-nums">${totalPipelineValue.toLocaleString()}</strong></span>
              <span className="text-slate-500">Weighted <strong className="text-slate-900 font-semibold tabular-nums">${Math.round(weightedValue).toLocaleString()}</strong></span>
              <span className="text-slate-500">Won <strong className="text-emerald-700 font-semibold tabular-nums">${wonValue.toLocaleString()}</strong></span>
              <span className="text-slate-500">Lost <strong className="text-slate-900 font-semibold tabular-nums">${lostValue.toLocaleString()}</strong></span>
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="px-4 sm:px-6 lg:px-8 py-2.5 border-b border-slate-200 bg-white shrink-0">
          <div className="max-w-[2200px] mx-auto flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, company, contact…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-transparent rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-indigo-500/15 transition-all"
              />
            </div>
            <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="hidden sm:block px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-[12px] font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer">
              <option>All Owners</option>
              {owners.map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={sourceCategoryFilter} onChange={e => setSourceCategoryFilter(e.target.value)} className="hidden md:block px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-[12px] font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer">
              <option>All Categories</option>
              {SOURCE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="hidden md:block px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-[12px] font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer">
              <option>All Sources</option>
              {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={minScoreFilter} onChange={e => setMinScoreFilter(e.target.value)} className="hidden lg:block px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-[12px] font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer">
              <option>All Scores</option>
              <option>Hot 71+</option>
              <option>Warm 41+</option>
            </select>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className={`flex items-center gap-1.5 px-2 py-1.5 text-[12px] font-medium rounded-md transition-colors ${showMetrics ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showMetrics ? 'Hide' : 'Show'} metrics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="px-4 sm:px-6 lg:px-8 py-2 bg-slate-900 shrink-0"
          >
            <div className="max-w-[2200px] mx-auto flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-white text-[13px] font-semibold tabular-nums">{selectedIds.size}</span>
                <span className="text-slate-400 text-[13px]">selected</span>
                <button onClick={clearSelection} className="ml-1 p-0.5 hover:bg-white/10 rounded transition-colors">
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                </button>
              </div>
              <div className="h-4 w-px bg-white/15" />
              <select
                value={bulkStage}
                onChange={e => { if (e.target.value) handleBulkStatusUpdate(e.target.value); }}
                className="px-2 py-1 bg-transparent hover:bg-white/10 text-white text-[12px] font-medium rounded border border-white/15 cursor-pointer focus:outline-none [&>option]:text-slate-900"
              >
                <option value="">Move to stage…</option>
                {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <div className="relative" ref={bulkOwnerRef}>
                <button
                  onClick={async () => {
                    if (bulkUsers.length === 0) {
                      try {
                        const res = await fetch('/api/users/list', { headers: headers_json });
                        const data = await res.json();
                        if (data.success) setBulkUsers(data.users || []);
                      } catch {}
                    }
                    setShowBulkOwnerList(!showBulkOwnerList);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/10 text-white text-[12px] font-medium rounded border border-white/15 transition-colors"
                >
                  <User className="w-3 h-3" /> Assign owner
                </button>
                <AnimatePresence>
                  {showBulkOwnerList && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg border border-slate-200 shadow-xl z-50 max-h-48 overflow-y-auto">
                      {bulkUsers.map(user => {
                        const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
                        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                        return (
                          <button key={user.id} type="button" onClick={() => handleBulkOwnerUpdate(name)} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 border-b border-slate-100 last:border-0 transition-colors">
                            <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-semibold text-white">{initials}</span>
                            </div>
                            <span className="text-[13px] text-slate-900">{name}</span>
                          </button>
                        );
                      })}
                      {bulkUsers.length === 0 && <div className="px-3 py-3 text-[12px] text-slate-400 text-center">No users found</div>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-2 py-1 text-red-300 hover:text-white hover:bg-red-500/80 text-[12px] font-medium rounded transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pipeline Board */}
        {viewMode === 'board' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 sm:px-6 lg:px-8 pt-4 pb-3">
          <div className="max-w-[2200px] mx-auto h-full">
            <div className="flex gap-3 h-full" style={{ minWidth: `${visibleStages.length * 280}px` }}>
              {visibleStages.map((stage) => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
                const stageTotal = stageLeads.reduce((s, l) => s + l.amount, 0);
                const isDragOver = dragOverStage === stage.id;

                return (
                  <div
                    key={stage.id}
                    className="flex-1 min-w-[260px] flex flex-col"
                    onDragOver={e => onDragOver(e, stage.id)}
                    onDragLeave={onDragLeave}
                    onDrop={e => onDrop(e, stage.id)}
                  >
                    {/* Column Header */}
                    <div className="pb-2 mb-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                          <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider truncate">{stage.label}</h3>
                          <span className="text-[11px] text-slate-400 tabular-nums">{stageLeads.length}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                          ${stageTotal >= 1000 ? `${Math.round(stageTotal / 1000)}k` : stageTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Cards container */}
                    <div className={`flex-1 overflow-y-auto custom-scrollbar rounded-lg transition-colors ${
                      isDragOver ? 'bg-indigo-50/60 ring-1 ring-indigo-300' : ''
                    }`}>
                      <div className="space-y-1.5 pb-2">
                        <AnimatePresence>
                          {stageLeads.map(lead => (
                            <DealCard
                              key={lead.id} lead={lead} stage={stage}
                              onEdit={() => { setEditLead(lead); setDrawerOpen(true); }}
                              onDelete={() => handleDelete(lead.id)}
                              onMove={(newStage) => handleMove(lead, newStage)}
                              onDragStart={onDragStart}
                              isSelected={selectedIds.has(lead.id)}
                              onSelect={toggleSelect}
                              onView={() => setViewingLead(lead)}
                            />
                          ))}
                        </AnimatePresence>
                        {stageLeads.length === 0 && (
                          <div className={`flex items-center justify-center py-8 rounded-md border border-dashed transition-colors ${
                            isDragOver ? 'border-indigo-300 bg-white/60' : 'border-slate-200/70'
                          }`}>
                            {isDragOver ? (
                              <p className="text-[11px] font-semibold text-indigo-600">Drop here</p>
                            ) : (
                              <p className="text-[11px] text-slate-400">No deals</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        ) : (
        /* List View */
        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="max-w-[2200px] mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredLeads.length && filteredLeads.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(new Set(filteredLeads.map(l => l.id)));
                            else setSelectedIds(new Set());
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Deal</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Company</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Stage</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Score</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Source</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Owner</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">In-Hands</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Probability</th>
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-6 py-12 text-center">
                          <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">No deals found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead, index) => {
                        const stage = PIPELINE_STAGES.find(s => s.id === lead.stage) || PIPELINE_STAGES[0];
                        return (
                          <motion.tr
                            key={lead.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors group ${selectedIds.has(lead.id) ? 'bg-indigo-50/30' : ''}`}
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span onClick={() => setViewingLead(lead)} className="font-semibold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors">{lead.title}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                  <span className="text-white text-[10px] font-bold">{lead.company.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="text-sm text-slate-700">{lead.company}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">{lead.contactName}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-900 font-medium">${lead.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${stage.bg} ${stage.text} ${stage.border}`}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                                {stage.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <ScoreBadge score={lead.score} breakdown={lead.scoreBreakdown} size="md" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">{lead.source}</span>
                              {lead.sourceCategory && <span className="block text-[10px] text-slate-400 capitalize">{lead.sourceCategory}</span>}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center shrink-0">
                                  <span className="text-[9px] font-bold text-white">{lead.ownerInitials}</span>
                                </div>
                                <span className="text-sm text-slate-700">{lead.owner}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">{lead.inHandsDate ? new Date(lead.inHandsDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${lead.probability}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-slate-600">{lead.probability}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => { setEditLead(lead); setDrawerOpen(true); }}
                                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDelete(lead.id)}
                                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing {filteredLeads.length} of {leads.length} deals</span>
              <span>Total pipeline: <span className="font-semibold text-slate-700">${filteredLeads.reduce((s, l) => s + l.amount, 0).toLocaleString()}</span></span>
            </div>
          </div>
        </div>
        )}
      </div>

      <LeadDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditLead(null); }}
        onSave={handleSave}
        lead={editLead}
        onOpenExistingLead={(leadId) => {
          const target = leads.find(l => l.id === leadId);
          if (target) {
            setDrawerOpen(false);
            setEditLead(null);
            setViewingLead(target);
          }
        }}
      />
      {pendingDisqualify && (
        <DisqualifyModal
          onClose={() => setPendingDisqualify(null)}
          onConfirm={async (reason) => {
            const action = pendingDisqualify;
            setPendingDisqualify(null);
            if (action.kind === 'single') {
              await performMove(action.lead, 'closed-lost', reason);
            } else {
              await performBulkStatusUpdate(action.ids, 'closed-lost', reason);
            }
          }}
        />
      )}
      {pendingCloseWon && (
        <CloseWonModal
          lead={pendingCloseWon.lead}
          onClose={() => setPendingCloseWon(null)}
          onCreateOrder={async (orderInput) => {
            const action = pendingCloseWon;
            setPendingCloseWon(null);
            try {
              await performCloseWon(action.lead, orderInput);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Failed to create order');
              setPendingCloseWon(action);
            }
          }}
          onSkip={async () => {
            const action = pendingCloseWon;
            setPendingCloseWon(null);
            await performMove(action.lead, 'closed-won');
          }}
        />
      )}
      <LeadCaptureFormSnippet open={embedOpen} onClose={() => setEmbedOpen(false)} />
    </>
  );
}