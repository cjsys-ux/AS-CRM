import { motion, AnimatePresence } from 'motion/react';
import { Truck, Search, RefreshCw, Filter, ChevronDown, X, Eye, Trash2, CheckCircle2, Clock, Package, Printer, FileText, Tag, MapPin, Box, ArrowRight, User, ChevronRight, Plus, Minus, Copy, ExternalLink, Weight, Ruler, Scale, Hash, MoreVertical, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };

interface ShipItem { sku: string; name: string; quantity: number; weight?: number; image?: string; }

interface PackageBox {
  id: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  items: { sku: string; name: string; quantity: number }[];
}

interface ShipRecord {
  id: string;
  pickListId?: string;
  orderNumber: string;
  customer: string;
  status: 'Picked' | 'Awaiting Pack' | 'Packing' | 'Packed' | 'Label Printed' | 'Shipped' | 'Delivered';
  carrier?: string;
  service?: string;
  trackingNumber?: string;
  shipTo: { name: string; address: string; city: string; state: string; zip: string; country: string; };
  shipFrom: { name: string; address: string; city: string; state: string; zip: string; country: string; };
  items: ShipItem[];
  weight?: number;
  dimensions?: string;
  packages?: number;
  shippedAt?: string;
  createdAt: string;
  boxes?: PackageBox[];
}

const STATUS_COLORS: Record<string, string> = {
  'Picked': 'bg-orange-100 text-orange-700 border-orange-200',
  'Awaiting Pack': 'bg-slate-100 text-slate-700 border-slate-200',
  'Packing': 'bg-amber-100 text-amber-700 border-amber-200',
  'Packed': 'bg-blue-100 text-blue-700 border-blue-200',
  'Label Printed': 'bg-purple-100 text-purple-700 border-purple-200',
  'Shipped': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Delivered': 'bg-green-100 text-green-700 border-green-200',
};

const CARRIERS = [
  { value: 'UPS', label: 'UPS', services: ['Ground', 'Next Day Air', '2nd Day Air', '3 Day Select', 'Ground Saver'] },
  { value: 'FedEx', label: 'FedEx', services: ['Ground', 'Express Saver', '2Day', 'Priority Overnight', 'Standard Overnight', 'Home Delivery'] },
  { value: 'USPS', label: 'USPS', services: ['Priority Mail', 'Priority Mail Express', 'First-Class', 'Ground Advantage', 'Media Mail'] },
  { value: 'DHL', label: 'DHL', services: ['Express Worldwide', 'Express 12:00', 'Economy Select'] },
  { value: 'Other', label: 'Other', services: ['Standard', 'Express', 'Freight', 'LTL'] },
];

const BOX_PRESETS = [
  { label: 'Small Box', l: 8, w: 6, h: 4 },
  { label: 'Medium Box', l: 12, w: 10, h: 6 },
  { label: 'Large Box', l: 18, w: 14, h: 10 },
  { label: 'Flat Rate Envelope', l: 12.5, w: 9.5, h: 0.75 },
  { label: 'Flat Rate Sm Box', l: 8.625, w: 5.375, h: 1.625 },
  { label: 'Flat Rate Med Box', l: 11.25, w: 8.75, h: 6 },
  { label: 'Poly Mailer', l: 14.5, w: 19, h: 0.5 },
  { label: 'Custom', l: 0, w: 0, h: 0 },
];

// Shipping Label Print
function printShippingLabel(record: ShipRecord) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`
    <html><head><title>Shipping Label - ${record.orderNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      .label { border: 3px solid #000; width: 4in; padding: 16px; margin: auto; }
      .header { text-align: center; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
      .section { margin-bottom: 12px; }
      .section-title { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 4px; }
      .address { font-size: 14px; line-height: 1.4; }
      .ship-to { font-size: 18px; font-weight: bold; line-height: 1.4; }
      .barcode { text-align: center; font-family: monospace; font-size: 14px; letter-spacing: 4px; border-top: 2px solid #000; padding-top: 8px; margin-top: 12px; }
      .tracking { text-align: center; font-family: monospace; font-size: 12px; margin-top: 4px; }
      .meta { display: flex; justify-content: space-between; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px; font-size: 11px; }
      @media print { body { margin: 0; } }
    </style></head><body>
    <div class="label">
      <div class="header">${record.carrier || 'CARRIER'} ${record.service || ''}</div>
      <div class="section">
        <div class="section-title">FROM</div>
        <div class="address">${record.shipFrom.name}<br/>${record.shipFrom.address}<br/>${record.shipFrom.city}, ${record.shipFrom.state} ${record.shipFrom.zip}</div>
      </div>
      <div class="section" style="border: 2px solid #000; padding: 12px; background: #f9f9f9;">
        <div class="section-title">SHIP TO</div>
        <div class="ship-to">${record.shipTo.name}<br/>${record.shipTo.address}<br/>${record.shipTo.city}, ${record.shipTo.state} ${record.shipTo.zip}</div>
      </div>
      <div class="meta">
        <span>Order: ${record.orderNumber}</span>
        <span>Pkgs: ${record.packages || 1}</span>
        <span>Wt: ${record.weight || '—'} lbs</span>
      </div>
      <div class="barcode">||||| |||| | ||| |||| |||||</div>
      <div class="tracking">${record.trackingNumber || 'TRACKING PENDING'}</div>
    </div>
    <script>window.onload=function(){window.print();}</script>
    </body></html>
  `);
  w.document.close();
}

