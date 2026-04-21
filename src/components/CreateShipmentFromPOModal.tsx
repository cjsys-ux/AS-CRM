import { motion, AnimatePresence } from 'motion/react';
import { Truck, X, Package, MapPin, Plus, AlertCircle, Trash2, ChevronDown, ChevronRight, Box, Ruler, Weight, Hash } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Check, Lock } from 'lucide-react';
import { QuantityStepper } from './QuantityStepper';

// ─── Shipment Type Configuration ───
type ShipmentType = 'small-package' | 'ltl' | 'ftl' | 'air-cargo';

const SHIPMENT_TYPES: { id: ShipmentType; label: string; description: string; icon: string }[] = [
  { id: 'small-package', label: 'Small Package', description: 'Individual boxes via parcel carriers', icon: '📦' },
  { id: 'ltl', label: 'LTL', description: 'Less Than Truckload freight', icon: '🚛' },
  { id: 'ftl', label: 'FTL', description: 'Full Truckload freight', icon: '🚚' },
  { id: 'air-cargo', label: 'Air Cargo', description: 'Air freight & express', icon: '✈️' },
];

const CARRIERS_BY_TYPE: Record<ShipmentType, string[]> = {
  'small-package': ['UPS', 'FedEx', 'USPS', 'DHL', 'Other'],
  'ltl': ['XPO Logistics', 'Estes Express', 'Old Dominion', 'SAIA', 'R+L Carriers', 'ABF Freight', 'YRC Freight', 'Other'],
  'ftl': ['J.B. Hunt', 'Schneider', 'Werner', 'Swift', 'Heartland Express', 'Other'],
  'air-cargo': ['DHL Express', 'FedEx Express', 'UPS Air', 'Ceva Logistics', 'DB Schenker', 'Other'],
};

const SHIPPING_METHODS_BY_CARRIER: Record<string, string[]> = {
  'UPS': ['UPS Ground', 'UPS 3 Day Select', 'UPS 2nd Day Air', 'UPS Next Day Air', 'UPS Next Day Air Saver', 'UPS SurePost'],
  'FedEx': ['FedEx Ground', 'FedEx Home Delivery', 'FedEx Express Saver', 'FedEx 2Day', 'FedEx Standard Overnight', 'FedEx Priority Overnight'],
  'USPS': ['USPS Priority Mail', 'USPS Priority Mail Express', 'USPS Ground Advantage', 'USPS First-Class Mail'],
  'DHL': ['DHL Express Worldwide', 'DHL Express 12:00', 'DHL Economy Select'],
  'Other': ['Standard Shipping', 'Expedited Shipping', 'Freight'],
};

interface ShipToAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  contact?: string;
}

interface BoxEntry {
  id: string;
  trackingNumber: string;
  length: string;
  width: string;
  height: string;
  weight: string;
}

interface ShipmentEntry {
  carrier: string;
  trackingNumber: string;
  address: ShipToAddress;
  shipmentType: ShipmentType;
  masterTracking: string;
  boxes: BoxEntry[];
  numberOfCases: string;
  proNumber: string; // For LTL
  bolNumber: string; // For LTL/FTL
  flightNumber: string; // For Air Cargo
  awbNumber: string; // Air Waybill for Air Cargo
  shippingMethod: string;
}

interface CreateShipmentFromPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shipments: any[]) => void;
  poNumber: string;
  shipToAddresses?: ShipToAddress[];
  vendor?: string;
  customer?: string;
  poId?: string;
  lineItems?: any[];
  projectName?: string;
  projectNumber?: string;
  shippingMethod?: string;
  carrierAccount?: string;
  sourceOrderNumber?: string;
}

