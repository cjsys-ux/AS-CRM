import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Upload, FileText, Tag, DollarSign, TrendingUp, Calendar, Image as ImageIcon, Loader2, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SearchableSelect } from './SearchableSelect';
import { QuantityStepper } from './QuantityStepper';


const VENDOR_TYPES = [
  'Product Distributor', 'Apparel Distributor', 'Decorator', 'Promo Supplier', 'Product Manufacturer'
];

const PRODUCT_CATEGORIES = [
  'Apparel', 'Drinkware', 'Tech Accessories', 'Bags', 'Writing', 'Office', 'Outdoor', 'Wellness', 'PPE'
];

const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  'Apparel': ['T-Shirts', 'Hoodies', 'Polos', 'Jackets', 'Hats', 'Socks', 'Activewear'],
  'Drinkware': ['Mugs', 'Tumblers', 'Water Bottles', 'Wine Glasses', 'Can Coolers', 'Shot Glasses'],
  'Tech Accessories': ['Phone Cases', 'Chargers', 'USB Drives', 'Earbuds', 'Power Banks', 'Webcam Covers'],
  'Bags': ['Tote Bags', 'Backpacks', 'Drawstring Bags', 'Duffel Bags', 'Laptop Sleeves', 'Fanny Packs'],
  'Writing': ['Pens', 'Pencils', 'Markers', 'Highlighters', 'Stylus Pens', 'Pen Sets'],
  'Office': ['Notebooks', 'Desk Accessories', 'Calendars', 'Sticky Notes', 'Mouse Pads', 'Desk Organizers'],
  'Outdoor': ['Sunglasses', 'Umbrellas', 'Blankets', 'Coolers', 'Chairs', 'Sports Bottles'],
  'Wellness': ['Hand Sanitizer', 'Lip Balm', 'First Aid Kits', 'Stress Balls', 'Fitness Bands', 'Towels'],
  'PPE': ['Hard Hats', 'Safety Glasses', 'Gloves', 'High-Vis Vests', 'Face Shields', 'Ear Protection'],
};

const ORIGIN_COUNTRIES = [
  'United States', 'China', 'India', 'Vietnam', 'Mexico', 'Bangladesh', 'Taiwan', 'South Korea', 'Japan', 'Thailand', 'Indonesia', 'Turkey', 'Pakistan', 'Cambodia'
];

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
    vendorType?: string;
    productCategory?: string;
    countryOfOrigin?: string;
    brand?: string;
    basePrice?: string;
    retailPrice?: string;
    margin?: string;
    minOrder?: number;
    leadTime?: string;
    inStock?: number;
    pricePerUnit?: string;
    targetMargin?: string;
    priority?: string;
    dueDate?: string;
    status?: string;
    image?: string;
    subcategory?: string;
  } | null;
}

