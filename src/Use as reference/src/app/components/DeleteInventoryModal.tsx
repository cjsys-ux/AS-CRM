import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, ShieldAlert, Package, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
}

interface DeleteInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: InventoryItem | null;
}

export function DeleteInventoryModal({ isOpen, onClose, onConfirm, item }: DeleteInventoryModalProps) {
  const [confirmText, setConfirmText] = useState('');

  if (!item) return null;

  const hasStock = item.quantity > 0;
  const canDelete = !hasStock;

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const handleConfirm = () => {
    if (!canDelete) return;
    onConfirm();
    setConfirmText('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              {hasStock ? (
                <>
                  {/* Blocked State - Has Stock */}
                  <div className="bg-amber-50 px-6 py-5 border-b border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                          <ShieldAlert className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Cannot Delete Item</h3>
                          <p className="text-sm text-slate-600">This item has remaining stock</p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg hover:bg-amber-100 flex items-center justify-center text-slate-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-amber-500 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-sm font-mono text-slate-500">{item.sku}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-amber-700 font-medium">Current Stock</span>
                          <span className="text-lg font-black text-amber-700">{item.quantity.toLocaleString()} {item.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Items with remaining inventory cannot be deleted. To delete this item, you must first:
                      </p>
                      <ul className="space-y-2 ml-1">
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">1</span>
                          <span>Transfer all stock to another location or item</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">2</span>
                          <span>Adjust stock count to zero with a valid reason</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">3</span>
                          <span>Or mark the item as <strong>Discontinued</strong> instead</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-6 py-4">
                    <button
                      onClick={handleClose}
                      className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                    >
                      Got It
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Can Delete State - Zero Stock */}
                  <div className="bg-red-50 px-6 py-5 border-b border-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                          <p className="text-sm text-slate-600">This action cannot be undone</p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-sm font-mono text-slate-500">{item.sku}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500 font-medium">Current Stock</span>
                          <span className="text-sm font-bold text-slate-400">0 {item.unit}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed mb-4">
                      Are you sure you want to permanently delete <strong>{item.name}</strong>? This will remove all associated stock movement history, linked orders, and analytics data.
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Type <span className="text-red-500 font-mono">DELETE</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={e => setConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 px-6 py-4 flex items-center gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={confirmText !== 'DELETE'}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
