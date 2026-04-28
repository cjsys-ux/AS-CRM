import { motion, AnimatePresence } from 'motion/react';
import { Warehouse, Plus, Search, MapPin, Trash2, Eye, Edit2, X, ChevronDown, RefreshCw, Filter, Grid3X3, Barcode, Download, Building2, Layers, Box, MoreVertical, Check, Copy, DollarSign, Package, Grip, CheckSquare, Square, Minus } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { PhoneInput } from './PhoneInput';

const headers = { 'Content-Type': 'application/json' };

type LocationType = 'zone' | 'aisle' | 'rack' | 'shelf' | 'pallet' | 'bin';

interface WarehouseLocation {
  id: string;
  warehouseId: string;
  name: string;
  type: LocationType;
  parentId?: string;
  barcode: string;
  capacity?: number;
  occupied?: number;
  status: 'Active' | 'Inactive' | 'Full' | 'Reserved';
  zone?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  position?: string;
  createdAt: string;
}

interface WarehouseData {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  totalArea?: number;
  zones?: number;
  aisles?: number;
  racks?: number;
  totalLocations?: number;
  manager?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  warehouseType?: 'Internal' | '3PL';
  totalValue?: number;
  openPalletLocations?: number;
  totalBinLocations?: number;
  totalProducts?: number;
  createdAt: string;
}

// Barcode generation using Code128 canvas rendering
function generateBarcodeCanvas(text: string, width = 300, height = 80): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Simple Code128-style bars
  const barWidth = Math.max(1, Math.floor((width - 40) / (text.length * 11)));
  let x = 20;
  ctx.fillStyle = '#000000';

  // Start pattern
  const startBars = [2, 1, 1, 2, 3, 2];
  for (const b of startBars) {
    const w = b * barWidth;
    ctx.fillRect(x, 8, w, height - 30);
    x += w;
    x += barWidth; // space
  }

  // Encode each character as simple alternating bars
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const pattern = [(code % 4) + 1, 1, ((code >> 2) % 3) + 1, 1, ((code >> 4) % 2) + 1, 1];
    for (let j = 0; j < pattern.length; j++) {
      const w = pattern[j] * barWidth;
      if (j % 2 === 0) {
        ctx.fillRect(x, 8, w, height - 30);
      }
      x += w;
    }
  }

  // Stop pattern
  const stopBars = [2, 3, 1, 1, 1, 2];
  for (const b of stopBars) {
    const w = b * barWidth;
    ctx.fillRect(x, 8, w, height - 30);
    x += w;
    x += barWidth;
  }

  // Text label below
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, width / 2, height - 4);

  return canvas.toDataURL('image/png');
}

