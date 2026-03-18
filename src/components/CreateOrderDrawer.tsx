import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Check, ChevronRight, ChevronLeft, User, FileText, Tag, Sparkles, Calendar, Clock, Building, MapPin, Percent, AlertCircle, Search, Package, Plus, Trash2 } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import type { SelectOption } from './SearchableSelect';
import { DatePicker } from './DatePicker';
import { QuantityStepper } from './QuantityStepper';


interface CreateOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contacts?: any[];
  addresses?: any[];
}

interface Product {
  id: string;
  name?: string;
  sku?: string;
  category?: string;
  price?: string;
  status?: string;
  supplier?: string;
  imageUrl?: string;
}

interface OrderLineItem {
  productId: string;
  productName: string;
  sku: string;
  supplier: string;
  variant: string;
  quantity: number;
  netCost: number;
  margin: number;
  clientPrice: number;
  total: number;
  imageUrl?: string;
}

const EVENT_TYPES = [
  'Corporate Event', 'Trade Show', 'Product Launch', 'Conference',
  'Holiday Gift', 'Employee Appreciation', 'Marketing Campaign',
  'Fundraiser', 'Giveaway / Promo', 'Sports Event', 'Other'
];

const STAGES = [
  { id: 'opportunity', label: 'Opportunity', color: 'from-blue-400 to-blue-500' },
  { id: 'presentation', label: 'Presentation', color: 'from-purple-400 to-purple-500' },
  { id: 'estimate', label: 'Estimate', color: 'from-amber-400 to-amber-500' },
  { id: 'sales-order', label: 'Sales Order', color: 'from-green-400 to-green-500' },
];

const TERMS = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', '2/10 Net 30'];
const TAX_RATES = [
  { label: 'None (0%)', value: 0 },
  { label: 'FL Sales Tax (7%)', value: 7 },
  { label: 'CA Sales Tax (7.25%)', value: 7.25 },
  { label: 'NY Sales Tax (8%)', value: 8 },
  { label: 'TX Sales Tax (6.25%)', value: 6.25 },
  { label: 'Custom', value: -1 },
];

