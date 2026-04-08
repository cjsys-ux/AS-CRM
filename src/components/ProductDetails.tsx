import { motion } from 'motion/react';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SpecificationsTab } from './SpecificationsTab';
import { PackagingTab } from './PackagingTab';
import { OrderSampleDrawer } from './OrderSampleDrawer';
import { SamplesTab } from './SamplesTab';
import { FilesTab } from './FilesTab';
import { ChatTab } from './ChatTab';
import { TimelineTab } from './TimelineTab';
import { AddVendorDrawer } from './AddVendorDrawer';
import { EditProductInfoDrawer } from './EditProductInfoDrawer';

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
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  type: string;
  platform: string;
  priority: string;
  moq: number;
  pricingTiers?: PricingTier[];
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
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [isOrderSampleDrawerOpen, setIsOrderSampleDrawerOpen] = useState(false);
  const [isEditProductInfoDrawerOpen, setIsEditProductInfoDrawerOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [unlinkConfirm, setUnlinkConfirm] = useState<{ open: boolean; vendorId: string | null; vendorName: string }>({ open: false, vendorId: null, vendorName: '' });

  useEffect(() => {
    fetchVendors();
  }, [productId]);

  const fetchVendors = async () => {
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
      }));
      setVendors(mapped);
    } catch {
      // silent
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      const res = await fetch('/api/pipeline/vendors/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendorId }),
      });
      if (!res.ok) throw new Error('Failed to delete vendor');
      toast.success('Vendor removed');
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
      if (expandedVendor === vendorId) setExpandedVendor(null);
    } catch {
      toast.error('Failed to remove vendor');
    }
  };

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

  const handleSaveProductInfo = (updatedInfo: any) => {
    setProductInfo(updatedInfo);
    if (onProductUpdate) {
      onProductUpdate(updatedInfo);
    }
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

  const getPriorityBadge = (idx: number) => {
    if (idx === 0) return { gradient: 'bg-gradient-to-r from-blue-600 to-blue-500', label: 'Primary', icon: true };
    if (idx === 1) return { gradient: 'bg-gradient-to-r from-slate-600 to-slate-500', label: 'Backup', icon: false };
    return { gradient: 'bg-gradient-to-r from-slate-500 to-slate-400', label: `Priority #${idx + 1}`, icon: false };
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

  const toggleVendor = (vendorId: string) => {
    setExpandedVendor(expandedVendor === vendorId ? null : vendorId);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Back</span>
            </motion.button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900 truncate">{productInfo.name}</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Complete product sourcing information and supplier details</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all shrink-0 text-sm sm:text-base"
            onClick={() => setIsOrderSampleDrawerOpen(true)}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="hidden sm:inline">Order Sample</span>
            <span className="sm:hidden">Sample</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Product Overview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
            {/* Product Image */}
            <div className="md:col-span-3">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200">
                {productInfo.image ? (
                  <img
                    src={productInfo.image}
                    alt="Product"
                    className="w-full h-32 sm:h-48 object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
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
            <div className="md:col-span-9">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                    <div className="text-sm font-semibold text-slate-900">
                      {productInfo.vendor || <span className="text-slate-400 italic font-normal">Not assigned</span>}
                    </div>
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
                  <div className="bg-slate-50 rounded-xl p-4 sm:col-span-2 lg:col-span-3">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Project Manager</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {productInfo.projectManager || <span className="text-slate-400 italic font-normal">Not assigned</span>}
                    </div>
                  </div>

                  {/* Competitor Analysis Section */}
                  {(productInfo.competitorName || productInfo.competitorLink || productInfo.competitorPrice) && (
                    <>
                      <div className="sm:col-span-2 lg:col-span-3 pt-2">
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
            <div className="border-b border-slate-200 px-4 sm:px-6 overflow-x-auto">
              <div className="flex gap-4 sm:gap-8 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 text-sm font-medium transition-all relative ${
                      activeTab === tab.id
                        ? 'text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-3 sm:p-6">
              {activeTab === 'vendors' && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Vendor Network</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Drag to reorder priority</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-lg shrink-0"
                      onClick={() => setIsAddVendorDrawerOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Link Vendor</span>
                      <span className="sm:hidden">Link</span>
                    </motion.button>
                  </div>

                  {vendors.length === 0 ? (
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
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-all shadow-lg"
                        onClick={() => setIsAddVendorDrawerOpen(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Link Vendor
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
                      {/* Left Side - Vendor Cards */}
                      <div className="lg:col-span-5 space-y-4">
                        {vendors.map((vendor, idx) => {
                          const badge = getPriorityBadge(idx);
                          return (
                          <div className="relative" key={vendor.id}>
                            {/* Priority Badge */}
                            <div className="absolute -top-2 left-3 z-10">
                              <div className={`${badge.gradient} text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow flex items-center gap-1`}>
                                {badge.icon && (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                )}
                                {badge.label}
                              </div>
                            </div>

                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              onClick={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                              className={`bg-white rounded-xl border-2 p-3 pt-5 cursor-pointer transition-all ${
                                expandedVendor === vendor.id
                                  ? 'border-slate-700 shadow-lg ring-1 ring-slate-300'
                                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 mb-2">
                                {vendors.length > 1 && (
                                  <div className="mt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-500 transition-colors cursor-grab" />
                                  </div>
                                )}
                                <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  {(vendor as any).logo ? (
                                    <img src={(vendor as any).logo} alt="" className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                {(vendor as any).supportsDropShipping && (
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

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUnlinkConfirm({ open: true, vendorId: vendor.id, vendorName: vendor.name });
                                }}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                Unlink
                              </button>
                            </motion.div>
                          </div>
                          );
                        })}
                      </div>

                      {/* Right Side - Pricing Details */}
                      <div className="lg:col-span-7">
                        {expandedVendor ? (() => {
                          const v = vendors.find((vv) => vv.id === expandedVendor);
                          if (!v) return null;
                          const tiers = v.pricingTiers ?? [];
                          return (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden"
                            >
                              <div className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 px-6 py-5 flex items-center justify-between">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-white mb-1">Detailed Pricing Breakdown</h3>
                                  <p className="text-sm text-purple-100">{v.name} - All Tiers & Shipping Methods</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                  <div className="text-xs text-white/80 font-medium">Tiers</div>
                                  <div className="text-2xl font-bold text-white">{tiers.length}</div>
                                </div>
                              </div>

                              {tiers.length > 0 && (
                                <>
                                  <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 border-b border-slate-200">
                                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Lowest Unit Price</div>
                                      <div className="text-2xl font-bold text-emerald-600">
                                        ${Math.min(...tiers.map((t) => t.ddpPrice)).toFixed(2)}
                                      </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Fastest Lead Time</div>
                                      <div className="text-2xl font-bold text-blue-600">
                                        {Math.min(...tiers.map((t) => t.leadTime))} days
                                      </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Shipping Options</div>
                                      <div className="text-2xl font-bold text-purple-600">
                                        {new Set(tiers.map((t) => t.ddpMethod)).size} Methods
                                      </div>
                                    </div>
                                  </div>
                                  <div className="overflow-auto max-h-[500px]">
                                    <table className="w-full">
                                      <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                                        <tr>
                                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</th>
                                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">FOB Price</th>
                                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">DDP Price</th>
                                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Shipping Method</th>
                                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Lead Time</th>
                                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Total Cost</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {tiers.map((tier, index) => (
                                          <motion.tr
                                            key={index}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="border-b border-slate-100 hover:bg-purple-50/30 transition-colors"
                                          >
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-900">
                                                {tier.quantity.toLocaleString()}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">${tier.fobPrice.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-emerald-600">${tier.ddpPrice.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                                {tier.ddpMethod}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-700">{tier.leadTime} days</td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-900">
                                              ${(tier.ddpPrice * tier.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                          </motion.tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}

                              {tiers.length === 0 && (
                                <div className="p-12 text-center text-slate-500">
                                  <p className="text-sm">No pricing tiers added for this vendor yet.</p>
                                </div>
                              )}
                            </motion.div>
                          );
                        })() : (
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
                </div>
              )}

              {activeTab === 'specifications' && (
                <SpecificationsTab productId={productId} />
              )}

              {activeTab === 'packaging' && (
                <PackagingTab productId={productId} />
              )}

              {activeTab === 'samples' && (
                <SamplesTab productId={productId} />
              )}

              {activeTab === 'files' && (
                <FilesTab productId={productId} />
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

      {/* Add Vendor Drawer */}
      <AddVendorDrawer
        isOpen={isAddVendorDrawerOpen}
        onClose={() => {
          setIsAddVendorDrawerOpen(false);
          setVendorToEdit(null);
        }}
        productId={productId}
        vendorData={vendorToEdit ? {
          id: vendorToEdit.id,
          name: vendorToEdit.name,
          logo: (vendorToEdit as any).logo,
          status: (vendorToEdit as any).status,
          contactName: vendorToEdit.contact?.name,
          email: vendorToEdit.contact?.email,
          phone: vendorToEdit.contact?.phone,
          wechatId: (vendorToEdit as any).wechatId,
          type: vendorToEdit.type,
          accountType: vendorToEdit.platform,
          website: (vendorToEdit as any).website,
          paymentTerms: (vendorToEdit as any).paymentTerms,
          accountNumber: (vendorToEdit as any).accountNumber,
          country: vendorToEdit.country,
          fobCity: (vendorToEdit as any).fobCity,
          fobState: (vendorToEdit as any).fobState,
          productsSupplied: (vendorToEdit as any).productsSupplied,
          notes: (vendorToEdit as any).notes,
        } : null}
        onSuccess={fetchVendors}
      />

      {/* Order Sample Drawer */}
      <OrderSampleDrawer
        isOpen={isOrderSampleDrawerOpen}
        onClose={() => setIsOrderSampleDrawerOpen(false)}
        productId={productId}
        productName={productInfo.name}
        clientName={productInfo.client}
        competitorLink=""
        onSuccess={() => setIsOrderSampleDrawerOpen(false)}
      />

      {/* Edit Product Info Drawer */}
      <EditProductInfoDrawer
        isOpen={isEditProductInfoDrawerOpen}
        onClose={() => setIsEditProductInfoDrawerOpen(false)}
        productId={productId}
        productInfo={productInfo}
        onSave={handleSaveProductInfo}
      />

      {/* Unlink Vendor Confirmation */}
      {unlinkConfirm.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Unlink Vendor</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to unlink <span className="font-medium text-slate-700">{unlinkConfirm.vendorName}</span> from this product?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
                onClick={() => setUnlinkConfirm({ open: false, vendorId: null, vendorName: '' })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors text-sm"
                onClick={() => {
                  if (unlinkConfirm.vendorId) {
                    handleDeleteVendor(unlinkConfirm.vendorId);
                  }
                  setUnlinkConfirm({ open: false, vendorId: null, vendorName: '' });
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