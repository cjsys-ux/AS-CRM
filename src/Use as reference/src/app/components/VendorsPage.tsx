import { motion, AnimatePresence } from 'motion/react';
import { Building2, Search, Plus, Eye, Trash2, Loader2, AlertTriangle, ChevronDown, RefreshCw, Filter, X, Pencil } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { AddVendorDrawer } from './AddVendorDrawer';
import { VendorDetailView } from './VendorDetailView';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

interface Vendor {
  id: string;
  name: string;
  contact: string;
  logo: string;
  status: string;
  type: string;
  location: { city: string; region: string } | null;
  products: string;
  netTerms: string;
  totalSpend: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  paymentTerms?: string;
  accountType?: string;
  addresses?: any[];
  [key: string]: any;
}

const VENDOR_TYPES = ['Product Distributor', 'Apparel Distributor', 'Decorator', 'Promo Supplier', 'Product Manufacturer'];
const PAYMENT_TERMS = ['Prepaid', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', '30/70', '50/50'];

// Custom dropdown component
function FilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const allLabel = options[0]; // e.g. "All Types"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
          value !== allLabel
            ? 'bg-purple-50 border-purple-300 text-purple-700'
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
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-64 overflow-y-auto"
          >
            <div className="py-1.5">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    value === opt
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                  {value === opt && (
                    <span className="float-right text-purple-500 font-bold">&#10003;</span>
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

export function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [termsFilter, setTermsFilter] = useState('All Terms');
  const [isAddVendorDrawerOpen, setIsAddVendorDrawerOpen] = useState(false);
  const [isVendorDetailViewOpen, setIsVendorDetailViewOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column visibility
  const vendorColumns: ColumnDef[] = [
    { key: 'vendorName', label: 'Vendor Name' },
    { key: 'status', label: 'Status' },
    { key: 'type', label: 'Type' },
    { key: 'contact', label: 'Contact' },
    { key: 'location', label: 'Location' },
    { key: 'paymentTerms', label: 'Payment Terms' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    vendorColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;
  const visibleColCount = vendorColumns.filter(c => isColVisible(c.key)).length;

  // Delete state
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Fetch vendors from API ───
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vendors`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors || []);
      } else {
        console.error('Error fetching vendors:', data.error);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // ─── Delete vendor ───
  const handleDeleteVendor = async () => {
    if (!vendorToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/vendors/${vendorToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setVendors(prev => prev.filter(v => v.id !== vendorToDelete.id));
        toast.success(`${vendorToDelete.name} has been deleted`);
        // If we're in detail view, go back to list
        if (isVendorDetailViewOpen && selectedVendor?.id === vendorToDelete.id) {
          setIsVendorDetailViewOpen(false);
          setSelectedVendor(null);
        }
      } else {
        console.error('Error deleting vendor:', data.error);
        toast.error('Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Error deleting vendor');
    } finally {
      setDeleting(false);
      setVendorToDelete(null);
    }
  };

  // ─── Helpers ───
  const getVendorInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Distributor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Product Distributor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Apparel Distributor': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Product Manufacturer': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Service Provider': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Wholesale Supplier': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Decorator': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Promo Supplier': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // ─── Filtering ───
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = !searchQuery ||
      v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All Types' || v.type === typeFilter;
    const matchesTerms = termsFilter === 'All Terms' || (v.paymentTerms || v.netTerms || 'N/A') === termsFilter;
    return matchesSearch && matchesType && matchesTerms;
  });

  // ─── Pagination ───
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / rowsPerPage));
  const paginatedVendors = filteredVendors.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, typeFilter, termsFilter]);

  // ─── Stats from real data ───
  const stats = [
    { label: 'Total Vendors', value: String(vendors.length), icon: Building2, color: 'blue' },
    { label: 'Distributors', value: String(vendors.filter(v => v.type === 'Distributor').length), icon: Building2, color: 'purple' },
    { label: 'Manufacturers', value: String(vendors.filter(v => v.type === 'Product Manufacturer').length), icon: Building2, color: 'green' },
    { label: 'Active', value: String(vendors.filter(v => v.status === 'Active').length), icon: Building2, color: 'orange' },
  ];

  // ─── Active filter count ───
  const activeFilters = [typeFilter !== 'All Types', termsFilter !== 'All Terms'].filter(Boolean).length;

  return (
    <>
      {/* Vendor Detail View */}
      {isVendorDetailViewOpen && selectedVendor ? (
        <VendorDetailView
          vendor={selectedVendor}
          onBack={() => { setIsVendorDetailViewOpen(false); fetchVendors(); }}
          onDelete={() => setVendorToDelete(selectedVendor)}
          onVendorUpdated={(updatedVendor) => {
            setSelectedVendor(updatedVendor);
            setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="max-w-[1800px] mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Vendor Database</h1>
                    <p className="text-slate-500 text-sm">Manage your vendor relationships and contacts</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 text-sm font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                  onClick={() => {
                    setSelectedVendor(null);
                    setIsAddVendorDrawerOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Vendor
                </motion.button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="px-6 mt-4 mb-4 relative z-10">
            <div className="max-w-[1800px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const colorClasses: Record<string, string> = {
                    blue: 'from-blue-500 to-blue-600',
                    purple: 'from-purple-500 to-purple-600',
                    green: 'from-green-500 to-green-600',
                    orange: 'from-orange-500 to-orange-600',
                  };

                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-9 h-9 bg-gradient-to-br ${colorClasses[stat.color]} rounded-lg flex items-center justify-center shadow-md`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mb-0.5">{stat.label}</p>
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="text-xl font-bold text-slate-900"
                      >
                        {stat.value}
                      </motion.h3>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 pb-0 shrink-0 overflow-visible relative z-20">
            <div className="max-w-[1800px] mx-auto">
              {/* Search and Filters */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm overflow-visible">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search vendors by name, contact, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchVendors}
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
                    {activeFilters > 0 && (
                      <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilters}</span>
                    )}
                  </div>

                  <FilterDropdown
                    label="Type"
                    value={typeFilter}
                    options={['All Types', ...VENDOR_TYPES]}
                    onChange={setTypeFilter}
                  />

                  <FilterDropdown
                    label="Terms"
                    value={termsFilter}
                    options={['All Terms', ...PAYMENT_TERMS]}
                    onChange={setTermsFilter}
                  />

                  {activeFilters > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setTypeFilter('All Types'); setTermsFilter('All Terms'); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </motion.button>
                  )}

                  <div className="ml-auto">
                    <ColumnVisibilityDropdown
                      columns={vendorColumns}
                      visibleColumns={columnVisibility}
                      onChange={setColumnVisibility}
                      accentColor="purple"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Table Area */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
            <div className="max-w-[1800px] mx-auto">
              {/* Vendors Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">Loading vendors...</p>
                  </div>
                ) : filteredVendors.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-10 h-10 text-purple-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {vendors.length === 0 ? 'No vendors yet' : 'No vendors match your filters'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      {vendors.length === 0
                        ? 'Get started by adding your first vendor.'
                        : 'Try adjusting your search or filters.'}
                    </p>
                    {vendors.length === 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectedVendor(null); setIsAddVendorDrawerOpen(true); }}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" /> Add Your First Vendor
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {isColVisible('vendorName') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Vendor Name</th>}
                            {isColVisible('status') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>}
                            {isColVisible('type') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>}
                            {isColVisible('contact') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Contact</th>}
                            {isColVisible('location') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Location</th>}
                            {isColVisible('paymentTerms') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Payment Terms</th>}
                            {isColVisible('actions') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedVendors.map((vendor, idx) => (
                            <motion.tr
                              key={vendor.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group"
                            >
                              {isColVisible('vendorName') && <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {vendor.logo ? (
                                    <div className="w-10 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                                      <img src={vendor.logo} alt={vendor.name} className="max-w-full max-h-full object-contain p-0.5" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                      <span className="text-white text-xs font-bold">{getVendorInitials(vendor.name)}</span>
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">{vendor.name}</div>
                                    {vendor.email && <div className="text-[11px] text-slate-400">{vendor.email}</div>}
                                  </div>
                                </div>
                              </td>}
                              {isColVisible('status') && <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusColor(vendor.status)}`}>
                                  {vendor.status || 'Active'}
                                </span>
                              </td>}
                              {isColVisible('type') && <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getTypeColor(vendor.type)}`}>
                                  {vendor.type || '—'}
                                </span>
                              </td>}
                              {isColVisible('contact') && <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-slate-700">{vendor.contactName || vendor.contact || '—'}</span>
                              </td>}
                              {isColVisible('location') && <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-slate-700">
                                  {(() => {
                                    const parts = [vendor.fobCity, vendor.fobState, vendor.country].filter(Boolean);
                                    return parts.length > 0 ? parts.join(', ') : (vendor.location ? `${vendor.location.city}, ${vendor.location.region}` : '—');
                                  })()}
                                </span>
                              </td>}
                              {isColVisible('paymentTerms') && <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-slate-700">{vendor.paymentTerms || vendor.netTerms || '—'}</span>
                              </td>}
                              {isColVisible('actions') && <td className="px-4 py-3">
                                <div className="flex items-center gap-0.5">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    onClick={() => {
                                      setSelectedVendor(vendor);
                                      setIsVendorDetailViewOpen(true);
                                    }}
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    onClick={() => {
                                      setSelectedVendor(vendor);
                                      setIsAddVendorDrawerOpen(true);
                                    }}
                                    title="Quick Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    onClick={() => setVendorToDelete(vendor)}
                                    title="Delete Vendor"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>}
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages} · Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredVendors.length)} to {Math.min(currentPage * rowsPerPage, filteredVendors.length)} of {filteredVendors.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Rows per page:</span>
                        <select
                          value={rowsPerPage}
                          onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
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
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          >
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <AddVendorDrawer
            isOpen={isAddVendorDrawerOpen}
            onClose={() => setIsAddVendorDrawerOpen(false)}
            vendorData={selectedVendor}
            onSuccess={() => {
              setIsAddVendorDrawerOpen(false);
              fetchVendors();
            }}
          />
        </div>
      )}

      {/* ─── Delete Vendor Confirmation Modal ─── */}
      <AnimatePresence>
        {vendorToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setVendorToDelete(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[60] overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Vendor</h3>
                <p className="text-slate-600 mb-1">
                  Are you sure you want to permanently delete
                </p>
                <p className="font-bold text-slate-900 text-lg mb-2">{vendorToDelete.name}?</p>
                <p className="text-sm text-slate-400 mb-6">
                  This will remove the vendor and all associated data. This action cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setVendorToDelete(null)}
                    disabled={deleting}
                    className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteVendor}
                    disabled={deleting}
                    className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                    ) : (
                      <><Trash2 className="w-4 h-4" /> Delete Vendor</>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}