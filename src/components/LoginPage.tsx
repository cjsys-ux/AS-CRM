import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password, rememberMe);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResetError(data.error || 'Something went wrong. Please try again.');
      } else {
        setResetEmailSent(true);
      }
    } catch {
      setResetError('Unable to reach the server. Check your internet connection.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setResetEmail('');
    setResetError('');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Login Container */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-black tracking-tight leading-none text-white mb-2">
              <span className="text-white">Activate</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Swag</span>
            </h1>
            <p className="text-blue-200">Command Center</p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            <AnimatePresence mode="wait">
              {!showForgotPassword ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                  <p className="text-blue-200 mb-6">Sign in to your account to continue</p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder:text-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder:text-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm"
                          required
                        />
                      </div>
                      <div className="flex justify-end mt-1">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                        >
                          Forgot Password?
                        </motion.button>
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={rememberMe}
                        onClick={() => setRememberMe(v => !v)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          rememberMe
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white/10 border-white/30 hover:border-blue-400'
                        }`}
                      >
                        {rememberMe && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span
                        className="text-sm text-blue-200 cursor-pointer select-none"
                        onClick={() => setRememberMe(v => !v)}
                      >
                        Remember me
                      </span>
                    </div>

                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm"
                      >
                        {error.includes('temporarily inactive') ? (
                          <>
                            Your account is temporarily inactive and cannot be used to log in at this
                            time. Please contact{' '}
                            <a
                              href="mailto:support@activateswag.com"
                              className="underline hover:text-white transition-colors"
                            >
                              support@activateswag.com
                            </a>{' '}
                            for assistance.
                          </>
                        ) : (
                          error
                        )}
                      </motion.div>
                    )}

                    {/* Login Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                      className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
                  <p className="text-blue-200 mb-6">Enter your email to reset your password</p>
                  <form onSubmit={handlePasswordReset} className="space-y-5">
                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder:text-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm"
                          required
                          disabled={resetEmailSent}
                        />
                      </div>
                    </div>

                    {/* Reset Error */}
                    {resetError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm"
                      >
                        {resetError.includes('temporarily inactive') ? (
                          <>
                            Your account is temporarily inactive and cannot be used to log in at this
                            time. Please contact{' '}
                            <a
                              href="mailto:support@activateswag.com"
                              className="underline hover:text-white transition-colors"
                            >
                              support@activateswag.com
                            </a>{' '}
                            for assistance.
                          </>
                        ) : (
                          resetError
                        )}
                      </motion.div>
                    )}

                    {/* Success Message */}
                    {resetEmailSent && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-green-500/20 border-2 border-green-400/40 rounded-xl"
                      >
                        <p className="text-green-300 font-medium text-center">
                          ✉️ Check your email for password reset instructions
                        </p>
                        <p className="text-green-200/80 text-sm text-center mt-1">
                          We've sent a reset link to {resetEmail}
                        </p>
                      </motion.div>
                    )}

                    {/* Back to Login Link */}
                    <motion.button
                      type="button"
                      onClick={handleBackToLogin}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </motion.button>

                    {/* Reset Password Button */}
                    {!resetEmailSent && (
                      <motion.button
                        type="submit"
                        disabled={resetLoading}
                        whileHover={!resetLoading ? { scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' } : {}}
                        whileTap={!resetLoading ? { scale: 0.98 } : {}}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {resetLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending…
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </motion.button>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-blue-300/60 text-sm mt-8"
          >
            © 2026 ActivateSwag. All rights reserved.
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="hidden lg:flex flex-1 items-center justify-center p-16"
      >
        <div className="max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-5xl font-black text-white mb-6 leading-tight">
              Manage Your
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Product Pipeline
              </span>
            </h2>
            <p className="text-xl text-blue-200 mb-12">
              Track products, manage vendors, and streamline your entire product lifecycle in one powerful platform.
            </p>
          </motion.div>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              { icon: '📦', title: 'Product Management', desc: 'Track your entire product pipeline' },
              { icon: '🏢', title: 'Vendor Relations', desc: 'Manage all your supplier connections' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time insights and reporting' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                  <p className="text-blue-200 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
