import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  itemName 
}: DeleteConfirmationModalProps) {
  
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header with Icon */}
              <div className="bg-gradient-to-r from-red-500 via-red-600 to-rose-600 px-8 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                      className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                    >
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{title}</h2>
                      <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-8">
                <p className="text-slate-700 text-base leading-relaxed mb-2">
                  {message}
                </p>
                {itemName && (
                  <div className="mt-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                    <p className="text-sm font-semibold text-slate-600 mb-1">Item to be deleted:</p>
                    <p className="text-base font-bold text-slate-900">{itemName}</p>
                  </div>
                )}
              </div>

              {/* Footer with Actions */}
              <div className="border-t-2 border-slate-200 px-8 py-6 bg-slate-50 flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(239, 68, 68, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
