import { motion, AnimatePresence } from 'motion/react';
import { Boxes, Plus, Search, Filter, AlertTriangle, TrendingUp, Package, Eye, Edit, Trash2, X, RefreshCw, ArrowUpDown, Tag, Ban, MoreHorizontal, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AddInventoryItemDrawer } from './AddInventoryItemDrawer';
import { DeleteInventoryModal } from './DeleteInventoryModal';
import { InventoryDetailView } from './InventoryDetailView';
import type { InventoryItem } from './InventoryDetailView';
import { toast } from 'sonner@2.0.3';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';
import { ImagePopupModal } from './ImagePopupModal';


export function InventoryModule() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer states
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Detail view state
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);

  // Discontinue modal state
  const [discontinueItem, setDiscontinueItem] = useState<InventoryItem | null>(null);
  const [discontinueReason, setDiscontinueReason] = useState('');
  const [isDiscontinueModalOpen, setIsDiscontinueModalOpen] = useState(false);
  const [savingDiscontinue, setSavingDiscontinue] = useState(false);

  // Customer logo lookup
  const [customerLogoMap, setCustomerLogoMap] = useState<Record<string, string>>({});

  // Image popup state
  const [popupImage, setPopupImage] = useState<{ url: string; name: string } | null>(null);

  // Action menu state
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Close action menu on outside click
  useEffect(() => {
    if (!actionMenuId) return;
    const handler = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [actionMenuId]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  // Sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Column visibility
  const inventoryColumns: ColumnDef[] = [
    { key: 'checkbox', label: 'Select' },
    { key: 'image', label: 'Image' },
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Item Name' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'available', label: 'Available' },
    { key: 'allocated', label: 'Allocated' },
    { key: 'onOrder', label: 'On Order' },
    { key: 'inTransit', label: 'In Transit' },
    { key: 'status', label: 'Status' },
    { key: 'customer', label: 'Customer' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'costUnit', label: 'Cost/Unit' },
    { key: 'location', label: 'Location' },
    { key: 'itemType', label: 'Item Type' },
    { key: 'tags', label: 'Tags' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    inventoryColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;
  const visibleColCount = inventoryColumns.filter(c => isColVisible(c.key)).length;

  const fetchItems = async () => {
    setLoading(true);
    setItems([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    setCustomerLogoMap({});
  }, []);

  const getStockStatus = (item: InventoryItem) => {
    if (item.discontinued) return 'Discontinued';
    const qty = item.quantity || 0;
    const available = Math.max(0, qty - Math.min(item.allocated || 0, qty));
    const onOrder = item.onOrder || 0;
    if (available === 0 && onOrder > 0) return 'On Order';
    if (available === 0) return 'Out of Stock';
    if (qty < (item.minStock || 0) * 0.5) return 'Critical';
    if (qty < (item.minStock || 0)) return 'Low Stock';
    return 'In Stock';
  };

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];
  const customers = ['all', ...Array.from(new Set(items.map(i => i.customer).filter(Boolean))).sort()];

  const filteredItems = items.filter((item) => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'Discontinued') {
      matchesStatus = !!item.discontinued;
    } else if (statusFilter !== 'all') {
      const status = getStockStatus(item);
      matchesStatus = status === statusFilter && !item.discontinued;
    } else {
      // Default "All" view hides discontinued items
      matchesStatus = !item.discontinued;
    }

    const matchesItemType = itemTypeFilter === 'all' || (item.itemType || 'Normal') === itemTypeFilter;

    const matchesCustomer = customerFilter === 'all' || (item.customer || '') === customerFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesItemType && matchesCustomer;
  });

  // Apply sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue: unknown = a[sortColumn as keyof typeof a];
    const bValue: unknown = b[sortColumn as keyof typeof b];
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedItems(paginatedItems.map(item => item.id));
    else setSelectedItems([]);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) setSelectedItems([...selectedItems, itemId]);
    else setSelectedItems(selectedItems.filter(id => id !== itemId));
  };

  const handleBulkDelete = async () => {
    const count = selectedItems.length;
    setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    toast.success(`Deleted ${count} items`);
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditItem(item);
    setIsAddDrawerOpen(true);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setDeleteItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setItems(prev => prev.filter(item => item.id !== deleteItem.id));
    setDeleteItem(null);
    setIsDeleteModalOpen(false);
    toast.success('Item deleted successfully');
  };

  const handleViewClick = (item: InventoryItem) => {
    setDetailItem(item);
  };

  const handleDrawerClose = () => {
    setIsAddDrawerOpen(false);
    setEditItem(null);
  };

  const handleDiscontinueClick = (item: InventoryItem) => {
    setDiscontinueItem(item);
    setDiscontinueReason('');
    setIsDiscontinueModalOpen(true);
  };

  const handleDiscontinueConfirm = async () => {
    if (!discontinueItem) return;
    setSavingDiscontinue(true);
    setItems(prev => prev.map(item => item.id === discontinueItem.id ? {
      ...item,
      discontinued: true,
      discontinuedReason: discontinueReason.trim() || 'No reason provided',
      discontinuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    } : item));
    toast.success(`"${discontinueItem.name}" marked as discontinued`);
    setSavingDiscontinue(false);
    setIsDiscontinueModalOpen(false);
    setDiscontinueItem(null);
    setDiscontinueReason('');
  };

  const handleReactivateItem = async (item: InventoryItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, discontinued: false, discontinuedReason: undefined, discontinuedDate: undefined } : i));
    toast.success(`"${item.name}" reactivated`);
  };

  // KPIs
  const lowStockCount = items.filter(item => item.quantity < (item.minStock || 0) && item.quantity > 0).length;
  const outOfStockCount = items.filter(item => item.quantity === 0).length;
  const totalValue = items.reduce((sum, item) => {
    const cost = parseFloat((item.costPerUnit || '$0').replace('$', '')) || 0;
    return sum + (cost * (item.quantity || 0));
  }, 0);
  const warehouseCount = new Set(items.map(i => (i.location || '').split(' - ')[0]).filter(Boolean)).size;
  const discontinuedCount = items.filter(item => !!item.discontinued).length;

  const activeFilters = (categoryFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (itemTypeFilter !== 'all' ? 1 : 0) + (customerFilter !== 'all' ? 1 : 0);

  // If viewing detail, show the detail view
  if (detailItem) {
    return (
      <InventoryDetailView
        item={detailItem}
        onBack={() => setDetailItem(null)}
        onEdit={(item) => {
          setDetailItem(null);
          handleEditClick(item);
        }}
        onRefresh={() => {
          fetchItems().then(() => setDetailItem(null));
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Single scrollable content area - matches Receiving tab layout */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* KPI Cards - directly under tabs, no header */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { label: 'Total Items', value: String(items.length), icon: Package, color: 'from-blue-500 to-blue-600' },
              { label: 'Low Stock', value: String(lowStockCount), icon: AlertTriangle, color: 'from-amber-500 to-amber-600' },
              { label: 'Out of Stock', value: String(outOfStockCount), icon: X, color: 'from-red-500 to-red-600' },
              { label: 'Discontinued', value: String(discontinuedCount), icon: Ban, color: 'from-slate-400 to-slate-500' },
              { label: 'Total Value', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'from-green-500 to-green-600' },
              { label: 'Warehouses', value: String(warehouseCount), icon: Boxes, color: 'from-purple-500 to-purple-600' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center shadow-lg`}><Icon className="w-6 h-6 text-white" /></div>
                  </div>
                  <div className="text-sm text-slate-500 mb-1">{s.label}</div>
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg overflow-visible">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, category, or supplier..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchItems}
                className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setEditItem(null); setIsAddDrawerOpen(true); }}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </motion.button>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Filter className="w-4 h-4" />
                Filters
                {activeFilters > 0 && (
                  <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilters}</span>
                )}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="all">Category: All</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="all">Status: All</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical">Critical</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="On Order">On Order</option>
                <option value="Discontinued">Discontinued</option>
              </select>

              <select
                value={itemTypeFilter}
                onChange={(e) => { setItemTypeFilter(e.target.value); setCurrentPage(1); }}
                className={`px-4 py-2 border-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  itemTypeFilter !== 'all' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">Type: All</option>
                <option value="Normal">Normal Inventory</option>
                <option value="Competitor Sample">Competitor Sample</option>
                <option value="Pre-Production Sample">Pre-Production Sample</option>
              </select>

              <select
                value={customerFilter}
                onChange={(e) => { setCustomerFilter(e.target.value); setCurrentPage(1); }}
                className={`px-4 py-2 border-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  customerFilter !== 'all' ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">Customer: All</option>
                {customers.filter(c => c !== 'all').map(cust => (
                  <option key={cust} value={cust}>{cust}</option>
                ))}
              </select>

              {activeFilters > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setItemTypeFilter('all'); setCustomerFilter('all'); setCurrentPage(1); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}

              <div className="ml-auto">
                <ColumnVisibilityDropdown
                  columns={inventoryColumns}
                  visibleColumns={columnVisibility}
                  onChange={setColumnVisibility}
                  accentColor="indigo"
                />
              </div>
            </div>

            {/* Embedded Bulk Action Bar */}
            <AnimatePresence>
              {selectedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">{selectedItems.length}</span>
                        </div>
                        <span className="text-white font-medium">
                          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleBulkDelete}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Selected
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedItems([])}
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

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                        checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <button onClick={() => handleSort('sku')} className="flex items-center gap-2 whitespace-nowrap hover:text-indigo-600 transition-colors">
                        SKU <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-2 whitespace-nowrap hover:text-indigo-600 transition-colors">
                        Item Name <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <button onClick={() => handleSort('category')} className="flex items-center gap-2 whitespace-nowrap hover:text-indigo-600 transition-colors">
                        Category <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <button onClick={() => handleSort('quantity')} className="flex items-center gap-2 whitespace-nowrap hover:text-indigo-600 transition-colors">
                        Quantity <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>
                    {isColVisible('available') && (
                      <th className="text-center px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Available
                      </th>
                    )}
                    {isColVisible('allocated') && (
                      <th className="text-center px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Allocated
                      </th>
                    )}
                    {isColVisible('onOrder') && (
                      <th className="text-center px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        On Order
                      </th>
                    )}
                    {isColVisible('inTransit') && (
                      <th className="text-center px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        In Transit
                      </th>
                    )}
                    <th className="text-center px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    {isColVisible('customer') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('customer')} className="flex items-center gap-2 whitespace-nowrap hover:text-indigo-600 transition-colors">
                          Customer <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <button onClick={() => handleSort('supplier')} className="flex items-center gap-2 whitespace-nowrap hover:text-indigo-600 transition-colors">
                        Supplier <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Cost/Unit
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Location
                    </th>
                    {isColVisible('itemType') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => handleSort('itemType')} className="flex items-center gap-2 whitespace-nowrap hover:text-indigo-600 transition-colors">
                          Item Type <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        </button>
                      </th>
                    )}
                    {isColVisible('tags') && (
                      <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Tags
                      </th>
                    )}
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={visibleColCount} className="px-6 py-16 text-center">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Loading inventory...</p>
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColCount} className="px-6 py-16 text-center">
                        <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium text-lg mb-1">No Inventory Items</p>
                        <p className="text-slate-400 text-sm mb-4">Get started by adding your first inventory item</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setEditItem(null); setIsAddDrawerOpen(true); }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Add Your First Item
                        </motion.button>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item, index) => {
                      const status = getStockStatus(item);
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group"
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                            />
                          </td>
                          <td className="px-4 py-4">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:ring-offset-1 transition-all"
                                onClick={() => setPopupImage({ url: item.imageUrl!, name: item.name })}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                <Package className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold text-slate-900">{item.sku || '—'}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{item.name}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">{item.category || '—'}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">
                                {(item.quantity || 0).toLocaleString()} {item.unit || 'pcs'}
                              </span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    status === 'Out of Stock' || status === 'On Order' ? 'bg-red-500' :
                                    status === 'Critical' ? 'bg-red-400' :
                                    status === 'Low Stock' ? 'bg-amber-400' : 'bg-green-400'
                                  }`}
                                  style={{ width: `${Math.min(((item.quantity || 0) / Math.max(item.minStock || 1, 1)) * 50, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          {isColVisible('available') && (
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <span className={`text-sm font-semibold ${Math.max(0, (item.quantity || 0) - Math.min(item.allocated || 0, item.quantity || 0)) > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                {Math.max(0, (item.quantity || 0) - Math.min(item.allocated || 0, item.quantity || 0)).toLocaleString()} {item.unit || 'pcs'}
                              </span>
                            </td>
                          )}
                          {isColVisible('allocated') && (
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <span className={`text-sm font-medium ${(item.allocated || 0) > 0 ? ((item.allocated || 0) > (item.quantity || 0) ? 'text-red-600' : 'text-amber-600') : 'text-slate-400'}`}>
                                {Math.min(item.allocated || 0, item.quantity || 0).toLocaleString()}
                                {(item.allocated || 0) > (item.quantity || 0) && (
                                  <span className="text-[10px] text-red-500 ml-1" title="Allocated exceeds stock">⚠</span>
                                )}
                              </span>
                            </td>
                          )}
                          {isColVisible('onOrder') && (
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <span className={`text-sm font-medium ${(item.onOrder || 0) > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                {(item.onOrder || 0).toLocaleString()}
                              </span>
                            </td>
                          )}
                          {isColVisible('inTransit') && (
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <span className={`text-sm font-medium ${(item.inTransit || 0) > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                                {(item.inTransit || 0).toLocaleString()}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {(() => {
                              if (item.discontinued) {
                                return (
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 text-slate-600 border border-slate-300">
                                      <Ban className="w-3 h-3" />
                                      Discontinued
                                    </span>
                                  </div>
                                );
                              }
                              const qty = item.quantity || 0;
                              const available = Math.max(0, qty - Math.min(item.allocated || 0, qty));
                              const onOrder = item.onOrder || 0;
                              const effectiveStatus = available === 0 && onOrder > 0 ? 'On Order'
                                : available === 0 ? 'Out of Stock'
                                : qty < (item.minStock || 0) * 0.5 ? 'Critical'
                                : qty < (item.minStock || 0) ? 'Low Stock'
                                : 'In Stock';
                              return (
                                <div className="flex items-center justify-center gap-1">
                                  {effectiveStatus === 'Out of Stock' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                      Out of Stock
                                    </span>
                                  ) : effectiveStatus === 'Critical' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                                      <AlertTriangle className="w-3 h-3" />
                                      Critical
                                    </span>
                                  ) : effectiveStatus === 'Low Stock' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                      <AlertTriangle className="w-3 h-3" />
                                      Low Stock
                                    </span>
                                  ) : effectiveStatus === 'On Order' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                      <RefreshCw className="w-3 h-3" />
                                      On Order
                                    </span>
                                  ) : (
                                    <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                      In Stock
                                    </span>
                                  )}
                                  {/* Show secondary "On Order" pill when item has available stock but also has units on order */}
                                  {effectiveStatus !== 'On Order' && effectiveStatus !== 'Out of Stock' && onOrder > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                      +{onOrder.toLocaleString()} on order
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          {isColVisible('customer') && (
                            <td className="px-4 py-4 whitespace-nowrap">
                              {item.customer ? (
                                <div className="flex items-center gap-2 min-w-0">
                                  {customerLogoMap[(item.customer || '').trim().toLowerCase()] ? (
                                    <div className="w-8 h-7 rounded-md flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                                      <img src={customerLogoMap[(item.customer || '').trim().toLowerCase()]} alt={item.customer} className="max-w-full max-h-full object-contain p-0.5" />
                                    </div>
                                  ) : (
                                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shrink-0">
                                      <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-slate-900 truncate">{item.customer}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">—</span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{item.supplier || '—'}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-900">
                              {(() => {
                                const raw = item.costPerUnit;
                                if (raw == null || raw === '') return '—';
                                const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
                                if (isNaN(num) || num === 0) return '—';
                                return `$${num.toFixed(2)}`;
                              })()}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{item.location || '—'}</span>
                          </td>
                          {isColVisible('itemType') && (
                            <td className="px-4 py-4 whitespace-nowrap">
                              {(item.itemType === 'Competitor Sample') ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                  <Tag className="w-3 h-3" />
                                  Competitor Sample
                                </span>
                              ) : (item.itemType === 'Pre-Production Sample') ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                  <Tag className="w-3 h-3" />
                                  Pre-Prod Sample
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                  Normal
                                </span>
                              )}
                            </td>
                          )}
                          {isColVisible('tags') && (
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {(item.productTags || []).length > 0 ? (
                                  (item.productTags || []).map((tag, tIdx) => (
                                    <span key={tIdx} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      tag === 'Competitor Sample' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                      tag === 'Warehouse Supplier' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                      tag === 'Customer Goods' ? 'bg-green-50 text-green-600 border-green-200' :
                                      tag === 'Damaged' ? 'bg-red-50 text-red-600 border-red-200' :
                                      tag === 'PO Received' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' :
                                      'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                      {tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleViewClick(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                              <div className="relative" ref={actionMenuId === item.id ? actionMenuRef : undefined}>
                                <button
                                  onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)}
                                  className={`p-1.5 rounded-lg border transition-all ${
                                    actionMenuId === item.id
                                      ? 'bg-slate-200 border-slate-300 text-slate-700'
                                      : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100 hover:border-slate-200'
                                  }`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                <AnimatePresence>
                                  {actionMenuId === item.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 overflow-hidden"
                                    >
                                      <button
                                        onClick={() => { handleEditClick(item); setActionMenuId(null); }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                      >
                                        <Edit className="w-3.5 h-3.5 text-blue-500" />
                                        Edit Item
                                      </button>
                                      <div className="h-px bg-slate-100 my-1" />
                                      {item.discontinued ? (
                                        <button
                                          onClick={() => { handleReactivateItem(item); setActionMenuId(null); }}
                                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors text-left"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                                          Reactivate Item
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => { handleDiscontinueClick(item); setActionMenuId(null); }}
                                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors text-left"
                                        >
                                          <Ban className="w-3.5 h-3.5 text-amber-500" />
                                          Discontinue
                                        </button>
                                      )}
                                      <div className="h-px bg-slate-100 my-1" />
                                      <button
                                        onClick={() => { handleDeleteClick(item); setActionMenuId(null); }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        Delete Item
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - inside table card, matches Customers */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {Math.max(1, totalPages)} · Showing {sortedItems.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, sortedItems.length)} of {sortedItems.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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

      {/* Add/Edit Inventory Item Drawer */}
      <AddInventoryItemDrawer
        isOpen={isAddDrawerOpen}
        onClose={handleDrawerClose}
        editItem={editItem}
        onSuccess={fetchItems}
      />

      {/* Image Popup Modal */}
      <ImagePopupModal
        isOpen={!!popupImage}
        onClose={() => setPopupImage(null)}
        imageUrl={popupImage?.url || ''}
        productName={popupImage?.name}
      />

      {/* Delete Confirmation Modal */}
      <DeleteInventoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteItem(null); }}
        onConfirm={handleDeleteConfirm}
        item={deleteItem}
      />

      {/* Discontinue Confirmation Modal */}
      <AnimatePresence>
        {isDiscontinueModalOpen && discontinueItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setIsDiscontinueModalOpen(false); setDiscontinueItem(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Discontinue Item</h3>
                    <p className="text-sm text-slate-500">This will mark the item as discontinued</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    {discontinueItem.imageUrl ? (
                      <img src={discontinueItem.imageUrl} alt={discontinueItem.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">{discontinueItem.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{discontinueItem.sku}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason for Discontinuation <span className="text-slate-400 font-normal">(recommended)</span>
                  </label>
                  <textarea
                    value={discontinueReason}
                    onChange={(e) => setDiscontinueReason(e.target.value)}
                    placeholder="e.g., Supplier no longer carries this product, replaced by newer model, low demand..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                    rows={3}
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setIsDiscontinueModalOpen(false); setDiscontinueItem(null); }}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDiscontinueConfirm}
                    disabled={savingDiscontinue}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                  >
                    {savingDiscontinue ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Ban className="w-4 h-4" /> Discontinue</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}