import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, FileText, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

interface ConfirmPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: string, details: string) => void;
  poNumber: string;
}

export function ConfirmPOModal({ isOpen, onClose, onConfirm, poNumber }: ConfirmPOModalProps) {
  const [confirmMethod, setConfirmMethod] = useState<'online' | 'email' | 'phone'>('online');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [emailDetails, setEmailDetails] = useState('');
  const [phoneDetails, setPhoneDetails] = useState('');

  const handleSubmit = () => {
    let details = '';
    let method = '';

    switch (confirmMethod) {
      case 'online':
        details = confirmationNumber;
        method = 'Online Order - Confirmation #';
        break;
      case 'email':
        details = emailDetails;
        method = 'Email Confirmation';
        break;
      case 'phone':
        details = phoneDetails;
        method = 'Phone Call';
        break;
    }

    if (!details.trim()) {
      alert('Please provide confirmation details');
      return;
    }

    onConfirm(method, details);
    // Reset form
    setConfirmMethod('online');
    setConfirmationNumber('');
    setEmailDetails('');
    setPhoneDetails('');
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-purple-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Confirm Purchase Order</h3>
                    <p className="text-purple-100 text-sm">PO #{poNumber}</p>
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
                <p className="text-slate-700 mb-6">
                  How was this purchase order confirmed with the vendor?
                </p>

                {/* Confirmation Method Selection */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setConfirmMethod('online')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      confirmMethod === 'online'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      confirmMethod === 'online' ? 'bg-purple-500' : 'bg-slate-100'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        confirmMethod === 'online' ? 'text-white' : 'text-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-slate-900">Online Order</h4>
                      <p className="text-sm text-slate-600">Confirmation number provided</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      confirmMethod === 'online' 
                        ? 'border-purple-500 bg-purple-500' 
                        : 'border-slate-300'
                    }`}>
                      {confirmMethod === 'online' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setConfirmMethod('email')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      confirmMethod === 'email'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      confirmMethod === 'email' ? 'bg-purple-500' : 'bg-slate-100'
                    }`}>
                      <Mail className={`w-6 h-6 ${
                        confirmMethod === 'email' ? 'text-white' : 'text-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-slate-900">Email Confirmation</h4>
                      <p className="text-sm text-slate-600">Confirmed via email from vendor</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      confirmMethod === 'email' 
                        ? 'border-purple-500 bg-purple-500' 
                        : 'border-slate-300'
                    }`}>
                      {confirmMethod === 'email' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setConfirmMethod('phone')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      confirmMethod === 'phone'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      confirmMethod === 'phone' ? 'bg-purple-500' : 'bg-slate-100'
                    }`}>
                      <Phone className={`w-6 h-6 ${
                        confirmMethod === 'phone' ? 'text-white' : 'text-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-slate-900">Phone Call</h4>
                      <p className="text-sm text-slate-600">Confirmed by calling vendor</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      confirmMethod === 'phone' 
                        ? 'border-purple-500 bg-purple-500' 
                        : 'border-slate-300'
                    }`}>
                      {confirmMethod === 'phone' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Details Input */}
                <div className="mb-6">
                  {confirmMethod === 'online' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Confirmation Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={confirmationNumber}
                        onChange={(e) => setConfirmationNumber(e.target.value)}
                        placeholder="e.g., ORD-123456789"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      />
                    </div>
                  )}

                  {confirmMethod === 'email' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Details <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={emailDetails}
                        onChange={(e) => setEmailDetails(e.target.value)}
                        placeholder="e.g., Received confirmation from john@vendor.com on 2/24/2026"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  {confirmMethod === 'phone' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Call Details <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={phoneDetails}
                        onChange={(e) => setPhoneDetails(e.target.value)}
                        placeholder="e.g., Spoke with John Smith at (555) 123-4567 on 2/24/2026"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm PO
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
