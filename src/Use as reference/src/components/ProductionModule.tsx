import { motion, AnimatePresence } from 'motion/react';
import { Factory, Plus, Search, Filter, Download, Play, CheckCircle, Clock, Eye, Edit2, Trash2, ArrowUpDown, ChevronDown, X, RefreshCw, AlertTriangle, Loader2, Package, Gauge } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { EnhancedProductionGanttView } from './EnhancedProductionGanttView';
import { DeleteProductionOrderModal } from './DeleteProductionOrderModal';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { DatePicker } from './DatePicker';
import { QuantityStepper } from './QuantityStepper';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

interface ProductionOrder {
  id: string;
  orderName: string;
  client: string;
  status: string;
  priority: string;
  quantity: number;
  completed: number;
  startDate: string;
  dueDate: string;
  assignedTo: string;
  quality: number;
  createdAt?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Quality Check':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Pending':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'On Hold':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Low':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// ========= ADD / EDIT PRODUCTION ORDER DRAWER =========
function AddProductionOrderDrawer({
  isOpen,
  onClose,
  onSuccess,
  editOrder,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editOrder?: ProductionOrder | null;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    orderName: '',
    client: '',
    status: 'Pending',
    priority: 'Medium',
    quantity: 0,
    completed: 0,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    assignedTo: '',
    quality: 0,
  });

  useEffect(() => {
    if (editOrder) {
      setForm({
        orderName: editOrder.orderName || '',
        client: editOrder.client || '',
        status: editOrder.status || 'Pending',
        priority: editOrder.priority || 'Medium',
        quantity: editOrder.quantity || 0,
        completed: editOrder.completed || 0,
        startDate: editOrder.startDate || '',
        dueDate: editOrder.dueDate || '',
        assignedTo: editOrder.assignedTo || '',
        quality: editOrder.quality || 0,
      });
    } else {
      setForm({
        orderName: '',
        client: '',
        status: 'Pending',
        priority: 'Medium',
        quantity: 0,
        completed: 0,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        assignedTo: '',
        quality: 0,
      });
    }
  }, [editOrder, isOpen]);

  const handleSave = async () => {
    if (!form.orderName.trim()) { toast.error('Order name is required'); return; }
    if (!form.client.trim()) { toast.error('Client is required'); return; }

    setIsSaving(true);
    try {
      const isEdit = !!editOrder;
      const url = isEdit ? `${API_URL}/production/${editOrder.id}` : `${API_URL}/production`;
      const method = isEdit ? 'PUT' : 'POST';

      const body = isEdit ? { ...form } : { ...form };
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(isEdit ? 'Production order updated' : 'Production order created');
        onSuccess();
        onClose();
      } else {
        toast.error(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving production order:', error);
      toast.error('Error saving production order');
    } finally {
      setIsSaving(false);
    }
  };

  const InputField = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all";
  const selectCls = "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all";

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
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Factory className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{editOrder ? 'Edit Production Order' : 'New Production Order'}</h2>
                  <p className="text-xs text-orange-100">{editOrder ? `Editing ${editOrder.id}` : 'Create a new production order'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Order Info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Order Information</h3>
                <div className="space-y-3">
                  <InputField label="Order Name" required>
                    <input type="text" value={form.orderName} onChange={e => setForm(p => ({ ...p, orderName: e.target.value }))} placeholder="e.g. Custom T-Shirt Run" className={inputCls} />
                  </InputField>
                  <InputField label="Client" required>
                    <input type="text" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} placeholder="e.g. Tech Startup Inc." className={inputCls} />
                  </InputField>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Status">
                      <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={selectCls}>
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Quality Check</option>
                        <option>Completed</option>
                        <option>On Hold</option>
                        <option>Cancelled</option>
                      </select>
                    </InputField>
                    <InputField label="Priority">
                      <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className={selectCls}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </InputField>
                  </div>
                </div>
              </div>

              {/* Quantities */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Quantity & Quality</h3>
                <div className="grid grid-cols-3 gap-3">
                  <InputField label="Total Quantity">
                    <QuantityStepper value={form.quantity || 0} onChange={(val) => setForm(p => ({ ...p, quantity: val }))} min={0} wide />
                  </InputField>
                  <InputField label="Completed">
                    <QuantityStepper value={form.completed || 0} onChange={(val) => setForm(p => ({ ...p, completed: val }))} min={0} wide />
                  </InputField>
                  <InputField label="Quality %">
                    <input type="number" min="0" max="100" value={form.quality || ''} onChange={e => setForm(p => ({ ...p, quality: e.target.value === '' ? '' : parseInt(e.target.value) }))} className={inputCls} />
                  </InputField>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Schedule & Assignment</h3>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Start Date">
                    <DatePicker value={form.startDate} onChange={v => setForm(p => ({ ...p, startDate: v }))} />
                  </InputField>
                  <InputField label="Due Date">
                    <DatePicker value={form.dueDate} onChange={v => setForm(p => ({ ...p, dueDate: v }))} />
                  </InputField>
                </div>
                <div className="mt-3">
                  <InputField label="Assigned To">
                    <input type="text" value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} placeholder="e.g. Production Line A" className={inputCls} />
                  </InputField>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all">
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : (editOrder ? 'Update Order' : 'Create Order')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ========= MAIN MODULE =========
export function ProductionModule() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<ProductionOrder | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<ProductionOrder | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedLine, setSelectedLine] = useState('all');

