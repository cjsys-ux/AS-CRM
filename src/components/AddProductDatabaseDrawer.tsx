import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Upload, FileText, Tag, DollarSign, TrendingUp, Calendar, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AddProductDatabaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productData?: {
    id?: string;
    name?: string;
    sku?: string;
    description?: string;
    vendor?: string;
    category?: string;
    countryOfOrigin?: string;
    brand?: string;
    pricePerUnit?: string;
    targetMargin?: string;
    priority?: string;
    dueDate?: string;
    status?: string;
    image?: string;
  } | null;
}

export function AddProductDatabaseDrawer({ isOpen, onClose, productData, onSuccess }: AddProductDatabaseDrawerProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    description: '',
    vendor: '',
    category: '',
    countryOfOrigin: '',
    brand: '',
    pricePerUnit: '',
    targetMargin: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Active',
    image: '',
  });

  // Update form when productData changes (for edit mode)
  useEffect(() => {
    if (productData) {
      setFormData({
        productName: productData.name || '',
        sku: productData.sku || '',
        description: productData.description || '',
        vendor: productData.vendor || '',
        category: productData.category || '',
        countryOfOrigin: productData.countryOfOrigin || '',
        brand: productData.brand || '',
        pricePerUnit: productData.pricePerUnit || '',
        targetMargin: productData.targetMargin || '',
        priority: productData.priority || 'Medium',
        dueDate: productData.dueDate || '',
        status: productData.status || 'Active',
        image: productData.image || '',
      });
      setUploadedImage(productData.image || null);
    } else {
      // Reset to empty for new product
      setFormData({
        productName: '',
        sku: '',
        description: '',
        vendor: '',
        category: '',
        countryOfOrigin: '',
        brand: '',
        pricePerUnit: '',
        targetMargin: '',
        priority: 'Medium',
        dueDate: '',
        status: 'Active',
        image: '',
      });
      setUploadedImage(null);
    }
  }, [productData, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Add API call to save product to database
    console.log('Product Data:', formData);
    
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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
            <div className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 px-8 py-8 flex items-center justify-between shadow-xl">
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-white mb-1"
                  >
                    {productData ? 'Edit Product' : 'Product View'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-cyan-50 font-medium"
                  >
                    Add a new product to your catalog.
                  </motion.p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-2xl transition-all"
              >
                <X className="w-7 h-7 text-white" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Product Image Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Product Image</h3>
                </div>

                <div className="flex items-start gap-6">
                  {/* Image Preview */}
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="image-upload">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="w-40 h-40 border-3 border-dashed border-slate-300 rounded-3xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner cursor-pointer overflow-hidden"
                    >
                      {uploadedImage || formData.image ? (
                        <img 
                          src={uploadedImage || formData.image} 
                          alt="Product preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 font-medium">Click to upload</p>
                        </div>
                      )}
                    </motion.div>
                  </label>

                  {/* Upload Button and Options */}
                  <div className="flex-1 space-y-4">
                    <label htmlFor="image-upload">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl cursor-pointer transition-all shadow-lg"
                      >
                        <Upload className="w-5 h-5" />
                        Upload Product Image
                      </motion.div>
                    </label>

                    {/* Remove Background Toggle */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">Remove White Background</h4>
                          <p className="text-sm text-slate-600">Automatically make white backgrounds transparent</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRemoveBackground(!removeBackground)}
                          className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                            removeBackground ? 'bg-cyan-600' : 'bg-slate-300'
                          }`}
                        >
                          <motion.div
                            animate={{ x: removeBackground ? 24 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Basic Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Basic Information</h3>
                </div>

                <div className="space-y-5">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="Enter product name"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="HSV-001"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter product description..."
                      rows={4}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none font-medium"
                    />
                  </div>

                  {/* Vendor and Category - Two Column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Vendor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.vendor}
                        onChange={(e) => handleInputChange('vendor', e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium appearance-none"
                        required
                      >
                        <option value="">Select vendor...</option>
                        <option value="Ergodyne">Ergodyne</option>
                        <option value="SC Promo">SC Promo</option>
                        <option value="TEST">TEST</option>
                        <option value="Alpha Suppliers">Alpha Suppliers</option>
                        <option value="Beta Manufacturing">Beta Manufacturing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Product Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium appearance-none"
                        required
                      >
                        <option value="">Select category...</option>
                        <option value="Apparel">Apparel</option>
                        <option value="Drinkware">Drinkware</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Bags">Bags</option>
                        <option value="Tech Accessories">Tech Accessories</option>
                        <option value="Safety Equipment">Safety Equipment</option>
                      </select>
                    </div>
                  </div>

                  {/* Country of Origin */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Country of Origin
                    </label>
                    <input
                      type="text"
                      value={formData.countryOfOrigin}
                      onChange={(e) => handleInputChange('countryOfOrigin', e.target.value)}
                      placeholder="Type to search countries..."
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Enter brand name"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Pricing & Details Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Pricing & Details</h3>
                </div>

                <div className="space-y-5">
                  {/* Price per Unit and Target Margin - Two Column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Price per Unit ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.pricePerUnit}
                        onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Target Margin (%)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={formData.targetMargin}
                        onChange={(e) => handleInputChange('targetMargin', e.target.value)}
                        placeholder="40"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Priority and Status - Two Column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium appearance-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium appearance-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Discontinued">Discontinued</option>
                        <option value="Coming Soon">Coming Soon</option>
                      </select>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-200 px-8 py-6 bg-white flex items-center justify-between gap-4 shadow-2xl">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-10 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all shadow-sm"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="flex items-center gap-3 px-10 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl transition-all shadow-lg"
              >
                <Package className="w-5 h-5" />
                {productData ? 'Update Product' : 'Add Product'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
