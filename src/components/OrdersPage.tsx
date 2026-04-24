import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Search, Filter, Download, Eye, Edit2, Trash2, Package, Truck, CheckCircle, AlertTriangle, X, Calendar, DollarSign, Building, Building2, Tag, Clock, ChevronLeft, ChevronRight, ChevronDown, RefreshCw, FileText, Check, FlaskConical, Hash, User } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { CreateOrderDrawer } from './CreateOrderDrawer';
import { OrderDetailView } from './OrderDetailView';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';
import { DatePicker } from './DatePicker';
import { getProjectBadgeClasses, getProjectBadgeStaticClasses, getProjectIconColor, getDeepLinkKey, getDeepLinkTarget } from './projectNumberUtils';

interface Order {
  id: string;
  customer: string;
  email: string;
  status: string;
  items: number;
  total: string;
  date: string;
  paymentStatus: string;
  shipping: string;
  createdAt?: string;
  projectName?: string;
  eventType?: string;
  stage?: string;
  inHandsDate?: string;
  terms?: string;
  isSampleOrder?: boolean;
  lineItems?: any[];
  sourcePONumber?: string;
  sourcePOId?: string;
  vendor?: string;
  projectNumber?: string;
  shipDate?: string | null;
  project?: string;
  source?: string;
  [key: string]: any;
}

const ORDER_STATUSES = ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const ORDER_STAGES = ['opportunity', 'presentation', 'estimate', 'sales-order'];

