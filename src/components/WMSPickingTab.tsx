import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Plus, Search, RefreshCw, Filter, ChevronDown, X, Eye, Trash2, ScanLine, CheckCircle2, Clock, AlertTriangle, Package, Route, Zap, Play, Pause, MapPin, User } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { QuantityStepper } from './QuantityStepper';

interface PickItem {
  sku: string;
  name: string;
  quantity: number;
  pickedQty: number;
  location: string;
  zone: string;
  aisle: string;
  bin: string;
  imageUrl?: string;
}

interface PickList {
  id: string;
  orderNumber: string;
  customer: string;
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Packed' | 'Issue';
  assignedTo?: string;
  items: PickItem[];
  waveId?: string;
  estimatedTime?: number; // minutes
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-slate-100 text-slate-700 border-slate-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200',
  'Packed': 'bg-purple-100 text-purple-700 border-purple-200',
  'Issue': 'bg-red-100 text-red-700 border-red-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  'Urgent': 'bg-red-100 text-red-700 border-red-200',
  'High': 'bg-orange-100 text-orange-700 border-orange-200',
  'Normal': 'bg-blue-100 text-blue-700 border-blue-200',
  'Low': 'bg-slate-100 text-slate-700 border-slate-200',
};

const ALL_STATUSES = ['Pending', 'In Progress', 'Completed', 'Packed', 'Issue'];

