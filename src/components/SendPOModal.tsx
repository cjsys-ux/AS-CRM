import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Mail, Phone, Globe, User, Building2 } from 'lucide-react';
import { useState } from 'react';

interface SendPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: string, details: string) => void;
  poNumber: string;
  vendorName?: string;
  contactName?: string;
  contactEmail?: string;
}

export function SendPOModal({ isOpen, onClose, onConfirm, poNumber, vendorName = '', contactName = '', contactEmail = '' }: SendPOModalProps) {
  const [sendMethod, setSendMethod] = useState<'email' | 'online' | 'phone'>('email');
  const [recipientEmail, setRecipientEmail] = useState(contactEmail);
  const [recipientName, setRecipientName] = useState(contactName);
  const [subject, setSubject] = useState(`Purchase Order #${poNumber}`);
  const [message, setMessage] = useState(`Hi ${contactName || 'there'},\n\nPlease find attached Purchase Order #${poNumber}.\n\nPlease confirm receipt and expected delivery timeline.\n\nBest regards,\nActivate Swag`);
  const [onlineUrl, setOnlineUrl] = useState('');
  const [onlineConfirmation, setOnlineConfirmation] = useState('');
  const [phoneNotes, setPhoneNotes] = useState('');

  const handleSubmit = () => {
    let details = '';
    let method = '';

    switch (sendMethod) {
      case 'email':
        if (!recipientEmail.trim()) {
          alert('Please enter a recipient email address');
          return;
        }
        method = 'Email';
        details = `Sent to ${recipientName} at ${recipientEmail}`;
        break;
      case 'online':
        if (!onlineConfirmation.trim()) {
          alert('Please enter confirmation details');
          return;
        }
        method = 'Online Portal';
        details = `${onlineUrl ? `Portal: ${onlineUrl} - ` : ''}Confirmation: ${onlineConfirmation}`;
        break;
      case 'phone':
        if (!phoneNotes.trim()) {
          alert('Please enter phone call details');
          return;
        }
        method = 'Phone';
        details = phoneNotes;
        break;
    }

    onConfirm(method, details);
    setSendMethod('email');
  };

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
              className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Send Purchase Order</h3>
                    <p className="text-blue-100 text-sm">PO #{poNumber}{vendorName ? ` \u2022 ${vendorName}` : ''}</p>
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
              <div className="flex-1 overflow-y-auto p-6 drawer-scroll">
                <p className="text-sm font-semibold text-slate-700 mb-3">How would you like to submit this PO?</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button
                    onClick={() => setSendMethod('email')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      sendMethod === 'email'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      sendMethod === 'email' ? 'bg-blue-500' : 'bg-slate-100'
                    }`}>
                      <Mail className={`w-5 h-5 ${sendMethod === 'email' ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <span className={`text-sm font-semibold ${sendMethod === 'email' ? 'text-blue-700' : 'text-slate-700'}`}>
                      Email
                    </span>
                  </button>

                  <button
                    onClick={() => setSendMethod('online')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      sendMethod === 'online'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      sendMethod === 'online' ? 'bg-blue-500' : 'bg-slate-100'
                    }`}>
                      <Globe className={`w-5 h-5 ${sendMethod === 'online' ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <span className={`text-sm font-semibold ${sendMethod === 'online' ? 'text-blue-700' : 'text-slate-700'}`}>
                      Online
                    </span>
                  </button>

                  <button
                    onClick={() => setSendMethod('phone')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      sendMethod === 'phone'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      sendMethod === 'phone' ? 'bg-blue-500' : 'bg-slate-100'
                    }`}>
                      <Phone className={`w-5 h-5 ${sendMethod === 'phone' ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <span className={`text-sm font-semibold ${sendMethod === 'phone' ? 'text-blue-700' : 'text-slate-700'}`}>
                      Phone
                    </span>
                  </button>
                </div>

                {sendMethod === 'email' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Recipient Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Contact name"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Recipient Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="vendor@example.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      />
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium">
                        The PO PDF will be automatically attached to the email.
                      </p>
                    </div>
                  </div>
                )}

                {sendMethod === 'online' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Vendor Portal URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={onlineUrl}
                        onChange={(e) => setOnlineUrl(e.target.value)}
                        placeholder="https://vendor-portal.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Order/Confirmation Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={onlineConfirmation}
                        onChange={(e) => setOnlineConfirmation(e.target.value)}
                        placeholder="e.g., ORD-123456789"
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {sendMethod === 'phone' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Call Details <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={phoneNotes}
                        onChange={(e) => setPhoneNotes(e.target.value)}
                        placeholder="e.g., Spoke with John Smith at (555) 123-4567 - order placed over the phone"
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
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
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sendMethod === 'email' ? 'Send PO' : sendMethod === 'online' ? 'Confirm Submission' : 'Log Phone Order'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
