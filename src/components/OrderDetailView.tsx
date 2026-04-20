import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ShoppingCart, Package, Calendar, DollarSign, Percent, Tag, Clock,
  Building, MapPin, FileText, Edit2, Printer, Copy, Truck, CheckCircle, AlertCircle,
  ChevronDown, ChevronRight, User, Globe, CreditCard, BarChart3, History,
  Plus, Trash2, Search, Eye, Send, Download, MoreHorizontal, Star, TrendingUp,
  Check, X, ArrowUpRight, ArrowDownRight, Sparkles, ClipboardList, Mail, Phone,
  RefreshCw, ExternalLink, Shield, PackageCheck, ImagePlus
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { CreateShipmentFromPOModal } from './CreateShipmentFromPOModal';

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

interface Order {
  id: string;
  customer: string;
  customerId?: string;
  email: string;
  status: string;
  items: number;
  total: string;
  date: string;
  paymentStatus: string;
  shipping: string;
  createdAt?: string;
  updatedAt?: string;
  projectName?: string;
  eventType?: string;
  stage?: string;
  inHandsDate?: string;
  terms?: string;
  currency?: string;
  taxRate?: number;
  defaultMargin?: number;
  customerPO?: string;
  isSampleOrder?: boolean;
  introduction?: string;
  billingContact?: string;
  billingAddress?: string;
  shippingContact?: string;
  shippingAddress?: string;
  subtotal?: string;
  taxAmount?: string;
  totalMargin?: string;
  lineItems?: OrderLineItem[];
  orderDate?: string;
  sourcePONumber?: string;
  sourcePOId?: string;
  project?: string;
  shipDate?: string | null;
  vendor?: string;
  shipToAddresses?: Array<{
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    contact?: string;
  }>;
  contacts?: Array<{
    name: string;
    role?: string;
    address?: string;
    fullAddress?: string;
  }>;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  [key: string]: any;
}

interface OrderDetailViewProps {
  order: Order;
  onBack: () => void;
  onEdit: (order: Order) => void;
  onRefresh: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
    case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Processing': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Confirmed': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStageInfo = (stage: string) => {
  switch (stage) {
    case 'opportunity': return { label: 'Opportunity', color: 'from-blue-400 to-blue-500', bg: 'bg-blue-100 text-blue-700 border-blue-200', step: 1 };
    case 'presentation': return { label: 'Presentation', color: 'from-purple-400 to-purple-500', bg: 'bg-purple-100 text-purple-700 border-purple-200', step: 2 };
    case 'estimate': return { label: 'Estimate', color: 'from-amber-400 to-amber-500', bg: 'bg-amber-100 text-amber-700 border-amber-200', step: 3 };
    case 'sales-order': return { label: 'Sales Order', color: 'from-green-400 to-green-500', bg: 'bg-green-100 text-green-700 border-green-200', step: 4 };
    default: return { label: stage || 'N/A', color: 'from-slate-400 to-slate-500', bg: 'bg-slate-100 text-slate-700 border-slate-200', step: 0 };
  }
};

const STATUS_OPTIONS = ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const STAGE_OPTIONS = [
  { id: 'opportunity', label: 'Opportunity' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'estimate', label: 'Estimate' },
  { id: 'sales-order', label: 'Sales Order' },
];

export function OrderDetailView({ order: initialOrder, onBack, onEdit, onRefresh }: OrderDetailViewProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'activity' | 'documents'>('overview');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [expandedLineItem, setExpandedLineItem] = useState<number | null>(null);
  const [newNote, setNewNote] = useState('');
  const [linkedReceivingId, setLinkedReceivingId] = useState<string | null>(null);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [linkedShipments, setLinkedShipments] = useState<any[]>([]);
  const [isEditingCustomerPO, setIsEditingCustomerPO] = useState(false);
  const [editCustomerPO, setEditCustomerPO] = useState(order.customerPO || '');
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [editBillingContact, setEditBillingContact] = useState(order.billingContact || '');
  const [editBillingAddress, setEditBillingAddress] = useState(order.billingAddress || '');
  const [vendorAddresses, setVendorAddresses] = useState<Array<{ id: string; label: string; customLabel?: string; contactPerson?: string; name?: string; street1: string; street2?: string; city: string; state: string; zip: string; country: string; isPrimary?: boolean }>>([]);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string>('');
  const [showBillingDropdown, setShowBillingDropdown] = useState(false);
  const billingDropdownRef = useRef<HTMLDivElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const [uploadingImageIdx, setUploadingImageIdx] = useState<number | null>(null);

  const isCompetitorSample = order.isSampleOrder && (order as any).sampleType === 'competitor';

  // Auto-sync financials from source PO (fixes existing orders with stale totals)
  useEffect(() => {
    const syncFromPO = async () => {
      if (!order.sourcePOId) return;
      try {
        const poRes = await fetch(`/api/purchasing/get?id=${encodeURIComponent(order.sourcePOId)}`);
        if (!poRes.ok) return;
        const poData = await poRes.json();
        const po = poData.purchaseOrder || poData.order;
        if (!po) return;

        // Recompute totals from PO data
        const poLineItems = po.lineItems || [];
        const poVariants = po.variants || [];
        const sourceItems = poLineItems.length > 0 ? poLineItems : poVariants;

        const orderLineItems = sourceItems.map((item: any, idx: number) => ({
          productId: item.productId || item.id || String(idx + 1),
          productName: item.description || item.productName || item.name || po.project || 'Item',
          sku: item.sku || String(item.productId || item.id || idx + 1),
          supplier: item.vendor || po.vendor || '',
          variant: item.size ? `${item.size}${item.color ? ' / ' + item.color : ''}` : (item.color || ''),
          quantity: item.quantity || item.qty || 1,
          netCost: item.unitPrice || item.costPerUnit || 0,
          margin: 0,
          clientPrice: item.unitPrice || item.costPerUnit || 0,
          total: (item.quantity || item.qty || 1) * (item.unitPrice || item.costPerUnit || 0),
        }));

        const lineItemSubtotal = orderLineItems.reduce((sum: number, li: any) => sum + (li.total || 0), 0);
        const subItemsTotal = poLineItems.reduce((sum: number, item: any) => {
          return sum + (item.subItems || []).reduce((s: number, si: any) => s + ((si.amount || 0) * (si.quantity || 1)), 0);
        }, 0);
        const poCustomLineItems = po.customLineItems || [];
        const customItemsTotal = poCustomLineItems.reduce((sum: number, item: any) => sum + ((item.amount || 0) * (item.quantity || 1)), 0);
        const computedSubtotal = lineItemSubtotal + subItemsTotal + customItemsTotal;
        const poTaxRate = po.salesTaxRate ?? 0;
        const computedTax = computedSubtotal * poTaxRate;
        const computedTotal = computedSubtotal + computedTax;

        // Check if order needs updating (compare totals)
        const currentTotal = parseFloat(String(order.total ?? '0').replace('$', '').replace(',', '')) || 0;
        const totalDiff = Math.abs(currentTotal - computedTotal);

        if (totalDiff > 0.01) {
          const totalItemQty = sourceItems.reduce((sum: number, item: any) => sum + (item.quantity || item.qty || 0), 0);
          const updates: any = {
            lineItems: orderLineItems,
            items: totalItemQty,
            subtotal: `$${computedSubtotal.toFixed(2)}`,
            taxRate: parseFloat((poTaxRate * 100).toFixed(2)),
            taxAmount: `$${computedTax.toFixed(2)}`,
            total: `$${computedTotal.toFixed(2)}`,
            poCharges: poCustomLineItems.length > 0 ? poCustomLineItems : undefined,
          };

          // Persist to server
          const res = await fetch('/api/orders/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: order.id, ...updates }),
          });
          if (res.ok) {
            setOrder(prev => ({ ...prev, ...updates }));
            console.log(`Auto-synced order ${order.id} totals from PO ${order.sourcePOId} — new total: $${computedTotal.toFixed(2)}`);
          }
        }
      } catch (err) {
        console.error('Error auto-syncing order from source PO:', err);
      }
    };
    syncFromPO();
  }, [order.id, order.sourcePOId]);

