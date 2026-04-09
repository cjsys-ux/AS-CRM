import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Upload, FileText, TrendingUp, DollarSign, Calendar, Tag, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ModernCalendar } from './ModernCalendar';


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
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showItemTypeDropdown, setShowItemTypeDropdown] = useState(false);
  const [showProjectManagerDropdown, setShowProjectManagerDropdown] = useState(false);
  const [showDueDateCalendar, setShowDueDateCalendar] = useState(false);
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

  // Fetch customers, vendors, and project managers from API
  const [availableCustomers, setAvailableCustomers] = useState<{ id: string; name: string }[]>([]);
  const [availableVendors, setAvailableVendors] = useState<{ id: string; name: string; type?: string }[]>([]);
  const [availableManagers, setAvailableManagers] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/customers/list')
      .then(r => r.json())
      .then(data => setAvailableCustomers(
        (data.customers ?? []).map((c: any) => ({ id: c.id || c._id, name: c.name || c.companyName || '' })).filter((c: any) => c.name)
      )).catch(() => {});
    fetch('/api/vendors/list')
      .then(r => r.json())
      .then(data => setAvailableVendors(
        (data.vendors ?? []).map((v: any) => ({ id: v.id || v._id, name: v.vendorName || v.name || '', type: v.vendorType || v.type || '' })).filter((v: any) => v.name)
      )).catch(() => {});
    fetch('/api/users/list')
      .then(r => r.json())
      .then(data => setAvailableManagers(
        (data.users ?? []).map((u: any) => u.name || (u.firstName ? `${u.firstName} ${u.lastName ?? ''}`.trim() : '')).filter(Boolean)
      )).catch(() => {});
  }, []);

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
      // Convert file to base64 data URL and store directly (no S3 dependency)
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadedImage(base64String);
      setFormData(prev => ({ ...prev, image: base64String }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadedImage(null);
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
      ...(formData.image ? { image: formData.image } : {}),
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
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-slate-50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
                >
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg sm:text-xl font-black text-white mb-0.5"
                  >
                    {productData?.id ? 'Edit Product' : 'Add New Product'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-teal-100 text-sm"
                  >
                    Submit a new product to the supply chain pipeline
                  </motion.p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Product Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-md border border-slate-200"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Product Image</h3>
                </div>

                <div className="flex items-start gap-5">
                  {/* Image Preview */}
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner cursor-pointer overflow-hidden"
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
                            className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full mx-auto mb-1"
                          />
                          <p className="text-[10px] text-slate-400">Processing...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                          <p className="text-[10px] text-slate-400 font-medium">Click to upload</p>
                        </div>
                      )}
                    </motion.div>
                  </label>

                  <div className="flex-1 space-y-3">
                    <motion.button
                      type="button"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isProcessingImage}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold text-white text-sm transition-all shadow-lg w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {isProcessingImage ? 'Processing...' : 'Upload Product Image'}
                    </motion.button>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">Remove White Background</p>
                          <p className="text-[11px] text-slate-500">Auto-remove white backgrounds</p>
                        </div>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRemoveBackground(!removeBackground)}
                          className={`relative w-11 h-6 rounded-full transition-all ${
                            removeBackground ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <motion.div
                            animate={{ x: removeBackground ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
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
                className="bg-white rounded-2xl p-5 shadow-md border border-slate-200"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Basic Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter product name"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Customer <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select customer..."
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                          onFocus={() => setShowClientDropdown(true)}
                          onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                        />
                        <AnimatePresence>
                          {showClientDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-52 overflow-y-auto"
                            >
                              {availableCustomers.map((customer, index) => (
                                <motion.div
                                  key={customer.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  className="px-4 py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                                  onMouseDown={() => {
                                    setFormData({ ...formData, clientName: customer.name });
                                    setShowClientDropdown(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {customer.logo ? (
                                      <div className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                                        <img src={customer.logo} alt={customer.name} className="w-full h-full object-contain p-0.5" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{customer.name?.charAt(0) || '?'}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-sm font-bold text-slate-900">{customer.name}</span>
                                      <p className="text-xs text-slate-400">{customer.id}</p>
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
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Vendor
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select vendor..."
                          value={formData.vendor}
                          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                          onFocus={() => setShowVendorDropdown(true)}
                          onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                        />
                        <AnimatePresence>
                          {showVendorDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-52 overflow-y-auto"
                            >
                              {availableVendors.map((vendor, index) => (
                                <motion.div
                                  key={vendor.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  className="px-4 py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 border-b border-slate-100 last:border-b-0 transition-all"
                                  onMouseDown={() => {
                                    setFormData({ ...formData, vendor: vendor.name });
                                    setShowVendorDropdown(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {vendor.logo ? (
                                      <div className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                                        <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-contain p-0.5" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{vendor.name?.charAt(0) || '?'}</span>
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-900">{vendor.name}</span>
                                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">{vendor.type}</span>
                                      </div>
                                      <p className="text-xs text-slate-400">{vendor.id}</p>
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
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Product Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Product details and requirements"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none font-medium"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Competitor Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow-md border border-slate-200"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Competitor Analysis</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Competitor Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter competitor name"
                      value={formData.competitorName}
                      onChange={(e) => setFormData({ ...formData, competitorName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Competitor Link
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        placeholder="competitor.com/product"
                        value={formData.competitorLink}
                        onChange={(e) => setFormData({ ...formData, competitorLink: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Competitor Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                      <input
                        type="text"
                        placeholder="9.99"
                        value={formData.competitorPrice}
                        onChange={(e) => setFormData({ ...formData, competitorPrice: e.target.value })}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
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
                className="bg-white rounded-2xl p-5 shadow-md border border-slate-200"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Pricing & Quantity</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Est. Yearly Qty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="10,000"
                        value={formatNumberWithCommas(formData.yearlyQty)}
                        onChange={(e) => setFormData({ ...formData, yearlyQty: parseFormattedNumber(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Target Price/Unit <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                        <input
                          type="text"
                          placeholder="9.99"
                          value={formData.targetPrice}
                          onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                          className="w-full pl-9 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Item Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Select item type..."
                      value={formData.itemType}
                      onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      onFocus={() => setShowItemTypeDropdown(true)}
                      onBlur={() => setTimeout(() => setShowItemTypeDropdown(false), 200)}
                    />
                    <AnimatePresence>
                      {showItemTypeDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
                        >
                          {['Deployment', 'Inventory', 'Both'].map((type, i) => (
                            <motion.div
                              key={type}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="px-4 py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                              onMouseDown={() => {
                                setFormData({ ...formData, itemType: type });
                                setShowItemTypeDropdown(false);
                              }}
                            >
                              <span className="text-sm font-bold text-slate-900">{type}</span>
                            </motion.div>
                          ))}
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
                className="bg-white rounded-2xl p-5 shadow-md border border-slate-200"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Project Details</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Due Date
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDueDateCalendar(true)}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-left font-medium transition-all hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                      >
                        <span className={formData.dueDate ? 'text-slate-900' : 'text-slate-400'}>
                          {formData.dueDate
                            ? new Date(formData.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Select date...'}
                        </span>
                      </button>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Priority
                      </label>
                      <input
                        type="text"
                        placeholder="Select priority..."
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                        onFocus={() => setShowPriorityDropdown(true)}
                        onBlur={() => setTimeout(() => setShowPriorityDropdown(false), 200)}
                      />
                      <AnimatePresence>
                        {showPriorityDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
                          >
                            {['Low', 'Medium', 'High'].map((p, i) => (
                              <motion.div
                                key={p}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="px-4 py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                                onMouseDown={() => {
                                  setFormData({ ...formData, priority: p });
                                  setShowPriorityDropdown(false);
                                }}
                              >
                                <span className="text-sm font-bold text-slate-900">{p}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Assigned Project Manager
                    </label>
                    <input
                      type="text"
                      placeholder="Select project manager..."
                      value={formData.projectManager}
                      onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      onFocus={() => setShowProjectManagerDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProjectManagerDropdown(false), 200)}
                    />
                    <AnimatePresence>
                      {showProjectManagerDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
                        >
                          {availableManagers.map((pm, i) => (
                            <motion.div
                              key={pm}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="px-4 py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                              onMouseDown={() => {
                                setFormData({ ...formData, projectManager: pm });
                                setShowProjectManagerDropdown(false);
                              }}
                            >
                              <span className="text-sm font-bold text-slate-900">{pm}</span>
                            </motion.div>
                          ))}
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
                className="bg-white rounded-2xl p-5 shadow-md border border-slate-200"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Internal Information</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Internal SKU
                      </label>
                      <input
                        type="text"
                        placeholder="SKU or product code"
                        value={formData.internalSKU}
                        onChange={(e) => setFormData({ ...formData, internalSKU: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Target Margin (%)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 35"
                        value={formData.targetMargin}
                        onChange={(e) => setFormData({ ...formData, targetMargin: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {submitError && <p className="text-red-600 text-sm font-medium px-6 pb-2 bg-white">{submitError}</p>}
            {/* Footer Actions */}
            <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-200 flex gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
                className="flex-1 px-6 py-3.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSubmit}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                {productData?.id ? 'Save Changes' : 'Add Product'}
              </motion.button>
            </div>
          </motion.div>

          <ModernCalendar
            isOpen={showDueDateCalendar}
            onClose={() => setShowDueDateCalendar(false)}
            selectedDate={formData.dueDate || null}
            onSelectDate={(date) => {
              setFormData({ ...formData, dueDate: date });
              setShowDueDateCalendar(false);
            }}
            label="Select Due Date"
          />
        </>
      )}
    </AnimatePresence>
  );
}