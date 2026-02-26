import { motion, AnimatePresence } from 'motion/react';
import { X, Package, DollarSign, Calendar, MapPin, TrendingUp, FileText, Image as ImageIcon, Tag, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface AddInventoryItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddInventoryItemDrawer({ isOpen, onClose }: AddInventoryItemDrawerProps) {
  const [formData, setFormData] = useState({
    selectedProduct: '',
    sku: '',
    customer: '',
    productName: '',
    imageUrl: '',
    quantity: '',
    reorderLevel: '',
    unitCost: '',
    unitPrice: '',
    supplier: '',
    location: '',
    status: 'In Stock',
    lastRestocked: '',
    notes: '',
    orderDate: '',
    shippingCost: '',
    paymentTerms: 'Due on Receipt',
    paymentDate: '',
    paymentAmount: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New Inventory Item:', formData);
    alert('Inventory item added successfully!');
    onClose();
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setFormData({ ...formData, selectedProduct: productId });
    
    // Auto-fill based on product selection
    if (productId === 'PROD-001') {
      setFormData({
        ...formData,
        selectedProduct: productId,
        sku: 'SKU-12345',
        productName: 'Branded T-Shirt',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 350 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-8 py-8 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <Package className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-white mb-1"
                  >
                    New Inventory Item
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-blue-100 text-sm"
                  >
                    Add a new item to inventory
                  </motion.p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-lg"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-6">
                {/* Quick Add from Product Database */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="mb-3">
                    <h4 className="font-bold text-blue-900 mb-1">Quick Add from Product Database</h4>
                    <p className="text-sm text-blue-700">Select a product to auto-fill SKU, name, and category</p>
                  </div>
                  <select
                    value={formData.selectedProduct}
                    onChange={handleProductSelect}
                    className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select product...</option>
                    <option value="PROD-001">Branded T-Shirt - SKU-12345</option>
                    <option value="PROD-002">Water Bottle - SKU-54321</option>
                    <option value="PROD-003">Tote Bag - SKU-67890</option>
                    <option value="PROD-004">Notebook - SKU-11223</option>
                  </select>
                </div>

                {/* SKU & Customer */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="SKU-12345"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Customer
                    </label>
                    <input
                      type="text"
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      placeholder="Customer Name"
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="Branded T-Shirt"
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Quantity & Reorder Level */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="100"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Reorder Level <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                      placeholder="20"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Unit Cost & Unit Price */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Unit Cost <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                      placeholder="15.00"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Unit Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      placeholder="25.00"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Supplier & Location */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="ABC Suppliers Inc."
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Warehouse A - Aisle 3"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Status & Last Restocked */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="Discontinued">Discontinued</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Last Restocked
                    </label>
                    <input
                      type="date"
                      value={formData.lastRestocked}
                      onChange={(e) => setFormData({ ...formData, lastRestocked: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this item..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Order Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Shipping Cost & Payment Terms */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Shipping Cost
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.shippingCost}
                      onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                      <option value="Net 90">Net 90</option>
                    </select>
                  </div>
                </div>

                {/* Payment Date & Payment Amount */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Payment Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.paymentAmount}
                      onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="sticky bottom-0 bg-white border-t-2 border-slate-200 px-8 py-6 flex items-center gap-4 shadow-2xl">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-lg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl"
                >
                  Add Item
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
