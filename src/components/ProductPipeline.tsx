import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Search, Filter, Download, Edit, Trash2, ChevronLeft, ChevronRight, User, Calendar, TrendingUp, DollarSign, ShoppingCart, ArrowUpDown, X, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddProductDrawer } from './AddProductDrawer';
import { DeleteProductModal } from './DeleteProductModal';
import { ImagePopupModal } from './ImagePopupModal';
import { BulkEditModal } from './BulkEditModal';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { StatusDropdown } from './StatusDropdown';
import { FilterDropdown } from './FilterDropdown';
import { ProductDetails } from './ProductDetails';


const getStatusColor = (status: string) => {
  switch (status) {
    case 'New Product':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'In Progress':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Ready For Live':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Live':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'text-red-600 font-bold text-sm';
    case 'Medium':
      return 'text-orange-600 font-semibold text-sm';
    case 'Low':
      return 'text-green-600 font-medium text-sm';
    default:
      return 'text-slate-600 text-sm';
  }
};

type Product = {
  id: string;
  name: string;
  client: string;
  vendor?: string;
  description?: string;
  competitorName?: string;
  competitorLink?: string;
  competitorPrice?: string;
  status: string;
  type: string;
  yearlyQty: number;
  pricePerUnit: number;
  totalValue: number;
  priority: string;
  deployment: string;
  projectManager?: string;
  internalSKU?: string;
  targetMargin?: string;
  image: string;
};

type ProjectsApiResponse = {
  projects?: Product[];
  error?: string;
};

