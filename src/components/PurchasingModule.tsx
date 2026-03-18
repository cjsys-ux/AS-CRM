import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Search, Plus, Eye, Edit, Trash2, DollarSign, Package, Clock, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, Calendar, User, Building2, Filter, ChevronDown, X, RefreshCw, Truck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { DeletePurchaseOrderModal } from './DeletePurchaseOrderModal';
import { EditPurchaseOrderDrawer } from './EditPurchaseOrderDrawer';
import { PurchaseOrderDetailView } from './PurchaseOrderDetailView';
import { toast } from 'sonner@2.0.3';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';
import { getProjectBadgeClasses, getProjectIconColor, getDeepLinkKey, getDeepLinkTarget } from './projectNumberUtils';


type PurchaseOrder = {
  id: string;
  poNumber: string;
  poDate: string;
  project: string;
  projectNumber?: string;
  vendor: string;
  vendorId?: string;
  customer: string;
  status: string;
  shipDate: string | null;
  inHandsDate: string;
  total: number;
  priority: string;
  contact: string;
  contactId?: string;
  contacts?: Array<{
    name: string;
    role?: string;
    address?: string;
    fullAddress?: string;
    contactId?: string;
  }>;
  shipToAddresses?: Array<{
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    contact?: string;
  }>;
  destinations?: any[];
  isSample?: boolean;
  createdAt?: string;
  [key: string]: any;
};

const PO_STATUSES = ['Created', 'Submitted', 'Confirmed', 'In Production', 'Shipped', 'Delivered', 'Issue'];
const PO_PRIORITIES = ['1st Choice', '2nd Choice', '3rd Choice', 'Backup'];

// Custom dropdown component (matching ContactsModule)
function POFilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
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
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
          value !== allLabel
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
      >
        <span className="text-slate-500 font-medium">{label}:</span>
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
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

