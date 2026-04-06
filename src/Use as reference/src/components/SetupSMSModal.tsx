import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface SetupSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SetupSMSModal({ isOpen, onClose }: SetupSMSModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSendCode = () => {
    // Send SMS code logic will be implemented here
    console.log('Sending verification code to:', phoneNumber);
    setCurrentStep(2);
  };

  const handleVerify = () => {
    // Verification logic will be implemented here
    console.log('Verifying code:', verificationCode);
    setCurrentStep(3);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setPhoneNumber('');
    setVerificationCode('');
    onClose();
  };

  const isPhoneValid = phoneNumber.replace(/\D/g, '').length === 10;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Set Up SMS Authentication</h2>
                      <p className="text-sm text-slate-300 mt-0.5">Step {currentStep} of 3</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="p-2 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '33%' }}
                    animate={{ width: `${(currentStep / 3) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Step 1: Enter Phone Number */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Enter Your Phone Number</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      We'll send you a verification code via SMS to confirm your phone number.
                    </p>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Standard SMS rates may apply
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Important</p>
                        <p className="text-sm text-blue-700">
                          Make sure you have access to this phone number. You'll need it to log in to your account.
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendCode}
                      disabled={!isPhoneValid}
                      className="w-full py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Verification Code
                    </motion.button>
                  </motion.div>
                )}

                {/* Step 2: Verify Code */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Enter Verification Code</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      We sent a 6-digit code to <span className="font-semibold">{phoneNumber}</span>
                    </p>
                    
                    <div className="mb-6">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-2xl font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                      />
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Enter the 6-digit code from your text message
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-6">
                      <p className="text-sm text-slate-600">Didn't receive the code?</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                      >
                        Resend
                      </motion.button>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleVerify}
                        disabled={verificationCode.length !== 6}
                        className="flex-1 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Verify & Enable
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Success */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">SMS Verification Enabled!</h3>
                    <p className="text-slate-600 mb-6">
                      Two-factor authentication via SMS has been successfully enabled on your account.
                    </p>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-left">
                      <p className="text-sm font-semibold text-slate-900 mb-1">Your Verified Number</p>
                      <p className="text-sm text-slate-700">{phoneNumber}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="w-full py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg"
                    >
                      Done
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}