import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Search, Filter, Edit, Trash2, Calendar, TrendingUp, DollarSign, ShoppingCart, ArrowUpDown, X, Eye, RefreshCw, Columns3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddProductDrawer } from './AddProductDrawer';
import { DeleteProductModal } from './DeleteProductModal';
import { ImagePopupModal } from './ImagePopupModal';
import { BulkEditModal } from './BulkEditModal';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { ColumnPickerDrawer, COLUMNS, ColumnId } from './ColumnPickerDrawer';
import { StatusDropdown } from './StatusDropdown';
import { ProductDetails } from './ProductDetails';
import { ModernDropdown } from './ModernDropdown';
import { getProjectBadgeStaticClasses } from './projectNumberUtils';


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
  const [selectedType, setSelectedType] = useState('all');
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
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnId>>(() => {
    try {
      const saved = localStorage.getItem('pipeline-visible-columns');
      if (saved) return new Set(JSON.parse(saved) as ColumnId[]);
    } catch {}
    return new Set(COLUMNS.map(c => c.id));
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [pendingColumns, setPendingColumns] = useState<Set<ColumnId>>(new Set());

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

const handleOpenColumnPicker = () => {
    setPendingColumns(new Set(visibleColumns));
    setIsColumnPickerOpen(true);
  };

  const togglePendingColumn = (id: ColumnId) => {
    setPendingColumns(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const applyColumnChanges = (columns: Set<ColumnId>) => {
    setVisibleColumns(new Set(columns));
    localStorage.setItem('pipeline-visible-columns', JSON.stringify([...columns]));
    setIsColumnPickerOpen(false);
  };

  const discardColumnChanges = () => setIsColumnPickerOpen(false);

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
    const matchesType = selectedType === 'all' || product.type === selectedType;

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
      matchesType &&
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
  const activeFilters = (selectedStatus !== 'all' ? 1 : 0) + (selectedType !== 'all' ? 1 : 0);
  const allTypes = Array.from(new Set(products.map(p => p.type).filter(Boolean)));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-700 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">Product Pipeline</h1>
                <p className="text-xs sm:text-base text-slate-500 hidden sm:block">Track and manage product development stages</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-4 sm:px-8 mt-4 sm:mt-6 mb-4 sm:mb-6 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-0.5 sm:mb-1">New Product</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl sm:text-3xl font-bold text-slate-900"
              >
                {newProductCount}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-0.5 sm:mb-1">In Progress</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-xl sm:text-3xl font-bold text-slate-900"
              >
                {inProgressCount}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-0.5 sm:mb-1">Ready For Live</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl sm:text-3xl font-bold text-slate-900"
              >
                {readyForLiveCount}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-0.5 sm:mb-1">Live</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-xl sm:text-3xl font-bold text-slate-900"
              >
                {liveCount}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-0.5 sm:mb-1">Pipeline Value</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl sm:text-3xl font-bold text-slate-900"
              >
                {(() => {
                  if (totalValue === 0) return '$0';
                  if (totalValue >= 1000000) return `$${(totalValue / 1000000).toFixed(1)}M`;
                  if (totalValue >= 1000) return `$${Math.round(totalValue / 1000)}K`;
                  return `$${totalValue.toFixed(2)}`;
                })()}
              </motion.h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-0.5 sm:mb-1">Total Products</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="text-xl sm:text-3xl font-bold text-slate-900"
              >
                {totalProducts}
              </motion.h3>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-4 sm:px-8 pb-0 shrink-0 overflow-visible relative z-20">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl p-3 sm:p-6 border border-slate-200 shadow-lg overflow-visible">
            {/* Search + Refresh row */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, clients, or IDs..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchProducts}
                className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Filter className="w-4 h-4" />
                Filters
                {activeFilters > 0 && (
                  <span className="w-5 h-5 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilters}</span>
                )}
              </div>

              <ModernDropdown
                value={selectedStatus === 'all' ? 'Status: All' : selectedStatus}
                onChange={(v) => { setSelectedStatus(v === 'Status: All' ? 'all' : v); setCurrentPage(1); }}
                options={['Status: All', 'New Product', 'In Progress', 'Ready For Live', 'Live']}
                compact
              />

              <ModernDropdown
                value={selectedType === 'all' ? 'Type: All' : selectedType}
                onChange={(v) => { setSelectedType(v === 'Type: All' ? 'all' : v); setCurrentPage(1); }}
                options={['Type: All', ...allTypes]}
                compact
              />

              {activeFilters > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedStatus('all'); setSelectedType('all'); setCurrentPage(1); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}

              <div className="ml-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenColumnPicker}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition-colors text-sm"
                >
                  <Columns3 className="w-4 h-4" />
                  Columns
                </motion.button>
              </div>
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
                  <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-4 shadow-lg">
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
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-4 sm:pt-6 pb-4 sm:pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-2 focus:ring-green-500/20"
                        checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    {visibleColumns.has('image') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Image</th>
                    )}
                    {visibleColumns.has('projectNumber') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('projectNumber')} className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors">
                          Project # <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {visibleColumns.has('name') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('name')} className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors">
                          Product Name <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {visibleColumns.has('client') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('client')} className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors">
                          Customer <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {visibleColumns.has('vendor') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Vendor</th>
                    )}
                    {visibleColumns.has('status') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('status')} className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors">
                          Status <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {visibleColumns.has('progress') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Progress</th>
                    )}
                    {visibleColumns.has('type') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Type</th>
                    )}
                    {visibleColumns.has('internalSKU') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Internal SKU</th>
                    )}
                    {visibleColumns.has('projectManager') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Project Manager</th>
                    )}
                    {visibleColumns.has('priority') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('priority')} className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors">
                          Priority <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {visibleColumns.has('yearlyQty') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('yearlyQty')} className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors">
                          Yearly Qty <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {visibleColumns.has('pricePerUnit') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('pricePerUnit')} className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors">
                          Price/Unit <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {visibleColumns.has('totalValue') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('totalValue')} className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors">
                          Total Value <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {visibleColumns.has('deployment') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('deployment')} className="flex items-center gap-2 whitespace-nowrap hover:text-green-600 transition-colors">
                          Deployment <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {visibleColumns.has('actions') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={1 + visibleColumns.size} className="px-6 py-16 text-center">
                        <RefreshCw className="w-8 h-8 text-green-500 animate-spin mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Loading products...</p>
                      </td>
                    </tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={1 + visibleColumns.size} className="px-6 py-16 text-center">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium text-lg mb-1">
                          {error ? 'Unable to Load Projects' : 'No Products Yet'}
                        </p>
                        <p className="text-slate-400 text-sm mb-4">
                          {error ? error : 'Get started by adding your first product to the pipeline'}
                        </p>
                        {!error && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsDrawerOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Add Your First Product
                          </motion.button>
                        )}
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
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-2 focus:ring-green-500/20"
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          />
                        </td>
                        {visibleColumns.has('image') && (
                          <td className="px-4 py-4">
                            {product.image ? (
                              <motion.img
                                whileHover={{ scale: 1.05 }}
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-12 rounded-lg object-cover border border-slate-200 shadow-sm cursor-pointer"
                                onClick={() => setImagePopup({ isOpen: true, imageUrl: product.image, productName: product.name })}
                                onError={(event) => {
                                  (event.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                                <Package className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </td>
                        )}
                        {visibleColumns.has('projectNumber') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getProjectBadgeStaticClasses(product.projectNumber || '')}`}>
                              {product.projectNumber || '—'}
                            </span>
                          </td>
                        )}
                        {visibleColumns.has('name') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-900">{product.name}</span>
                          </td>
                        )}
                        {visibleColumns.has('client') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{product.client}</span>
                          </td>
                        )}
                        {visibleColumns.has('vendor') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{product.vendor || '—'}</span>
                          </td>
                        )}
                        {visibleColumns.has('status') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <StatusDropdown
                              currentStatus={product.status}
                              onStatusChange={(newStatus) => handleStatusUpdate(product.id, newStatus)}
                            />
                          </td>
                        )}
                        {visibleColumns.has('progress') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            {(() => {
                              const completed = (product as any).checklistCompleted || 0;
                              const total = (product as any).checklistTotal || 20;
                              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                              const barColor = pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-green-400' : pct >= 40 ? 'bg-orange-400' : 'bg-red-400';
                              return (
                                <div className="flex items-center gap-2 min-w-[120px]">
                                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{completed}/{total}</span>
                                </div>
                              );
                            })()}
                          </td>
                        )}
                        {visibleColumns.has('type') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{product.type || '—'}</span>
                          </td>
                        )}
                        {visibleColumns.has('internalSKU') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{product.internalSKU || '—'}</span>
                          </td>
                        )}
                        {visibleColumns.has('projectManager') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{product.projectManager || '—'}</span>
                          </td>
                        )}
                        {visibleColumns.has('priority') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={getPriorityColor(product.priority)}>{product.priority || '—'}</span>
                          </td>
                        )}
                        {/* ui-qa-fixer: UI-PP-007 - guard numeric methods against undefined values from MongoDB */}
                        {visibleColumns.has('yearlyQty') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-900 font-medium">{(product.yearlyQty ?? 0).toLocaleString()}</span>
                          </td>
                        )}
                        {visibleColumns.has('pricePerUnit') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-900 font-medium">${(product.pricePerUnit ?? 0).toFixed(2)}</span>
                          </td>
                        )}
                        {visibleColumns.has('totalValue') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-green-600 font-medium">${(product.totalValue ?? 0).toLocaleString()}</span>
                          </td>
                        )}
                        {visibleColumns.has('deployment') && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="text-sm text-slate-700">{product.deployment}</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.has('actions') && (
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewProduct(product.id)}
                                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="View Details"
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
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setProductToDelete(product);
                                  setDeleteModalOpen(true);
                                }}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - inside table card */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-xs sm:text-sm text-slate-600">
                Page {currentPage} of {Math.max(1, totalPages)} · {sortedProducts.length} results
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-slate-600 hidden sm:inline">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20"
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

      {/* Column Picker Drawer */}
      <ColumnPickerDrawer
        isOpen={isColumnPickerOpen}
        onClose={discardColumnChanges}
        onApply={applyColumnChanges}
        pendingColumns={pendingColumns}
        onToggleColumn={togglePendingColumn}
        onSelectAll={() => {
          if (pendingColumns.size === COLUMNS.length) {
            setPendingColumns(new Set());
          } else {
            setPendingColumns(new Set(COLUMNS.map(c => c.id)));
          }
        }}
      />
    </div>
  );
}