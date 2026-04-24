import { motion } from 'motion/react';
import { X, Filter } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { useState } from 'react';

interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  availableClients: string[];
  availableStatuses: string[];
  availableTypes: string[];
}

export function AdvancedFilterPanel({ 
  isOpen, 
  onClose, 
  onApply,
  availableClients = ['Amazon'],
  availableStatuses = ['New Product', 'In Progress', 'Ready For Live', 'Live'],
  availableTypes = ['Deploy', 'Both', 'Inventory']
}: AdvancedFilterPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      client: selectedClient,
      type: selectedType,
      priority: selectedPriority,
      priceRange: [minPrice || '0', maxPrice || '1000']
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedStatus('all');
    setSelectedClient('all');
    setSelectedType('all');
    setSelectedPriority('all');
    setMinPrice('');
    setMaxPrice('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
      />

      {/* Filter Panel */}
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 top-0 bottom-0 w-[450px] bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Advanced Filters</h2>
              <p className="text-blue-100 text-sm">Refine your product search</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Filter Options */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Status</label>
            <FilterDropdown
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...availableStatuses.map(status => ({ value: status, label: status }))
              ]}
              fullWidth
            />
          </div>

          {/* Client Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Client</label>
            <FilterDropdown
              value={selectedClient}
              onChange={setSelectedClient}
              options={[
                { value: 'all', label: 'All Clients' },
                ...availableClients.map(client => ({ value: client, label: client }))
              ]}
              fullWidth
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Type</label>
            <FilterDropdown
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { value: 'all', label: 'All Types' },
                ...availableTypes.map(type => ({ value: type, label: type }))
              ]}
              fullWidth
            />
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Priority</label>
            <FilterDropdown
              value={selectedPriority}
              onChange={setSelectedPriority}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' }
              ]}
              fullWidth
            />
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Price Range (per unit)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-2">Min Price</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">Max Price</label>
                <input
                  type="number"
                  placeholder="$1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClear}
            className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Clear All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg"
          >
            Apply Filters
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}