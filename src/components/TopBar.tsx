import { motion } from 'motion/react';
import { Search, Menu } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { UserProfile } from '../App';

interface TopBarProps {
  onNavigate: (page: string) => void;
  userProfile: UserProfile;
  onOpenMobileMenu?: () => void;
}

export function TopBar({ onNavigate, userProfile, onOpenMobileMenu }: TopBarProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30"
    >
      {/* Hamburger Menu Button (Mobile only) */}
      {onOpenMobileMenu && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors mr-3"
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      )}

      {/* Search bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 md:gap-3 ml-3">
        <NotificationsDropdown />
        <div className="w-px h-6 md:h-8 bg-slate-200" />
        <ProfileDropdown onNavigate={onNavigate} userProfile={userProfile} />
      </div>
    </motion.div>
  );
}