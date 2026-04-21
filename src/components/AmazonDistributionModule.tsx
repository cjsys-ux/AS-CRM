import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Calendar, Trash2, Image as ImageIcon, X, Search, Package, RefreshCw, AlertTriangle, Loader2, ChevronDown, Archive, Truck, Pencil, Upload, ChevronsUpDown, ChevronUp, ChevronRight, ChevronLeft, CheckSquare, Edit3, Tag, DollarSign, ArrowLeft, CheckCircle2, BarChart3, EyeOff } from 'lucide-react';
import { AmazonOrderSeeder } from './AmazonOrderSeeder';
import { toast } from 'sonner';
import { DatePicker } from './DatePicker';
import { QuantityStepper } from './QuantityStepper';

type OrderType = 'inventory' | 'deployment';

interface AmazonOrder {
  id: string;
  image?: string;
  activateSwagInvoice: string;
  orderDate: string;
  deliveryDate: string;
  productName: string;
  productId?: string;
  amazonPO: string;
  hasSizeVariants?: boolean;
  orderType?: OrderType;
  sizes: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
    xxxl: number;
    xxxxl: number;
    xxxxxl: number;
  };
  totalQty: number;
  amazonPPU: number;
  amazonProductRevenue: number;
  amazonShippingRevenue: number;
  totalAmazonRevenue: number;
  productCostPPU: number;
  totalProductCost: number;
  shippingCost: number;
  totalCost: number;
  totalProfit: number;
  gpMargin: number;
  ipfProfit: number;
  activateProfit: number;
  activateSwagPPU?: number;
  activateProductRev: number;
  activateShippingRev: number;
  payoutDate: string;
  amazonPaid: boolean;
}

interface ProductDBItem {
  id: string;
  name: string;
  image?: string;
  sku?: string;
  basePrice?: number;
  status?: string;
  category?: string;
  brand?: string;
  productImages?: string[];
}

// ========= ORDER TYPE BADGE =========
function OrderTypeBadge({ type }: { type?: OrderType }) {
  if (!type) return <span className="text-xs text-slate-400 italic">—</span>;
  if (type === 'inventory') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold whitespace-nowrap">
        <Archive className="w-3 h-3" /> Inventory
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold whitespace-nowrap">
      <Truck className="w-3 h-3" /> Deployment
    </span>
  );
}

