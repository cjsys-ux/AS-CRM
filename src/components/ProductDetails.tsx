import { ChecklistWidget } from './ChecklistWidget';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { SpecificationsTab } from './SpecificationsTab';
import { PackagingTab } from './PackagingTab';
import { OrderSampleDrawer } from './OrderSampleDrawer';
import { SamplesTab } from './SamplesTab';
import { FilesTab } from './FilesTab';
import { ChatTab } from './ChatTab';
import { TimelineTab } from './TimelineTab';
import { LinkVendorDrawer } from './LinkVendorDrawer';
import { EditProductInfoDrawer } from './EditProductInfoDrawer';
import { VendorPricingPanel } from './VendorPricingPanel';
import { ImportCostAnalysis } from './ImportCostAnalysis';
import { toast } from 'sonner';
import { getProjectBadgeStaticClasses } from './projectNumberUtils';

interface ProductDetailsProps {
  productId: string;
  onBack: () => void;
  productData?: {
    name: string;
    client: string;
    vendor: string;
    status: string;
    type: string;
    internalSKU?: string;
    projectManager?: string;
    htsCode?: string;
    htsRate?: string;
    htsBaseRate?: string;
    htsSection301?: boolean;
    sizeVariants?: string[];
    image: string;
    competitorName?: string;
    competitorLink?: string;
    competitorPrice?: string;
  };
  onProductUpdate?: (updatedProduct: any) => void;
}

interface Vendor {
  id: string;
  name: string;
  country: string;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  type: string;
  platform: string;
  priority: string;
  moq: number;
  pricingTiers?: PricingTier[];
  supportsDropShipping?: boolean;
  sortOrder?: number;
}

interface PricingTier {
  quantity: number;
  exwPrice: number;
  fobPrice: number;
  ddpPrice: number;
  ddpMethod: string;
  leadTime: number;
}

