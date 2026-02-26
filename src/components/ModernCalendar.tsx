import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

interface ModernCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  label?: string;
}

export function ModernCalendar({ isOpen, onClose, selectedDate, onSelectDate, label = 'Select Date' }: ModernCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      return new Date(selectedDate);
    }
    return new Date();
  });

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
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = selectedDateObj.toISOString().split('T')[0];
    onSelectDate(formattedDate);
    onClose();
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return selected.getDate() === day &&
           selected.getMonth() === currentDate.getMonth() &&
           selected.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md mx-4"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{label}</h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
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
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
              </div>

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

                const selected = isSelectedDate(day);
                const today = isToday(day);

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectDay(day)}
                    className={`aspect-square rounded-xl font-semibold transition-all ${
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

            {/* Today Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const today = new Date();
                handleSelectDay(today.getDate());
                setCurrentDate(today);
              }}
              className="w-full mt-6 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Today
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
