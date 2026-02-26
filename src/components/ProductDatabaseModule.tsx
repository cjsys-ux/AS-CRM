import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Search, Filter, Download, TrendingUp, DollarSign, Box, ChevronLeft, ChevronRight, Eye, Edit, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { AddProductDatabaseDrawer } from './AddProductDatabaseDrawer';
import { ProductDetailView } from './ProductDetailView';

const productsData = [
  {
    id: 'PRD-001',
    name: 'Premium Cotton T-Shirt',
    sku: 'TS-PREM-001',
    category: 'Apparel',
    description: 'High-quality 100% cotton t-shirt with custom printing',
    basePrice: '$12.50',
    retailPrice: '$24.99',
    margin: '50%',
    minOrder: 100,
    leadTime: '14-21 days',
    inStock: 1250,
    status: 'Active',
    lastUpdated: '2026-02-08',
  },
  {
    id: 'PRD-002',
    name: 'Insulated Stainless Steel Bottle',
    sku: 'BTL-INS-002',
    category: 'Drinkware',
    description: '32oz double-wall insulated water bottle',
    basePrice: '$8.75',
    retailPrice: '$19.99',
    margin: '56%',
    minOrder: 250,
    leadTime: '21-28 days',
    inStock: 320,
    status: 'Active',
    lastUpdated: '2026-02-09',
  },
  {
    id: 'PRD-003',
    name: 'Executive Leather Notebook',
    sku: 'NB-EXEC-003',
    category: 'Office Supplies',
    description: 'Premium leather-bound notebook with gold embossing',
    basePrice: '$15.00',
    retailPrice: '$34.99',
    margin: '57%',
    minOrder: 50,
    leadTime: '10-14 days',
    inStock: 450,
    status: 'Active',
    lastUpdated: '2026-02-07',
  },
  {
    id: 'PRD-004',
    name: 'Eco Canvas Tote Bag',
    sku: 'TTE-ECO-004',
    category: 'Bags',
    description: 'Sustainable canvas tote with reinforced handles',
    basePrice: '$6.50',
    retailPrice: '$14.99',
    margin: '57%',
    minOrder: 500,
    leadTime: '14-21 days',
    inStock: 890,
    status: 'Active',
    lastUpdated: '2026-02-10',
  },
  {
    id: 'PRD-005',
    name: 'Wireless Charging Pad',
    sku: 'CHR-WRL-005',
    category: 'Tech Accessories',
    description: '15W fast wireless charging pad with LED indicator',
    basePrice: '$18.00',
    retailPrice: '$39.99',
    margin: '55%',
    minOrder: 100,
    leadTime: '21-28 days',
    inStock: 150,
    status: 'Low Stock',
    lastUpdated: '2026-02-06',
  },
  {
    id: 'PRD-006',
    name: 'Ceramic Coffee Mug Set',
    sku: 'MUG-CER-006',
    category: 'Drinkware',
    description: 'Set of 2 premium ceramic mugs with gift box',
    basePrice: '$10.50',
    retailPrice: '$24.99',
    margin: '58%',
    minOrder: 200,
    leadTime: '14-21 days',
    inStock: 320,
    status: 'Active',
    lastUpdated: '2026-02-05',
  },
  {
    id: 'PRD-007',
    name: 'Bamboo Desk Organizer',
    sku: 'ORG-BMB-007',
    category: 'Office Supplies',
    description: 'Sustainable bamboo desk organizer with phone stand',
    basePrice: '$22.00',
    retailPrice: '$49.99',
    margin: '56%',
    minOrder: 50,
    leadTime: '21-28 days',
    inStock: 85,
    status: 'Low Stock',
    lastUpdated: '2026-02-04',
  },
  {
    id: 'PRD-008',
    name: 'Sport Performance Hoodie',
    sku: 'HD-SPRT-008',
    category: 'Apparel',
    description: 'Moisture-wicking performance hoodie with custom logo',
    basePrice: '$28.00',
    retailPrice: '$59.99',
    margin: '53%',
    minOrder: 50,
    leadTime: '21-28 days',
    inStock: 210,
    status: 'Active',
    lastUpdated: '2026-02-08',
  },
  {
    id: 'PRD-009',
    name: 'Premium Backpack',
    sku: 'BP-PREM-009',
    category: 'Bags',
    description: 'Durable backpack with laptop compartment and USB port',
    basePrice: '$32.00',
    retailPrice: '$69.99',
    margin: '54%',
    minOrder: 100,
    leadTime: '28-35 days',
    inStock: 0,
    status: 'Out of Stock',
    lastUpdated: '2026-02-03',
  },
  {
    id: 'PRD-010',
    name: 'Bluetooth Speaker',
    sku: 'SPK-BT-010',
    category: 'Tech Accessories',
    description: 'Portable waterproof Bluetooth speaker with 10hr battery',
    basePrice: '$25.00',
    retailPrice: '$54.99',
    margin: '55%',
    minOrder: 150,
    leadTime: '21-28 days',
    inStock: 380,
    status: 'Active',
    lastUpdated: '2026-02-09',
  },
];

