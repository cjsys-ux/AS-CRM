import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ModernDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label?: string;
  icon?: React.ReactNode;
  compact?: boolean;
}

export function ModernDropdown({ value, onChange, options, label, icon, compact }: ModernDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        wrapperRef.current && !wrapperRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedHeight = Math.min(options.length * 44 + 16, 320);
      const opensUp = spaceBelow < estimatedHeight && rect.top > estimatedHeight;
      const width = compact ? Math.max(rect.width, 140) : rect.width;
      setMenuStyle({
        position: 'fixed',
        left: rect.left,
        width,
        top: opensUp ? undefined : rect.bottom + 8,
        bottom: opensUp ? window.innerHeight - rect.top + 8 : undefined,
        zIndex: 9999,
      });
    };
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [isOpen, options.length, compact]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          {icon}
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={compact
          ? "px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none transition-all flex items-center gap-1.5 whitespace-nowrap"
          : "w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between"
        }
      >
        <span>{value}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={compact ? "w-3.5 h-3.5 text-slate-400" : "w-5 h-5 text-slate-400"} />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu - rendered via fixed positioning so it escapes ancestor overflow:hidden */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={menuStyle}
            className={compact
              ? "bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
              : "bg-white border-2 border-slate-200 rounded-xl shadow-xl overflow-hidden"
            }
          >
            {options.map((option, index) => (
              <motion.button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                className={`w-full text-left transition-colors flex items-center justify-between ${
                  compact ? 'px-3 py-2 text-sm' : 'px-4 py-3'
                } ${
                  index !== options.length - 1 ? 'border-b border-slate-100' : ''
                } ${value === option ? 'bg-blue-50' : ''}`}
              >
                <span className={`font-medium ${value === option ? 'text-blue-600' : 'text-slate-700'}`}>
                  {option}
                </span>
                {value === option && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className={compact ? "w-3.5 h-3.5 text-blue-600" : "w-5 h-5 text-blue-600"} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