// Custom dropdown component (matching PurchasingModule)
function OrderFilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const allLabel = options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          value !== allLabel
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
      >
        <span className="text-slate-500 font-medium">{label}:</span>
        <span>{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden"
          >
            <div className="py-1.5">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    value === opt
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                  {value === opt && (
                    <span className="float-right text-blue-500 font-bold">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Shipped':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Processing':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Confirmed':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Pending':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Refunded':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'opportunity':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'presentation':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'estimate':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'sales-order':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStageLabel = (stage: string) => {
  switch (stage) {
    case 'opportunity': return 'Opportunity';
    case 'presentation': return 'Presentation';
    case 'estimate': return 'Estimate';
    case 'sales-order': return 'Sales Order';
    default: return stage || 'N/A';
  }
};

export function OrdersPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ project: string; shipDate: string; inHandsDate: string }>({ project: '', shipDate: '', inHandsDate: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'samples'>('orders');
  const [samplePage, setSamplePage] = useState(1);
  const rowsPerPage = 15;

  // Vendor & customer logo lookup maps
  const [vendorLogoMap, setVendorLogoMap] = useState<Record<string, string>>({});
  const [customerLogoMap, setCustomerLogoMap] = useState<Record<string, string>>({});

  // Fetch vendor and customer logos for table display. Neither endpoint
  // returns a `success` flag, so key off the HTTP status and accept
  // either `name` or `vendorName` on vendor docs (legacy schema).
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const [vendorRes, customerRes] = await Promise.all([
          fetch('/api/vendors/list'),
          fetch('/api/customers/list'),
        ]);
        if (vendorRes.ok) {
          const vendorData = await vendorRes.json();
          const map: Record<string, string> = {};
          (vendorData.vendors || []).forEach((v: any) => {
            const name = v.name || v.vendorName;
            if (name && v.logo) map[String(name).trim().toLowerCase()] = v.logo;
          });
          setVendorLogoMap(map);
        }
        if (customerRes.ok) {
          const customerData = await customerRes.json();
          const map: Record<string, string> = {};
          (customerData.customers || []).forEach((c: any) => {
            if (c.name && c.logo) map[String(c.name).trim().toLowerCase()] = c.logo;
          });
          setCustomerLogoMap(map);
        }
      } catch (err) {
        console.error('Error fetching logos for orders table:', err);
      }
    };
    fetchLogos();
  }, []);

  // Column visibility
  const orderColumns: ColumnDef[] = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'projectNumber', label: 'Project #' },
    { key: 'project', label: 'Project' },
    { key: 'poNumber', label: 'PO Number' },
    { key: 'status', label: 'Status' },
    { key: 'items', label: 'Items' },
    { key: 'shipDate', label: 'Ship Date' },
    { key: 'inHands', label: 'In-Hands' },
    { key: 'date', label: 'Date' },
    { key: 'total', label: 'Total' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    orderColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;
  const visibleColCount = orderColumns.filter(c => isColVisible(c.key)).length;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/list');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      // Sort by createdAt descending
      const sorted = (data.orders || []).sort((a: Order, b: Order) => {
        const dateA = new Date(a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.createdAt || b.date || 0).getTime();
        return dateB - dateA;
      });
      setOrders(sorted);
      // Background sync: fix stale totals for PO-linked orders
      syncOrderTotalsFromPOs(sorted);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Background sync: recalculate totals from source POs for orders with stale data
  const syncOrderTotalsFromPOs = async (ordersList: Order[]) => {
    const poLinkedOrders = ordersList.filter(o => o.sourcePOId);
    if (poLinkedOrders.length === 0) return;

    try {
      const poRes = await fetch('/api/purchasing/list');
      if (!poRes.ok) return;
      const poData = await poRes.json();
      const poMap: Record<string, any> = {};
      (poData.purchaseOrders || poData.orders || []).forEach((po: any) => { poMap[po.id] = po; });

      let anyUpdated = false;

      for (const order of poLinkedOrders) {
        const po = poMap[order.sourcePOId!];
        if (!po) continue;

        const poLineItems = po.lineItems || [];
        const poVariants = po.variants || [];
        const sourceItems = poLineItems.length > 0 ? poLineItems : poVariants;

        const lineItemSubtotal = sourceItems.reduce((sum: number, item: any) => {
          return sum + ((item.quantity || item.qty || 1) * (item.unitPrice || item.costPerUnit || 0));
        }, 0);
        const subItemsTotal = poLineItems.reduce((sum: number, item: any) => {
          return sum + (item.subItems || []).reduce((s: number, si: any) => s + ((si.amount || 0) * (si.quantity || 1)), 0);
        }, 0);
        const poCustomLineItems = po.customLineItems || [];
        const customItemsTotal = poCustomLineItems.reduce((sum: number, item: any) => sum + ((item.amount || 0) * (item.quantity || 1)), 0);
        const computedSubtotal = lineItemSubtotal + subItemsTotal + customItemsTotal;
        const poTaxRate = po.salesTaxRate ?? 0;
        const computedTax = computedSubtotal * poTaxRate;
        const computedTotal = computedSubtotal + computedTax;

        const currentTotal = parseFloat(String(order.total ?? '0').replace('$', '').replace(',', '')) || 0;
        if (Math.abs(currentTotal - computedTotal) > 0.01) {
          const updates = {
            subtotal: `$${computedSubtotal.toFixed(2)}`,
            taxRate: parseFloat((poTaxRate * 100).toFixed(2)),
            taxAmount: `$${computedTax.toFixed(2)}`,
            total: `$${computedTotal.toFixed(2)}`,
            poCharges: poCustomLineItems.length > 0 ? poCustomLineItems : undefined,
          };
          await fetch('/api/orders/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: order.id, ...updates }),
          });
          order.total = `$${computedTotal.toFixed(2)}`;
          (order as any).subtotal = `$${computedSubtotal.toFixed(2)}`;
          (order as any).taxAmount = `$${computedTax.toFixed(2)}`;
          (order as any).taxRate = parseFloat((poTaxRate * 100).toFixed(2));
          anyUpdated = true;
          console.log(`Background sync: updated order ${order.id} total to $${computedTotal.toFixed(2)} from PO ${order.sourcePOId}`);
        }
      }

      if (anyUpdated) {
        setOrders([...ordersList]);
      }
    } catch (err) {
      console.error('Error in background sync of order totals:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Deep-link: check if another module requested a specific order by PP- projectNumber
  useEffect(() => {
    const deepLinkPN = sessionStorage.getItem('orders_deep_link_projectNumber');
    if (deepLinkPN && orders.length > 0) {
      sessionStorage.removeItem('orders_deep_link_projectNumber');
      const target = orders.find(o => o.projectNumber === deepLinkPN);
      if (target) {
        setSelectedOrder(target);
      }
    }
  }, [orders]);

  const handleDeleteOrder = async () => {
    if (!deleteOrder) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteOrder.id }),
      });
      if (!res.ok) throw new Error('Failed');
      setOrders(prev => prev.filter(o => o.id !== deleteOrder.id));
      setDeleteOrder(null);
    } catch (err) {
      console.error('Error deleting order:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Helper to get item quantity from order
  const getItemQuantity = (order: Order): number => {
    // Check for items count passed from PO creation
    if (order.items && order.items > 0) return order.items;
    // Check for lineItems array with quantities
    if (order.lineItems && Array.isArray(order.lineItems) && order.lineItems.length > 0) {
      const totalQty = order.lineItems.reduce((sum: number, item: any) => sum + (item.quantity || item.qty || 1), 0);
      if (totalQty > 0) return totalQty;
    }
    return 0;
  };

  // Helper to get project name - for sample orders, use item name from project field
  const getProjectName = (order: Order): string => {
    // project field comes from PO creation (po.project which is productName for samples)
    if (order.project && order.project !== 'N/A') return order.project;
    if (order.projectName) return order.projectName;
    return '';
  };

  // Helper to get order date (when it entered the orders module)
  const getOrderDate = (order: Order): string => {
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
    return order.date || '';
  };

  const activeFilterCount = [selectedStatus !== 'all'].filter(Boolean).length;

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedStatus]);

  // If viewing an order detail, render the detail view instead
  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null);
          fetchOrders(); // refresh list when coming back
        }}
        onEdit={(order) => {
          // TODO: open edit drawer
          setSelectedOrder(null);
        }}
        onRefresh={fetchOrders}
      />
    );
  }

  const filteredOrders = orders.filter((order) => {
    // Exclude sample and competitor orders from All Orders tab
    if (order.isSampleOrder) return false;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.id?.toLowerCase().includes(searchLower) ||
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.customer?.toLowerCase().includes(searchLower) ||
      order.email?.toLowerCase().includes(searchLower) ||
      order.projectName?.toLowerCase().includes(searchLower) ||
      order.project?.toLowerCase().includes(searchLower) ||
      (order.projectNumber || '').toLowerCase().includes(searchLower) ||
      order.sourcePONumber?.toLowerCase().includes(searchLower);
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics from regular orders only (exclude sample/competitor)
  const regularOrders = orders.filter(o => !o.isSampleOrder);
  const totalOrders = regularOrders.length;
  const pendingOrders = regularOrders.filter(o => o.status === 'Pending').length;
  const processingOrders = regularOrders.filter(o => o.status === 'Processing').length;
  const shippedOrders = regularOrders.filter(o => o.status === 'Shipped').length;
  const deliveredOrders = regularOrders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = regularOrders.reduce((sum, o) => {
    const raw = o.total;
    const val = parseFloat(String(raw ?? '0').replace('$', '').replace(',', '')) || 0;
    return sum + val;
  }, 0);

  // Calculate sample-specific statistics (used by both stats cards and samples tab)
  const allSampleOrders = orders.filter(o => o.isSampleOrder);
  const totalSamples = allSampleOrders.length;
  const competitorSamples = allSampleOrders.filter(o => o.sampleType === 'competitor').length;
  const preProductionSamples = allSampleOrders.filter(o => o.sampleType === 'pre-production').length;
  const confirmedSamples = allSampleOrders.filter(o => o.status === 'Confirmed').length;
  const sampleTotalValue = allSampleOrders.reduce((sum, o) => {
    const val = parseFloat(String(o.total ?? '0').replace('$', '').replace(',', '')) || 0;
    return sum + val;
  }, 0);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Orders</h1>
                <p className="text-slate-500 text-sm">Manage and track customer orders from placement to delivery</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateDrawerOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 text-sm font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Order
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards — swap based on active tab */}
      <div className="px-6 mt-4 mb-4">
        <div className="max-w-[1800px] mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' ? (
              <motion.div
                key="order-stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-3"
              >
                {[
                  { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingCart, color: 'from-blue-500 to-blue-600' },
                  { label: 'Pending', value: pendingOrders.toString(), icon: Clock, color: 'from-amber-500 to-amber-600' },
                  { label: 'Processing', value: processingOrders.toString(), icon: Package, color: 'from-purple-500 to-purple-600' },
                  { label: 'Shipped', value: shippedOrders.toString(), icon: Truck, color: 'from-cyan-500 to-cyan-600' },
                  { label: 'Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'from-green-500 to-green-600' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mb-0.5">{stat.label}</div>
                    <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="sample-stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-3"
              >
                {[
                  { label: 'Total Samples', value: totalSamples.toString(), icon: FlaskConical, color: 'from-orange-500 to-orange-600' },
                  { label: 'Competitor', value: competitorSamples.toString(), icon: Tag, color: 'from-red-500 to-red-600' },
                  { label: 'Pre-Production', value: preProductionSamples.toString(), icon: Package, color: 'from-purple-500 to-purple-600' },
                  { label: 'Confirmed', value: confirmedSamples.toString(), icon: CheckCircle, color: 'from-green-500 to-green-600' },
                  { label: 'Total Value', value: `$${sampleTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'from-cyan-500 to-cyan-600' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mb-0.5">{stat.label}</div>
                    <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-6 mb-4 shrink-0">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm w-fit">
            <button
              onClick={() => { setActiveTab('orders'); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              All Orders
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{orders.filter(o => !o.isSampleOrder).length}</span>
            </button>
            <button
              onClick={() => { setActiveTab('samples'); setSamplePage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'samples'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Sample Orders
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'samples' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{orders.filter(o => o.isSampleOrder).length}</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'orders' && (
      <>
      {/* Filters and Search */}
      <div className="px-6 pb-0 shrink-0 overflow-visible relative z-20">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm overflow-visible">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders, customers, projects, or emails..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchOrders}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2.5 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>
                )}
              </div>

              <OrderFilterDropdown
                label="Status"
                value={selectedStatus === 'all' ? 'All Status' : selectedStatus}
                options={['All Status', ...ORDER_STATUSES]}
                onChange={(val) => { setSelectedStatus(val === 'All Status' ? 'all' : val); setCurrentPage(1); }}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all text-xs ml-auto"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </motion.button>

              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStatus('all')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}

              <div className="ml-auto">
                <ColumnVisibilityDropdown
                  columns={orderColumns}
                  visibleColumns={columnVisibility}
                  onChange={setColumnVisibility}
                  accentColor="blue"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {isColVisible('orderId') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>}
                    {isColVisible('customer') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Customer</th>}
                    {isColVisible('projectNumber') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Project #</th>}
                    {isColVisible('project') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Project</th>}
                    {isColVisible('poNumber') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">PO Number</th>}
                    {isColVisible('status') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>}
                    {isColVisible('items') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Items</th>}
                    {isColVisible('shipDate') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ship Date</th>}
                    {isColVisible('inHands') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">In-Hands</th>}
                    {isColVisible('date') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>}
                    {isColVisible('total') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total</th>}
                    {isColVisible('actions') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={visibleColCount} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-slate-600 font-medium">Loading orders...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColCount} className="px-8 py-20">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                            <ShoppingCart className="w-10 h-10 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {filteredOrders.length === 0 && orders.length > 0 ? 'No matching orders' : 'No orders yet'}
                          </h3>
                          <p className="text-sm text-slate-500 max-w-md">
                            {filteredOrders.length === 0 && orders.length > 0
                              ? 'Try adjusting your search or filters'
                              : 'Start by creating your first order'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {isColVisible('orderId') && <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{order.orderNumber || order.id}</span>
                            {order.isSampleOrder && (
                              <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[9px] font-bold border border-cyan-200">SAMPLE</span>
                            )}
                          </div>
                        </td>}
                        {isColVisible('customer') && <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 min-w-0">
                            {customerLogoMap[(order.customer || '').trim().toLowerCase()] ? (
                              <div className="w-8 h-7 rounded-md flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                                <img src={customerLogoMap[(order.customer || '').trim().toLowerCase()]} alt={order.customer} className="max-w-full max-h-full object-contain p-0.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-slate-900 truncate">{order.customer}</span>
                          </div>
                        </td>}
                        {isColVisible('projectNumber') && <td className="px-4 py-3 whitespace-nowrap">
                          {order.projectNumber ? (
                            <div className="flex items-center gap-1.5">
                              <Hash className={`w-3.5 h-3.5 ${getProjectIconColor(order.projectNumber)}`} />
                              <button
                                onClick={() => {
                                  sessionStorage.setItem(getDeepLinkKey(order.projectNumber!), order.projectNumber!);
                                  onNavigate?.(getDeepLinkTarget(order.projectNumber!));
                                }}
                                className={`text-xs font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${getProjectBadgeClasses(order.projectNumber)}`}
                              >
                                {order.projectNumber}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 italic">—</span>
                          )}
                        </td>}
                        {isColVisible('project') && <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{getProjectName(order) || '—'}</span>
                        </td>}
                        {isColVisible('poNumber') && <td className="px-4 py-3 whitespace-nowrap">
                          {order.sourcePONumber ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (order.sourcePOId) {
                                  sessionStorage.setItem('purchasing_deep_link_poId', order.sourcePOId);
                                }
                                onNavigate?.('purchasing');
                              }}
                              className="flex items-center gap-1.5 group/po"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-500 group-hover/po:text-blue-700 transition-colors" />
                              <span className="text-sm font-medium text-blue-600 group-hover/po:text-blue-800 group-hover/po:underline transition-colors">{order.sourcePONumber}</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>}
                        {isColVisible('status') && <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            {order.missedInHandsDate && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                                LATE
                              </span>
                            )}
                          </div>
                        </td>}
                        {isColVisible('items') && <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-slate-700">
                            {getItemQuantity(order)} {getItemQuantity(order) === 1 ? 'item' : 'items'}
                          </span>
                        </td>}
                        {isColVisible('shipDate') && <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-slate-600">{order.shipDate || '—'}</span>
                        </td>}
                        {isColVisible('inHands') && <td className="px-4 py-3 whitespace-nowrap">
                          {order.inHandsDate ? (
                            <span className="text-sm text-slate-600">{order.inHandsDate}</span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>}
                        {isColVisible('date') && <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-slate-600">{getOrderDate(order)}</span>
                        </td>}
                        {isColVisible('total') && <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-green-600">
                            {(() => {
                              const raw = String(order.total ?? '0');
                              const num = parseFloat(raw.replace('$', '').replace(',', '')) || 0;
                              return `$${num.toFixed(2)}`;
                            })()}
                          </span>
                        </td>}
                        {isColVisible('actions') && <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="View Order"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit Order"
                              onClick={() => {
                                setEditingOrderId(order.id);
                                setEditValues({ project: order.project || '', shipDate: order.shipDate || '', inHandsDate: order.inHandsDate || '' });
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setDeleteOrder(order)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - inside table card */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {Math.max(1, totalPages)} · Showing {Math.min(startIndex + 1, filteredOrders.length)} to {Math.min(startIndex + rowsPerPage, filteredOrders.length)} of {filteredOrders.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled
                >
                  <option value={15}>15</option>
                </select>
                <div className="flex gap-1 ml-4">
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    disabled={currentPage >= Math.max(1, totalPages)}
                    onClick={() => setCurrentPage(p => Math.min(Math.max(1, totalPages), p + 1))}
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Sample Orders Tab */}
      {activeTab === 'samples' && (() => {
        const sampleSearchLower = searchTerm.toLowerCase();
        const filteredSamples = allSampleOrders.filter(o => {
          const matchesSearch =
            o.id?.toLowerCase().includes(sampleSearchLower) ||
            o.customer?.toLowerCase().includes(sampleSearchLower) ||
            o.vendor?.toLowerCase().includes(sampleSearchLower) ||
            o.project?.toLowerCase().includes(sampleSearchLower) ||
            (o.projectNumber || '').toLowerCase().includes(sampleSearchLower) ||
            o.sourcePONumber?.toLowerCase().includes(sampleSearchLower);
          const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
          return matchesSearch && matchesStatus;
        });
        const sampleTotalPages = Math.ceil(filteredSamples.length / rowsPerPage);
        const sampleStartIdx = (samplePage - 1) * rowsPerPage;
        const paginatedSamples = filteredSamples.slice(sampleStartIdx, sampleStartIdx + rowsPerPage);

        return (
          <>
            {/* Sample Search + Filters */}
            <div className="px-8 pb-0 shrink-0 mb-6">
              <div className="max-w-[1800px] mx-auto">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search sample orders by ID, customer, vendor, or PO..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setSamplePage(1); }}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchOrders}
                      className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                    </motion.button>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Filter className="w-4 h-4" />
                      Filters
                    </div>
                    <OrderFilterDropdown
                      label="Status"
                      value={selectedStatus === 'all' ? 'All Status' : selectedStatus}
                      options={['All Status', 'Confirmed', 'Shipped', 'Delivered', 'Pending', 'Processing', 'Cancelled']}
                      onChange={(val) => { setSelectedStatus(val === 'All Status' ? 'all' : val); setSamplePage(1); }}
                    />

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all text-sm ml-auto"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </motion.button>

                    <div className="ml-auto">
                      <ColumnVisibilityDropdown
                        columns={orderColumns}
                        visibleColumns={columnVisibility}
                        onChange={setColumnVisibility}
                        accentColor="orange"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Orders Table */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="max-w-[1800px] mx-auto">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1400px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Type</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Customer</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Project #</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Product</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Vendor</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Source PO</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Items</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">In-Hands</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Total</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loading ? (
                          <tr>
                            <td colSpan={12} className="px-6 py-20 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-600 font-medium">Loading sample orders...</p>
                              </div>
                            </td>
                          </tr>
                        ) : paginatedSamples.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="px-8 py-20">
                              <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-4">
                                  <FlaskConical className="w-10 h-10 text-orange-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">No sample orders yet</h3>
                                <p className="text-sm text-slate-500 max-w-md">
                                  Sample orders appear here when a competitor sample PO is confirmed in the Purchasing module
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedSamples.map((order, index) => (
                            <motion.tr
                              key={order.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="hover:bg-orange-50/30 transition-colors"
                            >
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-slate-900">{order.orderNumber || order.id}</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                                  order.sampleType === 'competitor'
                                    ? 'bg-orange-100 text-orange-700 border-orange-200'
                                    : 'bg-purple-100 text-purple-700 border-purple-200'
                                }`}>
                                  {order.sampleType === 'competitor' ? 'Competitor' : order.sampleType === 'pre-production' ? 'Pre-Prod' : 'Sample'}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 min-w-0">
                                  {customerLogoMap[(order.customer || '').trim().toLowerCase()] ? (
                                    <div className="w-8 h-7 rounded-md flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                                      <img src={customerLogoMap[(order.customer || '').trim().toLowerCase()]} alt={order.customer} className="max-w-full max-h-full object-contain p-0.5" />
                                    </div>
                                  ) : (
                                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shrink-0">
                                      <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-slate-900 truncate">{order.customer}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {order.projectNumber ? (
                                  <div className="flex items-center gap-1.5">
                                    <Hash className={`w-3.5 h-3.5 ${getProjectIconColor(order.projectNumber)}`} />
                                    <button
                                      onClick={() => {
                                        sessionStorage.setItem(getDeepLinkKey(order.projectNumber!), order.projectNumber!);
                                        onNavigate?.(getDeepLinkTarget(order.projectNumber!));
                                      }}
                                      className={`text-xs font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${getProjectBadgeClasses(order.projectNumber)}`}
                                    >
                                      {order.projectNumber}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400 italic">—</span>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm text-slate-700">{getProjectName(order) || '—'}</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 min-w-0">
                                  {vendorLogoMap[(order.vendor || '').trim().toLowerCase()] ? (
                                    <div className="w-8 h-7 rounded-md flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                                      <img src={vendorLogoMap[(order.vendor || '').trim().toLowerCase()]} alt={order.vendor} className="max-w-full max-h-full object-contain p-0.5" />
                                    </div>
                                  ) : (
                                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center shrink-0">
                                      <Building2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-slate-900 truncate">{order.vendor || '—'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {order.sourcePONumber ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (order.sourcePOId) {
                                        sessionStorage.setItem('purchasing_deep_link_poId', order.sourcePOId);
                                      }
                                      onNavigate?.('purchasing');
                                    }}
                                    className="flex items-center gap-1.5 group/po"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-orange-500 group-hover/po:text-orange-700 transition-colors" />
                                    <span className="text-sm font-medium text-orange-600 group-hover/po:text-orange-800 group-hover/po:underline transition-colors">{order.sourcePONumber}</span>
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                  {order.missedInHandsDate && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                                      LATE
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm text-slate-700">
                                  {getItemQuantity(order)} {getItemQuantity(order) === 1 ? 'item' : 'items'}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {order.inHandsDate ? (
                                  <span className="text-sm text-slate-600">{order.inHandsDate}</span>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold text-green-600">
                                  {(() => {
                                    const raw = String(order.total ?? '0');
                                    const num = parseFloat(raw.replace('$', '').replace(',', '')) || 0;
                                    return `$${num.toFixed(2)}`;
                                  })()}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="View Order"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDeleteOrder(order)}
                                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete Order"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Page {samplePage} of {Math.max(1, sampleTotalPages)} · Showing {Math.min(sampleStartIdx + 1, filteredSamples.length)} to {Math.min(sampleStartIdx + rowsPerPage, filteredSamples.length)} of {filteredSamples.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 ml-4">
                        <button
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                          disabled={samplePage <= 1}
                          onClick={() => setSamplePage(p => Math.max(1, p - 1))}
                        >
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                          disabled={samplePage >= Math.max(1, sampleTotalPages)}
                          onClick={() => setSamplePage(p => Math.min(Math.max(1, sampleTotalPages), p + 1))}
                        >
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Create Order Drawer */}
      <CreateOrderDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreated={fetchOrders}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteOrder(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-red-50 px-6 py-5 border-b border-red-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Order</h3>
                        <p className="text-sm text-slate-600">This action cannot be undone</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteOrder(null)}
                      className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <p className="text-slate-700">
                    Are you sure you want to delete order{' '}
                    <span className="font-bold text-slate-900">{deleteOrder.orderNumber || deleteOrder.id}</span>
                    {deleteOrder.projectName && (
                      <> for project <span className="font-bold text-slate-900">"{deleteOrder.projectName}"</span></>
                    )}
                    ? All associated data will be permanently removed.
                  </p>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex items-center gap-3">
                  <button
                    onClick={() => setDeleteOrder(null)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOrder}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Order Drawer */}
      <AnimatePresence>
        {editingOrderId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingOrderId(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Edit2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Edit Order</h3>
                      <p className="text-sm text-slate-500">Quick edit — {editingOrderId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingOrderId(null)}
                    className="w-10 h-10 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
                    <input
                      type="text"
                      value={editValues.project}
                      onChange={(e) => setEditValues({ ...editValues, project: e.target.value })}
                      placeholder="Enter project name..."
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ship Date</label>
                    <DatePicker
                      value={editValues.shipDate || ''}
                      onChange={(date) => setEditValues({ ...editValues, shipDate: date })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">In-Hands Date</label>
                    <DatePicker
                      value={editValues.inHandsDate || ''}
                      onChange={(date) => setEditValues({ ...editValues, inHandsDate: date })}
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingOrderId(null)}
                    className="flex-1 px-5 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const res = await fetch('/api/orders/update', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: editingOrderId,
                            project: editValues.project,
                            shipDate: editValues.shipDate,
                            inHandsDate: editValues.inHandsDate,
                          }),
                        });
                        if (res.ok) {
                          setOrders(prev => prev.map(o => o.id === editingOrderId ? { ...o, ...editValues } : o));
                          setEditingOrderId(null);
                        } else {
                          const data = await res.json().catch(() => ({}));
                          console.error('Error updating order:', data.error);
                        }
                      } catch (err) {
                        console.error('Error updating order:', err);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}