  // Column visibility
  const productionColumns: ColumnDef[] = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'orderName', label: 'Order Name' },
    { key: 'client', label: 'Client' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'progress', label: 'Progress' },
    { key: 'quality', label: 'Quality' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'line', label: 'Line' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    productionColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;

  // Fetch from backend
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/production`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch production orders:', data.error);
        toast.error('Failed to load production orders');
      }
    } catch (error) {
      console.error('Error fetching production orders:', error);
      toast.error('Error loading production orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Delete
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      const response = await fetch(`${API_URL}/production/${orderToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Production order deleted');
        fetchOrders();
      } else {
        toast.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting production order:', error);
      toast.error('Error deleting order');
    }
  };

  // Filtering
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.orderName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority;
    const matchesLine = selectedLine === 'all' || order.assignedTo === selectedLine;
    return matchesSearch && matchesStatus && matchesPriority && matchesLine;
  });

  // Sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortColumn) return 0;
    let aVal: any, bVal: any;
    switch (sortColumn) {
      case 'orderName': aVal = a.orderName; bVal = b.orderName; break;
      case 'client': aVal = a.client; bVal = b.client; break;
      case 'status': aVal = a.status; bVal = b.status; break;
      case 'quality': aVal = a.quality; bVal = b.quality; break;
      case 'dueDate': aVal = a.dueDate; bVal = b.dueDate; break;
      default: return 0;
    }
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
  });

  const totalPages = Math.ceil(sortedOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // KPIs
  const totalOrders = orders.length;
  const inProgressCount = orders.filter(o => o.status === 'In Progress').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const qualityOrders = orders.filter(o => (o.quality || 0) > 0);
  const avgQuality = qualityOrders.length > 0 ? qualityOrders.reduce((sum, o) => sum + o.quality, 0) / qualityOrders.length : 0;

  const activeFilters = (selectedStatus !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0) + (selectedLine !== 'all' ? 1 : 0);

  // Unique lines for filter
  const uniqueLines = [...new Set(orders.map(o => o.assignedTo).filter(Boolean))];

  return (
    <>
      {isDetailOpen && selectedOrder ? (
        <EnhancedProductionGanttView
          order={selectedOrder}
          onClose={() => setIsDetailOpen(false)}
        />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section - matches Customers */}
          <div className="bg-white border-b border-slate-200 px-8 py-8">
            <div className="max-w-[1800px] mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center">
                    <Factory className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Production Management</h1>
                    <p className="text-slate-500">Monitor and manage production orders and quality control</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setEditOrder(null); setDrawerOpen(true); }}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  New Production Order
                </motion.button>
              </div>
            </div>
          </div>

          {/* KPI Cards - matches Customers pattern exactly */}
          <div className="px-8 mt-6 mb-6 relative z-10">
            <div className="max-w-[1800px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Factory className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Total Orders</p>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-slate-900"
                  >
                    {totalOrders}
                  </motion.h3>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mb-1">In Progress</p>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-3xl font-bold text-slate-900"
                  >
                    {inProgressCount}
                  </motion.h3>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Completed</p>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold text-slate-900"
                  >
                    {completedCount}
                  </motion.h3>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Gauge className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Avg Quality Score</p>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-3xl font-bold text-slate-900"
                  >
                    {avgQuality > 0 ? `${avgQuality.toFixed(1)}%` : '—'}
                  </motion.h3>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Filters and Search - matches Customers pattern */}
          <div className="px-8 pb-0 shrink-0 overflow-visible relative z-20">
            <div className="max-w-[1800px] mx-auto">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg overflow-visible">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search orders, clients, or IDs..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
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
                    <RefreshCw className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                  </motion.button>
                </div>

                {/* Filters Row */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFilters > 0 && (
                      <span className="w-5 h-5 bg-orange-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilters}</span>
                    )}
                  </div>

                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  >
                    <option value="all">Status: All</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select
                    value={selectedPriority}
                    onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  >
                    <option value="all">Priority: All</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    value={selectedLine}
                    onChange={(e) => { setSelectedLine(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  >
                    <option value="all">Line: All</option>
                    {uniqueLines.map(line => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>

                  {activeFilters > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedStatus('all'); setSelectedPriority('all'); setSelectedLine('all'); setCurrentPage(1); }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </motion.button>
                  )}

                  <div className="ml-auto">
                    <ColumnVisibilityDropdown
                      columns={productionColumns}
                      visibleColumns={columnVisibility}
                      onChange={setColumnVisibility}
                      accentColor="orange"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-y-auto px-8 pt-6 pb-8">
            <div className="max-w-[1800px] mx-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-lg">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-lg">
                  <Package className="w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Production Orders Yet</h3>
                  <p className="text-sm text-slate-500 mb-4">Create your first production order to start tracking.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setEditOrder(null); setDrawerOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                    New Production Order
                  </motion.button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {isColVisible('orderId') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                              Order ID
                            </th>
                          )}
                          {isColVisible('orderName') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                              <button onClick={() => handleSort('orderName')} className="flex items-center gap-2 whitespace-nowrap hover:text-orange-600 transition-colors">
                                Order Name
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                              </button>
                            </th>
                          )}
                          {isColVisible('client') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                              <button onClick={() => handleSort('client')} className="flex items-center gap-2 whitespace-nowrap hover:text-orange-600 transition-colors">
                                Client
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                              </button>
                            </th>
                          )}
                          {isColVisible('status') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                              <button onClick={() => handleSort('status')} className="flex items-center gap-2 whitespace-nowrap hover:text-orange-600 transition-colors">
                                Status
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                              </button>
                            </th>
                          )}
                          {isColVisible('priority') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Priority
                            </th>
                          )}
                          {isColVisible('progress') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Progress
                            </th>
                          )}
                          {isColVisible('quality') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                              <button onClick={() => handleSort('quality')} className="flex items-center gap-2 whitespace-nowrap hover:text-orange-600 transition-colors">
                                Quality
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                              </button>
                            </th>
                          )}
                          {isColVisible('dueDate') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                              <button onClick={() => handleSort('dueDate')} className="flex items-center gap-2 whitespace-nowrap hover:text-orange-600 transition-colors">
                                Due Date
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                              </button>
                            </th>
                          )}
                          {isColVisible('line') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Line
                            </th>
                          )}
                          {isColVisible('actions') && (
                            <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map((order, index) => {
                          const progress = order.quantity > 0 ? (order.completed / order.quantity) * 100 : 0;
                          return (
                            <motion.tr
                              key={order.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group"
                            >
                              {isColVisible('orderId') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="font-mono text-sm font-semibold text-slate-900">{order.id}</span>
                                </td>
                              )}
                              {isColVisible('orderName') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="font-semibold text-slate-900">{order.orderName}</span>
                                </td>
                              )}
                              {isColVisible('client') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="text-sm text-slate-700">{order.client}</span>
                                </td>
                              )}
                              {isColVisible('status') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </td>
                              )}
                              {isColVisible('priority') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(order.priority)}`}>
                                    {order.priority}
                                  </span>
                                </td>
                              )}
                              {isColVisible('progress') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden min-w-[100px]">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                        className={`h-full rounded-full ${
                                          progress === 100
                                            ? 'bg-green-500'
                                            : progress >= 50
                                            ? 'bg-blue-500'
                                            : progress > 0
                                            ? 'bg-orange-500'
                                            : 'bg-slate-300'
                                        }`}
                                      />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 min-w-[70px]">
                                      {order.completed || 0}/{order.quantity || 0}
                                    </span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('quality') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  {(order.quality || 0) > 0 ? (
                                    <span className="font-semibold text-slate-900">{order.quality}%</span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                              )}
                              {isColVisible('dueDate') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-700">{order.dueDate || '—'}</span>
                                  </div>
                                </td>
                              )}
                              {isColVisible('line') && (
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="text-sm text-slate-700">{order.assignedTo || '—'}</span>
                                </td>
                              )}
                              {isColVisible('actions') && (
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-1">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setIsDetailOpen(true);
                                      }}
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                      onClick={() => {
                                        setEditOrder(order);
                                        setDrawerOpen(true);
                                      }}
                                      title="Edit Order"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      onClick={() => {
                                        setOrderToDelete(order);
                                        setDeleteModalOpen(true);
                                      }}
                                      title="Delete Order"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                  </div>
                                </td>
                              )}
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination - inside table card, matches Customers */}
                  <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Page {currentPage} of {Math.max(1, totalPages)} · Showing {sortedOrders.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, sortedOrders.length)} of {sortedOrders.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Rows per page:</span>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <div className="flex gap-1 ml-4">
                        <button
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                          disabled={currentPage >= Math.max(1, totalPages)}
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Drawer */}
      <AddProductionOrderDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditOrder(null); }}
        onSuccess={fetchOrders}
        editOrder={editOrder}
      />

      {/* Delete Modal */}
      <DeleteProductionOrderModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setOrderToDelete(undefined); }}
        orderName={orderToDelete?.orderName || ''}
        onConfirm={handleDeleteOrder}
      />
    </>
  );
}