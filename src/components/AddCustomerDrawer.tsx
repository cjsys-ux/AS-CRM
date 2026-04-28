import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Upload, Globe, FileCheck, File, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { PhoneInput } from './PhoneInput';

// Upload a file to S3 via the local presign/complete endpoints and return the key.
async function uploadFileToS3(file: File, entityType: string, entityId: string): Promise<string | null> {
  try {
    const presignRes = await fetch('/api/files/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type, entityType, entityId }),
    });
    if (!presignRes.ok) return null;
    const { uploadUrl, key } = await presignRes.json();
    await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    await fetch('/api/files/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, fileName: file.name, fileType: file.type, size: file.size, entityType, entityId, uploadedBy: 'User' }),
    });
    return key;
  } catch {
    return null;
  }
}

interface AddCustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customerData?: {
    id?: string;
    name?: string;
    logo?: string;
    industry?: string;
    size?: string;
    status?: string;
    paymentTerms?: string;
    website?: string;
    phone?: string;
    resaleCert?: string;
  } | null;
}

const INDUSTRIES = [
  'Technology',
  'Retail',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Marketing',
  'Consulting',
  'E-commerce',
  'Hospitality',
  'Accounting',
  'Legal',
  'Construction',
  'Other'
];

const COMPANY_SIZES = [
  '1-10 (Micro)',
  '11-50 (Small)',
  '51-200 (Medium)',
  '201-500 (Large)',
  '500+ (Enterprise)'
];

const STATUSES = ['Active', 'Inactive', 'Pending'];

const PAYMENT_TERMS = [
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
  'Due on Receipt',
  'COD'
];

