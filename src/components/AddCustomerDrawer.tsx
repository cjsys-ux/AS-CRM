import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Upload, Globe, Phone, FileCheck, File, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';


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
  const [uploadedCertFile, setUploadedCertFile] = useState<{name: string; size: string} | null>(null);
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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedLogo(result);
        setFormData({ ...formData, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedCertFile({name: file.name, size: file.size.toString()});
      setFormData({ ...formData, resaleCert: file.name });
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (xxx) xxx-xxxx
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setIsSaving(true);

    try {
      const customerPayload = {
        name: formData.name,
        logo: uploadedLogo || formData.logo || '',
        industry: formData.industry || 'Not Specified',
        size: formData.size || 'Not Specified',
        status: formData.status,
        paymentTerms: formData.paymentTerms,
        website: formData.website || '—',
        phone: formData.phone || '—',
        resaleCert: formData.hasResaleCert ? (formData.resaleCert || 'Pending') : '—',
        spend: 0,
      };

      toast.success(
        customerData?.id ? 'Customer updated successfully' : 'Customer created successfully',
        {
          description: `${formData.name} has been ${customerData?.id ? 'updated' : 'added'} to your database.`,
        }
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-[61] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-800 px-8 py-6 shadow-lg z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                  >
                    <Building2 className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {customerData?.id ? 'Edit Customer' : 'New Customer'}
                    </h2>
                    <p className="text-blue-100 text-sm">
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
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-28 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                    {uploadedLogo || formData.logo ? (
                      <img src={uploadedLogo || formData.logo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors border border-slate-300">
                        <Upload className="w-4 h-4" />
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
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors border border-red-200"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Industry Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Industry
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                    onBlur={() => setTimeout(() => setShowIndustryDropdown(false), 200)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-left text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all flex items-center justify-between"
                  >
                    <span className={formData.industry ? 'text-slate-900' : 'text-slate-400'}>
                      {formData.industry || 'Select Industry'}
                    </span>
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showIndustryDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                      {INDUSTRIES.map((industry) => (
                        <button
                          key={industry}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, industry });
                            setShowIndustryDropdown(false);
                          }}
                          className="w-full px-5 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Company Size
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                    onBlur={() => setTimeout(() => setShowSizeDropdown(false), 200)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-left text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all flex items-center justify-between"
                  >
                    <span className={formData.size ? 'text-slate-900' : 'text-slate-400'}>
                      {formData.size || 'Select Size'}
                    </span>
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSizeDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                      {COMPANY_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, size });
                            setShowSizeDropdown(false);
                          }}
                          className="w-full px-5 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    onBlur={() => setTimeout(() => setShowStatusDropdown(false), 200)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-left text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all flex items-center justify-between"
                  >
                    <span className="text-slate-900">{formData.status}</span>
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, status });
                            setShowStatusDropdown(false);
                          }}
                          className="w-full px-5 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Payment Terms
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                    onBlur={() => setTimeout(() => setShowPaymentDropdown(false), 200)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-left text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all flex items-center justify-between"
                  >
                    <span className="text-slate-900">{formData.paymentTerms}</span>
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showPaymentDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                      {PAYMENT_TERMS.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, paymentTerms: term });
                            setShowPaymentDropdown(false);
                          }}
                          className="w-full px-5 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Has Resale Certificate Checkbox */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.hasResaleCert}
                      onChange={(e) => setFormData({ ...formData, hasResaleCert: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-slate-300 rounded-lg bg-slate-50 peer-checked:bg-gradient-to-br peer-checked:from-blue-500 peer-checked:to-indigo-600 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      Has Resale Certificate?
                    </span>
                  </div>
                </label>
              </div>

              {/* Resale Certificate Upload */}
              {formData.hasResaleCert && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Resale Certificate
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                      {uploadedCertFile ? (
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <File className="w-8 h-8" />
                          <p className="text-xs">{uploadedCertFile.name}</p>
                        </div>
                      ) : (
                        <File className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleCertUpload}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors border border-slate-300">
                          <Upload className="w-4 h-4" />
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
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors border border-red-200"
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
              <div className="flex gap-3 pt-6 sticky bottom-0 bg-white pb-4 border-t-2 border-slate-100 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : customerData?.id ? 'Update Customer' : 'Add Customer'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}