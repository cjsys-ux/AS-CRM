import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { UserProfile } from '../App';

interface ProfileDropdownProps {
  onNavigate: (page: string) => void;
  userProfile: UserProfile;
}

export function ProfileDropdown({ onNavigate, userProfile }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      description: 'View and edit your profile',
      color: 'bg-blue-50 text-blue-600',
      action: 'profile',
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Manage account settings',
      color: 'bg-slate-50 text-slate-600',
      action: 'settings',
    },
    {
      icon: LogOut,
      label: 'Logout',
      description: 'Sign out of your account',
      color: 'bg-red-50 text-red-600',
      action: 'logout',
    },
  ];

  const handleMenuClick = (action: string) => {
    setIsOpen(false);
    onNavigate(action);
  };

  return (
    <div className="relative">
      {/* Profile button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-slate-100"
      >
        <img
          src={userProfile.profileImage}
          alt="User avatar"
          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
        />
        <div className="text-left">
          <p className="text-sm font-semibold text-slate-900">{userProfile.firstName} {userProfile.lastName}</p>
          <p className="text-xs text-slate-500">{userProfile.email}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
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
              className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden z-50"
            >
              {/* Header with dark gradient */}
              <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={userProfile.profileImage}
                      alt="User avatar"
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-white/10"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-transparent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white">{userProfile.firstName} {userProfile.lastName}</h3>
                    <p className="text-sm text-slate-300 truncate mt-0.5">{userProfile.email}</p>
                  </div>
                </div>
                
                {/* Decorative gradient orbs */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              </div>

              {/* Menu items */}
              <div className="p-3">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full group"
                      onClick={() => handleMenuClick(item.action)}
                    >
                      <motion.div
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors hover:bg-slate-100"
                      >
                        <div className={`p-2.5 rounded-xl ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-sm font-semibold ${item.label === 'Logout' ? 'text-red-600' : 'text-slate-900'}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}