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
  /** Compact mode for inline/filter use */
  compact?: boolean;
}

export function ModernDropdown({ value, onChange, options, label, icon, disabled, compact }: ModernDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 160),
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

  // Compact mode styles (for filters)
  const buttonClass = compact
    ? `px-3 py-1.5 border rounded-lg text-sm font-medium focus:outline-none transition-all flex items-center gap-1.5 whitespace-nowrap ${
        disabled
          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400'
      }`
    : `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all flex items-center justify-between ${
        disabled
          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
          : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
      }`;

  return (
    <div className={compact ? 'relative inline-block' : 'relative'}>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
          {icon}
          {label}
        </label>
      )}
      
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={buttonClass}
      >
        <span className={compact ? 'text-sm' : ''}>{value}</span>
        {disabled ? (
          <Lock className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown Menu - rendered via portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: menuPosition.top,
                left: menuPosition.left,
                minWidth: menuPosition.width,
                zIndex: 9999,
              }}
              className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="max-h-[300px] overflow-y-auto py-1">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-1.5 text-left text-sm transition-colors flex items-center justify-between gap-3 hover:bg-slate-50 ${
                      value === option ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    <span className={`font-medium whitespace-nowrap ${value === option ? 'text-blue-600' : 'text-slate-700'}`}>
                      {option}
                    </span>
                    {value === option && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
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