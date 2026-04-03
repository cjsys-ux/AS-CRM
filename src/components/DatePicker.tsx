import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Auto-detect format: supports both YYYY-MM-DD (ISO) and MM/DD/YYYY
function parseDate(value: string): Date | null {
  if (!value) return null;
  // ISO format
  if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const d = new Date(value + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }
  // MM/DD/YYYY format
  if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [m, d, y] = value.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function detectFormat(value: string): 'iso' | 'us' {
  if (value.match(/^\d{4}-\d{2}-\d{2}$/)) return 'iso';
  return 'us';
}

function formatDate(date: Date, format: 'iso' | 'us'): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  return format === 'iso' ? `${y}-${m}-${d}` : `${m}/${d}/${y}`;
}

function displayDate(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function DatePicker({ value, onChange, placeholder = 'Select date', className = '' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'iso' | 'us'>('us');
  const [currentDate, setCurrentDate] = useState(() => {
    const parsed = parseDate(value);
    return parsed || new Date();
  });

  useEffect(() => {
    if (value) {
      setOutputFormat(detectFormat(value));
      const parsed = parseDate(value);
      if (parsed) setCurrentDate(parsed);
    }
  }, [value]);

  // Close on Escape key
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onChange(formatDate(selectedDate, outputFormat));
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(formatDate(today, outputFormat));
    setCurrentDate(today);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    const parsed = parseDate(value);
    if (!parsed) return false;
    return day === parsed.getDate() &&
      currentDate.getMonth() === parsed.getMonth() &&
      currentDate.getFullYear() === parsed.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value ? displayDate(value) : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm mx-4"
            >
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Select Date</h3>
                    {value && (
                      <p className="text-blue-100 text-sm mt-0.5">{displayDate(value)}</p>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Month/Year Navigator */}
                <div className="flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePreviousMonth}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </motion.button>

                  <h2 className="text-xl font-bold text-white">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day Names */}
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {dayNames.map(day => (
                    <div key={day} className="text-center">
                      <span className="text-xs font-bold text-slate-500">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const selected = isSelected(day);
                    const today = isToday(day);

                    return (
                      <motion.button
                        key={day}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDateSelect(day)}
                        className={`aspect-square rounded-xl text-sm font-semibold transition-all flex items-center justify-center ${
                          selected
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                            : today
                            ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {day}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleToday}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
                  >
                    Today
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClear}
                    className="px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors text-sm"
                  >
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
