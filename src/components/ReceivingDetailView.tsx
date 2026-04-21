import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Package, CheckCircle2, Clock, AlertTriangle, Truck, ScanLine,
  Building2, User, FileText, X, ChevronDown, PackageCheck, Camera, XCircle,
  Hash, Edit2, MapPin, Calendar, ClipboardList, AlertCircle, Check,
  RefreshCw, BarChart3, Clipboard, ThumbsUp, ThumbsDown, Eye, Printer,
  Plus, Minus, Box, Tag, Layers, ShieldCheck, CircleDot, RotateCcw
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { getProjectBadgeClasses, getDeepLinkKey, getDeepLinkTarget } from './projectNumberUtils';
import { QuantityStepper } from './QuantityStepper';
import { LocationSearchDropdown } from './LocationSearchDropdown';

const headers = { 'Content-Type': 'application/json' };

interface ReceivingLineItem {
  sku: string;
  name: string;
  expectedQty: number;
  receivedQty: number;
  location?: string;
  imageUrl?: string;
}

interface ReceivingRecord {
  id: string;
  poNumber?: string;
  vendor: string;
  expectedDate: string;
  status: 'Scheduled' | 'In Transit' | 'At Dock' | 'Receiving' | 'QC Check' | 'Completed' | 'Delivered' | 'Issue';
  items: ReceivingLineItem[];
  dock?: string;
  carrier?: string;
  carrierType?: string;
  trackingNumber?: string;
  notes?: string;
  receivedBy?: string;
  receivedAt?: string;
  createdAt: string;
  sourceOrderId?: string;
  sourceOrderType?: 'order' | 'sample-order' | 'purchase-order';
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

const CONDITION_OPTIONS = ['Good', 'Damaged', 'Short', 'Over', 'Wrong Item', 'Mixed'];

interface ItemReceivingState {
  receivedQty: number;
  damagedQty: number;
  condition: string;
  putawayLocation: string;
  lotNumber: string;
  expirationDate: string;
  serialNumbers: string;
  inspectionNotes: string;
  qcPassed: boolean | null;
  scanned: boolean;
}

export function ReceivingDetailView({
  receipt,
  onBack,
  onUpdate,
  onNavigate,
  vendorLogoMap,
  customerLogoMap,
}: {
  receipt: ReceivingRecord;
  onBack: () => void;
  onUpdate: (updated: ReceivingRecord) => void;
  onNavigate?: (page: string) => void;
  vendorLogoMap: Record<string, string>;
  customerLogoMap: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState<'items' | 'details' | 'activity'>('items');
  const [scanMode, setScanMode] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const scanRef = useRef<HTMLInputElement>(null);
  const [localStatus, setLocalStatus] = useState(receipt.status);
  const [itemStates, setItemStates] = useState<ItemReceivingState[]>([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [activityLog, setActivityLog] = useState<{ time: string; action: string; user: string; detail: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [dockAssignment, setDockAssignment] = useState(receipt.dock || '');
  const [receiverName, setReceiverName] = useState(receipt.receivedBy || '');
  const [generalNotes, setGeneralNotes] = useState(receipt.notes || '');
  const [bolNumber, setBolNumber] = useState('');
  const [palletCount, setPalletCount] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [trailerNumber, setTrailerNumber] = useState('');
  const [temperatureCheck, setTemperatureCheck] = useState('');
  const [scanLog, setScanLog] = useState<{ time: string; sku: string; name: string; result: 'success' | 'error'; detail: string }[]>([]);
  const [sourcePOShippingMethod, setSourcePOShippingMethod] = useState('');
  const [sourceShipDate, setSourceShipDate] = useState('');
  const [locationPromptIdx, setLocationPromptIdx] = useState<number | null>(null);
  const [creatingInventory, setCreatingInventory] = useState(false);
  const [warehouseLocations, setWarehouseLocations] = useState<any[]>([]);
  const [warehouseList, setWarehouseList] = useState<any[]>([]);

  // Fetch warehouse locations for the location dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [locRes, whRes] = await Promise.all([
          fetch('/api/warehouse-locations/list'),
          fetch('/api/warehouses/list'),
        ]);
        if (locRes.ok) {
          const locData = await locRes.json();
          setWarehouseLocations(locData.locations || []);
        }
        if (whRes.ok) {
          const whData = await whRes.json();
          setWarehouseList(whData.warehouses || []);
        }
      } catch (e) {
        console.log('[ReceivingDetail] Error fetching warehouse locations:', e);
      }
    };
    fetchLocations();
  }, []);

  // Fetch source order data (shippingMethod fallback + shipDate)
  useEffect(() => {
    const needsCarrierType = !receipt.carrierType;
    if (!needsCarrierType) {
      console.log('[ReceivingDetail] carrierType already set:', receipt.carrierType);
    } else {
      console.log('[ReceivingDetail] carrierType empty, attempting fallback. sourceOrderId:', receipt.sourceOrderId, 'sourceOrderType:', receipt.sourceOrderType, 'poNumber:', receipt.poNumber);
    }
    const fetchSourceOrderData = async () => {
      try {
        let order: any = null;
        // Strategy 1: fetch by sourceOrderId
        if (receipt.sourceOrderId) {
          const endpoint = receipt.sourceOrderType === 'purchase-order'
            ? `/api/purchasing/get?id=${encodeURIComponent(receipt.sourceOrderId)}`
            : `/api/orders/get?id=${encodeURIComponent(receipt.sourceOrderId)}`;
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = await res.json();
            order = data.purchaseOrder || data.order;
          }
        }
        // Strategy 2: search all POs by poNumber
        if ((!order || !order.shippingMethod || order.shippingMethod === 'Not Set') && receipt.poNumber) {
          const res = await fetch('/api/purchasing/list');
          if (res.ok) {
            const data = await res.json();
            const list = data.purchaseOrders || data.orders || [];
            const match = list.find((po: any) => po.poNumber === receipt.poNumber);
            if (match) {
              if (!order?.shipDate && match.shipDate) order = { ...order, ...match };
              if (match.shippingMethod && match.shippingMethod !== 'Not Set') {
                order = match;
              }
            }
          }
        }
        // Strategy 3: search orders list
        if ((!order || !order.shippingMethod || order.shippingMethod === 'Not Set') && receipt.sourceOrderId) {
          const res = await fetch('/api/orders/list');
          if (res.ok) {
            const data = await res.json();
            if (data.orders) {
              const match = data.orders.find((o: any) => o.id === receipt.sourceOrderId);
              if (match) {
                if (!order?.shipDate && match.shipDate) order = { ...order, ...match };
                if (match.shippingMethod && match.shippingMethod !== 'Not Set') {
                  order = match;
                }
              }
            }
          }
        }
        // Extract ship date from source order
        if (order?.shipDate) {
          setSourceShipDate(order.shipDate);
        }
        if (needsCarrierType && order?.shippingMethod && order.shippingMethod !== 'Not Set') {
          console.log('[ReceivingDetail] SUCCESS — shippingMethod:', order.shippingMethod);
          setSourcePOShippingMethod(order.shippingMethod);
          // Persist back so it sticks on future loads
          try {
            await fetch('/api/receiving/update', {
              method: 'PATCH',
              headers,
              body: JSON.stringify({ id: receipt.id, carrierType: order.shippingMethod }),
            });
          } catch (e) { console.log('[ReceivingDetail] Failed to persist carrierType backfill:', e); }
        } else if (needsCarrierType) {
          console.log('[ReceivingDetail] No shippingMethod found. order:', order ? `keys=${Object.keys(order).join(',')}` : 'null');
        }
      } catch (e) { console.log('[ReceivingDetail] Failed to fetch source order data:', e); }
    };
    fetchSourceOrderData();
  }, [receipt.carrierType, receipt.sourceOrderId, receipt.poNumber]);

  // Initialize item states
  useEffect(() => {
    setItemStates(receipt.items.map(item => ({
      receivedQty: item.receivedQty,
      damagedQty: 0,
      condition: 'Good',
      putawayLocation: item.location || '',
      lotNumber: '',
      expirationDate: '',
      serialNumbers: '',
      inspectionNotes: '',
      qcPassed: null,
      scanned: item.receivedQty > 0,
    })));

    // Seed activity log
    setActivityLog([
      { time: receipt.createdAt, action: 'Receipt Created', user: 'System', detail: `Inbound receipt ${receipt.id} created` },
      ...(receipt.status !== 'Scheduled' ? [{ time: new Date().toISOString(), action: 'Status Changed', user: 'System', detail: `Status set to ${receipt.status}` }] : []),
    ]);
  }, [receipt]);

  // Focus scanner when scan mode activates
  useEffect(() => {
    if (scanMode) setTimeout(() => scanRef.current?.focus(), 200);
  }, [scanMode]);

  const totalExpected = receipt.items.reduce((s, it) => s + it.expectedQty, 0);
  const rawReceived = itemStates.reduce((s, it) => s + it.receivedQty, 0);
  // If status is Delivered/Completed, treat as fully received for progress display
  const totalReceived = (receipt.status === 'Delivered' || receipt.status === 'Completed') ? Math.max(rawReceived, totalExpected) : rawReceived;
  const totalDamaged = itemStates.reduce((s, it) => s + it.damagedQty, 0);
  const progress = totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0;
  const itemsScanned = itemStates.filter(it => it.scanned).length;
  const allQcDone = itemStates.every(it => it.qcPassed !== null);

  const handleScan = () => {
    if (!scanInput.trim()) return;
    const idx = receipt.items.findIndex(i => i.sku.toLowerCase() === scanInput.trim().toLowerCase());
    if (idx >= 0) {
      // Require location before allowing receive
      if (!itemStates[idx]?.putawayLocation) {
        toast.error(`Set a putaway location for "${receipt.items[idx].name}" before receiving`);
        setExpandedItem(idx);
        setLocationPromptIdx(idx);
        setScanLog(prev => [{ time: new Date().toISOString(), sku: receipt.items[idx].sku, name: receipt.items[idx].name, result: 'error', detail: 'Location required' }, ...prev]);
        setScanInput('');
        scanRef.current?.focus();
        return;
      }
      const updated = [...itemStates];
      const newQty = Math.min(updated[idx].receivedQty + 1, receipt.items[idx].expectedQty);
      updated[idx] = { ...updated[idx], receivedQty: newQty, scanned: true };
      setItemStates(updated);
      setExpandedItem(idx);
      addActivity(`Scanned SKU: ${receipt.items[idx].sku}`, `Received ${newQty}/${receipt.items[idx].expectedQty}`);
      toast.success(`✓ ${receipt.items[idx].name} — ${newQty}/${receipt.items[idx].expectedQty}`);
      setScanLog(prev => [{ time: new Date().toISOString(), sku: receipt.items[idx].sku, name: receipt.items[idx].name, result: 'success', detail: `Received ${newQty}/${receipt.items[idx].expectedQty}` }, ...prev]);
    } else {
      toast.error(`SKU "${scanInput}" not found in this receipt`);
      addActivity('Scan Failed', `Unknown SKU: ${scanInput}`);
      setScanLog(prev => [{ time: new Date().toISOString(), sku: scanInput, name: 'Unknown', result: 'error', detail: 'SKU not found' }, ...prev]);
    }
    setScanInput('');
    scanRef.current?.focus();
  };

  const handleManualReceive = (idx: number, qty: number) => {
    // Allow decrementing without location
    if (qty > (itemStates[idx]?.receivedQty ?? 0) && !itemStates[idx]?.putawayLocation) {
      toast.error(`Set a putaway location for "${receipt.items[idx].name}" before receiving`);
      setExpandedItem(idx);
      setLocationPromptIdx(idx);
      return;
    }
    const updated = [...itemStates];
    const newQty = Math.max(0, Math.min(qty, receipt.items[idx].expectedQty));
    updated[idx] = { ...updated[idx], receivedQty: newQty, scanned: newQty > 0 };
    setItemStates(updated);
    addActivity('Manual Receive', `${receipt.items[idx].name}: set to ${newQty}/${receipt.items[idx].expectedQty}`);
  };

  const handleQcCheck = (idx: number, passed: boolean) => {
    const updated = [...itemStates];
    updated[idx] = { ...updated[idx], qcPassed: passed };
    setItemStates(updated);
    addActivity('QC Check', `${receipt.items[idx].name}: ${passed ? 'PASSED' : 'FAILED'}`);
  };

  const updateItemField = (idx: number, field: keyof ItemReceivingState, value: any) => {
    const updated = [...itemStates];
    updated[idx] = { ...updated[idx], [field]: value };
    setItemStates(updated);
  };

  const addActivity = (action: string, detail: string) => {
    setActivityLog(prev => [{ time: new Date().toISOString(), action, user: receiverName || 'User', detail }, ...prev]);
  };

  const handleStatusChange = (newStatus: string) => {
    setLocalStatus(newStatus as any);
    addActivity('Status Change', `Updated to ${newStatus}`);
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      const updatedReceipt: ReceivingRecord = {
        ...receipt,
        status: localStatus,
        dock: dockAssignment,
        receivedBy: receiverName,
        notes: generalNotes,
        items: receipt.items.map((item, i) => ({
          ...item,
          receivedQty: itemStates[i]?.receivedQty ?? item.receivedQty,
          location: itemStates[i]?.putawayLocation || item.location,
        })),
        receivedAt: progress === 100 ? new Date().toISOString() : receipt.receivedAt,
      };
      const res = await fetch('/api/receiving/update', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id: receipt.id, ...updatedReceipt }),
      });
      if (res.ok) {
        toast.success(localStatus === 'Completed' || localStatus === 'Delivered' ? 'Receiving completed!' : 'Progress saved!');
        onUpdate(updatedReceipt);
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving receiving progress');
    } finally {
      setSaving(false);
    }
  };

  // Check if inventory was already created for this receipt
  const isInventoryAlreadyCreated = !!(receipt as any).inventoryCreated;
  const isAlreadyDelivered = receipt.status === 'Delivered' || receipt.status === 'Completed';

  const handleCompleteReceiving = async () => {
    // Guard: prevent duplicate inventory creation
    if (isInventoryAlreadyCreated) {
      toast.error('Inventory has already been created for this receipt. Cannot complete again.');
      return;
    }
    if (totalReceived === 0) {
      toast.error('Cannot complete — no items have been received yet');
      return;
    }
    // Validate: every received item must have a putaway location
    const missingLocations = receipt.items
      .map((item, i) => ({ item, state: itemStates[i] }))
      .filter(({ state }) => state && state.receivedQty > 0 && !state.putawayLocation.trim());
    if (missingLocations.length > 0) {
      const names = missingLocations.map(m => m.item.name).join(', ');
      toast.error(`Putaway location required for: ${names}`);
      // Expand first missing item
      const firstIdx = receipt.items.findIndex((_, i) => itemStates[i]?.receivedQty > 0 && !itemStates[i]?.putawayLocation.trim());
      if (firstIdx >= 0) {
        setExpandedItem(firstIdx);
        setLocationPromptIdx(firstIdx);
      }
      return;
    }

    setLocalStatus('Delivered');
    setSaving(true);
    setCreatingInventory(true);
    try {
      const updatedReceipt: ReceivingRecord = {
        ...receipt,
        status: 'Delivered',
        dock: dockAssignment,
        receivedBy: receiverName,
        notes: generalNotes,
        receivedAt: new Date().toISOString(),
        inventoryCreated: true, // Flag to prevent duplicates
        items: receipt.items.map((item, i) => ({
          ...item,
          receivedQty: itemStates[i]?.receivedQty ?? item.receivedQty,
          location: itemStates[i]?.putawayLocation || item.location,
        })),
      } as any;
      // Save receiving record (with inventoryCreated flag)
      const res = await fetch('/api/receiving/update', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id: receipt.id, ...updatedReceipt }),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        toast.error(result.error || 'Failed to save receiving');
        return;
      }

      // Also check server-side: look for existing inventory items from this receipt
      let existingInventoryCount = 0;
      try {
        const invCheckRes = await fetch('/api/inventory/list');
        if (invCheckRes.ok) {
          const invCheckData = await invCheckRes.json();
          existingInventoryCount = (invCheckData.items || []).filter(
            (inv: any) => inv.notes && inv.notes.includes(`from receiving ${receipt.id}`)
          ).length;
        }
      } catch { /* ignore check error */ }

      if (existingInventoryCount > 0) {
        toast.warning(`Inventory items already exist for this receipt (${existingInventoryCount} found). Skipping creation.`);
        onUpdate(updatedReceipt as any);
        addActivity('Complete', `Receiving finalized — inventory already exists (${existingInventoryCount} items)`);
        return;
      }

      // Determine sample category from PO data
      const rcptAny = receipt as any;
      const sampleType = rcptAny.sampleType || '';
      const isSample = rcptAny.isSample || receipt.sourceOrderType === 'sample-order' || receipt.sourceOrderType === 'purchase-order' && rcptAny.isSample;

      // Resolve category based on sample type
      let category = 'Received Goods';
      if (isSample || receipt.sourceOrderType === 'sample-order') {
        if (sampleType === 'competitor' || sampleType === 'Competitor Sample') {
          category = 'Competitor Sample';
        } else if (sampleType === 'pre-production' || sampleType === 'Pre-Production Sample') {
          category = 'Pre-Production Sample';
        } else if (sampleType === 'Factory Sample') {
          category = 'Factory Sample';
        } else if (sampleType === 'Production Sample') {
          category = 'Production Sample';
        } else {
          category = 'Sample';
        }
      }

      // Compute all-in cost: unit cost + allocated shipping + allocated tax
      const totalItemQty = receipt.items.reduce((s, it) => s + (itemStates[receipt.items.indexOf(it)]?.receivedQty || it.expectedQty), 0);
      const poShippingCost = rcptAny.poShippingCost || 0;
      const poTaxRate = rcptAny.poSalesTaxRate || 0;

      // Create inventory items for each received line
      let inventoryCreated = 0;
      for (let i = 0; i < receipt.items.length; i++) {
        const state = itemStates[i];
        if (!state || state.receivedQty <= 0) continue;
        const item = receipt.items[i];
        try {
          // Determine item type based on source order type
          const itemType = isSample ? category : 'Normal';
          const productTags: string[] = [];
          if (isSample) productTags.push(category);
          if (receipt.vendor) productTags.push('Warehouse Supplier');
          if (receipt.customerName) productTags.push('Customer Goods');
          if (state.condition === 'Damaged' || state.damagedQty > 0) productTags.push('Damaged');
          if (receipt.poNumber) productTags.push('PO Received');

          // Calculate all-in cost per unit
          const rawUnitCost = (item as any).unitCost || (item as any).costPerUnit || 0;
          const numericUnitCost = typeof rawUnitCost === 'string' ? parseFloat(rawUnitCost.replace(/[^0-9.-]/g, '')) || 0 : rawUnitCost;
          const lineTotal = numericUnitCost * state.receivedQty;
          const allocatedShipping = totalItemQty > 0 ? (poShippingCost * state.receivedQty / totalItemQty) : 0;
          const taxOnLine = (lineTotal + allocatedShipping) * poTaxRate;
          const allInCostPerUnit = state.receivedQty > 0
            ? (lineTotal + allocatedShipping + taxOnLine) / state.receivedQty
            : numericUnitCost;
          const formattedCostPerUnit = `$${allInCostPerUnit.toFixed(2)}`;
          const formattedShipping = `$${allocatedShipping.toFixed(2)}`;

          const invRes = await fetch('/api/inventory/create', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              name: item.name || item.sku || 'Unknown Item',
              sku: item.sku,
              category,
              quantity: state.receivedQty,
              minStock: 0,
              unit: 'pcs',
              supplier: receipt.vendor || '',
              costPerUnit: formattedCostPerUnit,
              shippingCost: formattedShipping,
              location: state.putawayLocation,
              warehouseId: (() => {
                // Derive warehouseId from putaway location by matching against warehouse locations
                const locLabel = state.putawayLocation || '';
                const matchedLoc = warehouseLocations.find((wl: any) =>
                  locLabel === wl.name || locLabel.endsWith(` › ${wl.name}`) || locLabel.includes(wl.name)
                );
                if (matchedLoc?.warehouseId) return matchedLoc.warehouseId;
                // Fallback: parse warehouse code from prefix (e.g. "MIA › ...")
                const sepIdx = locLabel.indexOf(' › ');
                if (sepIdx > 0) {
                  const prefix = locLabel.substring(0, sepIdx).trim();
                  const matchedWh = warehouseList.find((w: any) => w.code?.toUpperCase() === prefix.toUpperCase() || w.name?.toUpperCase() === prefix.toUpperCase());
                  if (matchedWh) return matchedWh.id;
                }
                return '';
              })(),
              lastRestocked: new Date().toISOString().split('T')[0],
              imageUrl: item.imageUrl || '',
              customer: receipt.customerName || '',
              itemType,
              productTags,
              sourceReceiptId: receipt.id,
              notes: `Auto-created from receiving ${receipt.id}${receipt.poNumber ? ` (PO: ${receipt.poNumber})` : ''}. Condition: ${state.condition}${state.lotNumber ? `, Lot: ${state.lotNumber}` : ''}${state.damagedQty > 0 ? `, Damaged: ${state.damagedQty}` : ''}. Unit cost: $${numericUnitCost.toFixed(2)}, Shipping: ${formattedShipping}, Tax rate: ${(poTaxRate * 100).toFixed(1)}%`,
            }),
          });
          const invResult = await invRes.json();
          if (invResult.success) {
            inventoryCreated++;
          } else {
            console.log(`[Receiving] Failed to create inventory for ${item.sku}:`, invResult.error);
          }
        } catch (e) {
          console.log(`[Receiving] Error creating inventory for ${item.sku}:`, e);
        }
      }

      toast.success(`Receiving completed! ${inventoryCreated} item${inventoryCreated !== 1 ? 's' : ''} added to inventory.`);
      onUpdate(updatedReceipt as any);
      addActivity('Complete', `Receiving finalized — ${inventoryCreated} items created in inventory`);
    } catch {
      toast.error('Error completing receiving');
    } finally {
      setSaving(false);
      setCreatingInventory(false);
    }
  };

  const vendorLogo = vendorLogoMap[(receipt.vendor || '').trim().toLowerCase()];
  const customerLogo = customerLogoMap[(receipt.customerName || '').trim().toLowerCase()];

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return iso; }
  };

  return (
    <div className="p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="p-2.5 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </motion.button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{receipt.id}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${STATUS_COLORS[localStatus] || ''}`}>{localStatus}</span>
                {receipt.projectNumber && (
                  <button
                    onClick={() => { sessionStorage.setItem(getDeepLinkKey(receipt.projectNumber!), receipt.projectNumber!); onNavigate?.(getDeepLinkTarget(receipt.projectNumber!)); }}
                    className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors cursor-pointer ${getProjectBadgeClasses(receipt.projectNumber)}`}
                  >
                    {receipt.projectNumber}
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {receipt.vendor}{receipt.poNumber ? ` · PO: ${receipt.poNumber}` : ''}{receipt.customerName ? ` · Customer: ${receipt.customerName}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setScanMode(true)}
              className="flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all bg-white text-slate-700 border-2 border-slate-200 hover:border-amber-300"
            >
              <ScanLine className="w-4 h-4" />Start Scanning
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProgress}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clipboard className="w-4 h-4" />}Save Progress
            </motion.button>
            {isInventoryAlreadyCreated ? (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 font-semibold rounded-xl border-2 border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />Receiving Completed
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompleteReceiving}
                disabled={saving || totalReceived === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />{creatingInventory ? 'Creating Inventory...' : 'Complete Receiving'}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Expected', value: totalExpected, icon: Package, color: 'from-blue-500 to-blue-600', sub: `${receipt.items.length} SKUs` },
            { label: 'Received', value: totalReceived, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', sub: `${progress.toFixed(0)}% complete` },
            { label: 'Damaged', value: totalDamaged, icon: AlertTriangle, color: 'from-red-500 to-red-600', sub: totalDamaged > 0 ? 'Needs review' : 'None reported' },
            { label: 'Variance', value: totalExpected - totalReceived, icon: BarChart3, color: 'from-purple-500 to-purple-600', sub: totalReceived >= totalExpected ? 'Matched' : 'Outstanding' },
            { label: 'QC Status', value: `${itemStates.filter(i => i.qcPassed === true).length}/${receipt.items.length}`, icon: ShieldCheck, color: 'from-cyan-500 to-cyan-600', sub: allQcDone ? 'All checked' : 'Pending' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
                <div className="text-xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm w-fit">
          {[
            { key: 'items' as const, label: 'Line Items', icon: ClipboardList },
            { key: 'details' as const, label: 'Shipment Details', icon: Truck },
            { key: 'activity' as const, label: 'Activity Log', icon: Clock },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === t.key ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="w-4 h-4" />{t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'items' && (
            <motion.div key="items" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {/* Line Items Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">PO Line Items</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const updated = itemStates.map(state => ({ ...state, receivedQty: 0, scanned: false, qcPassed: null }));
                        setItemStates(updated);
                        addActivity('Reset All', 'Reset all receiving counts');
                        toast.success('All items reset');
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />Reset
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">SKU / Product</th>
                        <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                        <th className="text-center px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Expected</th>
                        <th className="text-center px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Received</th>
                        <th className="text-center px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Damaged</th>
                        <th className="text-center px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Variance</th>
                        <th className="text-center px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Condition</th>
                        <th className="text-center px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">QC</th>
                        <th className="text-center px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {receipt.items.map((item, idx) => {
                        const state = itemStates[idx];
                        if (!state) return null;
                        const variance = state.receivedQty - item.expectedQty;
                        const isComplete = state.receivedQty >= item.expectedQty;
                        const isExpanded = expandedItem === idx;
                        return (
                          <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className={`transition-colors ${isComplete ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                            {/* Collapsed Row */}

                            <td className="px-4 py-4">
                              <button onClick={() => setExpandedItem(isExpanded ? null : idx)} className="text-left group">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{item.name || '—'}</span>
                                  {state.scanned && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                </div>
                                <div className="text-xs font-mono text-slate-500 mt-0.5">SKU: {item.sku}</div>
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              <LocationSearchDropdown
                                value={state.putawayLocation}
                                onChange={(val) => { updateItemField(idx, 'putawayLocation', val); if (locationPromptIdx === idx) setLocationPromptIdx(null); }}
                                locations={warehouseLocations}
                                warehouses={warehouseList}
                                placeholder="Select location…"
                                hasError={locationPromptIdx === idx && !state.putawayLocation}
                                errorMessage="Required before receiving"
                              />
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-semibold text-slate-700">{item.expectedQty}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center">
                                <QuantityStepper
                                  value={state.receivedQty}
                                  onChange={(val) => handleManualReceive(idx, val)}
                                  min={0}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center">
                                <QuantityStepper
                                  value={state.damagedQty}
                                  onChange={(val) => updateItemField(idx, 'damagedQty', val)}
                                  min={0}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`text-sm font-bold ${variance === 0 ? 'text-emerald-600' : variance > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {variance === 0 ? '—' : variance > 0 ? `+${variance}` : variance}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-center">
                                <select
                                  value={state.condition}
                                  onChange={e => updateItemField(idx, 'condition', e.target.value)}
                                  className={`text-xs font-semibold border rounded-lg px-2 py-1.5 focus:outline-none ${state.condition === 'Good' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : state.condition === 'Damaged' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                                >
                                  {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleQcCheck(idx, true)}
                                  className={`p-1.5 rounded-lg border transition-all ${state.qcPassed === true ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300'}`}
                                  title="QC Passed"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleQcCheck(idx, false)}
                                  className={`p-1.5 rounded-lg border transition-all ${state.qcPassed === false ? 'bg-red-100 border-red-300 text-red-700' : 'border-slate-00 text-slate-400 hover:text-red-600 hover:border-red-300'}`}
                                  title="QC Failed"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setExpandedItem(isExpanded ? null : idx)}
                                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                  title="Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Expanded Detail Panel */}
                <AnimatePresence>
                  {expandedItem !== null && itemStates[expandedItem] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-200 bg-slate-50/50 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-900">Detail: {receipt.items[expandedItem].name} ({receipt.items[expandedItem].sku})</h4>
                          <button onClick={() => setExpandedItem(null)} className="p-1 hover:bg-slate-200 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Putaway Location <span className="text-red-500">*</span>
                            </label>
                            <LocationSearchDropdown
                              value={itemStates[expandedItem].putawayLocation}
                              onChange={(val) => { updateItemField(expandedItem, 'putawayLocation', val); if (locationPromptIdx === expandedItem) setLocationPromptIdx(null); }}
                              locations={warehouseLocations}
                              warehouses={warehouseList}
                              placeholder="Select location…"
                              hasError={locationPromptIdx === expandedItem && !itemStates[expandedItem].putawayLocation}
                              errorMessage="Required before items can be received"
                            />
                            {locationPromptIdx === expandedItem && !itemStates[expandedItem].putawayLocation && (
                              <p className="text-xs text-red-500 mt-1">Required before items can be received</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Lot / Batch Number</label>
                            <input
                              value={itemStates[expandedItem].lotNumber}
                              onChange={e => updateItemField(expandedItem, 'lotNumber', e.target.value)}
                              placeholder="Lot #"
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Expiration Date</label>
                            <input
                              type="date"
                              value={itemStates[expandedItem].expirationDate}
                              onChange={e => updateItemField(expandedItem, 'expirationDate', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Serial Numbers</label>
                            <input
                              value={itemStates[expandedItem].serialNumbers}
                              onChange={e => updateItemField(expandedItem, 'serialNumbers', e.target.value)}
                              placeholder="Comma-separated"
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white font-mono"
                            />
                          </div>
                          <div className="col-span-2 md:col-span-4">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Inspection Notes</label>
                            <textarea
                              value={itemStates[expandedItem].inspectionNotes}
                              onChange={e => updateItemField(expandedItem, 'inspectionNotes', e.target.value)}
                              rows={2}
                              placeholder="Note any packaging damage, color discrepancies, labeling issues..."
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipment Information */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Truck className="w-5 h-5 text-amber-600" />Shipment Information</h3>
                  {receipt.sourceOrderType && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${receipt.sourceOrderType === 'purchase-order' ? 'bg-blue-50 text-blue-700 border-blue-200' : receipt.sourceOrderType === 'sample-order' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      <Truck className="w-3 h-3" />
                      {receipt.sourceOrderType === 'purchase-order' ? 'From PO' : receipt.sourceOrderType === 'sample-order' ? 'From Sample' : 'From Order'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Carrier</label>
                    <div className={`px-3 py-2.5 border rounded-lg text-sm font-medium ${receipt.carrier ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-amber-50/50 border-amber-200 text-amber-600 italic'}`}>
                      {receipt.carrier || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Shipping Method</label>
                    <div className={`px-3 py-2.5 border rounded-lg text-sm font-medium ${(receipt.carrierType || sourcePOShippingMethod) ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      {receipt.carrierType || sourcePOShippingMethod || '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tracking Number</label>
                    {receipt.trackingNumber ? (
                      <button
                        onClick={() => { sessionStorage.setItem('shipments_deep_link_tracking', receipt.trackingNumber!); onNavigate?.('shipments'); }}
                        className="w-full text-left px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm font-mono text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center gap-2"
                      >
                        <Package className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{receipt.trackingNumber}</span>
                      </button>
                    ) : (
                      <div className="px-3 py-2.5 bg-amber-50/50 border border-amber-200 rounded-lg text-sm font-mono text-amber-600 italic">Not provided</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Date</label>
                    <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900">{receipt.expectedDate || '—'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Ship Date</label>
                    <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900">{(receipt as any).shipDate || sourceShipDate || '—'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Source</label>
                    {receipt.sourceOrderId ? (
                      <button
                        onClick={() => {
                          if (receipt.sourceOrderType === 'purchase-order') {
                            sessionStorage.setItem('purchasing_deep_link_poId', receipt.sourceOrderId!);
                            onNavigate?.('purchasing');
                          } else {
                            sessionStorage.setItem('orders_deep_link_orderId', receipt.sourceOrderId!);
                            onNavigate?.('orders');
                          }
                        }}
                        className="w-full text-left px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                      >
                        {receipt.sourceOrderType === 'purchase-order' ? 'PO' : 'Order'}: {receipt.sourceOrderId}
                      </button>
                    ) : (
                      <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-400">Manual entry</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">BOL Number</label>
                    <input value={bolNumber} onChange={e => setBolNumber(e.target.value)} placeholder="Bill of Lading #" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Seal Number</label>
                    <input value={sealNumber} onChange={e => setSealNumber(e.target.value)} placeholder="Container seal #" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Trailer Number</label>
                    <input value={trailerNumber} onChange={e => setTrailerNumber(e.target.value)} placeholder="Trailer #" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pallet Count</label>
                    <input value={palletCount} onChange={e => setPalletCount(e.target.value)} placeholder="# pallets" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white" />
                  </div>
                </div>
              </div>

              {/* Receiving Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-5">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-amber-600" />Receiving Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dock Assignment</label>
                    <input value={dockAssignment} onChange={e => setDockAssignment(e.target.value)} placeholder="e.g. Dock A" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Received By</label>
                    <input value={receiverName} onChange={e => setReceiverName(e.target.value)} placeholder="Receiver name" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select
                      value={localStatus}
                      onChange={e => handleStatusChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white font-semibold"
                    >
                      {['Scheduled', 'In Transit', 'At Dock', 'Receiving', 'QC Check', 'Completed', 'Delivered', 'Issue'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Temperature Check</label>
                    <input value={temperatureCheck} onChange={e => setTemperatureCheck(e.target.value)} placeholder="e.g. 72°F — OK" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">General Notes</label>
                    <textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} rows={3} placeholder="Delivery condition, driver notes, appointment reference..." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white resize-none" />
                  </div>
                </div>
              </div>

              {/* Vendor & Customer Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-amber-600" />Vendor</h3>
                <div className="flex items-center gap-3">
                  {vendorLogo ? (
                    <div className="w-12 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 bg-white">
                      <img src={vendorLogo} alt={receipt.vendor} className="max-w-full max-h-full object-contain p-1" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-900">{receipt.vendor}</div>
                    {receipt.poNumber && (
                      <button onClick={() => { sessionStorage.setItem('purchasing_deep_link_poNumber', receipt.poNumber!); onNavigate?.('purchasing'); }} className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3" />PO: {receipt.poNumber}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><User className="w-5 h-5 text-amber-600" />Customer</h3>
                <div className="flex items-center gap-3">
                  {customerLogo ? (
                    <div className="w-12 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 bg-white">
                      <img src={customerLogo} alt={receipt.customerName} className="max-w-full max-h-full object-contain p-1" />
                    </div>
                  ) : receipt.customerName ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  ) : null}
                  <div className="text-sm font-bold text-slate-900">{receipt.customerName || '—'}</div>
                </div>
                {receipt.sourceOrderId && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${receipt.sourceOrderType === 'sample-order' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {receipt.sourceOrderType === 'sample-order' ? 'Sample Order' : 'Order'}: {receipt.sourceOrderId}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-600" />Activity Log</h3>
                {activityLog.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {activityLog.map((log, i) => (
                      <div key={i} className="flex items-start gap-4 py-3 border-b border-slate-100 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900">{log.action}</span>
                            <span className="text-xs text-slate-400">{formatTime(log.time)}</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-0.5">{log.detail}</p>
                          <span className="text-xs text-slate-400 mt-0.5">by {log.user}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanner Modal */}
      <AnimatePresence>
        {scanMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setScanMode(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <ScanLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Barcode Scanner</h2>
                      <p className="text-sm text-slate-500">{receipt.id} &middot; {receipt.vendor}</p>
                    </div>
                  </div>
                  <button onClick={() => setScanMode(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                </div>

                {/* Scanner Input */}
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                      <input
                        ref={scanRef}
                        type="text"
                        value={scanInput}
                        onChange={e => setScanInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleScan()}
                        placeholder="Scan barcode or type SKU and press Enter..."
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-amber-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-lg font-mono bg-white"
                        autoFocus
                      />
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleScan} className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg">
                      Scan
                    </motion.button>
                  </div>
                  {/* Progress */}
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-amber-700 font-medium">Scanned: <strong>{itemsScanned}/{receipt.items.length}</strong> SKUs</span>
                    <span className="text-amber-700 font-medium">Units: <strong>{totalReceived}/{totalExpected}</strong></span>
                    <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${progress}%` }} className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <span className="text-amber-700 font-bold">{progress.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-2">
                    {receipt.items.map((item, idx) => {
                      const state = itemStates[idx];
                      if (!state) return null;
                      const isDone = state.receivedQty >= item.expectedQty;
                      return (
                        <div key={idx} className={`flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all ${isDone ? 'bg-emerald-50 border-emerald-200' : state.scanned ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                              {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Package className="w-5 h-5 text-slate-500" />}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">{item.name}</div>
                            <div className="text-xs text-slate-500 font-mono">SKU: {item.sku}</div>
                            <div className="mt-1.5">
                              <LocationSearchDropdown
                                value={state.putawayLocation}
                                onChange={(val) => updateItemField(idx, 'putawayLocation', val)}
                                locations={warehouseLocations}
                                warehouses={warehouseList}
                                placeholder="Location (required)"
                                compact
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-lg font-bold ${isDone ? 'text-emerald-600' : 'text-slate-900'}`}>{state.receivedQty}/{item.expectedQty}</div>
                          </div>
                          <div className="shrink-0">
                            <QuantityStepper
                              value={state.receivedQty}
                              onChange={(val) => handleManualReceive(idx, val)}
                              min={0}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Scan Log */}
                  {scanLog.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Scan History</h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {scanLog.map((log, i) => (
                          <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${log.result === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {log.result === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                            <span className="font-mono font-bold">{log.sku}</span>
                            <span className="text-slate-500">{log.name}</span>
                            <span className="ml-auto font-medium">{log.detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex gap-3 shrink-0">
                  <button onClick={() => setScanMode(false)} className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">Done Scanning</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}