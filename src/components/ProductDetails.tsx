import { motion } from 'motion/react';
import { ArrowLeft, Plus, ChevronUp, ChevronDown, Edit, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { SpecificationsTab } from './SpecificationsTab';
import { PackagingTab } from './PackagingTab';
import { OrderSampleDrawer } from './OrderSampleDrawer';
import { SamplesTab } from './SamplesTab';
import { ChecklistWidget } from './ChecklistWidget';
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

const mockVendor: Vendor = {
  id: '1',
  name: 'SC Promo',
  country: 'China',
  contact: {
    name: 'Robbin Chan',
    email: 'robbin@scpromo.net',
    phone: 'CHENJ789',
  },
  type: 'International',
  platform: 'Direct',
  priority: 'Primary',
  moq: 10000,
  pricingTiers: [
    { quantity: 10000, fobPrice: 2.97, ddpPrice: 4.62, ddpMethod: 'Express Air', leadTime: 43 },
    { quantity: 20000, fobPrice: 2.93, ddpPrice: 4.58, ddpMethod: 'Express Air', leadTime: 48 },
    { quantity: 50000, fobPrice: 2.84, ddpPrice: 4.51, ddpMethod: 'Express Air', leadTime: 53 },
    { quantity: 80000, fobPrice: 2.78, ddpPrice: 4.45, ddpMethod: 'Express Air', leadTime: 58 },
    { quantity: 160000, fobPrice: 2.73, ddpPrice: 4.40, ddpMethod: 'Express Air', leadTime: 73 },
    { quantity: 320000, fobPrice: 2.68, ddpPrice: 4.35, ddpMethod: 'Express Air', leadTime: 93 },
    { quantity: 10000, fobPrice: 2.97, ddpPrice: 4.39, ddpMethod: 'Air Cargo', leadTime: 50 },
    { quantity: 20000, fobPrice: 2.93, ddpPrice: 4.35, ddpMethod: 'Air Cargo', leadTime: 54 },
    { quantity: 50000, fobPrice: 2.84, ddpPrice: 4.26, ddpMethod: 'Air Cargo', leadTime: 57 },
    { quantity: 80000, fobPrice: 2.78, ddpPrice: 4.18, ddpMethod: 'Air Cargo', leadTime: 64 },
    { quantity: 160000, fobPrice: 2.73, ddpPrice: 4.13, ddpMethod: 'Air Cargo', leadTime: 79 },
    { quantity: 320000, fobPrice: 2.68, ddpPrice: 4.10, ddpMethod: 'Air Cargo', leadTime: 99 },
    { quantity: 10000, fobPrice: 2.97, ddpPrice: 3.34, ddpMethod: 'Fast Boat', leadTime: 66 },
    { quantity: 20000, fobPrice: 2.93, ddpPrice: 3.30, ddpMethod: 'Fast Boat', leadTime: 70 },
    { quantity: 50000, fobPrice: 2.84, ddpPrice: 3.22, ddpMethod: 'Fast Boat', leadTime: 74 },
  ],
};

export function ProductDetails({ productId, onBack, productData, onProductUpdate }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState('vendors');
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [isAddVendorDrawerOpen, setIsAddVendorDrawerOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [isOrderSampleDrawerOpen, setIsOrderSampleDrawerOpen] = useState(false);
  const [isEditProductInfoDrawerOpen, setIsEditProductInfoDrawerOpen] = useState(false);

  // Product Info State
  const [productInfo, setProductInfo] = useState({
    name: productData?.name || 'Scan Sling',
    client: productData?.client || 'Amazon',
    vendor: productData?.vendor || 'SC Promo',
    status: productData?.status || 'In Progress',
    type: productData?.type || 'Both',
    internalSKU: productData?.internalSKU || '1234',
    projectManager: productData?.projectManager || 'Mike Johnson',
    image: productData?.image || 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400&h=400&fit=crop',
  });

  const handleSaveProductInfo = (updatedInfo: any) => {
    setProductInfo(updatedInfo);
    // Here you would also update the backend and the main table
    console.log('Updated product info:', updatedInfo);
    if (onProductUpdate) {
      onProductUpdate(updatedInfo);
    }
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
              <h1 className="text-3xl font-bold text-slate-900">Scan Sling Padded Harness</h1>
              <p className="text-sm text-slate-500 mt-1">Complete product sourcing information and supplier details</p>
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Product Overview */}
          <div className="grid grid-cols-12 gap-6">
            {/* Product Image */}
            <div className="col-span-3">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-6 border border-slate-200">
                <img
                  src={productInfo.image}
                  alt="Product"
                  className="w-full h-48 object-cover rounded-lg"
                />
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
                    <div className="text-xs font-semibold text-slate-500 mb-1">Client</div>
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
                    <div className="text-sm font-semibold text-slate-900">{productInfo.vendor}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Status</div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
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
                    <div className="text-sm font-semibold text-slate-900">{productInfo.projectManager}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 px-6">
              <div className="flex gap-8">
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
                      Add Vendor
                    </motion.button>
                  </div>

                  {/* Split View Layout */}
                  <div className="grid grid-cols-12 gap-6">
                    {/* Left Side - Vendor Cards */}
                    <div className="col-span-5 space-y-4">
                      {/* Priority Badge */}
                      <div className="relative">
                        <div className="absolute -top-2 left-4 z-10">
                          <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Priority #1
                          </div>
                        </div>

                        {/* Vendor Card */}
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          onClick={() => setExpandedVendor(expandedVendor === mockVendor.id ? null : mockVendor.id)}
                          className={`bg-white rounded-2xl border-2 p-5 pt-8 cursor-pointer transition-all ${
                            expandedVendor === mockVendor.id
                              ? 'border-purple-400 shadow-xl shadow-purple-100 ring-2 ring-purple-200'
                              : 'border-slate-200 hover:border-slate-300 shadow-md'
                          }`}
                        >
                          {/* Header with Icon and Name */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-900 mb-1">{mockVendor.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                United States
                              </div>
                              <span className="inline-flex items-center px-2.5 py-1 mt-2 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                {mockVendor.type}
                              </span>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                              <div className="text-xs font-semibold text-slate-500 mb-1">Best Price</div>
                              <div className="text-2xl font-bold text-slate-900">$2.68</div>
                              <div className="text-xs font-semibold text-emerald-600">DDP Available</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-500 mb-1">Min Order</div>
                              <div className="text-2xl font-bold text-slate-900">10K</div>
                              <div className="text-xs text-slate-500">units</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-500 mb-1">Lead Time</div>
                              <div className="text-lg font-bold text-slate-900">43-93 days</div>
                              <div className="text-xs text-slate-500">range</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-500 mb-1">Price Tiers</div>
                              <div className="text-lg font-bold text-slate-900">15</div>
                              <div className="text-xs text-slate-500">options</div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="border-t border-slate-200 pt-4 mb-4 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-medium">Patrick Lowenthal</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              pblowenthal@gmail.com
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              (180) 021 - 4340
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setVendorToEdit(mockVendor);
                                setIsAddVendorDrawerOpen(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>

                          {/* View Details Toggle */}
                          {expandedVendor === mockVendor.id && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedVendor(null);
                                }}
                                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                              >
                                Viewing pricing details
                                <ChevronUp className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    {/* Right Side - Pricing Details */}
                    <div className="col-span-7">
                      {expandedVendor ? (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden"
                        >
                          {/* Vibrant Purple Header */}
                          <div className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 px-6 py-5 flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-1">Detailed Pricing Breakdown</h3>
                              <p className="text-sm text-purple-100">SC Promo - All Tiers & Shipping Methods</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                              <div className="text-xs text-white/80 font-medium">Tiers</div>
                              <div className="text-2xl font-bold text-white">15</div>
                            </div>
                          </div>

                          {/* Summary Cards */}
                          <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 border-b border-slate-200">
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Lowest Unit Price</div>
                              <div className="text-2xl font-bold text-emerald-600">$2.68</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Fastest Lead Time</div>
                              <div className="text-2xl font-bold text-blue-600">43 days</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Shipping Options</div>
                              <div className="text-2xl font-bold text-purple-600">3 Methods</div>
                            </div>
                          </div>

                          {/* Pricing Table */}
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
                                {mockVendor.pricingTiers?.map((tier, index) => (
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
                                    <td className="px-4 py-3 text-sm font-bold text-slate-900">${(tier.ddpPrice * tier.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
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
                </div>
              )}

              {activeTab === 'specifications' && (
                <SpecificationsTab />
              )}

              {activeTab === 'packaging' && (
                <PackagingTab />
              )}

              {activeTab === 'samples' && (
                <SamplesTab />
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
        onClose={() => setIsAddVendorDrawerOpen(false)}
        vendorToEdit={vendorToEdit}
      />

      {/* Order Sample Drawer */}
      <OrderSampleDrawer
        isOpen={isOrderSampleDrawerOpen}
        onClose={() => setIsOrderSampleDrawerOpen(false)}
        productName={productInfo.name}
        clientName={productInfo.client}
        competitorLink=""
        onSuccess={() => {
          // Refresh or update data if needed
          setIsOrderSampleDrawerOpen(false);
        }}
      />

      {/* Edit Product Info Drawer */}
      <EditProductInfoDrawer
        isOpen={isEditProductInfoDrawerOpen}
        onClose={() => setIsEditProductInfoDrawerOpen(false)}
        productId={productId}
        productInfo={productInfo}
        onSave={handleSaveProductInfo}
      />
    </div>
  );
}