export function AddProductDatabaseDrawer({ isOpen, onClose, productData, onSuccess }: AddProductDatabaseDrawerProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [vendorsList, setVendorsList] = useState<{ id: string; name: string; type: string }[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [selectedVendorType, setSelectedVendorType] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showVendorTypeDropdown, setShowVendorTypeDropdown] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [subcategory, setSubcategory] = useState('');
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    description: '',
    vendor: '',
    category: '',
    vendorType: '',
    countryOfOrigin: '',
    brand: '',
    basePrice: '',
    retailPrice: '',
    margin: '',
    minOrder: '',
    leadTime: '',
    inStock: '',
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
        category: productData.category || productData.productCategory || '',
        vendorType: productData.vendorType || '',
        countryOfOrigin: productData.countryOfOrigin || '',
        brand: productData.brand || '',
        basePrice: (productData.basePrice || '').replace('$', ''),
        retailPrice: (productData.retailPrice || '').replace('$', ''),
        margin: (productData.margin || '').replace('%', ''),
        minOrder: String(productData.minOrder || ''),
        leadTime: productData.leadTime || '',
        inStock: String(productData.inStock || ''),
        priority: productData.priority || 'Medium',
        dueDate: productData.dueDate || '',
        status: productData.status || 'Active',
        image: productData.image || '',
      });
      setSubcategory(productData.subcategory || '');
      setUploadedImage(productData.image || null);
    } else {
      setFormData({
        productName: '',
        sku: '',
        description: '',
        vendor: '',
        category: '',
        vendorType: '',
        countryOfOrigin: '',
        brand: '',
        basePrice: '',
        retailPrice: '',
        margin: '',
        minOrder: '',
        leadTime: '',
        inStock: '',
        priority: 'Medium',
        dueDate: '',
        status: 'Active',
        image: '',
      });
      setSubcategory('');
      setUploadedImage(null);
    }
  }, [productData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setVendorsLoading(true);
    setVendorsList([]);
    setVendorsLoading(false);
  }, [isOpen]);

  // Filter vendors based on typed text
  const filteredVendors = vendorsList.filter(v =>
    v.name.toLowerCase().includes(formData.vendor.toLowerCase())
  );

  // Determine if vendor is a distributor type (simplified pricing)
  const isDistributor = selectedVendorType.toLowerCase().includes('distributor') || formData.vendorType.toLowerCase().includes('distributor');

  // When removeBackground is toggled ON and an image already exists, re-process it
  const originalImageRef = useRef<string | null>(null);
  useEffect(() => {
    if (!uploadedImage) return;
    if (!originalImageRef.current || !removeBackground) {
      if (!removeBackground) originalImageRef.current = uploadedImage;
    }
    if (removeBackground && uploadedImage) {
      // background removal not available in local mode
    } else if (!removeBackground && originalImageRef.current) {
      setUploadedImage(originalImageRef.current);
      setFormData(prev => ({ ...prev, image: originalImageRef.current || '' }));
    }
  }, [removeBackground]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsProcessingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        let finalImage = base64String;
        originalImageRef.current = base64String;

        if (removeBackground) {
          // background removal not available in local mode
        }

        setUploadedImage(finalImage);
        setFormData(prev => ({ ...prev, image: finalImage }));
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsProcessingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const calcMargin = (base: string, retail: string) => {
    const b = parseFloat(base);
    const r = parseFloat(retail);
    if (!isNaN(b) && !isNaN(r) && r > 0) {
      return Math.round(((r - b) / r) * 100).toString();
    }
    return '';
  };

  const getStatusFromStock = (stock: string, currentStatus: string) => {
    const s = parseInt(stock);
    if (isNaN(s)) return currentStatus;
    if (s === 0) return 'Out of Stock';
    if (s <= 100) return 'Low Stock';
    return currentStatus === 'Out of Stock' || currentStatus === 'Low Stock' ? 'Active' : currentStatus;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const margin = formData.margin || calcMargin(formData.basePrice, formData.retailPrice);

    const product: any = {
      name: formData.productName,
      sku: formData.sku,
      description: formData.description,
      vendor: formData.vendor,
      category: formData.category,
      vendorType: formData.vendorType,
      countryOfOrigin: formData.countryOfOrigin,
      brand: formData.brand,
      basePrice: formData.basePrice ? `$${formData.basePrice}` : '',
      retailPrice: formData.retailPrice ? `$${formData.retailPrice}` : '',
      margin: margin ? `${margin}%` : '',
      minOrder: parseInt(formData.minOrder) || 0,
      leadTime: formData.leadTime,
      inStock: parseInt(formData.inStock) || 0,
      priority: formData.priority,
      dueDate: formData.dueDate,
      status: formData.status,
      image: formData.image,
      subcategory,
      lastUpdated: new Date().toISOString().split('T')[0],
      ...(!productData?.id && { createdAt: new Date().toISOString() }),
    };

    try {
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };

    if (field === 'basePrice' || field === 'retailPrice') {
      const base = field === 'basePrice' ? value : formData.basePrice;
      const retail = field === 'retailPrice' ? value : formData.retailPrice;
      updated.margin = calcMargin(base, retail);
    }

    if (field === 'inStock') {
      updated.status = getStatusFromStock(value, updated.status);
    }

    setFormData(updated);
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
            <div className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 px-6 py-5 flex items-center justify-between shadow-xl shrink-0">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <Package className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-black text-white"
                  >
                    {productData?.id ? 'Edit Product' : 'Add Product'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-cyan-50 text-sm"
                  >
                    {productData?.id ? 'Update product information' : 'Add a new product to your catalog'}
                  </motion.p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 drawer-scroll">
              {/* Product Image Section */}
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
                  <input
                    type="file"
                    ref={fileInputRef}
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <label htmlFor="image-upload">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 cursor-pointer overflow-hidden shrink-0"
                    >
                      {isProcessingImage ? (
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-1" />
                          <p className="text-[10px] text-slate-400 font-medium">Processing...</p>
                        </div>
                      ) : uploadedImage || formData.image ? (
                        <img 
                          src={uploadedImage || formData.image} 
                          alt="Product preview" 
                          className="w-full h-full object-contain p-1"
                        />
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
                      onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isProcessingImage}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl cursor-pointer transition-all shadow-lg w-full disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {isProcessingImage ? 'Processing...' : 'Upload Product Image'}
                    </motion.button>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">Remove White Background</p>
                          <p className="text-[11px] text-slate-500">Auto-remove white backgrounds</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRemoveBackground(!removeBackground)}
                          className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                            removeBackground ? 'bg-cyan-600' : 'bg-slate-300'
                          }`}
                        >
                          <motion.div
                            animate={{ x: removeBackground ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                          />
                        </button>
                      </div>
                    </div>

                    {uploadedImage && (
                      <button
                        type="button"
                        onClick={() => { setUploadedImage(null); setFormData(prev => ({ ...prev, image: '' })); }}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Basic Information Section */}
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
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="Enter product name"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="HSV-001"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter product description..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none font-medium"
                    />
                  </div>

                  {/* Vendor and Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Vendor</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select vendor..."
                          value={formData.vendor}
                          onChange={(e) => handleInputChange('vendor', e.target.value)}
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
                              className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-52 overflow-y-auto dropdown-scroll"
                            >
                              {vendorsLoading ? (
                                <div className="px-4 py-3 text-center text-sm text-slate-400">Loading vendors...</div>
                              ) : filteredVendors.length === 0 ? (
                                <div className="px-4 py-3 text-center text-sm text-slate-400">No vendors found</div>
                              ) : (
                                filteredVendors.map((vendor, index) => (
                                  <motion.div
                                    key={vendor.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="px-4 py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 border-b border-slate-100 last:border-b-0 transition-all"
                                    onMouseDown={() => {
                                      handleInputChange('vendor', vendor.name);
                                      setSelectedVendorType(vendor.type);
                                      if (vendor.type && VENDOR_TYPES.includes(vendor.type)) {
                                        handleInputChange('vendorType', vendor.type);
                                      }
                                      setShowVendorDropdown(false);
                                    }}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                        {vendor.name?.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <span className="text-sm font-bold text-slate-900">{vendor.name}</span>
                                        <p className="text-xs text-slate-400">{vendor.type}</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Product Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium text-slate-900"
                        >
                          <span className={formData.category ? 'text-slate-900' : 'text-slate-400'}>{formData.category || 'Select category...'}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showCategoryDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto py-1">
                            {PRODUCT_CATEGORIES.map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  handleInputChange('category', cat);
                                  setSubcategory((CATEGORY_SUBCATEGORIES[cat] || [])[0] || '');
                                  setShowCategoryDropdown(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${formData.category === cat ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-700'}`}
                              >
                                <span>{cat}</span>
                                {formData.category === cat && (
                                  <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subcategory */}
                  {formData.category && CATEGORY_SUBCATEGORIES[formData.category] && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Subcategory</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium text-slate-900"
                        >
                          <span className={subcategory ? 'text-slate-900' : 'text-slate-400'}>{subcategory || 'Select subcategory...'}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showSubcategoryDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showSubcategoryDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto py-1">
                            {(CATEGORY_SUBCATEGORIES[formData.category] || []).map(sub => (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => {
                                  setSubcategory(sub);
                                  setShowSubcategoryDropdown(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${subcategory === sub ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-700'}`}
                              >
                                <span>{sub}</span>
                                {subcategory === sub && (
                                  <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vendor Type, Country of Origin, Brand */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Vendor Type</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowVendorTypeDropdown(!showVendorTypeDropdown)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium text-slate-900"
                        >
                          <span className={formData.vendorType ? 'text-slate-900' : 'text-slate-400'}>{formData.vendorType || 'Select type...'}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showVendorTypeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showVendorTypeDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto py-1">
                            {VENDOR_TYPES.map(vt => (
                              <button
                                key={vt}
                                type="button"
                                onClick={() => {
                                  handleInputChange('vendorType', vt);
                                  setShowVendorTypeDropdown(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${formData.vendorType === vt ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-700'}`}
                              >
                                <span>{vt}</span>
                                {formData.vendorType === vt && (
                                  <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Country of Origin</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowOriginDropdown(!showOriginDropdown)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium text-slate-900"
                        >
                          <span className={formData.countryOfOrigin ? 'text-slate-900' : 'text-slate-400'}>{formData.countryOfOrigin || 'Select origin...'}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showOriginDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showOriginDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto py-1">
                            {ORIGIN_COUNTRIES.map(country => (
                              <button
                                key={country}
                                type="button"
                                onClick={() => {
                                  handleInputChange('countryOfOrigin', country);
                                  setShowOriginDropdown(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${formData.countryOfOrigin === country ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-700'}`}
                              >
                                <span>{country}</span>
                                {formData.countryOfOrigin === country && (
                                  <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Brand</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="Enter brand name"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Pricing & Inventory Section - only for new products */}
              {!productData?.id && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-5 shadow-md border border-slate-200"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Pricing & Inventory</h3>
                </div>

                <div className="space-y-4">
                  <div className={`grid gap-4 ${isDistributor ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Base Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.basePrice}
                        onChange={(e) => handleInputChange('basePrice', e.target.value)}
                        placeholder="12.50"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                      />
                    </div>
                    {!isDistributor && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Retail Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.retailPrice}
                          onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                          placeholder="24.99"
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
                      <SearchableSelect
                        value={formData.status}
                        onChange={(val) => handleInputChange('status', val)}
                        options={[
                          { id: 'Active', label: 'Active' },
                          { id: 'Low Stock', label: 'Low Stock' },
                          { id: 'Out of Stock', label: 'Out of Stock' },
                          { id: 'Inactive', label: 'Inactive' },
                          { id: 'Discontinued', label: 'Discontinued' },
                          { id: 'Coming Soon', label: 'Coming Soon' },
                        ]}
                        placeholder="Select status..."
                        clearable={false}
                        searchable={false}
                      />
                    </div>
                  </div>

                  {!isDistributor && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Margin (%)</label>
                          <input
                            type="text"
                            value={formData.margin}
                            readOnly
                            placeholder="Auto-calculated"
                            className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-600 placeholder:text-slate-400 font-medium cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Min Order (units)</label>
                          <QuantityStepper
                            value={parseInt(formData.minOrder) || 0}
                            onChange={(val) => handleInputChange('minOrder', String(val))}
                            min={0}
                            wide
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Lead Time</label>
                          <input
                            type="text"
                            value={formData.leadTime}
                            onChange={(e) => handleInputChange('leadTime', e.target.value)}
                            placeholder="14-21 days"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">In Stock (units)</label>
                          <QuantityStepper
                            value={parseInt(formData.inStock) || 0}
                            onChange={(val) => handleInputChange('inStock', String(val))}
                            min={0}
                            wide
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {isDistributor && (
                    <p className="text-xs text-slate-400 italic">Distributor products only require base price and status.</p>
                  )}
                </div>
              </motion.div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-200 px-6 py-4 bg-white flex items-center justify-between gap-4 shadow-2xl shrink-0">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all shadow-sm"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Package className="w-4 h-4" /> {productData?.id ? 'Update Product' : 'Add Product'}</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