// ─── Portal Dropdown Component (matching ModernDropdown style) ───
function ShipmentDropdown({
  value,
  onChange,
  options,
  label,
  required,
  icon,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {icon && <span className="inline-flex mr-1.5 align-middle">{icon}</span>}
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all flex items-center justify-between"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>{value || placeholder || 'Select...'}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                zIndex: 99999,
              }}
              className="bg-white border-2 border-slate-200 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="max-h-[280px] overflow-y-auto">
                {options.map((option, index) => (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => { onChange(option); setIsOpen(false); }}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between hover:bg-emerald-50/50 ${
                      index !== options.length - 1 ? 'border-b border-slate-100' : ''
                    } ${value === option ? 'bg-emerald-50' : ''}`}
                  >
                    <span className={`font-medium ${value === option ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {option}
                    </span>
                    {value === option && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
                        <Check className="w-5 h-5 text-emerald-600" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// ─── Main Component ───
export function CreateShipmentFromPOModal({
  isOpen,
  onClose,
  onConfirm,
  poNumber,
  shipToAddresses = [],
  vendor = '',
  customer = '',
  poId = '',
  lineItems = [],
  projectName = '',
  projectNumber = '',
  shippingMethod = '',
  carrierAccount = '',
  sourceOrderNumber = '',
}: CreateShipmentFromPOModalProps) {

  const makeBox = (): BoxEntry => ({
    id: crypto.randomUUID(),
    trackingNumber: '',
    length: '',
    width: '',
    height: '',
    weight: '',
  });

  const makeEntry = (addr: ShipToAddress): ShipmentEntry => ({
    carrier: 'UPS',
    trackingNumber: '',
    address: addr,
    shipmentType: 'small-package',
    masterTracking: '',
    boxes: [],
    numberOfCases: '',
    proNumber: '',
    bolNumber: '',
    flightNumber: '',
    awbNumber: '',
    shippingMethod: '',
  });

  const buildInitialEntries = (): ShipmentEntry[] => {
    if (shipToAddresses.length > 0) {
      return shipToAddresses.map((addr) => makeEntry(addr));
    }
    return [makeEntry({ name: '', address: '', city: '', state: '', zip: '', country: '' })];
  };

  const [entries, setEntries] = useState<ShipmentEntry[]>(buildInitialEntries);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
  const [expandedBoxes, setExpandedBoxes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setEntries(buildInitialEntries());
      setValidationErrors({});
      setExpandedBoxes({});
    }
  }, [isOpen]);

  const updateEntry = (idx: number, updates: Partial<ShipmentEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...updates } : e)));
    setValidationErrors((prev) => { const next = { ...prev }; delete next[idx]; return next; });
  };

  const updateShipmentType = (idx: number, type: ShipmentType) => {
    const carriers = CARRIERS_BY_TYPE[type];
    updateEntry(idx, {
      shipmentType: type,
      carrier: carriers[0],
      // Reset type-specific fields
      boxes: [],
      numberOfCases: '',
      proNumber: '',
      bolNumber: '',
      flightNumber: '',
      awbNumber: '',
      masterTracking: '',
      shippingMethod: '',
    });
  };

  const addBox = (idx: number) => {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, boxes: [...e.boxes, makeBox()] } : e));
  };

  const removeBox = (entryIdx: number, boxId: string) => {
    setEntries((prev) => prev.map((e, i) => i === entryIdx ? { ...e, boxes: e.boxes.filter(b => b.id !== boxId) } : e));
  };

  const updateBox = (entryIdx: number, boxId: string, updates: Partial<BoxEntry>) => {
    setEntries((prev) => prev.map((e, i) =>
      i === entryIdx ? { ...e, boxes: e.boxes.map(b => b.id === boxId ? { ...b, ...updates } : b) } : e
    ));
  };

  const handleSubmit = async () => {
    // Validate
    const errors: Record<number, string[]> = {};
    entries.forEach((e, idx) => {
      const entryErrors: string[] = [];
      if (e.shipmentType === 'small-package') {
        if (e.boxes.length > 0) {
          // Multi-box: need master tracking
          if (!e.masterTracking.trim()) entryErrors.push('masterTracking');
          e.boxes.forEach((b, bIdx) => {
            if (!b.trackingNumber.trim()) entryErrors.push(`box-${bIdx}-tracking`);
          });
        } else {
          if (!e.trackingNumber.trim()) entryErrors.push('trackingNumber');
        }
      } else if (e.shipmentType === 'ltl') {
        if (!e.proNumber.trim() && !e.trackingNumber.trim()) entryErrors.push('proNumber');
      } else if (e.shipmentType === 'ftl') {
        if (!e.bolNumber.trim() && !e.trackingNumber.trim()) entryErrors.push('bolNumber');
      } else if (e.shipmentType === 'air-cargo') {
        if (!e.awbNumber.trim() && !e.trackingNumber.trim()) entryErrors.push('awbNumber');
      }
      if (entryErrors.length > 0) errors[idx] = entryErrors;
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fill in all required tracking/reference fields');
      return;
    }

    setSubmitting(true);
    try {
      const createdShipments: any[] = [];
      for (const entry of entries) {
        const addrStr = [entry.address.address, entry.address.city, entry.address.state, entry.address.zip]
          .filter(Boolean)
          .join(', ');

        const primaryTracking = entry.shipmentType === 'small-package'
          ? (entry.boxes.length > 0 ? entry.masterTracking : entry.trackingNumber)
          : entry.shipmentType === 'ltl' ? (entry.proNumber || entry.trackingNumber)
          : entry.shipmentType === 'ftl' ? (entry.bolNumber || entry.trackingNumber)
          : (entry.awbNumber || entry.trackingNumber);

        const shipmentPayload: any = {
          poNumber,
          poId,
          carrier: entry.carrier,
          trackingNumber: primaryTracking,
          masterTracking: entry.boxes.length > 0 ? entry.masterTracking : primaryTracking,
          status: 'In Transit',
          origin: 'Vendor',
          destination: entry.address.name || customer || 'N/A',
          destinationAddress: addrStr,
          destinationCity: entry.address.city || '',
          destinationState: entry.address.state || '',
          destinationZip: entry.address.zip || '',
          contact: entry.address.contact || '',
          vendor,
          customer,
          shipDate: new Date().toISOString().split('T')[0],
          items: lineItems.length,
          source: 'Purchase Order',
          sourceLineItems: lineItems.map((li: any) => ({
            productId: li.productId || li.id,
            description: li.description || li.productName || li.name || '',
            sku: li.sku || '',
            quantity: li.quantity || li.qty || 0,
            unitPrice: li.unitPrice || li.costPerUnit || 0,
          })),
          orderNumber: sourceOrderNumber || '',
          project: projectName,
          projectName,
          projectNumber,
          projectSubtext: projectNumber || '',
          shippingMethod: entry.shippingMethod || shippingMethod,
          carrierAccount,
          quantity: lineItems.reduce((sum: number, li: any) => sum + (li.quantity || li.qty || 0), 0),
          itemName: lineItems
            .map((li: any) => li.description || li.productName || li.name || li.sku || '')
            .filter(Boolean)
            .join(', '),
          serviceLevel: (entry.shippingMethod || shippingMethod || '').includes(' - ') 
            ? (entry.shippingMethod || shippingMethod).split(' - ').slice(1).join(' - ') 
            : entry.shippingMethod || shippingMethod || '',
          // New fields
          shipmentType: entry.shipmentType,
          numberOfCases: entry.numberOfCases ? parseInt(entry.numberOfCases) : undefined,
          proNumber: entry.proNumber || undefined,
          bolNumber: entry.bolNumber || undefined,
          flightNumber: entry.flightNumber || undefined,
          awbNumber: entry.awbNumber || undefined,
        };

        // Attach box details if multi-box
        if (entry.boxes.length > 0) {
          shipmentPayload.boxes = entry.boxes.map((b, i) => ({
            boxNumber: i + 1,
            trackingNumber: b.trackingNumber,
            length: b.length ? parseFloat(b.length) : undefined,
            width: b.width ? parseFloat(b.width) : undefined,
            height: b.height ? parseFloat(b.height) : undefined,
            weight: b.weight ? parseFloat(b.weight) : undefined,
          }));
        }

        const res = await fetch('/api/shipments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shipmentPayload),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Shipment creation HTTP error ${res.status}:`, errorText);
          toast.error(`Shipment creation failed (HTTP ${res.status}). Check console for details.`);
          continue;
        }
        
        const data = await res.json();
        console.log('Shipment creation response:', data);
        if (data.success) {
          createdShipments.push(data.shipment);
        } else {
          console.error('Error creating shipment:', data.error);
          toast.error(`Shipment creation error: ${data.error}`);
        }
      }

      if (createdShipments.length > 0) {
        toast.success(
          createdShipments.length === 1
            ? `Shipment ${createdShipments[0].id} created successfully!`
            : `${createdShipments.length} shipments created successfully!`
        );
        onConfirm(entries);
      } else {
        toast.error('Failed to create shipments. Please try again.');
      }

      setEntries(buildInitialEntries());
    } catch (err) {
      console.error('Error creating shipments:', err);
      toast.error(`Failed to create shipments: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const hasErrors = (idx: number, field: string) => validationErrors[idx]?.includes(field);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Create Shipment{entries.length > 1 ? 's' : ''}</h3>
                    <p className="text-emerald-100 text-sm">PO #{poNumber}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 drawer-scroll">
                {entries.length > 1 && (
                  <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        {entries.length} Ship-To Addresses Detected
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        This PO has multiple destinations. Please provide tracking details for each shipment.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  {entries.map((entry, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`rounded-xl border-2 overflow-hidden ${
                        validationErrors[idx]
                          ? 'border-red-300 bg-red-50/30'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Address header */}
                      {entry.address.name && (
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900">{entry.address.name}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {[entry.address.address, entry.address.city, entry.address.state, entry.address.zip]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>
                          {entry.address.contact && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                              {entry.address.contact}
                            </span>
                          )}
                          {entries.length > 1 && (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                              #{idx + 1}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-5 space-y-5">
                        {/* ── Step 1: Shipment Type ── */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Shipment Type <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {SHIPMENT_TYPES.map((type) => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => updateShipmentType(idx, type.id)}
                                className={`relative px-3 py-3 rounded-xl border-2 text-left transition-all ${
                                  entry.shipmentType === type.id
                                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20'
                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                                }`}
                              >
                                <div className="text-lg mb-1">{type.icon}</div>
                                <p className={`text-xs font-bold ${entry.shipmentType === type.id ? 'text-emerald-700' : 'text-slate-700'}`}>
                                  {type.label}
                                </p>
                                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{type.description}</p>
                                {entry.shipmentType === type.id && (
                                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* ── Step 2: Carrier ── */}
                        <div className="grid grid-cols-2 gap-4">
                          <ShipmentDropdown
                            value={entry.carrier}
                            onChange={(v) => updateEntry(idx, { carrier: v, shippingMethod: '' })}
                            options={CARRIERS_BY_TYPE[entry.shipmentType]}
                            label="Carrier"
                            required
                          />

                          {/* Type-specific reference field */}
                          {entry.shipmentType === 'ltl' && (
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                PRO Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={entry.proNumber}
                                onChange={(e) => updateEntry(idx, { proNumber: e.target.value })}
                                placeholder="e.g., 123-456789"
                                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                                  hasErrors(idx, 'proNumber') ? 'border-red-400' : 'border-slate-200'
                                }`}
                              />
                              {hasErrors(idx, 'proNumber') && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> PRO number or tracking required
                                </p>
                              )}
                            </div>
                          )}

                          {entry.shipmentType === 'ftl' && (
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                BOL Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={entry.bolNumber}
                                onChange={(e) => updateEntry(idx, { bolNumber: e.target.value })}
                                placeholder="e.g., BOL-2026-001"
                                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                                  hasErrors(idx, 'bolNumber') ? 'border-red-400' : 'border-slate-200'
                                }`}
                              />
                              {hasErrors(idx, 'bolNumber') && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> BOL number or tracking required
                                </p>
                              )}
                            </div>
                          )}

                          {entry.shipmentType === 'air-cargo' && (
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                AWB Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={entry.awbNumber}
                                onChange={(e) => updateEntry(idx, { awbNumber: e.target.value })}
                                placeholder="e.g., 123-12345678"
                                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                                  hasErrors(idx, 'awbNumber') ? 'border-red-400' : 'border-slate-200'
                                }`}
                              />
                              {hasErrors(idx, 'awbNumber') && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> AWB number or tracking required
                                </p>
                              )}
                            </div>
                          )}

                          {entry.shipmentType === 'small-package' && entry.boxes.length === 0 && (
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Tracking Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={entry.trackingNumber}
                                onChange={(e) => updateEntry(idx, { trackingNumber: e.target.value })}
                                placeholder="e.g., 1Z999AA10123456784"
                                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                                  hasErrors(idx, 'trackingNumber') ? 'border-red-400' : 'border-slate-200'
                                }`}
                              />
                              {hasErrors(idx, 'trackingNumber') && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Tracking number is required
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ── Shipping Method (optional) ── */}
                        <ShipmentDropdown
                          value={entry.shippingMethod}
                          onChange={(v) => updateEntry(idx, { shippingMethod: v })}
                          options={SHIPPING_METHODS_BY_CARRIER[entry.carrier] || SHIPPING_METHODS_BY_CARRIER['Other']}
                          label="Shipping Method"
                          placeholder="Select shipping method..."
                        />

                        {/* ── LTL/FTL: Additional tracking field ── */}
                        {(entry.shipmentType === 'ltl' || entry.shipmentType === 'ftl') && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {entry.shipmentType === 'ltl' ? 'BOL Number' : 'Tracking Number'} <span className="text-slate-400 text-xs font-normal">(optional)</span>
                              </label>
                              <input
                                type="text"
                                value={entry.shipmentType === 'ltl' ? entry.bolNumber : entry.trackingNumber}
                                onChange={(e) => updateEntry(idx, entry.shipmentType === 'ltl' ? { bolNumber: e.target.value } : { trackingNumber: e.target.value })}
                                placeholder={entry.shipmentType === 'ltl' ? 'Bill of Lading #' : 'Carrier tracking #'}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Tracking Number <span className="text-slate-400 text-xs font-normal">(optional)</span>
                              </label>
                              <input
                                type="text"
                                value={entry.trackingNumber}
                                onChange={(e) => updateEntry(idx, { trackingNumber: e.target.value })}
                                placeholder="Carrier tracking #"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              />
                            </div>
                          </div>
                        )}

                        {/* ── Air Cargo: Additional fields ── */}
                        {entry.shipmentType === 'air-cargo' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Flight Number <span className="text-slate-400 text-xs font-normal">(optional)</span>
                              </label>
                              <input
                                type="text"
                                value={entry.flightNumber}
                                onChange={(e) => updateEntry(idx, { flightNumber: e.target.value })}
                                placeholder="e.g., BA-2176"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Tracking Number <span className="text-slate-400 text-xs font-normal">(optional)</span>
                              </label>
                              <input
                                type="text"
                                value={entry.trackingNumber}
                                onChange={(e) => updateEntry(idx, { trackingNumber: e.target.value })}
                                placeholder="Carrier tracking #"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              />
                            </div>
                          </div>
                        )}

                        {/* ── Small Package: Multi-box section ── */}
                        {entry.shipmentType === 'small-package' && (
                          <div className="border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Box className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-semibold text-slate-700">Package Details</span>
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Optional</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedBoxes(p => ({ ...p, [idx]: !p[idx] }))}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                              >
                                {expandedBoxes[idx] ? 'Hide' : 'Show'} Details
                                <ChevronRight className={`w-3 h-3 transition-transform ${expandedBoxes[idx] ? 'rotate-90' : ''}`} />
                              </button>
                            </div>

                            <AnimatePresence>
                              {expandedBoxes[idx] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  {/* Number of cases */}
                                  <div className="mb-4">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                      <Hash className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                                      Number of Cases / Boxes
                                    </label>
                                    <QuantityStepper
                                      value={parseInt(entry.numberOfCases) || 0}
                                      onChange={(val) => updateEntry(idx, { numberOfCases: String(val) })}
                                      min={1}
                                      wide
                                    />
                                  </div>

                                  {/* Multi-box tracking */}
                                  {entry.boxes.length > 0 && (
                                    <div className="mb-3">
                                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Master Tracking Number <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={entry.masterTracking}
                                        onChange={(e) => updateEntry(idx, { masterTracking: e.target.value })}
                                        placeholder="Master / parent tracking number"
                                        className={`w-full px-4 py-2.5 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                                          hasErrors(idx, 'masterTracking') ? 'border-red-400' : 'border-slate-200'
                                        }`}
                                      />
                                      {hasErrors(idx, 'masterTracking') && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                          <AlertCircle className="w-3 h-3" /> Master tracking required for multi-box shipments
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* Individual boxes */}
                                  <div className="space-y-3">
                                    {entry.boxes.map((box, bIdx) => (
                                      <motion.div
                                        key={box.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="bg-slate-50 rounded-xl border border-slate-200 p-4"
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                            <Package className="w-3.5 h-3.5 text-emerald-500" />
                                            Box {bIdx + 1}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => removeBox(idx, box.id)}
                                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                              Tracking Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                              type="text"
                                              value={box.trackingNumber}
                                              onChange={(e) => updateBox(idx, box.id, { trackingNumber: e.target.value })}
                                              placeholder="Individual box tracking #"
                                              className={`w-full px-3 py-2 bg-white border-2 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                                                hasErrors(idx, `box-${bIdx}-tracking`) ? 'border-red-400' : 'border-slate-200'
                                              }`}
                                            />
                                          </div>
                                          <div className="grid grid-cols-4 gap-2">
                                            <div>
                                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                <Ruler className="w-3 h-3 inline mr-0.5" />L (in)
                                              </label>
                                              <input
                                                type="number"
                                                value={box.length}
                                                onChange={(e) => updateBox(idx, box.id, { length: e.target.value })}
                                                placeholder="0"
                                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">W (in)</label>
                                              <input
                                                type="number"
                                                value={box.width}
                                                onChange={(e) => updateBox(idx, box.id, { width: e.target.value })}
                                                placeholder="0"
                                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">H (in)</label>
                                              <input
                                                type="number"
                                                value={box.height}
                                                onChange={(e) => updateBox(idx, box.id, { height: e.target.value })}
                                                placeholder="0"
                                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                <Weight className="w-3 h-3 inline mr-0.5" />lbs
                                              </label>
                                              <input
                                                type="number"
                                                value={box.weight}
                                                onChange={(e) => updateBox(idx, box.id, { weight: e.target.value })}
                                                placeholder="0"
                                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => addBox(idx)}
                                    className="mt-3 w-full px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Box / Case
                                  </button>

                                  {entry.boxes.length > 0 && (
                                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                      <p className="text-xs text-blue-700">
                                        <span className="font-semibold">Multi-box shipment:</span> Each box gets its own tracking number for independent tracking. The master tracking ties them together.
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Note:</span>{' '}
                    {entries.length > 1
                      ? `This will create ${entries.length} shipment records in the Shipments module, each linked to PO #${poNumber}.`
                      : `This will create a new shipment in the Shipments module and link it to PO #${poNumber}.`}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 flex items-center gap-3 border-t border-slate-200 shrink-0">
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      Create Shipment{entries.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}