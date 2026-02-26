import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = 'mm/dd/yyyy', className = '' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Add empty cells to complete the last row
    const remainingCells = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 0; i < remainingCells; i++) {
      days.push(null);
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const selectedDate = new Date(year, month, day);
    
    const formattedDate = `${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    onChange(formattedDate);
    setCurrentDate(today);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [month, dayStr, year] = value.split('/');
    return day === parseInt(dayStr) && 
           currentDate.getMonth() === parseInt(month) - 1 && 
           currentDate.getFullYear() === parseInt(year);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onClick={() => setIsOpen(!isOpen)}
        readOnly
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4 w-[280px]"
            >
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePreviousMonth}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </motion.button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day, index) => (
                  <div key={index} className="text-center text-xs font-medium text-slate-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.slice(0, 35).map((day, index) => (
                  <div key={index}>
                    {day !== null ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDateSelect(day)}
                        className={`w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                          isSelected(day)
                            ? 'bg-blue-600 text-white font-bold'
                            : isToday(day)
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </motion.button>
                    ) : (
                      <div className="w-full aspect-square" />
                    )}
                  </div>
                ))}
              </div>

              {/* Show second row if needed */}
              {days.length > 35 && (
                <div className="grid grid-cols-7 gap-1 mt-1">
                  {days.slice(35).map((day, index) => (
                    <div key={index + 35}>
                      {day !== null ? (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDateSelect(day)}
                          className={`w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                            isSelected(day)
                              ? 'bg-blue-600 text-white font-bold'
                              : isToday(day)
                              ? 'bg-slate-100 text-slate-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {day}
                        </motion.button>
                      ) : (
                        <div className="w-full aspect-square" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                <button
                  onClick={handleClear}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleToday}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Today
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
