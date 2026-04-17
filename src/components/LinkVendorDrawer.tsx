import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Building2, MapPin, Mail, Phone, Check, Plus, ChevronDown, Star } from 'lucide-react';
import { useState, useEffect } from 'react';


interface GlobalVendor {
  id: string;
  name: string;
  status?: string;
  // Backend stores as 'type', AddVendorDrawer may also set 'vendorType'
  type?: string;
  vendorType?: string;
  accountType?: string;
  country?: string;
  website?: string;
  // Backend stores as firstName/lastName/email/phone
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactName?: string;
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
  const [priority, setPriority] = useState('Primary');
  const [linking, setLinking] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm('');
    setSelectedVendor(null);
    setPriority('Primary');
    fetchVendors();
  }, [isOpen]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors/list`);
      const data = await res.json();
      if (data.vendors) {
        // The API exposes vendor display name as `vendorName`; normalize to `name`
        // so the rest of the component (search, render, link payload) keeps working.
        setVendors(
          data.vendors.map((v: any) => ({
            ...v,
            name: v.name || v.vendorName || '',
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching global vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const firstName = v.contactFirstName || v.firstName || '';
    const lastName = v.contactLastName || v.lastName || '';
    const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const notAlreadyLinked = !existingVendorIds.includes(v.id);
    return matchesSearch && notAlreadyLinked;
  });

  const alreadyLinkedVendors = vendors.filter(v => existingVendorIds.includes(v.id));

  // Helper to resolve vendor type from multiple possible field names
  const resolveVendorType = (v: GlobalVendor) => v.vendorType || v.type || v.accountType || '';
  const resolveContactName = (v: GlobalVendor) => {
    if (v.contactName) return v.contactName;
    const first = v.contactFirstName || v.firstName || '';
    const last = v.contactLastName || v.lastName || '';
    return [first, last].filter(Boolean).join(' ');
  };
  const resolveContactEmail = (v: GlobalVendor) => v.contactEmail || v.email || '';
  const resolveContactPhone = (v: GlobalVendor) => v.contactPhone || v.phone || '';

  const handleLinkVendor = async () => {
    if (!selectedVendor) return;
    setLinking(true);
    try {
      const priorityNumber = priority === 'Primary' ? 0 : priority === 'Secondary' ? 1 : 2;
      const payload: Record<string, unknown> = {
        productId,
        vendorName: selectedVendor.name,
        globalVendorId: selectedVendor.id,
        status: selectedVendor.status ?? 'Active',
        logo: selectedVendor.logo ?? null,
        contactName: resolveContactName(selectedVendor),
        email: resolveContactEmail(selectedVendor),
        phone: resolveContactPhone(selectedVendor),
        vendorType: resolveVendorType(selectedVendor) || 'Distributor',
        accountType: selectedVendor.accountType ?? 'Standalone',
        website: selectedVendor.website ?? null,
        country: selectedVendor.country ?? null,
        priority: priorityNumber,
        pricingTiers: [],
      };

      const res = await fetch(`/api/pipeline/vendors/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        onVendorLinked?.();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Error linking vendor:', data.error || res.statusText);
      }
    } catch (err) {
      console.error('Error linking vendor:', err);
    } finally {
      setLinking(false);
    }
  };

  const getVendorTypeColor = (type?: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('manufacturer')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (t.includes('decorator')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (t.includes('supplier')) return 'bg-green-100 text-green-700 border-green-200';
    if (t.includes('distributor')) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const priorities = ['Primary', 'Secondary', 'Backup'];

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 drawer-scroll">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search vendors by name, contact, or country..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50 transition-all"
                />
              </div>

              {/* Selected Vendor Preview */}
              {selectedVendor && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Selected Vendor</span>
                    </div>
                    <button
                      onClick={() => setSelectedVendor(null)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {selectedVendor.name?.charAt(0) || 'V'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-900">{selectedVendor.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {selectedVendor.country && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {selectedVendor.country}
                          </span>
                        )}
                        {resolveVendorType(selectedVendor) && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getVendorTypeColor(resolveVendorType(selectedVendor))}`}>
                            {resolveVendorType(selectedVendor)}
                          </span>
                        )}
                        {selectedVendor.supportsDropShipping && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                            Dropship
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Priority Selection */}
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vendor Priority</label>
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
                      <AnimatePresence>
                        {showPriorityDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden"
                          >
                            {priorities.map((p) => (
                              <button
                                key={p}
                                onClick={() => {
                                  setPriority(p);
                                  setShowPriorityDropdown(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${priority === p ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                              >
                                <Star className={`w-3.5 h-3.5 ${p === 'Primary' ? 'text-amber-500 fill-amber-500' : p === 'Secondary' ? 'text-slate-400 fill-slate-400' : 'text-slate-300'}`} />
                                {p}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Vendor List */}
              {!selectedVendor && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Available Vendors ({filteredVendors.length})
                    </h3>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-sm text-slate-400">Loading vendors...</div>
                    </div>
                  ) : filteredVendors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                        <Building2 className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">No vendors found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {searchTerm ? 'Try a different search term' : 'Create vendors in the Vendors module first'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredVendors.map((vendor) => (
                        <motion.button
                          key={vendor.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedVendor(vendor)}
                          className="w-full text-left bg-white border border-slate-200 rounded-xl p-3.5 hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                              <span className="text-white font-bold text-sm">
                                {vendor.name?.charAt(0) || 'V'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{vendor.name}</h4>
                                {resolveVendorType(vendor) && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${getVendorTypeColor(resolveVendorType(vendor))}`}>
                                    {resolveVendorType(vendor)}
                                  </span>
                                )}
                                {vendor.supportsDropShipping && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200">
                                    Dropship
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                {vendor.country && (
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {vendor.country}
                                  </span>
                                )}
                                {resolveContactName(vendor) && (
                                  <span className="text-xs text-slate-500">
                                    {resolveContactName(vendor)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-5 h-5 text-blue-500" />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Already linked section */}
                  {alreadyLinkedVendors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                        Already Linked ({alreadyLinkedVendors.length})
                      </h3>
                      {alreadyLinkedVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl opacity-60 mb-2"
                        >
                          <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {vendor.name?.charAt(0) || 'V'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-600">{vendor.name}</h4>
                          </div>
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-3.5 bg-slate-50 flex gap-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all text-sm"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLinkVendor}
                disabled={!selectedVendor || linking}
                className={`flex-1 px-4 py-2.5 font-semibold rounded-xl transition-all text-sm ${
                  selectedVendor && !linking
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
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