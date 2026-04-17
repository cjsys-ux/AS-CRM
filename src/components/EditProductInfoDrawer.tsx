import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, ChevronDown, FileImage, Trash2, Check, AlertCircle, Link as LinkIcon, TrendingUp, Plus } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { statuses, productTypes } from '../utils/mockData';
import { createPortal } from 'react-dom';

// ── Size Variants Editor ──
const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

function SizeVariantsEditor({ sizes, onChange }: { sizes: string[]; onChange: (sizes: string[]) => void }) {
  const [customSize, setCustomSize] = useState('');

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      onChange(sizes.filter(s => s !== size));
    } else {
      onChange([...sizes, size]);
    }
  };

  const addCustomSize = () => {
    const trimmed = customSize.trim().toUpperCase();
    if (trimmed && !sizes.includes(trimmed)) {
      onChange([...sizes, trimmed]);
      setCustomSize('');
    }
  };

  const removeSize = (size: string) => {
    onChange(sizes.filter(s => s !== size));
  };

  return (
    <div className="space-y-2.5">
      {/* Common size quick-toggles */}
      <div className="flex flex-wrap gap-1.5">
        {COMMON_SIZES.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => toggleSize(size)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              sizes.includes(size)
                ? 'bg-indigo-100 text-indigo-700 border-indigo-300 ring-1 ring-indigo-200'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Custom size input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSize(); } }}
          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
          placeholder="Custom size (e.g. OSFA, 6, 7.5)"
        />
        <button
          type="button"
          onClick={addCustomSize}
          disabled={!customSize.trim()}
          className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Add
        </button>
      </div>

      {/* Selected sizes display */}
      {sizes.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-slate-500 mb-1.5">Selected ({sizes.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map(size => (
              <span key={size} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                {size}
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable portal-based dropdown for drawer fields ──
function DrawerDropdown({ value, onChange, options, placeholder, disabledOptions }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabledOptions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left"
      >
        <span className={`text-sm ${value ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {value || placeholder || 'Select...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
          className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-3 py-2.5 text-sm text-slate-400 text-center">No options available</div>
            ) : options.map((opt) => {
              const isDisabled = disabledOptions?.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { if (!isDisabled) { onChange(opt); setOpen(false); } }}
                  disabled={isDisabled}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                    isDisabled
                      ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                      : value === opt
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {opt}
                    {isDisabled && <AlertCircle className="w-3 h-3 text-slate-300" />}
                  </span>
                  {value === opt && !isDisabled && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

interface EditProductInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productInfo: {
    name: string;
    client: string;
    vendor: string;
    status: string;
    type: string;
    internalSKU: string;
    projectManager: string;
    htsCode?: string;
    htsRate?: string;
    htsBaseRate?: string;
    htsSection301?: boolean;
    sizeVariants?: string[];
    image: string;
    competitorName?: string;
    competitorLink?: string;
    competitorPrice?: string;
    artTemplate?: string;
    artTemplateName?: string;
  };
  onSave: (updatedInfo: any) => void;
  linkedVendors?: string[];
  checklistProgress?: { completed: number; total: number };
  onOpenLinkVendor?: () => void;
}

export function EditProductInfoDrawer({ isOpen, onClose, productId, productInfo, onSave, linkedVendors, checklistProgress, onOpenLinkVendor }: EditProductInfoDrawerProps) {
  const [formData, setFormData] = useState(productInfo);
  const [imagePreview, setImagePreview] = useState(productInfo.image);
  const [projectManagers, setProjectManagers] = useState<{id: string; name: string; role?: string}[]>([]);
  const [dbClients, setDbClients] = useState<any[]>([]);
  const [uploadedImageKey, setUploadedImageKey] = useState<string | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedArtTemplateKey, setUploadedArtTemplateKey] = useState<string | null>(null);
  const [resolvedArtTemplateUrl, setResolvedArtTemplateUrl] = useState<string | null>(null);
  const [isUploadingArtTemplate, setIsUploadingArtTemplate] = useState(false);
  const [artTemplateCleared, setArtTemplateCleared] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Determine if product has data (prevents going back to "New Product")
  const hasProductData = (() => {
    if (checklistProgress && checklistProgress.completed > 0) return true;
    if (productInfo.status !== 'New Product') return true;
    return false;
  })();

  // Compute disabled statuses
  const disabledStatuses = hasProductData ? ['New Product'] : [];

  // Fetch users and clients from DB
  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/users/list`);
        const data = await res.json();
        if (data.success && data.users) {
          setProjectManagers(data.users.map((u: any) => ({
            id: u.id || '',
            name: u.name || '',
            role: u.role || '',
          })));
        }
      } catch (err) {
        console.error('Error fetching users for PM dropdown:', err);
      }
    };
    const fetchClients = async () => {
      try {
        const res = await fetch(`/api/customers/list`);
        const data = await res.json();
        if (data.success) setDbClients(data.customers || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
    fetchUsers();
    fetchClients();
  }, [isOpen]);

  // Sync formData when productInfo changes (and reset transient upload state)
  useEffect(() => {
    setFormData(productInfo);
    setImagePreview(productInfo.image);
    setUploadedImageKey(null);
    setResolvedImageUrl(null);
    setIsUploadingImage(false);
    setUploadedArtTemplateKey(null);
    setResolvedArtTemplateUrl(null);
    setIsUploadingArtTemplate(false);
    setArtTemplateCleared(false);
    setSaveError(null);
  }, [productInfo]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] ?? '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setSaveError(null);
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          entityType: 'project',
          entityId: productId ?? 'unknown',
          fileData: base64,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to upload image.');
      }
      const { key, fileUrl } = await res.json();
      setUploadedImageKey(key);
      setResolvedImageUrl(fileUrl);
      setImagePreview(fileUrl);
      setFormData(prev => ({ ...prev, image: fileUrl }));
    } catch (err) {
      console.error('Image upload error:', err);
      setSaveError('Image upload failed. Other changes can still be saved.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleArtTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingArtTemplate(true);
    setSaveError(null);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          entityType: 'project-art-template',
          entityId: productId ?? 'unknown',
          fileData: base64,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to upload art template.');
      }
      const { key, fileUrl } = await res.json();
      setUploadedArtTemplateKey(key);
      setResolvedArtTemplateUrl(fileUrl);
      setArtTemplateCleared(false);
      setFormData(prev => ({ ...prev, artTemplate: fileUrl, artTemplateName: file.name }));
    } catch (err) {
      console.error('Art template upload error:', err);
      setSaveError('Art template upload failed. Other changes can still be saved.');
    } finally {
      setIsUploadingArtTemplate(false);
    }
  };

  const clearArtTemplate = () => {
    setUploadedArtTemplateKey(null);
    setResolvedArtTemplateUrl(null);
    setArtTemplateCleared(true);
    setFormData(prev => ({ ...prev, artTemplate: '', artTemplateName: '' }));
  };

  const handleSave = async () => {
    setSaveError(null);
    if (productId) {
      try {
        const payload: Record<string, unknown> = {
          id: productId,
          name: formData.name,
          client: formData.client,
          vendor: formData.vendor,
          status: formData.status,
          type: formData.type,
          internalSKU: formData.internalSKU,
          projectManager: formData.projectManager,
          competitorName: formData.competitorName,
          competitorLink: formData.competitorLink,
          competitorPrice: formData.competitorPrice,
          htsCode: formData.htsCode,
          htsRate: formData.htsRate,
          htsBaseRate: formData.htsBaseRate,
          htsSection301: formData.htsSection301,
          sizeVariants: formData.sizeVariants,
        };
        if (uploadedImageKey) {
          payload.imageKey = uploadedImageKey;
        }
        if (uploadedArtTemplateKey) {
          payload.artTemplateKey = uploadedArtTemplateKey;
          payload.artTemplateName = formData.artTemplateName ?? '';
        } else if (artTemplateCleared) {
          payload.artTemplateKey = '';
          payload.artTemplateName = '';
        }
        const res = await fetch('/api/projects/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to save changes.');
        }
      } catch (err) {
        console.error('Error saving product info:', err);
        setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
        return;
      }
    }
    onSave({
      ...formData,
      image: resolvedImageUrl ?? formData.image,
      ...(uploadedImageKey ? { imageKey: uploadedImageKey } : {}),
      artTemplate: artTemplateCleared ? '' : (resolvedArtTemplateUrl ?? formData.artTemplate),
    });
    onClose();
  };

  // Use linked vendors from vendor network, fallback to empty
  const vendorOptions = linkedVendors && linkedVendors.length > 0 ? linkedVendors : [];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer - scaled down from max-w-2xl to max-w-md */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header - compact */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-white">Edit Product Information</h2>
                <p className="text-xs text-slate-400 mt-0.5">Update product details and image</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content - tighter spacing */}
            <div className="flex-1 overflow-y-auto p-4 drawer-scroll">
              <div className="space-y-4">
                {/* Image Upload - compact */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Product Image</label>
                  <div className="flex gap-3">
                    <div className="relative w-28 h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="cursor-pointer border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all h-full flex flex-col items-center justify-center"
                        >
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <p className="text-xs font-medium text-slate-600">
                            {isUploadingImage ? 'Uploading…' : 'Click to upload image'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 10MB</p>
                        </motion.div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Client Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Client</label>
                  <DrawerDropdown
                    value={formData.client}
                    onChange={(v) => setFormData({ ...formData, client: v })}
                    options={dbClients.map(c => c.name)}
                    placeholder="Select a client"
                  />
                  <p className="text-[10px] text-blue-500 mt-1 font-medium">Linked to Customers module</p>
                </div>

                {/* Vendor Dropdown - only linked vendors */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vendor</label>
                  <DrawerDropdown
                    value={formData.vendor}
                    onChange={(v) => setFormData({ ...formData, vendor: v })}
                    options={vendorOptions}
                    placeholder={vendorOptions.length === 0 ? "No vendors linked yet" : "Select a vendor"}
                  />
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p className="text-[10px] text-blue-500 font-medium">
                      {vendorOptions.length > 0 ? `${vendorOptions.length} vendor${vendorOptions.length > 1 ? 's' : ''} linked` : 'Link a vendor to assign one here'}
                    </p>
                    {onOpenLinkVendor && (
                      <button
                        type="button"
                        onClick={() => { onOpenLinkVendor(); onClose(); }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          vendorOptions.length === 0
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        Link Vendor
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                  <DrawerDropdown
                    value={formData.status}
                    onChange={(v) => setFormData({ ...formData, status: v })}
                    options={statuses}
                    placeholder="Select status"
                    disabledOptions={disabledStatuses}
                  />
                  {hasProductData && (
                    <p className="text-[10px] text-amber-600 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Cannot revert to "New Product" — data exists
                    </p>
                  )}
                </div>

                {/* Type Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
                  <DrawerDropdown
                    value={formData.type}
                    onChange={(v) => setFormData({ ...formData, type: v })}
                    options={productTypes}
                    placeholder="Select type"
                  />
                </div>

                {/* Internal SKU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Internal SKU</label>
                  <input
                    type="text"
                    value={formData.internalSKU}
                    onChange={(e) => setFormData({ ...formData, internalSKU: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="Enter SKU"
                  />
                </div>

                {/* Project Manager Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Manager</label>
                  <DrawerDropdown
                    value={formData.projectManager}
                    onChange={(v) => setFormData({ ...formData, projectManager: v })}
                    options={projectManagers.map(pm => pm.name)}
                    placeholder="Select project manager"
                  />
                </div>

                {/* HTS Code & HTS Rate */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">HTS Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.htsCode || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setFormData({ ...formData, htsCode: val });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="e.g. 6307.90.9889"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Base Rate (%)</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formData.htsBaseRate || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setFormData({ ...formData, htsBaseRate: val });
                        }}
                        className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="e.g. 4.7"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Section 301 Tariff Toggle */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Section 301 Tariff</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Adds 25% on top of base rate</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, htsSection301: !formData.htsSection301 })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${formData.htsSection301 ? 'bg-red-500' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.htsSection301 ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {formData.htsBaseRate && (
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500">Total Duty Rate</span>
                      <span className="text-xs font-bold text-slate-900">
                        {formData.htsSection301
                          ? `${(parseFloat(formData.htsBaseRate) + 25).toFixed(1)}%`
                          : `${formData.htsBaseRate}%`
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Size Variants */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Size Variants</label>
                  <p className="text-[10px] text-slate-500 mb-2">Add sizes for apparel or sized products (e.g. XS, S, M, L, XL)</p>
                  <SizeVariantsEditor
                    sizes={formData.sizeVariants || []}
                    onChange={(sizes) => setFormData({ ...formData, sizeVariants: sizes })}
                  />
                </div>

                {/* Competitor Analysis */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Competitor Analysis</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Competitor Name</label>
                      <input
                        type="text"
                        value={formData.competitorName || ''}
                        onChange={(e) => setFormData({ ...formData, competitorName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="Enter competitor name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Competitor Link</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="url"
                          value={formData.competitorLink || ''}
                          onChange={(e) => setFormData({ ...formData, competitorLink: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          placeholder="competitor.com/product"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Competitor Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formData.competitorPrice || ''}
                          onChange={(e) => setFormData({ ...formData, competitorPrice: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          placeholder="9.99"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Art Template Section */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">Art Template</h3>
                  <p className="text-[10px] text-slate-500 mb-3">Upload a design template for Design Lab.</p>
                  
                  {formData.artTemplate ? (
                    <div className="space-y-2">
                      <div className="w-full h-28 bg-slate-50 rounded-lg overflow-hidden border border-indigo-200 flex items-center justify-center">
                        {(formData.artTemplate.startsWith('data:image') || formData.artTemplate.startsWith('http')) ? (
                          <img src={formData.artTemplate} alt="Art template" className="w-full h-full object-contain" />
                        ) : (
                          <FileImage className="w-8 h-8 text-indigo-300" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileImage className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="text-xs font-medium text-slate-700 truncate">{formData.artTemplateName || 'Template file'}</span>
                        </div>
                        <button
                          onClick={clearArtTemplate}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*,.ai,.eps,.pdf,.svg"
                        className="hidden"
                        onChange={handleArtTemplateUpload}
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                      >
                        <FileImage className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
                        <p className="text-xs font-medium text-slate-700">
                          {isUploadingArtTemplate ? 'Uploading…' : 'Upload Art Template'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, AI, EPS, PDF, SVG</p>
                      </motion.div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - compact */}
            <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex-shrink-0">
              {saveError && (
                <p className="text-red-600 text-xs font-medium mb-2">{saveError}</p>
              )}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isUploadingImage || isUploadingArtTemplate}
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImage || isUploadingArtTemplate ? 'Uploading…' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}