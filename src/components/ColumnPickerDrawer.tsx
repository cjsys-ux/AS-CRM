import { motion, AnimatePresence } from 'motion/react';
import { X, Columns2, Check } from 'lucide-react';

export const COLUMNS = [
  { id: 'image',          label: 'Image' },
  { id: 'projectNumber',  label: 'Project #' },
  { id: 'name',           label: 'Product Name' },
  { id: 'client',         label: 'Customer' },
  { id: 'vendor',         label: 'Vendor' },
  { id: 'status',         label: 'Status' },
  { id: 'progress',       label: 'Progress' },
  { id: 'type',           label: 'Type' },
  { id: 'internalSKU',    label: 'Internal SKU' },
  { id: 'projectManager', label: 'Project Manager' },
  { id: 'priority',       label: 'Priority' },
  { id: 'yearlyQty',      label: 'Yearly Qty' },
  { id: 'pricePerUnit',   label: 'Price/Unit' },
  { id: 'totalValue',     label: 'Total Value' },
  { id: 'deployment',     label: 'Deployment' },
  { id: 'actions',        label: 'Actions' },
] as const;

export type ColumnId = typeof COLUMNS[number]['id'];

interface ColumnPickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (columns: Set<ColumnId>) => void;
  pendingColumns: Set<ColumnId>;
  onToggleColumn: (id: ColumnId) => void;
  onSelectAll: () => void;
}

export function ColumnPickerDrawer({
  isOpen,
  onClose,
  onApply,
  pendingColumns,
  onToggleColumn,
  onSelectAll,
}: ColumnPickerDrawerProps) {
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

      {/* Panel */}
      <motion.div
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-green-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Columns2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Column Visibility</h2>
              <p className="text-green-100 text-sm">{pendingColumns.size} of {COLUMNS.length} columns visible</p>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <p
            onClick={onSelectAll}
            className="text-xs font-semibold text-slate-500 mb-4 cursor-pointer hover:text-slate-800 transition-colors"
          >
            Select All
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {COLUMNS.map((col) => {
              const active = pendingColumns.has(col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => onToggleColumn(col.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 w-full transition-all border-2 ${
                    active
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {active ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        <Check className="w-3 h-3 shrink-0" />
                      </motion.span>
                    ) : (
                      <motion.span key="empty" className="w-3 h-3 shrink-0 rounded-sm border border-slate-300" />
                    )}
                  </AnimatePresence>
                  <span className="truncate">{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Discard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onApply(pendingColumns)}
            className="flex-1 px-6 py-3 bg-green-600 rounded-xl text-white font-semibold hover:bg-green-700 transition-colors shadow-lg"
          >
            Apply
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
