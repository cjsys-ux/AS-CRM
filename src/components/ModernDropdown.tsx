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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          {icon}
          {label}
        </label>
      )}
      
      {/* Dropdown Button */}
      <motion.button
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

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={compact
              ? "absolute z-50 min-w-[140px] mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
              : "absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl overflow-hidden"
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