export function ProductDatabaseModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const itemsPerPage = 10;

  // If viewing a product, show the detail view
  if (viewingProduct) {
    return (
      <ProductDetailView
        product={viewingProduct}
        onBack={() => setViewingProduct(null)}
        onSave={() => {
          setViewingProduct(null);
          // TODO: Add save logic
        }}
      />
    );
  }

  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Low Stock': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Out of Stock': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Apparel': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'Drinkware': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Office Supplies': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Bags': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'Tech Accessories': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const totalProducts = productsData.length;
  const activeProducts = productsData.filter(p => p.status === 'Active').length;
  const lowStockProducts = productsData.filter(p => p.status === 'Low Stock').length;
  const totalInventoryValue = productsData.reduce((sum, p) => {
    const price = parseFloat(p.basePrice.replace('$', ''));
    return sum + (price * p.inStock);
  }, 0);

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-12 shadow-lg">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Product Database</h1>
                <p className="text-cyan-100 text-sm">Internal Products Available for Sale</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingProduct(null);
                setIsDrawerOpen(true);
              }}
              className="flex items-center gap-2 px-8 py-4 bg-white text-cyan-600 font-bold rounded-2xl shadow-2xl hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 -mt-6 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Total Products</div>
              <div className="text-2xl font-bold text-slate-900">{totalProducts}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Box className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Active Products</div>
              <div className="text-2xl font-bold text-slate-900">{activeProducts}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Low Stock Items</div>
              <div className="text-2xl font-bold text-slate-900">{lowStockProducts}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Inventory Value</div>
              <div className="text-2xl font-bold text-slate-900">${totalInventoryValue.toLocaleString()}</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-8 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                <Download className="w-5 h-5" />
                Export
              </motion.button>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700">Category:</span>
                      <div className="flex gap-2 flex-wrap">
                        {['all', 'Apparel', 'Drinkware', 'Office Supplies', 'Bags', 'Tech Accessories'].map((category) => (
                          <button
                            key={category}
                            onClick={() => setFilterCategory(category)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              filterCategory === category
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {category === 'all' ? 'All' : category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-1 px-8 pb-8 overflow-auto">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Pricing</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Margin</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Min Order</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Lead Time</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{product.name}</div>
                            <div className="text-sm text-slate-500">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getCategoryBadgeColor(product.category)}`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-slate-900 font-medium">Base: {product.basePrice}</div>
                          <div className="text-slate-500">Retail: {product.retailPrice}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">{product.margin}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{product.minOrder} units</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{product.leadTime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-slate-900">{product.inStock.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">units</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadgeColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setViewingProduct(product);
                              setIsDrawerOpen(true);
                            }}
                            className="p-2 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEditingProduct(product);
                              setIsDrawerOpen(true);
                            }}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteModal(true)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-8 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of{' '}
                <span className="font-semibold text-slate-900">{filteredProducts.length}</span> products
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Delete Product</h3>
                      <p className="text-sm text-red-100">This action cannot be undone</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-700">
                    Are you sure you want to delete this product? All associated information will be permanently removed.
                  </p>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                  >
                    Delete Product
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Product Drawer */}
      <AddProductDatabaseDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingProduct(null);
          setViewingProduct(null);
        }}
        productData={editingProduct || viewingProduct}
      />
    </div>
  );
}