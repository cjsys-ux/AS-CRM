import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Upload, Mail, Phone, Globe, DollarSign, MapPin, Package, FileText, Image as ImageIcon, ChevronDown, Check, Loader2, Pencil, Search, Truck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CHINA_CITY_LIST } from './chinaCityData';

interface AddVendorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  vendorData?: {
    id?: string;
    name?: string;
    logo?: string;
    status?: string;
    contactName?: string;
    firstName?: string;
    lastName?: string;
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
    supportsDropShipping?: boolean;
  } | null;
}

const VENDOR_STATUSES = ['Active', 'Inactive', 'Pending'];
const VENDOR_TYPES = ['Product Distributor', 'Apparel Distributor', 'Promo Supplier', 'Product Manufacturer'];
const ACCOUNT_TYPES = ['Standalone', 'Parent Company', 'Subsidiary'];
const PAYMENT_TERMS = ['Prepaid', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', '30/70', '50/50'];
const COUNTRIES = ['United States', 'China', 'Vietnam', 'India'];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
];

// ─── Country-based dynamic location config ───
interface LocationConfig {
  regionLabel: string;
  regionPlaceholder: string;
  cityLabel: string;
  cityPlaceholder: string;
}

function getLocationConfig(country: string): LocationConfig {
  switch (country) {
    case 'China':
      return { regionLabel: 'Province', regionPlaceholder: 'Guangdong', cityLabel: 'City', cityPlaceholder: 'Shenzhen' };
    case 'Vietnam':
      return { regionLabel: 'Province', regionPlaceholder: 'Ho Chi Minh', cityLabel: 'City', cityPlaceholder: 'Ho Chi Minh City' };
    case 'India':
      return { regionLabel: 'State', regionPlaceholder: 'Maharashtra', cityLabel: 'City', cityPlaceholder: 'Mumbai' };
    case 'United States':
    default:
      return { regionLabel: 'State', regionPlaceholder: 'CA', cityLabel: 'City', cityPlaceholder: 'Los Angeles' };
  }
}

