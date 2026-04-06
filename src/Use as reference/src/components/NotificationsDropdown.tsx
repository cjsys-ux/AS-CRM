import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  unread: boolean;
}

// Empty notifications array - will be populated from profile settings
const notifications: Notification[] = [];

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const getColorClass = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
          />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute right-0 top-full mt-2 w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden z-50"
            >
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Notifications</h3>
                    <p className="text-sm text-blue-100 mt-0.5">{unreadCount} unread</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-medium text-white border border-white/20 hover:bg-white/20"
                  >
                    Mark all read
                  </motion.button>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl" />
              </div>

              {/* Notifications list */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  // Empty state
                  <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <Bell className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                      No notifications yet
                    </h4>
                    <p className="text-sm text-slate-500">
                      You're all caught up! Notifications will appear here when you have updates.
                    </p>
                  </div>
                ) : (
                  // Notifications list
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-6 py-4 border-b border-slate-100 last:border-0 cursor-pointer transition-colors hover:bg-slate-50/50"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 pt-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${getColorClass(notification.type)} shadow-lg`} style={{ boxShadow: `0 0 10px ${notification.type === 'info' ? 'rgba(59, 130, 246, 0.5)' : notification.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(245, 158, 11, 0.5)'}` }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-slate-600 mb-2">
                            {notification.description}
                          </p>
                          <p className="text-xs text-slate-400">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                className="w-full py-3 text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors border-t border-slate-100 hover:bg-slate-50"
              >
                View all notifications
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}