// Pick execution modal with AI-optimized route
function PickExecutionModal({ isOpen, onClose, pickList, onUpdate }: { isOpen: boolean; onClose: () => void; pickList: PickList | null; onUpdate: (updated: PickList) => void }) {
  const [localItems, setLocalItems] = useState<PickItem[]>([]);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [scanInput, setScanInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pickList) {
      // AI-optimized route: sort by zone, then aisle, then bin for shortest travel
      const sorted = [...pickList.items].sort((a, b) => {
        if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
        if (a.aisle !== b.aisle) return a.aisle.localeCompare(b.aisle);
        return a.bin.localeCompare(b.bin);
      });
      setLocalItems(sorted.map(i => ({ ...i })));
      const firstUnpicked = sorted.findIndex(i => i.pickedQty < i.quantity);
      setCurrentItemIdx(firstUnpicked >= 0 ? firstUnpicked : 0);
    }
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [pickList, isOpen]);

  const handleScan = () => {
    if (!scanInput.trim()) return;
    const current = localItems[currentItemIdx];
    if (current && scanInput.trim().toLowerCase() === current.sku.toLowerCase()) {
      const updated = [...localItems];
      updated[currentItemIdx] = { ...updated[currentItemIdx], pickedQty: Math.min(updated[currentItemIdx].pickedQty + 1, updated[currentItemIdx].quantity) };
      setLocalItems(updated);
      if (updated[currentItemIdx].pickedQty >= updated[currentItemIdx].quantity) {
        toast.success(`${current.name} - Pick complete!`);
        const nextIdx = updated.findIndex((item, i) => i > currentItemIdx && item.pickedQty < item.quantity);
        if (nextIdx >= 0) setCurrentItemIdx(nextIdx);
      } else {
        toast.success(`Picked ${updated[currentItemIdx].pickedQty}/${updated[currentItemIdx].quantity}`);
      }
    } else {
      toast.error(`Wrong item! Expected SKU: ${current?.sku}`);
    }
    setScanInput('');
    inputRef.current?.focus();
  };

  const handleComplete = () => {
    if (!pickList) return;
    const allPicked = localItems.every(i => i.pickedQty >= i.quantity);
    onUpdate({
      ...pickList,
      items: localItems,
      status: allPicked ? 'Completed' : 'In Progress',
      startedAt: pickList.startedAt || new Date().toISOString(),
      completedAt: allPicked ? new Date().toISOString() : undefined,
    });
    onClose();
  };

  const totalQty = localItems.reduce((s, i) => s + i.quantity, 0);
  const totalPicked = localItems.reduce((s, i) => s + i.pickedQty, 0);
  const progress = totalQty > 0 ? (totalPicked / totalQty) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && pickList && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
              <div className="px-6 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Route className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Pick Execution</h2>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{pickList.id}</span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" />AI-Optimized Route</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
              </div>

              {/* Current Pick Target */}
              {localItems[currentItemIdx] && (
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="text-xs font-semibold text-indigo-600 mb-1">NEXT PICK</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">{localItems[currentItemIdx].name}</div>
                      <div className="text-sm text-slate-500 font-mono">SKU: {localItems[currentItemIdx].sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        <span className="text-indigo-700 font-mono text-lg">{localItems[currentItemIdx].location}</span>
                      </div>
                      <div className="text-xs text-slate-500">Zone {localItems[currentItemIdx].zone} &middot; Aisle {localItems[currentItemIdx].aisle}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scanner */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                    <input ref={inputRef} type="text" value={scanInput} onChange={e => setScanInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScan()} placeholder="Scan barcode or type SKU manually..." className="w-full pl-12 pr-4 py-3 border-2 border-purple-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-lg font-mono bg-white" />
                  </div>
                  <button onClick={handleScan} className="px-5 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700">Confirm</button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Progress: {totalPicked}/{totalQty} items</span>
                  <span className="text-xs font-bold text-purple-600">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <motion.div animate={{ width: `${progress}%` }} className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                </div>
              </div>

              {/* Items Route List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-2">
                  {localItems.map((item, i) => {
                    const isDone = item.pickedQty >= item.quantity;
                    const isCurrent = i === currentItemIdx;
                    return (
                      <div key={i} onClick={() => !isDone && setCurrentItemIdx(i)} className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all cursor-pointer ${isCurrent ? 'bg-indigo-50 border-indigo-300 shadow-md' : isDone ? 'bg-emerald-50 border-emerald-200 opacity-60' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div className="w-8 text-center">
                          {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-sm font-bold text-slate-400">{i + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{item.location}</div>
                        </div>
                        <div className={`text-sm font-bold ${isDone ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {item.pickedQty}/{item.quantity}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">Cancel</button>
                <button onClick={handleComplete} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />{progress === 100 ? 'Complete Pick' : 'Save Progress'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Create Pick List Drawer
function CreatePickDrawer({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ orderNumber: '', customer: '', priority: 'Normal', assignedTo: '' });
  const [items, setItems] = useState([{ sku: '', name: '', quantity: 1, pickedQty: 0, location: '', zone: 'Z01', aisle: 'A01', bin: 'B01' }]);

  const addItem = () => setItems([...items, { sku: '', name: '', quantity: 1, pickedQty: 0, location: '', zone: 'Z01', aisle: 'A01', bin: 'B01' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => { const u = [...items]; u[i] = { ...u[i], [field]: value }; setItems(u); };

  const handleSubmit = () => {
    if (!form.orderNumber.trim()) { toast.error('Order number is required'); return; }
    if (!form.customer.trim()) { toast.error('Customer is required'); return; }
    // Auto-generate location string
    const finalItems = items.map(i => ({ ...i, location: i.location || `${i.zone}-${i.aisle}-${i.bin}` }));
    onSave({ ...form, items: finalItems, status: 'Pending' });
    setForm({ orderNumber: '', customer: '', priority: 'Normal', assignedTo: '' });
    setItems([{ sku: '', name: '', quantity: 1, pickedQty: 0, location: '', zone: 'Z01', aisle: 'A01', bin: 'B01' }]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-[520px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Create Pick List</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Order # *</label><input value={form.orderNumber} onChange={e => setForm({ ...form, orderNumber: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono" /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Customer *</label><input value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" /></div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <option>Urgent</option><option>High</option><option>Normal</option><option>Low</option>
                  </select>
                </div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Assigned To</label><input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-700">Pick Items</label>
                  <button onClick={addItem} className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"><Plus className="w-4 h-4" />Add Item</button>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <input value={item.sku} onChange={e => updateItem(i, 'sku', e.target.value)} placeholder="SKU" className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500" />
                        <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Product Name" className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                        <div className="flex gap-1 items-center">
                          <QuantityStepper value={item.quantity} onChange={(val) => updateItem(i, 'quantity', val)} min={0} wide />
                          {items.length > 1 && <button onClick={() => removeItem(i)} className="p-2 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <input value={item.location} onChange={e => updateItem(i, 'location', e.target.value)} placeholder="Location" className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500" />
                        <input value={item.zone} onChange={e => updateItem(i, 'zone', e.target.value)} placeholder="Zone" className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500" />
                        <input value={item.aisle} onChange={e => updateItem(i, 'aisle', e.target.value)} placeholder="Aisle" className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500" />
                        <input value={item.bin} onChange={e => updateItem(i, 'bin', e.target.value)} placeholder="Bin" className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg">Create Pick List</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function WMSPickingTab() {
  const [pickLists, setPickLists] = useState<PickList[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [execModalOpen, setExecModalOpen] = useState(false);
  const [selectedPick, setSelectedPick] = useState<PickList | null>(null);

  const fetchPickLists = useCallback(async () => {
    setLoading(true);
    setPickLists([]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPickLists(); }, [fetchPickLists]);

  const handleSave = async (data: any) => {
    const newItem = { ...data, id: Date.now().toString() };
    setPickLists(prev => [...prev, newItem]);
    toast.success('Pick list created!');
    setDrawerOpen(false);
  };

  const handleUpdate = async (updated: PickList) => {
    setPickLists(prev => prev.map(item => item.id === updated.id ? { ...item, ...updated } : item));
    toast.success(updated.status === 'Completed' ? 'Pick completed!' : 'Progress saved!');
  };

  const handleDelete = async (id: string) => {
    setPickLists(prev => prev.filter(item => item.id !== id));
    toast.success('Deleted');
  };

  const filtered = pickLists.filter(p => {
    const matchSearch = p.id.toLowerCase().includes(search.toLowerCase()) || p.orderNumber.toLowerCase().includes(search.toLowerCase()) || p.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All Status' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = pickLists.filter(p => p.status === 'Pending').length;
  const inProgress = pickLists.filter(p => p.status === 'In Progress').length;
  const completed = pickLists.filter(p => p.status === 'Completed').length;
  const packed = pickLists.filter(p => p.status === 'Packed').length;

  return (
    <>
      <div className="p-8">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: pending, icon: Clock, color: 'from-slate-500 to-slate-600' },
              { label: 'In Progress', value: inProgress, icon: Play, color: 'from-blue-500 to-blue-600' },
              { label: 'Completed', value: completed, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
              { label: 'Packed', value: packed, icon: Package, color: 'from-purple-500 to-purple-600' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3"><div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center`}><Icon className="w-6 h-6 text-white" /></div></div>
                  <div className="text-sm text-slate-500 mb-1">{s.label}</div>
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search pick lists..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchPickLists} className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100"><RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} /></motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl"><Plus className="w-5 h-5" />New Pick List</motion.button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Pick ID</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Order #</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Source</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Product</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Customer</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Location</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Priority</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Items</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Assigned</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} className="px-8 py-16 text-center">
                      <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No Pick Lists</h3>
                      <p className="text-sm text-slate-500">Create a pick list to start fulfilling orders.</p>
                    </td></tr>
                  ) : filtered.map((p, i) => {
                    const totalQty = p.items.reduce((s, it) => s + it.quantity, 0);
                    const totalPicked = p.items.reduce((s, it) => s + it.pickedQty, 0);
                    const prog = totalQty > 0 ? (totalPicked / totalQty) * 100 : 0;
                    const isInvShipment = (p as any).sourceType === 'inventory-shipment';
                    const firstItem = p.items[0];
                    const firstImageUrl = firstItem?.imageUrl || (firstItem as any)?.imageUrl;
                    // Collect all unique locations
                    const locations = [...new Set(p.items.map(it => it.location).filter(Boolean))];
                    // Parse customer: strip parenthetical company for cleaner display
                    const customerName = p.customer?.replace(/\s*\(.*\)$/, '') || p.customer;
                    const customerCompany = p.customer?.match(/\((.+)\)$/)?.[1] || '';
                    return (
                      <motion.tr key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm font-semibold text-slate-900">{p.id}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-slate-600 font-mono">{p.orderNumber}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isInvShipment ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <Package className="w-3 h-3" />INV SHIP
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              ORDER
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {firstImageUrl ? (
                              <img src={firstImageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                            ) : (
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-medium text-slate-900">{firstItem?.name || '—'}</span>
                              {p.items.length > 1 && (
                                <span className="ml-1 text-[10px] text-slate-400 font-semibold">+{p.items.length - 1}</span>
                              )}
                              <p className="text-[10px] text-slate-400 font-mono">{firstItem?.sku || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-900">{customerName}</span>
                          {customerCompany && (
                            <p className="text-[10px] text-slate-400">{customerCompany}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {locations.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs font-mono text-slate-600">{locations[0]}</span>
                              {locations.length > 1 && (
                                <span className="text-[10px] text-slate-400 font-semibold">+{locations.length - 1}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${PRIORITY_COLORS[p.priority] || ''}`}>{p.priority}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{totalPicked}/{totalQty}</span>
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${prog === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${prog}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-slate-600">{p.assignedTo || '—'}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setSelectedPick(p); setExecModalOpen(true); }} className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Start Picking"><Play className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <CreatePickDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleSave} />
      <PickExecutionModal isOpen={execModalOpen} onClose={() => setExecModalOpen(false)} pickList={selectedPick} onUpdate={handleUpdate} />
    </>
  );
}