import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Package, Plus, Link as LinkIcon, MapPin, ChevronDown, Check, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';


type OrderSampleDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  clientName?: string;
  competitorLink?: string;
  productId?: string;
  onSuccess?: () => void;
};

export function OrderSampleDrawer({
  isOpen,
  onClose,
  productName = 'Scan Sling Padded Harness',
  clientName = 'Amazon',
  competitorLink = '',
  productId,
  onSuccess
}: OrderSampleDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sampleType, setSampleType] = useState<'competitor' | 'pre-production'>('competitor');
  const [variants, setVariants] = useState([
    { id: '1', sku: '', size: '', color: '', qty: 1, costPerUnit: 0 }
  ]);
  const [vendor, setVendor] = useState('Ergodyne');
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [destinations, setDestinations] = useState<Array<{
    id: string;
    name: string;
    allocations: { [variantId: string]: number };
    location: string;
    customAddress?: {
      name: string;
      street: string;
      city: string;
      state: string;
      zip: string;
      type: string;
    };
  }>>([
    { id: '1', name: 'Destination #1', allocations: {}, location: 'Activate Swag Warehouse' }
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [inHandsDate, setInHandsDate] = useState('');

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now().toString(), sku: '', size: '', color: '', qty: 1, costPerUnit: 0 }
    ]);
  };

  const handleUpdateVariant = (id: string, field: string, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const handleAddDestination = () => {
    // When adding a new destination, auto-allocate variant quantities
    const newDestinationId = Date.now().toString();
    const newAllocations: { [variantId: string]: number } = {};
    
    // If this is the first destination being added (going from 1 to 2), split quantities
    if (destinations.length === 1) {
      // Clear existing allocations and split evenly
      variants.forEach(variant => {
        newAllocations[variant.id] = 0;
      });
      setDestinations([
        { ...destinations[0], allocations: {} },
        { id: newDestinationId, name: `Destination #${destinations.length + 1}`, allocations: newAllocations, location: 'Activate Swag Warehouse' }
      ]);
    } else {
      // Just add empty destination
      variants.forEach(variant => {
        newAllocations[variant.id] = 0;
      });
      setDestinations([
        ...destinations,
        { id: newDestinationId, name: `Destination #${destinations.length + 1}`, allocations: newAllocations, location: 'Activate Swag Warehouse' }
      ]);
    }
  };

  const handleRemoveDestination = (id: string) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter(d => d.id !== id));
    }
  };

  const handleUpdateDestinationAllocation = (destId: string, variantId: string, quantity: number) => {
    setDestinations(destinations.map(dest => 
      dest.id === destId 
        ? { ...dest, allocations: { ...dest.allocations, [variantId]: quantity } }
        : dest
    ));
  };

  const getVariantTotalAllocated = (variantId: string) => {
    return destinations.reduce((sum, dest) => sum + (dest.allocations[variantId] || 0), 0);
  };

  const getDestinationTotalAllocated = (destId: string) => {
    const dest = destinations.find(d => d.id === destId);
    if (!dest) return 0;
    return Object.values(dest.allocations).reduce((sum: number, qty: number) => sum + qty, 0);
  };

  const totalQuantity = variants.reduce((sum, v) => sum + v.qty, 0);
  const totalCost = variants.reduce((sum, v) => sum + (v.qty * v.costPerUnit), 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/pipeline/sample-orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId ?? 'unknown',
          productName,
          clientName,
          sampleType,
          variants,
          vendor,
          destinations,
          additionalNotes,
          inHandsDate: inHandsDate || null,
          competitorLink,
          totalCost,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit sample order');
      toast.success('Sample order submitted successfully');
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to submit sample order');
    } finally {
      setIsSubmitting(false);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Order Sample</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Request samples for product analysis and comparison</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-5">
                {/* Product Details */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Product Information</label>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Product:</span> {productName}
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Client:</span> {clientName}
                    </p>
                  </div>
                  {competitorLink && (
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
                      <LinkIcon className="w-4 h-4" />
                      View Competitor Product
                    </button>
                  )}
                </div>

                {/* Sample Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Sample Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSampleType('competitor')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        sampleType === 'competitor'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          sampleType === 'competitor' ? 'border-blue-500' : 'border-slate-300'
                        }`}>
                          {sampleType === 'competitor' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Competitor Sample</p>
                          <p className="text-xs text-slate-600 mt-0.5">For product analysis</p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSampleType('pre-production')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        sampleType === 'pre-production'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          sampleType === 'pre-production' ? 'border-blue-500' : 'border-slate-300'
                        }`}>
                          {sampleType === 'pre-production' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Pre-Production Sample</p>
                          <p className="text-xs text-slate-600 mt-0.5">For quality verification</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Sample Variants */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-900">Sample Variants</label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddVariant}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variants
                    </motion.button>
                  </div>

                  {variants.map((variant, index) => (
                    <div key={variant.id} className="mb-4 p-4 bg-white border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900">SKU #{index + 1}</h4>
                        {variants.length > 1 && (
                          <button
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">SKU</label>
                          <input
                            type="text"
                            placeholder="e.g., 3132"
                            value={variant.sku}
                            onChange={(e) => handleUpdateVariant(variant.id, 'sku', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Size</label>
                          <input
                            type="text"
                            placeholder="e.g., Medium"
                            value={variant.size}
                            onChange={(e) => handleUpdateVariant(variant.id, 'size', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Color</label>
                          <input
                            type="text"
                            placeholder="e.g., Black"
                            value={variant.color}
                            onChange={(e) => handleUpdateVariant(variant.id, 'color', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Qty</label>
                          <input
                            type="text"
                            placeholder="1"
                            value={variant.qty}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty or valid numbers
                              if (value === '') {
                                handleUpdateVariant(variant.id, 'qty', '');
                              } else {
                                const num = parseInt(value);
                                if (!isNaN(num) && num >= 1) {
                                  handleUpdateVariant(variant.id, 'qty', num);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              // Reset to 1 if empty or invalid on blur
                              if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                handleUpdateVariant(variant.id, 'qty', 1);
                              }
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Cost/Unit</label>
                          <input
                            type="text"
                            placeholder="0.00"
                            value={variant.costPerUnit === 0 ? '' : variant.costPerUnit}
                            onFocus={(e) => {
                              if (variant.costPerUnit === 0) {
                                e.target.value = '';
                              } else {
                                e.target.select();
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty, decimal point, or valid numbers
                              if (value === '' || value === '.') {
                                handleUpdateVariant(variant.id, 'costPerUnit', '');
                              } else {
                                const num = parseFloat(value);
                                if (!isNaN(num) && num >= 0) {
                                  handleUpdateVariant(variant.id, 'costPerUnit', value);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              // Reset to 0 if empty or invalid on blur
                              const value = e.target.value;
                              if (value === '' || value === '.' || isNaN(parseFloat(value))) {
                                handleUpdateVariant(variant.id, 'costPerUnit', 0);
                              } else {
                                handleUpdateVariant(variant.id, 'costPerUnit', parseFloat(value));
                              }
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsVendorDropdownOpen(!isVendorDropdownOpen)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center justify-between"
                    >
                      <span className="text-slate-900">{vendor}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isVendorDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isVendorDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-10 overflow-hidden"
                        >
                          {['Ergodyne', 'Vendor 2', 'Vendor 3'].map((vendorOption) => (
                            <button
                              key={vendorOption}
                              onClick={() => {
                                setVendor(vendorOption);
                                setIsVendorDropdownOpen(false);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-3"
                            >
                              <Check 
                                className={`w-4 h-4 ${vendor === vendorOption ? 'text-slate-900' : 'text-transparent'}`} 
                              />
                              <span className={vendor === vendorOption ? 'text-slate-900 font-medium' : 'text-slate-700'}>
                                {vendorOption}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Shipment Destinations */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide text-slate-600">
                      Shipment Destinations
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddDestination}
                      className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Split Shipment
                    </motion.button>
                  </div>

                  {destinations.map((dest, destIndex) => {
                    const destAllocatedTotal = getDestinationTotalAllocated(dest.id);
                    
                    return (
                      <div key={dest.id} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-900">
                            {dest.name} ({destAllocatedTotal} units)
                          </h4>
                          {destinations.length > 1 && (
                            <button
                              onClick={() => handleRemoveDestination(dest.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-slate-700 mb-2">Variant Quantities</label>
                          <div className="space-y-2">
                            {variants.map((variant, varIndex) => {
                              // If only one destination, default allocation to variant qty
                              const defaultAllocation = destinations.length === 1 ? variant.qty : 0;
                              const allocated = dest.allocations[variant.id] !== undefined ? dest.allocations[variant.id] : defaultAllocation;
                              const totalAllocated = getVariantTotalAllocated(variant.id);
                              const remaining = variant.qty - totalAllocated;
                              const isOverAllocated = totalAllocated > variant.qty;
                              
                              return (
                                <div key={variant.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-700 mb-1">
                                      SKU #{varIndex + 1} {variant.sku && `(${variant.sku})`}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      Available: {variant.qty} | Allocated across all: {totalAllocated}
                                      {isOverAllocated && (
                                        <span className="text-red-600 font-medium ml-1">
                                          (Over by {totalAllocated - variant.qty})
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="0"
                                    value={allocated === 0 ? '' : allocated}
                                    onFocus={(e) => {
                                      if (allocated === 0) {
                                        e.target.value = '';
                                      } else {
                                        e.target.select();
                                      }
                                    }}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === '') {
                                        handleUpdateDestinationAllocation(dest.id, variant.id, 0);
                                      } else {
                                        const num = parseInt(value);
                                        if (!isNaN(num) && num >= 0) {
                                          handleUpdateDestinationAllocation(dest.id, variant.id, num);
                                        }
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === '') {
                                        handleUpdateDestinationAllocation(dest.id, variant.id, 0);
                                      }
                                    }}
                                    className={`w-20 px-3 py-2 bg-white border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                      isOverAllocated ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                            Allocated for this destination: {destAllocatedTotal} / {totalQuantity} units
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-medium text-slate-700 mb-2">Saved Location</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                              value={dest.location}
                              onChange={(e) => {
                                const newLocation = e.target.value;
                                setDestinations(destinations.map(d => 
                                  d.id === dest.id ? { 
                                    ...d, 
                                    location: newLocation,
                                    // Initialize custom address if switching to Other Location
                                    customAddress: newLocation === 'Other Location' && !d.customAddress ? {
                                      name: '',
                                      street: '',
                                      city: '',
                                      state: '',
                                      zip: '',
                                      type: 'Commercial'
                                    } : d.customAddress
                                  } : d
                                ));
                              }}
                              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                            >
                              <option value="Activate Swag Warehouse">Activate Swag Warehouse</option>
                              <option value="Other Location">Other Location</option>
                            </select>
                          </div>
                        </div>

                        {dest.location === 'Other Location' ? (
                          <div className="space-y-3">
                            {/* Custom Address Input Fields */}
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Address Name</label>
                              <input
                                type="text"
                                placeholder="e.g., Client Office"
                                value={dest.customAddress?.name || ''}
                                onChange={(e) => {
                                  setDestinations(destinations.map(d => 
                                    d.id === dest.id ? {
                                      ...d,
                                      customAddress: {
                                        ...d.customAddress!,
                                        name: e.target.value
                                      }
                                    } : d
                                  ));
                                }}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Street Address</label>
                              <input
                                type="text"
                                placeholder="e.g., 123 Main Street"
                                value={dest.customAddress?.street || ''}
                                onChange={(e) => {
                                  setDestinations(destinations.map(d => 
                                    d.id === dest.id ? {
                                      ...d,
                                      customAddress: {
                                        ...d.customAddress!,
                                        street: e.target.value
                                      }
                                    } : d
                                  ));
                                }}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-1">
                                <label className="block text-xs font-medium text-slate-700 mb-2">City</label>
                                <input
                                  type="text"
                                  placeholder="City"
                                  value={dest.customAddress?.city || ''}
                                  onChange={(e) => {
                                    setDestinations(destinations.map(d => 
                                      d.id === dest.id ? {
                                        ...d,
                                        customAddress: {
                                          ...d.customAddress!,
                                          city: e.target.value
                                        }
                                      } : d
                                    ));
                                  }}
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                              </div>

                              <div className="col-span-1">
                                <label className="block text-xs font-medium text-slate-700 mb-2">State</label>
                                <input
                                  type="text"
                                  placeholder="ST"
                                  value={dest.customAddress?.state || ''}
                                  onChange={(e) => {
                                    setDestinations(destinations.map(d => 
                                      d.id === dest.id ? {
                                        ...d,
                                        customAddress: {
                                          ...d.customAddress!,
                                          state: e.target.value
                                        }
                                      } : d
                                    ));
                                  }}
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                              </div>

                              <div className="col-span-1">
                                <label className="block text-xs font-medium text-slate-700 mb-2">ZIP</label>
                                <input
                                  type="text"
                                  placeholder="12345"
                                  value={dest.customAddress?.zip || ''}
                                  onChange={(e) => {
                                    setDestinations(destinations.map(d => 
                                      d.id === dest.id ? {
                                        ...d,
                                        customAddress: {
                                          ...d.customAddress!,
                                          zip: e.target.value
                                        }
                                      } : d
                                    ));
                                  }}
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Address Type</label>
                              <select
                                value={dest.customAddress?.type || 'Commercial'}
                                onChange={(e) => {
                                  setDestinations(destinations.map(d => 
                                    d.id === dest.id ? {
                                      ...d,
                                      customAddress: {
                                        ...d.customAddress!,
                                        type: e.target.value
                                      }
                                    } : d
                                  ));
                                }}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              >
                                <option value="Commercial">Commercial</option>
                                <option value="Residential">Residential</option>
                              </select>
                            </div>

                            {/* Display the entered address */}
                            {dest.customAddress && (dest.customAddress.name || dest.customAddress.street) && (
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                {dest.customAddress.name && (
                                  <p className="font-semibold text-slate-900 text-sm mb-1">{dest.customAddress.name}</p>
                                )}
                                {dest.customAddress.street && (
                                  <p className="text-xs text-slate-600">
                                    {dest.customAddress.street}
                                    {dest.customAddress.city && `, ${dest.customAddress.city}`}
                                    {dest.customAddress.state && `, ${dest.customAddress.state}`}
                                    {dest.customAddress.zip && ` ${dest.customAddress.zip}`}
                                  </p>
                                )}
                                <p className="text-xs text-blue-600 font-medium mt-1">{dest.customAddress.type}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="font-semibold text-slate-900 text-sm mb-1">Activate Swag Warehouse</p>
                            <p className="text-xs text-slate-600">2726 NW 72nd Avenue, Miami, FL 33122</p>
                            <p className="text-xs text-blue-600 font-medium mt-1">Commercial</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Total SKUs</p>
                      <p className="text-xl font-bold text-slate-900">{variants.length}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Total Quantity</p>
                      <p className="text-xl font-bold text-slate-900">{totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Total Cost</p>
                      <p className="text-xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Any special instructions or notes for this sample order..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* In-Hands Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    In-Hands Date (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={inHandsDate}
                      onChange={(e) => setInHandsDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-200 bg-white">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Sample Order'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}