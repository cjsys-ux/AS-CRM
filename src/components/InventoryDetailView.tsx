import {
  ArrowLeft, Package, AlertTriangle, TrendingUp, TrendingDown, MapPin,
  DollarSign, BarChart3, Clock, Truck, ShoppingCart, FileText, Edit, History,
  Plus, Minus, RefreshCw, ArrowUpRight, ArrowDownRight,
  Boxes, Shield, Zap, Tag, Users, ClipboardList, RotateCcw, Send, MapPinned,
  X, ChevronDown, Building2, User, Navigation, Phone, Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { QuantityStepper } from './QuantityStepper';

const headers_json = { 'Content-Type': 'application/json' };

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  supplier: string;
  costPerUnit: string;
  location: string;
  lastRestocked: string;
  imageUrl?: string;
  customer?: string;
  unitPrice?: string;
  notes?: string;
  orderDate?: string;
  shippingCost?: string;
  paymentTerms?: string;
  paymentDate?: string;
  paymentAmount?: string;
  itemType?: 'Normal' | 'Competitor Sample' | 'Pre-Production Sample';
  productTags?: string[];
  allocated?: number;
  onOrder?: number;
  inTransit?: number;
  discontinued?: boolean;
  discontinuedReason?: string;
  discontinuedDate?: string;
}

interface InventoryDetailViewProps {
  item: InventoryItem;
  onBack: () => void;
  onEdit: (item: InventoryItem) => void;
  onRefresh?: () => void;
}

function getStockStatus(item: InventoryItem) {
  if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
  if (item.quantity <= item.minStock) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', icon: TrendingDown };
  return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700', icon: TrendingUp };
}

function InfoCard({ icon: Icon, label, value, className = '' }: { icon: any; label: string; value: string | number; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-900">{value || '—'}</p>
    </div>
  );
}

