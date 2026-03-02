import { motion, AnimatePresence } from 'motion/react';
import { Home, Users, Package, Database, BarChart3, ShoppingCart, FileText, ChevronDown, Menu, X, Mail, Factory, Truck, Store } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SubItem {
  label: string;
  id: string;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: string;
  subItems?: SubItem[];
}

const menuData: MenuItem[] = [
  { icon: Home, label: 'Dashboard', id: 'home' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  {
    icon: Package,
    label: 'Products',
    id: 'products',
    subItems: [
      { label: 'Pipeline', id: 'pipeline' },
      { label: 'Product Database', id: 'product-database' },
      { label: 'Inventory', id: 'inventory' },
    ],
  },
  {
    icon: ShoppingCart,
    label: 'Orders',
    id: 'orders',
  },
  {
    icon: Users,
    label: 'Customers',
    id: 'customers',
  },
];

const databaseItems: MenuItem[] = [
  { icon: Database, label: 'Vendors', id: 'vendors' },
  { icon: FileText, label: 'Contacts', id: 'contacts' },
];

const operationsItems: MenuItem[] = [
  { 
    icon: ShoppingCart, 
    label: 'Orders', 
    id: 'orders'
  },
  { 
    icon: Package, 
    label: 'Design Lab', 
    id: 'design-lab'
  },
  { 
    icon: ShoppingCart, 
    label: 'Purchasing', 
    id: 'purchasing'
  },
  { 
    icon: Truck, 
    label: 'Shipments', 
    id: 'shipments'
  },
  { 
    icon: Mail, 
    label: 'Email Templates', 
    id: 'email-templates'
  },
  { 
    icon: Factory, 
    label: 'Production', 
    id: 'production'
  },
  { 
    icon: Store, 
    label: 'Amazon Distribution', 
    id: 'amazon-distribution'
  },
];

interface SidebarProps {
  onNavigate?: (page: string) => void;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export function Sidebar({ onNavigate, isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps = {}) {
  const [activeItem, setActiveItem] = useState('home');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Set hasAnimated to true after initial mount
    const timer = setTimeout(() => setHasAnimated(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    if (onNavigate) {
      onNavigate(itemId);
    }
    // Close mobile menu after navigation
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const toggleSection = (itemId: string) => {
    setExpandedSection(expandedSection === itemId ? null : itemId);
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedSection === item.id;
    const isActive = activeItem === item.id;
    const hasActiveSubItem = item.subItems?.some(sub => sub.id === activeItem);

    return (
      <div key={item.id}>
        {/* Main item */}
        <motion.button
          onClick={() => {
            if (hasSubItems) {
              toggleSection(item.id);
            } else {
              handleItemClick(item.id);
            }
          }}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full group relative"
        >
          {/* Active/Hover background */}
          <motion.div
            animate={{ 
              opacity: isActive || hasActiveSubItem ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-transparent rounded-2xl"
          />

          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-gradient-to-r from-slate-100 to-transparent rounded-2xl"
          />

          {/* Content */}
          <div className="relative flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg ${
                  isActive || hasActiveSubItem
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                } transition-all duration-200`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive || hasActiveSubItem
                      ? 'text-white'
                      : 'text-slate-300 group-hover:text-white'
                  } transition-colors duration-200`}
                />
              </div>
              <span
                className={`text-sm font-semibold ${
                  isActive || hasActiveSubItem
                    ? 'text-white'
                    : 'text-slate-300 group-hover:text-white'
                } transition-colors duration-200`}
              >
                {item.label}
              </span>
            </div>
            {hasSubItems && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-colors duration-200" />
              </motion.div>
            )}
          </div>

          {/* Active indicator bar */}
          <AnimatePresence mode="wait">
            {(isActive || hasActiveSubItem) && (
              <motion.div
                layoutId="active-bar"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 rounded-r-full shadow-lg shadow-blue-500/50"
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Sub items */}
        <AnimatePresence>
          {hasSubItems && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-9 mt-1 space-y-0.5 pb-1.5">
                {item.subItems?.map((subItem) => {
                  const isSubActive = activeItem === subItem.id;
                  return (
                    <motion.button
                      key={subItem.id}
                      onClick={() => {
                        handleItemClick(subItem.id);
                      }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="w-full group relative"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-slate-700/30 rounded-xl"
                      />

                      <div className="relative flex items-center gap-2.5 px-3 py-1.5">
                        <motion.div
                          animate={{
                            scale: isSubActive ? 1 : 0.8,
                          }}
                          transition={{ duration: 0.2 }}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSubActive
                              ? 'bg-blue-400 shadow-lg shadow-blue-400/50'
                              : 'bg-slate-500'
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            isSubActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-white'
                          } transition-colors duration-200`}
                        >
                          {subItem.label}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.12, 0.2, 0.12],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl"
      />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">
                <span className="text-white">Activate</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Swag</span>
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5">Command Center</p>
            </div>
          </div>

          {/* Close button for mobile */}
          {onCloseMobileMenu && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCloseMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-hidden px-3 py-4 space-y-0.5">
          <div className="mb-2">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">Main</h2>
            {menuData.map((item, index) => renderMenuItem(item, index))}
          </div>
          
          <div className="mt-3 mb-2">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">Database</h2>
            {databaseItems.map((item, index) => renderMenuItem(item, index))}
          </div>
          
          <div className="mt-3 mb-2">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">Operations</h2>
            {operationsItems.map((item, index) => renderMenuItem(item, index))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden lg:block h-full w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden border-r border-slate-700/50 shadow-2xl flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar - Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobileMenu}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden shadow-2xl z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}