// Dropdown filter component
function WMSFilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${value !== options[0] ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}>
        <span className="text-slate-500 font-medium">{label}:</span>
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden">
            <div className="py-1.5">
              {options.map((opt) => (
                <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${value === opt ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {opt}
                  {value === opt && <span className="float-right text-indigo-500 font-bold">&#10003;</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add Warehouse Drawer
function AddWarehouseDrawer({ isOpen, onClose, onSave, editData }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; editData?: WarehouseData | null }) {
  const [form, setForm] = useState({
    name: '', code: '', address: '', city: '', state: '', zip: '', country: 'US',
    totalArea: '', manager: '', phone: '', status: 'Active' as 'Active' | 'Inactive',
    warehouseType: 'Internal' as 'Internal' | '3PL',
    totalValue: '', openPalletLocations: '', totalBinLocations: '', totalProducts: '',
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || '', code: editData.code || '', address: editData.address || '',
        city: editData.city || '', state: editData.state || '', zip: editData.zip || '',
        country: editData.country || 'US', totalArea: String(editData.totalArea || ''),
        manager: editData.manager || '', phone: editData.phone || '', status: editData.status || 'Active',
        warehouseType: editData.warehouseType || 'Internal',
        totalValue: String(editData.totalValue || ''), openPalletLocations: String(editData.openPalletLocations || ''),
        totalBinLocations: String(editData.totalBinLocations || ''), totalProducts: String(editData.totalProducts || ''),
      });
    } else {
      setForm({ name: '', code: '', address: '', city: '', state: '', zip: '', country: 'US', totalArea: '', manager: '', phone: '', status: 'Active', warehouseType: 'Internal', totalValue: '', openPalletLocations: '', totalBinLocations: '', totalProducts: '' });
    }
  }, [editData, isOpen]);

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Warehouse name is required'); return; }
    if (!form.code.trim()) { toast.error('Warehouse code is required'); return; }
    onSave({
      ...form,
      totalArea: form.totalArea ? Number(form.totalArea) : undefined,
      totalValue: form.totalValue ? Number(form.totalValue) : 0,
      openPalletLocations: form.openPalletLocations ? Number(form.openPalletLocations) : 0,
      totalBinLocations: form.totalBinLocations ? Number(form.totalBinLocations) : 0,
      totalProducts: form.totalProducts ? Number(form.totalProducts) : 0,
    });
  };

  const inputCls = "w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-[520px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{editData ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Basic Info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-indigo-500" />General Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warehouse Name *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Miami Distribution Center" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Code *</label>
                    <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className={`${inputCls} font-mono`} placeholder="e.g. MIA" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warehouse Type *</label>
                    <select value={form.warehouseType} onChange={e => setForm({ ...form, warehouseType: e.target.value as 'Internal' | '3PL' })} className={inputCls}>
                      <option value="Internal">Internal</option>
                      <option value="3PL">3PL (Third-Party)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Area (sq ft)</label>
                    <input type="number" value={form.totalArea} onChange={e => setForm({ ...form, totalArea: e.target.value })} className={inputCls} placeholder="50000" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })} className={inputCls}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-indigo-500" />Address & Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                    <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={inputCls} placeholder="123 Warehouse Blvd" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
                    <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ZIP</label>
                    <input value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country</label>
                    <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Manager</label>
                    <input value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                    <PhoneInput
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                      className="flex items-stretch w-full border-2 border-slate-200 rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all"
                      inputClassName="flex-1 min-w-0 bg-transparent border-0 outline-none px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Capacity & Inventory */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-2"><Package className="w-3.5 h-3.5 text-indigo-500" />Capacity & Inventory</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Open Pallet Locations</label>
                    <input type="number" min="0" value={form.openPalletLocations} onChange={e => setForm({ ...form, openPalletLocations: e.target.value })} className={inputCls} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Bin Locations</label>
                    <input type="number" min="0" value={form.totalBinLocations} onChange={e => setForm({ ...form, totalBinLocations: e.target.value })} className={inputCls} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Products</label>
                    <input type="number" min="0" value={form.totalProducts} onChange={e => setForm({ ...form, totalProducts: e.target.value })} className={inputCls} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Inventory Value ($)</label>
                    <input type="number" min="0" step="0.01" value={form.totalValue} onChange={e => setForm({ ...form, totalValue: e.target.value })} className={inputCls} placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg">{editData ? 'Update' : 'Create'} Warehouse</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Location Generator Modal
