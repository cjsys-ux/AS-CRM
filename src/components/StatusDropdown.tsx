import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const statuses = ['New Product', 'In Progress', 'Ready For Live', 'Live'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'New Product':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'In Progress':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Ready For Live':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Live':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export function StatusDropdown({ currentStatus, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusSelect = (status: string) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(currentStatus)} transition-all cursor-pointer`}
      >
        {currentStatus}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 z-[9999] bg-white rounded-xl shadow-2xl border-2 border-slate-300 overflow-hidden w-fit"
          >
            {statuses.map((status) => (
              <motion.button
                key={status}
                whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                onClick={() => handleStatusSelect(status)}
                disabled={status === currentStatus}
                className={`block px-3 py-2.5 text-sm transition-colors whitespace-nowrap ${
                  status === currentStatus ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(status)}`}>
                  {status}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}