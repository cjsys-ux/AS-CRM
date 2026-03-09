import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Upload, Mail, Phone, Globe, DollarSign, MapPin, Package, FileText, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';


interface AddVendorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productId?: string;
  mode?: 'standalone' | 'pipeline';
  vendorData?: {
    id?: string;
    name?: string;
    logo?: string;
    status?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    wechatId?: string;
    type?: string;
    accountType?: string;
    website?: string;
    paymentTerms?: string;
    accountNumber?: string;
    country?: string;
    fobCity?: string;
    fobState?: string;
    productsSupplied?: string[];
    notes?: string;
  } | null;
}

const VENDOR_STATUSES = ['Active', 'Inactive', 'Pending'];
const VENDOR_TYPES = ['Distributor', 'Product Manufacturer', 'Service Provider', 'Wholesale Supplier'];
const ACCOUNT_TYPES = ['Standalone', 'Parent Company', 'Subsidiary'];
const PAYMENT_TERMS = ['Net 30', 'Net 60', 'Net 90', 'Prepaid', 'COD', '2/10 Net 30'];

export function AddVendorDrawer({ isOpen, onClose, vendorData, onSuccess, productId, mode = 'standalone' }: AddVendorDrawerProps) {
  const [removeBackground, setRemoveBackground] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [productInput, setProductInput] = useState('');
  
  const [formData, setFormData] = useState({
    vendorName: vendorData?.name || '',
    logo: vendorData?.logo || '',
    status: vendorData?.status || 'Active',
    contactName: vendorData?.contactName || '',
    email: vendorData?.email || '',
    phone: vendorData?.phone || '',
    wechatId: vendorData?.wechatId || '',
    vendorType: vendorData?.type || 'Distributor',
    accountType: vendorData?.accountType || 'Standalone',
    website: vendorData?.website || '',
    paymentTerms: vendorData?.paymentTerms || '',
    accountNumber: vendorData?.accountNumber || '',
    country: vendorData?.country || '',
    fobCity: vendorData?.fobCity || '',
    fobState: vendorData?.fobState || '',
    productsSupplied: vendorData?.productsSupplied || [],
    notes: vendorData?.notes || '',
  });

  // Update form when vendorData changes (for edit mode)
  useEffect(() => {
    if (vendorData) {
      setFormData({
        vendorName: vendorData.name || '',
        logo: vendorData.logo || '',
        status: vendorData.status || 'Active',
        contactName: vendorData.contactName || '',
        email: vendorData.email || '',
        phone: vendorData.phone || '',
        wechatId: vendorData.wechatId || '',
        vendorType: vendorData.type || 'Distributor',
        accountType: vendorData.accountType || 'Standalone',
        website: vendorData.website || '',
        paymentTerms: vendorData.paymentTerms || '',
        accountNumber: vendorData.accountNumber || '',
        country: vendorData.country || '',
        fobCity: vendorData.fobCity || '',
        fobState: vendorData.fobState || '',
        productsSupplied: vendorData.productsSupplied || [],
        notes: vendorData.notes || '',
      });
      setUploadedLogo(vendorData.logo || null);
    } else {
      // Reset to empty for new vendor
      setFormData({
        vendorName: '',
        logo: '',
        status: 'Active',
        contactName: '',
        email: '',
        phone: '',
        wechatId: '',
        vendorType: 'Distributor',
        accountType: 'Standalone',
        website: '',
        paymentTerms: '',
        accountNumber: '',
        country: '',
        fobCity: '',
        fobState: '',
        productsSupplied: [],
        notes: '',
      });
      setUploadedLogo(null);
    }
  }, [vendorData, isOpen]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsProcessingImage(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Use original image
        setUploadedLogo(base64String);
        setFormData(prev => ({ ...prev, logo: base64String }));
        
        setIsProcessingImage(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setIsProcessingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAddProduct = () => {
    if (productInput.trim()) {
      setFormData({
        ...formData,
        productsSupplied: [...formData.productsSupplied, productInput.trim()]
      });
      setProductInput('');
    }
  };

  const handleRemoveProduct = (index: number) => {
    setFormData({
      ...formData,
      productsSupplied: formData.productsSupplied.filter((_, i) => i !== index)
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'pipeline' && !productId) {
      toast.error('Product ID is missing');
      return;
    }
    setIsSubmitting(true);
    try {
      const createUrl = mode === 'standalone' ? '/api/vendors/create' : '/api/pipeline/vendors/create';
      const updateUrl = mode === 'standalone' ? '/api/vendors/update' : '/api/pipeline/vendors/update';
      const { logo: _logo, ...formDataWithoutLogo } = formData;
      const payload = mode === 'standalone'
        ? formDataWithoutLogo
        : { productId, ...formDataWithoutLogo };

      let savedId = vendorData?.id;
      if (vendorData?.id) {
        const res = await fetch(updateUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: vendorData.id, ...formDataWithoutLogo }),
        });
        if (!res.ok) throw new Error('Failed to update vendor');
        toast.success('Vendor updated successfully');
      } else {
        const res = await fetch(createUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create vendor');
        const data = await res.json();
        savedId = data.vendor?.id;
        toast.success('Vendor added successfully');
      }

      // Upload logo to S3 if a file was selected (standalone mode)
      if (mode === 'standalone' && savedId && uploadedLogo && uploadedLogo.startsWith('data:')) {
        // Convert base64 to File for upload - fetch the data URI
        try {
          const blob = await fetch(uploadedLogo).then(r => r.blob());
          const file = new File([blob], 'logo.png', { type: blob.type });
          const presignRes = await fetch('/api/files/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: 'logo.png', fileType: file.type, entityType: 'vendor-logo', entityId: savedId }),
          });
          if (presignRes.ok) {
            const { uploadUrl, key } = await presignRes.json();
            await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
            await fetch('/api/files/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key, fileName: 'logo.png', fileType: file.type, size: file.size, entityType: 'vendor-logo', entityId: savedId, uploadedBy: 'User' }),
            });
            await fetch(updateUrl, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: savedId, logoKey: key }),
            });
          }
        } catch {
          toast.warning('Vendor saved, but logo could not be uploaded. Try editing the vendor to re-upload the logo.');
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save vendor');
    } finally {
      setIsSubmitting(false);
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
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 px-8 py-8 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <Building2 className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-white mb-1"
                  >
                    {vendorData?.id ? 'Edit Vendor' : 'Add New Vendor'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-purple-50 font-medium"
                  >
                    Add a new vendor to your database
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vendor Logo */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Vendor Logo</h3>
                  </div>

                  <div className="flex items-start gap-6">
                    {/* Logo Preview */}
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <label htmlFor="logo-upload">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="w-40 h-40 border-3 border-dashed border-slate-300 rounded-3xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner cursor-pointer overflow-hidden p-3"
                      >
                        {uploadedLogo || formData.logo ? (
                          <img
                            src={uploadedLogo || formData.logo}
                            alt="Vendor logo preview"
                            className="w-full h-full object-contain"
                          />
                        ) : isProcessingImage ? (
                          <div className="text-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"
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
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isProcessingImage}
                        className="flex items-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 rounded-2xl font-bold text-white transition-all mb-6 shadow-xl w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-5 h-5" />
                        {isProcessingImage ? 'Processing Image...' : 'Upload Image'}
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
                              removeBackground ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg' : 'bg-slate-300'
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
                        Vendor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Company name"
                        value={formData.vendorName}
                        onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Vendor Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                      >
                        {VENDOR_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Contact Information</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="contact@vendor.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        WeChat ID
                      </label>
                      <input
                        type="text"
                        placeholder="WeChat ID"
                        value={formData.wechatId}
                        onChange={(e) => setFormData({ ...formData, wechatId: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Business Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Business Details</h3>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Vendor Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.vendorType}
                          onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                          required
                        >
                          {VENDOR_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Account Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.accountType}
                          onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                          required
                        >
                          {ACCOUNT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.accountType === 'Standalone' && (
                      <p className="text-xs text-slate-500 italic">This is an independent vendor</p>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        placeholder="https://vendor.com"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Financial Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Financial Information</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Payment Terms
                      </label>
                      <select
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                      >
                        <option value="">Select payment terms</option>
                        {PAYMENT_TERMS.map((term) => (
                          <option key={term} value={term}>
                            {term}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter account number (optional)"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Location Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Location Information</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        placeholder="United States"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          FOB City
                        </label>
                        <input
                          type="text"
                          placeholder="Los Angeles"
                          value={formData.fobCity}
                          onChange={(e) => setFormData({ ...formData, fobCity: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          FOB State
                        </label>
                        <input
                          type="text"
                          placeholder="CA"
                          value={formData.fobState}
                          onChange={(e) => setFormData({ ...formData, fobState: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Products Supplied */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Products Supplied</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Type product and press Enter"
                        value={productInput}
                        onChange={(e) => setProductInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddProduct();
                          }
                        }}
                        className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
                      />
                      <motion.button
                        type="button"
                        onClick={handleAddProduct}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                      >
                        +
                      </motion.button>
                    </div>

                    {formData.productsSupplied.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.productsSupplied.map((product, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-semibold"
                          >
                            <span className="text-sm">{product}</span>
                            <motion.button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-indigo-500 hover:text-indigo-700"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Notes</h3>
                  </div>

                  <textarea
                    placeholder="Additional notes about this vendor..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all resize-none font-medium"
                  />
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex gap-4 sticky bottom-0 bg-slate-50 py-6 -mx-8 px-8 border-t-2 border-slate-200"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-8 py-5 bg-white border-2 border-slate-300 hover:bg-slate-100 rounded-2xl font-black text-slate-700 text-lg transition-all shadow-lg"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-8 py-5 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-2xl font-black text-white text-lg shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : vendorData?.id ? 'Update Vendor' : 'Create Vendor'}
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
