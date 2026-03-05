import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.left });
    }
    setIsOpen(!isOpen);
  };

  const handleStatusSelect = (status: string) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(currentStatus)} transition-all cursor-pointer`}
      >
        {currentStatus}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
            className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 overflow-hidden w-fit"
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