export function AddCustomerDrawer({ isOpen, onClose, customerData, onSuccess }: AddCustomerDrawerProps) {
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadedCertFile, setUploadedCertFile] = useState<{name: string; size: string} | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: customerData?.name || '',
    logo: customerData?.logo || '',
    industry: customerData?.industry || '',
    size: customerData?.size || '',
    status: customerData?.status || 'Active',
    paymentTerms: customerData?.paymentTerms || 'Net 30',
    website: customerData?.website || '',
    phone: customerData?.phone || '',
    hasResaleCert: customerData?.resaleCert ? customerData.resaleCert !== '—' : false,
    resaleCert: customerData?.resaleCert || '',
  });

  // Update form when customerData changes (for edit mode)
  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.name || '',
        logo: customerData.logo || '',
        industry: customerData.industry || '',
        size: customerData.size || '',
        status: customerData.status || 'Active',
        paymentTerms: customerData.paymentTerms || 'Net 30',
        website: customerData.website || '',
        phone: customerData.phone || '',
        hasResaleCert: customerData.resaleCert ? customerData.resaleCert !== '—' : false,
        resaleCert: customerData.resaleCert || '',
      });
      setUploadedLogo(customerData.logo || null);
    } else {
      // Reset for new customer
      setFormData({
        name: '',
        logo: '',
        industry: '',
        size: '',
        status: 'Active',
        paymentTerms: 'Net 30',
        website: '',
        phone: '',
        hasResaleCert: false,
        resaleCert: '',
      });
      setUploadedLogo(null);
    }
  }, [customerData, isOpen]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    setLogoFile(file);
    // Render a preview from the selected File so the UI shows the upload
    // immediately. The real upload to S3 happens on submit.
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setUploadedLogo(base64String);
      setFormData({ ...formData, logo: base64String });
      setIsProcessingImage(false);
      if (removeBackground) {
        toast.warning('Background removal unavailable — using original image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertFile(file);
      setUploadedCertFile({name: file.name, size: file.size.toString()});
      setFormData({ ...formData, resaleCert: file.name });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setIsSaving(true);

    try {
      // Strip any data-URL preview from the payload — only the S3-backed
      // logoKey/certKey persist for newly-uploaded files.
      const hasFreshLogo = !!logoFile;
      const hasFreshCert = !!certFile;
      const basePayload: Record<string, any> = {
        name: formData.name,
        industry: formData.industry || 'Not Specified',
        size: formData.size || 'Not Specified',
        status: formData.status,
        paymentTerms: formData.paymentTerms,
        website: formData.website || '—',
        phone: formData.phone || '—',
        resaleCert: formData.hasResaleCert,
      };
      if (!hasFreshLogo && formData.logo && !formData.logo.startsWith('data:')) {
        basePayload.logo = formData.logo;
      }

      let customerId = customerData?.id;
      if (customerId) {
        const res = await fetch('/api/customers/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: customerId, ...basePayload }),
        });
        if (!res.ok) throw new Error('Failed to update customer');
      } else {
        const res = await fetch('/api/customers/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(basePayload),
        });
        if (!res.ok) throw new Error('Failed to create customer');
        const data = await res.json();
        customerId = data.customer?.id;
      }

      if (customerId && hasFreshLogo && logoFile) {
        const key = await uploadFileToS3(logoFile, 'customer-logo', customerId);
        if (key) {
          await fetch('/api/customers/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: customerId, logoKey: key }),
          });
        }
      }

      if (customerId && hasFreshCert && certFile) {
        const key = await uploadFileToS3(certFile, 'customer-cert', customerId);
        if (key) {
          await fetch('/api/customers/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: customerId, certKey: key }),
          });
        }
      }

      toast.success(
        customerData?.id ? 'Customer updated successfully' : 'Customer created successfully',
        { description: `${formData.name} has been ${customerData?.id ? 'updated' : 'added'} to your database.` }
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full md:w-[520px] bg-white shadow-2xl z-[61] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-800 px-6 py-4 shadow-lg z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {customerData?.id ? 'Edit Customer' : 'New Customer'}
                    </h2>
                    <p className="text-blue-100 text-xs">
                      {customerData?.id 
                        ? 'Update customer information below'
                        : 'Add a new customer to your database. Fill out the details below.'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5">
              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Logo
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-16 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                    {isProcessingImage ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                        <p className="text-xs text-slate-500">Processing...</p>
                      </div>
                    ) : uploadedLogo || formData.logo ? (
                      <img src={uploadedLogo || formData.logo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={isProcessingImage}
                        />
                        <div className={`flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors border border-slate-300 ${isProcessingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Upload className="w-3.5 h-3.5" />
                          Upload Logo
                        </div>
                      </label>
                      {(uploadedLogo || formData.logo) && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setUploadedLogo(null);
                            setFormData({ ...formData, logo: '' });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors border border-red-200"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </motion.button>
                      )}
                    </div>
                    
                    {/* Remove Background Toggle */}
                    <div className="p-2.5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs mb-0.5">Remove White Background</p>
                          <p className="text-[10px] text-slate-600">Automatically make white backgrounds transparent</p>
                        </div>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRemoveBackground(!removeBackground)}
                          className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${
                            removeBackground ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg' : 'bg-slate-300'
                          }`}
                        >
                          <motion.div
                            animate={{ x: removeBackground ? 24 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Industry Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Industry
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                    onBlur={() => setTimeout(() => setShowIndustryDropdown(false), 200)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all flex items-center justify-between"
                  >
                    <span className={formData.industry ? 'text-slate-900' : 'text-slate-400'}>
                      {formData.industry || 'Select Industry'}
                    </span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showIndustryDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                      {INDUSTRIES.map((industry) => (
                        <button
                          key={industry}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, industry });
                            setShowIndustryDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Company Size Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Size
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                    onBlur={() => setTimeout(() => setShowSizeDropdown(false), 200)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all flex items-center justify-between"
                  >
                    <span className={formData.size ? 'text-slate-900' : 'text-slate-400'}>
                      {formData.size || 'Select Size'}
                    </span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSizeDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                      {COMPANY_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, size });
                            setShowSizeDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    onBlur={() => setTimeout(() => setShowStatusDropdown(false), 200)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all flex items-center justify-between"
                  >
                    <span className="text-slate-900">{formData.status}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, status });
                            setShowStatusDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Terms Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Terms
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                    onBlur={() => setTimeout(() => setShowPaymentDropdown(false), 200)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all flex items-center justify-between"
                  >
                    <span className="text-slate-900">{formData.paymentTerms}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showPaymentDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                      {PAYMENT_TERMS.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, paymentTerms: term });
                            setShowPaymentDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone
                </label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(v) => setFormData({ ...formData, phone: v })}
                  placeholder="(555) 123-4567"
                  className="flex items-stretch w-full bg-slate-50 border border-slate-200 rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all"
                />
              </div>

              {/* Has Resale Certificate Checkbox */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.hasResaleCert}
                      onChange={(e) => setFormData({ ...formData, hasResaleCert: e.target.checked })}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center ${
                      formData.hasResaleCert 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500' 
                        : 'border-slate-300 bg-slate-50'
                    }`}>
                      <svg
                        className={`w-3 h-3 text-white transition-opacity ${
                          formData.hasResaleCert ? 'opacity-100' : 'opacity-0'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      Has Resale Certificate?
                    </span>
                  </div>
                </label>
              </div>

              {/* Resale Certificate Upload */}
              {formData.hasResaleCert && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Resale Certificate
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                      {uploadedCertFile ? (
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <File className="w-6 h-6" />
                          <p className="text-[9px]">{uploadedCertFile.name}</p>
                        </div>
                      ) : (
                        <File className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleCertUpload}
                          className="hidden"
                        />
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors border border-slate-300">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Certificate
                        </div>
                      </label>
                      {uploadedCertFile && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setUploadedCertFile(null);
                            setFormData({ ...formData, resaleCert: '' });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors border border-red-200"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-3 border-t border-slate-100 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : customerData?.id ? 'Update Customer' : 'Add Customer'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}