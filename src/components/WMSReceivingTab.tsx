import { motion, AnimatePresence } from 'motion/react';
import { PackageCheck, Plus, Search, RefreshCw, Filter, ChevronDown, X, Eye, Edit2, Trash2, Barcode, ScanLine, CheckCircle2, Clock, AlertTriangle, Truck, Package, Camera, XCircle, Image as ImageIcon, ChevronLeft, ChevronRight, Hash, FileText, Building2, User } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { DatePicker } from './DatePicker';
import { QuantityStepper } from './QuantityStepper';
import { ReceivingDetailView } from './ReceivingDetailView';
import { getProjectBadgeClasses, getProjectIconColor, getDeepLinkKey, getDeepLinkTarget } from './projectNumberUtils';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };

const CARRIER_TYPES: Record<string, string[]> = {
  'Small Package': ['UPS', 'FedEx', 'USPS', 'DHL Express', 'Amazon Logistics'],
  'LTL': ['FedEx Freight', 'XPO Logistics', 'Estes Express', 'Old Dominion', 'SAIA', 'ABF Freight'],
  'FTL': ['Schneider', 'J.B. Hunt', 'Werner', 'Swift', 'Heartland Express', 'Knight Transportation'],
};

interface ReceivingItem {
  id: string;
  poNumber?: string;
  vendor: string;
  expectedDate: string;
  status: 'Scheduled' | 'In Transit' | 'At Dock' | 'Receiving' | 'QC Check' | 'Completed' | 'Delivered' | 'Issue';
  items: { sku: string; name: string; expectedQty: number; receivedQty: number; location?: string; imageUrl?: string }[];
  dock?: string;
  carrier?: string;
  carrierType?: string;
  trackingNumber?: string;
  notes?: string;
  receivedBy?: string;
  receivedAt?: string;
  createdAt: string;
  sourceOrderId?: string;
  sourceOrderType?: 'order' | 'sample-order';
  customerName?: string;
  projectName?: string;
  projectNumber?: string;
}

const STATUS_COLORS: Record<string, string> = {
  'Scheduled': 'bg-slate-100 text-slate-700 border-slate-200',
  'In Transit': 'bg-blue-100 text-blue-700 border-blue-200',
  'At Dock': 'bg-amber-100 text-amber-700 border-amber-200',
  'Receiving': 'bg-orange-100 text-orange-700 border-orange-200',
  'QC Check': 'bg-purple-100 text-purple-700 border-purple-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200',
  'Delivered': 'bg-teal-100 text-teal-700 border-teal-200',
  'Issue': 'bg-red-100 text-red-700 border-red-200',
};

const ALL_STATUSES = ['Scheduled', 'In Transit', 'At Dock', 'Receiving', 'QC Check', 'Completed', 'Delivered', 'Issue'];

