import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

export function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  const handleSignIn = () => {
    loginWithRedirect();
  };

  return (
    <div className="size-full flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
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
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-blue-200 mb-8">Sign in to your account to continue</p>

            <motion.button
              onClick={handleSignIn}
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl flex items-center justify-center gap-2 group"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
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