// --- Phone formatting helper ---
function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6, 10)}`;
}

function sanitizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10);
}

// --- Shipping type / service type data ---
const SHIPPING_TYPES = [
  { value: 'UPS', label: 'UPS' },
  { value: 'FedEx', label: 'FedEx' },
  { value: 'USPS', label: 'USPS' },
  { value: 'DHL', label: 'DHL' },
  { value: 'LTL', label: 'LTL Freight' },
  { value: 'FTL', label: 'FTL Freight' },
  { value: 'Courier', label: 'Courier / Local Delivery' },
  { value: 'Other', label: 'Other' },
];

const SERVICE_TYPES: Record<string, { value: string; label: string }[]> = {
  UPS: [
    { value: 'Ground', label: 'UPS Ground' },
    { value: 'Next Day Air', label: 'UPS Next Day Air' },
    { value: '2nd Day Air', label: 'UPS 2nd Day Air' },
    { value: '3 Day Select', label: 'UPS 3 Day Select' },
    { value: 'Ground Saver', label: 'UPS Ground Saver' },
  ],
  FedEx: [
    { value: 'Ground', label: 'FedEx Ground' },
    { value: 'Home Delivery', label: 'FedEx Home Delivery' },
    { value: 'Express Saver', label: 'FedEx Express Saver' },
    { value: '2Day', label: 'FedEx 2Day' },
    { value: 'Standard Overnight', label: 'FedEx Standard Overnight' },
    { value: 'Priority Overnight', label: 'FedEx Priority Overnight' },
    { value: 'Freight Economy', label: 'FedEx Freight Economy' },
    { value: 'Freight Priority', label: 'FedEx Freight Priority' },
  ],
  USPS: [
    { value: 'Priority Mail', label: 'Priority Mail' },
    { value: 'Priority Mail Express', label: 'Priority Mail Express' },
    { value: 'First Class', label: 'First Class Package' },
    { value: 'Ground Advantage', label: 'Ground Advantage' },
    { value: 'Media Mail', label: 'Media Mail' },
  ],
  DHL: [
    { value: 'Express Worldwide', label: 'DHL Express Worldwide' },
    { value: 'Express 12:00', label: 'DHL Express 12:00' },
    { value: 'Economy Select', label: 'DHL Economy Select' },
    { value: 'eCommerce', label: 'DHL eCommerce' },
  ],
  LTL: [
    { value: 'Standard', label: 'Standard LTL' },
    { value: 'Guaranteed', label: 'Guaranteed LTL' },
    { value: 'Expedited', label: 'Expedited LTL' },
    { value: 'Volume', label: 'Volume LTL' },
  ],
  FTL: [
    { value: 'Dry Van', label: 'Dry Van' },
    { value: 'Flatbed', label: 'Flatbed' },
    { value: 'Reefer', label: 'Refrigerated' },
    { value: 'Expedited', label: 'Expedited' },
  ],
  Courier: [
    { value: 'Same Day', label: 'Same Day Delivery' },
    { value: 'Next Day', label: 'Next Day Delivery' },
    { value: 'Standard', label: 'Standard Delivery' },
  ],
  Other: [
    { value: 'Standard', label: 'Standard' },
    { value: 'Expedited', label: 'Expedited' },
    { value: 'Economy', label: 'Economy' },
  ],
};

// --- Create Shipment Drawer ---
function CreateShipmentDrawer({
  isOpen, onClose, item, onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  onSuccess: () => void;
}) {
  const available = item.quantity - (item.allocated || 0);

  const [shipForm, setShipForm] = useState({
    quantity: 1,
    priority: 'Normal' as 'Urgent' | 'High' | 'Normal' | 'Low',
    shippingType: '',
    serviceType: '',
    firstName: '',
    lastName: '',
    phone: '', // stored as digits only
    recipientCompany: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    notes: '',
  });
  const [creatingShipment, setCreatingShipment] = useState(false);

  // Ship-to type toggle
  const [shipToType, setShipToType] = useState<'customer' | 'vendor'>('customer');

  // Company data
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyContacts, setCompanyContacts] = useState<any[]>([]);
  const [companyAddresses, setCompanyAddresses] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  const resetFormFields = () => {
    setShipForm({
      quantity: Math.min(1, available),
      priority: 'Normal',
      shippingType: '',
      serviceType: '',
      firstName: '',
      lastName: '',
      phone: '',
      recipientCompany: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      notes: '',
    });
    setSelectedCompanyId('');
    setSelectedContactId('');
    setSelectedAddressId('');
    setCompanyContacts([]);
    setCompanyAddresses([]);
  };

  // Fetch both customers and vendors on open
  useEffect(() => {
    if (isOpen) {
      resetFormFields();
      setShipToType('customer');
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    setLoadingData(true);
    try {
      const [custRes, vendorRes] = await Promise.all([
        fetch('/api/customers/list'),
        fetch('/api/vendors/list'),
      ]);
      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData.customers || []);
      }
      if (vendorRes.ok) {
        const vendorData = await vendorRes.json();
        setVendors(vendorData.vendors || []);
      }
    } catch (e) {
      console.error('Error fetching companies:', e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleShipToTypeChange = (type: 'customer' | 'vendor') => {
    setShipToType(type);
    setSelectedCompanyId('');
    setSelectedContactId('');
    setSelectedAddressId('');
    setCompanyContacts([]);
    setCompanyAddresses([]);
    setShipForm(f => ({ ...f, firstName: '', lastName: '', phone: '', recipientCompany: '', addressLine1: '', addressLine2: '', city: '', state: '', zip: '', country: 'US' }));
  };

  const companyList = shipToType === 'customer' ? customers : vendors;

  const handleCompanyChange = async (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedContactId('');
    setSelectedAddressId('');

    if (!companyId) {
      setCompanyContacts([]);
      setCompanyAddresses([]);
      setShipForm(f => ({ ...f, recipientCompany: '', firstName: '', lastName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', zip: '', country: 'US' }));
      return;
    }

    if (shipToType === 'customer') {
      const cust = customers.find(c => c.id === companyId);
      if (cust) {
        setShipForm(f => ({ ...f, recipientCompany: cust.name || cust.company || '' }));
        setCompanyContacts(cust.contacts || []);
        setCompanyAddresses(cust.addresses || []);
      }
    } else {
      // Vendor flow
      const vendor = vendors.find(v => v.id === companyId);
      if (vendor) {
        setShipForm(f => ({ ...f, recipientCompany: vendor.name || vendor.company || '' }));
        setCompanyAddresses(vendor.addresses || []);
      }
      // Vendors store contacts embedded on the vendor record — no dedicated
      // list endpoint. Pull from the vendor object we already have.
      const v = vendors.find(vv => vv.id === companyId);
      setCompanyContacts(v?.contacts || []);
    }
  };

  const handleContactChange = (contactId: string) => {
    setSelectedContactId(contactId);
    if (!contactId) {
      setShipForm(f => ({ ...f, firstName: '', lastName: '', phone: '' }));
      return;
    }
    const contact = companyContacts.find(c => c.id === contactId);
    if (contact) {
      setShipForm(f => ({
        ...f,
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        phone: sanitizePhoneDigits(contact.phone || ''),
      }));
    }
  };

  const handleAddressChange = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (!addrId) {
      setShipForm(f => ({ ...f, addressLine1: '', addressLine2: '', city: '', state: '', zip: '', country: 'US' }));
      return;
    }
    const addr = companyAddresses.find(a => a.id === addrId);
    if (addr) {
      setShipForm(f => ({
        ...f,
        addressLine1: addr.street || addr.street1 || '',
        addressLine2: addr.street2 || '',
        city: addr.city || '',
        state: addr.state || '',
        zip: addr.zip || '',
        country: addr.country || 'US',
      }));
    }
  };

  const handleShippingTypeChange = (type: string) => {
    setShipForm(f => ({ ...f, shippingType: type, serviceType: '' }));
  };

  const handleQuantityChange = (val: string) => {
    let num = parseInt(val) || 0;
    if (num < 0) num = 0;
    if (num > available) num = available;
    setShipForm(f => ({ ...f, quantity: num }));
  };

  const handleCreateShipment = async () => {
    if (shipForm.quantity <= 0 || shipForm.quantity > available) {
      toast.error(`Quantity must be between 1 and ${available}`);
      return;
    }
    if (!shipForm.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!shipForm.addressLine1.trim()) {
      toast.error('Address is required');
      return;
    }
    if (!shipForm.city.trim() || !shipForm.state.trim() || !shipForm.zip.trim()) {
      toast.error('City, state, and zip are required');
      return;
    }
    if (!shipForm.shippingType) {
      toast.error('Please select a shipping type');
      return;
    }

    setCreatingShipment(true);
    try {
      const locParts = (item.location || '').split(/[-›> ]+/).filter(Boolean);
      const zone = locParts[1] || 'Z01';
      const aisle = locParts[2] || 'A01';
      const bin = locParts[3] || 'B01';

      const recipientFullName = `${shipForm.firstName} ${shipForm.lastName}`.trim();

      const destinationAddress = [
        recipientFullName,
        shipForm.recipientCompany,
        shipForm.addressLine1,
        shipForm.addressLine2,
        `${shipForm.city}, ${shipForm.state} ${shipForm.zip}`,
        shipForm.country !== 'US' ? shipForm.country : '',
        shipForm.phone ? `Phone: ${formatPhoneDisplay(shipForm.phone)}` : '',
      ].filter(Boolean).join('\n');

      const pickListData = {
        orderNumber: `${Math.floor(100000 + Math.random() * 900000)}`,
        customer: recipientFullName + (shipForm.recipientCompany ? ` (${shipForm.recipientCompany})` : ''),
        priority: shipForm.priority,
        assignedTo: '',
        sourceType: 'inventory-shipment',
        sourceInventoryId: item.id,
        destinationAddress,
        shippingType: shipForm.shippingType,
        serviceType: shipForm.serviceType,
        shipmentNotes: shipForm.notes,
        items: [{
          sku: item.sku,
          name: item.name,
          quantity: shipForm.quantity,
          pickedQty: 0,
          location: item.location || `${zone}-${aisle}-${bin}`,
          zone,
          aisle,
          bin,
          imageUrl: item.imageUrl || '',
        }],
      };

      const res = await fetch('/api/pick-lists/create', {
        method: 'POST',
        headers: headers_json,
        body: JSON.stringify(pickListData),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        toast.error(`Failed to create shipment: ${result.error || 'Unknown error'}`);
        return;
      }
      const result = await res.json();

      // Item stays available until shipped — track as onOrder, not allocated
      const newOnOrder = (item.onOrder || 0) + shipForm.quantity;
      await fetch('/api/inventory/update', {
        method: 'PATCH',
        headers: headers_json,
        body: JSON.stringify({ id: item.id, onOrder: newOnOrder }),
      });

      toast.success(`Shipment order created! Pick list ${result.pickList?.id || ''} sent to Picking module.`);
      onClose();
      onSuccess();
    } catch (err) {
      console.error('[Inventory] Error creating shipment:', err);
      toast.error('Error creating shipment order');
    } finally {
      setCreatingShipment(false);
    }
  };

  const selectClass = "w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white appearance-none";
  const inputClass = "w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  const availableServiceTypes = shipForm.shippingType ? (SERVICE_TYPES[shipForm.shippingType] || []) : [];

  const getAddressLabel = (a: any) => {
    const street = a.street || a.street1 || '';
    const prefix = a.type || a.label || '';
    const text = street ? (street.length > 30 ? `${street.substring(0, 28)}...` : street) : a.city || a.id;
    return `${prefix ? `${prefix}: ` : ''}${text}${a.isPrimary ? ' (Primary)' : ''}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[540px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-emerald-600 to-teal-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create Shipment</h2>
                  <p className="text-xs text-emerald-100">Ship from inventory to destination</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Item Preview Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center gap-4">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{item.sku} &middot; {item.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-700">Available: {available} {item.unit}</p>
                  <p className="text-[10px] text-slate-400">Total: {item.quantity} &middot; Allocated: {item.allocated || 0}</p>
                </div>
              </div>

              {/* Quantity & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Quantity to Ship *</label>
                  <div className="relative">
                    <QuantityStepper
                      value={shipForm.quantity}
                      min={1}
                      max={available}
                      onChange={(val) => setShipForm(f => ({ ...f, quantity: val }))}
                      wide
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">/ {available}</span>
                  </div>
                  {shipForm.quantity > available && (
                    <p className="text-[10px] text-red-500 mt-1">Exceeds available quantity</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Priority</label>
                  <select
                    value={shipForm.priority}
                    onChange={e => setShipForm({ ...shipForm, priority: e.target.value as any })}
                    className={selectClass}
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Shipping Type & Service */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Shipping Method</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Carrier / Type *</label>
                    <select
                      value={shipForm.shippingType}
                      onChange={e => handleShippingTypeChange(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select carrier...</option>
                      {SHIPPING_TYPES.map(st => (
                        <option key={st.value} value={st.value}>{st.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Service Level</label>
                    <select
                      value={shipForm.serviceType}
                      onChange={e => setShipForm({ ...shipForm, serviceType: e.target.value })}
                      className={selectClass}
                      disabled={!shipForm.shippingType}
                    >
                      <option value="">Select service...</option>
                      {availableServiceTypes.map(sv => (
                        <option key={sv.value} value={sv.value}>{sv.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ship To */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPinned className="w-4 h-4 text-emerald-600" />
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Ship To</label>
                </div>

                {/* Customer / Vendor Toggle */}
                <div className="flex rounded-xl border-2 border-slate-200 overflow-hidden mb-3">
                  <button
                    type="button"
                    onClick={() => handleShipToTypeChange('customer')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                      shipToType === 'customer'
                        ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-200'
                        : 'bg-white text-slate-500 hover:bg-slate-50 border-r-2 border-slate-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShipToTypeChange('vendor')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                      shipToType === 'vendor'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Vendor
                  </button>
                </div>

                {/* Company Dropdown */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {shipToType === 'customer' ? 'Customer' : 'Vendor'}
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={e => handleCompanyChange(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select a {shipToType === 'customer' ? 'customer' : 'vendor'}...</option>
                    {companyList.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.company || c.id}</option>
                    ))}
                  </select>
                  {loadingData && <p className="text-[10px] text-slate-400 mt-0.5">Loading...</p>}
                </div>

                {/* Contact & Address Dropdowns */}
                {selectedCompanyId && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Contact</label>
                      <select
                        value={selectedContactId}
                        onChange={e => handleContactChange(e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select contact...</option>
                        {companyContacts.map(c => (
                          <option key={c.id} value={c.id}>
                            {`${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name || c.email || c.id}
                          </option>
                        ))}
                      </select>
                      {companyContacts.length === 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">No contacts on file</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Saved Address</label>
                      <select
                        value={selectedAddressId}
                        onChange={e => handleAddressChange(e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select address...</option>
                        {companyAddresses.map(a => (
                          <option key={a.id} value={a.id}>
                            {getAddressLabel(a)}
                          </option>
                        ))}
                      </select>
                      {companyAddresses.length === 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">No addresses on file</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recipient Fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">First Name *</label>
                      <input
                        value={shipForm.firstName}
                        onChange={e => setShipForm({ ...shipForm, firstName: e.target.value })}
                        placeholder="John"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                      <input
                        value={shipForm.lastName}
                        onChange={e => setShipForm({ ...shipForm, lastName: e.target.value })}
                        placeholder="Smith"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number</span>
                      </label>
                      <input
                        value={formatPhoneDisplay(shipForm.phone)}
                        onChange={e => setShipForm({ ...shipForm, phone: sanitizePhoneDigits(e.target.value) })}
                        placeholder="(555) 123 - 4567"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Company Name</label>
                      <input
                        value={shipForm.recipientCompany}
                        onChange={e => setShipForm({ ...shipForm, recipientCompany: e.target.value })}
                        placeholder="Acme Corp"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Address Line 1 *</label>
                    <input
                      value={shipForm.addressLine1}
                      onChange={e => setShipForm({ ...shipForm, addressLine1: e.target.value })}
                      placeholder="123 Main St"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Address Line 2</label>
                    <input
                      value={shipForm.addressLine2}
                      onChange={e => setShipForm({ ...shipForm, addressLine2: e.target.value })}
                      placeholder="Suite 100, Floor 2"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">City *</label>
                      <input
                        value={shipForm.city}
                        onChange={e => setShipForm({ ...shipForm, city: e.target.value })}
                        placeholder="Miami"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">State *</label>
                      <input
                        value={shipForm.state}
                        onChange={e => setShipForm({ ...shipForm, state: e.target.value })}
                        placeholder="FL"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">ZIP *</label>
                      <input
                        value={shipForm.zip}
                        onChange={e => setShipForm({ ...shipForm, zip: e.target.value })}
                        placeholder="33101"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipment Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Shipment Notes</label>
                <textarea
                  value={shipForm.notes}
                  onChange={e => setShipForm({ ...shipForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Special handling instructions, reference numbers..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3 bg-slate-50">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShipment}
                disabled={creatingShipment || shipForm.quantity <= 0 || shipForm.quantity > available}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingShipment ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" />Creating...</>
                ) : (
                  <><Send className="w-4 h-4" />Create Shipment & Pick List</>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function InventoryDetailView({ item, onBack, onEdit, onRefresh }: InventoryDetailViewProps) {
  const status = getStockStatus(item);
  const StatusIcon = status.icon;
  const costNum = parseFloat((item.costPerUnit || '0').replace('$', ''));
  const priceNum = parseFloat((item.unitPrice || '0').replace('$', ''));
  const totalValue = (costNum * item.quantity).toFixed(2);
  const margin = priceNum > 0 ? (((priceNum - costNum) / priceNum) * 100).toFixed(1) : null;
  const available = item.quantity - (item.allocated || 0);

  const [showShipDrawer, setShowShipDrawer] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white"
            >
              {item.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-sm font-mono"
            >
              {item.sku}
            </motion.p>
          </div>
          <div className="relative group">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              onClick={() => {
                if (item.quantity <= 0) {
                  toast.error('Cannot create shipment — inventory quantity is 0.');
                  return;
                }
                if ((item.allocated || 0) >= item.quantity) {
                  toast.error('Cannot create shipment — all inventory has already been allocated.');
                  return;
                }
                setShowShipDrawer(true);
              }}
              disabled={available <= 0 || (item.allocated || 0) >= item.quantity}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/90 rounded-xl text-white hover:bg-emerald-500 transition-all text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Create Shipment
            </motion.button>
            {(available <= 0 || (item.allocated || 0) >= item.quantity) && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-4 py-2.5 flex items-center gap-2.5 whitespace-nowrap">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-slate-800" />
                  <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white tracking-wide">
                      {item.quantity <= 0 ? 'No Inventory Available' : 'Fully Allocated'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {item.quantity <= 0
                        ? 'Quantity is 0  add stock to create shipments'
                        : `${item.allocated || 0} of ${item.quantity} ${item.unit} allocated — no available stock`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => onEdit(item)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-all text-sm font-semibold"
          >
            <Edit className="w-4 h-4" />
            Edit Item
          </motion.button>
        </div>

        {/* Status & Category badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-3"
        >
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
            <Tag className="w-3.5 h-3.5" />
            {item.category}
          </span>
          {item.customer && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
              <Users className="w-3.5 h-3.5" />
              {item.customer}
            </span>
          )}
          {item.discontinued && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-200 border border-slate-500">
              <Ban className="w-3.5 h-3.5" />
              Discontinued
            </span>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Discontinued Banner */}
        {item.discontinued && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl border border-slate-600 p-5 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-1">Item Discontinued</h3>
                {item.discontinuedDate && (
                  <p className="text-xs text-slate-400 mb-2">Discontinued on {item.discontinuedDate}</p>
                )}
                {item.discontinuedReason && (
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-600/50">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Reason</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{item.discontinuedReason}</p>
                  </div>
                )}
                {!item.discontinuedReason && (
                  <p className="text-sm text-slate-400 italic">No reason provided</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Image + Quick Stats */}
        <div className="flex gap-6">
          {item.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-slate-200 shrink-0 bg-white"
            >
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </motion.div>
          )}
          <div className="flex-1 grid grid-cols-4 gap-4">
            <InfoCard icon={Boxes} label="Quantity" value={`${item.quantity} ${item.unit}`} />
            <InfoCard icon={Package} label="Available" value={`${available} ${item.unit}`} />
            <InfoCard icon={ClipboardList} label="Allocated" value={`${item.allocated || 0} ${item.unit}`} />
            <InfoCard icon={Truck} label="On Order" value={`${item.onOrder || 0} ${item.unit}`} />
            <InfoCard icon={Navigation} label="In Transit" value={`${item.inTransit || 0} ${item.unit}`} />
            <InfoCard icon={AlertTriangle} label="Reorder Level" value={`${item.minStock} ${item.unit}`} />
            <InfoCard icon={DollarSign} label="Unit Cost" value={item.costPerUnit || '—'} />
            <InfoCard icon={DollarSign} label="Total Value" value={`$${totalValue}`} />
          </div>
        </div>

        {/* Details Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              Item Details
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            <DetailRow icon={Truck} label="Supplier" value={item.supplier} />
            <DetailRow icon={MapPin} label="Location" value={item.location} />
            <DetailRow icon={Clock} label="Last Restocked" value={item.lastRestocked || '—'} />
            {item.orderDate && <DetailRow icon={ShoppingCart} label="Order Date" value={item.orderDate} />}
            {item.shippingCost && <DetailRow icon={Truck} label="Shipping Cost" value={item.shippingCost.startsWith('$') ? item.shippingCost : `$${item.shippingCost}`} />}
            {item.paymentTerms && <DetailRow icon={FileText} label="Payment Terms" value={item.paymentTerms} />}
            {item.paymentDate && <DetailRow icon={Clock} label="Payment Date" value={item.paymentDate} />}
            {item.paymentAmount && <DetailRow icon={DollarSign} label="Payment Amount" value={`$${item.paymentAmount}`} />}
          </div>
        </motion.div>

        {/* Notes */}
        {item.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Notes
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{item.notes}</p>
            </div>
          </motion.div>
        )}

        {/* Stock Level Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Stock Level
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600 font-medium">Available: {available} {item.unit}</span>
              <span className="text-slate-400">Reorder at: {item.minStock} {item.unit}</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((item.quantity / Math.max(item.minStock * 3, 1)) * 100, 100)}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  item.quantity === 0
                    ? 'bg-red-500'
                    : item.quantity <= item.minStock
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
            </div>
            {/* Allocated indicator */}
            {(item.allocated || 0) > 0 && (
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available: {available}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Allocated: {item.allocated || 0}
                </span>
                {(item.onOrder || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> On Order: {item.onOrder || 0}
                  </span>
                )}
                {(item.inTransit || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> In Transit: {item.inTransit || 0}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Create Shipment Drawer */}
      <CreateShipmentDrawer
        isOpen={showShipDrawer}
        onClose={() => setShowShipDrawer(false)}
        item={item}
        onSuccess={() => {
          if (onRefresh) onRefresh();
          else onBack();
        }}
      />
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center px-6 py-3.5">
      <div className="flex items-center gap-2 w-44 shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500 font-medium">{label}</span>
      </div>
      <span className="text-sm text-slate-900 font-semibold">{value}</span>
    </div>
  );
}