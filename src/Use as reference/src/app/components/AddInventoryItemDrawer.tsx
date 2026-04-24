import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Edit, ChevronDown, Search, Check, Building2, User, Upload, ImageIcon, Trash2, Tag } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { QuantityStepper } from './QuantityStepper';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

export interface InventoryFormData {
  sku: string;
  customer: string;
  productName: string;
  imageUrl: string;
  quantity: string;
  reorderLevel: string;
  unitCost: string;
  unitPrice: string;
  supplier: string;
  location: string;
  lastRestocked: string;
  notes: string;
  orderDate: string;
  shippingCost: string;
  paymentTerms: string;
  paymentDate: string;
  paymentAmount: string;
  category: string;
  itemType: string;
  productTags: string[];
}

export interface InventoryItemData {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  supplier: string;
  costPerUnit: string;
  location: string;
  lastRestocked: string;
  imageUrl?: string;
  customer?: string;
  unitPrice?: string;
  notes?: string;
  orderDate?: string;
  shippingCost?: string;
  paymentTerms?: string;
  paymentDate?: string;
  paymentAmount?: string;
  itemType?: string;
  productTags?: string[];
}

interface AddInventoryItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: InventoryItemData | null;
  onSuccess?: () => void;
  onSave?: (data: InventoryFormData, isEdit: boolean) => void;
}

const defaultFormData: InventoryFormData = {
  sku: '',
  customer: '',
  productName: '',
  imageUrl: '',
  quantity: '',
  reorderLevel: '',
  unitCost: '',
  unitPrice: '',
  supplier: '',
  location: '',
  lastRestocked: '',
  notes: '',
  orderDate: '',
  shippingCost: '',
  paymentTerms: 'Due on Receipt',
  paymentDate: '',
  paymentAmount: '',
  category: '',
  itemType: '',
  productTags: [],
};

const categories = [
  'Apparel', 'Drinkware', 'Office Supplies', 'Bags', 'Accessories', 'Tech',
  'Writing', 'Outdoor', 'Wellness', 'Packaging', 'Received Goods', 'Competitor Sample', 'Pre-Production Sample'
];

const locations = [
  'Warehouse A', 'Warehouse A - Aisle 1', 'Warehouse A - Aisle 2', 'Warehouse A - Aisle 3',
  'Warehouse B', 'Warehouse B - Aisle 1', 'Warehouse B - Aisle 2',
  'Warehouse C', 'Warehouse C - Aisle 1',
  'Showroom', 'Staging Area', 'Returns Processing'
];

