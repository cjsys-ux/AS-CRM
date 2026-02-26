import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Copy, Check, Shield, Download } from 'lucide-react';
import { useState } from 'react';

interface SetupAuthenticatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SetupAuthenticatorModal({ isOpen, onClose }: SetupAuthenticatorModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Mock data - will be replaced with real data
  const secretKey = 'JBSWY3DPEHPK3PXP';
  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/ActivateSwag:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=ActivateSwag';

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    // Verification logic will be implemented here
    console.log('Verifying code:', verificationCode);
    // For now, just move to success step
    setCurrentStep(3);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setVerificationCode('');
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
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Set Up Authenticator</h2>
                      <p className="text-sm text-blue-100 mt-0.5">Step {currentStep} of 3</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
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
                {/* Step 1: Download App */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Download an Authenticator App</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      If you don't have an authenticator app already, download one of these popular options:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        { name: 'Google Authenticator', platforms: 'iOS & Android' },
                        { name: 'Microsoft Authenticator', platforms: 'iOS & Android' },
                        { name: 'Authy', platforms: 'iOS, Android & Desktop' },
                        { name: '1Password', platforms: 'iOS, Android & Desktop' },
                      ].map((app) => (
                        <div key={app.name} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <div>
                            <p className="font-semibold text-slate-900">{app.name}</p>
                            <p className="text-xs text-slate-500">{app.platforms}</p>
                          </div>
                          <Download className="w-5 h-5 text-slate-400" />
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentStep(2)}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                    >
                      I Have an Authenticator App
                    </motion.button>
                  </motion.div>
                )}

                {/* Step 2: Scan QR Code */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Scan QR Code</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Open your authenticator app and scan this QR code to add your account.
                    </p>
                    
                    {/* QR Code */}
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-lg">
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      </div>
                    </div>

                    {/* Manual Entry Option */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Can't scan the QR code?</p>
                      <p className="text-xs text-slate-600 mb-3">Enter this secret key manually:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900">
                          {secretKey}
                        </code>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopySecret}
                          className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-600" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Verification Code Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Enter Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-2xl font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Enter the 6-digit code from your authenticator app
                      </p>
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
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">All Set!</h3>
                    <p className="text-slate-600 mb-6">
                      Two-factor authentication has been successfully enabled on your account.
                    </p>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-left">
                      <p className="text-sm font-semibold text-amber-900 mb-1">Save Your Backup Codes</p>
                      <p className="text-sm text-amber-700">
                        Make sure to save your backup codes in a safe place. You'll need them if you lose access to your authenticator app.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
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
