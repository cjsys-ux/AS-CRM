import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Mail, Phone, Globe, FileText, CheckCircle, Hash, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SubmitPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: string, details: string) => void;
  onSubmitAndConfirm?: (submitMethod: string, submitDetails: string, confirmationNumber: string) => void;
  poNumber: string;
}

export function SubmitPOModal({ isOpen, onClose, onConfirm, onSubmitAndConfirm, poNumber }: SubmitPOModalProps) {
  const [submitMethod, setSubmitMethod] = useState<'email' | 'online' | 'phone' | 'fax'>('email');
  const [details, setDetails] = useState('');
  const [receivedOrderNumber, setReceivedOrderNumber] = useState<boolean | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  useEffect(() => {
    if (submitMethod !== 'online') {
      setReceivedOrderNumber(null);
      setConfirmationNumber('');
    }
  }, [submitMethod]);

  useEffect(() => {
    if (!isOpen) {
      setDetails('');
      setSubmitMethod('email');
      setReceivedOrderNumber(null);
      setConfirmationNumber('');
    }
  }, [isOpen]);

  const methodLabels: Record<string, { label: string; icon: any; color: string; placeholder: string }> = {
    email: { label: 'Email', icon: Mail, color: 'blue', placeholder: 'e.g., Sent to john@vendor.com on 3/9/2026' },
    online: { label: 'Online Portal', icon: Globe, color: 'purple', placeholder: 'e.g., Submitted via vendor portal checkout' },
    phone: { label: 'Phone', icon: Phone, color: 'green', placeholder: 'e.g., Called vendor rep John Smith at (555) 123-4567' },
    fax: { label: 'Fax', icon: FileText, color: 'amber', placeholder: 'e.g., Faxed to (555) 987-6543 - confirmation received' },
  };

  const handleSubmit = () => {
    if (submitMethod === 'online' && receivedOrderNumber === true) {
      if (!confirmationNumber.trim()) {
        alert('Please enter the order/confirmation number');
        return;
      }
      const finalDetails = details.trim() || `Submitted via ${methodLabels[submitMethod].label}`;
      if (onSubmitAndConfirm) {
        onSubmitAndConfirm(methodLabels[submitMethod].label, finalDetails, confirmationNumber);
      } else {
        onConfirm(methodLabels[submitMethod].label, `${finalDetails} | Confirmation #: ${confirmationNumber}`);
      }
      return;
    }

    if (!details.trim()) {
      alert('Please provide details about how the PO was submitted');
      return;
    }

    onConfirm(methodLabels[submitMethod].label, details);
  };

  const isSubmitAndConfirm = submitMethod === 'online' && receivedOrderNumber === true;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className={`px-6 py-5 flex items-center justify-between ${
                isSubmitAndConfirm
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    {isSubmitAndConfirm ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Send className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {isSubmitAndConfirm ? 'Submit & Confirm PO' : 'Submit Purchase Order'}
                    </h3>
                    <p className="text-blue-100 text-sm">PO #{poNumber}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-slate-700 mb-4 text-sm">
                  How was this PO submitted to the vendor? This will be logged in the timeline.
                </p>

                {/* Method Selection */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {Object.entries(methodLabels).map(([key, { label, icon: Icon }]) => (
                    <button
                      key={key}
                      onClick={() => setSubmitMethod(key as any)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        submitMethod === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        submitMethod === key ? 'bg-blue-500' : 'bg-slate-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${submitMethod === key ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                      <span className={`text-xs font-semibold ${submitMethod === key ? 'text-blue-700' : 'text-slate-600'}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Details Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Submission Details {!(submitMethod === 'online' && receivedOrderNumber === true) && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={methodLabels[submitMethod].placeholder}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Online Portal - Order Number Question */}
                <AnimatePresence mode="wait">
                  {submitMethod === 'online' && (
                    <motion.div
                      key="online-order-flow"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-200 pt-4 mt-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Hash className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-semibold text-slate-700">
                            Did you receive an order/confirmation number?
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <button
                            type="button"
                            onClick={() => setReceivedOrderNumber(true)}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                              receivedOrderNumber === true
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            <CheckCircle className={`w-4 h-4 ${receivedOrderNumber === true ? 'text-green-600' : 'text-slate-400'}`} />
                            <span className="text-sm font-semibold">Yes, I have it</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReceivedOrderNumber(false);
                              setConfirmationNumber('');
                            }}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                              receivedOrderNumber === false
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            <X className={`w-4 h-4 ${receivedOrderNumber === false ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span className="text-sm font-semibold">Not yet</span>
                          </button>
                        </div>

                        <AnimatePresence mode="wait">
                          {receivedOrderNumber === true && (
                            <motion.div
                              key="confirm-number"
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15 }}
                            >
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Order / Confirmation Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={confirmationNumber}
                                onChange={(e) => setConfirmationNumber(e.target.value)}
                                placeholder="e.g., ORD-123456789"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                autoFocus
                              />
                              <div className="mt-2 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-green-700">
                                  This PO will be automatically confirmed with your order number. No need to confirm separately.
                                </p>
                              </div>
                            </motion.div>
                          )}

                          {receivedOrderNumber === false && (
                            <motion.div
                              key="no-confirm-yet"
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15 }}
                            >
                              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-700">
                                  No problem. This PO will be marked as "Submitted." Once you receive a confirmation number or call the vendor to confirm, you can confirm the PO from the detail view.
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 flex items-center gap-3 border-t border-slate-200">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitMethod === 'online' && receivedOrderNumber === null}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    submitMethod === 'online' && receivedOrderNumber === null
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : isSubmitAndConfirm
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitAndConfirm ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit & Confirm
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Mark as Submitted
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
