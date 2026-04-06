import { motion, AnimatePresence } from 'motion/react';
import { X, Columns3, Check, GripVertical } from 'lucide-react';
import { useEffect } from 'react';

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
  const allSelected = pendingColumns.size === COLUMNS.length;
  const visibleCount = pendingColumns.size;

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9998]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[360px] max-w-[90vw] bg-white shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                  <Columns3 className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Toggle Columns</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{visibleCount} of {COLUMNS.length} visible</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5 text-white" />
              </button>
            </div>

            {/* Columns label + Deselect All / Select All */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-100 shrink-0">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Columns</span>
              <button
                onClick={onSelectAll}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Column List */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <div className="space-y-0.5">
                {COLUMNS.map((col, idx) => {
                  const isVisible = pendingColumns.has(col.id);
                  return (
                    <motion.div
                      key={col.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isVisible ? 'bg-slate-50 hover:bg-slate-100' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0 cursor-grab" />

                      {/* Toggle switch */}
                      <button
                        onClick={() => onToggleColumn(col.id)}
                        className={`relative w-8 h-[18px] rounded-full transition-colors shrink-0 ${isVisible ? 'bg-slate-700' : 'bg-slate-200'}`}
                      >
                        <motion.div
                          animate={{ x: isVisible ? 14 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm"
                        />
                      </button>

                      {/* Label */}
                      <span className={`flex-1 text-left text-sm ${isVisible ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                        {col.label}
                      </span>

                      {/* Check indicator */}
                      {isVisible && (
                        <Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-3 shrink-0">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => onApply(pendingColumns)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