export function PurchasingModule({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [vendorFilter, setVendorFilter] = useState('All Vendors');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<PurchaseOrder | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Vendor & customer logo lookup maps
  const [vendorLogoMap, setVendorLogoMap] = useState<Record<string, string>>({});
  const [customerLogoMap, setCustomerLogoMap] = useState<Record<string, string>>({});
  // Vendor lookup by ID for enriching PO vendor column
  const [vendorDataMap, setVendorDataMap] = useState<Record<string, { name: string; logo?: string; type?: string }>>({});
  // Contact lookup by ID for enriching PO contact column
  const [contactDataMap, setContactDataMap] = useState<Record<string, { name: string; company?: string; email?: string }>>({});

  // Column visibility
  const poColumns: ColumnDef[] = [
    { key: 'poDate', label: 'PO Date' },
    { key: 'poNumber', label: 'PO Number' },
    { key: 'projectNumber', label: 'Project #' },
    { key: 'project', label: 'Project' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'customer', label: 'Customer' },
    { key: 'contact', label: 'Contact' },
    { key: 'status', label: 'Status' },
    { key: 'shipDate', label: 'Ship Date' },
    { key: 'inHands', label: 'In-Hands' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'total', label: 'Total' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    poColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;
  const visibleColCount = poColumns.filter(c => isColVisible(c.key)).length;

  useEffect(() => {
    setVendorLogoMap({});
    setVendorDataMap({});
    setCustomerLogoMap({});
    setContactDataMap({});
  }, []);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setPurchaseOrders([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  // Deep-link: check if another module requested a specific PO by ID
  useEffect(() => {
    const deepLinkPoId = sessionStorage.getItem('purchasing_deep_link_poId');
    if (deepLinkPoId && purchaseOrders.length > 0) {
      sessionStorage.removeItem('purchasing_deep_link_poId');
      const target = purchaseOrders.find(o => o.id === deepLinkPoId);
      if (target) {
        setSelectedOrderId(target.id);
      }
    }
    // Also support deep-link by PO number (used by WMS Receiving)
    const deepLinkPoNumber = sessionStorage.getItem('purchasing_deep_link_poNumber');
    if (deepLinkPoNumber && purchaseOrders.length > 0) {
      sessionStorage.removeItem('purchasing_deep_link_poNumber');
      const target = purchaseOrders.find(o => o.poNumber === deepLinkPoNumber);
      if (target) {
        setSelectedOrderId(target.id);
      }
    }
  }, [purchaseOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Confirmed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'In Production':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Shipped':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Issue':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '1st Choice':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '2nd Choice':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '3rd Choice':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Backup':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Calculate KPIs
  const totalOrders = purchaseOrders.length;
  const totalSpend = purchaseOrders.reduce((sum, order) => sum + (parseFloat(String(order.total)) || 0), 0);
  const createdOrders = purchaseOrders.filter(order => order.status === 'Created' || order.status === 'Submitted').length;
  const approvedOrders = purchaseOrders.filter(order => order.status === 'Confirmed' || order.status === 'In Production').length;
  const deliveredOrders = purchaseOrders.filter(order => order.status === 'Delivered').length;

  // Pagination logic
  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.projectNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.contact || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status'
      ? (order.status !== 'Shipped' && order.status !== 'Delivered')
      : order.status === statusFilter;
    const matchesVendor = vendorFilter === 'All Vendors' || order.vendor === vendorFilter;
    const matchesPriority = priorityFilter === 'All Priority' || order.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesVendor && matchesPriority;
  });

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setPurchaseOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
    setDeleteModalOpen(false);
    setOrderToDelete(null);
    toast.success('Purchase order deleted successfully!');
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setOrderToEdit(order);
    setEditDrawerOpen(true);
  };

  const handleSaveOrder = async (updatedOrder: PurchaseOrder) => {
    setPurchaseOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setEditDrawerOpen(false);
    setOrderToEdit(null);
    toast.success('Purchase order updated successfully!');
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  // Handle status change from detail view
  const handleStatusChange = async (orderId: string, newStatus: string, extra?: { carrier?: string; trackingNumber?: string }) => {
    setPurchaseOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus, ...(extra || {}) } : order
      )
    );
    toast.success(`Status updated to ${newStatus}!`);
  };

  // Count active filters
  const activeFilterCount = [statusFilter !== 'All Status', vendorFilter !== 'All Vendors', priorityFilter !== 'All Priority'].filter(Boolean).length;

  // Get unique vendors from current orders for filter dropdown
  const uniqueVendors = [...new Set(purchaseOrders.map(o => o.vendor).filter(Boolean))];

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, vendorFilter, priorityFilter]);

  // If viewing a specific PO, show detail view
  const selectedOrder = selectedOrderId 
    ? purchaseOrders.find(o => o.id === selectedOrderId)
    : null;

  if (selectedOrderId && selectedOrder) {
    return (
      <PurchaseOrderDetailView 
        order={selectedOrder}
        onBack={() => { setSelectedOrderId(null); setTimeout(() => fetchPurchaseOrders(), 300); }}
        onEdit={() => handleEditOrder(selectedOrder)}
        onStatusChange={handleStatusChange}
        onOrderUpdate={fetchPurchaseOrders}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Purchasing</h1>
                <p className="text-slate-500 text-sm">Manage purchase orders and vendor pricing</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Purchase Order
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 mt-6 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-slate-900">{totalOrders}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Total Spend</div>
              <div className="text-2xl font-bold text-slate-900">${totalSpend.toFixed(2)}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Pending</div>
              <div className="text-2xl font-bold text-slate-900">{createdOrders}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Approved</div>
              <div className="text-2xl font-bold text-slate-900">{approvedOrders}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Delivered</div>
              <div className="text-2xl font-bold text-slate-900">{deliveredOrders}</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-8 pb-0 shrink-0 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by PO number, vendor, or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchPurchaseOrders}
                className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>
                )}
              </div>

              <POFilterDropdown label="Status" value={statusFilter} options={['All Status', ...PO_STATUSES]} onChange={setStatusFilter} />
              <POFilterDropdown label="Vendor" value={vendorFilter} options={['All Vendors', ...uniqueVendors]} onChange={setVendorFilter} />
              <POFilterDropdown label="Priority" value={priorityFilter} options={['All Priority', ...PO_PRIORITIES]} onChange={setPriorityFilter} />

              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setStatusFilter('All Status'); setVendorFilter('All Vendors'); setPriorityFilter('All Priority'); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}

              <div className="ml-auto">
                <ColumnVisibilityDropdown
                  columns={poColumns}
                  visibleColumns={columnVisibility}
                  onChange={setColumnVisibility}
                  accentColor="cyan"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {isColVisible('poDate') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">PO Date</th>}
                    {isColVisible('poNumber') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">PO Number</th>}
                    {isColVisible('projectNumber') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Project #</th>}
                    {isColVisible('project') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Project</th>}
                    {isColVisible('vendor') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Vendor</th>}
                    {isColVisible('customer') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Customer</th>}
                    {isColVisible('contact') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Contact</th>}
                    {isColVisible('status') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>}
                    {isColVisible('shipDate') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Ship Date</th>}
                    {isColVisible('inHands') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">In-Hands</th>}
                    {isColVisible('shipping') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Shipping</th>}
                    {isColVisible('total') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Total</th>}
                    {isColVisible('actions') && <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColCount} className="px-8 py-20">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                            <ShoppingCart className="w-10 h-10 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">No Purchase Orders Yet</h3>
                          <p className="text-sm text-slate-500 max-w-md">Get started by creating your first purchase order.</p>
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
                        {isColVisible('poDate') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600">{order.poDate}</span>
                          </td>
                        )}
                        {isColVisible('poNumber') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-slate-900">{order.poNumber}</span>
                          </td>
                        )}
                        {isColVisible('projectNumber') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            {order.projectNumber ? (
                              <button
                                onClick={() => {
                                  sessionStorage.setItem(getDeepLinkKey(order.projectNumber!), order.projectNumber!);
                                  onNavigate?.(getDeepLinkTarget(order.projectNumber!));
                                }}
                                className={`text-xs font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${getProjectBadgeClasses(order.projectNumber!)}`}
                              >
                                {order.projectNumber}
                              </button>
                            ) : (
                              <span className="text-sm text-slate-400 italic">—</span>
                            )}
                          </td>
                        )}
                        {isColVisible('project') && (
                          <td className="px-4 py-4">
                            <span className="text-sm text-slate-700 truncate block">{order.project}</span>
                          </td>
                        )}
                        {isColVisible('vendor') && (() => {
                          // Resolve vendor: prefer vendorId lookup, fallback to name
                          const vendorById = order.vendorId ? vendorDataMap[order.vendorId] : null;
                          const resolvedVendorName = vendorById?.name || order.vendor || '';
                          const resolvedVendorLogo = vendorById?.logo || vendorLogoMap[resolvedVendorName.trim().toLowerCase()] || '';
                          const vendorType = vendorById?.type || '';
                          return (
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 min-w-0">
                                {resolvedVendorLogo ? (
                                  <div className="w-8 h-7 rounded-md flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                                    <img src={resolvedVendorLogo} alt={resolvedVendorName} className="max-w-full max-h-full object-contain p-0.5" />
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center shrink-0">
                                    <Building2 className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="text-sm font-medium text-slate-900 truncate block">{resolvedVendorName}</span>
                                  {vendorType && (
                                    <span className="text-[10px] text-slate-400">{vendorType}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })()}
                        {isColVisible('customer') && (
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
                        )}
                        {isColVisible('contact') && (() => {
                          // Resolve contact: prefer contactId lookup, then contacts array, then contact string
                          const contactById = order.contactId ? contactDataMap[order.contactId] : null;
                          const resolvedContactName = contactById?.name || order.contact || '';
                          const resolvedCompany = contactById?.company || '';
                          const hasContact = resolvedContactName && resolvedContactName !== 'Select...';
                          return (
                            <td className="px-4 py-4 whitespace-nowrap">
                              {hasContact ? (
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="text-sm font-medium text-slate-700 truncate">{resolvedContactName}</span>
                                  </div>
                                  {resolvedCompany && (
                                    <span className="text-[10px] text-slate-400 ml-5">{resolvedCompany}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400 italic">—</span>
                              )}
                            </td>
                          );
                        })()}
                        {isColVisible('status') && (
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
                        )}
                        {isColVisible('shipDate') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600">{order.shipDate || '—'}</span>
                          </td>
                        )}
                        {isColVisible('inHands') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600">{order.inHandsDate || '—'}</span>
                          </td>
                        )}
                        {isColVisible('shipping') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            {order.shippingMethod && order.shippingMethod !== 'Not Set' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                                <Truck className="w-3 h-3 mr-1 shrink-0" />
                                {order.shippingMethod}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400 italic">—</span>
                            )}
                          </td>
                        )}
                        {isColVisible('total') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-green-600">${(parseFloat(String(order.total)) || 0).toFixed(2)}</span>
                          </td>
                        )}
                        {isColVisible('actions') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewOrder(order.id)}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditOrder(order)}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setOrderToDelete(order);
                                  setDeleteModalOpen(true);
                                }}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - inside table card */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {Math.max(1, totalPages)} · Showing {Math.min(startIndex + 1, filteredOrders.length)} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={e => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
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

      {/* Delete Modal */}
      <DeletePurchaseOrderModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={handleDeleteOrder}
        poNumber={orderToDelete?.poNumber || ''}
      />

      {/* Edit Drawer */}
      <EditPurchaseOrderDrawer
        isOpen={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setOrderToEdit(null);
        }}
        order={orderToEdit}
        onSave={handleSaveOrder}
      />
    </div>
  );
}