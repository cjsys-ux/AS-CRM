import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Search, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';


interface Vendor {
  id: string;
  name: string;
  type: string;
  priority: string;
}

interface VendorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVendor: string;
  onSelectVendor: (vendor: Vendor) => void;
}

export function VendorSelector({ isOpen, onClose, selectedVendor, onSelectVendor }: VendorSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setVendors([]);
    setLoading(false);
  }, [isOpen]);

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectVendor = (vendor: Vendor) => {
    onSelectVendor(vendor);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    if (priority === '1st Choice') return 'bg-green-100 text-green-700 border-green-200';
    if (priority === '2nd Choice') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Select Vendor</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Vendors List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-16 h-16 text-slate-300 mx-auto mb-3 animate-spin" />
                  <p className="text-slate-600 font-medium">Loading vendors...</p>
                </div>
              )}

              {!loading && filteredVendors.map((vendor) => {
                const isSelected = vendor.name === selectedVendor;
                
                return (
                  <motion.button
                    key={vendor.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectVendor(vendor)}
                    className={`w-full p-4 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-purple-50 border-2 border-purple-300 shadow-md'
                        : 'bg-slate-50 hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-purple-100' : 'bg-slate-100'
                        }`}>
                          <Building2 className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-slate-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold ${isSelected ? 'text-purple-900' : 'text-slate-900'}`}>
                              {vendor.name}
                            </p>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              >
                                <Check className="w-5 h-5 text-purple-600" />
                              </motion.div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">{vendor.type}</span>
                            <span className="text-slate-300">•</span>
                            <span className={`text-xs px-2 py-1 rounded-md border font-semibold ${getPriorityColor(vendor.priority)}`}>
                              {vendor.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {!loading && filteredVendors.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No vendors found</p>
                  <p className="text-slate-500 text-sm mt-1">Try a different search</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}