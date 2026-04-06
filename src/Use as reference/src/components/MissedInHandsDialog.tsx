import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

interface MissedInHandsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  shipDate: string;
  inHandsDate: string;
  poNumber: string;
}

const COMMON_REASONS = [
  'Vendor production delay',
  'Material shortage / backorder',
  'Quality issue requiring rework',
  'Shipping carrier delay',
  'Client-requested change',
  'Weather / natural disaster',
  'Custom clearance delay',
];

export function MissedInHandsDialog({ isOpen, onClose, onConfirm, shipDate, inHandsDate, poNumber }: MissedInHandsDialogProps) {
  const [reason, setReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = () => {
    const finalReason = selectedPreset === 'Other' ? customReason.trim() : (selectedPreset || customReason.trim());
    if (!finalReason) return;
    onConfirm(finalReason);
    setReason('');
    setSelectedPreset(null);
    setCustomReason('');
  };

  const handleClose = () => {
    setReason('');
    setSelectedPreset(null);
    setCustomReason('');
    onClose();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dateString;
  };

  const isValid = selectedPreset === 'Other' ? customReason.trim().length > 0 : !!selectedPreset;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Header - Red warning banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Missed In-Hands Date</h3>
                    <p className="text-red-100 text-sm">PO #{poNumber}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Date comparison banner */}
            <div className="px-6 pt-5 pb-3">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-medium text-red-800 mb-3">
                  The selected ship date exceeds the in-hands deadline:
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-red-200">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase">Ship Date</p>
                      <p className="text-sm font-bold text-slate-900">{formatDate(shipDate)}</p>
                    </div>
                  </div>
                  <div className="text-red-400 font-bold text-lg">&gt;</div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-red-200">
                    <Clock className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase">In-Hands</p>
                      <p className="text-sm font-bold text-slate-900">{formatDate(inHandsDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason selection */}
            <div className="px-6 pb-3">
              <p className="text-sm font-semibold text-slate-700 mb-3">Why is the ship date exceeding the in-hands date?</p>
              <div className="space-y-2">
                {COMMON_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setSelectedPreset(r); setCustomReason(''); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedPreset === r
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedPreset('Other')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    selectedPreset === 'Other'
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Other (specify below)
                </button>
              </div>

              {selectedPreset === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please describe the reason..."
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none"
                    rows={3}
                    autoFocus
                  />
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!isValid}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
                  isValid
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-200'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Confirm & Flag as Missed
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
