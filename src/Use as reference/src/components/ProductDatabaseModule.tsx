import { motion } from 'motion/react';
import { Package, Plus, Search, Filter, Eye, Edit, Trash2, TrendingUp, DollarSign, Box, ArrowUpDown, X, RefreshCw, Truck, Shirt, Paintbrush, Megaphone, Factory, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { AddProductDatabaseDrawer } from './AddProductDatabaseDrawer';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ProductDetailView } from './ProductDetailView';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';
import { ImagePopupModal } from './ImagePopupModal';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Low Stock':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Out of Stock':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Live':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Discontinued':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Coming Soon':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'Apparel': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Drinkware': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Office Supplies': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Bags': return 'bg-pink-100 text-pink-700 border-pink-200';
    case 'Tech Accessories': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'Safety Equipment': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export function ProductDatabaseModule() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageName, setPreviewImageName] = useState<string>('');
  const productColumns: ColumnDef[] = [
    { key: 'image', label: 'Image' },
    { key: 'product', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'margin', label: 'Margin' },
    { key: 'minOrder', label: 'Min Order' },
    { key: 'leadTime', label: 'Lead Time' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    productColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;
  const visibleColCount = productColumns.filter(c => isColVisible(c.key)).length;

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/productdb`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      if (data.success) {
        // Parse own product database entries
        const dbParsed = (data.products || []).map((entry: any) => {
          try {
            const val = typeof entry === 'object' && entry.value !== undefined
              ? (typeof entry.value === 'string' ? JSON.parse(entry.value) : entry.value)
              : (typeof entry === 'string' ? JSON.parse(entry) : entry);
            return val;
          } catch { return null; }
        }).filter((p: any) => p && p.name);

        // Parse live pipeline products
        const liveParsed = (data.liveProducts || []).map((p: any) => ({
          ...p,
          _source: 'pipeline',
          status: 'Active', // Pipeline "Live" products show as "Active" in Product Database
        })).filter((p: any) => p && (p.name || p.id));

        // Combine both (db products first, then live pipeline products)
        setProducts([...dbParsed, ...liveParsed]);
      } else {
        console.error('Failed to fetch product database:', data.error);
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching product database:', error);
      toast.error('Error loading products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ESC key to close image preview
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [previewImage]);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    // Only delete productdb entries, not pipeline entries
    if (productToDelete._source === 'pipeline') {
      toast.error('Pipeline products cannot be deleted from Product Database');
      setDeleteModalOpen(false);
      setProductToDelete(null);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/productdb/${productToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Product deleted successfully');
        setDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  // If viewing a product, show the detail view
  if (viewingProduct) {
    return (
      <ProductDetailView
        product={viewingProduct}
        onBack={() => setViewingProduct(null)}
        onSave={() => {
          // Don't navigate away — let user verify save persisted
          // Refetch in background to keep list data fresh
          fetchProducts();
        }}
      />
    );
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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
  const totalProductsCount = products.length;
  const activeProducts = products.filter(p => p.status === 'Active' || p.status === 'Live').length;
  const inactiveProducts = products.filter(p => p.status === 'Inactive' || p.status === 'Discontinued').length;
  const productDistributors = products.filter(p => p.vendorType === 'Product Distributor').length;
  const apparelDistributors = products.filter(p => p.vendorType === 'Apparel Distributor').length;
  const decorators = products.filter(p => p.vendorType === 'Decorator').length;
  const promoDistributors = products.filter(p => p.vendorType === 'Promo Supplier' || p.vendorType === 'Promo Distributor').length;
  const productManufacturers = products.filter(p => p.vendorType === 'Product Manufacturer').length;

  const activeFilters = (selectedStatus !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0);

  // Gather unique categories from data
  const allCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <>
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Section - matches Customers */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 mb-0.5">Product Database</h1>
                <p className="text-xs text-slate-500">Internal Products Available for Sale</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm"
              onClick={() => {
                setEditingProduct(null);
                setIsDrawerOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              New Product
            </motion.button>
          </div>
        </div>
      </div>

      {/* KPI Strip - compact inline */}
      <div className="px-6 mt-4 mb-4 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-3">
            <div className="flex items-center divide-x divide-slate-200 overflow-x-auto">
              {[
                { label: 'Total Products', value: totalProductsCount, icon: Package, color: 'bg-cyan-500' },
                { label: 'Active', value: activeProducts, icon: Box, color: 'bg-green-500' },
                { label: 'Inactive', value: inactiveProducts, icon: XCircle, color: 'bg-slate-400' },
                { label: 'Product Dist.', value: productDistributors, icon: Truck, color: 'bg-indigo-500' },
                { label: 'Apparel Dist.', value: apparelDistributors, icon: Shirt, color: 'bg-purple-500' },
                { label: 'Decorator', value: decorators, icon: Paintbrush, color: 'bg-pink-500' },
                { label: 'Promo Dist.', value: promoDistributors, icon: Megaphone, color: 'bg-orange-500' },
                { label: 'Manufacturer', value: productManufacturers, icon: Factory, color: 'bg-teal-500' },
              ].map((kpi, idx) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-2.5 px-4 py-1 first:pl-1 whitespace-nowrap"
                >
                  <div className={`w-8 h-8 ${kpi.color} rounded-lg flex items-center justify-center shrink-0`}>
                    <kpi.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 leading-tight">{kpi.label}</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{kpi.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search - matches Customers */}
      <div className="px-6 pb-0 shrink-0 overflow-visible relative z-20">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-lg overflow-visible">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or description..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchProducts}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-2 mt-3">
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
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">Status: All</option>
                <option value="Active">Active</option>
                <option value="Live">Live</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Inactive">Inactive</option>
                <option value="Discontinued">Discontinued</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">Category: All</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {activeFilters > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedStatus('all'); setSelectedCategory('all'); setCurrentPage(1); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}

              <div className="ml-auto">
                <ColumnVisibilityDropdown
                  columns={productColumns}
                  visibleColumns={columnVisibility}
                  onChange={setColumnVisibility}
                  accentColor="blue"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Table Area - matches Customers */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {isColVisible('image') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 tracking-wider">
                      Image
                    </th>}
                    {isColVisible('product') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 tracking-wider">
                      Product
                    </th>}
                    {isColVisible('category') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('category')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                      >
                        Category
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('pricing') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 tracking-wider">
                      Pricing
                    </th>}
                    {isColVisible('margin') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('margin')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                      >
                        Margin
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('minOrder') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 tracking-wider whitespace-nowrap">
                      Min Order
                    </th>}
                    {isColVisible('leadTime') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 tracking-wider whitespace-nowrap">
                      Lead Time
                    </th>}
                    {isColVisible('status') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                      >
                        Status
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('created') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 tracking-wider">
                      Created
                    </th>}
                    {isColVisible('actions') && <th className="text-left px-3 py-3 text-[11px] font-semibold text-slate-600 tracking-wider">
                      Actions
                    </th>}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={visibleColCount} className="px-6 py-16 text-center">
                        <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Loading products...</p>
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColCount} className="px-6 py-16 text-center">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium text-lg mb-1">No products found</p>
                        <p className="text-slate-400 text-sm">Add your first product to get started</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group"
                      >
                        {isColVisible('image') && <td className="px-3 py-3">
                          {product.image ? (
                            <div 
                              className="w-14 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm bg-white cursor-pointer hover:border-blue-400 transition-colors"
                              onClick={() => {
                                setPreviewImage(product.image);
                                setPreviewImageName(product.name);
                              }}
                            >
                              <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-14 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </td>}
                        {isColVisible('product') && <td className="px-3 py-3 whitespace-nowrap">
                          <div>
                            <div className="font-semibold text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-500">{product.sku || product.id}</div>
                          </div>
                        </td>}
                        {isColVisible('category') && <td className="px-3 py-3 whitespace-nowrap">
                          {product.category ? (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeColor(product.category)}`}>
                              {product.category}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>}
                        {isColVisible('pricing') && <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-slate-900 font-medium">{product.basePrice || '—'}</div>
                          </div>
                        </td>}
                        {isColVisible('margin') && <td className="px-3 py-3 whitespace-nowrap">
                          {product.margin ? (
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">{product.margin}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>}
                        {isColVisible('minOrder') && <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{product.minOrder ? `${product.minOrder} units` : '—'}</span>
                        </td>}
                        {isColVisible('leadTime') && <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{product.leadTime || '—'}</span>
                        </td>}
                        {isColVisible('status') && <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </td>}
                        {isColVisible('created') && <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-sm text-slate-500">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '—'}</span>
                        </td>}
                        {isColVisible('actions') && <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              onClick={() => setViewingProduct(product)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              onClick={() => {
                                setEditingProduct(product);
                                setIsDrawerOpen(true);
                              }}
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              onClick={() => {
                                setProductToDelete(product);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - inside table card, matches Customers */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {Math.max(1, totalPages)} · Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}
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

      {/* Add/Edit Product Drawer */}
      <AddProductDatabaseDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingProduct(null);
        }}
        productData={editingProduct}
        onSuccess={fetchProducts}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteProduct}
        itemName={productToDelete?.name || ''}
        itemType="product"
      />

      {/* Image Preview Modal */}
      <ImagePopupModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ''}
        productName={previewImageName}
      />
    </div>
    </>
  );
}