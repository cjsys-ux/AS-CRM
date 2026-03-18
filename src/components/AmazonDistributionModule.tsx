import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Eye, Trash2, Image as ImageIcon, X, Search, Package, RefreshCw, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { DatePicker } from './DatePicker';
import { QuantityStepper } from './QuantityStepper';


interface AmazonOrder {
  id: string;
  image?: string;
  activateSwagInvoice: string;
  orderDate: string;
  deliveryDate: string;
  productName: string;
  productId?: string;
  amazonPO: string;
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

// ========= ADD ORDER DRAWER =========
function AddOrderDrawer({
  isOpen,
  onClose,
  onSuccess,
  availableProducts,
  isLoadingProducts,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableProducts: ProductDBItem[];
  isLoadingProducts: boolean;
}) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    activateSwagInvoice: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    amazonPO: '',
    sizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
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

  const totalQty = Object.values(formData.sizes).reduce((sum, v) => sum + (v || 0), 0);
  const amazonProductRevenue = totalQty * formData.amazonPPU;
  const totalAmazonRevenue = amazonProductRevenue + formData.amazonShippingRevenue;
  const totalProductCost = totalQty * formData.productCostPPU;
  const totalCost = totalProductCost + formData.shippingCost;
  const totalProfit = totalAmazonRevenue - totalCost;
  const gpMargin = totalAmazonRevenue > 0 ? (totalProfit / totalAmazonRevenue) * 100 : 0;
  const ipfProfit = totalProfit / 2;
  const activateProfit = totalProfit / 2;