// ─── Phone formatting ───
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`;
}

// ─── Searchable City Dropdown (for China) ───
function SearchableCityDropdown({
  label,
  value,
  onChange,
  placeholder,
  accentColor = 'pink',
}: {
  label?: string;
  value: string;
  onChange: (city: string, province: string) => void;
  placeholder?: string;
  accentColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filtered = search
    ? CHINA_CITY_LIST.filter(c => c.city.toLowerCase().includes(search.toLowerCase()))
    : CHINA_CITY_LIST;

  const ringColor: Record<string, string> = {
    pink: 'ring-pink-500/30 border-pink-500',
    purple: 'ring-purple-500/30 border-purple-500',
  };

  return (
    <div>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => { setOpen(!open); setSearch(''); }}
          className={`w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 transition-all ${open ? `ring-2 ${ringColor[accentColor] || ringColor.pink}` : ''}`}
        >
          <span className={value ? 'text-slate-900' : 'text-slate-400'}>
            {value || placeholder || 'Select city'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
            >
              {/* Search input */}
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search cities..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500/30 focus:border-pink-400"
                  />
                </div>
              </div>
              {/* City list */}
              <div className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-400 text-center">No cities found</div>
                ) : (
                  filtered.slice(0, 100).map((entry) => (
                    <button
                      key={`${entry.city}-${entry.province}`}
                      type="button"
                      onClick={() => {
                        onChange(entry.city, entry.province);
                        setOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                        value === entry.city
                          ? 'bg-pink-50 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{entry.city}</span>
                        <span className="text-xs text-slate-400">{entry.province}</span>
                      </span>
                      {value === entry.city && <Check className="w-4 h-4 text-pink-600" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Custom Dropdown Component ───
function FormDropdown({
  label,
  required,
  value,
  options,
  onChange,
  placeholder,
  accentColor = 'purple',
  settingsNote,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  accentColor?: string;
  settingsNote?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ringColor: Record<string, string> = {
    purple: 'ring-purple-500/30 border-purple-500',
    green: 'ring-green-500/30 border-green-500',
    orange: 'ring-orange-500/30 border-orange-500',
    teal: 'ring-teal-500/30 border-teal-500',
    blue: 'ring-blue-500/30 border-blue-500',
    pink: 'ring-pink-500/30 border-pink-500',
  };

  const checkColor: Record<string, string> = {
    purple: 'text-purple-600', green: 'text-green-600', orange: 'text-orange-600',
    teal: 'text-teal-600', blue: 'text-blue-600', pink: 'text-pink-600',
  };

  const hoverColor: Record<string, string> = {
    purple: 'bg-purple-50', green: 'bg-green-50', orange: 'bg-orange-50',
    teal: 'bg-teal-50', blue: 'bg-blue-50', pink: 'bg-pink-50',
  };

  // Status badge colors
  const getStatusBadge = (opt: string) => {
    if (label !== 'Vendor Status') return null;
    const colors: Record<string, string> = {
      Active: 'bg-green-100 text-green-700',
      Inactive: 'bg-red-100 text-red-600',
      Pending: 'bg-amber-100 text-amber-700',
    };
    return colors[opt] || null;
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {settingsNote && (
          <span className="text-[10px] font-medium text-slate-400 ml-1.5">Manage in Settings</span>
        )}
      </label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 transition-all ${open ? `ring-2 ${ringColor[accentColor] || ringColor.purple}` : ''}`}
        >
          <span className={value ? 'text-slate-900' : 'text-slate-400'}>
            {value || placeholder || `Select ${label.toLowerCase()}`}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
            >
              <div className="py-1">
                {options.map((opt) => {
                  const badge = getStatusBadge(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { onChange(opt); setOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                        value === opt
                          ? `${hoverColor[accentColor] || hoverColor.purple} font-semibold`
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {badge ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>
                            {opt}
                          </span>
                        ) : (
                          opt
                        )}
                      </span>
                      {value === opt && <Check className={`w-4 h-4 ${checkColor[accentColor] || checkColor.purple}`} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Helper to split/join contact names ───
function splitContactName(contactName?: string) {
  if (!contactName) return { first: '', last: '' };
  const parts = contactName.trim().split(/\s+/);
  if (parts.length <= 1) return { first: parts[0] || '', last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export function AddVendorDrawer({ isOpen, onClose, vendorData, onSuccess }: AddVendorDrawerProps) {
  const [removeBackground, setRemoveBackground] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [productInput, setProductInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [fullContactMode, setFullContactMode] = useState(false); // Toggle between full contact and simplified mode
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initNames = splitContactName(vendorData?.contactName);

  const [formData, setFormData] = useState({
    vendorName: vendorData?.name || '',
    logo: vendorData?.logo || '',
    status: vendorData?.status || 'Active',
    firstName: vendorData?.firstName || initNames.first,
    lastName: vendorData?.lastName || initNames.last,
    email: vendorData?.email || '',
    phone: vendorData?.phone || '',
    wechatId: vendorData?.wechatId || '',
    vendorType: vendorData?.type || '',
    accountType: vendorData?.accountType || 'Standalone',
    website: vendorData?.website || '',
    paymentTerms: vendorData?.paymentTerms || '',
    accountNumber: vendorData?.accountNumber || '',
    country: vendorData?.country || '',
    fobCity: vendorData?.fobCity || '',
    fobState: vendorData?.fobState || '',
    productsSupplied: vendorData?.productsSupplied || [],
    notes: vendorData?.notes || '',
    supportsDropShipping: (vendorData as any)?.supportsDropShipping ?? true,
  });

  useEffect(() => {
    if (vendorData) {
      const names = splitContactName(vendorData.contactName);
      setFormData({
        vendorName: vendorData.name || '',
        logo: vendorData.logo || '',
        status: vendorData.status || 'Active',
        firstName: vendorData.firstName || names.first,
        lastName: vendorData.lastName || names.last,
        email: vendorData.email || '',
        phone: vendorData.phone || '',
        wechatId: vendorData.wechatId || '',
        vendorType: vendorData.type || '',
        accountType: vendorData.accountType || 'Standalone',
        website: vendorData.website || '',
        paymentTerms: vendorData.paymentTerms || '',
        accountNumber: vendorData.accountNumber || '',
        country: vendorData.country || '',
        fobCity: vendorData.fobCity || '',
        fobState: vendorData.fobState || '',
        productsSupplied: vendorData.productsSupplied || [],
        notes: vendorData.notes || '',
        supportsDropShipping: (vendorData as any)?.supportsDropShipping ?? true,
      });
      setUploadedLogo(vendorData.logo || null);
    } else {
      setFormData({
        vendorName: '', logo: '', status: 'Active', firstName: '', lastName: '',
        email: '', phone: '', wechatId: '', vendorType: '',
        accountType: 'Standalone', website: '', paymentTerms: '', accountNumber: '',
        country: '', fobCity: '', fobState: '', productsSupplied: [], notes: '',
        supportsDropShipping: true,
      });
      setUploadedLogo(null);
    }
  }, [vendorData, isOpen]);

  // ─── Image Upload with Background Removal ───
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsProcessingImage(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        let finalImage = base64String;

        if (removeBackground) {
          // Background-removal endpoint is not wired locally; fall back to original.
          toast.warning('Background removal unavailable — using original image');
        }

        setUploadedLogo(finalImage);
        setFormData(prev => ({ ...prev, logo: finalImage }));
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
    if (file) handleImageUpload(file);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddProduct = () => {
    if (productInput.trim()) {
      setFormData(prev => ({
        ...prev,
        productsSupplied: [...prev.productsSupplied, productInput.trim()]
      }));
      setProductInput('');
    }
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productsSupplied: prev.productsSupplied.filter((_, i) => i !== index)
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const contactName = [formData.firstName, formData.lastName].filter(Boolean).join(' ');
    // Payload uses current DB field names (vendorName, vendorType).
    const payload: Record<string, any> = {
      vendorName: formData.vendorName,
      status: formData.status,
      contactName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      wechatId: formData.wechatId,
      vendorType: formData.vendorType,
      accountType: formData.accountType,
      website: formData.website,
      paymentTerms: formData.paymentTerms,
      accountNumber: formData.accountNumber,
      country: formData.country,
      fobCity: formData.fobCity,
      fobState: formData.fobState,
      productsSupplied: formData.productsSupplied,
      notes: formData.notes,
      supportsDropShipping: formData.supportsDropShipping,
    };

    try {
      let savedId = vendorData?.id;
      if (vendorData?.id) {
        const response = await fetch('/api/vendors/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: vendorData.id, ...payload }),
        });
        if (!response.ok) throw new Error('Failed to update vendor');
        toast.success('Vendor updated successfully');
      } else {
        const response = await fetch('/api/vendors/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to create vendor');
        const data = await response.json();
        savedId = data.vendor?.id;
        toast.success('Vendor added successfully');
      }

      // Upload logo to S3 if a data-URL file was selected
      if (savedId && uploadedLogo && uploadedLogo.startsWith('data:')) {
        try {
          const [header, base64Data] = uploadedLogo.split(',');
          const fileType = header.match(/:(.*?);/)?.[1] ?? 'image/png';
          const uploadRes = await fetch('/api/files/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: 'logo.png', fileType, entityType: 'vendor-logo', entityId: savedId, fileData: base64Data }),
          });
          if (!uploadRes.ok) throw new Error('Upload failed');
          const { key } = await uploadRes.json();
          await fetch('/api/vendors/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: savedId, logoKey: key }),
          });
        } catch {
          toast.warning('Vendor saved, but logo could not be uploaded. Try editing the vendor to re-upload the logo.');
        }
      }

      onSuccess?.();
      onClose();
      if (!vendorData?.id) {
        setFormData({
          vendorName: '', logo: '', status: 'Active', firstName: '', lastName: '',
          email: '', phone: '', wechatId: '', vendorType: '',
          accountType: 'Standalone', website: '', paymentTerms: '', accountNumber: '',
          country: '', fobCity: '', fobState: '', productsSupplied: [], notes: '',
          supportsDropShipping: true,
        });
        setUploadedLogo(null);
      }
    } catch (err) {
      console.error('Error saving vendor:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save vendor');
    } finally {
      setIsSaving(false);
    }
  };

  const locationConfig = getLocationConfig(formData.country);

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
            className="fixed right-0 top-0 h-full w-full md:w-[520px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 px-5 py-4 flex items-center justify-between shadow-xl shrink-0">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Building2 className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {vendorData?.id ? 'Edit Vendor' : 'Add New Vendor'}
                  </h2>
                  <p className="text-purple-100 text-xs">
                    {vendorData?.id ? 'Update vendor information' : 'Add a new vendor to your database'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 drawer-scroll">
              <form id="vendor-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Vendor Logo */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Logo</label>
                  <div className="flex items-center gap-3">
                    {/* Logo Preview — display only, no click-to-upload */}
                    <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden shrink-0">
                      {isProcessingImage ? (
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                          <p className="text-[10px] text-slate-400 mt-1">Processing...</p>
                        </div>
                      ) : uploadedLogo || formData.logo ? (
                        <img
                          src={uploadedLogo || formData.logo}
                          alt="Vendor logo preview"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div className="flex-1 space-y-2">
                      <motion.button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isProcessingImage}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors border border-slate-300 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {isProcessingImage ? 'Processing...' : 'Upload Image'}
                      </motion.button>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 text-[11px]">Remove White Background</p>
                            <p className="text-[10px] text-slate-500">Auto-remove white backgrounds</p>
                          </div>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setRemoveBackground(!removeBackground)}
                            className={`relative w-11 h-6 rounded-full transition-all ${
                              removeBackground ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-slate-300'
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

                      {uploadedLogo && (
                        <button
                          type="button"
                          onClick={() => { setUploadedLogo(null); setFormData(prev => ({ ...prev, logo: '' })); }}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Vendor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Company name"
                        value={formData.vendorName}
                        onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        required
                      />
                    </div>

                    <FormDropdown
                      label="Vendor Status"
                      value={formData.status}
                      options={VENDOR_STATUSES}
                      onChange={(val) => setFormData({ ...formData, status: val })}
                      accentColor="purple"
                    />
                  </div>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700">Contact Information</label>
                    
                    {/* Toggle button */}
                    <button
                      type="button"
                      onClick={() => setFullContactMode(!fullContactMode)}
                      className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
                    >
                      {fullContactMode ? 'Simplified Mode' : 'Full Contact Details'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {fullContactMode ? (
                      <>
                        {/* Full Contact Mode */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                            <input
                              type="text"
                              placeholder="John"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                            <input
                              type="text"
                              placeholder="Doe"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                            <input
                              type="email"
                              placeholder="contact@vendor.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              placeholder="(555) 123 - 4567"
                              value={formData.phone}
                              onChange={handlePhoneChange}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">WeChat ID</label>
                          <input
                            type="text"
                            placeholder="WeChat ID"
                            value={formData.wechatId}
                            onChange={(e) => setFormData({ ...formData, wechatId: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Simplified Mode - Just Email and Website */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                          <input
                            type="email"
                            placeholder="contact@vendor.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                          />
                        </div>
                        
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-xs text-slate-500 italic">
                            Add full contact details later if the vendor doesn't have a dedicated contact person yet.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Business Details */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <FormDropdown
                        label="Vendor Type"
                        required
                        value={formData.vendorType}
                        options={VENDOR_TYPES}
                        onChange={(val) => setFormData({ ...formData, vendorType: val })}
                        placeholder="Select type"
                        accentColor="orange"
                        settingsNote="General Settings"
                      />
                      <FormDropdown
                        label="Account Type"
                        required
                        value={formData.accountType}
                        options={ACCOUNT_TYPES}
                        onChange={(val) => setFormData({ ...formData, accountType: val })}
                        accentColor="orange"
                      />
                    </div>

                    {formData.accountType === 'Standalone' && (
                      <p className="text-xs text-slate-500 italic">This is an independent vendor</p>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Website</label>
                      <input
                        type="text"
                        placeholder="www.vendor.com"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Financial Information */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="space-y-3">
                    <FormDropdown
                      label="Payment Terms"
                      value={formData.paymentTerms}
                      options={PAYMENT_TERMS}
                      onChange={(val) => setFormData({ ...formData, paymentTerms: val })}
                      placeholder="Select payment terms"
                      accentColor="teal"
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        placeholder="Enter account number (optional)"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Location Information */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="space-y-3">
                    <FormDropdown
                      label="Country"
                      value={formData.country}
                      options={COUNTRIES}
                      onChange={(val) => {
                        setFormData({ ...formData, country: val, fobCity: '', fobState: '' });
                      }}
                      placeholder="Select country"
                      accentColor="pink"
                      settingsNote="General Settings"
                    />

                    {formData.country && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            {locationConfig.cityLabel}
                          </label>
                          {formData.country === 'China' ? (
                            <SearchableCityDropdown
                              value={formData.fobCity}
                              onChange={(city, province) => setFormData({ ...formData, fobCity: city, fobState: province })}
                              placeholder={locationConfig.cityPlaceholder}
                              accentColor="pink"
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder={locationConfig.cityPlaceholder}
                              value={formData.fobCity}
                              onChange={(e) => setFormData({ ...formData, fobCity: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            {locationConfig.regionLabel}
                          </label>
                          {formData.country === 'China' ? (
                            <div className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed min-h-[36px] flex items-center">
                              {formData.fobState || <span className="text-slate-400">{locationConfig.regionPlaceholder}</span>}
                            </div>
                          ) : formData.country === 'United States' ? (
                            <FormDropdown
                              label=""
                              value={formData.fobState}
                              options={US_STATES}
                              onChange={(val) => setFormData({ ...formData, fobState: val })}
                              placeholder="Select state"
                              accentColor="pink"
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder={locationConfig.regionPlaceholder}
                              value={formData.fobState}
                              onChange={(e) => setFormData({ ...formData, fobState: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all"
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Products Supplied */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Products Supplied</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type product and press Enter"
                        value={productInput}
                        onChange={(e) => setProductInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); handleAddProduct(); }
                        }}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                      />
                      <motion.button
                        type="button"
                        onClick={handleAddProduct}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold shadow-md text-sm"
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
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-sm"
                          >
                            <span>{product}</span>
                            <motion.button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              whileHover={{ scale: 1.2 }}
                              className="text-indigo-500 hover:text-indigo-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Shipping Capabilities */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42 }}
                >

                  <div className={`p-4 rounded-xl border-2 transition-colors ${formData.supportsDropShipping ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${formData.supportsDropShipping ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                          <Truck className={`w-4.5 h-4.5 transition-colors ${formData.supportsDropShipping ? 'text-emerald-600' : 'text-amber-600'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Supports Drop Shipping</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formData.supportsDropShipping
                              ? 'Vendor ships directly to multiple destinations'
                              : 'POs will auto-split by destination for sample orders'}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData({ ...formData, supportsDropShipping: !formData.supportsDropShipping })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${formData.supportsDropShipping ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <motion.div
                          animate={{ x: formData.supportsDropShipping ? 22 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                  <textarea
                    placeholder="Additional notes about this vendor..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all resize-none"
                  />
                </motion.div>
              </form>
            </div>

            {/* Fixed Footer Buttons */}
            <div className="shrink-0 px-5 py-3 bg-white border-t border-slate-200 flex gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
                className="flex-1 px-5 py-2.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                form="vendor-form"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isSaving}
                className="flex-1 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  vendorData?.id ? 'Update Vendor' : 'Create Vendor'
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}