import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useState } from 'react';

interface ImagePopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName?: string;
}

export function ImagePopupModal({ isOpen, onClose, imageUrl, productName = 'Product Image' }: ImagePopupModalProps) {
  const [zoom, setZoom] = useState(1);

  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = imageUrl.replace('w=100', 'w=800');
    link.download = `${productName.replace(/\s+/g, '_')}_image.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-lg font-medium text-white">{productName}</h3>
                  <p className="text-sm text-slate-300">Product Image</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ZoomOut className="w-5 h-5 text-white" />
                  </motion.button>
                  <span className="text-sm text-white font-medium min-w-[60px] text-center">
                    {(zoom * 100).toFixed(0)}%
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ZoomIn className="w-5 h-5 text-white" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDownload}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors ml-2"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors ml-2"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Image Container */}
              <div className="bg-slate-100 p-6 flex items-center justify-center overflow-auto flex-1">
                <motion.img
                  animate={{ scale: zoom }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  src={imageUrl.replace('w=100', 'w=800')}
                  alt={productName}
                  className="rounded-xl shadow-2xl max-w-full max-h-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}