// Packing List Print
function printPackingList(record: ShipRecord) {
  const w = window.open('', '_blank');
  if (!w) return;
  const itemRows = record.items.map((item, i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i + 1}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:monospace;">${item.sku}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.weight ? item.weight + ' lbs' : '—'}</td>
    </tr>
  `).join('');
  const totalQty = record.items.reduce((s, i) => s + i.quantity, 0);
  w.document.write(`
    <html><head><title>Packing List - ${record.orderNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      h1 { font-size: 24px; margin: 0 0 4px; }
      .subtitle { color: #666; font-size: 14px; margin-bottom: 20px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
      .info-box { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
      .info-title { font-size: 10px; text-transform: uppercase; color: #999; font-weight: bold; margin-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; padding: 10px 8px; background: #f5f5f5; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #666; }
      .total-row { font-weight: bold; background: #f9f9f9; }
      .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
      @media print { body { margin: 0; padding: 10px; } }
    </style></head><body>
    <h1>PACKING LIST</h1>
    <div class="subtitle">Order: ${record.orderNumber} &bull; Date: ${new Date().toLocaleDateString()}</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-title">Ship From</div>
        <div>${record.shipFrom.name}<br/>${record.shipFrom.address}<br/>${record.shipFrom.city}, ${record.shipFrom.state} ${record.shipFrom.zip}</div>
      </div>
      <div class="info-box">
        <div class="info-title">Ship To</div>
        <div><strong>${record.shipTo.name}</strong><br/>${record.shipTo.address}<br/>${record.shipTo.city}, ${record.shipTo.state} ${record.shipTo.zip}</div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>SKU</th><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:center;">Weight</th></tr></thead>
      <tbody>${itemRows}
        <tr class="total-row"><td colspan="3" style="padding:10px 8px;">TOTAL</td><td style="padding:10px 8px;text-align:center;">${totalQty}</td><td style="padding:10px 8px;text-align:center;">${record.weight ? record.weight + ' lbs' : '—'}</td></tr>
      </tbody>
    </table>
    <div style="margin-top:20px;display:flex;justify-content:space-between;font-size:12px;">
      <span>Carrier: ${record.carrier || 'TBD'}</span>
      <span>Tracking: ${record.trackingNumber || 'Pending'}</span>
      <span>Packages: ${record.packages || 1}</span>
    </div>
    <div class="footer">Generated by ActivateSwag Command Center WMS</div>
    <script>window.onload=function(){window.print();}</script>
    </body></html>
  `);
  w.document.close();
}

// ─── Shipment Detail Panel (Veeqo-style) ───────────────────────────────────────
function ShipmentDetailPanel({ record, onClose, onUpdate, onStatusChange, customBoxPresets, onSaveCustomPreset, onDeleteCustomPreset }: {
  record: ShipRecord;
  onClose: () => void;
  onUpdate: (updated: ShipRecord) => void;
  onStatusChange: (record: ShipRecord, status: string) => void;
  customBoxPresets: CustomBoxPreset[];
  onSaveCustomPreset: (preset: CustomBoxPreset) => void;
  onDeleteCustomPreset: (label: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'packages' | 'shipping'>('details');
  const [carrier, setCarrier] = useState(record.carrier || '');
  const [service, setService] = useState(record.service || 'Ground');
  const [trackingNumber, setTrackingNumber] = useState(record.trackingNumber || '');
  const [boxes, setBoxes] = useState<PackageBox[]>(record.boxes || [{
    id: 'BOX-1',
    length: 0, width: 0, height: 0, weight: 0,
    items: record.items.map(i => ({ sku: i.sku, name: i.name, quantity: i.quantity })),
  }]);
  const [selectedPresets, setSelectedPresets] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState('');
  const [presetDropdownOpen, setPresetDropdownOpen] = useState<number | null>(null);
  const [presetSearch, setPresetSearch] = useState('');
  const [savingCustom, setSavingCustom] = useState<number | null>(null);
  const [customName, setCustomName] = useState('');
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (presetDropdownOpen === null) return;
    const handler = (e: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(e.target as Node)) {
        setPresetDropdownOpen(null);
        setPresetSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [presetDropdownOpen]);

  const availableServices = CARRIERS.find(c => c.value === carrier)?.services || ['Standard'];
  const totalWeight = boxes.reduce((s, b) => s + b.weight, 0);
  const totalBoxes = boxes.length;
  const allItemsPacked = record.items.every(orderItem => {
    const totalPacked = boxes.reduce((s, b) => s + (b.items.find(x => x.sku === orderItem.sku)?.quantity || 0), 0);
    return totalPacked >= orderItem.quantity;
  });

  const handleSave = () => {
    const updated: ShipRecord = {
      ...record,
      carrier,
      service,
      trackingNumber,
      weight: totalWeight,
      packages: totalBoxes,
      boxes,
      dimensions: boxes.map(b => `${b.length}x${b.width}x${b.height}`).join(', '),
    };
    onUpdate(updated);
    toast.success('Shipment details saved');
  };

  const addBox = () => {
    setBoxes(prev => [...prev, {
      id: `BOX-${prev.length + 1}`,
      length: 0, width: 0, height: 0,
      weight: 0, items: [],
    }]);
  };

  const removeBox = (idx: number) => {
    if (boxes.length <= 1) return;
    setBoxes(prev => prev.filter((_, i) => i !== idx));
  };

  const updateBox = (idx: number, field: keyof PackageBox, value: any) => {
    setBoxes(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  };

  const applyPreset = (idx: number, presetLabel: string) => {
    const preset = BOX_PRESETS.find(p => p.label === presetLabel) || customBoxPresets.find(p => p.label === presetLabel);
    if (preset) {
      if (presetLabel === 'Custom') {
        setBoxes(prev => prev.map((b, i) => i === idx ? { ...b, length: 0, width: 0, height: 0, weight: 0 } : b));
      } else {
        setBoxes(prev => prev.map((b, i) => i === idx ? { ...b, length: preset.l, width: preset.w, height: preset.h, weight: 0 } : b));
      }
    }
    setSelectedPresets(prev => ({ ...prev, [idx]: presetLabel }));
    setPresetDropdownOpen(null);
    setPresetSearch('');
    if (presetLabel === 'Custom') {
      setSavingCustom(idx);
    } else {
      setSavingCustom(null);
    }
  };

  const updateBoxItemQty = (boxIdx: number, sku: string, delta: number) => {
    setBoxes(prev => prev.map((b, i) => {
      if (i !== boxIdx) return b;
      const existing = b.items.find(it => it.sku === sku);
      const orderItem = record.items.find(it => it.sku === sku);
      if (!orderItem) return b;
      const packedElsewhere = prev.reduce((sum, ob, oi) => oi === boxIdx ? sum : sum + (ob.items.find(x => x.sku === sku)?.quantity || 0), 0);
      const maxAvailable = orderItem.quantity - packedElsewhere;
      if (existing) {
        const newQty = Math.max(0, Math.min(maxAvailable, existing.quantity + delta));
        if (newQty === 0) {
          return { ...b, items: b.items.filter(it => it.sku !== sku) };
        }
        return { ...b, items: b.items.map(it => it.sku === sku ? { ...it, quantity: newQty } : it) };
      } else if (delta > 0) {
        return { ...b, items: [...b.items, { sku, name: orderItem.name, quantity: Math.min(delta, maxAvailable) }] };
      }
      return b;
    }));
  };

  const packAllInBox = (boxIdx: number) => {
    setBoxes(prev => {
      const otherBoxes = prev.filter((_, i) => i !== boxIdx);
      const newItems = record.items.map(orderItem => {
        const packedElsewhere = otherBoxes.reduce((sum, ob) => sum + (ob.items.find(x => x.sku === orderItem.sku)?.quantity || 0), 0);
        const remaining = orderItem.quantity - packedElsewhere;
        return remaining > 0 ? { sku: orderItem.sku, name: orderItem.name, quantity: remaining } : null;
      }).filter(Boolean) as { sku: string; name: string; quantity: number }[];
      return prev.map((b, i) => i === boxIdx ? { ...b, items: newItems } : b);
    });
  };

  const handleShipOrder = () => {
    if (!carrier) { toast.error('Please select a carrier'); return; }
    if (!service) { toast.error('Please select a service'); return; }
    handleSave();
    onStatusChange(record, 'Shipped');
    onClose();
  };

  const tabs = [
    { key: 'details' as const, label: 'Order Details', icon: FileText },
    { key: 'packages' as const, label: 'Packages', icon: Box },
    { key: 'shipping' as const, label: 'Ship & Track', icon: Truck },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative ml-auto w-full max-w-[720px] bg-white shadow-2xl flex flex-col h-full"
      >
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{record.id}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[record.status]}`}>{record.status}</span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">Order {record.orderNumber} &bull; {record.customer}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all ${activeTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="p-6 space-y-5">
                {/* Addresses */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ship From</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{record.shipFrom.name}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{record.shipFrom.address}<br />{record.shipFrom.city}, {record.shipFrom.state} {record.shipFrom.zip}<br />{record.shipFrom.country}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ship To</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{record.shipTo.name}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{record.shipTo.address}<br />{record.shipTo.city}, {record.shipTo.state} {record.shipTo.zip}<br />{record.shipTo.country}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Items</span>
                    <span className="text-xs text-slate-400">{record.items.length} item{record.items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {record.items.map((item, idx) => (
                      <div key={`${item.sku}-${idx}`} className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-900">x{item.quantity}</p>
                          <p className="text-xs text-slate-400">{item.weight ? `${item.weight} lbs` : '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Total Qty</span>
                    <span className="text-sm font-bold text-slate-900">{record.items.reduce((s, i) => s + i.quantity, 0)} units</span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Created</span>
                    <p className="text-sm font-medium text-slate-700 mt-1">{record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Est. In-Hands</span>
                    <p className="text-sm font-medium text-slate-700 mt-1">{record.createdAt ? new Date(new Date(record.createdAt).getTime() + 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'packages' && (
              <motion.div key="packages" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="p-6 space-y-4">
                {/* Summary bar */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Manage packages</p>
                    <p className="text-xs text-slate-500">Order: {record.orderNumber} &bull; {totalBoxes} package{totalBoxes !== 1 ? 's' : ''}{totalWeight > 0 ? ` • ${totalWeight.toFixed(2)} lbs` : ''}</p>
                  </div>
                  <button
                    onClick={addBox}
                    disabled={allItemsPacked}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      allItemsPacked
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    title={allItemsPacked ? 'All items are packed' : 'Add another box'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Box
                  </button>
                </div>

                {/* Boxes */}
                {boxes.map((box, idx) => (
                  <div key={box.id} className="bg-white rounded-xl border border-slate-200">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold text-slate-900">Box {idx + 1}</span>
                        <span className="text-[10px] font-mono text-slate-400">{box.id}</span>
                      </div>
                      {boxes.length > 1 && (
                        <button onClick={() => removeBox(idx)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Manage Packages – Item Packing */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pack Items</label>
                          {(() => {
                            const totalPacked = box.items.reduce((s, it) => s + it.quantity, 0);
                            const totalOrder = record.items.reduce((s, it) => s + it.quantity, 0);
                            return <span className="text-[11px] font-semibold text-slate-500">Packed ({totalPacked} of {totalOrder})</span>;
                          })()}
                        </div>
                        <div className="space-y-1.5">
                          {record.items.map((orderItem) => {
                            const packedQty = box.items.find(bi => bi.sku === orderItem.sku)?.quantity || 0;
                            return (
                              <div key={orderItem.sku} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {orderItem.image ? (
                                      <img src={orderItem.image} alt={orderItem.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                  <span className="inline-flex items-center justify-center w-7 h-5 bg-green-100 text-green-700 text-[10px] font-bold rounded flex-shrink-0">{orderItem.quantity}</span>
                                  <span className="text-xs text-slate-700 font-medium truncate">{orderItem.name}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 text-right flex-shrink-0 mr-1">
                                  <p>{orderItem.weight ? `${(orderItem.weight * orderItem.quantity).toFixed(1)} lb` : '0 lb 0 oz'}</p>
                                </div>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  <button
                                    onClick={() => updateBoxItemQty(idx, orderItem.sku, -1)}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <div className="w-10 h-7 flex items-center justify-center border border-slate-200 bg-white rounded text-xs font-semibold text-slate-800">
                                    {packedQty}
                                  </div>
                                  <button
                                    onClick={() => updateBoxItemQty(idx, orderItem.sku, 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between mt-2 px-1">
                          <span className="text-[10px] text-slate-400">{record.shipFrom?.name ? `Ship from: ${record.shipFrom.name}` : ''}</span>
                          <button
                            onClick={() => packAllInBox(idx)}
                            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                          >
                            Pack all
                          </button>
                        </div>
                      </div>

                      {/* Box Preset Dropdown */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Box Preset</label>
                        <div className="relative" ref={presetDropdownOpen === idx ? presetDropdownRef : undefined}>
                          <button
                            onClick={() => { setPresetDropdownOpen(presetDropdownOpen === idx ? null : idx); setPresetSearch(''); }}
                            className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <Box className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">
                                {selectedPresets[idx] || (() => {
                                  const allPresets = [...BOX_PRESETS.filter(p => p.label !== 'Custom'), ...customBoxPresets];
                                  const match = allPresets.find(p => p.l === box.length && p.w === box.width && p.h === box.height && box.length > 0);
                                  return match ? match.label : (box.length === 0 && box.width === 0 ? 'Select a box...' : 'Custom');
                                })()}
                              </span>
                              {(() => {
                                const sel = selectedPresets[idx];
                                const allPresets = [...BOX_PRESETS.filter(p => p.label !== 'Custom'), ...customBoxPresets];
                                const match = sel ? allPresets.find(p => p.label === sel) : allPresets.find(p => p.l === box.length && p.w === box.width && p.h === box.height && box.length > 0);
                                return match ? <span className="text-[10px] text-slate-400">({match.l} × {match.w} × {match.h} in)</span> : null;
                              })()}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${presetDropdownOpen === idx ? 'rotate-180' : ''}`} />
                          </button>

                          {presetDropdownOpen === idx && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                              {/* Search */}
                              <div className="p-2 border-b border-slate-100">
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                  <input
                                    type="text"
                                    value={presetSearch}
                                    onChange={e => setPresetSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    autoFocus
                                  />
                                </div>
                              </div>

                              <div className="max-h-60 overflow-y-auto">
                                {/* Standard Presets */}
                                <div className="px-3 py-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Standard Boxes</span>
                                </div>
                                {BOX_PRESETS.filter(p => p.label !== 'Custom').filter(p => p.label.toLowerCase().includes(presetSearch.toLowerCase())).map(p => (
                                  <button
                                    key={p.label}
                                    onClick={() => applyPreset(idx, p.label)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-blue-50 transition-colors ${
                                      box.length === p.l && box.width === p.w && box.height === p.h ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                        box.length === p.l && box.width === p.w && box.height === p.h ? 'border-blue-500' : 'border-slate-300'
                                      }`}>
                                        {box.length === p.l && box.width === p.w && box.height === p.h && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                      </div>
                                      <span className="text-xs font-medium text-slate-800">{p.label}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{p.l} × {p.w} × {p.h} in</span>
                                  </button>
                                ))}

                                {/* Custom Saved Presets */}
                                {customBoxPresets.length > 0 && (
                                  <>
                                    <div className="px-3 py-1.5 mt-1 border-t border-slate-100">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Packages</span>
                                    </div>
                                    {customBoxPresets.filter(p => p.label.toLowerCase().includes(presetSearch.toLowerCase())).map(p => (
                                      <div
                                        key={p.label}
                                        className={`flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 transition-colors ${
                                          box.length === p.l && box.width === p.w && box.height === p.h ? 'bg-blue-50' : ''
                                        }`}
                                      >
                                        <button
                                          onClick={() => applyPreset(idx, p.label)}
                                          className="flex items-center gap-2 flex-1 text-left"
                                        >
                                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                            box.length === p.l && box.width === p.w && box.height === p.h ? 'border-blue-500' : 'border-slate-300'
                                          }`}>
                                            {box.length === p.l && box.width === p.w && box.height === p.h && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                          </div>
                                          <span className="text-xs font-medium text-blue-700">{p.label}</span>
                                          <span className="text-[10px] text-slate-400">({p.l} × {p.w} × {p.h} in)</span>
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); onDeleteCustomPreset(p.label); }}
                                          className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </>
                                )}

                                {/* Custom option */}
                                <div className="border-t border-slate-100">
                                  <button
                                    onClick={() => applyPreset(idx, 'Custom')}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600">Custom dimensions</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Save Custom Preset Form */}
                        {savingCustom === idx && box.length > 0 && box.width > 0 && box.height > 0 && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Save as Custom Preset</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customName}
                                onChange={e => setCustomName(e.target.value)}
                                placeholder="Preset name (required)"
                                className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
                                autoFocus
                              />
                              <button
                                disabled={!customName.trim()}
                                onClick={() => {
                                  if (!customName.trim()) return;
                                  onSaveCustomPreset({ label: customName.trim(), l: box.length, w: box.width, h: box.height });
                                  setSelectedPresets(prev => ({ ...prev, [idx]: customName.trim() }));
                                  setCustomName('');
                                  setSavingCustom(null);
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                  customName.trim()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setSavingCustom(null); setCustomName(''); }}
                                className="px-2 py-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] text-blue-600">Dimensions: {box.length} × {box.width} × {box.height} in</p>
                          </div>
                        )}
                      </div>

                      {/* Dimensions */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Ruler className="w-3 h-3" />
                          Dimensions (inches)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 mb-1 block">Length</span>
                            <input
                              type="number"
                              value={box.length || ''}
                              placeholder="0.00"
                              onChange={e => updateBox(idx, 'length', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                              step="0.25"
                              min="0"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 mb-1 block">Width</span>
                            <input
                              type="number"
                              value={box.width || ''}
                              placeholder="0.00"
                              onChange={e => updateBox(idx, 'width', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                              step="0.25"
                              min="0"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 mb-1 block">Height</span>
                            <input
                              type="number"
                              value={box.height || ''}
                              placeholder="0.00"
                              onChange={e => updateBox(idx, 'height', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                              step="0.25"
                              min="0"
                            />
                          </div>
                        </div>
                        {box.length > 0 && box.width > 0 && box.height > 0 && (
                          <p className="text-[10px] text-slate-400 mt-1.5">Dimensional weight: {((box.length * box.width * box.height) / 139).toFixed(1)} lbs (DIM factor 139)</p>
                        )}
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          Weight (lbs)
                        </label>
                        <input
                          type="number"
                          value={box.weight || ''}
                          placeholder="0.00"
                          onChange={e => updateBox(idx, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                          step="0.1"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Save packages button */}
                <button onClick={handleSave} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20">
                  Save Package Details
                </button>
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div key="shipping" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="p-6 space-y-5">
                {/* Fulfillment Readiness Checklist */}
                {record.status !== 'Shipped' && record.status !== 'Delivered' && (() => {
                  const checks = [
                    { label: 'Carrier selected', done: !!carrier },
                    { label: 'Service level set', done: !!service },
                    { label: 'Package info added', done: totalBoxes > 0 },
                  ];
                  const completed = checks.filter(c => c.done).length;
                  const allDone = completed === checks.length;
                  return (
                    <div className={`rounded-xl border p-4 transition-all ${allDone ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${allDone ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                            {allDone ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <AlertTriangle className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-wider ${allDone ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {allDone ? 'Ready to Ship' : 'Fulfillment Checklist'}
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${allDone ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                          {completed}/{checks.length}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {checks.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${c.done ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              {c.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-xs font-medium ${c.done ? 'text-slate-600 line-through' : 'text-slate-700'}`}>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Carrier Selection */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carrier & Service</span>
                    </div>
                    {carrier && service && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Set
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Carrier</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {CARRIERS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => { setCarrier(c.value); setService(c.services[0]); }}
                          className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                            carrier === c.value
                              ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {carrier && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Service Level</label>
                      <select
                        value={service}
                        onChange={e => setService(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      >
                        {availableServices.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Tracking */}
                {(record.status === 'Shipped' || record.status === 'Delivered') && trackingNumber.trim() && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking Number</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Assigned
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono">
                        {trackingNumber}
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(trackingNumber); toast.success('Tracking number copied'); }}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Shipment Summary */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">Shipment Summary</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Packages</p>
                        <p className="text-sm font-bold text-slate-900">{totalBoxes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Total Weight</p>
                        <p className="text-sm font-bold text-slate-900">{totalWeight.toFixed(2)} lbs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Carrier</p>
                        <p className="text-sm font-bold text-slate-900">{carrier || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Service</p>
                        <p className="text-sm font-bold text-slate-900">{service || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Internal Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add shipping notes (fragile, special handling, etc.)..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none h-20"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {record.status !== 'Shipped' && record.status !== 'Delivered' && (() => {
                    const ready = !!carrier && !!service && totalBoxes > 0;
                    return (
                      <button
                        onClick={handleShipOrder}
                        disabled={!ready}
                        className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          ready
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/20 cursor-pointer'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        {ready ? <Truck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {ready ? 'Confirm Shipment' : 'Complete All Fields to Ship'}
                      </button>
                    );
                  })()}

                  {record.status === 'Shipped' && (
                    <button onClick={() => { onStatusChange(record, 'Delivered'); onClose(); }} className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-bold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Delivered
                    </button>
                  )}
                </div>

                {/* Quick Print Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => printShippingLabel(record)} className="py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Print Label
                  </button>
                  <button onClick={() => printPackingList(record)} className="py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Packing List
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Shipping Tab ──────────────────────────────────────────────────────────
interface CustomBoxPreset { label: string; l: number; w: number; h: number; }

export function WMSShippingTab() {
  const [records, setRecords] = useState<ShipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedRecord, setSelectedRecord] = useState<ShipRecord | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [packingSlipRecord, setPackingSlipRecord] = useState<ShipRecord | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [customBoxPresets, setCustomBoxPresets] = useState<CustomBoxPreset[]>([]);

  // Load custom box presets from KV
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/settings/box-presets`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        });
        if (!res.ok) { console.error('Box presets endpoint returned', res.status); return; }
        const data = await res.json();
        if (data.success && data.presets) {
          setCustomBoxPresets(Array.isArray(data.presets) ? data.presets : []);
        }
      } catch (err) { console.error('Error loading custom box presets (will retry on next load):', err); }
    })();
  }, []);

  const saveCustomBoxPresets = async (presets: CustomBoxPreset[]) => {
    try {
      await fetch(`${API_URL}/settings/box-presets`, {
        method: 'PUT', headers,
        body: JSON.stringify({ presets }),
      });
    } catch (err) { console.error('Error saving custom box presets:', err); toast.error('Failed to save preset'); }
  };

  const saveCustomPreset = async (preset: CustomBoxPreset) => {
    const updated = [...customBoxPresets, preset];
    setCustomBoxPresets(updated);
    await saveCustomBoxPresets(updated);
    toast.success(`Saved custom box preset "${preset.label}"`);
  };

  const deleteCustomPreset = async (label: string) => {
    const updated = customBoxPresets.filter(p => p.label !== label);
    setCustomBoxPresets(updated);
    await saveCustomBoxPresets(updated);
    toast.success(`Deleted custom box preset "${label}"`);
  };

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => { window.removeEventListener('click', close); window.removeEventListener('scroll', close, true); };
  }, [openMenuId]);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const btn = menuBtnRefs.current[id];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 192 });
    }
    setOpenMenuId(id);
  };

  // Load completed pick lists as ship records
  const fetchShipRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/pick-lists`, { headers });
      const data = await res.json();
      if (data.success) {
        // Convert completed/packed/shipped/delivered picks into ship records
        const picks = (data.pickLists || []).filter((p: any) => ['Completed', 'Packed', 'Shipped', 'Delivered'].includes(p.status));
        const shipRecords: ShipRecord[] = picks.map((p: any) => {
          const pickStatusMap: Record<string, ShipRecord['status']> = {
            'Completed': 'Picked',
            'Packed': 'Packed',
            'Shipped': 'Shipped',
            'Delivered': 'Delivered',
          };
          return {
            id: `SHP-${p.id}`,
            pickListId: p.id,
            orderNumber: p.orderNumber,
            customer: p.customer,
            status: pickStatusMap[p.status] || 'Picked',
            carrier: '',
            service: 'Ground',
            trackingNumber: '',
            shipTo: { name: p.customer, address: '123 Customer St', city: 'Miami', state: 'FL', zip: '33101', country: 'US' },
            shipFrom: { name: 'ActivateSwag Warehouse', address: '456 Warehouse Blvd', city: 'Miami', state: 'FL', zip: '33102', country: 'US' },
            items: (p.items || []).map((i: any) => ({ sku: i.sku, name: i.name, quantity: i.quantity, weight: 0.5, image: i.image || i.imageUrl || '' })),
            weight: (p.items || []).length * 0.5,
            packages: 1,
            createdAt: p.createdAt,
          };
        });
        setRecords(shipRecords);
      }
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchShipRecords(); }, [fetchShipRecords]);

  const handleStatusChange = async (record: ShipRecord, newStatus: string) => {
    if (record.pickListId) {
      try {
        await fetch(`${API_URL}/pick-lists/${record.pickListId}`, {
          method: 'PUT', headers,
          body: JSON.stringify({ status: newStatus === 'Shipped' || newStatus === 'Delivered' ? newStatus : 'Packed' })
        });
        toast.success(`Status updated to ${newStatus}`);
        fetchShipRecords();
      } catch { toast.error('Error updating status'); }
    }
  };

  const handleRecordUpdate = (updated: ShipRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    // Also update the selected record if it's the same
    if (selectedRecord?.id === updated.id) {
      setSelectedRecord(updated);
    }
  };

  const filtered = records.filter(r => {
    const matchSearch = r.orderNumber.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All Status' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const picked = records.filter(r => r.status === 'Picked').length;
  const awaitingPack = records.filter(r => r.status === 'Awaiting Pack').length;
  const packed = records.filter(r => r.status === 'Packed' || r.status === 'Label Printed').length;
  const shipped = records.filter(r => r.status === 'Shipped').length;

  return (
    <div className="p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Picked', value: picked, icon: CheckCircle2, color: 'from-orange-500 to-orange-600' },
            { label: 'Awaiting Pack', value: awaitingPack, icon: Package, color: 'from-amber-500 to-amber-600' },
            { label: 'Ready to Ship', value: packed, icon: Tag, color: 'from-blue-500 to-blue-600' },
            { label: 'Shipped', value: shipped, icon: Truck, color: 'from-emerald-500 to-emerald-600' },
            { label: 'Total Shipments', value: records.length, icon: Box, color: 'from-slate-500 to-slate-600' },
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

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Search shipments by ID, order, customer..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500">
              <option>All Status</option>
              <option>Picked</option>
              <option>Awaiting Pack</option>
              <option>Packing</option>
              <option>Packed</option>
              <option>Label Printed</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchShipRecords} className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100">
              <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Table — v432 compact design */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ship ID</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Order</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Product</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Contact</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Carrier</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ship Date</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">In-Hands</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Weight</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pkgs</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={12} className="px-8 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                        <Truck className="w-10 h-10 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No Shipments Ready</h3>
                      <p className="text-sm text-slate-500 max-w-md">Complete pick lists to see shipments here.</p>
                    </div>
                  </td></tr>
                ) : filtered.map((r, i) => {
                  const totalItems = r.items.reduce((s, it) => s + it.quantity, 0);
                  const firstItem = r.items[0];
                  const extraItems = r.items.length - 1;
                  const customerName = r.customer?.replace(/\s*\(.*\)$/, '') || r.customer;
                  const totalWeight = r.weight || r.items.reduce((s, it) => s + (it.weight || 0), 0);
                  const carrierService = [r.carrier, r.service].filter(Boolean).join(' ');
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRecord(r)}
                    >
                      {/* Ship ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[13px] font-semibold text-blue-600 group-hover:underline">{r.id}</span>
                      </td>
                      {/* Order */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[13px] text-slate-600 font-mono">{r.orderNumber}</span>
                      </td>
                      {/* Product */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-50 rounded-md flex items-center justify-center shrink-0 border border-slate-200">
                            <Package className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <span className="text-[13px] font-medium text-slate-900 truncate max-w-[140px]">{firstItem?.name || '—'}</span>
                          {extraItems > 0 && (
                            <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded shrink-0">+{extraItems}</span>
                          )}
                        </div>
                      </td>
                      {/* Customer */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-bold text-white">{customerName?.charAt(0)?.toUpperCase() || '?'}</span>
                          </div>
                          <span className="text-[13px] font-medium text-slate-900">{customerName}</span>
                        </div>
                      </td>
                      {/* Contact */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[13px] text-slate-600">{r.shipTo.name || '—'}</span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{r.status}</span>
                      </td>
                      {/* Carrier */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {carrierService ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Truck className="w-3 h-3" />
                            {carrierService}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not set</span>
                        )}
                      </td>
                      {/* Ship Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[13px] text-slate-600">{r.shippedAt ? new Date(r.shippedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—'}</span>
                      </td>
                      {/* In-Hands */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[13px] text-slate-600">{r.createdAt ? new Date(new Date(r.createdAt).getTime() + 7 * 86400000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—'}</span>
                      </td>
                      {/* Weight */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[13px] font-semibold text-slate-700">{totalWeight ? `${totalWeight.toFixed(2)} lbs` : '—'}</span>
                      </td>
                      {/* Packages */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[12px] text-slate-600">
                          <Box className="w-3 h-3 text-slate-400" />
                          {r.packages || 1}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setSelectedRecord(r)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            ref={el => { menuBtnRefs.current[r.id] = el; }}
                            onClick={(e) => toggleMenu(r.id, e)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {r.status !== 'Shipped' && r.status !== 'Delivered' && (
                            <button onClick={() => handleStatusChange(r, 'Shipped')} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg transition-all shadow-sm">
                              <Truck className="w-3.5 h-3.5" />
                              Ship
                            </button>
                          )}
                          {r.status === 'Shipped' && (
                            <button onClick={() => handleStatusChange(r, 'Delivered')} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Delivered
                            </button>
                          )}
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

      {/* Fixed-position action menu */}
      {openMenuId && (() => {
        const r = records.find(rec => rec.id === openMenuId);
        if (!r) return null;
        return (
          <div className="fixed z-50 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5" style={{ top: menuPos.top, left: menuPos.left }} onClick={e => e.stopPropagation()}>
            {(() => {
              const hasDims = !!(r.dimensions || (r.boxes && r.boxes.length > 0 && r.boxes.some(b => b.length && b.width && b.height)));
              const isShipped = r.status === 'Shipped' || r.status === 'Delivered';
              const canPrint = hasDims && isShipped;
              return (
                <button
                  disabled={!canPrint}
                  title={!isShipped ? 'Order must be shipped first' : !hasDims ? 'Package dimensions must be set first' : 'Print shipping label'}
                  onClick={() => { if (canPrint) { printShippingLabel(r); setOpenMenuId(null); } }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${canPrint ? 'text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                >
                  <Tag className={`w-3.5 h-3.5 ${canPrint ? 'text-cyan-500' : 'text-slate-300'}`} />
                  Print Shipping Label
                </button>
              );
            })()}
            <button onClick={() => { setPackingSlipRecord(r); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Print Packing List
            </button>
            <div className="border-t border-slate-100 my-1" />
            <button onClick={() => { setSelectedRecord(r); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
              <Box className="w-3.5 h-3.5 text-indigo-500" />
              Edit Packages & Weight
            </button>
            <button onClick={() => { setSelectedRecord(r); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
              <Truck className="w-3.5 h-3.5 text-emerald-500" />
              Set Carrier & Service
            </button>
            {r.status !== 'Shipped' && r.status !== 'Delivered' && (
              <>
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => { handleStatusChange(r, 'Shipped'); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                  Mark as Shipped
                </button>
              </>
            )}
            {r.status === 'Shipped' && (
              <>
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => { handleStatusChange(r, 'Delivered'); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Mark as Delivered
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* Veeqo-style Shipment Detail Panel */}
      <AnimatePresence>
        {selectedRecord && (
          <ShipmentDetailPanel
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onUpdate={handleRecordUpdate}
            onStatusChange={handleStatusChange}
            customBoxPresets={customBoxPresets}
            onSaveCustomPreset={saveCustomPreset}
            onDeleteCustomPreset={deleteCustomPreset}
          />
        )}
      </AnimatePresence>

      {/* Packing Slip PDF Preview Modal */}
      <AnimatePresence>
        {packingSlipRecord && (() => {
          const rec = packingSlipRecord;
          const totalQty = rec.items.reduce((s, i) => s + i.quantity, 0);
          const totalWeight = rec.items.reduce((s, i) => s + (i.weight || 0) * i.quantity, 0);
          return (
            <motion.div
              key="packing-slip-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setPackingSlipRecord(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-[640px] max-h-[90vh] flex flex-col overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Packing Slip Preview</h3>
                      <p className="text-xs text-slate-500">Order {rec.orderNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { window.print(); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                    <button
                      onClick={() => setPackingSlipRecord(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Packing Slip Content – sized for 4×6 thermal label */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                  <style>{`
                    @media print {
                      @page { size: 4in 6in; margin: 0; }
                      body * { visibility: hidden !important; }
                      .packing-slip-4x6, .packing-slip-4x6 * { visibility: visible !important; }
                      .packing-slip-4x6 { position: fixed !important; top: 0 !important; left: 0 !important; width: 4in !important; height: 6in !important; margin: 0 !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; overflow: hidden !important; }
                    }
                  `}</style>
                  <div className="packing-slip-4x6 bg-white rounded-xl border border-slate-200 shadow-sm mx-auto flex flex-col" style={{ width: '4in', height: '6in' }}>
                    {/* Company Header Bar */}
                    <div className="bg-slate-800 text-white px-3 py-2 rounded-t-xl flex items-center justify-between">
                      <div>
                        <h2 className="text-[11px] font-bold tracking-wide leading-tight">PACKING SLIP</h2>
                        <p className="text-slate-300 text-[8px] mt-0.5">ActivateSwag Command Center</p>
                      </div>
                      <div className="text-right text-[8px] text-slate-300 leading-tight">
                        <p>Date: {new Date().toLocaleDateString()}</p>
                        <p>Order: {rec.orderNumber}</p>
                      </div>
                    </div>

                    {/* Ship From / Ship To */}
                    <div className="grid grid-cols-2 gap-2 px-3 py-2 border-b border-slate-100">
                      <div>
                        <p className="text-[7px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Ship From</p>
                        <p className="text-[9px] font-semibold text-slate-800 leading-tight">{rec.shipFrom.name}</p>
                        <p className="text-[8px] text-slate-500 leading-tight">{rec.shipFrom.address}<br />{rec.shipFrom.city}, {rec.shipFrom.state} {rec.shipFrom.zip}</p>
                      </div>
                      <div className="border-l border-slate-100 pl-2">
                        <p className="text-[7px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Ship To</p>
                        <p className="text-[9px] font-semibold text-slate-800 leading-tight">{rec.shipTo.name}</p>
                        <p className="text-[8px] text-slate-500 leading-tight">{rec.shipTo.address}<br />{rec.shipTo.city}, {rec.shipTo.state} {rec.shipTo.zip}</p>
                      </div>
                    </div>

                    {/* Shipping Info Bar */}
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[8px]">
                      <div className="flex items-center gap-1">
                        <Package className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-slate-500">Pkgs:</span>
                        <span className="font-semibold text-slate-700">{rec.packages || rec.boxes?.length || 1}</span>
                      </div>
                      {rec.trackingNumber && (
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-slate-500">Tracking:</span>
                          <span className="font-mono font-semibold text-slate-700 text-[8px]">{rec.trackingNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Items Table */}
                    <div className="px-3 py-1.5 flex-1 overflow-hidden">
                      <table className="w-full text-[8px]">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-1 text-[7px] uppercase font-bold text-slate-400 tracking-wider w-5">#</th>
                            <th className="text-left py-1 text-[7px] uppercase font-bold text-slate-400 tracking-wider">SKU</th>
                            <th className="text-left py-1 text-[7px] uppercase font-bold text-slate-400 tracking-wider">Description</th>
                            <th className="text-center py-1 text-[7px] uppercase font-bold text-slate-400 tracking-wider">Qty</th>
                            <th className="text-right py-1 text-[7px] uppercase font-bold text-slate-400 tracking-wider">Wt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rec.items.map((item, idx) => (
                            <tr key={idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                              <td className="py-1 text-slate-400 font-mono">{idx + 1}</td>
                              <td className="py-1 font-mono font-semibold text-slate-700">{item.sku}</td>
                              <td className="py-1 text-slate-600 truncate max-w-[120px]">{item.name}</td>
                              <td className="py-1 text-center font-semibold text-slate-800">{item.quantity}</td>
                              <td className="py-1 text-right text-slate-500">{item.weight ? `${(item.weight * item.quantity).toFixed(1)}` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-300 font-bold">
                            <td colSpan={3} className="py-1 text-slate-700">Total</td>
                            <td className="py-1 text-center text-slate-900">{totalQty}</td>
                            <td className="py-1 text-right text-slate-700">{totalWeight > 0 ? `${totalWeight.toFixed(1)}` : '—'}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 px-3 py-1.5 flex items-center justify-between bg-slate-50 rounded-b-xl">
                      <p className="text-[7px] text-slate-400">ActivateSwag Command Center</p>
                      <p className="text-[7px] text-slate-400 font-mono">{rec.trackingNumber || rec.orderNumber}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