export function CreateOrderDrawer({ isOpen, onClose, onCreated }: CreateOrderDrawerProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Project Setup
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [eventType, setEventType] = useState('');
  const [stage, setStage] = useState('opportunity');

  // Step 2: Logistics
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [inHandsDate, setInHandsDate] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [billingContact, setBillingContact] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingContact, setShippingContact] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [terms, setTerms] = useState('Due on Receipt');
  const [currency, setCurrency] = useState('USD');
  const [defaultTax, setDefaultTax] = useState(7);
  const [customTax, setCustomTax] = useState('');
  const [defaultMargin, setDefaultMargin] = useState('40');
  const [customerPO, setCustomerPO] = useState('');
  const [isSampleOrder, setIsSampleOrder] = useState(false);

  // Step 3: Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCustomers([]);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingProducts(true);
    setProducts([]);
    setLoadingProducts(false);
  }, [isOpen]);

  // Filter customers
  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter products
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);

    // Auto-fill contacts and addresses
    if (customer.contacts && customer.contacts.length > 0) {
      const primary = customer.contacts[0];
      setBillingContact(primary.name || `${primary.firstName || ''} ${primary.lastName || ''}`.trim());
      setShippingContact(primary.name || `${primary.firstName || ''} ${primary.lastName || ''}`.trim());
    }
    if (customer.addresses && customer.addresses.length > 0) {
      const primary = customer.addresses.find((a: any) => a.isPrimary) || customer.addresses[0];
      const addrStr = [primary.street, primary.city, primary.state, primary.zip, primary.country].filter(Boolean).join(', ');
      setBillingAddress(addrStr);
      if (sameAsBilling) setShippingAddress(addrStr);
    }
  };

  // Same as billing
  useEffect(() => {
    if (sameAsBilling) {
      setShippingContact(billingContact);
      setShippingAddress(billingAddress);
    }
  }, [sameAsBilling, billingContact, billingAddress]);

  // Add product to line items
  const addProduct = (product: Product) => {
    const cost = parseFloat(product.price?.replace('$', '') || '0');
    const marginPct = parseFloat(defaultMargin) || 40;
    const clientPrice = cost / (1 - marginPct / 100);

    const item: OrderLineItem = {
      productId: product.id,
      productName: product.name || 'Unnamed Product',
      sku: product.sku || '',
      supplier: product.supplier || '',
      variant: '',
      quantity: 1,
      netCost: cost,
      margin: marginPct,
      clientPrice: parseFloat(clientPrice.toFixed(2)),
      total: parseFloat(clientPrice.toFixed(2)),
      imageUrl: product.imageUrl,
    };
    setLineItems(prev => [...prev, item]);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update line item
  const updateLineItem = (index: number, field: keyof OrderLineItem, value: any) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };

      // Recalculate
      if (field === 'quantity' || field === 'clientPrice') {
        updated.total = parseFloat((updated.quantity * updated.clientPrice).toFixed(2));
      }
      if (field === 'netCost' || field === 'clientPrice') {
        if (updated.clientPrice > 0) {
          updated.margin = parseFloat(((1 - updated.netCost / updated.clientPrice) * 100).toFixed(2));
        }
      }
      if (field === 'margin') {
        const newMargin = parseFloat(value) || 0;
        updated.clientPrice = parseFloat((updated.netCost / (1 - newMargin / 100)).toFixed(2));
        updated.total = parseFloat((updated.quantity * updated.clientPrice).toFixed(2));
      }
      return updated;
    }));
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = defaultTax === -1 ? (parseFloat(customTax) || 0) : defaultTax;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;
  const totalMarginDollars = lineItems.reduce((sum, item) => sum + ((item.clientPrice - item.netCost) * item.quantity), 0);

  // Validation
  const canProceedStep1 = selectedCustomer && projectName.trim();
  const canProceedStep2 = inHandsDate;
  const canSubmit = canProceedStep1;

  // Reset form
  const resetForm = () => {
    setStep(1);
    setCustomerSearch('');
    setSelectedCustomer(null);
    setProjectName('');
    setEventType('');
    setStage('opportunity');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setInHandsDate('');
    setIntroduction('');
    setBillingContact('');
    setBillingAddress('');
    setShippingContact('');
    setShippingAddress('');
    setSameAsBilling(false);
    setTerms('Due on Receipt');
    setCurrency('USD');
    setDefaultTax(7);
    setCustomTax('');
    setDefaultMargin('40');
    setCustomerPO('');
    setIsSampleOrder(false);
    setProductSearch('');
    setLineItems([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Submit order
  const handleSubmit = async () => {
    if (!selectedCustomer || !projectName.trim()) return;
    setSaving(true);

    try {
      const orderData = {
        customer: selectedCustomer.name,
        customerId: selectedCustomer.id,
        email: selectedCustomer.email || '',
        projectName,
        eventType,
        stage,
        status: stage === 'sales-order' ? 'Processing' : 'Pending',
        orderDate,
        inHandsDate,
        introduction,
        billingContact,
        billingAddress,
        shippingContact,
        shippingAddress,
        terms,
        currency,
        taxRate: defaultTax === -1 ? parseFloat(customTax) || 0 : defaultTax,
        defaultMargin: parseFloat(defaultMargin) || 40,
        customerPO,
        isSampleOrder,
        lineItems,
        items: lineItems.length,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total: `$${grandTotal.toFixed(2)}`,
        totalMargin: totalMarginDollars.toFixed(2),
        paymentStatus: 'Pending',
        shipping: shippingAddress ? 'Domestic' : 'N/A',
        date: orderDate,
      };

      resetForm();
      onCreated();
      onClose();
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const stepTitles = ['Project Setup', 'Logistics & Details', 'Products'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 350 }}
            className="fixed right-0 top-0 h-full w-full max-w-3xl bg-slate-50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-800 px-8 py-6 flex items-center justify-between shadow-xl shrink-0">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl"
                >
                  <ShoppingCart className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black text-white">Create New Order</h2>
                  <p className="text-blue-100 text-sm">{stepTitles[step - 1]} - Step {step} of 3</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Step Indicators */}
            <div className="px-8 py-4 bg-white border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => {
                        if (s < step) setStep(s);
                        else if (s === 2 && canProceedStep1) setStep(2);
                        else if (s === 3 && canProceedStep1) setStep(3);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        step === s
                          ? 'bg-blue-600 text-white shadow-md'
                          : step > s
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step > s ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                          {s}
                        </span>
                      )}
                      {stepTitles[s - 1]}
                    </button>
                    {s < 3 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto drawer-scroll">
              <AnimatePresence mode="wait">
                {/* STEP 1: Project Setup */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 space-y-6"
                  >
                    {/* Client Selection */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <User className="w-4 h-4 inline mr-1.5 text-blue-500" />
                        Client / Customer <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        value={selectedCustomer?.id || ''}
                        onChange={(val) => {
                          const customer = customers.find(c => c.id === val);
                          if (customer) {
                            handleSelectCustomer(customer);
                          } else {
                            setSelectedCustomer(null);
                            setCustomerSearch('');
                          }
                        }}
                        options={customers.map(c => ({
                          id: c.id,
                          label: c.name,
                          subtitle: c.id?.startsWith('cust_') ? c.id.replace('cust_', 'CUST-').toUpperCase() : c.email || '',
                          icon: (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                              {c.name?.substring(0, 2).toUpperCase()}
                            </div>
                          ),
                        }))}
                        placeholder="Select customer..."
                        searchPlaceholder="Search customers..."
                        emptyIcon={<User className="w-10 h-10 text-slate-300 mx-auto mb-2" />}
                        emptyMessage="No customers in system"
                        accentColor="blue"
                      />
                    </div>

                    {/* Project Name */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-1.5 text-blue-500" />
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. Q2 Trade Show Giveaways, Employee Welcome Kits..."
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Event Type */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-1.5 text-blue-500" />
                        Event Type
                      </label>
                      <SearchableSelect
                        value={eventType}
                        onChange={setEventType}
                        options={EVENT_TYPES.map(t => ({ id: t, label: t }))}
                        placeholder="Select event type..."
                        searchPlaceholder="Search event types..."
                        accentColor="blue"
                        searchable={false}
                      />
                    </div>

                    {/* Starting Stage */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">
                        <Sparkles className="w-4 h-4 inline mr-1.5 text-blue-500" />
                        Starting Stage
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {STAGES.map((s, idx) => (
                          <button
                            key={s.id}
                            onClick={() => setStage(s.id)}
                            className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                              stage === s.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-8 h-8 mx-auto mb-1.5 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-xs font-bold`}>
                              {idx + 1}
                            </div>
                            <span className={`text-xs font-semibold ${stage === s.id ? 'text-blue-700' : 'text-slate-600'}`}>
                              {s.label}
                            </span>
                            {stage === s.id && (
                              <motion.div layoutId="stage-indicator" className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-generated project ID preview */}
                    {selectedCustomer && projectName && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold text-blue-700 uppercase">Order Preview</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {selectedCustomer.name} — {projectName}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r ${STAGES.find(s => s.id === stage)?.color} text-white`}>
                            {STAGES.find(s => s.id === stage)?.label}
                          </span>
                          {eventType && (
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] font-bold text-slate-600">{eventType}</span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: Logistics & Details */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 space-y-6"
                  >
                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1.5 text-blue-500" />
                          Order Date
                        </label>
                        <DatePicker
                          value={orderDate}
                          onChange={(date) => setOrderDate(date)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          <Clock className="w-4 h-4 inline mr-1.5 text-red-500" />
                          In-Hands Date <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          value={inHandsDate}
                          onChange={(date) => setInHandsDate(date)}
                        />
                      </div>
                    </div>

                    {/* Introduction */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Introduction / Notes</label>
                      <textarea
                        value={introduction}
                        onChange={(e) => setIntroduction(e.target.value)}
                        placeholder="Add any introduction, special instructions, or notes for this order..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Billing & Shipping */}
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-blue-500" />
                          Billing Address
                        </h4>
                        <input
                          type="text"
                          value={billingContact}
                          onChange={(e) => setBillingContact(e.target.value)}
                          placeholder="Contact Name"
                          className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <textarea
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          placeholder="Street, City, State, ZIP"
                          rows={2}
                          className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            Shipping Address
                          </h4>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sameAsBilling}
                              onChange={(e) => setSameAsBilling(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600"
                            />
                            <span className="text-xs font-semibold text-slate-500">Same as Billing</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={shippingContact}
                          onChange={(e) => setShippingContact(e.target.value)}
                          placeholder="Contact Name"
                          disabled={sameAsBilling}
                          className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                        <textarea
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Street, City, State, ZIP"
                          rows={2}
                          disabled={sameAsBilling}
                          className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Terms, Currency, Tax, Margin */}
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Payment Terms</label>
                        <select
                          value={terms}
                          onChange={(e) => setTerms(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Default Tax</label>
                        <select
                          value={defaultTax}
                          onChange={(e) => setDefaultTax(parseFloat(e.target.value))}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          {TAX_RATES.map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
                        </select>
                        {defaultTax === -1 && (
                          <input
                            type="number"
                            step="0.01"
                            value={customTax}
                            onChange={(e) => setCustomTax(e.target.value)}
                            placeholder="Enter %"
                            className="w-full mt-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          <Percent className="w-4 h-4 inline mr-1 text-blue-500" />
                          Default Margin
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={defaultMargin}
                            onChange={(e) => setDefaultMargin(e.target.value)}
                            placeholder="40"
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Customer PO #</label>
                        <input
                          type="text"
                          value={customerPO}
                          onChange={(e) => setCustomerPO(e.target.value)}
                          placeholder="PO-12345"
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Sample Order */}
                    <label className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-all">
                      <input
                        type="checkbox"
                        checked={isSampleOrder}
                        onChange={(e) => setIsSampleOrder(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600"
                      />
                      <div>
                        <span className="font-semibold text-slate-900 text-sm">This is a sample order</span>
                        <p className="text-xs text-slate-500">Mark if this order is for product samples rather than production</p>
                      </div>
                    </label>
                  </motion.div>
                )}

                {/* STEP 3: Products */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 space-y-6"
                  >
                    {/* Info banner */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Adding products is optional</p>
                        <p className="text-xs text-blue-700">You can add products now or after creating the order. Products can be added from your Product Database.</p>
                      </div>
                    </div>

                    {/* Product Search */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <Package className="w-4 h-4 inline mr-1.5 text-blue-500" />
                        Add Products
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products by name, SKU, or category..."
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Product Results */}
                    {productSearch && (
                      <div className="bg-white border-2 border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-50">
                        {loadingProducts ? (
                          <div className="p-4 text-center text-slate-500 text-sm">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-slate-500 text-sm">
                            No products found. Add products in the Product Database first.
                          </div>
                        ) : (
                          filteredProducts.slice(0, 10).map(p => (
                            <div
                              key={p.id}
                              className="px-4 py-3 flex items-center gap-3 hover:bg-blue-50/50 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{p.name || 'Unnamed'}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-slate-400">{p.sku}</span>
                                  {p.supplier && <span className="text-xs text-slate-400">| {p.supplier}</span>}
                                  {p.price && <span className="text-xs font-semibold text-green-600">{p.price}</span>}
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addProduct(p)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add
                              </motion.button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Line Items */}
                    {lineItems.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-700">Order Line Items ({lineItems.length})</h4>
                        <div className="space-y-2">
                          {lineItems.map((item, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white border-2 border-slate-200 rounded-xl p-4"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-5 h-5 text-slate-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900">{item.productName}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-slate-400">{item.sku}</span>
                                    {item.supplier && <span className="text-xs text-slate-500">| {item.supplier}</span>}
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => removeLineItem(idx)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>

                              <div className="grid grid-cols-5 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">QTY</label>
                                  <QuantityStepper
                                    value={item.quantity}
                                    onChange={(val) => updateLineItem(idx, 'quantity', val)}
                                    min={1}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Net Cost</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.netCost}
                                    onChange={(e) => updateLineItem(idx, 'netCost', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Margin %</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={item.margin}
                                    onChange={(e) => updateLineItem(idx, 'margin', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client Price</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.clientPrice}
                                    onChange={(e) => updateLineItem(idx, 'clientPrice', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total</label>
                                  <div className="px-2 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm font-bold text-green-700 text-center">
                                    ${item.total.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Order Summary */}
                        <div className="bg-slate-900 rounded-xl p-5 text-white">
                          <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Order Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Subtotal ({lineItems.length} items)</span>
                              <span className="font-semibold">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Tax ({taxRate}%)</span>
                              <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Booked Margin</span>
                              <span className="font-semibold text-green-400">${totalMarginDollars.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-slate-700 my-2" />
                            <div className="flex justify-between">
                              <span className="font-bold">Grand Total</span>
                              <span className="text-xl font-black">${grandTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {lineItems.length === 0 && !productSearch && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">No products added yet</p>
                        <p className="text-slate-400 text-xs mt-1">Search above to add products, or skip this step and add later</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t-2 border-slate-200 px-8 py-5 flex items-center gap-3 shadow-2xl shrink-0">
              {step > 1 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </motion.button>
              )}

              <div className="flex-1" />

              {step < 3 ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !canProceedStep1}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={saving || !canSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Create Order
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}