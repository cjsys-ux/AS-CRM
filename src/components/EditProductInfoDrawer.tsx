import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, ChevronDown, FileImage, Trash2, Check, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { statuses, productTypes } from '../utils/mockData';
import { createPortal } from 'react-dom';

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
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
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
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
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
    image: string;
    competitorName?: string;
    competitorLink?: string;
    competitorPrice?: string;
    htsCode?: string;
    htsRate?: string;
  };
  onSave: (updatedInfo: any) => void;
  linkedVendors?: string[];
  checklistProgress?: { completed: number; total: number };
}

export function EditProductInfoDrawer({
  isOpen,
  onClose,
  productId,
  productInfo,
  onSave,
  linkedVendors = [],
  checklistProgress,
}: EditProductInfoDrawerProps) {
  const [formData, setFormData] = useState({ ...productInfo, artTemplate: '', artTemplateName: '', htsCode: productInfo.htsCode ?? '', htsRate: productInfo.htsRate ?? '' });
  const [imagePreview, setImagePreview] = useState(productInfo.image);
  const [uploadedImageKey, setUploadedImageKey] = useState<string | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dbClients, setDbClients] = useState<string[]>([]);
  const [dbProjectManagers, setDbProjectManagers] = useState<string[]>([]);

  const hasProductData = (checklistProgress && checklistProgress.completed > 0) || productInfo.status !== 'New Product';
  const disabledStatuses = hasProductData ? ['New Product'] : [];

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...productInfo, artTemplate: '', artTemplateName: '' });
      setImagePreview(productInfo.image);
      setUploadedImageKey(null);
      setResolvedImageUrl(null);
      setSaveError(null);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/customers/list')
      .then(r => r.json())
      .then(data => {
        const names = (data.customers ?? []).map((c: any) => c.name || c.companyName || '').filter(Boolean);
        setDbClients(names);
      })
      .catch(() => {});
    fetch('/api/users/list')
      .then(r => r.json())
      .then(data => {
        const names = (data.users ?? []).map((u: any) => u.name || (u.firstName ? `${u.firstName} ${u.lastName ?? ''}`.trim() : '')).filter(Boolean);
        setDbProjectManagers(names);
      })
      .catch(() => {});
  }, [isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setSaveError(null);
    setImagePreview(URL.createObjectURL(file));
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const uploadRes = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, entityType: 'project', entityId: productId ?? 'unknown', fileData: base64 }),
      });
      if (!uploadRes.ok) throw new Error('Failed to upload image.');
      const { key, fileUrl } = await uploadRes.json();
      setUploadedImageKey(key);
      setResolvedImageUrl(fileUrl);
      setImagePreview(fileUrl);
    } catch {
      setSaveError('Image upload failed. Other changes can still be saved.');
    } finally {
      setIsUploadingImage(false);
    }
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
        };
        if (uploadedImageKey) payload.imageKey = uploadedImageKey;
        const res = await fetch('/api/projects/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to save changes.');
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
        return;
      }
    }
    onSave({ ...formData, image: resolvedImageUrl ?? formData.image, ...(uploadedImageKey ? { imageKey: uploadedImageKey } : {}) });
    onClose();
  };

  const vendorOptions = linkedVendors.length > 0 ? linkedVendors : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-white">Edit Product Information</h2>
                <p className="text-xs text-slate-400 mt-0.5">Update product details and image</p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">

                {/* Image */}
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
                      <label className="block h-full">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="cursor-pointer border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all h-full flex flex-col items-center justify-center">
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <p className="text-xs font-medium text-slate-600">Click to upload image</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 10MB</p>
                        </motion.div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" placeholder="Enter product name" />
                </div>

                {/* Client */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Client</label>
                  <DrawerDropdown value={formData.client} onChange={(v) => setFormData({ ...formData, client: v })} options={dbClients} placeholder="Select a client" />
                  <p className="text-[10px] text-blue-500 mt-1 font-medium">Linked to Customers module</p>
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vendor</label>
                  <DrawerDropdown value={formData.vendor} onChange={(v) => setFormData({ ...formData, vendor: v })}
                    options={vendorOptions} placeholder={vendorOptions.length === 0 ? 'No vendors linked yet' : 'Select a vendor'} />
                  <p className="text-[10px] text-blue-500 mt-1 font-medium">
                    {vendorOptions.length > 0 ? `${vendorOptions.length} vendor${vendorOptions.length > 1 ? 's' : ''} linked` : 'Link vendors in Vendor Network tab'}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                  <DrawerDropdown value={formData.status} onChange={(v) => setFormData({ ...formData, status: v })}
                    options={statuses} placeholder="Select status" disabledOptions={disabledStatuses} />
                  {hasProductData && (
                    <p className="text-[10px] text-amber-600 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Cannot revert to "New Product" — data exists
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
                  <DrawerDropdown value={formData.type} onChange={(v) => setFormData({ ...formData, type: v })} options={productTypes} placeholder="Select type" />
                </div>

                {/* Internal SKU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Internal SKU</label>
                  <input type="text" value={formData.internalSKU} onChange={(e) => setFormData({ ...formData, internalSKU: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" placeholder="Enter SKU" />
                </div>

                {/* HTS Code + Rate */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">HTS Code</label>
                    <input type="text" value={formData.htsCode ?? ''} onChange={(e) => setFormData({ ...formData, htsCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" placeholder="e.g. 6307.90.9889" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">HTS Rate (%)</label>
                    <div className="relative">
                      <input type="text" value={formData.htsRate ?? ''} onChange={(e) => setFormData({ ...formData, htsRate: e.target.value })}
                        className="w-full px-3 py-2 pr-7 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" placeholder="e.g. 4.7" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                    </div>
                  </div>
                </div>

                {/* Project Manager */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Manager</label>
                  <DrawerDropdown value={formData.projectManager} onChange={(v) => setFormData({ ...formData, projectManager: v })}
                    options={dbProjectManagers} placeholder="Select project manager" />
                </div>

                {/* Art Template */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-xs font-bold text-slate-900 mb-1 uppercase tracking-wider">Art Template</h3>
                  <p className="text-[10px] text-slate-500 mb-3">Upload a design template for Design Lab.</p>
                  {formData.artTemplate ? (
                    <div className="space-y-2">
                      <div className="w-full h-24 bg-slate-50 rounded-lg overflow-hidden border border-indigo-200 flex items-center justify-center">
                        {formData.artTemplate.startsWith('data:image') || formData.artTemplate.startsWith('http') ? (
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
                        <button onClick={() => setFormData({ ...formData, artTemplate: '', artTemplateName: '' })} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block">
                      <input type="file" accept="image/*,.ai,.eps,.pdf,.svg" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFormData({ ...formData, artTemplate: reader.result as string, artTemplateName: file.name });
                            reader.readAsDataURL(file);
                          }
                        }} />
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="cursor-pointer border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                        <FileImage className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
                        <p className="text-xs font-medium text-slate-700">Upload Art Template</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, AI, EPS, PDF, SVG</p>
                      </motion.div>
                    </label>
                  )}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex-shrink-0">
              {saveError && <p className="text-red-600 text-xs font-medium mb-2">{saveError}</p>}
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all text-sm">
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={isUploadingImage}
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-lg text-sm disabled:opacity-50">
                  {isUploadingImage ? 'Uploading...' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
