import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Search, Filter, Download, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Building2, DollarSign, TrendingUp, UserCheck, ArrowUpDown, ExternalLink, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddCustomerDrawer } from './AddCustomerDrawer';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { CustomerDetailView } from './CustomerDetailView';
import { toast } from 'sonner';


interface Customer {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  status: string;
  resaleCert: string;
  website: string;
  phone?: string;
  paymentTerms?: string;
  spend: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Inactive':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddCustomerDrawerOpen, setIsAddCustomerDrawerOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/customers/list');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCustomers(data.customers ?? []);
    } catch {
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      const res = await fetch('/api/customers/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customerToDelete.id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    } finally {
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    const matchesIndustry = selectedIndustry === 'all' || customer.industry === selectedIndustry;
    const matchesSize = selectedSize === 'all' || customer.size === selectedSize;
    return matchesSearch && matchesStatus && matchesIndustry && matchesSize;
  });

  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

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

  // Calculate KPIs
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const totalSpend = customers.reduce((sum, c) => sum + (c.spend ?? 0), 0);
  /* ui-qa-fixer: UI-2026-001 - guard divide-by-zero producing NaN when customers array is empty */
  const avgSpend = customers.length > 0 ? totalSpend / customers.length : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Section */}
      {/* ui-qa-fixer: UI-2026-009 - responsive padding prevents content overflow on mobile */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-4 md:px-8 py-8 shadow-lg">
        <div className="max-w-[1800px] mx-auto">
          {/* ui-qa-fixer: UI-2026-009 - flex-wrap prevents button overflow at 375px */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Customers</h1>
                <p className="text-blue-50">Manage and track customer relationships</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/20 transition-all"
              onClick={() => setIsAddCustomerDrawerOpen(true)}
            >
              <Plus className="w-5 h-5" />
              New Customer
            </motion.button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {/* ui-qa-fixer: UI-2026-009 - responsive padding */}
      <div className="px-4 md:px-8 -mt-6 mb-6 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold"
                >
                  YTD
                </motion.div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Spend</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-slate-900"
              >
                ${(totalSpend / 1000).toFixed(0)}K
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold"
                >
                  +15%
                </motion.div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Customers</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold text-slate-900"
              >
                {totalCustomers}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"
                >
                  Active
                </motion.div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Active Customers</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold text-slate-900"
              >
                {activeCustomers}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold"
                >
                  Avg
                </motion.div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Avg Spend/Customer</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-4xl font-bold text-slate-900"
              >
                ${(avgSpend / 1000).toFixed(0)}K
              </motion.h3>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      {/* ui-qa-fixer: UI-2026-009 - responsive padding */}
      <div className="px-4 md:px-8 py-6 bg-slate-50/50 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            >
              <option value="all">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            >
              <option value="all">Industry: All</option>
              <option value="Technology">Technology</option>
              <option value="Accounting">Accounting</option>
              <option value="Retail">Retail</option>
              <option value="Healthcare">Healthcare</option>
            </select>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            >
              <option value="all">Size: All</option>
              <option value="1-100 (Small)">1-100 (Small)</option>
              <option value="100-500 (Medium)">100-500 (Medium)</option>
              <option value="500+ (Enterprise)">500+ (Enterprise)</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </motion.button>
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      {/* ui-qa-fixer: UI-2026-009 - responsive padding */}
      <div className="flex-1 px-4 md:px-8 pb-8 overflow-hidden">
        <div className="max-w-[1800px] mx-auto h-full">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[1400px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b-2 border-slate-200">
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 tracking-wider whitespace-nowrap">
                      Logo
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                      >
                        Customer
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('industry')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                      >
                        Industry
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 tracking-wider whitespace-nowrap">
                      Size
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                      >
                        Status
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 tracking-wider whitespace-nowrap">
                      Resale Cert
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 tracking-wider whitespace-nowrap">
                      Website
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('spend')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                      >
                        Spend
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-slate-700 tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <AnimatePresence mode="popLayout">
                    {paginatedCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-100 group"
                      >
                        <td className="px-6 py-5">
                          {customer.logo ? (
                            <div className="h-12 w-20 rounded-xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center overflow-hidden p-1">
                              <motion.img
                                whileHover={{ scale: 1.05 }}
                                src={customer.logo}
                                alt={customer.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          ) : (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="h-12 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-slate-200 shadow-md"
                            >
                              <span className="text-white text-lg font-bold">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </motion.div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <p className="text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{customer.name}</p>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{customer.industry}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{customer.size}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{customer.resaleCert}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {customer.website !== '—' ? (
                            <a
                              href={`https://${customer.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {customer.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-sm text-slate-700">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm text-slate-900 font-medium">${(customer.spend ?? 0).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.15, backgroundColor: 'rgb(219 234 254)' }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-blue-200"
                              onClick={() => setViewingCustomerId(customer.id)}
                            >
                              <Eye className="w-5 h-5 text-slate-400 group-hover/btn:text-blue-600" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 249 195)' }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2.5 hover:bg-yellow-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-yellow-200"
                              onClick={() => {
                                setCustomerToEdit(customer);
                                setIsAddCustomerDrawerOpen(true);
                              }}
                            >
                              <Edit className="w-5 h-5 text-slate-400 group-hover/btn:text-yellow-600" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 226 226)' }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-red-200"
                              onClick={() => {
                                setCustomerToDelete(customer);
                                setDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-5 h-5 text-slate-400 group-hover/btn:text-red-600" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
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
                  Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span> • Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to <span className="font-bold text-slate-900">{Math.min(endIndex, filteredCustomers.length)}</span> of <span className="font-bold text-slate-900">{filteredCustomers.length}</span>
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Drawer */}
      <AddCustomerDrawer
        isOpen={isAddCustomerDrawerOpen}
        onClose={() => {
          setIsAddCustomerDrawerOpen(false);
          setCustomerToEdit(null);
        }}
        customerData={customerToEdit}
        onSuccess={fetchCustomers}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleDeleteCustomer}
        userName={customerToDelete?.name || ''}
      />

      {/* Customer Detail View */}
      {viewingCustomerId && (
        <div className="fixed inset-0 z-50 bg-white">
          <CustomerDetailView
            customerId={viewingCustomerId}
            onBack={() => setViewingCustomerId(null)}
            onEdit={() => {
              const customer = customers.find(c => c.id === viewingCustomerId);
              if (customer) {
                setCustomerToEdit(customer);
                setIsAddCustomerDrawerOpen(true);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}