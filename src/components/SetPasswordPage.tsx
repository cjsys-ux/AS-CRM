import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

interface SetPasswordPageProps {
  token: string;
}

export function SetPasswordPage({ token }: SetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch(`/api/auth/set-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenValid(true);
          setUserEmail(data.email || '');
        }
      } catch {
        // network error — leave tokenValid false
      } finally {
        setIsValidating(false);
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to set password. Please try again.');
        return;
      }

      if (data.autoLogin && data.tokens && data.user) {
        // Auto-login succeeded — store session and redirect
        sessionStorage.setItem('as_crm_access_token', data.tokens.access_token);
        sessionStorage.setItem('as_crm_user', JSON.stringify(data.user));
        window.location.replace('/');
        return;
      }

      // Password was set but auto-login failed — show success state
      if (data.email) {
        sessionStorage.setItem('as_crm_prefill_email', data.email);
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Link Expired</h1>
          <p className="text-blue-200 mb-8 leading-relaxed">
            This password setup link is no longer valid. Please contact your administrator to
            receive a new invitation.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl"
          >
            Go to Sign In
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    );
  }

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
            ease: 'linear',
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
            ease: 'linear',
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Form Container */}
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
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Swag
              </span>
            </h1>
            <p className="text-blue-200">Command Center</p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            {success ? (
              <>
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Password Set Successfully!</h2>
                  <p className="text-blue-200 mb-8">
                    Your account is ready. Please log in with your new password.
                  </p>
                </div>
                <motion.button
                  onClick={() => window.location.replace('/')}
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl flex items-center justify-center gap-2 group"
                >
                  Go to Login
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Create Your Password</h2>
                <p className="text-blue-200 mb-8">
                  {userEmail
                    ? `Set your password to continue with ${userEmail}`
                    : "You're almost there — set up your account to get started"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Password field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-200" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-200" htmlFor="confirm-password">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Submit button */}
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
                        Setting up…
                      </>
                    ) : (
                      <>
                        Set Password
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </form>
              </>
            )}
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
              Track products, manage vendors, and streamline your entire product lifecycle in one
              powerful platform.
            </p>
          </motion.div>

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
