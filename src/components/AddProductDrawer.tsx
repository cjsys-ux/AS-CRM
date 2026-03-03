import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Upload, FileText, TrendingUp, DollarSign, Calendar, Tag, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CustomCalendar } from './CustomCalendar';


interface AddProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productData?: {
    id?: string;
    name?: string;
    client?: string;
    vendor?: string;
    description?: string;
    competitorName?: string;
    competitorLink?: string;
    competitorPrice?: string;
    status?: string;
    type?: string;
    yearlyQty?: number;
    pricePerUnit?: number;
    totalValue?: number;
    priority?: string;
    deployment?: string;
    projectManager?: string;
    internalSKU?: string;
    targetMargin?: string;
    image?: string;
  } | null;
}

export function AddProductDrawer({ isOpen, onClose, productData, onSuccess }: AddProductDrawerProps) {
  const [removeBackground, setRemoveBackground] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageKey, setUploadedImageKey] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showItemTypeDropdown, setShowItemTypeDropdown] = useState(false);
  const [showProjectManagerDropdown, setShowProjectManagerDropdown] = useState(false);
  const [formData, setFormData] = useState({
    productName: productData?.name || '',
    clientName: productData?.client || '',
    vendor: productData?.vendor || '',
    description: productData?.description || '',
    competitorName: productData?.competitorName || '',
    competitorLink: productData?.competitorLink || '',
    competitorPrice: productData?.competitorPrice || '',
    yearlyQty: productData?.yearlyQty?.toString() || '',
    targetPrice: productData?.pricePerUnit?.toString() || '',
    itemType: productData?.type || 'Deploy',
    dueDate: productData?.deployment || '',
    priority: productData?.priority || 'Medium',
    projectManager: productData?.projectManager || '',
    internalSKU: productData?.internalSKU || '',
    targetMargin: productData?.targetMargin || '',
    status: productData?.status || 'New Product',
    image: productData?.image || '',
  });

  // Available customers from Customers module
  const availableCustomers = [
    { id: 'CUST-001', name: 'Amazon', logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100' },
    { id: 'CUST-002', name: 'Test', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100' },
    { id: 'CUST-003', name: 'TechCorp Inc', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100' },
    { id: 'CUST-004', name: 'Global Retail Co', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100' },
    { id: 'CUST-005', name: 'Healthcare Plus', logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=100' },
  ];

  // Available vendors from Vendors module
  const availableVendors = [
    { id: 'VEND-001', name: 'Ergodyne', type: 'Distributor', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100' },
    { id: 'VEND-002', name: 'SC Promo', type: 'Product Manufacturer', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100' },
    { id: 'VEND-003', name: 'TEST', type: 'Distributor', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100' },
  ];

  // Update form when productData changes (for edit mode)
  useEffect(() => {
    if (productData) {
      setFormData({
        productName: productData.name || '',
        clientName: productData.client || '',
        vendor: productData.vendor || '',
        description: productData.description || '',
        competitorName: productData.competitorName || '',
        competitorLink: productData.competitorLink || '',
        competitorPrice: productData.competitorPrice || '',
        yearlyQty: productData.yearlyQty?.toString() || '',
        targetPrice: productData.pricePerUnit?.toString() || '',
        itemType: productData.type || 'Deploy',
        dueDate: productData.deployment || '',
        priority: productData.priority || 'Medium',
        projectManager: productData.projectManager || '',
        internalSKU: productData.internalSKU || '',
        targetMargin: productData.targetMargin || '',
        status: productData.status || 'New Product',
        image: productData.image || '',
      });
      setUploadedImage(productData.image || null);
    } else {
      // Reset to empty for new product
      setFormData({
        productName: '',
        clientName: '',
        vendor: '',
        description: '',
        competitorName: '',
        competitorLink: '',
        competitorPrice: '',
        yearlyQty: '',
        targetPrice: '',
        itemType: 'Deploy',
        dueDate: '',
        priority: 'Medium',
        projectManager: '',
        internalSKU: '',
        targetMargin: '',
        status: 'New Product',
        image: '',
      });
      setUploadedImage(null);
      setUploadedImageKey(null);
    }
  }, [productData, isOpen]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsProcessingImage(true);

    try {
      // Show a local preview immediately
      setUploadedImage(URL.createObjectURL(file));

      // Get a presigned S3 URL
      const presignRes = await fetch('/api/files/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          entityType: 'project',
          entityId: productData?.id ?? 'new',
        }),
      });

      if (!presignRes.ok) {
        throw new Error('Failed to get upload URL.');
      }

      const { uploadUrl, key } = await presignRes.json();

      // Upload the file directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image to storage.');
      }

      setUploadedImageKey(key);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Format number with commas
  const formatNumberWithCommas = (value: string) => {
    // Remove non-numeric characters except for decimal points
    const numericValue = value.replace(/[^\d]/g, '');
    // Add commas
    if (numericValue === '') return '';
    return parseInt(numericValue).toLocaleString();
  };

  // Parse number removing commas
  const parseFormattedNumber = (value: string) => {
    return value.replace(/,/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const yearlyQty = parseInt(parseFormattedNumber(formData.yearlyQty)) || 0;
    const pricePerUnit = parseFloat(formData.targetPrice) || 0;
    const totalValue = yearlyQty * pricePerUnit;

    const payload = {
      name: formData.productName,
      client: formData.clientName,
      vendor: formData.vendor,
      description: formData.description,
      competitorName: formData.competitorName,
      competitorLink: formData.competitorLink,
      competitorPrice: formData.competitorPrice,
      status: formData.status,
      type: formData.itemType,
      yearlyQty,
      pricePerUnit,
      totalValue,
      priority: formData.priority,
      deployment: formData.dueDate,
      projectManager: formData.projectManager,
      internalSKU: formData.internalSKU,
      targetMargin: formData.targetMargin,
      ...(uploadedImageKey ? { imageKey: uploadedImageKey } : {}),
    };

    try {
      const isEdit = Boolean(productData?.id);
      const url = isEdit ? '/api/projects/update' : '/api/projects/create';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit ? { id: productData!.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save product.');
      }

      onSuccess?.();
      onClose();
      setFormData({
        productName: '',
        clientName: '',
        vendor: '',
        description: '',
        competitorName: '',
        competitorLink: '',
        competitorPrice: '',
        yearlyQty: '',
        targetPrice: '',
        itemType: 'Deploy',
        dueDate: '',
        priority: 'Medium',
        projectManager: '',
        internalSKU: '',
        targetMargin: '',
        status: 'New Product',
        image: '',
      });
      setUploadedImage(null);
      setUploadedImageKey(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save product.');
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
            <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 px-8 py-8 flex items-center justify-between shadow-xl">
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
                    {productData?.id ? 'Edit Product' : 'Add New Product'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-teal-50 font-medium"
                  >
                    Submit a new product to the supply chain pipeline
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
              {/* Product Image */}
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
                    onChange={handleFileInputChange}
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
                      ) : isProcessingImage ? (
                        <div className="text-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"
                          />
                          <p className="text-xs text-slate-500 font-medium">Processing...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 font-medium">Click to upload</p>
                        </div>
                      )}
                    </motion.div>
                  </label>

                  <div className="flex-1">
                    <motion.button
                      type="button"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isProcessingImage}
                      className="flex items-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 rounded-2xl font-bold text-white transition-all mb-6 shadow-xl w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-5 h-5" />
                      {isProcessingImage ? 'Processing Image...' : 'Upload Product Image'}
                    </motion.button>

                    <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm mb-1">Remove White Background</p>
                          <p className="text-xs text-slate-600">Automatically make white backgrounds transparent</p>
                        </div>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRemoveBackground(!removeBackground)}
                          className={`relative w-14 h-7 rounded-full transition-all ${
                            removeBackground ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg' : 'bg-slate-300'
                          }`}
                        >
                          <motion.div
                            animate={{ x: removeBackground ? 28 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Basic Information */}
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
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter product name"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Client Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select client..."
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                          onFocus={() => setShowClientDropdown(true)}
                          onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                        />
                        <AnimatePresence>
                          {showClientDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                            >
                              {availableCustomers.map((customer, index) => (
                                <motion.div
                                  key={customer.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                                  onMouseDown={() => {
                                    setFormData({ ...formData, clientName: customer.name });
                                    setShowClientDropdown(false);
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <img src={customer.logo} alt={customer.name} className="w-8 h-8 rounded-full object-cover border-2 border-slate-200" />
                                    <div>
                                      <span className="text-sm font-bold text-slate-900">{customer.name}</span>
                                      <p className="text-xs text-slate-500">{customer.id}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Vendor
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select vendor..."
                          value={formData.vendor}
                          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                          onFocus={() => setShowVendorDropdown(true)}
                          onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                        />
                        <AnimatePresence>
                          {showVendorDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                            >
                              {availableVendors.map((vendor, index) => (
                                <motion.div
                                  key={vendor.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 border-b border-slate-100 last:border-b-0 transition-all"
                                  onMouseDown={() => {
                                    setFormData({ ...formData, vendor: vendor.name });
                                    setShowVendorDropdown(false);
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <img src={vendor.logo} alt={vendor.name} className="w-8 h-8 rounded-full object-cover border-2 border-slate-200" />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-900">{vendor.name}</span>
                                        <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">{vendor.type}</span>
                                      </div>
                                      <p className="text-xs text-slate-500">{vendor.id}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Product Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Product details and requirements"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none font-medium"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Competitor Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Competitor Analysis</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Competitor Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter competitor name"
                      value={formData.competitorName}
                      onChange={(e) => setFormData({ ...formData, competitorName: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Competitor Link
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        placeholder="competitor.com/product"
                        value={formData.competitorLink}
                        onChange={(e) => setFormData({ ...formData, competitorLink: e.target.value })}
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Competitor Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">$</span>
                      <input
                        type="text"
                        placeholder="9.99"
                        value={formData.competitorPrice}
                        onChange={(e) => setFormData({ ...formData, competitorPrice: e.target.value })}
                        className="w-full pl-10 pr-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Pricing & Quantity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Pricing & Quantity</h3>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Estimated Yearly Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="10,000"
                        value={formatNumberWithCommas(formData.yearlyQty)}
                        onChange={(e) => setFormData({ ...formData, yearlyQty: parseFormattedNumber(e.target.value) })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Target Price Per Unit <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">$</span>
                        <input
                          type="text"
                          placeholder="9.99"
                          value={formData.targetPrice}
                          onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                          className="w-full pl-10 pr-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Item Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Select item type..."
                      value={formData.itemType}
                      onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      onFocus={() => setShowItemTypeDropdown(true)}
                      onBlur={() => setTimeout(() => setShowItemTypeDropdown(false), 200)}
                    />
                    <AnimatePresence>
                      {showItemTypeDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                          <motion.div
                            key="Deployment"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                            onMouseDown={() => {
                              setFormData({ ...formData, itemType: 'Deployment' });
                              setShowItemTypeDropdown(false);
                            }}
                          >
                            <span className="text-sm font-bold text-slate-900">Deployment</span>
                          </motion.div>
                          <motion.div
                            key="Inventory"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                            onMouseDown={() => {
                              setFormData({ ...formData, itemType: 'Inventory' });
                              setShowItemTypeDropdown(false);
                            }}
                          >
                            <span className="text-sm font-bold text-slate-900">Inventory</span>
                          </motion.div>
                          <motion.div
                            key="Both"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                            onMouseDown={() => {
                              setFormData({ ...formData, itemType: 'Both' });
                              setShowItemTypeDropdown(false);
                            }}
                          >
                            <span className="text-sm font-bold text-slate-900">Both</span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Project Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Project Details</h3>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Due Date
                      </label>
                      <CustomCalendar
                        value={formData.dueDate}
                        onChange={(date) => setFormData({ ...formData, dueDate: date })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Priority
                      </label>
                      <input
                        type="text"
                        placeholder="Select priority..."
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                        onFocus={() => setShowPriorityDropdown(true)}
                        onBlur={() => setTimeout(() => setShowPriorityDropdown(false), 200)}
                      />
                      <AnimatePresence>
                        {showPriorityDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                          >
                            <motion.div
                              key="Low"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 }}
                              className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                              onMouseDown={() => {
                                setFormData({ ...formData, priority: 'Low' });
                                setShowPriorityDropdown(false);
                              }}
                            >
                              <span className="text-sm font-bold text-slate-900">Low</span>
                            </motion.div>
                            <motion.div
                              key="Medium"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                              onMouseDown={() => {
                                setFormData({ ...formData, priority: 'Medium' });
                                setShowPriorityDropdown(false);
                              }}
                            >
                              <span className="text-sm font-bold text-slate-900">Medium</span>
                            </motion.div>
                            <motion.div
                              key="High"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 }}
                              className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                              onMouseDown={() => {
                                setFormData({ ...formData, priority: 'High' });
                                setShowPriorityDropdown(false);
                              }}
                            >
                              <span className="text-sm font-bold text-slate-900">High</span>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Assigned Project Manager
                    </label>
                    <input
                      type="text"
                      placeholder="Select project manager..."
                      value={formData.projectManager}
                      onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      onFocus={() => setShowProjectManagerDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProjectManagerDropdown(false), 200)}
                    />
                    <AnimatePresence>
                      {showProjectManagerDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                          <motion.div
                            key="John Doe"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                            onMouseDown={() => {
                              setFormData({ ...formData, projectManager: 'John Doe' });
                              setShowProjectManagerDropdown(false);
                            }}
                          >
                            <span className="text-sm font-bold text-slate-900">John Doe</span>
                          </motion.div>
                          <motion.div
                            key="Jane Smith"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                            onMouseDown={() => {
                              setFormData({ ...formData, projectManager: 'Jane Smith' });
                              setShowProjectManagerDropdown(false);
                            }}
                          >
                            <span className="text-sm font-bold text-slate-900">Jane Smith</span>
                          </motion.div>
                          <motion.div
                            key="Mike Johnson"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                            onMouseDown={() => {
                              setFormData({ ...formData, projectManager: 'Mike Johnson' });
                              setShowProjectManagerDropdown(false);
                            }}
                          >
                            <span className="text-sm font-bold text-slate-900">Mike Johnson</span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Internal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Internal Information</h3>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Internal SKU
                      </label>
                      <input
                        type="text"
                        placeholder="Enter internal SKU or product code"
                        value={formData.internalSKU}
                        onChange={(e) => setFormData({ ...formData, internalSKU: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Target Margin (%)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 35"
                        value={formData.targetMargin}
                        onChange={(e) => setFormData({ ...formData, targetMargin: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer Actions */}
            <div className="border-t-2 border-slate-200 p-8 bg-white shadow-2xl">
              {submitError && (
                <p className="text-red-600 text-sm font-medium mb-4">{submitError}</p>
              )}
              <div className="flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-10 py-4 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all text-lg border-2 border-slate-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={isProcessingImage}
                  className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all shadow-2xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Package className="w-6 h-6" />
                  {productData?.id ? 'Save Changes' : 'Add Product'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}