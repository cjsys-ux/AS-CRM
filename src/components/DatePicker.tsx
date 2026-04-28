import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  title?: string;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(value + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [m, d, y] = value.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }
  const fallback = new Date(value);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function formatMDY(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'mm/dd/yyyy',
  className = '',
  title = 'Select Date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => parseDate(value) ?? new Date());
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const parsed = parseDate(value);
    if (parsed) setCurrentMonth(parsed);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(formatMDY(date));
    setIsOpen(false);
  };

  const setToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onChange(formatMDY(today));
    setIsOpen(false);
  };

  const clearDate = () => {
    onChange('');
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentMonth.getMonth() === today.getMonth() &&
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    const parsed = parseDate(value);
    if (!parsed) return false;
    return day === parsed.getDate() &&
           currentMonth.getMonth() === parsed.getMonth() &&
           currentMonth.getFullYear() === parsed.getFullYear();
  };

  const renderDays = () => {
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="h-9" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const selected = isSelected(day);
      const today = isToday(day);
      cells.push(
        <motion.button
          key={day}
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => selectDate(day)}
          className={`h-9 w-9 rounded-full font-semibold text-sm transition-all mx-auto ${
            selected
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : today
              ? 'ring-2 ring-blue-500 text-blue-700 font-bold'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {day}
        </motion.button>
      );
    }
    return cells;
  };

  const displayValue = (() => {
    const parsed = parseDate(value);
    return parsed ? formatMDY(parsed) : '';
  })();

  const handleOpen = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const popupHeight = 420;
      if (spaceBelow < popupHeight && rect.top > popupHeight) {
        setDropdownStyle({
          position: 'fixed',
          left: rect.left,
          bottom: window.innerHeight - rect.top + 8,
          width: 320,
          zIndex: 9999,
        });
      } else {
        setDropdownStyle({
          position: 'fixed',
          left: rect.left,
          top: rect.bottom + 8,
          width: 320,
          zIndex: 9999,
        });
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={displayValue}
          onClick={handleOpen}
          readOnly
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              style={dropdownStyle}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">{title}</h3>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={previousMonth}
                  className="p-1.5 hover:bg-white/60 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </motion.button>

                <p className="text-sm font-bold text-slate-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </p>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-white/60 rounded-lg transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </motion.button>
              </div>

              <div className="p-3">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {dayNames.map((d, i) => (
                    <div key={`day-${i}`} className="h-8 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">{d}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {renderDays()}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={setToday}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                  >
                    Today
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearDate}
                    className="px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors"
                  >
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