// Scanner simulation component
function ScanReceiveModal({ isOpen, onClose, receipt, onUpdate }: { isOpen: boolean; onClose: () => void; receipt: ReceivingItem | null; onUpdate: (updated: ReceivingItem) => void }) {
  const [scanInput, setScanInput] = useState('');
  const [localItems, setLocalItems] = useState<ReceivingItem['items']>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (receipt) setLocalItems(receipt.items.map(i => ({ ...i })));
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [receipt, isOpen]);

  const handleScan = () => {
    if (!scanInput.trim()) return;
    const idx = localItems.findIndex(i => i.sku.toLowerCase() === scanInput.trim().toLowerCase());
    if (idx >= 0) {
      const updated = [...localItems];
      updated[idx] = { ...updated[idx], receivedQty: Math.min(updated[idx].receivedQty + 1, updated[idx].expectedQty) };
      setLocalItems(updated);
      toast.success(`Scanned: ${updated[idx].name} (${updated[idx].receivedQty}/${updated[idx].expectedQty})`);
    } else {
      toast.error(`SKU "${scanInput}" not found in this receipt`);
    }
    setScanInput('');
    inputRef.current?.focus();
  };

  const handleComplete = () => {
    if (!receipt) return;
    const allReceived = localItems.every(i => i.receivedQty >= i.expectedQty);
    onUpdate({
      ...receipt,
      items: localItems,
      status: allReceived ? 'Completed' : 'Receiving',
      receivedAt: allReceived ? new Date().toISOString() : undefined,
    });
    onClose();
  };

  const totalExpected = localItems.reduce((s, i) => s + i.expectedQty, 0);
  const totalReceived = localItems.reduce((s, i) => s + i.receivedQty, 0);
  const progress = totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && receipt && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
              <div className="px-6 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <ScanLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Scan & Receive</h2>
                      <p className="text-sm text-slate-500">{receipt.id} &middot; {receipt.vendor}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
              </div>

              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={scanInput}
                      onChange={e => setScanInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleScan()}
                      placeholder="Scan barcode or enter SKU..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-amber-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-lg font-mono bg-white"
                    />
                  </div>
                  <button onClick={handleScan} className="px-5 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600">Scan</button>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">Progress: {totalReceived}/{totalExpected}</span>
                    <span className="text-xs font-bold text-amber-600">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${progress}%` }} className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {localItems.map((item, i) => {
                    const isDone = item.receivedQty >= item.expectedQty;
                    return (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDone ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Package className="w-5 h-5 text-slate-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500 font-mono">SKU: {item.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${isDone ? 'text-emerald-600' : 'text-slate-900'}`}>{item.receivedQty}/{item.expectedQty}</div>
                          <div className="text-xs text-slate-500">received</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => {
                            const updated = [...localItems];
                            updated[i] = { ...updated[i], receivedQty: Math.max(0, updated[i].receivedQty - 1) };
                            setLocalItems(updated);
                          }} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 font-bold text-sm">-</button>
                          <button onClick={() => {
                            const updated = [...localItems];
                            updated[i] = { ...updated[i], receivedQty: Math.min(updated[i].expectedQty, updated[i].receivedQty + 1) };
                            setLocalItems(updated);
                          }} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 font-bold text-sm">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">Cancel</button>
                <button onClick={handleComplete} className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:shadow-lg flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />{progress === 100 ? 'Complete Receiving' : 'Save Progress'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Vendor Dropdown for the drawer
function VendorDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/vendors`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } });
        const data = await res.json();
        if (data.success) setVendors((data.vendors || []).map((v: any) => ({ id: v.id, name: v.name || v.companyName || v.id })));
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-left flex items-center justify-between bg-white">
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>{value || 'Select vendor...'}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden max-h-60 flex flex-col">
            <div className="p-2 border-b border-slate-100">
              <input type="text" placeholder="Search vendors..." value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400">{vendors.length === 0 ? 'Loading vendors...' : 'No vendors found'}</div>
              ) : filtered.map(v => (
                <button key={v.id} onClick={() => { onChange(v.name); setOpen(false); setVendorSearch(''); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${value === v.name ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {v.name}{value === v.name && <span className="float-right text-indigo-500 font-bold">&#10003;</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Carrier Type + Carrier two-step selector
function CarrierSelector({ carrierType, carrier, onCarrierTypeChange, onCarrierChange }: { carrierType: string; carrier: string; onCarrierTypeChange: (v: string) => void; onCarrierChange: (v: string) => void }) {
  const [typeOpen, setTypeOpen] = useState(false);
  const [carrierOpen, setCarrierOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  const carrierRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
      if (carrierRef.current && !carrierRef.current.contains(e.target as Node)) setCarrierOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const carrierOptions = carrierType ? CARRIER_TYPES[carrierType] || [] : [];

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Shipping Method</label>
        <div className="relative" ref={typeRef}>
          <button type="button" onClick={() => setTypeOpen(!typeOpen)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-left flex items-center justify-between bg-white">
            <span className={carrierType ? 'text-slate-900' : 'text-slate-400'}>{carrierType || 'Select type...'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {typeOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                {Object.keys(CARRIER_TYPES).map(t => (
                  <button key={t} onClick={() => { onCarrierTypeChange(t); onCarrierChange(''); setTypeOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${carrierType === t ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <span>{t}</span>
                      <span className="text-xs text-slate-400">{CARRIER_TYPES[t].length} carriers</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Carrier</label>
        <div className="relative" ref={carrierRef}>
          <button type="button" onClick={() => { if (carrierOptions.length > 0) setCarrierOpen(!carrierOpen); else toast.error('Select a shipping method first'); }} className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-left flex items-center justify-between bg-white ${!carrierType ? 'opacity-60' : ''}`}>
            <span className={carrier ? 'text-slate-900' : 'text-slate-400'}>{carrier || (carrierType ? 'Select carrier...' : 'Select method first')}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${carrierOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {carrierOpen && carrierOptions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                {carrierOptions.map(c => (
                  <button key={c} onClick={() => { onCarrierChange(c); setCarrierOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${carrier === c ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                    {c}{carrier === c && <span className="float-right text-indigo-500 font-bold">&#10003;</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// Add Receiving Drawer
function AddReceivingDrawer({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ poNumber: '', vendor: '', expectedDate: '', carrierType: '', carrier: '', trackingNumber: '', dock: '', notes: '' });
  const [items, setItems] = useState([{ sku: '', name: '', expectedQty: 1, receivedQty: 0, imageUrl: '' }]);

  const addItem = () => setItems([...items, { sku: '', name: '', expectedQty: 1, receivedQty: 0, imageUrl: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSubmit = () => {
    if (!form.vendor.trim()) { toast.error('Vendor is required'); return; }
    if (!form.expectedDate) { toast.error('Expected date is required'); return; }
    if (items.some(i => !i.sku.trim())) { toast.error('All items need a SKU'); return; }
    onSave({ ...form, items, status: 'Scheduled' });
    setForm({ poNumber: '', vendor: '', expectedDate: '', carrierType: '', carrier: '', trackingNumber: '', dock: '', notes: '' });
    setItems([{ sku: '', name: '', expectedQty: 1, receivedQty: 0, imageUrl: '' }]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-[560px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">New Inbound Shipment</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">PO Number</label>
                  <input value={form.poNumber} onChange={e => setForm({ ...form, poNumber: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vendor *</label>
                  <VendorDropdown value={form.vendor} onChange={v => setForm({ ...form, vendor: v })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Date *</label>
                  <DatePicker value={form.expectedDate} onChange={v => setForm({ ...form, expectedDate: v })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dock</label>
                  <input value={form.dock} onChange={e => setForm({ ...form, dock: e.target.value })} placeholder="e.g. Dock A" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <CarrierSelector
                  carrierType={form.carrierType}
                  carrier={form.carrier}
                  onCarrierTypeChange={v => setForm({ ...form, carrierType: v })}
                  onCarrierChange={v => setForm({ ...form, carrier: v })}
                />
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tracking #</label>
                  <input value={form.trackingNumber} onChange={e => setForm({ ...form, trackingNumber: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none" />
              </div>
              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-700">Expected Items</label>
                  <button onClick={addItem} className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"><Plus className="w-4 h-4" />Add Item</button>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                      <div className="flex items-start gap-3">
                        {/* Image thumbnail */}
                        <div className="shrink-0">
                          {item.imageUrl ? (
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                              <button onClick={() => updateItem(i, 'imageUrl', '')} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-white">
                              <ImageIcon className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input value={item.sku} onChange={e => updateItem(i, 'sku', e.target.value)} placeholder="SKU" className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500" />
                          <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Product Name" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                          <QuantityStepper value={item.expectedQty} onChange={(val) => updateItem(i, 'expectedQty', val)} min={0} wide />
                        </div>
                        {items.length > 1 && <button onClick={() => removeItem(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>}
                      </div>
                      <input value={item.imageUrl} onChange={e => updateItem(i, 'imageUrl', e.target.value)} placeholder="Image URL (optional)" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-500 focus:outline-none focus:border-indigo-500 bg-white" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg">Create Inbound</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Filter Dropdown
function RcvFilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${value !== options[0] ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}>
        <span className="text-slate-500 font-medium">{label}:</span><span>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden">
            <div className="py-1.5">{options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${value === opt ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                {opt}{value === opt && <span className="float-right text-amber-500 font-bold">&#10003;</span>}
              </button>
            ))}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WMSReceivingTab({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [receipts, setReceipts] = useState<ReceivingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceivingItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailReceipt, setDetailReceipt] = useState<ReceivingItem | null>(null);
  // Bulk selection
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Vendor & customer logo lookup maps (matching PurchasingModule v432 pattern)
  const [vendorLogoMap, setVendorLogoMap] = useState<Record<string, string>>({});
  const [customerLogoMap, setCustomerLogoMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const [vendorRes, customerRes] = await Promise.all([
          fetch(`${API_URL}/vendors`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }),
          fetch(`${API_URL}/customers`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }),
        ]);
        const vendorData = await vendorRes.json();
        const customerData = await customerRes.json();
        if (vendorData.success) {
          const logoMap: Record<string, string> = {};
          (vendorData.vendors || []).forEach((v: any) => {
            if (v.name && v.logo) logoMap[v.name.trim().toLowerCase()] = v.logo;
          });
          setVendorLogoMap(logoMap);
        }
        if (customerData.success) {
          const map: Record<string, string> = {};
          (customerData.customers || []).forEach((c: any) => { if (c.name && c.logo) map[c.name.trim().toLowerCase()] = c.logo; });
          setCustomerLogoMap(map);
        }
      } catch (err) {
        console.error('Error fetching vendor/customer logos for receiving:', err);
      }
    };
    fetchLogos();
  }, []);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/receiving`, { headers });
      const data = await res.json();
      if (data.success) setReceipts(data.receipts || []);
    } catch (err) {
      console.error('Error fetching receipts:', err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  const handleSave = async (data: any) => {
    try {
      const res = await fetch(`${API_URL}/receiving`, { method: 'POST', headers, body: JSON.stringify(data) });
      const result = await res.json();
      if (result.success) { toast.success('Inbound shipment created!'); setDrawerOpen(false); fetchReceipts(); }
      else toast.error(result.error || 'Failed to create');
    } catch { toast.error('Error creating inbound shipment'); }
  };

  const handleUpdate = async (updated: ReceivingItem) => {
    try {
      const res = await fetch(`${API_URL}/receiving/${updated.id}`, { method: 'PUT', headers, body: JSON.stringify(updated) });
      const result = await res.json();
      if (result.success) { toast.success(updated.status === 'Completed' ? 'Receiving completed!' : 'Progress saved!'); fetchReceipts(); }
    } catch { toast.error('Error updating receipt'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/receiving/${id}`, { method: 'DELETE', headers });
      toast.success('Receipt deleted');
      setSelectedRows(prev => prev.filter(r => r !== id));
      fetchReceipts();
    } catch { toast.error('Error deleting'); }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedRows) {
        await fetch(`${API_URL}/receiving/${id}`, { method: 'DELETE', headers });
      }
      toast.success(`Deleted ${selectedRows.length} receipts`);
      setSelectedRows([]);
      setBulkDeleteConfirm(false);
      fetchReceipts();
    } catch { toast.error('Error deleting'); }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedRows(paginated.map(r => r.id));
    else setSelectedRows([]);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) setSelectedRows(prev => [...prev, id]);
    else setSelectedRows(prev => prev.filter(r => r !== id));
  };

  const filtered = receipts.filter(r => {
    const matchSearch = r.id.toLowerCase().includes(search.toLowerCase()) || r.vendor.toLowerCase().includes(search.toLowerCase()) || (r.poNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All Status' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginated = filtered.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => { setSearch(value); setCurrentPage(1); };
  const handleRowsPerPageChange = (value: number) => { setRowsPerPage(value); setCurrentPage(1); };

  const activeFilterCount = statusFilter !== 'All Status' ? 1 : 0;

  // Stats
  const scheduled = receipts.filter(r => r.status === 'Scheduled' || r.status === 'In Transit').length;
  const atDock = receipts.filter(r => r.status === 'At Dock' || r.status === 'Receiving').length;
  const completed = receipts.filter(r => r.status === 'Completed' || r.status === 'Delivered').length;
  const issues = receipts.filter(r => r.status === 'Issue').length;

  // If viewing a detail receipt, render the detail view
  if (detailReceipt) {
    return (
      <ReceivingDetailView
        receipt={detailReceipt}
        onBack={() => { setDetailReceipt(null); fetchReceipts(); }}
        onUpdate={(updated) => {
          handleUpdate(updated);
          setDetailReceipt(updated);
        }}
        onNavigate={onNavigate}
        vendorLogoMap={vendorLogoMap}
        customerLogoMap={customerLogoMap}
      />
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Scheduled', value: scheduled, icon: Clock, color: 'from-blue-500 to-blue-600' },
              { label: 'At Dock', value: atDock, icon: Truck, color: 'from-amber-500 to-amber-600' },
              { label: 'Completed', value: completed, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
              { label: 'Issues', value: issues, icon: AlertTriangle, color: 'from-red-500 to-red-600' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center`}><Icon className="w-6 h-6 text-white" /></div>
                  </div>
                  <div className="text-sm text-slate-500 mb-1">{s.label}</div>
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search by receipt ID, vendor, or PO..." value={search} onChange={e => handleSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchReceipts} className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-5 h-5" />New Inbound
              </motion.button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Filter className="w-4 h-4" />Filters{activeFilterCount > 0 && <span className="w-5 h-5 bg-amber-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>}</div>
              <RcvFilterDropdown label="Status" value={statusFilter} options={['All Status', ...ALL_STATUSES]} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} />
              {activeFilterCount > 0 && <button onClick={() => { setStatusFilter('All Status'); setCurrentPage(1); }} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100"><X className="w-3.5 h-3.5" />Clear</button>}
            </div>
          </div>

          {/* Bulk Action Bar */}
          <AnimatePresence>
            {selectedRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{selectedRows.length}</span>
                      </div>
                      <span className="text-white font-medium">
                        {selectedRows.length} item{selectedRows.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBulkDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedRows([])}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors ml-2"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-2 focus:ring-amber-500/20"
                        checked={selectedRows.length === paginated.length && paginated.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Image</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Project #</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Receipt ID</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">PO #</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">SKU</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Product</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Vendor</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Customer</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Expected</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Qty</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Carrier</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={14} className="px-8 py-20">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                          <PackageCheck className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Inbound Shipments</h3>
                        <p className="text-sm text-slate-500 max-w-md">Create a new inbound to start tracking deliveries.</p>
                      </div>
                    </td></tr>
                  ) : paginated.map((r, i) => {
                    const totalExp = r.items.reduce((s, it) => s + it.expectedQty, 0);
                    const rawRcv = r.items.reduce((s, it) => s + it.receivedQty, 0);
                    // If status is Delivered/Completed, treat as fully received even if receivedQty wasn't updated
                    const totalRcv = (r.status === 'Delivered' || r.status === 'Completed') ? Math.max(rawRcv, totalExp) : rawRcv;
                    const firstImage = r.items.find(it => it.imageUrl)?.imageUrl;
                    const firstSku = r.items[0]?.sku || '—';
                    const firstProductName = r.items[0]?.name || '—';
                    const extraItems = r.items.length - 1;
                    return (
                      <motion.tr key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`hover:bg-slate-50/50 transition-colors ${selectedRows.includes(r.id) ? 'bg-amber-50/40' : ''}`}>
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-2 focus:ring-amber-500/20"
                            checked={selectedRows.includes(r.id)}
                            onChange={(e) => handleSelectRow(r.id, e.target.checked)}
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {firstImage ? (
                            <img src={firstImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
                              <ImageIcon className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {r.projectNumber ? (
                            <button
                              onClick={() => {
                                sessionStorage.setItem(getDeepLinkKey(r.projectNumber!), r.projectNumber!);
                                onNavigate?.(getDeepLinkTarget(r.projectNumber!));
                              }}
                              className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors cursor-pointer ${getProjectBadgeClasses(r.projectNumber)}`}
                            >
                              {r.projectNumber}
                            </button>
                          ) : (
                            <span className="text-sm text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-900">{r.id}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {r.poNumber ? (
                            <button
                              onClick={() => {
                                sessionStorage.setItem('purchasing_deep_link_poNumber', r.poNumber!);
                                onNavigate?.('purchasing');
                              }}
                              className="flex items-center gap-1.5 group/po"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-500 group-hover/po:text-blue-700 transition-colors" />
                              <span className="text-sm font-medium text-blue-600 group-hover/po:text-blue-800 group-hover/po:underline transition-colors">{r.poNumber}</span>
                            </button>
                          ) : (
                            <span className="text-sm text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-semibold text-slate-900">{firstSku}</span>
                          {extraItems > 0 && (
                            <span className="ml-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">+{extraItems}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-900">{firstProductName}</span>
                          {extraItems > 0 && (
                            <span className="ml-1 text-[10px] font-bold text-slate-400">+{extraItems} more</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 min-w-0">
                            {vendorLogoMap[(r.vendor || '').trim().toLowerCase()] ? (
                              <div className="w-8 h-7 rounded-md flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                                <img src={vendorLogoMap[(r.vendor || '').trim().toLowerCase()]} alt={r.vendor} className="max-w-full max-h-full object-contain p-0.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center shrink-0">
                                <Building2 className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-slate-900 truncate">{r.vendor || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 min-w-0">
                            {customerLogoMap[(r.customerName || '').trim().toLowerCase()] ? (
                              <div className="w-8 h-7 rounded-md flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                                <img src={customerLogoMap[(r.customerName || '').trim().toLowerCase()]} alt={r.customerName} className="max-w-full max-h-full object-contain p-0.5" />
                              </div>
                            ) : r.customerName ? (
                              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5 text-white" />
                              </div>
                            ) : null}
                            <span className="text-sm font-medium text-slate-900 truncate">{r.customerName || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap"><span className="text-sm text-slate-600">{r.expectedDate || '—'}</span></td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-slate-900">{totalRcv}/{totalExp}</span>
                            <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${totalRcv >= totalExp ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${totalExp > 0 ? (totalRcv / totalExp) * 100 : 0}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {r.carrier ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                              <Truck className="w-3 h-3 mr-1 shrink-0" />
                              {r.carrier}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setDetailReceipt(r)}
                              className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Receive & Inspect"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setDeleteConfirmId(r.id)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination - inside table card */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {Math.max(1, totalPages)} · Showing {filtered.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filtered.length)} of {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <div className="flex gap-1 ml-4">
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    disabled={currentPage >= Math.max(1, totalPages)}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddReceivingDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleSave} />
      <ScanReceiveModal isOpen={scanModalOpen} onClose={() => setScanModalOpen(false)} receipt={selectedReceipt} onUpdate={handleUpdate} />

      {/* Delete Confirmation Modal - Single */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setDeleteConfirmId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Delete Receipt</h3>
                    <p className="text-sm text-slate-500">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  Are you sure you want to delete receipt <strong>{deleteConfirmId}</strong>? All associated line items and data will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">Cancel</button>
                  <button onClick={() => { handleDelete(deleteConfirmId); setDeleteConfirmId(null); }} className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700">Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setBulkDeleteConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Delete {selectedRows.length} Receipt{selectedRows.length !== 1 ? 's' : ''}</h3>
                    <p className="text-sm text-slate-500">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  Are you sure you want to delete <strong>{selectedRows.length}</strong> selected receipt{selectedRows.length !== 1 ? 's' : ''}? All associated data will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">Cancel</button>
                  <button onClick={handleBulkDelete} className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700">Delete All</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}