import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Building2, MapPin, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface GlobalVendor {
  id: string;
  name: string;
  status?: string;
  vendorType?: string;
  type?: string;
  accountType?: string;
  country?: string;
  website?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  logo?: string;
  supportsDropShipping?: boolean;
}

interface LinkVendorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  existingVendorIds?: string[];
  onVendorLinked?: () => void;
}

export function LinkVendorDrawer({ isOpen, onClose, productId, existingVendorIds = [], onVendorLinked }: LinkVendorDrawerProps) {
  const [vendors, setVendors] = useState<GlobalVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<GlobalVendor | null>(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm('');
    setSelectedVendor(null);
    fetchVendors();
  }, [isOpen]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendors/list');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setVendors((data.vendors ?? []).map((v: any) => ({
        id: v.id,
        name: v.vendorName || v.name || '',
        status: v.status,
        vendorType: v.vendorType,
        type: v.vendorType || v.type,
        accountType: v.accountType,
        country: v.country,
        website: v.website,
        contactName: v.contactName,
        email: v.email,
        phone: v.phone,
        logo: v.logo,
        supportsDropShipping: v.supportsDropShipping,
      })));
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const resolveVendorType = (v: GlobalVendor) => v.vendorType || v.type || v.accountType || '';

  const availableVendors = vendors.filter(v => {
    const notLinked = !existingVendorIds.includes(v.id);
    const term = searchTerm.toLowerCase();
    const matches = !term ||
      v.name?.toLowerCase().includes(term) ||
      (v.country || '').toLowerCase().includes(term) ||
      (v.contactName || '').toLowerCase().includes(term);
    return notLinked && matches;
  });

  const alreadyLinkedVendors = vendors.filter(v => existingVendorIds.includes(v.id));

  const getVendorTypeColor = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('manufacturer')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (t.includes('decorator'))    return 'bg-purple-100 text-purple-700 border-purple-200';
    if (t.includes('supplier'))     return 'bg-green-100 text-green-700 border-green-200';
    if (t.includes('distributor'))  return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleLinkVendor = async () => {
    if (!selectedVendor) return;
    setLinking(true);
    try {
      const res = await fetch('/api/pipeline/vendors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          vendorName: selectedVendor.name,
          logo: selectedVendor.logo ?? null,
          status: selectedVendor.status ?? 'Active',
          contactName: selectedVendor.contactName ?? null,
          email: selectedVendor.email ?? null,
          phone: selectedVendor.phone ?? null,
          vendorType: resolveVendorType(selectedVendor) || 'Distributor',
          accountType: selectedVendor.accountType ?? 'Standalone',
          website: selectedVendor.website ?? null,
          country: selectedVendor.country ?? null,
          supportsDropShipping: selectedVendor.supportsDropShipping ?? false,
          priority: existingVendorIds.length,
          moq: null,
          pricingTiers: [],
          globalVendorId: selectedVendor.id,
        }),
      });
      if (!res.ok) throw new Error('Failed to link vendor');
      toast.success(`${selectedVendor.name} linked successfully`);
      onVendorLinked?.();
      onClose();
    } catch {
      toast.error('Failed to link vendor');
    } finally {
      setLinking(false);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Link Vendor</h2>
                  <p className="text-xs text-slate-300">Select an existing vendor from your database</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-4 pb-2 flex-shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search vendors by name, contact, or country..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Content — scrollable list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">

              {/* Available Vendors */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Available Vendors ({availableVendors.length})
                </p>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : availableVendors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                      <Building2 className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No vendors found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm ? 'Try a different search term' : 'Add vendors in the Vendors module first'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableVendors.map((vendor) => {
                      const isSelected = selectedVendor?.id === vendor.id;
                      const type = resolveVendorType(vendor);
                      return (
                        <motion.button
                          key={vendor.id}
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setSelectedVendor(isSelected ? null : vendor)}
                          className={`w-full text-left rounded-xl p-3.5 border-2 transition-all ${
                            isSelected
                              ? 'border-blue-400 bg-blue-50/50 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                                : 'bg-gradient-to-br from-slate-600 to-slate-700'
                            }`}>
                              {vendor.logo ? (
                                <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white font-bold text-sm">
                                  {vendor.name?.charAt(0)?.toUpperCase() || 'V'}
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-sm font-bold text-slate-900 truncate">{vendor.name}</span>
                                {type && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${getVendorTypeColor(type)}`}>
                                    {type}
                                  </span>
                                )}
                                {vendor.supportsDropShipping && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200">
                                    Dropship
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {vendor.country && (
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    {vendor.country}
                                  </span>
                                )}
                                {vendor.contactName && (
                                  <span className="text-xs text-slate-500 truncate">{vendor.contactName}</span>
                                )}
                              </div>
                            </div>

                            {/* Selected check */}
                            {isSelected && (
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Already Linked */}
              {alreadyLinkedVendors.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                    Already Linked ({alreadyLinkedVendors.length})
                  </p>
                  <div className="space-y-2">
                    {alreadyLinkedVendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {vendor.logo ? (
                            <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {vendor.name?.charAt(0)?.toUpperCase() || 'V'}
                            </span>
                          )}
                        </div>
                        <span className="flex-1 text-sm font-medium text-slate-500 truncate">{vendor.name}</span>
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-4 bg-slate-50 flex gap-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all text-sm"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: selectedVendor && !linking ? 1.02 : 1 }}
                whileTap={{ scale: selectedVendor && !linking ? 0.98 : 1 }}
                onClick={handleLinkVendor}
                disabled={!selectedVendor || linking}
                className={`flex-1 px-4 py-2.5 font-semibold rounded-xl transition-all text-sm ${
                  selectedVendor && !linking
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {linking ? 'Linking...' : 'Link Vendor'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
