import { motion, AnimatePresence } from 'motion/react';
import { Boxes, Plus, Search, Filter, Download, AlertTriangle, TrendingUp, Package, ChevronLeft, ChevronRight, Eye, Edit, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { AddInventoryItemDrawer } from './AddInventoryItemDrawer';

const inventoryItems = [];

export function InventoryModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const filteredItems = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete:', selectedItems);
    setSelectedItems([]);
  };

  const lowStockCount = inventoryItems.filter(item => item.quantity < item.minStock).length;
  const totalValue = inventoryItems.reduce((sum, item) => {
    const cost = parseFloat(item.costPerUnit.replace('$', ''));
    return sum + (cost * item.quantity);
  }, 0);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-8 shadow-lg">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Boxes className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Inventory Management</h1>
                <p className="text-indigo-50">Track stock levels, suppliers, and warehouse locations</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddDrawerOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Item
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
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-600">Total Items</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{inventoryItems.length}</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-600">Low Stock</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{lowStockCount}</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-600">Total Value</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Boxes className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-600">Warehouses</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">3</h3>
            </motion.div>
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
                  placeholder="Search by name, SKU, or category..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
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
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>

          {/* Bulk Action Bar */}
          <AnimatePresence>
            {selectedItems.length > 0 && (
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
      </div>

      {/* Inventory Table */}
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        <div className="max-w-[1800px] mx-auto h-full">
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[1600px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    <th className="px-8 py-5 text-left w-16">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                        checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      SKU
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Item Name
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Category
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Quantity
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Supplier
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Cost/Unit
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Location
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {paginatedItems.map((item, index) => {
                      const isLowStock = item.quantity < item.minStock;
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-slate-100 group"
                        >
                          <td className="px-8 py-5">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                            />
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold text-slate-900">{item.sku}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <p className="font-semibold text-slate-900">{item.name}</p>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-slate-700">{item.category}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="font-medium text-slate-900">
                              {item.quantity.toLocaleString()} {item.unit}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            {isLowStock ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-slate-700">{item.supplier}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{item.costPerUnit}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-slate-700">{item.location}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(219 234 254)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => console.log('View item:', item.id)}
                                className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-blue-200"
                              >
                                <Eye className="w-5 h-5 text-slate-400 group-hover/btn:text-blue-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 249 195)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => console.log('Edit item:', item.id)}
                                className="p-2.5 hover:bg-yellow-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-yellow-200"
                              >
                                <Edit className="w-5 h-5 text-slate-400 group-hover/btn:text-yellow-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 226 226)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => console.log('Delete item:', item.id)}
                                className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-red-200"
                              >
                                <Trash2 className="w-5 h-5 text-slate-400 group-hover/btn:text-red-600" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
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
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-slate-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Inventory Item Drawer */}
      <AddInventoryItemDrawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} />
    </div>
  );
}