  // Fetch vendor addresses for billing address selection
  useEffect(() => {
    const fetchVendorAddresses = async () => {
      if (!order.vendor) return;
      try {
        const res = await fetch('/api/vendors/list');
        if (!res.ok) return;
        const data = await res.json();
        {
          const vendor = (data.vendors || []).find((v: any) =>
            (v.name || v.vendorName)?.trim().toLowerCase() === order.vendor?.trim().toLowerCase() ||
            v.id === (order as any).vendorId
          );
          if (vendor && vendor.addresses) {
            setVendorAddresses(vendor.addresses);
            if (!order.billingAddress) {
              const billingAddr = vendor.addresses.find((a: any) => a.label === 'Billing');
              const primaryAddr = vendor.addresses.find((a: any) => a.isPrimary);
              const defaultAddr = billingAddr || primaryAddr;
              if (defaultAddr) {
                const formatted = [defaultAddr.street1, defaultAddr.street2, [defaultAddr.city, defaultAddr.state, defaultAddr.zip].filter(Boolean).join(', '), defaultAddr.country].filter(Boolean).join('\n');
                setSelectedBillingAddressId(defaultAddr.id);
                updateOrderField({
                  billingContact: defaultAddr.contactPerson || defaultAddr.name || '',
                  billingAddress: formatted,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching vendor addresses:', err);
      }
    };
    fetchVendorAddresses();
  }, [order.vendor]);

  // Close billing dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (billingDropdownRef.current && !billingDropdownRef.current.contains(e.target as Node)) {
        setShowBillingDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const formatVendorAddress = (addr: any) => {
    return [addr.street1, addr.street2, [addr.city, addr.state, addr.zip].filter(Boolean).join(', '), addr.country].filter(Boolean).join('\n');
  };

  // Handle product image upload
  const handleImageUpload = async (idx: number, file: File) => {
    setUploadingImageIdx(idx);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        const updatedLineItems = [...lineItems];
        updatedLineItems[idx] = { ...updatedLineItems[idx], imageUrl };
        await updateOrderField({ lineItems: updatedLineItems });
        setUploadingImageIdx(null);
        toast.success('Product image updated');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image');
      setUploadingImageIdx(null);
    }
  };

  // Check for linked receiving entry
  useEffect(() => {
    const checkReceiving = async () => {
      try {
        const res = await fetch(`/api/receiving/list?orderId=${encodeURIComponent(order.id)}`);
        if (!res.ok) return;
        const data = await res.json();
        const rows = data.receiving || data.receipts || [];
        const linked = rows.find((r: any) => r.orderId === order.id || r.sourceOrderId === order.id);
        if (linked) setLinkedReceivingId(linked.id);
      } catch (err) {
        console.error('Error checking linked receiving:', err);
      }
    };
    if (['Shipped', 'Delivered'].includes(order.status)) {
      checkReceiving();
    }
  }, [order.id, order.status]);

  // Fetch linked shipments for this order
  useEffect(() => {
    const fetchLinkedShipments = async () => {
      try {
        const res = await fetch(`/api/shipments/list?orderId=${encodeURIComponent(order.id)}`);
        if (!res.ok) return;
        const data = await res.json();
        const rows = data.shipments || [];
        const linked = rows.filter((s: any) =>
          s.orderId === order.id || s.poId === order.id ||
          s.poNumber === order.id || s.orderNumber === order.id ||
          s.poNumber === order.sourcePONumber
        );
        setLinkedShipments(linked);
      } catch (err) {
        console.error('Error fetching linked shipments:', err);
      }
    };
    fetchLinkedShipments();
  }, [order.id, order.sourcePONumber, order.status]);

  // Parse numeric values safely
  const parseTotal = (val: any): number => parseFloat(String(val ?? '0').replace('$', '').replace(',', '')) || 0;
  const lineItems = order.lineItems || [];
  const lineItemsSubtotal = lineItems.reduce((sum, li) => sum + (li.total || 0), 0);
  const poCharges: Array<{ id: string; name: string; amount: number; quantity: number }> = (order as any).poCharges || [];
  const poChargesTotal = poCharges.reduce((sum, c) => sum + ((c.amount || 0) * (c.quantity || 1)), 0);
  const subtotalAmount = parseTotal(order.subtotal) || (lineItemsSubtotal + poChargesTotal);
  const taxAmount = parseTotal(order.taxAmount);
  const totalAmount = parseTotal(order.total) || (subtotalAmount + taxAmount);
  const marginAmount = parseTotal(order.totalMargin);
  const totalUnitsFromLineItems = lineItems.reduce((sum, li) => sum + (li.quantity || 0), 0);
  const totalUnits = totalUnitsFromLineItems > 0 ? totalUnitsFromLineItems : (order.items || 0);

  // Activity log (generated from order data)
  const activityLog = [
    {
      id: 'act-1',
      type: 'created',
      title: 'Order Created',
      description: `Order ${order.id} was created for ${order.customer}`,
      timestamp: order.createdAt ? new Date(order.createdAt).toLocaleString() : order.date,
      user: 'System',
      icon: Plus,
      color: 'bg-green-100 text-green-600',
    },
    ...(order.stage ? [{
      id: 'act-2',
      type: 'stage',
      title: `Stage set to ${getStageInfo(order.stage).label}`,
      description: `Pipeline stage assigned during order creation`,
      timestamp: order.createdAt ? new Date(order.createdAt).toLocaleString() : order.date,
      user: 'System',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-600',
    }] : []),
    ...(lineItems.length > 0 ? [{
      id: 'act-3',
      type: 'products',
      title: `${lineItems.length} product${lineItems.length > 1 ? 's' : ''} added`,
      description: lineItems.map(li => li.productName).join(', '),
      timestamp: order.createdAt ? new Date(order.createdAt).toLocaleString() : order.date,
      user: 'System',
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    }] : []),
    ...(order.updatedAt && order.updatedAt !== order.createdAt ? [{
      id: 'act-4',
      type: 'updated',
      title: 'Order Updated',
      description: `Order details were modified`,
      timestamp: new Date(order.updatedAt).toLocaleString(),
      user: 'Admin',
      icon: Edit2,
      color: 'bg-amber-100 text-amber-600',
    }] : []),
    ...(order.status === 'Shipped' || order.status === 'Delivered' ? [{
      id: 'act-5',
      type: 'shipped',
      title: order.status === 'Delivered' ? 'Order Delivered' : 'Order Shipped',
      description: [
        (order as any).carrier ? `Carrier: ${(order as any).carrier}` : null,
        (order as any).trackingNumber ? `Tracking: ${(order as any).trackingNumber}` : null,
        (order as any).shipDate ? `Ship Date: ${(order as any).shipDate}` : null,
      ].filter(Boolean).join(' • ') || `Order status changed to ${order.status}`,
      timestamp: (order as any).shipDate ? new Date((order as any).shipDate).toLocaleString() : (order.updatedAt ? new Date(order.updatedAt).toLocaleString() : order.date),
      user: 'System',
      icon: Truck,
      color: order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-cyan-100 text-cyan-600',
    }] : []),
  ];

  // Stage progress
  const stageInfo = getStageInfo(order.stage || '');
  const stages = ['opportunity', 'presentation', 'estimate', 'sales-order'];
  const currentStageIndex = stages.indexOf(order.stage || '');

  // Days until in-hands
  const daysUntilInHands = order.inHandsDate
    ? Math.ceil((new Date(order.inHandsDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Update order status
  const updateOrderField = async (updates: Partial<Order>) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/orders/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, ...updates }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setOrder(prev => ({ ...prev, ...updates }));
      onRefresh();

      // 1:1 sync: When order status changes to Shipped or Delivered, sync to linked PO
      if (updates.status && ['Shipped', 'Delivered'].includes(updates.status) && order.sourcePOId) {
        try {
          const poRes = await fetch('/api/purchasing/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: order.sourcePOId, status: updates.status }),
          });
          if (poRes.ok) {
            toast.success(`Linked PO status also updated to ${updates.status}`);
          }
        } catch (syncErr) {
          console.error('Error syncing status to linked PO:', syncErr);
        }
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setUpdatingStatus(false);
      setShowStatusDropdown(false);
    }
  };

  // Fetch products for adding
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products/list');
      if (!res.ok) return;
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Add product to order
  const addProductToOrder = async (product: any) => {
    const cost = parseFloat(String(product.price ?? '0').replace('$', '')) || 0;
    const marginPct = order.defaultMargin || 40;
    const clientPrice = cost / (1 - marginPct / 100);

    const newItem: OrderLineItem = {
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

    const updatedLineItems = [...lineItems, newItem];
    const newSubtotal = updatedLineItems.reduce((sum, li) => sum + li.total, 0);
    const tax = newSubtotal * ((order.taxRate || 0) / 100);
    const newTotal = newSubtotal + tax;
    const newMargin = updatedLineItems.reduce((sum, li) => sum + ((li.clientPrice - li.netCost) * li.quantity), 0);

    await updateOrderField({
      lineItems: updatedLineItems,
      items: updatedLineItems.length,
      subtotal: newSubtotal.toFixed(2),
      taxAmount: tax.toFixed(2),
      total: `$${newTotal.toFixed(2)}`,
      totalMargin: newMargin.toFixed(2),
    });

    setShowAddProduct(false);
    setProductSearch('');
  };

  // Remove product from order
  const removeProductFromOrder = async (index: number) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    const newSubtotal = updatedLineItems.reduce((sum, li) => sum + li.total, 0);
    const tax = newSubtotal * ((order.taxRate || 0) / 100);
    const newTotal = newSubtotal + tax;
    const newMargin = updatedLineItems.reduce((sum, li) => sum + ((li.clientPrice - li.netCost) * li.quantity), 0);

    await updateOrderField({
      lineItems: updatedLineItems,
      items: updatedLineItems.length,
      subtotal: newSubtotal.toFixed(2),
      taxAmount: tax.toFixed(2),
      total: `$${newTotal.toFixed(2)}`,
      totalMargin: newMargin.toFixed(2),
    });
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: ClipboardList },
    { id: 'products' as const, label: 'Products', icon: Package, count: lineItems.length },
    { id: 'activity' as const, label: 'Activity', icon: History, count: activityLog.length },
    { id: 'documents' as const, label: 'Documents', icon: FileText },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-8 py-6 shadow-lg shrink-0">
        <div className="max-w-[1800px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <span className="text-blue-200 text-sm font-medium">Back to Orders</span>
          </div>

          {/* Order Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-black text-white">{order.id}</h1>
                  {order.isSampleOrder && (
                    <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-100 rounded-lg text-[10px] font-bold border border-cyan-400/30">
                      SAMPLE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-blue-100 font-medium">{order.customer}</p>
                  {(order.project || order.projectName) && (
                    <>
                      <span className="text-blue-300">•</span>
                      <p className="text-blue-200 text-sm">{order.project || order.projectName}</p>
                    </>
                  )}
                  {order.sourcePONumber && (
                    <>
                      <span className="text-blue-300">•</span>
                      <p className="text-blue-200 text-sm">PO# {order.sourcePONumber}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {/* Status Badge */}
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(order.status)} cursor-pointer hover:opacity-90 transition-all`}
                    >
                      {order.status}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <AnimatePresence>
                      {showStatusDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full left-0 mt-1 z-30 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-[140px]"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <button
                              key={s}
                              onClick={() => {
                                if (s === 'Shipped') {
                                  setShowStatusDropdown(false);
                                  setShowShipmentModal(true);
                                  return;
                                }
                                updateOrderField({ status: s });
                              }}
                              disabled={updatingStatus}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                                order.status === s ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                              }`}
                            >
                              {order.status === s && <Check className="w-3.5 h-3.5" />}
                              {s}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* LATE Badge from linked PO */}
                  {order.missedInHandsDate && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white shadow-lg shadow-red-200 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" />
                      LATE
                    </span>
                  )}
                  {/* Stage */}
                  {order.stage && (
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border ${stageInfo.bg}`}>
                      {stageInfo.label}
                    </span>
                  )}
                  {/* Payment */}
                  <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border ${
                    order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    order.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                  {/* Warehouse Receiving Badge */}
                  <AnimatePresence>
                    {linkedReceivingId && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border bg-cyan-100 text-cyan-700 border-cyan-200"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        WMS: {linkedReceivingId}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isCompetitorSample && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 bg-white/15 backdrop-blur-sm text-white rounded-xl text-sm font-semibold hover:bg-white/25 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Invoice
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LATE Order Warning Banner */}
      {order.missedInHandsDate && (
        <div className="px-8 -mt-3 mb-4 relative z-10">
          <div className="max-w-[1800px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-600 rounded-2xl border border-red-700 p-4 shadow-lg shadow-red-200/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">Order Flagged as Late — Ship Date Exceeds In-Hands Date</h3>
                  <p className="text-xs text-red-100 mt-0.5">
                    The linked purchase order's ship date has been set past the required in-hands date of <span className="font-semibold text-white">{order.inHandsDate || '—'}</span>.
                    {order.missedInHandsReason && (
                      <> Reason provided: <span className="font-semibold text-white italic">"{order.missedInHandsReason}"</span></>
                    )}
                  </p>
                </div>
                {order.sourcePONumber && (
                  <div className="shrink-0 flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-red-200" />
                    <span className="text-xs font-bold text-white">Source PO: {order.sourcePONumber}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Stage Pipeline Progress Bar */}
      {order.stage && (
        <div className="px-8 -mt-3 mb-4 relative z-10">
          <div className="max-w-[1800px] mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-md">
              <div className="flex items-center gap-1">
                {STAGE_OPTIONS.map((s, idx) => {
                  const isActive = s.id === order.stage;
                  const isPast = stages.indexOf(s.id) < currentStageIndex;
                  return (
                    <div key={s.id} className="flex-1 flex items-center gap-1">
                      <button
                        onClick={() => updateOrderField({ stage: s.id })}
                        className={`flex-1 relative py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${getStageInfo(s.id).color} text-white shadow-md`
                            : isPast
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {isPast && <Check className="w-3.5 h-3.5" />}
                          {s.label}
                        </div>
                      </button>
                      {idx < STAGE_OPTIONS.length - 1 && (
                        <ChevronRight className={`w-4 h-4 shrink-0 ${isPast || isActive ? 'text-green-400' : 'text-slate-300'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={`px-8 ${order.stage ? 'mb-6' : '-mt-3 mb-6'}`}>
        <div className="max-w-[1800px] mx-auto">
          <div className={`bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm ${order.stage ? '' : 'mt-6'}`}>
            <div className="flex items-center gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'products' && products.length === 0) fetchProducts();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        <div className="max-w-[1800px] mx-auto">
          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Order Total', value: `$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', sub: '' },
                    { label: 'Subtotal', value: `$${subtotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: CreditCard, color: 'from-blue-500 to-blue-600', sub: `${lineItems.length} items` },
                    { label: 'Tax', value: `$${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Percent, color: 'from-amber-500 to-amber-600', sub: `${order.taxRate || 0}%` },
                    { label: 'Booked Margin', value: `$${marginAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', sub: `${order.defaultMargin || 0}% target` },
                    { label: 'Total Units', value: totalUnits.toString(), icon: Package, color: 'from-cyan-500 to-cyan-600', sub: lineItems.length > 0 ? `${lineItems.length} SKUs` : '' },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                        <card.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">{card.label}</p>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">{card.value}</h3>
                      {card.sub && <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>}
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Key Details Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-blue-500" />
                          Order Details
                        </h3>
                        <button
                          onClick={() => setIsEditingCustomerPO(true)}
                          className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Edit Customer PO #"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                          <DetailField label="Order ID" value={order.id} mono />
                          <DetailField label="Customer" value={order.customer} />
                          <DetailField label="Project Name" value={order.project || order.projectName || '—'} />
                          <DetailField label="Vendor" value={order.vendor || '—'} />
                          <DetailField label="PO Number" value={order.sourcePONumber || order.customerPO || '—'} mono />
                          <DetailField label="Order Date" value={order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : (order.orderDate || order.date || '—')} icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />} />
                          <DetailField
                            label="Ship Date"
                            value={order.shipDate || '—'}
                            icon={<Truck className={`w-3.5 h-3.5 ${order.missedInHandsDate ? 'text-red-500' : 'text-slate-400'}`} />}
                            badge={order.missedInHandsDate && order.shipDate ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                                <AlertCircle className="w-2.5 h-2.5" />
                                LATE
                              </span>
                            ) : null}
                          />
                          <DetailField
                            label="In-Hands Date"
                            value={order.inHandsDate || '—'}
                            icon={<Clock className="w-3.5 h-3.5 text-slate-400" />}
                            badge={daysUntilInHands !== null ? (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                daysUntilInHands < 0 ? 'bg-red-100 text-red-700' :
                                daysUntilInHands < 7 ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {daysUntilInHands < 0 ? `${Math.abs(daysUntilInHands)}d overdue` : `${daysUntilInHands}d remaining`}
                              </span>
                            ) : null}
                          />
                          <DetailField label="Payment Terms" value={order.terms || '—'} />
                          <DetailField label="Currency" value={order.currency || 'USD'} icon={<Globe className="w-3.5 h-3.5 text-slate-400" />} />
                          <DetailField label="Tax Rate" value={`${order.taxRate || 0}%`} />
                          <DetailField label="Default Margin" value={`${order.defaultMargin || 0}%`} />
                          {isEditingCustomerPO ? (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer PO #</p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editCustomerPO}
                                  onChange={e => setEditCustomerPO(e.target.value)}
                                  placeholder="Enter customer PO #"
                                  className="flex-1 px-3 py-1.5 bg-slate-50 border-2 border-blue-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                  autoFocus
                                />
                                <button
                                  onClick={async () => {
                                    await updateOrderField({ customerPO: editCustomerPO });
                                    setIsEditingCustomerPO(false);
                                  }}
                                  className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => { setEditCustomerPO(order.customerPO || ''); setIsEditingCustomerPO(false); }}
                                  className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <DetailField label="Customer PO #" value={order.customerPO || '—'} mono />
                          )}
                          <DetailField label="Created" value={order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'} />
                        </div>
                      </div>
                    </div>

                    {/* Introduction / Notes */}
                    {order.introduction && (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Introduction / Notes
                          </h3>
                        </div>
                        <div className="p-6">
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{order.introduction}</p>
                        </div>
                      </div>
                    )}

                    {/* Quick Product Summary (on overview) */}
                    {lineItems.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-500" />
                            Products ({lineItems.length})
                          </h3>
                          <button
                            onClick={() => setActiveTab('products')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            View All <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {lineItems.slice(0, 3).map((li, idx) => (
                            <div key={idx} className="px-6 py-4 flex items-center gap-4">
                              <div
                                className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 cursor-pointer relative group/img hover:ring-2 hover:ring-blue-400 transition-all"
                                onClick={() => {
                                  setUploadingImageIdx(idx);
                                  imageUploadRef.current?.click();
                                }}
                                title="Click to upload product image"
                              >
                                {li.imageUrl ? (
                                  <>
                                    <img src={li.imageUrl} alt={li.productName} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                      <ImagePlus className="w-4 h-4 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center group-hover/img:bg-blue-50 transition-colors">
                                    <ImagePlus className="w-5 h-5 text-slate-300 group-hover/img:text-blue-400 transition-colors" />
                                  </div>
                                )}
                                {uploadingImageIdx === idx && (
                                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{li.productName}</p>
                                <p className="text-xs text-slate-400 font-mono">{li.sku}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">${li.total.toFixed(2)}</p>
                                <p className="text-xs text-slate-400">{li.quantity} × ${li.clientPrice.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                          {lineItems.length > 3 && (
                            <div className="px-6 py-3 text-center">
                              <button
                                onClick={() => setActiveTab('products')}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                              >
                                +{lineItems.length - 3} more products
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Billing Address */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-blue-500" />
                          Billing Address
                        </h3>
                        <button
                          onClick={() => setIsEditingBilling(true)}
                          className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Edit billing address"
                        >
                          <Edit2 className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                      <div className="p-5">
                        {isEditingBilling ? (
                          <div className="space-y-3" ref={billingDropdownRef}>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Select Address from Vendor</label>
                              {vendorAddresses.length > 0 ? (
                                <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                                  {/* Same as primary option */}
                                  {(() => {
                                    const primaryAddr = vendorAddresses.find(a => a.isPrimary);
                                    if (primaryAddr) {
                                      const formatted = formatVendorAddress(primaryAddr);
                                      return (
                                        <button
                                          onClick={async () => {
                                            setSelectedBillingAddressId(primaryAddr.id);
                                            await updateOrderField({ billingContact: primaryAddr.contactPerson || primaryAddr.name || '', billingAddress: formatted });
                                            setIsEditingBilling(false);
                                          }}
                                          className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all text-sm ${
                                            selectedBillingAddressId === primaryAddr.id
                                              ? 'border-blue-500 bg-blue-50'
                                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2 mb-1">
                                            <Star className="w-3 h-3 text-amber-500" />
                                            <span className="font-semibold text-slate-900 text-xs">Same as Primary Address</span>
                                          </div>
                                          <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{formatted}</p>
                                        </button>
                                      );
                                    }
                                    return null;
                                  })()}
                                  {/* All vendor addresses */}
                                  {vendorAddresses.map(addr => {
                                    if (addr.isPrimary && vendorAddresses.some(a => a.isPrimary)) {
                                      // Already shown as "Same as Primary" above
                                      return null;
                                    }
                                    const formatted = formatVendorAddress(addr);
                                    return (
                                      <button
                                        key={addr.id}
                                        onClick={async () => {
                                          setSelectedBillingAddressId(addr.id);
                                          await updateOrderField({ billingContact: addr.contactPerson || addr.name || '', billingAddress: formatted });
                                          setIsEditingBilling(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all text-sm ${
                                          selectedBillingAddressId === addr.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                            addr.label === 'Billing' ? 'bg-green-100 text-green-700' :
                                            addr.label === 'FOB' ? 'bg-orange-100 text-orange-700' :
                                            addr.label === 'Warehouse' ? 'bg-blue-100 text-blue-700' :
                                            addr.label === 'Headquarters' ? 'bg-purple-100 text-purple-700' :
                                            'bg-slate-100 text-slate-600'
                                          }`}>{addr.label}{addr.customLabel ? ` — ${addr.customLabel}` : ''}</span>
                                          {addr.contactPerson && <span className="text-[10px] text-slate-500">{addr.contactPerson}</span>}
                                        </div>
                                        <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{formatted}</p>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-4 bg-amber-50 border border-amber-200 rounded-lg">
                                  <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                                  <p className="text-xs text-amber-700 font-medium mb-0.5">No addresses found for this vendor</p>
                                  <p className="text-[10px] text-amber-600">Add addresses in the Vendor module to select from here.</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 justify-end pt-1">
                              <button
                                onClick={() => setIsEditingBilling(false)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {order.billingContact && (
                              <p className="text-sm font-semibold text-slate-900 mb-1">{order.billingContact}</p>
                            )}
                            {order.billingAddress ? (
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{order.billingAddress}</p>
                            ) : (
                              <p className="text-sm text-slate-400 italic">No billing address specified</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Shipping Addresses */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          Shipping Address{(order.shipToAddresses && order.shipToAddresses.length > 1) ? 'es' : ''}
                          {order.shipToAddresses && order.shipToAddresses.length > 1 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">{order.shipToAddresses.length}</span>
                          )}
                        </h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {order.shipToAddresses && order.shipToAddresses.length > 0 ? (
                          order.shipToAddresses.map((addr, idx) => (
                            <div key={idx} className="p-5">
                              <p className="text-sm font-semibold text-slate-900 mb-1">{addr.name || addr.contact || 'Ship To'}</p>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {[addr.address, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ')}
                              </p>
                              {addr.contact && addr.contact !== addr.name && (
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                  <User className="w-3 h-3" /> {addr.contact}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-5">
                            {order.shippingContact && (
                              <p className="text-sm font-semibold text-slate-900 mb-1">{order.shippingContact}</p>
                            )}
                            {order.shippingAddress ? (
                              <p className="text-sm text-slate-600 leading-relaxed">{order.shippingAddress}</p>
                            ) : (
                              <p className="text-sm text-slate-400 italic">No shipping address specified</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* In-Hands Countdown */}
                    {daysUntilInHands !== null && (
                      <div className={`rounded-2xl border overflow-hidden shadow-sm ${
                        daysUntilInHands < 0 ? 'bg-red-50 border-red-200' :
                        daysUntilInHands < 7 ? 'bg-amber-50 border-amber-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <div className="p-5 text-center">
                          <Clock className={`w-8 h-8 mx-auto mb-2 ${
                            daysUntilInHands < 0 ? 'text-red-500' :
                            daysUntilInHands < 7 ? 'text-amber-500' :
                            'text-green-500'
                          }`} />
                          <p className={`text-3xl font-black ${
                            daysUntilInHands < 0 ? 'text-red-700' :
                            daysUntilInHands < 7 ? 'text-amber-700' :
                            'text-green-700'
                          }`}>
                            {Math.abs(daysUntilInHands)}
                          </p>
                          <p className={`text-sm font-semibold ${
                            daysUntilInHands < 0 ? 'text-red-600' :
                            daysUntilInHands < 7 ? 'text-amber-600' :
                            'text-green-600'
                          }`}>
                            {daysUntilInHands < 0 ? 'Days Overdue' : 'Days Until In-Hands'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{order.inHandsDate}</p>
                        </div>
                      </div>
                    )}

                    {/* Shipment Tracking */}
                    {(linkedShipments.length > 0 || order.status === 'Shipped' || order.status === 'Delivered') && (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-50 to-emerald-50 border-b border-slate-200">
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-cyan-500" />
                            Shipment Tracking
                            {linkedShipments.length > 0 && (
                              <span className="ml-1 px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px] font-bold">{linkedShipments.length}</span>
                            )}
                          </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {linkedShipments.length > 0 ? (
                            linkedShipments.map((shipment: any, idx: number) => (
                              <div key={shipment.id || idx} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                    shipment.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>{shipment.status || 'In Transit'}</span>
                                  <span className="text-[10px] text-slate-400">{shipment.shipDate || '—'}</span>
                                </div>
                                <div className="space-y-1.5">
                                  {shipment.carrier && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase w-14">Carrier</span>
                                      <span className="text-xs font-semibold text-slate-700">{shipment.carrier}</span>
                                    </div>
                                  )}
                                  {(shipment.masterTracking || shipment.trackingNumber) && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase w-14">Tracking</span>
                                      <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{shipment.masterTracking || shipment.trackingNumber}</span>
                                    </div>
                                  )}
                                  {shipment.destination && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase w-14">To</span>
                                      <span className="text-xs text-slate-600">{shipment.destination}</span>
                                    </div>
                                  )}
                                  {shipment.boxes && shipment.boxes.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Individual Boxes ({shipment.boxes.length})</span>
                                      {shipment.boxes.map((box: any, bIdx: number) => (
                                        <div key={bIdx} className="flex items-center gap-2 pl-2 py-1 bg-slate-50 rounded">
                                          <Package className="w-3 h-3 text-slate-400" />
                                          <span className="text-[10px] font-medium text-slate-600">Box {box.boxNumber || bIdx + 1}</span>
                                          <span className="text-[10px] font-mono text-blue-600">{box.trackingNumber}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4">
                              <div className="space-y-1.5">
                                {(order as any).carrier && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase w-14">Carrier</span>
                                    <span className="text-xs font-semibold text-slate-700">{(order as any).carrier}</span>
                                  </div>
                                )}
                                {(order as any).trackingNumber && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase w-14">Tracking</span>
                                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{(order as any).trackingNumber}</span>
                                  </div>
                                )}
                                {(order as any).shipDate && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase w-14">Shipped</span>
                                    <span className="text-xs text-slate-600">{(order as any).shipDate}</span>
                                  </div>
                                )}
                                {!(order as any).carrier && !(order as any).trackingNumber && (
                                  <p className="text-xs text-slate-400 italic">Shipment data will appear here once tracking info is added.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Actions</h3>
                      </div>
                      <div className="p-3 space-y-1">
                        {[
                          ...(!isCompetitorSample ? [{ label: 'Send to Customer', icon: Send, color: 'text-blue-600 hover:bg-blue-50' }] : []),
                          { label: 'Download PDF', icon: Download, color: 'text-emerald-600 hover:bg-emerald-50' },
                          ...(!isCompetitorSample ? [{ label: 'Duplicate Order', icon: Copy, color: 'text-purple-600 hover:bg-purple-50' }] : []),
                          { label: 'Create Shipment', icon: Truck, color: 'text-cyan-600 hover:bg-cyan-50' },
                        ].map(action => (
                          <button
                            key={action.label}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${action.color}`}
                          >
                            <action.icon className="w-4 h-4" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Add Product Bar */}
                {order.isSampleOrder && ['Confirmed', 'Shipped', 'Delivered'].includes(order.status) ? (
                  <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800">Products locked for this sample order</p>
                      <p className="text-xs text-amber-600">This order was submitted and confirmed with the vendor. Product changes must be made on the source PO{order.sourcePONumber ? ` (${order.sourcePONumber})` : ''}.</p>
                    </div>
                  </div>
                ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowAddProduct(true);
                        if (products.length === 0) fetchProducts();
                      }}
                      onFocus={() => {
                        if (products.length === 0) fetchProducts();
                      }}
                      placeholder="Search products to add..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    {/* Product search results */}
                    <AnimatePresence>
                      {showAddProduct && productSearch && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute z-20 w-full mt-1 bg-white rounded-xl border-2 border-slate-200 shadow-xl max-h-60 overflow-y-auto"
                        >
                          {loadingProducts ? (
                            <div className="p-4 text-center text-slate-500 text-sm">Loading products...</div>
                          ) : filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">No products found</div>
                          ) : (
                            filteredProducts.slice(0, 8).map(p => (
                              <button
                                key={p.id}
                                onClick={() => addProductToOrder(p)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                              >
                                <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0">
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
                                    {p.price && <span className="text-xs font-semibold text-green-600">{typeof p.price === 'number' ? `$${p.price}` : p.price}</span>}
                                  </div>
                                </div>
                                <div className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">
                                  <Plus className="w-3 h-3" />
                                </div>
                              </button>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAddProduct(!showAddProduct);
                      if (products.length === 0) fetchProducts();
                    }}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </motion.button>
                </div>
                )}

                {/* Line Items */}
                {lineItems.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No products added</h3>
                    <p className="text-sm text-slate-500 mb-4">Search above to add products to this order</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px]">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                            <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider w-14"></th>
                            <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">Product</th>
                            <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">SKU</th>
                            <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wider">Supplier</th>
                            <th className="px-5 py-3.5 text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider">QTY</th>
                            <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider">Net Cost</th>
                            <th className="px-5 py-3.5 text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider">Margin</th>
                            <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider">Client Price</th>
                            <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total</th>
                            <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider w-14"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((li, idx) => (
                            <motion.tr
                              key={idx}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                            >
                              <td className="px-5 py-4">
                                <div
                                  className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden cursor-pointer relative group/img hover:ring-2 hover:ring-blue-400 transition-all"
                                  onClick={() => {
                                    setUploadingImageIdx(idx);
                                    imageUploadRef.current?.click();
                                  }}
                                  title="Click to upload product image"
                                >
                                  {li.imageUrl ? (
                                    <>
                                      <img src={li.imageUrl} alt={li.productName} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <ImagePlus className="w-4 h-4 text-white" />
                                      </div>
                                    </>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center group-hover/img:bg-blue-50 transition-colors">
                                      <ImagePlus className="w-4 h-4 text-slate-300 group-hover/img:text-blue-400 transition-colors" />
                                    </div>
                                  )}
                                  {uploadingImageIdx === idx && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <p className="text-sm font-semibold text-slate-900">{li.productName}</p>
                                {li.variant && <p className="text-xs text-slate-400">{li.variant}</p>}
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">{li.sku || '—'}</span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-sm text-slate-600">{li.supplier || '—'}</span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="text-sm font-bold text-slate-900">{li.quantity}</span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-sm text-slate-600">${li.netCost.toFixed(2)}</span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold ${
                                  li.margin >= 40 ? 'bg-green-100 text-green-700' :
                                  li.margin >= 25 ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {li.margin.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-sm font-medium text-slate-900">${li.clientPrice.toFixed(2)}</span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-sm font-bold text-slate-900">${li.total.toFixed(2)}</span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                {!(order.isSampleOrder && ['Confirmed', 'Shipped', 'Delivered'].includes(order.status)) && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => removeProductFromOrder(idx)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </motion.button>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Order Totals Footer */}
                    <div className="bg-slate-900 p-6">
                      <div className="max-w-md ml-auto space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Products Subtotal ({lineItems.length} items, {totalUnits} units)</span>
                          <span className="font-semibold text-white">${lineItemsSubtotal.toFixed(2)}</span>
                        </div>
                        {poCharges.length > 0 && poCharges.map((charge, idx) => (
                          <div key={charge.id || idx} className="flex justify-between text-sm">
                            <span className="text-slate-400">{charge.name || 'Additional Charge'}{charge.quantity > 1 ? ` × ${charge.quantity}` : ''}</span>
                            <span className="font-semibold text-white">${((charge.amount || 0) * (charge.quantity || 1)).toFixed(2)}</span>
                          </div>
                        ))}
                        {poCharges.length > 0 && (
                          <div className="flex justify-between text-sm pt-1 border-t border-slate-700">
                            <span className="text-slate-400">Subtotal (incl. charges)</span>
                            <span className="font-semibold text-white">${subtotalAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Tax ({order.taxRate || 0}%)</span>
                          <span className="font-semibold text-white">${taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Booked Margin</span>
                          <span className="font-semibold text-green-400">${marginAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-700 my-2" />
                        <div className="flex justify-between">
                          <span className="font-bold text-white text-lg">Grand Total</span>
                          <span className="text-2xl font-black text-white">${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Add Note */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-500" />
                    Add Note
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                      A
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note or comment about this order..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!newNote.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          Add Note
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-500" />
                      Activity Log
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-slate-200" />

                      <div className="space-y-6">
                        {activityLog.map((event, idx) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative flex items-start gap-4 pl-1"
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 ${event.color}`}>
                              <event.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                                </div>
                                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{event.timestamp}</span>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center text-white text-[8px] font-bold">
                                  {event.user.charAt(0)}
                                </div>
                                <span className="text-[10px] font-medium text-slate-400">{event.user}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {activityLog.length === 0 && (
                      <div className="text-center py-8">
                        <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No activity recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Upload area */}
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Order Documents</h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                    Upload invoices, quotes, artwork proofs, and other documents related to this order
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.csv"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          // Read file as base64
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64 = reader.result as string;
                            const newDoc = {
                              id: `doc-${Date.now()}`,
                              name: file.name,
                              type: file.type || 'application/octet-stream',
                              url: base64,
                              uploadedAt: new Date().toISOString(),
                            };
                            const updatedDocs = [...(order.documents || []), newDoc];
                            await updateOrderField({ documents: updatedDocs as any });
                          };
                          reader.readAsDataURL(file);
                        } catch (err) {
                          console.error('Error uploading document:', err);
                        }
                      }}
                    />
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Upload Document
                    </motion.span>
                  </label>
                </div>

                {/* Uploaded documents */}
                {order.documents && order.documents.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        Uploaded Documents ({order.documents.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {order.documents.map((doc) => (
                        <div key={doc.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                            <p className="text-xs text-slate-400">
                              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {doc.url && (
                              <a
                                href={doc.url}
                                download={doc.name}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async () => {
                                const updatedDocs = (order.documents || []).filter(d => d.id !== doc.id);
                                await updateOrderField({ documents: updatedDocs as any });
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state when no documents */}
                {(!order.documents || order.documents.length === 0) && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <p className="text-sm text-slate-400">No documents uploaded yet</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Shipment Modal — triggered when setting status to Shipped */}
      <CreateShipmentFromPOModal
        isOpen={showShipmentModal}
        onClose={() => setShowShipmentModal(false)}
        onConfirm={async (shipments) => {
          setShowShipmentModal(false);
          // Update the order status to Shipped and store tracking info
          const trackingNumbers = shipments.map((s: any) => s.trackingNumber || s.masterTracking || s.proNumber || s.bolNumber || s.awbNumber || '').filter(Boolean);
          const carriers = shipments.map((s: any) => s.carrier).filter(Boolean);
          await updateOrderField({
            status: 'Shipped',
            trackingNumber: trackingNumbers.join(', '),
            carrier: carriers[0] || '',
            shipDate: new Date().toISOString().split('T')[0],
          });
          toast.success(
            shipments.length === 1
              ? `Order marked as Shipped — tracking: ${trackingNumbers[0]}`
              : `Order marked as Shipped — ${shipments.length} shipments created`
          );
        }}
        poNumber={order.id}
        shipToAddresses={order.shipToAddresses || []}
        vendor={order.vendor || ''}
        customer={order.customer || ''}
        poId={order.id}
        lineItems={order.lineItems || []}
      />

      {/* Hidden file input for product image upload */}
      <input
        ref={imageUploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadingImageIdx !== null) {
            handleImageUpload(uploadingImageIdx, file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}

// Helper component for detail fields
function DetailField({ label, value, mono, icon, badge }: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <p className={`text-sm ${mono ? 'font-mono' : ''} ${value === '—' ? 'text-slate-400 italic' : 'font-semibold text-slate-900'}`}>
          {value}
        </p>
        {badge}
      </div>
    </div>
  );
}
