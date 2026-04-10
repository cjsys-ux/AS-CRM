import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UnitDropdownProps {
  options: string[];
  defaultOption: string;
  value?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export function UnitDropdown({ options, defaultOption, value, className = '', onChange }: UnitDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value ?? defaultOption);

  useEffect(() => {
    if (value !== undefined && value !== selected) {
      setSelected(value);
    }
  }, [value]);

  return (
    <div className={`relative ${isOpen ? 'z-[100]' : 'z-10'}`}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 bg-white border-2 border-slate-300 hover:border-slate-400 rounded-xl text-slate-700 font-medium transition-all shadow-sm min-w-[90px] ${className}`}
      >
        <span>{selected}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl z-[100] min-w-full overflow-hidden"
          >
            {options.map((option, index) => (
              <motion.button
                key={option}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onMouseDown={() => {
                  setSelected(option);
                  onChange?.(option);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center justify-between ${
                  selected === option ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-slate-700'
                }`}
              >
                <span className="text-sm">{option}</span>
                {selected === option && <Check className="w-4 h-4 text-slate-600" />}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}