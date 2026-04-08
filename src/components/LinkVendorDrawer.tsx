import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Building2, MapPin, Check, Star, ChevronDown } from 'lucide-react';
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
  existingVendorIds?: string[];  // can be ids, globalVendorIds, or names
  onVendorLinked?: () => void;
}

export function LinkVendorDrawer({
  isOpen,
  onClose,
  productId,
  existingVendorIds = [],
  onVendorLinked,
}: LinkVendorDrawerProps) {
  const [vendors, setVendors] = useState<GlobalVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<GlobalVendor | null>(null);
  const [linking, setLinking] = useState(false);
  const [priority, setPriority] = useState('Primary');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm('');
    setSelectedVendor(null);
    setPriority('Primary');
    setShowPriorityDropdown(false);
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

  // Match by id, globalVendorId, OR name — covers all data regardless of how it was stored
  const resolveName = (v: GlobalVendor) => v.vendorName || v.name || '';
  const isLinked = (v: GlobalVendor) => {
    const name = resolveName(v).toLowerCase();
    return existingVendorIds.some(e => e === v.id || e.toLowerCase() === name);
  };

  const availableVendors = vendors.filter(v => {
    const notLinked = !isLinked(v);
    const term = searchTerm.toLowerCase();
    const matches = !term ||
      v.name?.toLowerCase().includes(term) ||
      (v.country || '').toLowerCase().includes(term) ||
      (v.contactName || '').toLowerCase().includes(term);
    return notLinked && matches;
  });

  const alreadyLinkedVendors = vendors.filter(v => isLinked(v));

  const getVendorTypeColor = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('manufacturer')) return 'bg-blue-100 text-blue-700';
    if (t.includes('decorator'))    return 'bg-purple-100 text-purple-700';
    if (t.includes('supplier'))     return 'bg-green-100 text-green-700';
    if (t.includes('distributor'))  return 'bg-orange-100 text-orange-700';
    return 'bg-slate-100 text-slate-600';
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
          priority: ['Primary','Secondary','Backup','Other'].indexOf(priority) >= 0 ? ['Primary','Secondary','Backup','Other'].indexOf(priority) : existingVendorIds.length,
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

          {/* Panel — slides in from right, wide like the reference */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 bg-white shadow-2xl z-50 flex flex-col"
            style={{ width: '420px', minWidth: '420px', maxWidth: '420px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 border border-white/30 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Link Vendor</h2>
                  <p className="text-xs text-slate-400">Select an existing vendor from your database</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pt-4 pb-2 flex-shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search vendors by name, contact, or country..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm bg-white transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">

              {/* Selected vendor preview — shown after picking */}
              {selectedVendor && (
                <div className="mb-3 mt-2 bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Selected Vendor</span>
                    </div>
                    <button onClick={() => setSelectedVendor(null)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Change</button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {selectedVendor.logo
                        ? <img src={selectedVendor.logo} alt="" className="w-full h-full object-cover" />
                        : <span className="text-white font-bold text-xs">{selectedVendor.name?.charAt(0)?.toUpperCase()}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900">{selectedVendor.name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedVendor.country && <span className="text-xs text-slate-500 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{selectedVendor.country}</span>}
                        {resolveVendorType(selectedVendor) && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${getVendorTypeColor(resolveVendorType(selectedVendor))}`}>
                            {resolveVendorType(selectedVendor)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Priority picker */}
                  <div className="border-t border-blue-200 pt-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Vendor Priority</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Star className={`w-3.5 h-3.5 ${priority === 'Primary' ? 'text-amber-500 fill-amber-500' : priority === 'Secondary' ? 'text-slate-400 fill-slate-400' : 'text-slate-300'}`} />
                          {priority}
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                      {showPriorityDropdown && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
                          {['Primary', 'Secondary', 'Backup'].map((p) => (
                            <button
                              key={p}
                              onClick={() => { setPriority(p); setShowPriorityDropdown(false); }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${priority === p ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                            >
                              <Star className={`w-3.5 h-3.5 ${p === 'Primary' ? 'text-amber-500 fill-amber-500' : p === 'Secondary' ? 'text-slate-400 fill-slate-400' : 'text-slate-300'}`} />
                              {p}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Available */}
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-3">
                Available Vendors ({availableVendors.length})
              </p>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : availableVendors.length === 0 ? (
                <div className="text-center py-10">
                  <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">
                    {searchTerm ? 'No vendors match your search' : 'All vendors are already linked'}
                  </p>
                </div>
              ) : (
                <div className="space-y-px">
                  {availableVendors.map((vendor) => {
                    const isSelected = selectedVendor?.id === vendor.id;
                    const type = resolveVendorType(vendor);
                    return (
                      <motion.button
                        key={vendor.id}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedVendor(isSelected ? null : vendor)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden transition-colors ${
                          isSelected ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-slate-600 to-slate-700'
                        }`}>
                          {vendor.logo ? (
                            <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-xs">
                              {vendor.name?.charAt(0)?.toUpperCase() || 'V'}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900">{vendor.name}</span>
                            {type && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${getVendorTypeColor(type)}`}>
                                {type}
                              </span>
                            )}
                            {vendor.supportsDropShipping && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-700">
                                Dropship
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {vendor.country && (
                              <span className="text-xs text-slate-400 flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />{vendor.country}
                              </span>
                            )}
                            {vendor.contactName && (
                              <span className="text-xs text-slate-400">{vendor.contactName}</span>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Already Linked */}
              {alreadyLinkedVendors.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Already Linked ({alreadyLinkedVendors.length})
                  </p>
                  <div className="space-y-px">
                    {alreadyLinkedVendors.map((vendor) => (
                      <div key={vendor.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50">
                        <div className="w-8 h-8 bg-slate-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {vendor.logo ? (
                            <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-xs">
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
            <div className="border-t border-slate-200 px-4 py-3 bg-white flex gap-2 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: selectedVendor && !linking ? 1.01 : 1 }}
                whileTap={{ scale: selectedVendor && !linking ? 0.99 : 1 }}
                onClick={handleLinkVendor}
                disabled={!selectedVendor || linking}
                className={`flex-1 px-4 py-2.5 font-medium rounded-xl transition-all text-sm ${
                  selectedVendor && !linking
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
