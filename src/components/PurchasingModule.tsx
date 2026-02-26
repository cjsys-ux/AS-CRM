import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Search, Plus, Eye, Edit, Trash2, DollarSign, Package, Clock, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, Calendar, User, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DeletePurchaseOrderModal } from './DeletePurchaseOrderModal';
import { EditPurchaseOrderDrawer } from './EditPurchaseOrderDrawer';
import { PurchaseOrderDetailView } from './PurchaseOrderDetailView';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

type PurchaseOrder = {
  id: string;
  poNumber: string;
  poDate: string;
  project: string;
  vendor: string;
  customer: string;
  status: string;
  shipDate: string | null;
  inHandsDate: string;
  total: number;
  priority: string;
  contact: string;
};

export function PurchasingModule() {
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

  // Fetch purchase orders from database
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/purchase-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPurchaseOrders(data.orders || []);
      } else {
        console.error('Error fetching purchase orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

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
  const totalSpend = purchaseOrders.reduce((sum, order) => sum + order.total, 0);
  const createdOrders = purchaseOrders.filter(order => order.status === 'Created' || order.status === 'Submitted').length;
  const approvedOrders = purchaseOrders.filter(order => order.status === 'Confirmed' || order.status === 'In Production').length;
  const deliveredOrders = purchaseOrders.filter(order => order.status === 'Delivered').length;

  // Pagination logic
  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || order.status === statusFilter;
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
    
    try {
      const response = await fetch(`${API_URL}/purchase-orders/${orderToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        await fetchPurchaseOrders();
        setDeleteModalOpen(false);
        setOrderToDelete(null);
      } else {
        console.error('Error deleting purchase order:', data.error);
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
    }
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setOrderToEdit(order);
    setEditDrawerOpen(true);
  };

  const handleSaveOrder = async (updatedOrder: PurchaseOrder) => {
    try {
      const response = await fetch(`${API_URL}/purchase-orders/${updatedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(updatedOrder),
      });
      const data = await response.json();
      if (data.success) {
        await fetchPurchaseOrders();
        setEditDrawerOpen(false);
        setOrderToEdit(null);
      } else {
        console.error('Error updating purchase order:', data.error);
      }
    } catch (error) {
      console.error('Error updating purchase order:', error);
    }
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  // Handle status change from detail view
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/purchase-orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setPurchaseOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error('Error updating status:', data.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // If viewing a specific PO, show detail view
  const selectedOrder = selectedOrderId 
    ? purchaseOrders.find(o => o.id === selectedOrderId)
    : null;

  if (selectedOrderId && selectedOrder) {
    return (
      <PurchaseOrderDetailView 
        order={selectedOrder}
        onBack={() => setSelectedOrderId(null)}
        onEdit={() => handleEditOrder(selectedOrder)}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-[1800px] mx-auto px-4 md:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
              >
                <ShoppingCart className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Purchasing</h1>
                <p className="text-blue-50">Manage purchase orders and vendor pricing</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Purchase Order
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 -mt-6 mb-6 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Total Spend</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-3xl font-bold text-slate-900"
              >
                ${totalSpend.toFixed(2)}
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
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Pending</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-slate-900"
              >
                {createdOrders}
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
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Approved</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-3xl font-bold text-slate-900"
              >
                {approvedOrders}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Delivered</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-slate-900"
              >
                {deliveredOrders}
              </motion.h3>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by PO number, vendor, or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              >
                <option>All Status</option>
                <option>Created</option>
                <option>Submitted</option>
                <option>Confirmed</option>
                <option>In Production</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Issue</option>
              </select>

              {/* Vendor Filter */}
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              >
                <option>All Vendors</option>
                <option>TEST</option>
                <option>SC Promo</option>
                <option>Ergodyne</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              >
                <option>All Priority</option>
                <option>1st Choice</option>
                <option>2nd Choice</option>
                <option>3rd Choice</option>
                <option>Backup</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        <div className="max-w-[1800px] mx-auto h-full">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[1400px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b-2 border-slate-200">
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      PO Date
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      PO Number
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Project
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Vendor
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Customer
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Ship Date
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      In-Hands Date
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Total
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <AnimatePresence mode="popLayout">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-8 py-20">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center text-center"
                          >
                            <motion.div
                              animate={{ 
                                y: [0, -10, 0],
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut" 
                              }}
                              className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                            >
                              <ShoppingCart className="w-12 h-12 text-slate-400" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Purchase Orders Yet</h3>
                            <p className="text-slate-500 mb-6 max-w-md">
                              Get started by creating your first purchase order to manage vendor pricing and track orders.
                            </p>
                          </motion.div>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-slate-100 group hover:bg-slate-50"
                        >
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-slate-700">{order.poDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-900">{order.poNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{order.project}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="text-sm text-slate-700">{order.vendor}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm text-slate-700">{order.customer}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{order.shipDate || '—'}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700">{order.inHandsDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-bold text-green-600">${order.total.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(219 234 254)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewOrder(order.id)}
                                className="p-1.5 hover:bg-blue-50 rounded-md transition-colors group/btn border-2 border-transparent hover:border-blue-200"
                                title="View"
                              >
                                <Eye className="w-4 h-4 text-slate-400 group-hover/btn:text-blue-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(243 244 246)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditOrder(order)}
                                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors group/btn border-2 border-transparent hover:border-slate-200"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-slate-400 group-hover/btn:text-slate-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 226 226)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setOrderToDelete(order);
                                  setDeleteModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-red-50 rounded-md transition-colors group/btn border-2 border-transparent hover:border-red-200"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 group-hover/btn:text-red-600" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-8 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-700">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-slate-600 font-medium">
                  Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to <span className="font-bold text-slate-900">{Math.min(endIndex, filteredOrders.length)}</span> of <span className="font-bold text-slate-900">{filteredOrders.length}</span> orders
                </span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-bold hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
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