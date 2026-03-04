import { motion } from 'motion/react';
import { Building2, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AddVendorDrawer } from './AddVendorDrawer';
import { VendorDetailView } from './VendorDetailView';

export function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [productFilter, setProductFilter] = useState('All Products');
  const [termsFilter, setTermsFilter] = useState('All Terms');
  const [isAddVendorDrawerOpen, setIsAddVendorDrawerOpen] = useState(false);
  const [isVendorDetailViewOpen, setIsVendorDetailViewOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Helper function to get initials from vendor name
  const getVendorInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return words.map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  const vendors = [
    {
      id: '1',
      name: 'Ergodyne',
      contact: 'Website',
      logo: '',
      status: 'Active',
      type: 'Distributor',
      location: null,
      products: 'No products',
      netTerms: 'N/A',
      totalSpend: 'N/A',
    },
    {
      id: '2',
      name: 'SC Promo',
      contact: 'Robbin Chan',
      logo: '',
      status: 'Active',
      type: 'Product Manufacturer',
      location: { city: 'China', region: 'Yiwu' },
      products: 'Custom Products',
      netTerms: 'N/A',
      totalSpend: 'N/A',
    },
    {
      id: '3',
      name: 'TEST',
      contact: 'Test',
      logo: '',
      status: 'Active',
      type: 'Distributor',
      location: null,
      products: 'No products',
      netTerms: 'N/A',
      totalSpend: 'N/A',
    },
  ];

  const stats = [
    { label: 'Total Vendors', value: '3', icon: Building2, color: 'blue' },
    { label: 'Distributors', value: '2', icon: Building2, color: 'purple' },
    { label: 'Manufacturers', value: '1', icon: Building2, color: 'green' },
    { label: 'Decorators', value: '0', icon: Building2, color: 'orange' },
  ];

  return (
    <>
      {/* Vendor Detail View - Full Screen */}
      {isVendorDetailViewOpen && selectedVendor ? (
        <VendorDetailView 
          vendor={selectedVendor}
          onBack={() => setIsVendorDetailViewOpen(false)}
          onEdit={() => {
            setIsVendorDetailViewOpen(false);
            setIsAddVendorDrawerOpen(true);
          }}
          onDelete={() => {
            setIsVendorDetailViewOpen(false);
            // Show delete modal here
          }}
        />
      ) : (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Section */}
      {/* ui-qa-fixer: UI-2026-015 - responsive padding + flex-wrap for mobile header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 px-4 md:px-8 py-8 shadow-lg">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Building2 className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Vendor Database</h1>
                <p className="text-purple-50">Manage your vendor relationships and contacts</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all"
              onClick={() => {
                setSelectedVendor(null);
                setIsAddVendorDrawerOpen(true);
              }}
            >
              <Plus className="w-5 h-5" />
              Add Vendor
            </motion.button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {/* ui-qa-fixer: UI-2026-015 - responsive padding */}
      <div className="px-4 md:px-8 -mt-6 mb-6 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
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
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mb-1">{stat.label}</p>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="text-3xl font-bold text-slate-900"
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
      {/* ui-qa-fixer: UI-2026-015 - responsive padding */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                >
                  <option>All Types</option>
                  <option>Distributor</option>
                  <option>Product Manufacturer</option>
                  <option>Decorator</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Product:</span>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                >
                  <option>All Products</option>
                  <option>Custom Products</option>
                  <option>No Products</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Terms:</span>
                <select
                  value={termsFilter}
                  onChange={(e) => setTermsFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                >
                  <option>All Terms</option>
                  <option>Net 30</option>
                  <option>Net 60</option>
                  <option>N/A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vendors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Vendor Name</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Location</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Products</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Net Terms</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Total Spend</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {vendor.logo ? (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                              <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-white text-sm font-bold">
                                {getVendorInitials(vendor.name)}
                              </span>
                            </div>
                          )}
                          <div className="font-semibold text-slate-900">{vendor.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          {vendor.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vendor.location ? (
                          <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{vendor.location.city}, {vendor.location.region}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{vendor.products}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{vendor.netTerms}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{vendor.totalSpend}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setIsVendorDetailViewOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setIsAddVendorDrawerOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page 1 of 1 · Showing 1 to 3 of 3
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Rows per page:</span>
                <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <div className="flex gap-1 ml-4">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" disabled>
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" disabled>
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
      <AddVendorDrawer 
        isOpen={isAddVendorDrawerOpen} 
        onClose={() => setIsAddVendorDrawerOpen(false)}
        vendorData={selectedVendor}
        onSuccess={() => {
          // Refresh vendors list in the future
          setIsAddVendorDrawerOpen(false);
        }}
      />
    </div>
      )}
    </>
  );
}