  const resetForm = () => {
    setSelectedProductId('');
    setProductSearch('');
    setFormData({
      activateSwagInvoice: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      amazonPO: '',
      sizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
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
        activateProductRev: totalProductCost,
        activateShippingRev: formData.shippingCost + formData.amazonShippingRevenue,
      };

      toast.success('Amazon order added successfully');
      resetForm();
      onSuccess();
      onClose();
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

  // Close product dropdown on outside click
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
                                // Auto-fill cost if available
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

                {/* Selected Product Preview */}
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
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
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
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Size Quantities</h3>
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
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amazon Shipping Revenue ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amazonShippingRevenue || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amazonShippingRevenue: parseFloat(e.target.value) || 0 }))}
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
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Shipping Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.shippingCost || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingCost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Calculated Preview */}
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
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payout Date</label>
                    <DatePicker
                      value={formData.payoutDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, payoutDate: date }))}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amazonPaid}
                        onChange={(e) => setFormData(prev => ({ ...prev, amazonPaid: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold text-slate-700">Amazon Paid</span>
                    </label>
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
  const [timeFilter, setTimeFilter] = useState<'year' | 'month' | 'custom'>('year');
  const [selectedYear, setSelectedYear] = useState('all');
  const [orders, setOrders] = useState<AmazonOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<AmazonOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Available products from product database
  const [availableProducts, setAvailableProducts] = useState<ProductDBItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setOrders([]);
    setIsLoading(false);
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setAvailableProducts([]);
    setIsLoadingProducts(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
    toast.success('Order deleted successfully');
    setIsDeleting(false);
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const handleTogglePaid = async (order: AmazonOrder) => {
    setOrders(prev => prev.map(item => item.id === order.id ? { ...item, amazonPaid: !order.amazonPaid } : item));
    toast.success('Updated');
  };

  // Build unique product names from actual orders for the filter dropdown
  const uniqueProductNames = [...new Set(orders.map(o => o.productName).filter(Boolean))];

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (selectedProduct !== 'all' && o.productName !== selectedProduct) return false;
    if (selectedYear !== 'all') {
      const orderYear = (o.orderDate || '').includes('-')
        ? o.orderDate.split('-')[0]
        : o.orderDate.split('/').pop();
      if (orderYear !== selectedYear) return false;
    }
    return true;
  });

  // Totals row
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

  // Extract available years from orders
  const availableYears = [...new Set(orders.map(o => {
    if (!o.orderDate) return '';
    return o.orderDate.includes('-') ? o.orderDate.split('-')[0] : o.orderDate.split('/').pop() || '';
  }).filter(Boolean))].sort().reverse();

  const formatDate = (d: string) => {
    if (!d) return '—';
    return d;
  };

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Amazon Distribution</h1>
            <p className="text-sm text-slate-500">Track Amazon orders, inventory, and profitability across all products</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Filter Buttons */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setTimeFilter('year')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  timeFilter === 'year'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Year
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  timeFilter === 'month'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeFilter('custom')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  timeFilter === 'custom'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Years</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

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

            {/* Add Product Button */}
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

        {/* Product Filter - only show products that exist in orders */}
        <div className="mt-6 flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Select Product:</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
            <Package className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Amazon Orders Yet</h3>
            <p className="text-sm text-slate-500 mb-4">Click "Add Order" to create your first Amazon distribution entry from your product database.</p>
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
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap sticky left-0 bg-slate-900 z-10">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap sticky left-12 bg-slate-900 z-10">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Activate Swag Invoice</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Order Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Delivery Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Product Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Amazon PO</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-800">XS</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-700">S</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-600">M</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-700">L</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-800">XL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-900">2XL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-800">3XL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-700">4XL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-600">5XL</th>
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
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-orange-700">Activate Product Rev</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-orange-800">Activate Shipping Rev</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Payout Date</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap">Amazon Paid</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-4 sticky left-0 bg-inherit z-10">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-4 py-4 sticky left-12 bg-inherit z-10">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {order.image ? (
                            <img src={order.image} alt="" className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-900">{order.activateSwagInvoice || '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">{formatDate(order.orderDate)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">{formatDate(order.deliveryDate)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-900">{order.productName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">{order.amazonPO}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes?.xs || 0}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes?.s || 0}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes?.m || 0}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes?.l || 0}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes?.xl || 0}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes?.xxl || 0}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes?.xxxl || 0}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes?.xxxxl || 0}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes?.xxxxxl || 0}</span>
                      </td>
                      <td className="px-4 py-4 text-center bg-blue-50">
                        <span className="text-sm font-bold text-blue-700">{order.totalQty || 0}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-semibold text-green-700">${(order.amazonPPU || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-semibold text-green-700">${(order.amazonProductRevenue || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-semibold text-green-700">${(order.amazonShippingRevenue || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-bold text-green-800">${(order.totalAmazonRevenue || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-red-50">
                        <span className="text-sm font-semibold text-red-600">${(order.productCostPPU || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-red-50">
                        <span className="text-sm font-semibold text-red-600">${(order.totalProductCost || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-red-50">
                        <span className="text-sm font-semibold text-red-600">${(order.shippingCost || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-red-50">
                        <span className="text-sm font-semibold text-red-600">${(order.totalCost || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-blue-50">
                        <span className={`text-sm font-semibold ${(order.totalProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          ${(order.totalProfit || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-slate-700">{(order.gpMargin || 0).toFixed(2)}%</span>
                      </td>
                      <td className="px-4 py-4 bg-purple-50">
                        <span className="text-sm font-semibold text-purple-600">${(order.ipfProfit || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-purple-50">
                        <span className="text-sm font-semibold text-purple-600">${(order.activateProfit || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-orange-50">
                        <span className="text-sm font-semibold text-orange-600">${(order.activateProductRev || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-orange-50">
                        <span className="text-sm font-semibold text-orange-600">${(order.activateShippingRev || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">{formatDate(order.payoutDate)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={order.amazonPaid || false}
                            onChange={() => handleTogglePaid(order)}
                            className="rounded cursor-pointer"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
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
                      <td className="px-4 py-3 sticky left-0 bg-slate-900 z-10" />
                      <td className="px-4 py-3 sticky left-12 bg-slate-900 z-10" />
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-sm uppercase tracking-wider">Totals</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3" colSpan={9} />
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold">{totals.totalQty}</span>
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3">
                        <span className="text-sm">${totals.amazonProductRevenue.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">${totals.amazonShippingRevenue.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold">${totals.totalAmazonRevenue.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3">
                        <span className="text-sm">${totals.totalProductCost.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">${totals.shippingCost.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold">${totals.totalCost.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold">${totals.totalProfit.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{totalsGPMargin.toFixed(2)}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">${totals.ipfProfit.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">${totals.activateProfit.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">${totals.activateProductRev.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">${totals.activateShippingRev.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3" />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Order Drawer */}
      <AddOrderDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={fetchOrders}
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
