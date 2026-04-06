import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface CustomCalendarProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  title?: string;
}

export function CustomCalendar({ value, onChange, placeholder = 'mm/dd/yyyy', className, title }: CustomCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          className={`h-9 w-9 rounded-full font-semibold text-sm transition-all mx-auto ${
            isSelectedDay
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : isCurrentDay
              ? 'ring-2 ring-blue-500 text-blue-700 font-bold'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {day}
        </motion.button>
      );
    }
    
    return days;
  };

  const handleOpen = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const popupHeight = 420;
      
      if (spaceBelow < popupHeight && rect.top > popupHeight) {
        // Open upwards
        setDropdownStyle({
          position: 'fixed',
          left: rect.left,
          bottom: window.innerHeight - rect.top + 8,
          zIndex: 9999,
        });
      } else {
        // Open downwards
        setDropdownStyle({
          position: 'fixed',
          left: rect.left,
          top: rect.bottom + 8,
          zIndex: 9999,
        });
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={triggerRef}>
      <div
        onClick={handleOpen}
        className={className || "w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium cursor-pointer flex items-center justify-between"}
        style={className ? { cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } : undefined}
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
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Calendar Dropdown - rendered via portal-like fixed positioning */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              style={dropdownStyle}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-80"
            >
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">{title || 'Select Date'}</h3>
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

              {/* Month Navigation */}
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
                {/* Day Names - Full */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {dayNames.map((day, index) => (
                    <div key={`day-${index}`} className="h-8 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderDays()}
                </div>

                {/* Today Button */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={setToday}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                  >
                    Today
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