export function ProductPipeline() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | undefined>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [imagePopup, setImagePopup] = useState<{ isOpen: boolean; imageUrl: string; productName: string }>({
    isOpen: false,
    imageUrl: '',
    productName: '',
  });
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: [] as string[],
    client: [] as string[],
    type: [] as string[],
    priceRange: [0, 1000] as [number, number],
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/list');
      const payload = (await response.json()) as ProjectsApiResponse;

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load projects from MongoDB.');
      }

      setProducts(Array.isArray(payload.projects) ? payload.projects : []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Failed to load pipeline projects.';
      setProducts([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Find the selected product
  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId)
    : null;

  // If a product is selected, show the detail view
  if (selectedProductId && selectedProduct) {
    return (
      <>
        <ProductDetails 
          productId={selectedProductId}
          onBack={() => setSelectedProductId(null)}
          productData={{
            name: selectedProduct.name,
            client: selectedProduct.client,
            vendor: selectedProduct.vendor || 'SC Promo',
            status: selectedProduct.status,
            type: selectedProduct.type || 'Both',
            internalSKU: selectedProduct.internalSKU || '',
            projectManager: selectedProduct.projectManager || 'Mike Johnson',
            image: selectedProduct.image,
          }}
          onProductUpdate={(updatedInfo) => {
            // Update the product in the products array
            setProducts(prevProducts => 
              prevProducts.map(p => 
                p.id === selectedProductId 
                  ? { 
                      ...p, 
                      name: updatedInfo.name,
                      client: updatedInfo.client,
                      vendor: updatedInfo.vendor,
                      status: updatedInfo.status,
                      type: updatedInfo.type,
                      internalSKU: updatedInfo.internalSKU,
                      projectManager: updatedInfo.projectManager,
                      image: updatedInfo.image,
                    }
                  : p
              )
            );
          }}
        />
        {/* Add Product Drawer - needs to be available even in detail view */}
        <AddProductDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingProduct(null);
          }} 
          productData={editingProduct}
          onSuccess={fetchProducts}
        />
      </>
    );
  }

  /* ui-qa-fixer: UI-PP-009 - advanced filters were collected but never applied to filteredProducts */
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;

    const af = advancedFilters;
    const matchesAdvancedStatus =
      !Array.isArray(af.status) || af.status.length === 0 || af.status.includes(product.status);
    const matchesAdvancedClient =
      !Array.isArray(af.client) || af.client.length === 0 || af.client.includes(product.client);
    const matchesAdvancedType =
      !Array.isArray(af.type) || af.type.length === 0 || af.type.includes(product.type);
    const matchesPrice =
      product.pricePerUnit >= af.priceRange[0] && product.pricePerUnit <= af.priceRange[1];

    return (
      matchesSearch &&
      matchesStatus &&
      matchesAdvancedStatus &&
      matchesAdvancedClient &&
      matchesAdvancedType &&
      matchesPrice
    );
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any = a[sortColumn as keyof typeof a];
    let bValue: any = b[sortColumn as keyof typeof b];

    // Handle numeric sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

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

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleBulkEdit = async (updates: { status?: string; client?: string; type?: string }) => {
    await Promise.all(
      selectedProducts.map((id) =>
        fetch('/api/projects/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        })
      )
    );
    setProducts((prev) =>
      prev.map((p) => (selectedProducts.includes(p.id) ? { ...p, ...updates } : p))
    );
    setSelectedProducts([]);
  };

  const handleBulkDelete = async () => {
    await Promise.all(
      selectedProducts.map((id) =>
        fetch(`/api/projects/delete?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      )
    );
    setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
  };

  const handleStatusUpdate = async (productId: string, newStatus: string) => {
    await fetch('/api/projects/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId, status: newStatus }),
    });
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
    );
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    await fetch(`/api/projects/delete?id=${encodeURIComponent(productToDelete.id)}`, {
      method: 'DELETE',
    });
    setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    setDeleteModalOpen(false);
    setProductToDelete(undefined);
  };

  const handleApplyFilters = (filters: any) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
  };

  // Calculate KPIs
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.totalValue, 0);
  const newProductCount = products.filter(p => p.status === 'New Product').length;
  const inProgressCount = products.filter(p => p.status === 'In Progress').length;
  const readyForLiveCount = products.filter(p => p.status === 'Ready For Live').length;
  const liveCount = products.filter(p => p.status === 'Live').length;
  const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 relative overflow-hidden">
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
                <Package className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Product Pipeline</h1>
                <p className="text-green-50">Track and manage product development stages</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-8 py-4 bg-white text-green-600 font-bold rounded-2xl shadow-2xl hover:shadow-green-500/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* KPI Cards */}
      {/* ui-qa-fixer: UI-2026-004 - tablet breakpoint fix: 6-col grid creates ~100px cards at 768px */}
      <div className="px-4 md:px-8 -mt-6 mb-6 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">New Product</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-slate-900"
              >
                {newProductCount}
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
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
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Ready For Live</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-slate-900"
              >
                {readyForLiveCount}
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Live</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-3xl font-bold text-slate-900"
              >
                {liveCount}
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
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Pipeline Value</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-slate-900"
              >
                {totalValue === 0 ? '$0.00' : `$${(totalValue / 1000000).toFixed(2)}M`}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Total Products</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="text-3xl font-bold text-slate-900"
              >
                {totalProducts}
              </motion.h3>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      {/* ui-qa-fixer: UI-2026-005 - responsive horizontal padding prevents content touching screen edge on mobile */}
      <div className="px-4 md:px-8 py-6 bg-slate-50/50 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto">
          {/* ui-qa-fixer: UI-PP-002 - flex-wrap + gap-y-3 prevent overflow on mobile; UI-PP-005 - corrected status options to match actual data values */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, clients, or IDs..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
              />
            </div>
            <FilterDropdown
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'New Product', label: 'New Product' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Ready For Live', label: 'Ready For Live' },
                { value: 'Live', label: 'Live' }
              ]}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterPanelOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              <Filter className="w-4 h-4" />
              Filter
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>

          {/* Embedded Bulk Action Bar */}
          <AnimatePresence>
            {selectedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 shadow-xl border-2 border-blue-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{selectedProducts.length}</span>
                      </div>
                      <span className="text-white font-medium">
                        {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsBulkEditOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Selected
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedProducts([])}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors ml-2"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      {/* ui-qa-fixer: UI-2026-006 - responsive horizontal padding for table container on mobile */}
      <div className="flex-1 px-4 md:px-8 pb-8 overflow-hidden">
        <div className="max-w-[1800px] mx-auto h-full">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[1600px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b-2 border-slate-200">
                    <th className="px-8 py-5 text-left w-16">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-slate-300 text-green-600 focus:ring-2 focus:ring-green-500/20"
                        checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider w-56">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        Image
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors"
                      >
                        Product Name
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('client')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors"
                      >
                        Client
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Vendor
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors"
                      >
                        Status
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Type
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Internal SKU
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Project Manager
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('priority')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors"
                      >
                        Priority
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('yearlyQty')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors"
                      >
                        Yearly Qty
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('pricePerUnit')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors"
                      >
                        Price/Unit
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('totalValue')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors"
                      >
                        Total Value
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSort('deployment')}
                        className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors"
                      >
                        Deployment
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </motion.button>
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={15} className="px-8 py-20">
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
                              <Package className="w-12 h-12 text-slate-400" />
                            </motion.div>
                            {/* ui-qa-fixer: UI-PP-003 - CTA hidden during loading and error states */}
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                              {loading ? 'Loading Projects...' : error ? 'Unable to Load Projects' : 'No Products Yet'}
                            </h3>
                            <p className="text-slate-500 mb-6 max-w-md">
                              {loading
                                ? 'Syncing your MongoDB projects collection into the Product Pipeline.'
                                : error
                                  ? error
                                  : 'Get started by adding your first product to the pipeline. Track development stages, manage inventory, and monitor progress all in one place.'}
                            </p>
                            {!loading && !error && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsDrawerOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                              >
                                <Plus className="w-5 h-5" />
                                Add Your First Product
                              </motion.button>
                            )}
                          </motion.div>
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-slate-100 group"
                        >
                          <td className="px-8 py-5">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg border-slate-300 text-green-600 focus:ring-2 focus:ring-green-500/20"
                              checked={selectedProducts.includes(product.id)}
                              onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                            />
                          </td>
                          <td className="px-6 py-5">
                            <motion.img
                              whileHover={{ scale: 1.15, rotate: 5 }}
                              src={product.image}
                              alt={product.name}
                              className="w-48 h-32 rounded-xl object-cover border-2 border-slate-200 shadow-md cursor-pointer"
                              onError={(event) => {
                                event.currentTarget.src = 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=800&h=500&fit=crop';
                              }}
                              onClick={() => {
                                setImagePopup({ isOpen: true, imageUrl: product.image, productName: product.name });
                              }}
                            />
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <p className="text-sm text-slate-900 group-hover:text-green-600 transition-colors">{product.name}</p>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm text-slate-700">{product.client}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{product.vendor}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <StatusDropdown
                              currentStatus={product.status}
                              onStatusChange={(newStatus) => handleStatusUpdate(product.id, newStatus)}
                            />
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="text-sm text-slate-700">{product.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{product.internalSKU}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{product.projectManager}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={getPriorityColor(product.priority)}>{product.priority}</span>
                          </td>
                          {/* ui-qa-fixer: UI-PP-007 - guard numeric methods against undefined values from MongoDB */}
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-900">{(product.yearlyQty ?? 0).toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-slate-900">${(product.pricePerUnit ?? 0).toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm text-green-600">${product.totalValue.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="text-sm text-slate-700">{product.deployment}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(219 234 254)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewProduct(product.id)}
                                className="p-1.5 hover:bg-blue-50 rounded-md transition-colors group/btn border-2 border-transparent hover:border-blue-200"
                              >
                                <Eye className="w-4 h-4 text-slate-400 group-hover/btn:text-blue-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 249 195)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsDrawerOpen(true);
                                }}
                                className="p-1.5 hover:bg-yellow-50 rounded-md transition-colors group/btn border-2 border-transparent hover:border-yellow-200"
                              >
                                <Edit className="w-4 h-4 text-slate-400 group-hover/btn:text-yellow-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 226 226)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setProductToDelete(product);
                                  setDeleteModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-red-50 rounded-md transition-colors group/btn border-2 border-transparent hover:border-red-200"
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

      {/* ui-qa-fixer: UI-PP-001 - px-8 had no mobile fallback; replaced with px-4 md:px-8 */}
      {/* Pagination */}
      <div className="px-4 md:px-8 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-700">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                {/* ui-qa-fixer: UI-PP-004 - guard against "Showing 1 to 0 of 0" when list is empty */}
                <span className="text-sm text-slate-600 font-medium">
                  {filteredProducts.length === 0 ? (
                    <>Showing <span className="font-bold text-slate-900">0</span> products</>
                  ) : (
                    <>Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to <span className="font-bold text-slate-900">{Math.min(endIndex, filteredProducts.length)}</span> of <span className="font-bold text-slate-900">{filteredProducts.length}</span> products</>
                  )}
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
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Drawer */}
      <AddProductDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingProduct(null);
        }} 
        productData={editingProduct}
        onSuccess={fetchProducts}
      />

      {/* Delete Confirm Modal */}
      <DeleteProductModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        productName={productToDelete?.name || ''}
        onConfirm={handleDeleteProduct}
      />

      {/* Image Popup Modal */}
      <ImagePopupModal
        isOpen={imagePopup.isOpen}
        onClose={() => setImagePopup({ isOpen: false, imageUrl: '', productName: '' })}
        imageUrl={imagePopup.imageUrl}
        productName={imagePopup.productName}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        onConfirm={handleBulkEdit}
        selectedCount={selectedProducts.length}
      />

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={handleApplyFilters}
        availableClients={Array.from(new Set(products.map(p => p.client)))}
        availableStatuses={['New Product', 'In Progress', 'Ready For Live', 'Live']}
        availableTypes={Array.from(new Set(products.map(p => p.type)))}
      />
    </div>
  );
}