// Searchable dropdown component
function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder,
  required,
  loading,
  searchable = true,
  icon,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string; subtitle?: string }[];
  placeholder: string;
  required?: boolean;
  loading?: boolean;
  searchable?: boolean;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.subtitle || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className={`w-full flex items-center gap-2 px-4 py-3 bg-white border-2 rounded-xl text-left transition-all ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <span className={`flex-1 text-sm truncate ${value ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border-2 border-slate-200 shadow-xl overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            )}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No results</div>
              ) : (
                filtered.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2 transition-colors ${
                      value === opt.value
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${value === opt.value ? 'font-semibold' : 'font-medium'}`}>{opt.label}</p>
                      {opt.subtitle && <p className="text-xs text-slate-400 truncate">{opt.subtitle}</p>}
                    </div>
                    {value === opt.value && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageUploadField({ imageUrl, onImageChange }: { imageUrl: string; onImageChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload/inventory-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onImageChange(data.url);
        toast.success('Image uploaded successfully');
      } else {
        console.error('Upload failed:', data.error);
        toast.error(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  }, [onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input so the same file can be re-selected
    if (e.target) e.target.value = '';
  }, [handleUpload]);

  const handleRemove = useCallback(() => {
    onImageChange('');
  }, [onImageChange]);

  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-500" />
          Product Image
        </div>
      </label>

      {imageUrl ? (
        <div className="relative group">
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3 flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
              <img
                src={imageUrl}
                alt="Product"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Image uploaded</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{imageUrl.length > 50 ? imageUrl.slice(0, 50) + '...' : imageUrl}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Replace
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            uploading
              ? 'border-indigo-300 bg-indigo-50/50 cursor-wait'
              : dragActive
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20'
              : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
              <p className="text-sm font-semibold text-indigo-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Drop an image here, or <span className="text-indigo-600">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF, or WebP — Max 5MB</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AddInventoryItemDrawer({ isOpen, onClose, editItem, onSuccess, onSave }: AddInventoryItemDrawerProps) {
  const [formData, setFormData] = useState<InventoryFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<{ label: string; value: string; subtitle?: string }[]>([]);
  const [vendors, setVendors] = useState<{ label: string; value: string; subtitle?: string }[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const isEdit = !!editItem;

  // Fetch customers and vendors when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await fetch(`${API_URL}/customers`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        });
        const data = await res.json();
        if (data.success) {
          const opts = [
            { label: 'Activate Swag (Internal)', value: 'Activate Swag', subtitle: 'Internal inventory' },
            ...data.customers.map((c: any) => ({
              label: c.name || c.company || c.id,
              value: c.name || c.company || c.id,
              subtitle: c.company && c.company !== c.name ? c.company : (c.email || ''),
            })),
          ];
          setCustomers(opts);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoadingCustomers(false);
      }
    };

    const fetchVendors = async () => {
      setLoadingVendors(true);
      try {
        const res = await fetch(`${API_URL}/vendors`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        });
        const data = await res.json();
        if (data.success) {
          const opts = data.vendors.map((v: any) => ({
            label: v.name || v.company || v.id,
            value: v.name || v.company || v.id,
            subtitle: v.category || v.email || '',
          }));
          setVendors(opts);
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchCustomers();
    fetchVendors();
  }, [isOpen]);

  useEffect(() => {
    if (editItem) {
      setFormData({
        sku: editItem.sku || '',
        customer: editItem.customer || '',
        productName: editItem.name || '',
        imageUrl: editItem.imageUrl || '',
        quantity: String(editItem.quantity || ''),
        reorderLevel: String(editItem.minStock || ''),
        unitCost: (editItem.costPerUnit || '').replace('$', ''),
        unitPrice: (editItem.unitPrice || '').replace('$', ''),
        supplier: editItem.supplier || '',
        location: editItem.location || '',
        lastRestocked: editItem.lastRestocked || '',
        notes: editItem.notes || '',
        orderDate: editItem.orderDate || '',
        shippingCost: editItem.shippingCost || '',
        paymentTerms: editItem.paymentTerms || 'Due on Receipt',
        paymentDate: editItem.paymentDate || '',
        paymentAmount: editItem.paymentAmount || '',
        category: editItem.category || '',
        itemType: editItem.itemType || '',
        productTags: editItem.productTags || [],
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [editItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (onSave) {
      onSave(formData, isEdit);
      onClose();
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.productName,
        sku: formData.sku,
        category: formData.category || 'Uncategorized',
        quantity: parseInt(formData.quantity) || 0,
        minStock: parseInt(formData.reorderLevel) || 0,
        unit: 'pcs',
        supplier: formData.supplier,
        costPerUnit: formData.unitCost ? `$${parseFloat(formData.unitCost).toFixed(2)}` : '$0.00',
        unitPrice: formData.unitPrice ? `$${parseFloat(formData.unitPrice).toFixed(2)}` : '$0.00',
        location: formData.location,
        lastRestocked: formData.lastRestocked || new Date().toISOString().split('T')[0],
        imageUrl: formData.imageUrl,
        customer: formData.customer,
        notes: formData.notes,
        orderDate: formData.orderDate,
        shippingCost: formData.shippingCost,
        paymentTerms: formData.paymentTerms,
        paymentDate: formData.paymentDate,
        paymentAmount: formData.paymentAmount,
        itemType: formData.itemType,
        productTags: formData.productTags,
      };

      let response: Response;
      if (isEdit && editItem) {
        response = await fetch(`${API_URL}/inventory/${editItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_URL}/inventory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (data.success) {
        toast.success(isEdit ? 'Item updated successfully' : 'Item added successfully');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        console.error('Error saving inventory item:', data.error);
        toast.error(`Failed to ${isEdit ? 'update' : 'add'} item: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast.error(`Error ${isEdit ? 'updating' : 'adding'} item`);
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof InventoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categoryOptions = categories.map(c => ({ label: c, value: c }));
  const locationOptions = locations.map(l => ({ label: l, value: l }));
  const paymentTermsOptions = [
    'Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', '2/10 Net 30'
  ].map(t => ({ label: t, value: t }));

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer — narrower to match the screenshot */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[480px] bg-slate-50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className={`px-6 py-5 flex items-center justify-between shadow-lg shrink-0 ${
              isEdit
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600'
            }`}>
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center"
                >
                  {isEdit ? <Edit className="w-6 h-6 text-white" /> : <Package className="w-6 h-6 text-white" />}
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isEdit ? 'Edit Inventory Item' : 'New Inventory Item'}
                  </h2>
                  <p className={`text-xs ${isEdit ? 'text-amber-100' : 'text-indigo-100'}`}>
                    {isEdit ? `Editing ${editItem?.sku || editItem?.name}` : 'Add a new item to inventory'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto drawer-scroll">
              <div className="p-6 space-y-5">
                {isEdit && editItem && (
                  <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-3">
                    {editItem.imageUrl ? (
                      <img src={editItem.imageUrl} alt={editItem.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm text-slate-900">{editItem.name}</p>
                      <p className="text-xs font-mono text-slate-500">{editItem.sku}</p>
                    </div>
                  </div>
                )}

                {/* SKU & Customer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => update('sku', e.target.value)}
                      placeholder="1234"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Customer
                    </label>
                    <SearchableDropdown
                      value={formData.customer}
                      onChange={(val) => update('customer', val)}
                      options={customers}
                      placeholder="Select customer..."
                      loading={loadingCustomers}
                      icon={<User className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Product Name & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => update('productName', e.target.value)}
                      placeholder="Branded T-Shirt"
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <SearchableDropdown
                      value={formData.category}
                      onChange={(val) => update('category', val)}
                      options={categoryOptions}
                      placeholder="Select category..."
                      searchable={false}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <ImageUploadField
                  imageUrl={formData.imageUrl}
                  onImageChange={(url) => update('imageUrl', url)}
                />

                {/* Quantity & Reorder Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <QuantityStepper
                      value={parseInt(formData.quantity) || 0}
                      onChange={(val) => update('quantity', String(val))}
                      min={0}
                      wide
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Reorder Level <span className="text-red-500">*</span>
                    </label>
                    <QuantityStepper
                      value={parseInt(formData.reorderLevel) || 0}
                      onChange={(val) => update('reorderLevel', String(val))}
                      min={0}
                      wide
                    />
                  </div>
                </div>

                {/* Unit Cost & Unit Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Unit Cost <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.unitCost}
                        onChange={(e) => update('unitCost', e.target.value)}
                        placeholder="15.00"
                        required
                        className="w-full pl-8 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Unit Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.unitPrice}
                        onChange={(e) => update('unitPrice', e.target.value)}
                        placeholder="25.00"
                        className="w-full pl-8 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    {formData.unitCost && formData.unitPrice && parseFloat(formData.unitPrice) > 0 && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Margin: {(((parseFloat(formData.unitPrice) - parseFloat(formData.unitCost)) / parseFloat(formData.unitPrice)) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Supplier & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <SearchableDropdown
                      value={formData.supplier}
                      onChange={(val) => update('supplier', val)}
                      options={vendors}
                      placeholder="Select vendor..."
                      loading={loadingVendors}
                      icon={<Building2 className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <SearchableDropdown
                      value={formData.location}
                      onChange={(val) => update('location', val)}
                      options={locationOptions}
                      placeholder="Select location..."
                      searchable={false}
                    />
                  </div>
                </div>

                {/* Shipping Cost & Payment Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Shipping Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.shippingCost}
                        onChange={(e) => update('shippingCost', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Payment Terms
                    </label>
                    <SearchableDropdown
                      value={formData.paymentTerms}
                      onChange={(val) => update('paymentTerms', val)}
                      options={paymentTermsOptions}
                      placeholder="Select terms..."
                      searchable={false}
                    />
                  </div>
                </div>

                {/* Item Type & Product Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-slate-500" />
                        Item Type
                      </div>
                    </label>
                    <SearchableDropdown
                      value={formData.itemType}
                      onChange={(val) => update('itemType', val)}
                      options={[
                        { label: 'Normal Inventory', value: 'Normal' },
                        { label: 'Competitor Sample', value: 'Competitor Sample' },
                        { label: 'Pre-Production Sample', value: 'Pre-Production Sample' },
                      ]}
                      placeholder="Select type..."
                      searchable={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Product Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Warehouse Supplier', 'Customer Goods', 'Competitor Sample', 'PO Received', 'Fragile', 'Perishable', 'Hazardous'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              productTags: prev.productTags.includes(tag)
                                ? prev.productTags.filter(t => t !== tag)
                                : [...prev.productTags, tag],
                            }));
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            formData.productTags.includes(tag)
                              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    placeholder="Additional notes about this item..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center gap-3 shadow-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-5 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 px-5 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 ${
                    isEdit
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {saving ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}