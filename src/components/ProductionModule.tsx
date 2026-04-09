import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import {
  Factory, Plus, Search, Filter, Download, Play, CheckCircle, Clock,
  Eye, Edit2, Trash2, ArrowUpDown, ChevronDown, X, RefreshCw,
  AlertTriangle, Loader2, Package, Gauge
} from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedProductionGanttView } from './EnhancedProductionGanttView';
import { DeleteProductionOrderModal } from './DeleteProductionOrderModal';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';
import { DatePicker } from './DatePicker';
import { QuantityStepper } from './QuantityStepper';

// ── Types ──────────────────────────────────────────────────────────────

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

type SortField = 'orderName' | 'client' | 'status' | 'quality' | 'dueDate';
type SortDir = 'asc' | 'desc';

// ── Helpers ────────────────────────────────────────────────────────────

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

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Quality Check', 'Completed', 'On Hold', 'Cancelled'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
const LINE_OPTIONS = ['Line A', 'Line B', 'Line C', 'Line D'];

// ── Add Production Order Drawer ────────────────────────────────────────

interface AddDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  editOrder?: ProductionOrder | null;
}

function AddProductionOrderDrawer({ isOpen, onClose, onCreated, editOrder }: AddDrawerProps) {
  const isEdit = !!editOrder;

  const [form, setForm] = useState({
    orderName: '',
    client: '',
    status: 'Pending',
    priority: 'Medium',
    quantity: 100,
    completed: 0,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    assignedTo: 'Line A',
    quality: 0,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editOrder) {
      setForm({
        orderName: editOrder.orderName,
        client: editOrder.client,
        status: editOrder.status,
        priority: editOrder.priority,
        quantity: editOrder.quantity,
        completed: editOrder.completed,
        startDate: editOrder.startDate,
        dueDate: editOrder.dueDate,
        assignedTo: editOrder.assignedTo,
        quality: editOrder.quality,
      });
    } else {
      setForm({
        orderName: '',
        client: '',
        status: 'Pending',
        priority: 'Medium',
        quantity: 100,
        completed: 0,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        assignedTo: 'Line A',
        quality: 0,
      });
    }
  }, [editOrder, isOpen]);

  const handleSubmit = async () => {
    if (!form.orderName.trim() || !form.client.trim()) {
      toast.error('Order name and client are required');
      return;
    }
    if (!form.dueDate) {
      toast.error('Due date is required');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && editOrder) {
        const res = await fetch('/api/production/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editOrder.id, ...form }),
        });
        const data = await res.json();
        if (!data.success) throw new Error('Update failed');
        toast.success('Production order updated');
      } else {
        const res = await fetch('/api/production/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!data.success) throw new Error('Create failed');
        toast.success('Production order created');
      }
      onCreated();
      onClose();
    } catch (err) {
      toast.error(isEdit ? 'Failed to update order' : 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Factory className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isEdit ? 'Edit Production Order' : 'New Production Order'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {isEdit ? 'Update order details' : 'Fill in the order details below'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Order Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  Order Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Order Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.orderName}
                      onChange={(e) => updateField('orderName', e.target.value)}
                      placeholder="e.g. Batch #1042"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Client <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.client}
                      onChange={(e) => updateField('client', e.target.value)}
                      placeholder="Client name"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => updateField('status', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                      <select
                        value={form.priority}
                        onChange={(e) => updateField('priority', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Assigned Line
                    </label>
                    <select
                      value={form.assignedTo}
                      onChange={(e) => updateField('assignedTo', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      {LINE_OPTIONS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Quantity & Quality Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  Quantity & Quality
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Target Quantity
                      </label>
                      <QuantityStepper
                        value={form.quantity}
                        onChange={(v) => updateField('quantity', v)}
                        min={1}
                        max={100000}
                        step={10}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Completed
                      </label>
                      <QuantityStepper
                        value={form.completed}
                        onChange={(v) => updateField('completed', v)}
                        min={0}
                        max={form.quantity}
                        step={10}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quality Score (%)
                    </label>
                    <input
                      type="number"
                      value={form.quality}
                      onChange={(e) => updateField('quality', Math.min(100, Math.max(0, Number(e.target.value))))}
                      min={0}
                      max={100}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  Schedule
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <DatePicker
                      value={form.startDate}
                      onChange={(v) => updateField('startDate', v)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      value={form.dueDate}
                      onChange={(v) => updateField('dueDate', v)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isEdit ? 'Update Order' : 'Create Order'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Column definitions ─────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: 'id', label: 'Order ID', defaultVisible: true },
  { key: 'orderName', label: 'Order Name', defaultVisible: true },
  { key: 'client', label: 'Client', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'priority', label: 'Priority', defaultVisible: true },
  { key: 'progress', label: 'Progress', defaultVisible: true },
  { key: 'quality', label: 'Quality', defaultVisible: true },
  { key: 'dueDate', label: 'Due Date', defaultVisible: true },
  { key: 'assignedTo', label: 'Line', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

// ── Main Component ─────────────────────────────────────────────────────

export function ProductionModule() {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<ProductionOrder | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<ProductionOrder | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterLine, setFilterLine] = useState('');

  // Sort
  const [sortField, setSortField] = useState<SortField | ''>('');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    COLUMNS.forEach((c) => { init[c.key] = c.defaultVisible; });
    return init;
  });

  // ── Fetch orders ────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/production/list');
      const data = await res.json();
      if (data.success) {
        setProductionOrders(data.orders ?? []);
      } else {
        toast.error('Failed to load production orders');
      }
    } catch {
      toast.error('Network error loading production orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Delete handler ──────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!orderToDelete) return;
    try {
      const res = await fetch('/api/production/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderToDelete.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order deleted');
        fetchOrders();
      } else {
        toast.error('Failed to delete order');
      }
    } catch {
      toast.error('Network error deleting order');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  // ── Filtering ───────────────────────────────────────────────────────

  const filteredOrders = productionOrders
    .filter((order) => {
      const matchesSearch =
        order.orderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || order.status === filterStatus;
      const matchesPriority = !filterPriority || order.priority === filterPriority;
      const matchesLine = !filterLine || order.assignedTo === filterLine;
      return matchesSearch && matchesStatus && matchesPriority && matchesLine;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const hasActiveFilters = !!filterStatus || !!filterPriority || !!filterLine;

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setFilterLine('');
  };

  // ── KPI stats ───────────────────────────────────────────────────────

  const inProgressCount = productionOrders.filter((o) => o.status === 'In Progress').length;
  const completedCount = productionOrders.filter((o) => o.status === 'Completed').length;
  const qualityOrders = productionOrders.filter((o) => o.quality > 0);
  const avgQuality =
    qualityOrders.length > 0
      ? qualityOrders.reduce((sum, o) => sum + o.quality, 0) / qualityOrders.length
      : 0;

  const isColVisible = (key: string) => visibleColumns[key] !== false;

  // ── Sortable header helper ──────────────────────────────────────────

  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      onClick={() => toggleSort(field)}
      className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-slate-100 transition-colors"
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-orange-500' : 'text-slate-400'}`} />
      </span>
    </th>
  );

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col">
      {!isDetailOpen ? (
        <>
          {/* Header Section — flat white style */}
          <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-6">
            <div className="max-w-[1800px] mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center"
                  >
                    <Factory className="w-7 h-7 text-orange-600" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-0.5">Production Management</h1>
                    <p className="text-sm text-slate-500">Monitor and manage production orders and quality control</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setEditOrder(null);
                      setDrawerOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Production Order
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards — smaller with hover lift */}
          <div className="px-4 md:px-8 mt-6 mb-6">
            <div className="max-w-[1800px] mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Total Orders</p>
                      <h3 className="text-xl font-bold text-slate-900">{productionOrders.length}</h3>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">In Progress</p>
                      <h3 className="text-xl font-bold text-slate-900">{inProgressCount}</h3>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Completed</p>
                      <h3 className="text-xl font-bold text-slate-900">{completedCount}</h3>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Avg Quality</p>
                      <h3 className="text-xl font-bold text-slate-900">{avgQuality.toFixed(1)}%</h3>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="px-4 md:px-8 mb-6">
            <div className="max-w-[1800px] mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search orders, clients, or IDs..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>

                  {/* Status filter */}
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                      className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      <option value="">All Status</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Priority filter */}
                  <div className="relative">
                    <select
                      value={filterPriority}
                      onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                      className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      <option value="">All Priority</option>
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Line filter */}
                  <div className="relative">
                    <select
                      value={filterLine}
                      onChange={(e) => { setFilterLine(e.target.value); setCurrentPage(1); }}
                      className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      <option value="">All Lines</option>
                      {LINE_OPTIONS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}

                  {/* Column visibility */}
                  <ColumnVisibilityDropdown
                    columns={COLUMNS}
                    visibleColumns={visibleColumns}
                    onChange={setVisibleColumns}
                  />

                  {/* Export */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Production Table */}
          <div className="flex-1 px-4 md:px-8 pb-8 overflow-auto">
            <div className="max-w-[1800px] mx-auto">
              {loading ? (
                /* Loading state */
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                  <p className="text-sm font-medium text-slate-500">Loading production orders...</p>
                </div>
              ) : productionOrders.length === 0 && !searchTerm && !hasActiveFilters ? (
                /* Empty state */
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No Production Orders Yet</h3>
                  <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
                    Create your first production order to start tracking manufacturing progress and quality.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setEditOrder(null);
                      setDrawerOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Production Order
                  </motion.button>
                </div>
              ) : (
                /* Table */
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {isColVisible('id') && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                              Order ID
                            </th>
                          )}
                          {isColVisible('orderName') && <SortableHeader field="orderName" label="Order Name" />}
                          {isColVisible('client') && <SortableHeader field="client" label="Client" />}
                          {isColVisible('status') && <SortableHeader field="status" label="Status" />}
                          {isColVisible('priority') && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                              Priority
                            </th>
                          )}
                          {isColVisible('progress') && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                              Progress
                            </th>
                          )}
                          {isColVisible('quality') && <SortableHeader field="quality" label="Quality" />}
                          {isColVisible('dueDate') && <SortableHeader field="dueDate" label="Due Date" />}
                          {isColVisible('assignedTo') && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                              Line
                            </th>
                          )}
                          {isColVisible('actions') && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center">
                                <AlertTriangle className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-sm font-medium text-slate-500">No orders match your filters</p>
                                <button
                                  onClick={clearFilters}
                                  className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
                                >
                                  Clear all filters
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedOrders.map((order, index) => {
                            const progress = order.quantity > 0 ? (order.completed / order.quantity) * 100 : 0;
                            return (
                              <motion.tr
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                              >
                                {isColVisible('id') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-sm font-semibold text-slate-900">
                                      {order.id.slice(-8).toUpperCase()}
                                    </span>
                                  </td>
                                )}
                                {isColVisible('orderName') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="font-semibold text-slate-900">{order.orderName}</p>
                                  </td>
                                )}
                                {isColVisible('client') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-slate-700">{order.client}</span>
                                  </td>
                                )}
                                {isColVisible('status') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                )}
                                {isColVisible('priority') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(order.priority)}`}
                                    >
                                      {order.priority}
                                    </span>
                                  </td>
                                )}
                                {isColVisible('progress') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden min-w-[100px]">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${progress}%` }}
                                          transition={{ duration: 1, delay: index * 0.05 }}
                                          className={`h-full ${
                                            progress === 100
                                              ? 'bg-green-500'
                                              : progress >= 50
                                              ? 'bg-blue-500'
                                              : 'bg-orange-500'
                                          }`}
                                        />
                                      </div>
                                      <span className="text-sm font-semibold text-slate-700 min-w-[60px]">
                                        {order.completed}/{order.quantity}
                                      </span>
                                    </div>
                                  </td>
                                )}
                                {isColVisible('quality') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {order.quality > 0 ? (
                                      <span className="font-semibold text-slate-900">{order.quality}%</span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                )}
                                {isColVisible('dueDate') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-slate-400" />
                                      <span className="text-slate-700">{order.dueDate}</span>
                                    </div>
                                  </td>
                                )}
                                {isColVisible('assignedTo') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-slate-700">{order.assignedTo}</span>
                                  </td>
                                )}
                                {isColVisible('actions') && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                          setSelectedOrder(order);
                                          setIsDetailOpen(true);
                                        }}
                                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
                                        title="View"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                          setEditOrder(order);
                                          setDrawerOpen(true);
                                        }}
                                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
                                        title="Edit"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                          setOrderToDelete(order);
                                          setDeleteModalOpen(true);
                                        }}
                                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </motion.button>
                                    </div>
                                  </td>
                                )}
                              </motion.tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="border-t border-slate-200 px-6 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-slate-600">Rows:</label>
                        <select
                          value={rowsPerPage}
                          onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-slate-500">
                          {filteredOrders.length > 0
                            ? `${startIndex + 1}-${Math.min(endIndex, filteredOrders.length)} of ${filteredOrders.length}`
                            : '0 orders'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Previous
                        </button>
                        <span className="text-sm font-medium text-slate-600">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Production Order Detail View */
        selectedOrder && (
          <EnhancedProductionGanttView
            order={selectedOrder}
            onClose={() => setIsDetailOpen(false)}
          />
        )
      )}

      {/* Add/Edit Drawer */}
      <AddProductionOrderDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditOrder(null);
        }}
        onCreated={fetchOrders}
        editOrder={editOrder}
      />

      {/* Delete Production Order Modal */}
      <DeleteProductionOrderModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        orderName={orderToDelete?.orderName || ''}
        onConfirm={handleDelete}
      />
    </div>
  );
}