export function ProductDetails({ productId, onBack, productData, onProductUpdate }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState('vendors');
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [isAddVendorDrawerOpen, setIsAddVendorDrawerOpen] = useState(false);
  const [isOrderSampleDrawerOpen, setIsOrderSampleDrawerOpen] = useState(false);
  const [isEditProductInfoDrawerOpen, setIsEditProductInfoDrawerOpen] = useState(false);
  const [sampleRefreshKey, setSampleRefreshKey] = useState(0);
  const [draggedVendorId, setDraggedVendorId] = useState<string | null>(null);
  const [dragOverVendorId, setDragOverVendorId] = useState<string | null>(null);

  // Product Info State
  const [productInfo, setProductInfo] = useState({
    name: productData?.name || '',
    client: productData?.client || '',
    vendor: productData?.vendor || '',
    status: productData?.status || 'New Product',
    type: productData?.type || '',
    internalSKU: productData?.internalSKU || '',
    projectManager: productData?.projectManager || '',
    htsCode: productData?.htsCode || '',
    htsRate: productData?.htsRate || '',
    htsBaseRate: productData?.htsBaseRate || '',
    htsSection301: productData?.htsSection301 || false,
    sizeVariants: productData?.sizeVariants || [],
    image: productData?.image || '',
    competitorName: productData?.competitorName || '',
    competitorLink: productData?.competitorLink || '',
    competitorPrice: productData?.competitorPrice || '',
    artTemplate: productData?.artTemplate || '',
    artTemplateName: productData?.artTemplateName || '',
  });

  // Project number (fetched from full product record)
  const [productProjectNumber, setProductProjectNumber] = useState<string>('');

  // Checklist progress state
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 0 });
  const [tabProgress, setTabProgress] = useState<Record<string, { completed: number; total: number }>>({});

  // Fetch product vendors from backend
  const [productVendors, setProductVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [unlinkConfirm, setUnlinkConfirm] = useState<{ open: boolean; vendorId: string | null; vendorName: string }>({ open: false, vendorId: null, vendorName: '' });

  const updateTabProgress = (tab: string, items: { completed: boolean }[]) => {
    const completed = items.filter(i => i.completed).length;
    const total = items.length;
    setTabProgress(prev => {
      const next = { ...prev, [tab]: { completed, total } };
      const allCompleted = Object.values(next).reduce((s, v) => s + v.completed, 0);
      const allTotal = Object.values(next).reduce((s, v) => s + v.total, 0);
      setChecklistProgress({ completed: allCompleted, total: allTotal });
      return next;
    });
  };

  // Fetch project number from full product record
  useEffect(() => {
    const fetchProjectNumber = async () => {
      try {
        const res = await fetch(`/api/projects/get?id=${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          if (data.product.projectNumber) {
            setProductProjectNumber(data.product.projectNumber);
          }
          // Sync fields from full product record
          const artTemplateKey = data.product.artTemplateKey;
          const artTemplateFromGet = data.product.artTemplate
            || (artTemplateKey ? `/api/files/image?key=${encodeURIComponent(artTemplateKey)}` : '');
          setProductInfo(prev => ({
            ...prev,
            competitorName: data.product.competitorName || prev.competitorName || '',
            competitorLink: data.product.competitorLink || prev.competitorLink || '',
            competitorPrice: data.product.competitorPrice || prev.competitorPrice || '',
            htsCode: data.product.htsCode || prev.htsCode || '',
            htsRate: data.product.htsRate || prev.htsRate || '',
            htsBaseRate: data.product.htsBaseRate || prev.htsBaseRate || '',
            htsSection301: data.product.htsSection301 ?? prev.htsSection301 ?? false,
            sizeVariants: data.product.sizeVariants || prev.sizeVariants || [],
            artTemplate: artTemplateFromGet || prev.artTemplate || '',
            artTemplateName: data.product.artTemplateName || prev.artTemplateName || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching project number:', err);
      }
    };
    fetchProjectNumber();
  }, [productId]);

  const fetchProductVendors = useCallback(async () => {
    setVendorsLoading(true);
    try {
      const res = await fetch(`/api/pipeline/vendors/list?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) return;
      const data = await res.json();
      const mapped: Vendor[] = (data.vendors ?? []).map((v: any) => ({
        id: v.id ?? v._id,
        name: v.vendorName ?? v.name ?? '',
        country: v.country ?? '',
        contact: { name: v.contactName ?? '', email: v.email ?? '', phone: v.phone ?? '' },
        type: v.vendorType ?? v.type ?? '',
        platform: v.accountType ?? 'Standalone',
        priority: String(v.priority ?? 99),
        moq: v.moq ?? 0,
        pricingTiers: v.pricingTiers ?? [],
        supportsDropShipping: v.supportsDropShipping ?? false,
        sortOrder: typeof v.sortOrder === 'number' ? v.sortOrder : (typeof v.priority === 'number' ? v.priority : 9999),
        logo: v.logo,
        status: v.status,
        wechatId: v.wechatId,
        website: v.website,
        paymentTerms: v.paymentTerms,
        accountNumber: v.accountNumber,
        fobCity: v.fobCity,
        fobState: v.fobState,
        productsSupplied: v.productsSupplied,
        notes: v.notes,
        globalVendorId: v.globalVendorId,
      }));
      mapped.sort((a: any, b: any) => {
        const aO = typeof a.sortOrder === 'number' ? a.sortOrder : 9999;
        const bO = typeof b.sortOrder === 'number' ? b.sortOrder : 9999;
        return aO - bO;
      });
      setProductVendors(mapped);
      if (mapped.length > 0) setExpandedVendor(prev => prev || mapped[0].id);
    } catch {
      setProductVendors([]);
    } finally {
      setVendorsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductVendors();
  }, [fetchProductVendors]);

  // Auto-sync vendor field in Internal Information with primary vendor (index 0)
  useEffect(() => {
    if (productVendors.length > 0) {
      const primaryVendor = productVendors[0];
      if (primaryVendor.name && primaryVendor.name !== productInfo.vendor) {
        setProductInfo(prev => ({ ...prev, vendor: primaryVendor.name }));
        onProductUpdate?.({ ...productInfo, vendor: primaryVendor.name });
      }
    }
  }, [productVendors]);

  // Auto-update status to "In Progress" on first activity (using localStorage)
  const triggerAutoProgress = useCallback(async () => {
    if (productInfo.status !== 'New Product') return;
    
    try {
      // Update status locally without API call
      const newStatus = 'In Progress';
      setProductInfo(prev => ({ ...prev, status: newStatus }));
      onProductUpdate?.({ ...productInfo, status: newStatus });
      
      // Save to localStorage for persistence
      if (productId) {
        localStorage.setItem(`product:${productId}:status`, newStatus);
      }
      
      toast.success('Status automatically updated to "In Progress"');
    } catch (err) {
      console.error('Error auto-updating status:', err);
    }
  }, [productId, productInfo, onProductUpdate]);

  const handleSaveProductInfo = (updatedInfo: any) => {
    setProductInfo(updatedInfo);
    if (onProductUpdate) {
      onProductUpdate(updatedInfo);
    }
    triggerAutoProgress();
  };

  const progressPercent = checklistProgress.total > 0
    ? Math.round((checklistProgress.completed / checklistProgress.total) * 100)
    : 0;

  const getProgressColor = () => {
    if (progressPercent === 100) return 'from-green-500 to-emerald-500';
    if (progressPercent >= 70) return 'from-green-400 to-green-500';
    if (progressPercent >= 40) return 'from-orange-400 to-amber-500';
    return 'from-red-400 to-red-500';
  };

  const getProgressBgColor = () => {
    if (progressPercent === 100) return 'text-green-600';
    if (progressPercent >= 70) return 'text-green-600';
    if (progressPercent >= 40) return 'text-orange-600';
    return 'text-red-500';
  };

  const tabs = [
    { id: 'vendors', label: 'Vendors' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'packaging', label: 'Packaging' },
    { id: 'samples', label: 'Samples' },
    { id: 'files', label: 'Files' },
    { id: 'chat', label: 'Chat' },
    { id: 'timeline', label: 'Timeline' },
  ];

  const getTabProgress = (tabId: string) => {
    const tp = tabProgress[tabId];
    if (!tp || tp.total === 0) return null;
    return tp;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New Product': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ready For Live': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Live': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Reorder vendor priority
  const reorderVendor = async (vendorId: string, direction: 'up' | 'down') => {
    const currentIndex = productVendors.findIndex(v => v.id === vendorId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= productVendors.length) return;

    const newOrder = [...productVendors];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    // Assign sortOrder values and update state optimistically
    const updatedVendors = newOrder.map((v, i) => ({ ...v, sortOrder: i }));
    setProductVendors(updatedVendors);

    // Persist sortOrder for both swapped vendors
    const vendorsToUpdate = [updatedVendors[currentIndex], updatedVendors[targetIndex]];
    try {
      await Promise.all(
        vendorsToUpdate.map(v =>
          fetch('/api/pipeline/vendors/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: v.id, productId, sortOrder: v.sortOrder }),
          })
        )
      );
      const movedVendor = updatedVendors.find(v => v.id === vendorId);
      const newPosition = updatedVendors.findIndex(v => v.id === vendorId) + 1;
      toast.success(`${movedVendor?.name} moved to Priority #${newPosition}`);
    } catch (err) {
      console.error('Error persisting vendor order:', err);
      toast.error('Failed to save vendor order');
      fetchProductVendors(); // Revert on error
    }
  };

  const getPriorityBadge = (idx: number) => {
    if (idx === 0) {
      return {
        gradient: 'bg-gradient-to-r from-blue-600 to-blue-500',
        label: 'Primary',
        icon: true,
      };
    }
    if (idx === 1) {
      return {
        gradient: 'bg-gradient-to-r from-slate-600 to-slate-500',
        label: 'Backup',
        icon: false,
      };
    }
    return {
      gradient: 'bg-gradient-to-r from-slate-500 to-slate-400',
      label: `Priority #${idx + 1}`,
      icon: false,
    };
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0 sticky top-0 z-20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900 truncate">{productInfo.name}</h1>
                {productProjectNumber && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border shrink-0 ${getProjectBadgeStaticClasses(productProjectNumber)}`}>
                    {productProjectNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Complete product sourcing information and supplier details</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <div className="relative w-9 h-9">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke={progressPercent === 100 ? '#22c55e' : progressPercent >= 70 ? '#22c55e' : progressPercent >= 40 ? '#f97316' : '#ef4444'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercent * 0.88} 88`}
                    initial={{ strokeDasharray: '0 88' }}
                    animate={{ strokeDasharray: `${progressPercent * 0.88} 88` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-[7px] font-bold ${getProgressBgColor()}`}>
                  {progressPercent}%
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Progress</div>
                <div className="text-[10px] text-slate-500">{checklistProgress.completed}/{checklistProgress.total} items</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center gap-2 shadow-lg transition-all shrink-0"
              onClick={() => setIsOrderSampleDrawerOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Order Sample
            </motion.button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Overall Completion</span>
            <span className={`text-xs font-bold ${getProgressBgColor()}`}>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()}`}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Product Overview */}
          <div className="grid gap-4 sm:gap-6" style={{ gridTemplateColumns: '1fr 3fr' }}>
            {/* Product Image */}
            <div>
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200">
                {productInfo.image ? (
                  <img
                    src={productInfo.image}
                    alt="Product"
                    className="w-full h-32 sm:h-48 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 sm:h-48 flex items-center justify-center rounded-lg bg-slate-100">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Internal Information */}
            <div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500">Internal Information</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                    onClick={() => setIsEditProductInfoDrawerOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                </div>
                {/* Row 1: Product Name | Customer | Vendor */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Product Name</div>
                    <div className="text-sm font-semibold text-slate-900">{productInfo.name}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Customer</div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {productInfo.client}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Vendor</div>
                    <div className="text-sm font-semibold text-slate-900">{productInfo.vendor || <span className="text-slate-400 italic font-normal">Not assigned</span>}</div>
                  </div>
                </div>
                {/* Row 2: Status | Type | Internal SKU */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Status</div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(productInfo.status)}`}>
                      {productInfo.status}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Type</div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      {productInfo.type}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Internal SKU</div>
                    <div className="text-sm font-semibold text-slate-900">{productInfo.internalSKU || <span className="text-slate-400 italic font-normal">—</span>}</div>
                  </div>
                </div>
                {/* Row 3: Project Manager | HTS Code */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Project Manager</div>
                    <div className="text-sm font-semibold text-slate-900">{productInfo.projectManager || <span className="text-slate-400 italic font-normal">Not assigned</span>}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">HTS Code</div>
                    <div className="text-sm font-semibold text-slate-900">{productInfo.htsCode || <span className="text-slate-400 italic font-normal">—</span>}</div>
                  </div>
                </div>
                {/* Row 4: HTS Duty Rate | Size Variants */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 col-span-2">
                    <div className="text-xs font-semibold text-slate-500 mb-1">HTS Duty Rate</div>
                    {productInfo.htsBaseRate ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Base Rate</span>
                          <span className="text-sm font-semibold text-slate-900">{productInfo.htsBaseRate}%</span>
                        </div>
                        {productInfo.htsSection301 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              Section 301
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-200">ACTIVE</span>
                            </span>
                            <span className="text-sm font-semibold text-red-600">+25%</span>
                          </div>
                        )}
                        <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">Total Rate</span>
                          <span className="text-sm font-bold text-slate-900">
                            {productInfo.htsSection301
                              ? `${(parseFloat(productInfo.htsBaseRate) + 25).toFixed(1)}%`
                              : `${productInfo.htsBaseRate}%`
                            }
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic font-normal">—</span>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Size Variants</div>
                    {productInfo.sizeVariants && productInfo.sizeVariants.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {productInfo.sizeVariants.map((size: string) => (
                          <span key={size} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {size}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic font-normal">No sizes defined</span>
                    )}
                  </div>
                </div>

                {/* Competitor Analysis */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">Competitor Analysis</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                        <div className="text-xs font-semibold text-slate-500 mb-1">Competitor</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {productInfo.competitorName || <span className="text-slate-400 font-normal">—</span>}
                        </div>
                      </div>
                      <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                        <div className="text-xs font-semibold text-slate-500 mb-1">Competitor Link</div>
                        {productInfo.competitorLink ? (
                          <a
                            href={productInfo.competitorLink.startsWith('http') ? productInfo.competitorLink : `https://${productInfo.competitorLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline decoration-blue-300 hover:decoration-blue-500 transition-colors truncate block"
                          >
                            {productInfo.competitorLink}
                          </a>
                        ) : <span className="text-slate-400 font-normal text-sm">—</span>}
                      </div>
                      <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                        <div className="text-xs font-semibold text-slate-500 mb-1">Competitor Price</div>
                        <div className="text-sm font-bold text-emerald-600">
                          {productInfo.competitorPrice ? `$${productInfo.competitorPrice}` : <span className="text-slate-400 font-normal">—</span>}
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-visible">
            <div className="border-b border-slate-200 px-4 sm:px-6 overflow-x-auto">
              <div className="flex gap-4 sm:gap-6 min-w-max">
                {tabs.map((tab) => {
                  const tabProgress = getTabProgress(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 text-sm font-medium transition-all relative flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'text-blue-600'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                      {tabProgress && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          tabProgress.completed === tabProgress.total && tabProgress.total > 0
                            ? 'bg-green-100 text-green-700'
                            : tabProgress.completed > 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {tabProgress.completed}/{tabProgress.total}
                        </span>
                      )}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-3 sm:p-6">
              {activeTab === 'vendors' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Vendor Network</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Drag to reorder priority</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-lg shrink-0"
                      onClick={() => setIsAddVendorDrawerOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Link Vendor</span>
                    </motion.button>
                  </div>

                  {vendorsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  ) : productVendors.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">No vendors yet</h3>
                      <p className="text-sm text-slate-500">Add your first vendor to start tracking pricing and contact info.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Vendor Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {productVendors.map((vendor, idx) => {
                          const badge = getPriorityBadge(idx);
                          return (
                            <div
                              key={vendor.id}
                              className="relative"
                              onDragOver={(e) => { e.preventDefault(); setDragOverVendorId(vendor.id); }}
                              onDrop={() => {
                                if (draggedVendorId && draggedVendorId !== vendor.id) {
                                  const fromIdx = productVendors.findIndex(v => v.id === draggedVendorId);
                                  const toIdx = productVendors.findIndex(v => v.id === vendor.id);
                                  const newOrder = [...productVendors];
                                  const [moved] = newOrder.splice(fromIdx, 1);
                                  newOrder.splice(toIdx, 0, moved);
                                  const updatedVendors = newOrder.map((v, i) => ({ ...v, sortOrder: i }));
                                  setProductVendors(updatedVendors);
                                  Promise.all(
                                    updatedVendors.map(v =>
                                      fetch('/api/pipeline/vendors/update', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: v.id, priority: v.sortOrder }),
                                      })
                                    )
                                  ).then(() => {
                                    const movedV = updatedVendors.find(v => v.id === draggedVendorId);
                                    const newPos = updatedVendors.findIndex(v => v.id === draggedVendorId) + 1;
                                    toast.success(`${movedV?.name} moved to Priority #${newPos}`);
                                  }).catch(() => { toast.error('Failed to save vendor order'); fetchProductVendors(); });
                                }
                                setDraggedVendorId(null); setDragOverVendorId(null);
                              }}
                              onDragEnd={() => { setDraggedVendorId(null); setDragOverVendorId(null); }}
                            >
                              {/* Priority Badge */}
                              <div className="absolute -top-2 left-2.5 z-10">
                                <div className={`${badge.gradient} text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow flex items-center gap-0.5`}>
                                  {badge.icon && (
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  )}
                                  {badge.label}
                                </div>
                              </div>

                              <motion.div
                                whileHover={{ scale: 1.005 }}
                                onClick={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                                className={`bg-white rounded-xl border-2 p-3 pt-4 cursor-pointer transition-all ${
                                  dragOverVendorId === vendor.id ? 'border-blue-400 ring-2 ring-blue-200' :
                                  draggedVendorId === vendor.id ? 'opacity-50' :
                                  expandedVendor === vendor.id
                                    ? 'border-slate-700 shadow-lg ring-1 ring-slate-300'
                                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                                }`}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <div
                                    className="mt-0.5 cursor-grab active:cursor-grabbing shrink-0 p-0.5 rounded hover:bg-slate-100 transition-colors"
                                    draggable
                                    onDragStart={(e) => { e.stopPropagation(); setDraggedVendorId(vendor.id); }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <GripVertical className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 transition-colors" />
                                  </div>
                                  <div className="w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-600 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {(vendor as any).logo ? (
                                      <img src={(vendor as any).logo} alt="" className="w-full h-full object-contain p-0.5" />
                                    ) : (
                                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 truncate">{vendor.name}</h3>
                                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      {vendor.country || 'Unknown'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-wrap mb-2">
                                  {vendor.type && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                      {vendor.type}
                                    </span>
                                  )}
                                  {vendor.supportsDropShipping && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0m-8 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                      </svg>
                                      Dropship
                                    </span>
                                  )}
                                </div>

                                {vendor.contact?.name && (
                                  <div className="border-t border-slate-100 pt-2 mb-2">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      <span className="font-medium truncate">{vendor.contact.name}</span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-1.5 mt-1 border-t border-slate-100 pt-2" onClick={e => e.stopPropagation()}>
                                  <button
                                    onClick={() => setUnlinkConfirm({ open: true, vendorId: vendor.id, vendorName: vendor.name })}
                                    className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Unlink
                                  </button>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pricing Panel */}
                      <div>
                        {expandedVendor && productVendors.find(v => v.id === expandedVendor) ? (
                          <div className="flex flex-col gap-0">
                            <VendorPricingPanel
                              vendor={productVendors.find(v => v.id === expandedVendor)!}
                              productId={productId}
                              onVendorUpdated={(updatedVendor) => {
                                setProductVendors(prev => prev.map(v => v.id === updatedVendor.id ? { ...v, ...updatedVendor } : v));
                                triggerAutoProgress();
                              }}
                            />
                            {(() => {
                              const vendor = productVendors.find(v => v.id === expandedVendor);
                              if (!vendor?.pricingTiers || vendor.pricingTiers.length === 0) return null;
                              return (
                                <ImportCostAnalysis
                                  pricingTiers={vendor.pricingTiers}
                                  htsBaseRate={productInfo.htsBaseRate || ''}
                                  htsSection301={productInfo.htsSection301 || false}
                                  vendorName={vendor.name}
                                />
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-10 flex flex-col items-center justify-center text-center min-h-[320px]">
                            <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center mb-4">
                              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Vendor</h3>
                            <p className="text-sm text-slate-500 max-w-sm">
                              Click on a vendor card above to view pricing breakdown, shipping methods, and lead times
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vendors Tab Checklist */}
                  <ChecklistWidget
                    productId={productId}
                    tabId="vendors"
                    onUpdate={(items) => updateTabProgress('vendors', items)}
                  />
                </div>
              )}

              {activeTab === 'specifications' && (
                <SpecificationsTab
                  productId={productId}
                  sizeVariants={productInfo.sizeVariants}
                />
              )}
              {activeTab === 'packaging' && <PackagingTab productId={productId} />}

              {activeTab === 'samples' && (
                <SamplesTab
                  productId={productId}
                  refreshKey={sampleRefreshKey}
                />
              )}

              {activeTab === 'files' && (
                <div className="space-y-6">
                  <FilesTab productId={productId} />
                  <ChecklistWidget
                    productId={productId}
                    tabId="files"
                    onUpdate={(items) => updateTabProgress('files', items)}
                  />
                </div>
              )}

              {activeTab === 'chat' && (
                <ChatTab productId={productId} />
              )}

              {activeTab === 'timeline' && (
                <TimelineTab productId={productId} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Link Vendor Drawer */}
      <LinkVendorDrawer
        isOpen={isAddVendorDrawerOpen}
        onClose={() => setIsAddVendorDrawerOpen(false)}
        productId={productId}
        existingVendorIds={productVendors.flatMap(v => [(v as any).globalVendorId, v.id, v.name].filter(Boolean))}
        onVendorLinked={() => { fetchProductVendors(); triggerAutoProgress(); }}
      />

      {/* Order Sample Drawer */}
      <OrderSampleDrawer
        isOpen={isOrderSampleDrawerOpen}
        onClose={() => setIsOrderSampleDrawerOpen(false)}
        productId={productId}
        productName={productInfo.name}
        projectNumber={productProjectNumber}
        clientName={productInfo.client}
        competitorLink={productInfo.competitorLink || ''}
        onSuccess={() => {
          setIsOrderSampleDrawerOpen(false);
          setSampleRefreshKey(prev => prev + 1);
        }}
      />

      {/* Edit Product Info Drawer */}
      <EditProductInfoDrawer
        isOpen={isEditProductInfoDrawerOpen}
        onClose={() => setIsEditProductInfoDrawerOpen(false)}
        productId={productId}
        productInfo={productInfo}
        onSave={handleSaveProductInfo}
        linkedVendors={productVendors.map(v => v.name)}
        checklistProgress={checklistProgress}
        onOpenLinkVendor={() => {
          setIsEditProductInfoDrawerOpen(false);
          setIsAddVendorDrawerOpen(true);
        }}
      />

      {/* Unlink Vendor Confirmation */}
      {unlinkConfirm.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Unlink Vendor</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to unlink <span className="font-medium">{unlinkConfirm.vendorName}</span> from this product?
            </p>
            <div className="flex items-center justify-end gap-4">
              <button
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
                onClick={() => setUnlinkConfirm({ open: false, vendorId: null, vendorName: '' })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                onClick={async () => {
                  if (unlinkConfirm.vendorId) {
                    try {
                      await fetch('/api/pipeline/vendors/delete', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: unlinkConfirm.vendorId, productId }),
                      });
                      setProductVendors(prev => prev.filter(v => v.id !== unlinkConfirm.vendorId));
                      setExpandedVendor(null);
                      setUnlinkConfirm({ open: false, vendorId: null, vendorName: '' });
                    } catch (err) {
                      console.error('Error unlinking vendor:', err);
                    }
                  }
                }}
              >
                Unlink
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
