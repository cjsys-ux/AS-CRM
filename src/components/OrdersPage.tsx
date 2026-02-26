import { motion } from 'motion/react';
import { ShoppingCart, Plus, Search, Filter, Download, Eye, Edit2, Trash2, Package, Truck, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

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
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Shipped':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Processing':
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

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/orders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
        } else {
          console.error('Error fetching orders:', data.error);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Calculate statistics from real data
  const totalOrders = orders.length;
  const processingOrders = orders.filter(o => o.status === 'Processing').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-8 shadow-lg">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
              >
                <ShoppingCart className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Orders</h1>
                <p className="text-blue-50">Manage and track customer orders from placement to delivery</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Order
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 -mt-6 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingCart, color: 'from-blue-500 to-blue-600' },
              { label: 'Processing', value: processingOrders.toString(), icon: Package, color: 'from-purple-500 to-purple-600' },
              { label: 'Shipped', value: shippedOrders.toString(), icon: Truck, color: 'from-cyan-500 to-cyan-600' },
              { label: 'Delivered', value: deliveredOrders.toString(), icon: CheckCircle, color: 'from-green-500 to-green-600' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-8 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders, customers, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition-all"
              >
                <Filter className="w-4 h-4" />
                Filter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 px-8 pb-8 overflow-auto">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Shipping
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-slate-600 font-medium">Loading orders...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingCart className="w-10 h-10 text-slate-400" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
                          <p className="text-slate-500 mb-4">Start by creating your first order</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-600 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                            Create Order
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold text-slate-900">{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{order.customer}</p>
                            <p className="text-sm text-slate-500">{order.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700 font-medium">{order.items} items</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700">{order.shipping}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700">{order.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">{order.total}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
          </div>
        </div>
      </div>
    </div>
  );
}