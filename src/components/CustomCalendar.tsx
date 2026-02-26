import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CustomCalendarProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export function CustomCalendar({ value, onChange, placeholder = 'mm/dd/yyyy' }: CustomCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const selectDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const clearDate = () => {
    setSelectedDate(null);
    onChange('');
  };

  const setToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    const formattedDate = today.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return '';
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && 
           currentMonth.getMonth() === selectedDate.getMonth() && 
           currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-9" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day);
      const isSelectedDay = isSelected(day);
      
      days.push(
        <motion.button
          key={day}
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => selectDate(day)}
          className={`h-9 w-9 rounded-lg font-semibold text-sm transition-all ${
            isSelectedDay
              ? 'bg-blue-600 text-white shadow-lg'
              : isCurrentDay
              ? 'bg-blue-100 text-blue-900 font-bold'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {day}
        </motion.button>
      );
    }
    
    return days;
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium cursor-pointer flex items-center justify-between"
      >
        <span className={selectedDate ? 'text-slate-900' : 'text-slate-400'}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <Calendar className="w-5 h-5 text-slate-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Calendar Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-50 p-4 w-80"
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={previousMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </motion.button>
                
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </p>
                </div>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </motion.button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day, index) => (
                  <div key={`day-${index}`} className="h-9 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-500">{day}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderDays()}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearDate}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Clear
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={setToday}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Today
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}