import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Edit, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkEdit: () => void;
  onBulkDelete: () => void;
}

export function BulkActionBar({ selectedCount, onClearSelection, onBulkEdit, onBulkDelete }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-blue-400"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                {selectedCount}
              </div>
              <span className="font-medium">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBulkEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClearSelection}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