function LocationGeneratorModal({ isOpen, onClose, warehouse, onGenerate }: { isOpen: boolean; onClose: () => void; warehouse: WarehouseData | null; onGenerate: (locations: any[]) => void }) {
  const [config, setConfig] = useState({ zones: 2, aislesPerZone: 4, racksPerAisle: 6, shelvesPerRack: 4, binsPerShelf: 3 });

  const totalLocations = config.zones * config.aislesPerZone * config.racksPerAisle * config.shelvesPerRack * config.binsPerShelf;

  const handleGenerate = () => {
    if (!warehouse) return;
    const locations: any[] = [];
    for (let z = 1; z <= config.zones; z++) {
      const zoneName = `Z${String(z).padStart(2, '0')}`;
      locations.push({ name: `Zone ${z}`, type: 'zone', barcode: `${warehouse.code}-${zoneName}`, status: 'Active', zone: zoneName, capacity: config.aislesPerZone * config.racksPerAisle * config.shelvesPerRack * config.binsPerShelf });
      for (let a = 1; a <= config.aislesPerZone; a++) {
        const aisleName = `A${String(a).padStart(2, '0')}`;
        for (let r = 1; r <= config.racksPerAisle; r++) {
          const rackName = `R${String(r).padStart(2, '0')}`;
          for (let s = 1; s <= config.shelvesPerRack; s++) {
            const shelfName = `S${String(s).padStart(2, '0')}`;
            for (let b = 1; b <= config.binsPerShelf; b++) {
              const binName = `B${String(b).padStart(2, '0')}`;
              const barcode = `${warehouse.code}-${zoneName}-${aisleName}-${rackName}-${shelfName}-${binName}`;
              locations.push({
                name: `${zoneName}-${aisleName}-${rackName}-${shelfName}-${binName}`,
                type: 'bin' as LocationType,
                barcode,
                status: 'Active',
                zone: zoneName,
                aisle: aisleName,
                rack: rackName,
                shelf: shelfName,
                position: binName,
                capacity: 1,
                occupied: 0,
              });
            }
          }
        }
      }
    }
    onGenerate(locations);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Generate Locations</h2>
                  <p className="text-sm text-slate-500">Auto-create warehouse storage locations</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Grid3X3 className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-900">Warehouse: {warehouse?.name}</span>
                  </div>
                  <p className="text-xs text-indigo-600">Locations will be generated with scannable barcodes</p>
                </div>
                {[
                  { label: 'Zones', key: 'zones' as const, max: 10 },
                  { label: 'Aisles per Zone', key: 'aislesPerZone' as const, max: 20 },
                  { label: 'Racks per Aisle', key: 'racksPerAisle' as const, max: 20 },
                  { label: 'Shelves per Rack', key: 'shelvesPerRack' as const, max: 10 },
                  { label: 'Bins per Shelf', key: 'binsPerShelf' as const, max: 10 },
                ].map(({ label, key, max }) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">{label}</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setConfig(c => ({ ...c, [key]: Math.max(1, c[key] - 1) }))} className="w-8 h-8 rounded-lg border-2 border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 font-bold">-</button>
                      <span className="w-10 text-center text-sm font-bold text-slate-900">{config[key]}</span>
                      <button onClick={() => setConfig(c => ({ ...c, [key]: Math.min(max, c[key] + 1) }))} className="w-8 h-8 rounded-lg border-2 border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 font-bold">+</button>
                    </div>
                  </div>
                ))}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                  <div className="text-xl font-bold text-indigo-600">{totalLocations.toLocaleString()}</div>
                  <div className="text-sm text-slate-500">Total bin locations to create</div>
                  <div className="text-xs text-slate-400 mt-1">{config.zones} zones &times; {config.aislesPerZone} aisles &times; {config.racksPerAisle} racks &times; {config.shelvesPerRack} shelves &times; {config.binsPerShelf} bins</div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">Cancel</button>
                <button onClick={handleGenerate} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg flex items-center justify-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Generate {totalLocations.toLocaleString()} Locations
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Barcode Print Modal
function BarcodePrintModal({ isOpen, onClose, locations }: { isOpen: boolean; onClose: () => void; locations: WarehouseLocation[] }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Location Barcodes</title>
      <style>
        body { font-family: monospace; }
        .barcode-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 16px; }
        .barcode-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; page-break-inside: avoid; }
        .barcode-card img { max-width: 100%; }
        .barcode-label { font-size: 10px; color: #64748b; margin-top: 4px; }
        @media print { .barcode-grid { grid-template-columns: repeat(3, 1fr); } }
      </style></head><body>
      <div class="barcode-grid">
        ${locations.map(loc => {
          const bc = generateBarcodeCanvas(loc.barcode, 250, 70);
          return `<div class="barcode-card"><img src="${bc}" alt="${loc.barcode}" /><div class="barcode-label">${loc.name} · ${loc.type}</div></div>`;
        }).join('')}
      </div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Print Location Barcodes</h2>
                  <p className="text-sm text-slate-500">{locations.length} barcodes selected</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
                    <Download className="w-4 h-4" />Print All
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
              </div>
              <div ref={printRef} className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {locations.slice(0, 100).map((loc) => (
                    <div key={loc.id} className="border border-slate-200 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
                      <img src={generateBarcodeCanvas(loc.barcode, 200, 60)} alt={loc.barcode} className="w-full" />
                      <div className="text-xs text-slate-500 mt-1">{loc.name}</div>
                      <div className="text-[10px] text-slate-400">{loc.type}</div>
                    </div>
                  ))}
                </div>
                {locations.length > 100 && (
                  <div className="text-center text-sm text-slate-500 mt-4">Showing first 100 of {locations.length} barcodes. All will be included in print.</div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Main Warehouses Tab
export function WMSWarehousesTab() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<WarehouseData | null>(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<WarehouseLocation[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/warehouses/list');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setWarehouses(data.warehouses || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocations = useCallback(async (warehouseId: string) => {
    try {
      const res = await fetch(`/api/warehouse-locations/list?warehouseId=${encodeURIComponent(warehouseId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setLocations(data.locations || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  }, []);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const handleSaveWarehouse = async (data: any) => {
    try {
      const url = editWarehouse ? '/api/warehouses/update' : '/api/warehouses/create';
      const body = editWarehouse ? { id: editWarehouse.id, ...data } : data;
      const res = await fetch(url, {
        method: editWarehouse ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        toast.error(result.error || 'Failed to save warehouse');
        return;
      }
      toast.success(editWarehouse ? 'Warehouse updated!' : 'Warehouse created!');
      setDrawerOpen(false);
      setEditWarehouse(null);
      fetchWarehouses();
    } catch (err) {
      toast.error('Error saving warehouse');
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    try {
      const res = await fetch('/api/warehouses/delete', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('Warehouse deleted');
        fetchWarehouses();
        if (selectedWarehouse?.id === id) { setView('list'); setSelectedWarehouse(null); }
      }
    } catch (err) {
      toast.error('Error deleting warehouse');
    }
  };

  const handleGenerateLocations = async (locs: any[]) => {
    if (!selectedWarehouse) return;
    try {
      toast.loading('Generating locations...', { id: 'gen-locs' });
      for (const loc of locs) {
        await fetch('/api/warehouse-locations/create', {
          method: 'POST',
          headers,
          body: JSON.stringify({ ...loc, warehouseId: selectedWarehouse.id }),
        });
      }
      toast.success(`Generated ${locs.length} locations!`, { id: 'gen-locs' });
      fetchLocations(selectedWarehouse.id);
    } catch (err) {
      toast.error('Error generating locations', { id: 'gen-locs' });
    }
  };

  const handleDeleteLocation = async (loc: WarehouseLocation) => {
    try {
      const res = await fetch('/api/warehouse-locations/delete', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id: loc.id }),
      });
      if (res.ok) {
        toast.success('Location deleted');
        fetchLocations(loc.warehouseId);
      }
    } catch (err) {
      toast.error('Error deleting location');
    }
  };

  const openWarehouseDetail = (wh: WarehouseData) => {
    setSelectedWarehouse(wh);
    setView('detail');
    setSelectedIds(new Set());
    fetchLocations(wh.id);
  };

  // Filter locations
  const filteredLocations = locations.filter(loc => {
    const matchSearch = loc.name.toLowerCase().includes(locationSearch.toLowerCase()) || loc.barcode.toLowerCase().includes(locationSearch.toLowerCase());
    const matchType = typeFilter === 'All Types' || loc.type === typeFilter.toLowerCase();
    const matchStatus = statusFilter === 'All Status' || loc.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const activeFilterCount = [typeFilter !== 'All Types', statusFilter !== 'All Status'].filter(Boolean).length;

  // Bulk selection helpers
  const visibleIds = filteredLocations.map(l => l.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));
  const someVisibleSelected = visibleIds.some(id => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleIds));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedWarehouse || selectedIds.size === 0) return;
    const count = selectedIds.size;
    try {
      setBulkDeleting(true);
      toast.loading(`Deleting ${count.toLocaleString()} locations...`, { id: 'bulk-del' });
      const ids = Array.from(selectedIds);
      // No bulk endpoint — issue deletes in parallel.
      await Promise.all(ids.map((id) =>
        fetch('/api/warehouse-locations/delete', {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ id }),
        })
      ));
      toast.success(`Deleted ${count.toLocaleString()} locations!`, { id: 'bulk-del' });
      setSelectedIds(new Set());
      fetchLocations(selectedWarehouse.id);
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast.error('Error deleting locations', { id: 'bulk-del' });
    } finally {
      setBulkDeleting(false);
    }
  };

  // WAREHOUSE LIST VIEW
  if (view === 'list') {
    return (
      <>
        <div className="p-8">
          <div className="max-w-[1800px] mx-auto space-y-6">
            {/* Search & Actions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search warehouses..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchWarehouses} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors" title="Refresh">
                  <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setEditWarehouse(null); setDrawerOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm">
                  <Plus className="w-4 h-4" />Add Warehouse
                </motion.button>
              </div>
            </div>

            {/* Warehouses Grid */}
            {warehouses.length === 0 && !loading ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-12 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Warehouse className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">No Warehouses Yet</h3>
                <p className="text-xs text-slate-500 mb-4">Create your first warehouse to start managing locations and inventory.</p>
                <button onClick={() => { setEditWarehouse(null); setDrawerOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 text-sm">
                  <Plus className="w-4 h-4 inline mr-2" />Add Warehouse
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehouses.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.code?.toLowerCase().includes(search.toLowerCase())).map((wh, i) => (
                  <motion.div key={wh.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{wh.name}</h3>
                            <span className="text-indigo-200 text-xs font-mono">{wh.code}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${wh.status === 'Active' ? 'bg-green-400/20 text-green-100' : 'bg-slate-400/20 text-slate-200'}`}>
                            {wh.status || 'Active'}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${wh.warehouseType === '3PL' ? 'bg-amber-400/20 text-amber-100' : 'bg-white/15 text-white/90'}`}>
                            {wh.warehouseType === '3PL' ? '3PL' : 'Internal'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      {wh.address && <p className="text-xs text-slate-600 mb-2 flex items-start gap-1.5"><MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />{wh.address}{wh.city ? `, ${wh.city}` : ''}{wh.state ? `, ${wh.state}` : ''} {wh.zip}</p>}

                      {/* Primary Stats Row */}
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                          <div className="text-sm font-bold text-slate-900">{wh.totalArea ? `${(wh.totalArea / 1000).toFixed(0)}K` : '—'}</div>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Sq. Ft.</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                          <div className="text-sm font-bold text-slate-900">{wh.totalLocations || 0}</div>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Locations</div>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-100">
                          <div className="text-sm font-bold text-emerald-700">{(wh.totalValue || 0) > 0 ? ((wh.totalValue || 0) >= 1000 ? `$${((wh.totalValue || 0) / 1000).toFixed(1)}K` : `$${Math.round(wh.totalValue || 0).toLocaleString()}`) : '$0'}</div>
                          <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Value</div>
                        </div>
                      </div>

                      {/* Secondary Stats Row */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                          <div className="text-xs font-bold text-blue-700">{wh.openPalletLocations || 0}</div>
                          <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Open Pallets</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-100">
                          <div className="text-xs font-bold text-purple-700">{wh.totalBinLocations || 0}</div>
                          <div className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide">Bin Locs</div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-2 text-center border border-indigo-100">
                          <div className="text-xs font-bold text-indigo-700">{wh.totalProducts || 0}</div>
                          <div className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide">Products</div>
                        </div>
                      </div>

                      {wh.manager && <div className="text-xs text-slate-500 mb-2">Manager: <span className="font-semibold text-slate-700">{wh.manager}</span></div>}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => openWarehouseDetail(wh)} className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                          <Eye className="w-3.5 h-3.5" />Manage
                        </button>
                        <button onClick={() => { setEditWarehouse(wh); setDrawerOpen(true); }} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50">
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <button onClick={() => handleDeleteWarehouse(wh.id)} className="p-2 border border-red-200 rounded-xl hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        <AddWarehouseDrawer isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setEditWarehouse(null); }} onSave={handleSaveWarehouse} editData={editWarehouse} />
      </>
    );
  }

  // WAREHOUSE DETAIL / LOCATIONS VIEW
  return (
    <>
      <div className="p-6">
        <div className="max-w-[1800px] mx-auto space-y-4">
          {/* Back + Warehouse Info Header */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button onClick={() => { setView('list'); setSelectedWarehouse(null); setLocations([]); fetchWarehouses(); }} className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Warehouse className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{selectedWarehouse?.name}</h2>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${selectedWarehouse?.warehouseType === '3PL' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                      {selectedWarehouse?.warehouseType === '3PL' ? '3PL' : 'Internal'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-mono">{selectedWarehouse?.code} &middot; {selectedWarehouse?.city}{selectedWarehouse?.state ? `, ${selectedWarehouse.state}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setGeneratorOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm hover:shadow-lg">
                  <Grid3X3 className="w-4 h-4" />Generate Locations
                </button>
                <button onClick={() => { setSelectedLocations(filteredLocations); setBarcodeModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 font-semibold rounded-xl text-sm hover:bg-amber-100">
                  <Barcode className="w-4 h-4" />Print Barcodes
                </button>
              </div>
            </div>

            {/* Location stats */}
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Total', count: locations.length, color: 'bg-blue-50 text-blue-700' },
                { label: 'Zones', count: locations.filter(l => l.type === 'zone').length, color: 'bg-indigo-50 text-indigo-700' },
                { label: 'Bins', count: locations.filter(l => l.type === 'bin').length, color: 'bg-purple-50 text-purple-700' },
                { label: 'Active', count: locations.filter(l => l.status === 'Active').length, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Occupied', count: locations.filter(l => (l.occupied || 0) > 0).length, color: 'bg-amber-50 text-amber-700' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                  <div className="text-xl font-bold">{s.count}</div>
                  <div className="text-xs font-medium opacity-70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Search & Filters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search locations or barcodes..." value={locationSearch} onChange={e => setLocationSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => selectedWarehouse && fetchLocations(selectedWarehouse.id)} className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </motion.button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Filter className="w-4 h-4" />Filters
                {activeFilterCount > 0 && <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>}
              </div>
              <WMSFilterDropdown label="Type" value={typeFilter} options={['All Types', 'Zone', 'Aisle', 'Rack', 'Shelf', 'Pallet', 'Bin']} onChange={setTypeFilter} />
              <WMSFilterDropdown label="Status" value={statusFilter} options={['All Status', 'Active', 'Inactive', 'Full', 'Reserved']} onChange={setStatusFilter} />
              {activeFilterCount > 0 && (
                <button onClick={() => { setTypeFilter('All Types'); setStatusFilter('All Status'); }} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100">
                  <X className="w-3.5 h-3.5" />Clear
                </button>
              )}
            </div>
          </div>

          {/* Locations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="w-12 px-4 py-4">
                      <button onClick={toggleSelectAll} className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all hover:border-indigo-400" style={{ borderColor: allVisibleSelected || someVisibleSelected ? '#6366f1' : '#cbd5e1', backgroundColor: allVisibleSelected ? '#6366f1' : someVisibleSelected ? '#eef2ff' : 'transparent' }}>
                        {allVisibleSelected ? <Check className="w-3 h-3 text-white" /> : someVisibleSelected ? <Minus className="w-3 h-3 text-indigo-600" /> : null}
                      </button>
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Barcode</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Zone</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Aisle/Rack</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLocations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No Locations</h3>
                        <p className="text-sm text-slate-500">Use "Generate Locations" to auto-create your warehouse layout.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLocations.slice(0, 50).map((loc, i) => (
                      <motion.tr key={loc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }} className={`transition-colors ${selectedIds.has(loc.id) ? 'bg-indigo-50/60' : 'hover:bg-slate-50/50'}`}>
                        <td className="w-12 px-4 py-4">
                          <button onClick={() => toggleSelect(loc.id)} className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all hover:border-indigo-400" style={{ borderColor: selectedIds.has(loc.id) ? '#6366f1' : '#cbd5e1', backgroundColor: selectedIds.has(loc.id) ? '#6366f1' : 'transparent' }}>
                            {selectedIds.has(loc.id) && <Check className="w-3 h-3 text-white" />}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${loc.type === 'zone' ? 'bg-indigo-100' : loc.type === 'bin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                              {loc.type === 'zone' ? <Layers className="w-4 h-4 text-indigo-600" /> : loc.type === 'bin' ? <Box className="w-4 h-4 text-purple-600" /> : <MapPin className="w-4 h-4 text-blue-600" />}
                            </div>
                            <span className="text-sm font-medium text-slate-900 font-mono">{loc.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-mono">{loc.barcode}</code>
                            <button onClick={() => { navigator.clipboard.writeText(loc.barcode); toast.success('Barcode copied!'); }} className="p-1 hover:bg-slate-100 rounded">
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                            loc.type === 'zone' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                            loc.type === 'bin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            loc.type === 'rack' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>{loc.type}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 font-mono">{loc.zone || '—'}</td>
                        <td className="px-4 py-4 text-sm text-slate-600 font-mono">{loc.aisle ? `${loc.aisle}/${loc.rack || ''}` : '—'}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                            loc.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                            loc.status === 'Full' ? 'bg-red-100 text-red-700 border-red-200' :
                            loc.status === 'Reserved' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>{loc.status}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setSelectedLocations([loc]); setBarcodeModalOpen(true); }} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Print Barcode">
                              <Barcode className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteLocation(loc)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredLocations.length > 50 && (
              <div className="px-6 py-4 border-t border-slate-200 text-sm text-slate-600">
                Showing 50 of {filteredLocations.length} locations. Use filters to narrow results.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 border border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold">{selectedIds.size.toLocaleString()}</span>
                  <span className="text-sm text-slate-300 ml-1">location{selectedIds.size > 1 ? 's' : ''} selected</span>
                  {filteredLocations.length > selectedIds.size && (
                    <button onClick={() => setSelectedIds(new Set(visibleIds))} className="text-xs text-indigo-400 hover:text-indigo-300 ml-2 font-semibold underline underline-offset-2">
                      Select all {filteredLocations.length.toLocaleString()}
                    </button>
                  )}
                </div>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <button
                onClick={() => setBulkDeleteModalOpen(true)}
                disabled={bulkDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {bulkDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddWarehouseDrawer isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setEditWarehouse(null); }} onSave={handleSaveWarehouse} editData={editWarehouse} />
      <LocationGeneratorModal isOpen={generatorOpen} onClose={() => setGeneratorOpen(false)} warehouse={selectedWarehouse} onGenerate={handleGenerateLocations} />
      <BarcodePrintModal isOpen={barcodeModalOpen} onClose={() => setBarcodeModalOpen(false)} locations={selectedLocations} />
      <DeleteConfirmModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={async () => {
          await handleBulkDelete();
          setBulkDeleteModalOpen(false);
        }}
        title={`Delete ${selectedIds.size.toLocaleString()} Location${selectedIds.size > 1 ? 's' : ''}`}
        message={`Are you sure you want to delete ${selectedIds.size.toLocaleString()} selected location${selectedIds.size > 1 ? 's' : ''} from ${selectedWarehouse?.name || 'this warehouse'}?`}
        confirmLabel={`Delete ${selectedIds.size.toLocaleString()} Location${selectedIds.size > 1 ? 's' : ''}`}
        isDeleting={bulkDeleting}
      />
    </>
  );
}