import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, Lock } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ModernDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function ModernDropdown({ value, onChange, options, label, icon, disabled }: ModernDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          {icon}
          {label}
        </label>
      )}
      
      {/* Dropdown Button */}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all flex items-center justify-between ${
          disabled 
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
        }`}
      >
        <span>{value}</span>
        {disabled ? (
          <Lock className="w-4 h-4 text-slate-400" />
        ) : (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown Menu - rendered via portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                zIndex: 9999,
              }}
              className="bg-white border-2 border-slate-200 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="max-h-[300px] overflow-y-auto">
                {options.map((option, index) => (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between hover:bg-blue-50/50 ${
                      index !== options.length - 1 ? 'border-b border-slate-100' : ''
                    } ${value === option ? 'bg-blue-50' : ''}`}
                  >
                    <span className={`font-medium ${value === option ? 'text-blue-600' : 'text-slate-900'}`}>
                      {option}
                    </span>
                    {value === option && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check className="w-5 h-5 text-blue-600" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
