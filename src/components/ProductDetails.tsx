import { ChecklistWidget, ChecklistItem } from './ChecklistWidget';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
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
import { toast } from 'sonner@2.0.3';
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

  // Product Info State
  const [productInfo, setProductInfo] = useState({
    name: productData?.name || '',
    client: productData?.client || '',
    vendor: productData?.vendor || '',
    status: productData?.status || 'New Product',
    type: productData?.type || '',
    internalSKU: productData?.internalSKU || '',
    projectManager: productData?.projectManager || '',
    image: productData?.image || '',
    competitorName: productData?.competitorName || '',
    competitorLink: productData?.competitorLink || '',
    competitorPrice: productData?.competitorPrice || '',
  });

  // Project number (fetched from full product record)
  const [productProjectNumber, setProductProjectNumber] = useState<string>('');

  // Checklist progress state
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 0 });
  const [allChecklists, setAllChecklists] = useState<Record<string, ChecklistItem[]> | null>(null);

  // Fetch product vendors from backend
  const [productVendors, setProductVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [unlinkConfirm, setUnlinkConfirm] = useState<{ open: boolean; vendorId: string | null; vendorName: string }>({ open: false, vendorId: null, vendorName: '' });

  useEffect(() => {
    setChecklistProgress({ completed: 0, total: 0 });
  }, [productId]);

  useEffect(() => {
    // local mode: no project number fetch
  }, [productId]);

  const fetchProductVendors = useCallback(async () => {
    setVendorsLoading(true);
    setProductVendors([]);
    setVendorsLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchProductVendors();
  }, [fetchProductVendors]);

  // Auto-update status to "In Progress" on first activity
  const triggerAutoProgress = useCallback(async () => {
    // no-op in local mode
  }, [productId, productInfo, onProductUpdate]);

  // Handle checklist changes from any tab
  const handleChecklistChanged = useCallback((updated: Record<string, ChecklistItem[]>) => {
    setAllChecklists(updated);
    let total = 0, completed = 0;
    for (const tabId of Object.keys(updated)) {
      const items = updated[tabId];
      if (Array.isArray(items)) {
        total += items.length;
        completed += items.filter(i => i.completed).length;
      }
    }
    setChecklistProgress({ completed, total });
  }, []);

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

  // Get per-tab checklist progress for tab badges
  const getTabProgress = (tabId: string) => {
    if (!allChecklists) return null;
    const items = allChecklists[tabId];
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    const completed = items.filter(i => i.completed).length;
    return { completed, total: items.length };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New Product': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ready For Live': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Live': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-purple-100 text-purple-700 border-purple-200';
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

    const movedVendor = updatedVendors.find(v => v.id === vendorId);
    const newPosition = updatedVendors.findIndex(v => v.id === vendorId) + 1;
    toast.success(`${movedVendor?.name} moved to Priority #${newPosition}`);
  };

  const getPriorityBadge = (idx: number) => {
    if (idx === 0) {
      return {
        gradient: 'bg-gradient-to-r from-purple-600 to-purple-500',
        label: 'Primary',
        icon: true,
      };
    }
    if (idx === 1) {
      return {
        gradient: 'bg-gradient-to-r from-blue-600 to-blue-500',
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{productInfo.name}</h1>
                {productProjectNumber && (
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${getProjectBadgeStaticClasses(productProjectNumber)}`}>
                    {productProjectNumber}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">Complete product sourcing information and supplier details</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress Ring */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
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
                <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${getProgressBgColor()}`}>
                  {progressPercent}%
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Progress</div>
                <div className="text-xs text-slate-500">{checklistProgress.completed}/{checklistProgress.total} items</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg transition-all"
              onClick={() => setIsOrderSampleDrawerOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Order Sample
            </motion.button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Overall Completion</span>
            <span className={`text-xs font-bold ${getProgressBgColor()}`}>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
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
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Product Overview */}
          <div className="grid grid-cols-12 gap-6">
            {/* Product Image */}
            <div className="col-span-3">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-6 border border-slate-200">
                {productInfo.image ? (
                  <img
                    src={productInfo.image}
                    alt="Product"
                    className="w-full h-48 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center rounded-lg bg-slate-100">
                    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Internal Information */}
            <div className="col-span-9">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Product Name</div>
                    <div className="text-sm font-semibold text-slate-900">{productInfo.name}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Customer</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {productInfo.client}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Vendor</div>
                    <div className="text-sm font-semibold text-slate-900">{productInfo.vendor || <span className="text-slate-400 italic font-normal">Not assigned</span>}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Status</div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(productInfo.status)}`}>
                        {productInfo.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Type</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        {productInfo.type}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Internal SKU</div>
                    <div className="text-sm font-semibold text-slate-900">{productInfo.internalSKU}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 col-span-3">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Project Manager</div>
                    <div className="text-sm font-semibold text-slate-900">{productInfo.projectManager || <span className="text-slate-400 italic font-normal">Not assigned</span>}</div>
                  </div>

                  {/* Competitor Analysis Section */}
                  {(productInfo.competitorName || productInfo.competitorLink || productInfo.competitorPrice) && (
                    <>
                      <div className="col-span-3 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-slate-500">Competitor Analysis</span>
                        </div>
                      </div>
                      {productInfo.competitorName && (
                        <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Competitor</div>
                          <div className="text-sm font-semibold text-slate-900">{productInfo.competitorName}</div>
                        </div>
                      )}
                      {productInfo.competitorLink && (
                        <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Competitor Link</div>
                          <a
                            href={productInfo.competitorLink.startsWith('http') ? productInfo.competitorLink : `https://${productInfo.competitorLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline decoration-blue-300 hover:decoration-blue-500 transition-colors truncate block"
                          >
                            {productInfo.competitorLink}
                          </a>
                        </div>
                      )}
                      {productInfo.competitorPrice && (
                        <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Competitor Price</div>
                          <div className="text-sm font-bold text-emerald-600">${productInfo.competitorPrice}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 px-6">
              <div className="flex gap-6">
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
            <div className="p-6">
              {activeTab === 'vendors' && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Vendor Network</h2>
                      <p className="text-sm text-slate-500 mt-1">Ranked by priority for redundancy planning</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg"
                      onClick={() => setIsAddVendorDrawerOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Link Vendor
                    </motion.button>
                  </div>

                  {productVendors.length === 0 && !vendorsLoading ? (
                    <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                      <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No Vendors Yet</h3>
                      <p className="text-sm text-slate-500 max-w-sm mb-6">
                        Link vendors to this product to start tracking pricing, lead times, and shipping options
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg"
                        onClick={() => setIsAddVendorDrawerOpen(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Link Vendor
                      </motion.button>
                    </div>
                  ) : vendorsLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-sm text-slate-400">Loading vendors...</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-6">
                      {/* Left Side - Vendor Cards */}
                      <div className="col-span-5 space-y-4">
                        {productVendors.map((vendor, idx) => (
                          <div key={vendor.id} className="relative">
                            {/* Priority Badge - shown on all vendors */}
                            <div className="absolute -top-2 left-4 z-10">
                              {(() => {
                                const badge = getPriorityBadge(idx);
                                return (
                                  <div className={`${badge.gradient} text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5`}>
                                    {badge.icon && (
                                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    )}
                                    {badge.label}
                                  </div>
                                );
                              })()}
                            </div>
                            {/* Reorder Buttons */}
                            {productVendors.length > 1 && (
                              <div className="absolute -top-1 right-4 z-10 flex items-center gap-0.5">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); reorderVendor(vendor.id, 'up'); }}
                                  disabled={idx === 0}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md border transition-all ${
                                    idx === 0
                                      ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                  }`}
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); reorderVendor(vendor.id, 'down'); }}
                                  disabled={idx === productVendors.length - 1}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md border transition-all ${
                                    idx === productVendors.length - 1
                                      ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                  }`}
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
                            )}
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              onClick={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                              className={`bg-white rounded-2xl border-2 p-5 pt-8 cursor-pointer transition-all ${
                                expandedVendor === vendor.id
                                  ? 'border-purple-400 shadow-xl shadow-purple-100 ring-2 ring-purple-200'
                                  : 'border-slate-200 hover:border-slate-300 shadow-md'
                              }`}
                            >
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-slate-900 mb-1">{vendor.name}</h3>
                                  <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {vendor.country || 'Unknown'}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                      {vendor.type}
                                    </span>
                                    {vendor.supportsDropShipping && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0m-8 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                        </svg>
                                        Dropship
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {vendor.contact && (
                                <div className="border-t border-slate-200 pt-4 mb-4 space-y-1.5">
                                  <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium">{vendor.contact.name}</span>
                                  </div>
                                  {vendor.contact.email && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      {vendor.contact.email}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setUnlinkConfirm({ open: true, vendorId: vendor.id, vendorName: vendor.name });
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Unlink
                                </motion.button>
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </div>

                      {/* Right Side - Pricing Details */}
                      <div className="col-span-7">
                        {expandedVendor && productVendors.find(v => v.id === expandedVendor) ? (
                          <VendorPricingPanel
                            vendor={productVendors.find(v => v.id === expandedVendor)!}
                            productId={productId}
                            onVendorUpdated={(updatedVendor) => {
                              setProductVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
                              triggerAutoProgress();
                            }}
                          />
                        ) : (
                          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                            <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center mb-4">
                              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Vendor</h3>
                            <p className="text-sm text-slate-500 max-w-sm">
                              Click on a vendor card on the left to view their detailed pricing breakdown, shipping methods, and lead times
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vendors Tab Checklist */}
                  <ChecklistWidgetWrapper
                    productId={productId}
                    tabId="vendors"
                    onChecklistChanged={handleChecklistChanged}
                    onActivityDetected={triggerAutoProgress}
                  />
                </div>
              )}

              {activeTab === 'specifications' && (
                <SpecificationsTab
                  productId={productId}
                  onChecklistChanged={handleChecklistChanged}
                  onActivityDetected={triggerAutoProgress}
                />
              )}

              {activeTab === 'packaging' && (
                <PackagingTab
                  productId={productId}
                  onChecklistChanged={handleChecklistChanged}
                  onActivityDetected={triggerAutoProgress}
                />
              )}

              {activeTab === 'samples' && (
                <SamplesTab
                  productId={productId}
                  refreshKey={sampleRefreshKey}
                  onChecklistChanged={handleChecklistChanged}
                  onActivityDetected={triggerAutoProgress}
                />
              )}

              {activeTab === 'files' && (
                <div className="space-y-6">
                  <FilesTab productId={productId} onActivityDetected={triggerAutoProgress} />
                  <ChecklistWidgetWrapper
                    productId={productId}
                    tabId="files"
                    onChecklistChanged={handleChecklistChanged}
                    onActivityDetected={triggerAutoProgress}
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
        existingVendorIds={productVendors.map(v => v.id)}
        onVendorLinked={async () => {
          fetchProductVendors();
          triggerAutoProgress();
        }}
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
        productInfo={productInfo}
        onSave={handleSaveProductInfo}
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
                onClick={() => {
                  if (unlinkConfirm.vendorId) {
                    setProductVendors(prev => prev.filter(v => v.id !== unlinkConfirm.vendorId));
                    setExpandedVendor(null);
                    setUnlinkConfirm({ open: false, vendorId: null, vendorName: '' });
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

// Small wrapper component to render ChecklistWidget in tabs that don't have it built-in

function ChecklistWidgetWrapper({ productId, tabId, onChecklistChanged, onActivityDetected }: {
  productId: string;
  tabId: string;
  onChecklistChanged: (all: Record<string, ChecklistItem[]>) => void;
  onActivityDetected: () => void;
}) {
  return (
    <ChecklistWidget
      productId={productId}
      tabId={tabId}
      onChecklistChanged={onChecklistChanged}
      onActivityDetected={onActivityDetected}
    />
  );
}