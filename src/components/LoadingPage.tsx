import { motion } from 'motion/react';

export function LoadingPage() {
  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex flex-col items-center gap-4">
        {/* Loading spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          className="text-lg font-medium text-slate-600"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}
