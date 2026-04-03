import { motion, AnimatePresence } from 'motion/react';
import {
  Target, Plus, Search, X, ChevronDown, RefreshCw, GripVertical, DollarSign,
  Calendar, User, Clock, ArrowRight, MoreHorizontal, Edit, Trash2, Phone, Mail,
  TrendingUp, Zap, MessageSquare, FileText, Building2,
  BarChart3, AlertTriangle, CheckCircle2, Sparkles, XCircle, ChevronUp, Loader2, Upload, Paperclip
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef, DragEvent } from 'react';
import { toast } from 'sonner';

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

// ────── Phone Formatter ──────
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`;
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

// ────── Create/Edit Lead Drawer ──────
function LeadDrawer({ isOpen, onClose, onSave, lead }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; lead?: SalesLead | null }) {
  const [form, setForm] = useState({
    title: '', company: '', companyId: '', contactFirstName: '', contactLastName: '', contactEmail: '', contactPhone: '',
    amount: '', stage: 'lead-received', source: 'Website', productType: 'Apparel', inHandsDate: '', owner: '', notes: '', quantity: '',
    contactId: '',
  });
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (custRef.current && !custRef.current.contains(e.target as Node)) setShowCustomerList(false);
      if (ownerRef.current && !ownerRef.current.contains(e.target as Node)) setShowOwnerList(false);
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) setShowContactList(false);
    };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (isOpen && users.length === 0) {
      fetch('/api/users', { headers: headers_json })
        .then(r => r.json())
        .then(data => { if (data.success) setUsers(data.users || []); })
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
        productType: lead.productType,
        inHandsDate: lead.inHandsDate, owner: lead.owner, notes: lead.notes,
        quantity: String(lead.quantity || ''),
        contactId: '',
      });
      setIsExistingCompany(!!lead.companyId);
      setDocuments(lead.documents || []);
    } else {
      setForm({ title: '', company: '', companyId: '', contactFirstName: '', contactLastName: '', contactEmail: '', contactPhone: '', amount: '', stage: 'lead-received', source: 'Website', productType: 'Apparel', inHandsDate: '', owner: '', notes: '', quantity: '', contactId: '' });
      setIsExistingCompany(false);
      setDocuments([]);
    }
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

  useEffect(() => { if (isExistingCompany && customers.length === 0) fetchCustomers(); }, [isExistingCompany]);

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

  const handleSubmit = () => {
    if (!form.title.trim()) { toast.error('Deal title is required'); return; }
    if (!form.company.trim()) { toast.error('Company name is required'); return; }
    if (isExistingCompany && form.companyId && !form.contactFirstName && !form.contactLastName) {
      toast.error('Please select a contact for this customer. If no contacts exist, go to the customer record and add one first.');
      return;
    }
    const contactName = `${form.contactFirstName} ${form.contactLastName}`.trim();
    const initials = form.owner ? form.owner.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AS';
    onSave({
      ...form, contactName, contactFirstName: form.contactFirstName, contactLastName: form.contactLastName,
      amount: parseFloat(parseCurrency(form.amount)) || 0, quantity: parseInt(form.quantity) || 0, ownerInitials: initials,
      probability: PIPELINE_STAGES.find(s => s.id === form.stage)?.weight ? (PIPELINE_STAGES.find(s => s.id === form.stage)!.weight * 100) : 10,
      tags: form.productType ? [form.productType] : [], documents, ...(lead ? { id: lead.id } : {}),
    });
  };

  const inputCls = "w-full px-4 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full sm:w-[580px] bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-50" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{lead ? 'Edit Deal' : 'Create Deal'}</h2>
                    <p className="text-xs text-white/70">Fill out the deal details below</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/15 rounded-lg transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Deal Info Section */}
              <div>
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Deal Information
                </h3>
                <div className="space-y-4">
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
                      <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name" className={inputCls} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Deal Amount ($)</label>
                      <input value={form.amount} onChange={e => setForm({ ...form, amount: formatCurrency(e.target.value) })} placeholder="0.00" className={inputCls} />
                    </div>
                    <CustomDropdown label="Pipeline Stage" value={form.stage} options={PIPELINE_STAGES.map(s => ({ value: s.id, label: s.label, color: s.color }))} onChange={v => setForm({ ...form, stage: v })} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <CustomDropdown label="Lead Source" value={form.source} options={LEAD_SOURCES.map(s => ({ value: s, label: s }))} onChange={v => setForm({ ...form, source: v })} />
                    <CustomDropdown label="Product Type" value={form.productType} options={PRODUCT_TYPES.map(s => ({ value: s, label: s }))} onChange={v => setForm({ ...form, productType: v })} />
                    <div>
                      <label className={labelCls}>Quantity</label>
                      <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="500" className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Contact Details
                </h3>
                <div className="space-y-4">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>First Name</label>
                      <input value={form.contactFirstName} onChange={e => setForm({ ...form, contactFirstName: e.target.value })} placeholder="First name" className={inputCls + (isExistingCompany && form.companyId ? ' opacity-60' : '')} disabled={isExistingCompany && !!form.companyId} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name</label>
                      <input value={form.contactLastName} onChange={e => setForm({ ...form, contactLastName: e.target.value })} placeholder="Last name" className={inputCls + (isExistingCompany && form.companyId ? ' opacity-60' : '')} disabled={isExistingCompany && !!form.companyId} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="email@company.com" className={inputCls + (isExistingCompany && form.companyId ? ' opacity-60' : '')} disabled={isExistingCompany && !!form.companyId} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: formatPhoneNumber(e.target.value) })} placeholder="(xxx) xxx - xxxx" className={inputCls + (isExistingCompany && form.companyId ? ' opacity-60' : '')} disabled={isExistingCompany && !!form.companyId} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Documents
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
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Notes
                </h3>
                <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional details about this deal..." className={inputCls + " resize-none"} />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors">Cancel</button>
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {lead ? 'Update Deal' : 'Create Deal'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ────── Deal Card (Draggable) ──────
function DealCard({ lead, stage, onEdit, onDelete, onMove, onDragStart, isSelected, onSelect }: {
  lead: SalesLead; stage: typeof PIPELINE_STAGES[0];
  onEdit: () => void; onDelete: () => void; onMove: (newStage: string) => void;
  onDragStart: (e: DragEvent, leadId: string) => void;
  isSelected: boolean; onSelect: (id: string) => void;
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={(e: any) => onDragStart(e, lead.id)}
      className={`bg-white rounded-xl border shadow-sm hover:shadow-lg hover:border-slate-300 transition-all group cursor-grab active:cursor-grabbing active:shadow-xl active:scale-[1.02] relative overflow-hidden ${isSelected ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-200/80'}`}
    >
      {/* Color accent line */}
      <div className="h-0.5 w-full" style={{ backgroundColor: stage.color }} />

      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {/* Bulk select checkbox */}
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(lead.id); }}
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400 bg-white'}`}
            >
              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-slate-900 truncate leading-tight">{lead.title}</h4>
              <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 shrink-0" />
                {lead.company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {/* Direct delete button */}
            {!confirmDelete ? (
              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} className="p-1 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Delete deal">
                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); onDelete(); setConfirmDelete(false); }} className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded hover:bg-red-600 transition-colors">Yes</button>
                <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }} className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded hover:bg-slate-300 transition-colors">No</button>
              </div>
            )}
          <div className="relative" ref={menuRef}>
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="p-1 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-2xl z-30 py-1.5 overflow-hidden"
                >
                  <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"><Edit className="w-3.5 h-3.5 text-slate-400" />Edit Deal</button>
                  <div className="border-t border-slate-100 my-1 mx-3" />
                  {PIPELINE_STAGES.filter(s => s.id !== lead.stage).map(s => (
                    <button key={s.id} onClick={() => { onMove(s.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />Move to {s.label}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1 mx-3" />
                  <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2.5"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>

        {/* Amount */}
        {lead.amount > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">${lead.amount.toLocaleString()}</span>
            {lead.quantity > 0 && <span className="text-[10px] text-slate-400 ml-1">· {lead.quantity} units</span>}
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {lead.productType && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">{lead.productType}</span>}
          {isStale && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200"><AlertTriangle className="w-2.5 h-2.5" />Stale</span>}
        </div>

        {/* Date */}
        {lead.inHandsDate && (
          <div className="flex items-center gap-1.5 mb-2.5 text-[11px] text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>In-Hands: {new Date(lead.inHandsDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {lead.ownerInitials && (
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{lead.ownerInitials}</span>
              </div>
            )}
            <div className="flex flex-col">
              {lead.owner && <span className="text-[10px] text-slate-700 font-semibold leading-tight">{lead.owner}</span>}
              <span className="text-[10px] text-slate-400 font-medium">{lead.source}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Phone className="w-3 h-3" /></button>
            <button className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Mail className="w-3 h-3" /></button>
            <button onClick={onEdit} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-3 h-3" /></button>
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
      await Promise.all(ids.map(id => fetch(`/api/sales-leads/${id}`, { method: 'DELETE', headers: headers_json })));
      toast.success(`${ids.length} deal(s) deleted`);
      clearSelection();
      fetchLeads();
    } catch { toast.error('Error deleting deals'); }
  };

  const handleBulkStatusUpdate = async (newStage: string) => {
    const ids = [...selectedIds];
    const stageInfo = PIPELINE_STAGES.find(s => s.id === newStage);
    try {
      await Promise.all(ids.map(id => {
        const lead = leads.find(l => l.id === id);
        if (!lead) return Promise.resolve();
        return fetch(`/api/sales-leads/${id}`, {
          method: 'PUT', headers: headers_json,
          body: JSON.stringify({ ...lead, stage: newStage, probability: (stageInfo?.weight || 0) * 100, lastActivity: new Date().toISOString() }),
        });
      }));
      toast.success(`${ids.length} deal(s) moved to ${stageInfo?.label}`);
      clearSelection();
      setBulkStage('');
      fetchLeads();
    } catch { toast.error('Error updating deals'); }
  };

  const handleBulkOwnerUpdate = async (newOwner: string) => {
    const ids = [...selectedIds];
    const initials = newOwner.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    try {
      await Promise.all(ids.map(id => {
        const lead = leads.find(l => l.id === id);
        if (!lead) return Promise.resolve();
        return fetch(`/api/sales-leads/${id}`, {
          method: 'PUT', headers: headers_json,
          body: JSON.stringify({ ...lead, owner: newOwner, ownerInitials: initials, lastActivity: new Date().toISOString() }),
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
      const data = await res.json().catch(() => ({}));
      if (res.ok) setLeads(data.leads || []);
    } catch (err) { console.error('Error fetching leads:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleSave = async (data: any) => {
    try {
      const isEdit = !!data.id;
      // For new deals, strip any accidental id/companyId that could conflict
      const payload = isEdit ? data : { ...data, id: undefined };
      const url = isEdit ? `/api/sales-leads/${data.id}` : '/api/sales-leads/list';
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: headers_json, body: JSON.stringify(payload) });
      const result = await res.json().catch(() => ({}));
      if (res.ok && !result.error) {
        toast.success(isEdit ? 'Deal updated!' : 'Deal created!');
        setDrawerOpen(false);
        setEditLead(null);
        fetchLeads();
      } else toast.error(result.error || 'Failed');
    } catch { toast.error('Error saving deal'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/sales-leads/${id}`, { method: 'DELETE', headers: headers_json });
      toast.success('Deal deleted');
      fetchLeads();
    } catch { toast.error('Error deleting'); }
  };

  const handleMove = async (lead: SalesLead, newStage: string) => {
    if (lead.stage === newStage) return;
    const stageInfo = PIPELINE_STAGES.find(s => s.id === newStage);
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: newStage, probability: (stageInfo?.weight || 0) * 100, lastActivity: new Date().toISOString() } : l));
    try {
      await fetch(`/api/sales-leads/${lead.id}`, {
        method: 'PUT', headers: headers_json,
        body: JSON.stringify({ ...lead, stage: newStage, probability: (stageInfo?.weight || 0) * 100, lastActivity: new Date().toISOString() }),
      });
      toast.success(`Moved to ${stageInfo?.label}`);
    } catch {
      toast.error('Error moving deal');
      fetchLeads();
    }
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
    return true;
  });

  // Always show all stages including closed-lost
  const visibleStages = PIPELINE_STAGES;

  const totalPipelineValue = filteredLeads.filter(l => l.stage !== 'closed-lost' && l.stage !== 'closed-won').reduce((s, l) => s + l.amount, 0);
  const weightedValue = filteredLeads.filter(l => l.stage !== 'closed-lost' && l.stage !== 'closed-won').reduce((s, l) => s + l.amount * ((l.probability || 0) / 100), 0);
  const wonValue = filteredLeads.filter(l => l.stage === 'closed-won').reduce((s, l) => s + l.amount, 0);
  const lostValue = filteredLeads.filter(l => l.stage === 'closed-lost').reduce((s, l) => s + l.amount, 0);
  const activeDeals = filteredLeads.filter(l => l.stage !== 'closed-lost' && l.stage !== 'closed-won').length;

  return (
    <>
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30 overflow-hidden h-full">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-[2200px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Deals</h1>
                    <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Pipeline</span>
                  </div>
                  <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Sales lead pipeline management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button onClick={() => setViewMode(viewMode === 'board' ? 'list' : 'board')} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
                  {viewMode === 'board' ? 'List View' : 'Board View'}
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setEditLead(null); setDrawerOpen(true); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create</span> Deal
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        {showMetrics && (
          <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-5 mb-4">
            <div className="max-w-[2200px] mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                {[
                  { label: 'Active Deals', value: String(activeDeals), icon: Target, gradient: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/15' },
                  { label: 'Pipeline Value', value: `$${totalPipelineValue.toLocaleString()}`, icon: DollarSign, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/15' },
                  { label: 'Weighted Value', value: `$${Math.round(weightedValue).toLocaleString()}`, icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/15' },
                  { label: 'Closed Won', value: `$${wonValue.toLocaleString()}`, icon: CheckCircle2, gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/15' },
                  { label: 'Closed Lost', value: `$${lostValue.toLocaleString()}`, icon: XCircle, gradient: 'from-red-500 to-red-600', shadow: 'shadow-red-500/15' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`bg-white rounded-2xl border border-slate-200/60 p-4 shadow-lg ${stat.shadow}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">{stat.label}</div>
                          <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="px-4 sm:px-6 lg:px-8 mb-4 shrink-0">
          <div className="max-w-[2200px] mx-auto">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="flex-1 min-w-[180px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm" />
              </div>
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="hidden sm:block px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer">
                <option>All Sources</option>
                {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="hidden sm:block px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer">
                <option>All Owners</option>
                {owners.map(o => <option key={o}>{o}</option>)}
              </select>
              <button onClick={() => setShowMetrics(!showMetrics)} className={`p-2.5 rounded-xl border transition-all shadow-sm ${showMetrics ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                <BarChart3 className="w-4 h-4" />
              </button>
              <button onClick={fetchLeads} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 mb-3 shrink-0">
            <div className="max-w-[2200px] mx-auto">
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-600 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap shadow-lg shadow-indigo-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-bold">{selectedIds.size} selected</span>
                  <button onClick={clearSelection} className="p-1 hover:bg-white/15 rounded-lg transition-colors"><X className="w-4 h-4 text-white/70" /></button>
                </div>
                <div className="h-5 w-px bg-white/20" />
                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
                <div className="h-5 w-px bg-white/20" />
                <select
                  value={bulkStage}
                  onChange={e => { if (e.target.value) handleBulkStatusUpdate(e.target.value); }}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 cursor-pointer focus:outline-none [&>option]:text-slate-900"
                >
                  <option value="">Update Status...</option>
                  {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <div className="relative" ref={bulkOwnerRef}>
                  <button
                    onClick={async () => {
                      if (bulkUsers.length === 0) {
                        try {
                          const res = await fetch('/api/users', { headers: headers_json });
                          const data = await res.json();
                          if (data.success) setBulkUsers(data.users || []);
                        } catch {}
                      }
                      setShowBulkOwnerList(!showBulkOwnerList);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors"
                  >
                    <User className="w-3 h-3" /> Assign Owner
                  </button>
                  <AnimatePresence>
                    {showBulkOwnerList && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 max-h-48 overflow-y-auto">
                        {bulkUsers.map(user => {
                          const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
                          return (
                            <button key={user.id} type="button" onClick={() => handleBulkOwnerUpdate(name)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0 transition-colors">
                              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-bold text-white">{name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                              </div>
                              <span className="text-sm font-medium text-slate-900">{name}</span>
                            </button>
                          );
                        })}
                        {bulkUsers.length === 0 && <div className="px-4 py-3 text-xs text-slate-400 text-center">No users found</div>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Pipeline Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 sm:px-6 lg:px-8 pb-4">
          <div className="max-w-[2200px] mx-auto h-full">
            <div className="flex gap-3 h-full" style={{ minWidth: `${visibleStages.length * 240}px` }}>
              {visibleStages.map((stage) => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
                const stageTotal = stageLeads.reduce((s, l) => s + l.amount, 0);
                const stageWeighted = stageLeads.reduce((s, l) => s + l.amount * stage.weight, 0);
                const isDragOver = dragOverStage === stage.id;
                const isClosedCol = stage.id === 'closed-won' || stage.id === 'closed-lost';

                return (
                  <div
                    key={stage.id}
                    className={`flex-1 min-w-[220px] max-w-[300px] flex flex-col rounded-2xl transition-all ${
                      isDragOver ? 'bg-indigo-50/70 ring-2 ring-indigo-400 ring-offset-2' : 'bg-white/50'
                    }`}
                    onDragOver={e => onDragOver(e, stage.id)}
                    onDragLeave={onDragLeave}
                    onDrop={e => onDrop(e, stage.id)}
                  >
                    {/* Column Header */}
                    <div className={`px-3 py-3 rounded-t-2xl border-b ${isDragOver ? 'border-indigo-200' : 'border-slate-200/60'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stage.label}</h3>
                          <span className="min-w-[20px] h-5 px-1.5 bg-slate-200/80 text-slate-600 rounded-full text-[10px] font-bold flex items-center justify-center">{stageLeads.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
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
                          />
                        ))}
                      </AnimatePresence>
                      {stageLeads.length === 0 && (
                        <div className={`flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed transition-colors ${
                          isDragOver ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/30'
                        }`}>
                          {isDragOver ? (
                            <>
                              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-2">
                                <ArrowRight className="w-5 h-5 text-indigo-500" />
                              </motion.div>
                              <p className="text-xs font-semibold text-indigo-600">Drop here</p>
                            </>
                          ) : (
                            <>
                              <div className={`w-8 h-8 ${stage.bg} rounded-lg flex items-center justify-center mb-2`}>
                                <Target className={`w-4 h-4 ${stage.text}`} />
                              </div>
                              <p className="text-[11px] text-slate-400">No deals</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-3 py-2.5 border-t border-slate-200/60 rounded-b-2xl bg-slate-50/30">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500"><span className="font-bold text-slate-700">${stageTotal.toLocaleString()}</span> total</span>
                        <span className="text-slate-400">{Math.round(stage.weight * 100)}% wt</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <LeadDrawer isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setEditLead(null); }} onSave={handleSave} lead={editLead} />
    </>
  );
}