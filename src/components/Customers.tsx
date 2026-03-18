import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Search, Filter, Download, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Building2, DollarSign, TrendingUp, UserCheck, ArrowUpDown, ExternalLink, ChevronDown, X, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddCustomerDrawer } from './AddCustomerDrawer';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { CustomerDetailView } from './CustomerDetailView';
import { toast } from 'sonner@2.0.3';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';

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

  // Column visibility
  const customerColumns: ColumnDef[] = [
    { key: 'logo', label: 'Logo' },
    { key: 'customer', label: 'Customer' },
    { key: 'industry', label: 'Industry' },
    { key: 'size', label: 'Size' },
    { key: 'status', label: 'Status' },
    { key: 'resaleCert', label: 'Resale Cert' },
    { key: 'website', label: 'Website' },
    { key: 'spend', label: 'Spend' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    customerColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;
  const visibleColCount = customerColumns.filter(c => isColVisible(c.key)).length;

  const fetchCustomers = async () => {
    setIsLoading(true);
    setCustomers([]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setCustomers(prev => prev.filter(item => item.id !== customerToDelete.id));
    toast.success('Customer deleted successfully');
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
  const totalSpend = customers.reduce((sum, c) => sum + c.spend, 0);
  const avgSpend = totalSpend / customers.length;

  const activeFilters = (selectedStatus !== 'all' ? 1 : 0) + (selectedIndustry !== 'all' ? 1 : 0) + (selectedSize !== 'all' ? 1 : 0);

  return (
    <>
      {viewingCustomerId ? (
        <CustomerDetailView
          customerId={viewingCustomerId}
          onBack={() => setViewingCustomerId(null)}
          onCustomerUpdated={(updatedCustomer) => {
            fetchCustomers();
          }}
        />
      ) : (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Customers</h1>
                <p className="text-slate-500">Manage and track customer relationships</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
              onClick={() => setIsAddCustomerDrawerOpen(true)}
            >
              <Plus className="w-5 h-5" />
              New Customer
            </motion.button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
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
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Total Spend</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-slate-900"
              >
                ${(totalSpend / 1000).toFixed(0)}K
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Total Customers</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-3xl font-bold text-slate-900"
              >
                {totalCustomers}
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
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Active Customers</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-slate-900"
              >
                {activeCustomers}
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
              <p className="text-xs font-medium text-slate-600 mb-1">Avg Spend/Customer</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-3xl font-bold text-slate-900"
              >
                ${(avgSpend / 1000).toFixed(0)}K
              </motion.h3>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-8 pb-0 shrink-0 overflow-visible relative z-20">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg overflow-visible">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, industry, or ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchCustomers}
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
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilters}</span>
                )}
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">Status: All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select
                value={selectedIndustry}
                onChange={(e) => { setSelectedIndustry(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">Industry: All</option>
                <option value="Technology">Technology</option>
                <option value="Accounting">Accounting</option>
                <option value="Retail">Retail</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-commerce">E-commerce</option>
              </select>

              <select
                value={selectedSize}
                onChange={(e) => { setSelectedSize(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">Size: All</option>
                <option value="1-100 (Small)">1-100 (Small)</option>
                <option value="100-500 (Medium)">100-500 (Medium)</option>
                <option value="500+ (Enterprise)">500+ (Enterprise)</option>
              </select>

              {activeFilters > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedStatus('all'); setSelectedIndustry('all'); setSelectedSize('all'); setCurrentPage(1); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}

              <div className="ml-auto">
                <ColumnVisibilityDropdown
                  columns={customerColumns}
                  visibleColumns={columnVisibility}
                  onChange={setColumnVisibility}
                  accentColor="blue"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-y-auto px-8 pt-6 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {isColVisible('logo') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Logo
                      </th>
                    )}
                    {isColVisible('customer') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                        >
                          Customer
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {isColVisible('industry') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('industry')}
                          className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                        >
                          Industry
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {isColVisible('size') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Size
                      </th>
                    )}
                    {isColVisible('status') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                        >
                          Status
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {isColVisible('resaleCert') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Resale Cert
                      </th>
                    )}
                    {isColVisible('website') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Website
                      </th>
                    )}
                    {isColVisible('spend') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('spend')}
                          className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                        >
                          Spend
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
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
                  {paginatedCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group"
                    >
                      {isColVisible('logo') && (
                        <td className="px-4 py-4">
                          {customer.logo ? (
                            <div className="w-14 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                              <img src={customer.logo} alt={customer.name} className="max-w-full max-h-full object-contain p-0.5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                              <span className="text-white text-sm font-bold">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </td>
                      )}
                      {isColVisible('customer') && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{customer.name}</span>
                        </td>
                      )}
                      {isColVisible('industry') && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{customer.industry}</span>
                        </td>
                      )}
                      {isColVisible('size') && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{customer.size}</span>
                        </td>
                      )}
                      {isColVisible('status') && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                        </td>
                      )}
                      {isColVisible('resaleCert') && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{customer.resaleCert}</span>
                        </td>
                      )}
                      {isColVisible('website') && (
                        <td className="px-4 py-4 whitespace-nowrap">
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
                      )}
                      {isColVisible('spend') && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900 font-medium">${customer.spend.toLocaleString()}</span>
                        </td>
                      )}
                      {isColVisible('actions') && (
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              onClick={() => setViewingCustomerId(customer.id)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              onClick={() => {
                                setCustomerToEdit(customer);
                                setIsAddCustomerDrawerOpen(true);
                              }}
                              title="Quick Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              onClick={() => {
                                setCustomerToDelete(customer);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete Customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - inside table card */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {Math.max(1, totalPages)} · Showing {filteredCustomers.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
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
    </div>
      )}
    </>
  );
}