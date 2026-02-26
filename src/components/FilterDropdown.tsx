import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
}

export function FilterDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select option...', 
  className = '',
  fullWidth = false 
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${isOpen ? 'z-[100]' : 'z-10'}`}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`flex items-center justify-between gap-3 px-5 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-slate-700 font-medium transition-all shadow-sm ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        <span className="text-sm">{displayText}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-80 overflow-y-auto"
          >
            {options.map((option, index) => (
              <motion.button
                key={option.value}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onMouseDown={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-3.5 text-left transition-all border-b border-slate-100 last:border-b-0 flex items-center justify-between ${
                  value === option.value 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-900 font-bold' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-sm">{option.label}</span>
                {value === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-4 h-4 text-blue-600" />
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