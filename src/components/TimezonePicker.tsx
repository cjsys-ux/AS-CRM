import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChevronDown, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10' },
  { value: 'Europe/London', label: 'London (GMT)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 'UTC+1' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET)', offset: 'UTC+2' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Shanghai', label: 'China (CST)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 'UTC+11' },
];

interface TimezonePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TimezonePicker({ value, onChange, disabled }: TimezonePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedTimezone = timezones.find((tz) => tz.value === value) || timezones[0];

  const filteredTimezones = timezones.filter(
    (tz) =>
      tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.offset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownStyle({ top: rect.bottom + 8, left: rect.left, width: rect.width });
      }
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        dropdownPanelRef.current && !dropdownPanelRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300 transition-colors'
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400" />
          <div className="text-left">
            <p className="font-medium">{selectedTimezone.label}</p>
            <p className="text-xs text-slate-500">{selectedTimezone.offset}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {isOpen && !disabled && dropdownStyle && (
            <motion.div
              ref={dropdownPanelRef}
              key="timezone-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ position: 'fixed', top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width, zIndex: 9999 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search timezones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="max-h-64 overflow-y-auto">
                {filteredTimezones.map((tz, index) => (
                  <motion.button
                    key={tz.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => {
                      onChange(tz.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors ${
                      tz.value === value ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-slate-900">{tz.label}</p>
                      <p className="text-xs text-slate-500">{tz.offset}</p>
                    </div>
                    {tz.value === value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-blue-500"
                      />
                    )}
                  </motion.button>
                ))}
                {filteredTimezones.length === 0 && (
                  <div className="px-4 py-8 text-center text-slate-500">No timezones found</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