// ========= PRODUCT NAME PICKER (for Bulk Edit) =========
function ProductNamePicker({
  availableProducts,
  isLoadingProducts,
  selectedName,
  onSelect,
  orderCount,
}: {
  availableProducts: ProductDBItem[];
  isLoadingProducts: boolean;
  selectedName: string;
  onSelect: (name: string) => void;
  orderCount: number;
}) {
  const [query, setQuery] = useState('');
  const filtered = availableProducts.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  const selected = availableProducts.find(p => p.name === selectedName);

  return (
    <div>
      {/* Selected banner */}
      {selected && (
        <div className="flex items-center gap-3 mb-3 px-3 py-2.5 bg-indigo-50 border-2 border-indigo-400 rounded-xl">
          {selected.image ? (
            <img src={selected.image} alt="" className="w-9 h-9 rounded-lg object-contain bg-white border border-indigo-200 p-0.5 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-indigo-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wide leading-none mb-0.5">Selected</p>
            <p className="text-sm font-bold text-indigo-800 truncate">{selected.name}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
        </div>
      )}

      {/* Search box */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          autoFocus
          placeholder="Search products…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
        />
      </div>

      {/* Product list */}
      <div className="max-h-52 overflow-y-auto rounded-xl border-2 border-slate-100 bg-slate-50 divide-y divide-slate-100">
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading products…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Package className="w-8 h-8 mb-2 opacity-40" />
            <span className="text-sm font-medium">{query ? 'No matches found' : 'No products in database'}</span>
          </div>
        ) : filtered.map(prod => {
          const isChosen = selectedName === prod.name;
          return (
            <button
              key={prod.id}
              onClick={() => onSelect(prod.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                isChosen ? 'bg-indigo-50' : 'bg-white hover:bg-slate-50'
              }`}
            >
              {prod.image ? (
                <img src={prod.image} alt="" className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                </div>
              )}
              <span className={`text-sm font-semibold flex-1 truncate ${isChosen ? 'text-indigo-700' : 'text-slate-700'}`}>
                {prod.name}
              </span>
              {prod.sku && (
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{prod.sku}</span>
              )}
              {isChosen && <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 mt-2">
        {availableProducts.length} product{availableProducts.length !== 1 ? 's' : ''} in database · applies to {orderCount} selected order{orderCount > 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ========= ADD ORDER DRAWER =========
function AddOrderDrawer({
  isOpen,
  onClose,
  onSuccess,
  availableProducts,
  isLoadingProducts,
  existingOrders,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableProducts: ProductDBItem[];
  isLoadingProducts: boolean;
  existingOrders: AmazonOrder[];
}) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSizeVariants, setHasSizeVariants] = useState(true);
  const [shippingMarkupPct, setShippingMarkupPct] = useState(30);
  const [orderType, setOrderType] = useState<OrderType>('inventory');

  const [formData, setFormData] = useState({
    activateSwagInvoice: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    amazonPO: '',
    sizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
    singleQty: 0,
    amazonPPU: 0,
    amazonShippingRevenue: 0,
    productCostPPU: 0,
    shippingCost: 0,
    payoutDate: '',
    amazonPaid: false,
  });

  const selectedProduct = availableProducts.find(p => p.id === selectedProductId);

  const filteredProducts = availableProducts.filter(p =>
    (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  // Auto-set payout date to delivery date + 90 days
  useEffect(() => {
    if (!formData.deliveryDate) return;
    const d = new Date(formData.deliveryDate);
    d.setDate(d.getDate() + 90);
    const auto = d.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, payoutDate: auto }));
  }, [formData.deliveryDate]);

  // Auto-generate invoice number when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `ASI-${yyyy}${mm}-`;
    const nums = existingOrders
      .map(o => o.activateSwagInvoice || '')
      .filter(inv => inv.startsWith(prefix))
      .map(inv => parseInt(inv.replace(prefix, ''), 10))
      .filter(n => !isNaN(n));
    const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    const invoice = `${prefix}${String(nextNum).padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, activateSwagInvoice: invoice }));
  }, [isOpen]);

  const totalQty = hasSizeVariants
    ? Object.values(formData.sizes).reduce((sum, v) => sum + (v || 0), 0)
    : (formData.singleQty || 0);
  const amazonProductRevenue = totalQty * formData.amazonPPU;
  const totalAmazonRevenue = amazonProductRevenue + formData.amazonShippingRevenue;
  const totalProductCost = totalQty * formData.productCostPPU;
  const totalCost = totalProductCost + formData.shippingCost;
  const totalProfit = totalAmazonRevenue - totalCost;
  const gpMargin = totalAmazonRevenue > 0 ? (totalProfit / totalAmazonRevenue) * 100 : 0;
  const ipfProfit = totalProfit / 2;
  const activateProfit = totalProfit / 2;

  const grossProfitPPU = formData.amazonPPU - formData.productCostPPU;
  const activateSwagPPU = (formData.amazonPPU > 0 || formData.productCostPPU > 0)
    ? formData.productCostPPU + grossProfitPPU * 0.5
    : 0;
  const activateSwagRevenue = activateSwagPPU * totalQty;

  const handleShippingCostChange = (cost: number) => {
    const shippingRevenue = parseFloat((cost * (1 + shippingMarkupPct / 100)).toFixed(2));
    setFormData(prev => ({ ...prev, shippingCost: cost, amazonShippingRevenue: shippingRevenue }));
  };

  const handleShippingMarkupChange = (pct: number) => {
    setShippingMarkupPct(pct);
    const shippingRevenue = parseFloat((formData.shippingCost * (1 + pct / 100)).toFixed(2));
    setFormData(prev => ({ ...prev, amazonShippingRevenue: shippingRevenue }));
  };

  const resetForm = () => {
    setSelectedProductId('');
    setProductSearch('');
    setHasSizeVariants(true);
    setShippingMarkupPct(30);
    setOrderType('inventory');
    setFormData({
      activateSwagInvoice: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      amazonPO: '',
      sizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
      singleQty: 0,
      amazonPPU: 0,
      amazonShippingRevenue: 0,
      productCostPPU: 0,
      shippingCost: 0,
      payoutDate: '',
      amazonPaid: false,
    });
  };

  const handleSave = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product from the Product Database');
      return;
    }
    if (!formData.amazonPO.trim()) {
      toast.error('Amazon PO is required');
      return;
    }

    setIsSaving(true);
    try {
      const productImg = selectedProduct?.productImages?.[0] || selectedProduct?.image || '';
      const order: any = {
        ...formData,
        productName: selectedProduct?.name || '',
        productId: selectedProductId,
        image: productImg,
        totalQty,
        amazonProductRevenue,
        totalAmazonRevenue,
        totalProductCost,
        totalCost,
        totalProfit,
        gpMargin,
        ipfProfit,
        activateProfit,
        activateSwagPPU,
        activateSwagRevenue,
        activateProductRev: totalProductCost,
        activateShippingRev: formData.shippingCost + formData.amazonShippingRevenue,
        hasSizeVariants,
        orderType,
      };

      const response = await fetch('/api/amazon-orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Amazon order added successfully');
        resetForm();
        onSuccess();
        onClose();
      } else {
        toast.error(`Failed to save: ${data.error || 'unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving Amazon order:', error);
      toast.error('Error saving order');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  useEffect(() => {
    if (!showProductDropdown) return;
    const handler = () => setShowProductDropdown(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showProductDropdown]);

  const sizeKeys: (keyof typeof formData.sizes)[] = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'xxxxl', 'xxxxxl'];
  const sizeLabels: Record<string, string> = { xs: 'XS', s: 'S', m: 'M', l: 'L', xl: 'XL', xxl: '2XL', xxxl: '3XL', xxxxl: '4XL', xxxxxl: '5XL' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add Amazon Order</h2>
                  <p className="text-xs text-slate-400">Create a new line item from your product database</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Product Selection */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Product from Database *</label>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                      onFocus={() => setShowProductDropdown(true)}
                      placeholder="Search products by name or SKU..."
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>

                  <AnimatePresence>
                    {showProductDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto"
                      >
                        {isLoadingProducts ? (
                          <div className="p-4 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading products...
                          </div>
                        ) : filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-sm">
                            {availableProducts.length === 0 ? 'No products in database. Add products first.' : 'No matching products found.'}
                          </div>
                        ) : (
                          filteredProducts.map(p => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setProductSearch(p.name);
                                setShowProductDropdown(false);
                                if (p.basePrice) {
                                  setFormData(prev => ({ ...prev, productCostPPU: p.basePrice! }));
                                }
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left ${selectedProductId === p.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}
                            >
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                                {(p.productImages?.[0] || p.image) ? (
                                  <img src={p.productImages?.[0] || p.image} alt="" className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                                <p className="text-xs text-slate-500">{p.sku || 'No SKU'} {p.basePrice ? `| $${p.basePrice}` : ''}</p>
                              </div>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {p.status || 'Active'}
                              </span>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {selectedProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                      {(selectedProduct.productImages?.[0] || selectedProduct.image) ? (
                        <img src={selectedProduct.productImages?.[0] || selectedProduct.image} alt="" className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{selectedProduct.name}</p>
                      <p className="text-xs text-slate-500">{selectedProduct.sku} | {selectedProduct.brand || 'No brand'}</p>
                    </div>
                    <button onClick={() => { setSelectedProductId(''); setProductSearch(''); }} className="p-1 hover:bg-red-50 rounded-lg">
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Order Type */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Order Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType('inventory')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      orderType === 'inventory'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Archive className={`w-6 h-6 ${orderType === 'inventory' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="text-center">
                      <p className="text-sm font-bold">Inventory</p>
                      <p className="text-[10px] leading-tight mt-0.5 opacity-70">Stock replenishment</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('deployment')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      orderType === 'deployment'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Truck className={`w-6 h-6 ${orderType === 'deployment' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div className="text-center">
                      <p className="text-sm font-bold">Deployment</p>
                      <p className="text-[10px] leading-tight mt-0.5 opacity-70">Customer fulfillment</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Order Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ActivateSwag Invoice</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.activateSwagInvoice}
                        onChange={(e) => setFormData(prev => ({ ...prev, activateSwagInvoice: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-14 bg-white border border-slate-200 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">AUTO</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amazon PO *</label>
                    <input
                      type="text"
                      value={formData.amazonPO}
                      onChange={(e) => setFormData(prev => ({ ...prev, amazonPO: e.target.value }))}
                      placeholder="e.g. 2D-14H08671"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Order Date</label>
                    <DatePicker
                      value={formData.orderDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, orderDate: date }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Delivery Date</label>
                    <DatePicker
                      value={formData.deliveryDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, deliveryDate: date }))}
                    />
                  </div>
                </div>
              </div>

              {/* Size Quantities */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Size Quantities</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Size variants</span>
                    <button
                      type="button"
                      onClick={() => setHasSizeVariants(!hasSizeVariants)}
                      className={`relative w-10 h-5 rounded-full transition-all duration-300 ${hasSizeVariants ? 'bg-orange-500' : 'bg-slate-300'}`}
                    >
                      <motion.div
                        animate={{ x: hasSizeVariants ? 21 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                </div>

                {hasSizeVariants ? (
                  <div className="grid grid-cols-3 gap-2">
                    {sizeKeys.map(key => (
                      <div key={key}>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 text-center">{sizeLabels[key]}</label>
                        <QuantityStepper
                          value={formData.sizes[key] || 0}
                          onChange={(val) => setFormData(prev => ({
                            ...prev,
                            sizes: { ...prev.sizes, [key]: val }
                          }))}
                          min={0}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-48">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 text-center">Quantity (One Size)</label>
                      <QuantityStepper
                        value={formData.singleQty || 0}
                        onChange={(val) => setFormData(prev => ({ ...prev, singleQty: val }))}
                        min={0}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between px-2 py-2 bg-blue-50 rounded-lg">
                  <span className="text-xs font-bold text-blue-700">Total Quantity</span>
                  <span className="text-sm font-black text-blue-800">{totalQty}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Pricing & Revenue</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amazon PPU ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amazonPPU || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amazonPPU: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Product Cost PPU ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.productCostPPU || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, productCostPPU: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Shipping Cost ($)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.shippingCost || ''}
                        onChange={(e) => handleShippingCostChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                      <div className="flex items-center gap-1 bg-white border border-orange-200 rounded-xl px-3 py-2.5">
                        <span className="text-[11px] font-bold text-slate-500">Markup</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="500"
                          value={shippingMarkupPct}
                          onChange={(e) => handleShippingMarkupChange(parseFloat(e.target.value) || 0)}
                          className="w-12 text-sm font-bold text-orange-600 text-center bg-transparent focus:outline-none"
                        />
                        <span className="text-[11px] font-bold text-slate-500">%</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Shipping revenue auto-set to{' '}
                      <span className="font-bold text-green-600">${formData.amazonShippingRevenue.toFixed(2)}</span>
                      {' '}({shippingMarkupPct}% markup — edit below to override)
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Amazon Shipping Revenue ($) <span className="text-slate-400 font-normal">(override if needed)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amazonShippingRevenue || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amazonShippingRevenue: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                </div>

                {(formData.amazonPPU > 0 || formData.productCostPPU > 0) && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-bold text-purple-600 uppercase mb-1.5">Activate Swag Revenue (Cost + 50% Gross Profit)</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-purple-500 flex-1">
                        ${formData.productCostPPU.toFixed(2)} + 50% × (${formData.amazonPPU.toFixed(2)} − ${formData.productCostPPU.toFixed(2)}) ={' '}
                        <span className="font-black text-purple-700">${activateSwagPPU.toFixed(2)} PPU</span>
                      </p>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-purple-400">Total ({totalQty} units)</p>
                        <p className="text-sm font-black text-purple-700">${activateSwagRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="px-3 py-2 bg-green-50 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-green-600 uppercase">Revenue</p>
                    <p className="text-sm font-black text-green-700">${totalAmazonRevenue.toFixed(2)}</p>
                  </div>
                  <div className="px-3 py-2 bg-red-50 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-red-600 uppercase">Total Cost</p>
                    <p className="text-sm font-black text-red-700">${totalCost.toFixed(2)}</p>
                  </div>
                  <div className="px-3 py-2 bg-blue-50 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Profit</p>
                    <p className={`text-sm font-black ${totalProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>${totalProfit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payout */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Payout</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="block text-[11px] font-semibold text-slate-600">Payout Date</label>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">AUTO +90d</span>
                    </div>
                    <DatePicker
                      value={formData.payoutDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, payoutDate: date }))}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Auto-set to 90 days after delivery</p>
                  </div>
                  <div className="flex items-end pb-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-2">Amazon Paid</label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, amazonPaid: !prev.amazonPaid }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
                          formData.amazonPaid ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.amazonPaid ? 'border-white bg-white' : 'border-slate-300'
                        }`}>
                          {formData.amazonPaid && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                        </div>
                        {formData.amazonPaid ? 'Paid' : 'Unpaid'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Add Order'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ========= EDIT ORDER DRAWER =========
function EditOrderDrawer({
  isOpen,
  order,
  onClose,
  onSuccess,
  availableProducts,
  isLoadingProducts,
}: {
  isOpen: boolean;
  order: AmazonOrder | null;
  onClose: () => void;
  onSuccess: (updated: AmazonOrder) => void;
  availableProducts: ProductDBItem[];
  isLoadingProducts: boolean;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasSizeVariants, setHasSizeVariants] = useState(true);
  const [shippingMarkupPct, setShippingMarkupPct] = useState(30);
  const [orderType, setOrderType] = useState<OrderType>('inventory');

  const [formData, setFormData] = useState({
    activateSwagInvoice: '',
    orderDate: '',
    deliveryDate: '',
    amazonPO: '',
    sizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
    singleQty: 0,
    amazonPPU: 0,
    amazonShippingRevenue: 0,
    productCostPPU: 0,
    shippingCost: 0,
    payoutDate: '',
    amazonPaid: false,
  });

  // Populate form when order changes
  useEffect(() => {
    if (!order) return;
    setHasSizeVariants(order.hasSizeVariants !== false);
    setOrderType(order.orderType || 'inventory');
    setFormData({
      activateSwagInvoice: order.activateSwagInvoice || '',
      orderDate: order.orderDate || '',
      deliveryDate: order.deliveryDate || '',
      amazonPO: order.amazonPO || '',
      sizes: order.sizes || { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
      singleQty: order.hasSizeVariants === false ? (order.totalQty || 0) : 0,
      amazonPPU: order.amazonPPU || 0,
      amazonShippingRevenue: order.amazonShippingRevenue || 0,
      productCostPPU: order.productCostPPU || 0,
      shippingCost: order.shippingCost || 0,
      payoutDate: order.payoutDate || '',
      amazonPaid: order.amazonPaid || false,
    });
    // Infer markup pct from existing data
    if ((order.shippingCost || 0) > 0 && (order.amazonShippingRevenue || 0) > 0) {
      const pct = Math.round(((order.amazonShippingRevenue / order.shippingCost) - 1) * 100);
      setShippingMarkupPct(pct >= 0 ? pct : 30);
    }
  }, [order]);

  // Auto-set payout date to delivery date + 90 days (only if user hasn't manually changed it)
  useEffect(() => {
    if (!formData.deliveryDate) return;
    const d = new Date(formData.deliveryDate);
    d.setDate(d.getDate() + 90);
    const auto = d.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, payoutDate: auto }));
  }, [formData.deliveryDate]);

  const totalQty = hasSizeVariants
    ? Object.values(formData.sizes).reduce((sum, v) => sum + (v || 0), 0)
    : (formData.singleQty || 0);
  const amazonProductRevenue = totalQty * formData.amazonPPU;
  const totalAmazonRevenue = amazonProductRevenue + formData.amazonShippingRevenue;
  const totalProductCost = totalQty * formData.productCostPPU;
  const totalCost = totalProductCost + formData.shippingCost;
  const totalProfit = totalAmazonRevenue - totalCost;
  const gpMargin = totalAmazonRevenue > 0 ? (totalProfit / totalAmazonRevenue) * 100 : 0;
  const ipfProfit = totalProfit / 2;
  const activateProfit = totalProfit / 2;
  const grossProfitPPU = formData.amazonPPU - formData.productCostPPU;
  const activateSwagPPU = formData.productCostPPU + grossProfitPPU * 0.5;
  const activateSwagRevenue = activateSwagPPU * totalQty;

  const handleShippingCostChange = (cost: number) => {
    const shippingRevenue = parseFloat((cost * (1 + shippingMarkupPct / 100)).toFixed(2));
    setFormData(prev => ({ ...prev, shippingCost: cost, amazonShippingRevenue: shippingRevenue }));
  };

  const handleShippingMarkupChange = (pct: number) => {
    setShippingMarkupPct(pct);
    const shippingRevenue = parseFloat((formData.shippingCost * (1 + pct / 100)).toFixed(2));
    setFormData(prev => ({ ...prev, amazonShippingRevenue: shippingRevenue }));
  };

  const handleSave = async () => {
    if (!order) return;
    setIsSaving(true);
    try {
      const updatedFields: any = {
        ...formData,
        totalQty,
        amazonProductRevenue,
        totalAmazonRevenue,
        totalProductCost,
        totalCost,
        totalProfit,
        gpMargin,
        ipfProfit,
        activateProfit,
        activateSwagPPU,
        activateSwagRevenue,
        activateProductRev: totalProductCost,
        activateShippingRev: formData.shippingCost + formData.amazonShippingRevenue,
        hasSizeVariants,
        orderType,
      };

      const response = await fetch('/api/amazon-orders/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, ...updatedFields }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Order updated successfully');
        onSuccess({ ...order, ...updatedFields });
        onClose();
      } else {
        toast.error(`Failed to update: ${data.error || 'unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating Amazon order:', error);
      toast.error('Error updating order');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProduct = availableProducts.find(p => p.id === order?.productId) || null;
  const sizeKeys: (keyof typeof formData.sizes)[] = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'xxxxl', 'xxxxxl'];
  const sizeLabels: Record<string, string> = { xs: 'XS', s: 'S', m: 'M', l: 'L', xl: 'XL', xxl: '2XL', xxxl: '3XL', xxxxl: '4XL', xxxxxl: '5XL' };

  return (
    <AnimatePresence>
      {isOpen && order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit Order</h2>
                  <p className="text-xs text-slate-400 truncate max-w-xs">{order.activateSwagInvoice} · {order.productName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Product preview (read-only) */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {(order.image) ? (
                    <img src={order.image} alt="" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{order.productName}</p>
                  <p className="text-xs text-slate-500">Product cannot be changed — delete and re-create to change product</p>
                </div>
                <span className="shrink-0 text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">Locked</span>
              </div>

              {/* Order Type */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Order Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType('inventory')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      orderType === 'inventory'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Archive className={`w-6 h-6 ${orderType === 'inventory' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="text-center">
                      <p className="text-sm font-bold">Inventory</p>
                      <p className="text-[10px] leading-tight mt-0.5 opacity-70">Stock replenishment</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('deployment')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      orderType === 'deployment'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Truck className={`w-6 h-6 ${orderType === 'deployment' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div className="text-center">
                      <p className="text-sm font-bold">Deployment</p>
                      <p className="text-[10px] leading-tight mt-0.5 opacity-70">Customer fulfillment</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Order Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ActivateSwag Invoice</label>
                    <input
                      type="text"
                      value={formData.activateSwagInvoice}
                      onChange={(e) => setFormData(prev => ({ ...prev, activateSwagInvoice: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amazon PO</label>
                    <input
                      type="text"
                      value={formData.amazonPO}
                      onChange={(e) => setFormData(prev => ({ ...prev, amazonPO: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Order Date</label>
                    <DatePicker
                      value={formData.orderDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, orderDate: date }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Delivery Date</label>
                    <DatePicker
                      value={formData.deliveryDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, deliveryDate: date }))}
                    />
                  </div>
                </div>
              </div>

              {/* Size Quantities */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Size Quantities</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Size variants</span>
                    <button
                      type="button"
                      onClick={() => setHasSizeVariants(!hasSizeVariants)}
                      className={`relative w-10 h-5 rounded-full transition-all duration-300 ${hasSizeVariants ? 'bg-blue-500' : 'bg-slate-300'}`}
                    >
                      <motion.div
                        animate={{ x: hasSizeVariants ? 21 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                </div>

                {hasSizeVariants ? (
                  <div className="grid grid-cols-3 gap-2">
                    {sizeKeys.map(key => (
                      <div key={key}>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 text-center">{sizeLabels[key]}</label>
                        <QuantityStepper
                          value={formData.sizes[key] || 0}
                          onChange={(val) => setFormData(prev => ({
                            ...prev,
                            sizes: { ...prev.sizes, [key]: val }
                          }))}
                          min={0}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-48">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 text-center">Quantity (One Size)</label>
                      <QuantityStepper
                        value={formData.singleQty || 0}
                        onChange={(val) => setFormData(prev => ({ ...prev, singleQty: val }))}
                        min={0}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between px-2 py-2 bg-blue-50 rounded-lg">
                  <span className="text-xs font-bold text-blue-700">Total Quantity</span>
                  <span className="text-sm font-black text-blue-800">{totalQty}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Pricing & Revenue</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amazon PPU ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amazonPPU || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amazonPPU: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Product Cost PPU ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.productCostPPU || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, productCostPPU: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Shipping Cost ($)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.shippingCost || ''}
                        onChange={(e) => handleShippingCostChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                      <div className="flex items-center gap-1 bg-white border border-orange-200 rounded-xl px-3 py-2.5">
                        <span className="text-[11px] font-bold text-slate-500">Markup</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="500"
                          value={shippingMarkupPct}
                          onChange={(e) => handleShippingMarkupChange(parseFloat(e.target.value) || 0)}
                          className="w-12 text-sm font-bold text-orange-600 text-center bg-transparent focus:outline-none"
                        />
                        <span className="text-[11px] font-bold text-slate-500">%</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Auto-set shipping revenue to{' '}
                      <span className="font-bold text-green-600">${formData.amazonShippingRevenue.toFixed(2)}</span>
                      {' '}({shippingMarkupPct}% markup — edit below to override)
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Amazon Shipping Revenue ($) <span className="text-slate-400 font-normal">(override if needed)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amazonShippingRevenue || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amazonShippingRevenue: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                </div>

                {(formData.amazonPPU > 0 || formData.productCostPPU > 0) && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-bold text-purple-600 uppercase mb-1.5">Activate Swag Revenue (Cost + 50% Gross Profit)</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-purple-500 flex-1">
                        ${formData.productCostPPU.toFixed(2)} + 50% × (${formData.amazonPPU.toFixed(2)} − ${formData.productCostPPU.toFixed(2)}) ={' '}
                        <span className="font-black text-purple-700">${activateSwagPPU.toFixed(2)} PPU</span>
                      </p>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-purple-400">Total ({totalQty} units)</p>
                        <p className="text-sm font-black text-purple-700">${activateSwagRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="px-3 py-2 bg-green-50 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-green-600 uppercase">Revenue</p>
                    <p className="text-sm font-black text-green-700">${totalAmazonRevenue.toFixed(2)}</p>
                  </div>
                  <div className="px-3 py-2 bg-red-50 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-red-600 uppercase">Total Cost</p>
                    <p className="text-sm font-black text-red-700">${totalCost.toFixed(2)}</p>
                  </div>
                  <div className="px-3 py-2 bg-blue-50 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Profit</p>
                    <p className={`text-sm font-black ${totalProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>${totalProfit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payout */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Payout</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="block text-[11px] font-semibold text-slate-600">Payout Date</label>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">AUTO +90d</span>
                    </div>
                    <DatePicker
                      value={formData.payoutDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, payoutDate: date }))}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Auto-set to 90 days after delivery</p>
                  </div>
                  <div className="flex items-end pb-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-2">Amazon Paid</label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, amazonPaid: !prev.amazonPaid }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
                          formData.amazonPaid ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.amazonPaid ? 'border-white bg-white' : 'border-slate-300'
                        }`}>
                          {formData.amazonPaid && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                        </div>
                        {formData.amazonPaid ? 'Paid' : 'Unpaid'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ========= DELETE CONFIRM MODAL =========
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  orderName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderName: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Order</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete the order for <span className="font-bold text-slate-900">{orderName}</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ========= MAIN MODULE =========
export function AmazonDistributionModule() {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [orderTypeTab, setOrderTypeTab] = useState<'all' | OrderType>('all');
  const [timeFilter, setTimeFilter] = useState<'year' | 'month' | 'custom'>('year');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showKPIs, setShowKPIs] = useState(true);
  const [orders, setOrders] = useState<AmazonOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [seederOpen, setSeederOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<AmazonOrder | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<AmazonOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selection & bulk edit
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<{
    image?: string; orderType?: string; productName?: string;
    amazonPPU?: string; productCostPPU?: string; activateSwagPPU?: string;
  }>({});
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkEditStep, setBulkEditStep] = useState<'pick' | 'edit'>('pick');
  const [bulkEditField, setBulkEditField] = useState<string | null>(null);
  const [imageDragOver, setImageDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState<'orderDate' | 'deliveryDate' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Hovered row (for sticky cell bg sync with hover)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const [availableProducts, setAvailableProducts] = useState<ProductDBItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/amazon-orders/list');
      const data = await response.json();
      if (response.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch Amazon orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching Amazon orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch('/api/productdb/list');
      const data = await response.json();
      if (response.ok && data.success) {
        const parsed = (data.products || []).filter((p: any) => p && p.name);
        setAvailableProducts(parsed);
      }
    } catch (error) {
      console.error('Error fetching products for Amazon module:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch('/api/amazon-orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderToDelete.id }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Order deleted successfully');
        setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      } else {
        toast.error(`Failed to delete: ${data.error || 'unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting Amazon order:', error);
      toast.error('Error deleting order');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleTogglePaid = async (order: AmazonOrder) => {
    try {
      const response = await fetch('/api/amazon-orders/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, amazonPaid: !order.amazonPaid }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, amazonPaid: !o.amazonPaid } : o));
      }
    } catch (error) {
      console.error('Error toggling paid status:', error);
    }
  };

  const handleBulkSave = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkSaving(true);
    const updates: any = {};
    if (bulkEditData.image !== undefined && bulkEditData.image !== '') updates.image = bulkEditData.image;
    if (bulkEditData.orderType !== undefined && bulkEditData.orderType !== '') updates.orderType = bulkEditData.orderType;
    if (bulkEditData.productName !== undefined && bulkEditData.productName !== '') updates.productName = bulkEditData.productName;
    if (bulkEditData.amazonPPU !== undefined && bulkEditData.amazonPPU !== '') {
      const ppu = parseFloat(bulkEditData.amazonPPU);
      if (!isNaN(ppu)) updates.amazonPPU = ppu;
    }
    if (bulkEditData.productCostPPU !== undefined && bulkEditData.productCostPPU !== '') {
      const ppu = parseFloat(bulkEditData.productCostPPU);
      if (!isNaN(ppu)) updates.productCostPPU = ppu;
    }
    if (bulkEditData.activateSwagPPU !== undefined && bulkEditData.activateSwagPPU !== '') {
      const ppu = parseFloat(bulkEditData.activateSwagPPU);
      if (!isNaN(ppu)) updates.activateSwagPPU = ppu;
    }
    if (Object.keys(updates).length === 0) {
      toast.error('No changes to apply');
      setIsBulkSaving(false);
      return;
    }
    let success = 0; let failed = 0;
    await Promise.all([...selectedIds].map(async (id) => {
      try {
        const order = orders.find(o => o.id === id);
        if (!order) return;
        // Recalc derived fields if PPU values changed
        const newAmazonPPU = updates.amazonPPU ?? order.amazonPPU ?? 0;
        const newCostPPU = updates.productCostPPU ?? order.productCostPPU ?? 0;
        const newActivatePPU = updates.activateSwagPPU ?? (newCostPPU + (newAmazonPPU - newCostPPU) * 0.5);
        const qty = order.totalQty || 0;
        const amazonProductRevenue = parseFloat((qty * newAmazonPPU).toFixed(2));
        const totalAmazonRevenue = parseFloat((amazonProductRevenue + (order.amazonShippingRevenue || 0)).toFixed(2));
        const totalProductCost = parseFloat((qty * newCostPPU).toFixed(2));
        const totalCost = parseFloat((totalProductCost + (order.shippingCost || 0)).toFixed(2));
        const totalProfit = parseFloat((totalAmazonRevenue - totalCost).toFixed(2));
        const gpMargin = totalAmazonRevenue > 0 ? parseFloat(((totalProfit / totalAmazonRevenue) * 100).toFixed(2)) : 0;
        const payload = {
          ...updates,
          activateSwagPPU: newActivatePPU,
          amazonProductRevenue, totalAmazonRevenue, totalProductCost, totalCost, totalProfit, gpMargin,
          ipfProfit: parseFloat((totalProfit / 2).toFixed(2)),
          activateProfit: parseFloat((totalProfit / 2).toFixed(2)),
          activateProductRev: totalProductCost,
          activateSwagRevenue: parseFloat((newActivatePPU * qty).toFixed(2)),
        };
        const res = await fetch('/api/amazon-orders/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...payload }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          success++;
          setOrders(prev => prev.map(o => o.id === id ? { ...o, ...payload } : o));
        } else { failed++; }
      } catch { failed++; }
    }));
    setIsBulkSaving(false);
    setBulkEditOpen(false);
    setBulkEditData({});
    setSelectedIds(new Set());
    if (failed === 0) toast.success(`Updated ${success} orders successfully`);
    else toast.error(`Updated ${success}, failed ${failed}`);
  };

  const uniqueProductNames = [...new Set(orders.map(o => o.productName).filter(Boolean))];

  // Reset sub-tab when switching products
  const handleProductChange = (name: string) => {
    setSelectedProduct(name);
    setOrderTypeTab('all');
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // Filter orders by product, time filter, and order type tab
  const productFilteredOrders = orders.filter(o => {
    if (selectedProduct !== 'all' && o.productName !== selectedProduct) return false;
    
    // Time filtering
    if (timeFilter === 'year' && selectedYear !== 'all') {
      const orderYear = (o.orderDate || '').includes('-')
        ? o.orderDate.split('-')[0]
        : o.orderDate.split('/').pop();
      if (orderYear !== selectedYear) return false;
    } else if (timeFilter === 'month') {
      const orderYear = (o.orderDate || '').includes('-')
        ? o.orderDate.split('-')[0]
        : o.orderDate.split('/').pop();
      if (selectedYear !== 'all' && orderYear !== selectedYear) return false;
      if (selectedMonth !== 'all') {
        const orderMonth = (o.orderDate || '').includes('-')
          ? o.orderDate.split('-')[1]
          : (o.orderDate || '').split('/')[0]?.padStart(2, '0');
        if (orderMonth !== selectedMonth) return false;
      }
    } else if (timeFilter === 'custom' && customStartDate && customEndDate) {
      const orderDate = o.orderDate || '';
      if (orderDate < customStartDate || orderDate > customEndDate) return false;
    }
    return true;
  });

  // Sub-tab counts (only when a specific product is selected)
  const inventoryCount = productFilteredOrders.filter(o => o.orderType === 'inventory' || !o.orderType).length;
  const deploymentCount = productFilteredOrders.filter(o => o.orderType === 'deployment').length;

  const filteredOrders = productFilteredOrders.filter(o => {
    if (orderTypeTab === 'all') return true;
    if (orderTypeTab === 'inventory') return o.orderType === 'inventory' || !o.orderType;
    if (orderTypeTab === 'deployment') return o.orderType === 'deployment';
    return true;
  });

  // Sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortField) return 0;
    const av = a[sortField] || '';
    const bv = b[sortField] || '';
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedOrders = sortedOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (field: 'orderDate' | 'deliveryDate') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // Totals row (always over ALL filtered, not just page)
  const totals = filteredOrders.reduce((acc, o) => ({
    totalQty: acc.totalQty + (o.totalQty || 0),
    amazonProductRevenue: acc.amazonProductRevenue + (o.amazonProductRevenue || 0),
    amazonShippingRevenue: acc.amazonShippingRevenue + (o.amazonShippingRevenue || 0),
    totalAmazonRevenue: acc.totalAmazonRevenue + (o.totalAmazonRevenue || 0),
    totalProductCost: acc.totalProductCost + (o.totalProductCost || 0),
    shippingCost: acc.shippingCost + (o.shippingCost || 0),
    totalCost: acc.totalCost + (o.totalCost || 0),
    totalProfit: acc.totalProfit + (o.totalProfit || 0),
    ipfProfit: acc.ipfProfit + (o.ipfProfit || 0),
    activateProfit: acc.activateProfit + (o.activateProfit || 0),
    activateProductRev: acc.activateProductRev + (o.activateProductRev || 0),
    activateShippingRev: acc.activateShippingRev + (o.activateShippingRev || 0),
  }), {
    totalQty: 0, amazonProductRevenue: 0, amazonShippingRevenue: 0, totalAmazonRevenue: 0,
    totalProductCost: 0, shippingCost: 0, totalCost: 0, totalProfit: 0,
    ipfProfit: 0, activateProfit: 0, activateProductRev: 0, activateShippingRev: 0,
  });
  const totalsGPMargin = totals.totalAmazonRevenue > 0 ? (totals.totalProfit / totals.totalAmazonRevenue) * 100 : 0;

  const showSizeCols = filteredOrders.some(o => o.hasSizeVariants !== false);

  const availableYears = [...new Set(orders.map(o => {
    if (!o.orderDate) return '';
    return o.orderDate.includes('-') ? o.orderDate.split('-')[0] : o.orderDate.split('/').pop() || '';
  }).filter(Boolean))].sort().reverse();

  const formatDate = (d: string) => {
    if (!d) return '—';
    return d;
  };

  const fmtNum = (n: number) => n.toLocaleString('en-US');
  const fmtCur = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  // Compute explicit background for sticky cells (prevents colored-column bleed-through on horizontal scroll)
  const getStickyBgColor = (order: AmazonOrder, index: number): string => {
    if (hoveredRow === order.id || selectedIds.has(order.id!)) return '#eff6ff';
    return index % 2 === 0 ? '#ffffff' : '#f8fafc';
  };

  const showSubTabs = selectedProduct !== 'all';

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Amazon Distribution</h1>
            <p className="text-sm text-slate-500">Track Amazon orders, inventory, and profitability across all products</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Time Filter */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              {(['year', 'month', 'custom'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => { setTimeFilter(f); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors capitalize ${
                    timeFilter === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Year Selector — visible for year & month modes */}
            {(timeFilter === 'year' || timeFilter === 'month') && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Years</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Month Selector — visible for month mode */}
            {timeFilter === 'month' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <select
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Months</option>
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                    <option key={m} value={m}>
                      {new Date(2000, parseInt(m) - 1).toLocaleString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Date Range */}
            {timeFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => { setCustomStartDate(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400 font-medium">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => { setCustomEndDate(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Refresh */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { fetchOrders(); fetchProducts(); }}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>

            {/* Bulk Import Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSeederOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              title="Bulk import orders from spreadsheet data"
            >
              <Upload className="w-4 h-4" />
              Bulk Import
            </motion.button>
          </div>
        </div>

        {/* Product Filter + Sub-tabs + Add Order row */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Select Product:</label>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductChange(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Products ({orders.length} orders)</option>
              {uniqueProductNames.map(name => (
                <option key={name} value={name}>
                  {name} ({orders.filter(o => o.productName === name).length})
                </option>
              ))}
            </select>
          </div>

          {/* Sub-tabs — visible only when a product is selected */}
          <AnimatePresence>
            {showSubTabs && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-1 bg-slate-100 rounded-lg p-1"
              >
                <button
                  onClick={() => { setOrderTypeTab('all'); setCurrentPage(1); setSelectedIds(new Set()); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                    orderTypeTab === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    orderTypeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>{productFilteredOrders.length}</span>
                </button>
                <button
                  onClick={() => { setOrderTypeTab('inventory'); setCurrentPage(1); setSelectedIds(new Set()); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                    orderTypeTab === 'inventory'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  Inventory
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    orderTypeTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>{inventoryCount}</span>
                </button>
                <button
                  onClick={() => { setOrderTypeTab('deployment'); setCurrentPage(1); setSelectedIds(new Set()); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                    orderTypeTab === 'deployment'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Deployments
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    orderTypeTab === 'deployment' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>{deploymentCount}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 sm:ml-auto">
            {/* KPI Toggle */}
            {selectedProduct !== 'all' && (
              <button
                onClick={() => setShowKPIs(!showKPIs)}
                className={`p-2.5 rounded-lg border transition-all ${showKPIs ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                title={showKPIs ? 'Hide KPIs' : 'Show KPIs'}
              >
                {showKPIs ? <EyeOff className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              </button>
            )}

            {/* Add Order Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Order
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
            {orderTypeTab === 'inventory' ? (
              <Archive className="w-16 h-16 text-slate-300 mb-4" />
            ) : orderTypeTab === 'deployment' ? (
              <Truck className="w-16 h-16 text-slate-300 mb-4" />
            ) : (
              <Package className="w-16 h-16 text-slate-300 mb-4" />
            )}
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              {orderTypeTab === 'inventory' ? 'No Inventory Orders' : orderTypeTab === 'deployment' ? 'No Deployment Orders' : 'No Amazon Orders Yet'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {orderTypeTab !== 'all'
                ? `No ${orderTypeTab} orders found for this product. Switch to "All" or add a new order.`
                : 'Click "Add Order" to create your first Amazon distribution entry from your product database.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Order
            </motion.button>
          </div>
        ) : (
          <>
          {/* ── KPI Cards — visible only when a specific product is selected & toggled on ── */}
          {selectedProduct !== 'all' && showKPIs && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 sm:gap-3">
              {/* Total Orders */}
              <div className="bg-white rounded-xl border border-slate-200 px-3 py-3 shadow-sm min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">Total Orders</p>
                <p className="text-lg font-black text-slate-900 truncate">{fmtNum(filteredOrders.length)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{inventoryCount} inv · {deploymentCount} dep</p>
              </div>
              {/* Total Units */}
              <div className="bg-white rounded-xl border border-blue-200 px-3 py-3 shadow-sm min-w-0">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 truncate">Total Units</p>
                <p className="text-lg font-black text-blue-700 truncate">{fmtNum(totals.totalQty)}</p>
                <p className="text-[10px] text-blue-300 mt-0.5 truncate">units shipped</p>
              </div>
              {/* Amazon Revenue */}
              <div className="bg-white rounded-xl border border-green-200 px-3 py-3 shadow-sm min-w-0">
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1 truncate">Amazon Rev</p>
                <p className="text-lg font-black text-green-700 truncate">{fmtCur(totals.totalAmazonRevenue)}</p>
                <p className="text-[10px] text-green-400 mt-0.5 truncate">product + shipping</p>
              </div>
              {/* Activate Revenue */}
              <div className="bg-white rounded-xl border border-orange-200 px-3 py-3 shadow-sm min-w-0">
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1 truncate">Activate Rev</p>
                <p className="text-lg font-black text-orange-600 truncate">{fmtCur(totals.activateProductRev + totals.activateShippingRev)}</p>
                <p className="text-[10px] text-orange-300 mt-0.5 truncate">product + shipping</p>
              </div>
              {/* Total Cost */}
              <div className="bg-white rounded-xl border border-red-200 px-3 py-3 shadow-sm min-w-0">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 truncate">Total Cost</p>
                <p className="text-lg font-black text-red-600 truncate">{fmtCur(totals.totalCost)}</p>
                <p className="text-[10px] text-red-300 mt-0.5 truncate">product + shipping</p>
              </div>
              {/* Total Profit */}
              <div className={`bg-white rounded-xl border px-3 py-3 shadow-sm min-w-0 ${totals.totalProfit >= 0 ? 'border-blue-200' : 'border-red-200'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 truncate ${totals.totalProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>Total Profit</p>
                <p className={`text-lg font-black truncate ${totals.totalProfit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>{fmtCur(totals.totalProfit)}</p>
                <p className={`text-[10px] mt-0.5 truncate ${totals.totalProfit >= 0 ? 'text-blue-300' : 'text-red-300'}`}>rev minus costs</p>
              </div>
              {/* GP Margin */}
              <div className="bg-white rounded-xl border border-slate-200 px-3 py-3 shadow-sm min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">GP Margin</p>
                <p className={`text-lg font-black truncate ${totalsGPMargin >= 30 ? 'text-emerald-600' : totalsGPMargin >= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                  {fmtPct(totalsGPMargin)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">gross profit %</p>
              </div>
              {/* Activate Profit */}
              <div className="bg-white rounded-xl border border-purple-200 px-3 py-3 shadow-sm min-w-0">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1 truncate">Activate Profit</p>
                <p className="text-lg font-black text-purple-700 truncate">{fmtCur(totals.activateProfit)}</p>
                <p className="text-[10px] text-purple-300 mt-0.5 truncate">50% of net profit</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-600 text-white">
                <CheckSquare className="w-4 h-4 shrink-0" />
                <span className="text-sm font-bold">{selectedIds.size} order{selectedIds.size > 1 ? 's' : ''} selected</span>
                <button
                  onClick={() => { setBulkEditData({}); setBulkEditStep('pick'); setBulkEditField(null); setBulkEditOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Bulk Edit
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-blue-700 text-white font-semibold text-xs rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
            )}

            {/* Table toolbar — page size + pagination */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Show</span>
                {([25, 50, 100] as const).map(n => (
                  <button
                    key={n}
                    onClick={() => { setPageSize(n); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${pageSize === n ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}
                  >
                    {n}
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-1">of {sortedOrders.length} orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold text-slate-700 px-2">Page {safePage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-auto max-h-[calc(100vh-280px)]">
              <table className="w-full">
                <thead className="sticky top-0 z-30">
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap sticky left-0 bg-slate-900 z-20 w-12">
                      <input
                        type="checkbox"
                        className="rounded cursor-pointer accent-blue-500"
                        checked={pagedOrders.length > 0 && pagedOrders.every(o => selectedIds.has(o.id!))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => new Set([...prev, ...pagedOrders.map(o => o.id!)]));
                          } else {
                            setSelectedIds(prev => { const s = new Set(prev); pagedOrders.forEach(o => s.delete(o.id!)); return s; });
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap sticky left-[48px] bg-slate-900 z-20">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap sticky left-[128px] bg-slate-900 z-20 min-w-[200px]">Product Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap sticky left-[340px] bg-slate-900 z-20">Amazon PO</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap sticky left-[476px] bg-slate-900 z-20 cursor-pointer select-none hover:bg-slate-800 transition-colors" style={{ boxShadow: '4px 0 8px -2px rgba(0,0,0,0.15)' }} onClick={() => handleSort('orderDate')}>
                      <div className="flex items-center gap-1.5">
                        Order Date
                        {sortField === 'orderDate' ? (sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap min-w-[120px]">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase hidden DDATE_FINAL cursor-pointer select-none hover:bg-slate-800 transition-colors" onClick={() => handleSort('deliveryDate')}>
                      <div className="flex items-center gap-1.5">
                        Delivery Date
                        {sortField === 'deliveryDate' ? (sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap" style={{display:'none'}}></th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap" style={{display:'none'}}></th>
                    {showSizeCols && <>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-800">XS</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-700">S</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-600">M</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-700">L</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-800">XL</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-900">2XL</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-800">3XL</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-700">4XL</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-600">5XL</th>
                    </>}
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-blue-700">Total Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-green-700">Amazon PPU</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-green-600">Amazon Product Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-green-700">Amazon Shipping Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-green-800">Total Amazon Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-red-800">Product Cost PPU</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-red-700">Total Product Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-red-800">Shipping Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-red-900">Total Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-blue-800">Total Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-slate-700">GP Margin %</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-purple-800">IPF Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-purple-700">Activate Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-orange-600">Activate PPU</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-orange-700">Activate Product Rev</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-orange-800">Activate Shipping Rev</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap cursor-pointer select-none hover:bg-slate-800 transition-colors" onClick={() => handleSort('deliveryDate')}>
                      <div className="flex items-center gap-1.5">
                        Delivery Date
                        {sortField === 'deliveryDate' ? (sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Payout Date</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap">Amazon Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Activate Swag Invoice</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      onMouseEnter={() => setHoveredRow(order.id!)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-b border-slate-200 hover:bg-blue-50 transition-colors ${
                        selectedIds.has(order.id!) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-4 sticky left-0 z-10" style={{ backgroundColor: getStickyBgColor(order, index) }}>
                        <input
                          type="checkbox"
                          className="rounded cursor-pointer accent-blue-500"
                          checked={selectedIds.has(order.id!)}
                          onChange={(e) => {
                            setSelectedIds(prev => {
                              const s = new Set(prev);
                              e.target.checked ? s.add(order.id!) : s.delete(order.id!);
                              return s;
                            });
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 sticky left-[48px] z-10" style={{ backgroundColor: getStickyBgColor(order, index) }}>
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {order.image ? (
                            <img src={order.image} alt="" className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 sticky left-[128px] z-10 min-w-[200px]" style={{ backgroundColor: getStickyBgColor(order, index) }}>
                        <span className="text-sm font-medium text-slate-900 leading-snug">{order.productName}</span>
                      </td>
                      <td className="px-4 py-4 sticky left-[340px] z-10 whitespace-nowrap" style={{ backgroundColor: getStickyBgColor(order, index) }}>
                        <span className="text-sm text-slate-700">{order.amazonPO}</span>
                      </td>
                      <td className="px-4 py-4 sticky left-[476px] z-10 whitespace-nowrap" style={{ backgroundColor: getStickyBgColor(order, index), boxShadow: '4px 0 8px -2px rgba(0,0,0,0.08)' }}>
                        <span className="text-sm text-slate-700">{formatDate(order.orderDate)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <OrderTypeBadge type={order.orderType} />
                      </td>
                      {showSizeCols && order.hasSizeVariants !== false && <>
                        <td className="px-4 py-4 text-center"><span className="text-sm text-slate-700">{order.sizes?.xs || 0}</span></td>
                        <td className="px-4 py-4 text-center"><span className="text-sm text-slate-700">{order.sizes?.s || 0}</span></td>
                        <td className="px-4 py-4 text-center"><span className="text-sm text-slate-700">{order.sizes?.m || 0}</span></td>
                        <td className="px-4 py-4 text-center"><span className="text-sm text-slate-700">{order.sizes?.l || 0}</span></td>
                        <td className="px-4 py-4 text-center"><span className="text-sm text-slate-700">{order.sizes?.xl || 0}</span></td>
                        <td className="px-4 py-4 text-center"><span className="text-sm text-slate-700">{order.sizes?.xxl || 0}</span></td>
                        <td className="px-4 py-4 text-center"><span className="text-sm text-slate-700">{order.sizes?.xxxl || 0}</span></td>
                        <td className="px-4 py-4 text-center"><span className="text-sm text-slate-700">{order.sizes?.xxxxl || 0}</span></td>
                        <td className="px-4 py-4 text-center"><span className="text-sm text-slate-700">{order.sizes?.xxxxxl || 0}</span></td>
                      </>}
                      {showSizeCols && order.hasSizeVariants === false && (
                        <td className="px-4 py-4 text-center" colSpan={9}>
                          <span className="text-xs text-slate-400 italic">One Size</span>
                        </td>
                      )}
                      <td className="px-4 py-4 text-center bg-blue-50">
                        <span className="text-sm font-bold text-blue-700">{fmtNum(order.totalQty || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-semibold text-green-700">{fmtCur(order.amazonPPU || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-semibold text-green-700">{fmtCur(order.amazonProductRevenue || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-semibold text-green-700">{fmtCur(order.amazonShippingRevenue || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-bold text-green-800">{fmtCur(order.totalAmazonRevenue || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-red-50">
                        <span className="text-sm font-semibold text-red-600">{fmtCur(order.productCostPPU || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-red-50">
                        <span className="text-sm font-semibold text-red-600">{fmtCur(order.totalProductCost || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-red-50">
                        <span className="text-sm font-semibold text-red-600">{fmtCur(order.shippingCost || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-red-50">
                        <span className="text-sm font-semibold text-red-600">{fmtCur(order.totalCost || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-blue-50">
                        <span className={`text-sm font-semibold ${(order.totalProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {fmtCur(order.totalProfit || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-slate-700">{fmtPct(order.gpMargin || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-purple-50">
                        <span className="text-sm font-semibold text-purple-600">{fmtCur(order.ipfProfit || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-purple-50">
                        <span className="text-sm font-semibold text-purple-600">{fmtCur(order.activateProfit || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-orange-50">
                        <span className="text-sm font-semibold text-orange-600">
                          {fmtCur((order.activateSwagPPU ?? (order.productCostPPU + (order.amazonPPU - order.productCostPPU) * 0.5)) || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-4 bg-orange-50">
                        <span className="text-sm font-semibold text-orange-600">{fmtCur(order.activateProductRev || 0)}</span>
                      </td>
                      <td className="px-4 py-4 bg-orange-50">
                        <span className="text-sm font-semibold text-orange-600">{fmtCur(order.activateShippingRev || 0)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{formatDate(order.deliveryDate)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{formatDate(order.payoutDate)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleTogglePaid(order)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition-all whitespace-nowrap ${
                              order.amazonPaid
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                              order.amazonPaid ? 'border-white bg-white' : 'border-slate-300'
                            }`}>
                              {order.amazonPaid && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                            </div>
                            {order.amazonPaid ? 'Paid' : 'Unpaid'}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-medium text-slate-900">{order.activateSwagInvoice || '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setOrderToEdit(order);
                              setEditDrawerOpen(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit order"
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setOrderToDelete(order);
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Totals Row */}
                  {filteredOrders.length > 0 && (
                    <tr className="bg-slate-900 text-white font-bold">
                      <td className="px-4 py-3 sticky left-0 z-10" style={{ backgroundColor: '#0f172a' }} />
                      <td className="px-4 py-3 sticky left-[48px] z-10" style={{ backgroundColor: '#0f172a' }} />
                      <td className="px-4 py-3 sticky left-[128px] z-10" style={{ backgroundColor: '#0f172a' }} />
                      <td className="px-4 py-3 sticky left-[340px] z-10" style={{ backgroundColor: '#0f172a' }} />
                      <td className="px-4 py-3 sticky left-[476px] z-10" style={{ backgroundColor: '#0f172a', boxShadow: '4px 0 8px -2px rgba(0,0,0,0.15)' }} />
                      <td className="px-4 py-3 text-sm uppercase tracking-wider">Totals</td>
                      {showSizeCols && <td className="px-4 py-3" colSpan={9} />}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold">{fmtNum(totals.totalQty)}</span>
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3">
                        <span className="text-sm">{fmtCur(totals.amazonProductRevenue)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{fmtCur(totals.amazonShippingRevenue)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold">{fmtCur(totals.totalAmazonRevenue)}</span>
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3">
                        <span className="text-sm">{fmtCur(totals.totalProductCost)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{fmtCur(totals.shippingCost)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold">{fmtCur(totals.totalCost)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold">{fmtCur(totals.totalProfit)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{fmtPct(totalsGPMargin)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{fmtCur(totals.ipfProfit)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{fmtCur(totals.activateProfit)}</span>
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3">
                        <span className="text-sm">{fmtCur(totals.activateProductRev)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{fmtCur(totals.activateShippingRev)}</span>
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3" />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-500">
                  Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedOrders.length)} of {sortedOrders.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(1)} disabled={safePage <= 1} className="px-2 py-1 text-xs rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} className="px-2 py-1 text-xs rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(safePage - 3, totalPages - 6));
                    const pg = start + i;
                    return pg <= totalPages ? (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`px-2.5 py-1 text-xs rounded border font-semibold transition-colors ${pg === safePage ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >{pg}</button>
                    ) : null;
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="px-2 py-1 text-xs rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">›</button>
                  <button onClick={() => setCurrentPage(totalPages)} disabled={safePage >= totalPages} className="px-2 py-1 text-xs rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
                </div>
              </div>
            )}
          </div>
          </>
        )}
      </div>

      {/* Bulk Edit Modal — 2-step wizard */}
      <AnimatePresence>
        {bulkEditOpen && (() => {
          // ── field catalogue ──────────────────────────────
          const FIELDS = [
            { id: 'image',          label: 'Product Image',   icon: <ImageIcon className="w-5 h-5" />,   color: 'slate',  desc: 'Upload or drag a new product photo' },
            { id: 'orderType',      label: 'Order Type',      icon: <Tag className="w-5 h-5" />,          color: 'blue',   desc: 'Inventory or Deployment' },
            { id: 'productName',    label: 'Product Name',    icon: <Package className="w-5 h-5" />,      color: 'indigo', desc: 'Rename the product on all orders' },
            { id: 'amazonPPU',      label: 'Amazon PPU',      icon: <DollarSign className="w-5 h-5" />,   color: 'green',  desc: 'Price per unit on Amazon' },
            { id: 'productCostPPU', label: 'Cost PPU',        icon: <DollarSign className="w-5 h-5" />,   color: 'red',    desc: 'Your product cost per unit' },
            { id: 'activateSwagPPU',label: 'Activate PPU',   icon: <DollarSign className="w-5 h-5" />,   color: 'orange', desc: 'Auto-calc or manual override' },
          ];
          const colorMap: Record<string, string> = {
            slate: 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-500',
            blue:  'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-500',
            indigo:'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-500',
            green: 'bg-green-50 text-green-700 border-green-200 hover:border-green-500',
            red:   'bg-red-50 text-red-700 border-red-200 hover:border-red-500',
            orange:'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-500',
          };
          const colorSelectedMap: Record<string, string> = {
            slate: 'bg-slate-800 text-white border-slate-800',
            blue:  'bg-blue-600 text-white border-blue-600',
            indigo:'bg-indigo-600 text-white border-indigo-600',
            green: 'bg-green-600 text-white border-green-600',
            red:   'bg-red-600 text-white border-red-600',
            orange:'bg-orange-500 text-white border-orange-500',
          };
          const activeField = FIELDS.find(f => f.id === bulkEditField);

          // ── image file handler ───────────────────────────
          const handleImageFile = (file: File) => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = e => setBulkEditData(p => ({ ...p, image: e.target?.result as string }));
            reader.readAsDataURL(file);
          };

          // ── derived Activate PPU preview ─────────────────
          const autoActivate = bulkEditData.amazonPPU && bulkEditData.productCostPPU
            ? (parseFloat(bulkEditData.productCostPPU) + (parseFloat(bulkEditData.amazonPPU) - parseFloat(bulkEditData.productCostPPU)) * 0.5).toFixed(2)
            : null;

          // ── can apply? ───────────────────────────────────
          const canApply = bulkEditField && (
            (bulkEditField === 'image' && !!bulkEditData.image) ||
            (bulkEditField === 'orderType' && !!bulkEditData.orderType) ||
            (bulkEditField === 'productName' && !!bulkEditData.productName?.trim()) ||
            (bulkEditField === 'amazonPPU' && !!bulkEditData.amazonPPU) ||
            (bulkEditField === 'productCostPPU' && !!bulkEditData.productCostPPU) ||
            (bulkEditField === 'activateSwagPPU' && !!bulkEditData.activateSwagPPU)
          );

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => !isBulkSaving && setBulkEditOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: 'spring', damping: 30, stiffness: 380 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {bulkEditStep === 'edit' && (
                      <button
                        onClick={() => { setBulkEditStep('pick'); setBulkEditField(null); setBulkEditData({}); }}
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 text-slate-300" />
                      </button>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {bulkEditStep === 'pick' ? 'Bulk Edit Orders' : `Edit ${activeField?.label}`}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {bulkEditStep === 'pick'
                          ? `${selectedIds.size} order${selectedIds.size > 1 ? 's' : ''} selected — choose a field to update`
                          : `Applies to ${selectedIds.size} order${selectedIds.size > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  {!isBulkSaving && (
                    <button onClick={() => setBulkEditOpen(false)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-slate-300" />
                    </button>
                  )}
                </div>

                {/* Body */}
                <AnimatePresence mode="wait">
                  {bulkEditStep === 'pick' ? (
                    /* ── STEP 1: Field Picker ─────────────────────── */
                    <motion.div
                      key="pick"
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.18 }}
                      className="p-5"
                    >
                      <p className="text-xs text-slate-500 mb-3 font-medium">Select which field you want to update across all selected orders:</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {FIELDS.map(field => (
                          <button
                            key={field.id}
                            onClick={() => { setBulkEditField(field.id); setBulkEditStep('edit'); setBulkEditData({}); }}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all group ${colorMap[field.color]}`}
                          >
                            <div className="mt-0.5 shrink-0">{field.icon}</div>
                            <div>
                              <p className="text-[13px] font-bold leading-tight">{field.label}</p>
                              <p className="text-[11px] opacity-70 mt-0.5 leading-tight">{field.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    /* ── STEP 2: Field Editor ─────────────────────── */
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.18 }}
                      className="p-5"
                    >
                      {/* ── IMAGE ── */}
                      {bulkEditField === 'image' && (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
                          />
                          {bulkEditData.image ? (
                            <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 mb-3">
                              <img src={bulkEditData.image} alt="Preview" className="w-full h-48 object-contain bg-slate-50 p-2" />
                              <button
                                onClick={() => setBulkEditData(p => ({ ...p, image: undefined }))}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                              >
                                <X className="w-3.5 h-3.5 text-red-500" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 px-3 py-1.5 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                                <span className="text-xs font-bold text-white">Image ready to apply</span>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                imageDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                              }`}
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={e => { e.preventDefault(); setImageDragOver(true); }}
                              onDragLeave={() => setImageDragOver(false)}
                              onDrop={e => {
                                e.preventDefault();
                                setImageDragOver(false);
                                const f = e.dataTransfer.files[0];
                                if (f) handleImageFile(f);
                              }}
                            >
                              <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${imageDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
                              <p className="text-sm font-bold text-slate-700 mb-1">
                                {imageDragOver ? 'Drop to upload' : 'Drag & drop image here'}
                              </p>
                              <p className="text-xs text-slate-500">or <span className="text-blue-600 underline">click to browse</span></p>
                              <p className="text-[11px] text-slate-400 mt-2">PNG, JPG, WEBP, GIF supported</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── ORDER TYPE ── */}
                      {bulkEditField === 'orderType' && (
                        <div className="space-y-2.5">
                          {(['inventory', 'deployment'] as const).map(type => (
                            <button
                              key={type}
                              onClick={() => setBulkEditData(p => ({ ...p, orderType: type }))}
                              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                                bulkEditData.orderType === type
                                  ? type === 'inventory' ? 'border-blue-500 bg-blue-50' : 'border-amber-500 bg-amber-50'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${type === 'inventory' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                                {type === 'inventory' ? <Archive className="w-4 h-4 text-blue-600" /> : <Truck className="w-4 h-4 text-amber-600" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 capitalize">{type}</p>
                                <p className="text-[11px] text-slate-500">{type === 'inventory' ? 'Amazon Inventory order' : 'Customer deployment order'}</p>
                              </div>
                              {bulkEditData.orderType === type && (
                                <CheckCircle2 className={`w-5 h-5 ml-auto shrink-0 ${type === 'inventory' ? 'text-blue-600' : 'text-amber-500'}`} />
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* ── PRODUCT NAME ── */}
                      {bulkEditField === 'productName' && (
                        <ProductNamePicker
                          availableProducts={availableProducts}
                          isLoadingProducts={isLoadingProducts}
                          selectedName={bulkEditData.productName || ''}
                          onSelect={name => setBulkEditData(p => ({ ...p, productName: name }))}
                          orderCount={selectedIds.size}
                        />
                      )}

                      {/* ── AMAZON PPU ── */}
                      {bulkEditField === 'amazonPPU' && (
                        <div>
                          <label className="block text-[11px] font-bold text-green-600 uppercase tracking-wide mb-2">Amazon Price Per Unit ($)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600 font-bold text-sm">$</span>
                            <input
                              type="number"
                              autoFocus
                              step="0.01"
                              placeholder="0.00"
                              value={bulkEditData.amazonPPU || ''}
                              onChange={e => setBulkEditData(p => ({ ...p, amazonPPU: e.target.value }))}
                              className="w-full pl-8 pr-4 py-3 text-sm border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">Amazon Product Revenue and Total Revenue will be recalculated for all selected orders.</p>
                        </div>
                      )}

                      {/* ── COST PPU ── */}
                      {bulkEditField === 'productCostPPU' && (
                        <div>
                          <label className="block text-[11px] font-bold text-red-600 uppercase tracking-wide mb-2">Product Cost Per Unit ($)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-500 font-bold text-sm">$</span>
                            <input
                              type="number"
                              autoFocus
                              step="0.01"
                              placeholder="0.00"
                              value={bulkEditData.productCostPPU || ''}
                              onChange={e => setBulkEditData(p => ({ ...p, productCostPPU: e.target.value }))}
                              className="w-full pl-8 pr-4 py-3 text-sm border-2 border-red-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">Total Cost, Profit, and Margins will be recalculated for all selected orders.</p>
                        </div>
                      )}

                      {/* ── ACTIVATE PPU ── */}
                      {bulkEditField === 'activateSwagPPU' && (
                        <div>
                          <label className="block text-[11px] font-bold text-orange-600 uppercase tracking-wide mb-2">Activate Swag PPU ($)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 font-bold text-sm">$</span>
                            <input
                              type="number"
                              autoFocus
                              step="0.01"
                              placeholder="Leave blank for auto-calc"
                              value={bulkEditData.activateSwagPPU || ''}
                              onChange={e => setBulkEditData(p => ({ ...p, activateSwagPPU: e.target.value }))}
                              className="w-full pl-8 pr-4 py-3 text-sm border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                            />
                          </div>
                          {autoActivate && (
                            <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-[11px] text-orange-700 font-semibold">
                              Auto-calc: Cost PPU + 50% × (Amazon PPU − Cost PPU) = ${autoActivate}
                            </div>
                          )}
                          <p className="text-[11px] text-slate-400 mt-2">Formula: Cost + 50% × (Amazon − Cost). Enter a value to override.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <div className={`px-5 py-4 border-t border-slate-100 flex items-center gap-3 ${bulkEditStep === 'edit' ? 'justify-between' : 'justify-end'}`}>
                  {bulkEditStep === 'edit' && (
                    <button
                      onClick={() => { setBulkEditStep('pick'); setBulkEditField(null); setBulkEditData({}); }}
                      disabled={isBulkSaving}
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-semibold transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setBulkEditOpen(false)}
                      disabled={isBulkSaving}
                      className="px-4 py-2 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm transition-all"
                    >
                      Cancel
                    </button>
                    {bulkEditStep === 'edit' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBulkSave}
                        disabled={isBulkSaving || !canApply}
                        className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl text-sm transition-all ${
                          canApply
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        } disabled:opacity-60`}
                      >
                        {isBulkSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isBulkSaving ? 'Saving…' : `Apply to ${selectedIds.size} Orders`}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Add Order Drawer */}
      <AddOrderDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={fetchOrders}
        availableProducts={availableProducts}
        isLoadingProducts={isLoadingProducts}
        existingOrders={orders}
      />

      {/* Bulk Import Seeder */}
      <AmazonOrderSeeder
        isOpen={seederOpen}
        onClose={() => setSeederOpen(false)}
        onSuccess={() => { setSeederOpen(false); fetchOrders(); }}
      />

      {/* Edit Order Drawer */}
      <EditOrderDrawer
        isOpen={editDrawerOpen}
        order={orderToEdit}
        onClose={() => { setEditDrawerOpen(false); setOrderToEdit(null); }}
        onSuccess={(updated) => {
          setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        }}
        availableProducts={availableProducts}
        isLoadingProducts={isLoadingProducts}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setOrderToDelete(null); }}
        onConfirm={handleDeleteOrder}
        orderName={orderToDelete ? `${orderToDelete.productName} (${orderToDelete.amazonPO})` : ''}
      />
    </div>
  );
}
