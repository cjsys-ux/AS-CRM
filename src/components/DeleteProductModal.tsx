import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

export function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: DeleteProductModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
            >
              {/* Header with gradient warning */}
              <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-rose-600 px-8 py-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-400/20 rounded-full blur-2xl" />
                
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                      className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                    >
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Delete Product
                      </h2>
                      <p className="text-red-100 text-sm">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-6">
                  <p className="text-slate-700 text-lg mb-3">
                    Are you sure you want to delete{' '}
                    <span className="font-bold text-slate-900">{productName}</span>?
                  </p>
                  <p className="text-slate-600 text-sm">
                    This will permanently remove the product from the pipeline. All associated data will be lost.
                  </p>
                </div>

                {/* Warning box */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">
                        Warning
                      </h4>
                      <p className="text-sm text-red-700">
                        This action is permanent and cannot be reversed. Make sure you want to proceed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all"
                  >
                    Delete Product
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
