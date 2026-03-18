import { motion } from 'motion/react';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [openUpward, setOpenUpward] = useState(false);

  const updatePosition = (forceUpward?: boolean) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const up = forceUpward ?? openUpward;
    if (up && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight;
      setDropdownPos({ top: rect.top - menuHeight - 8, left: rect.left });
    } else {
      setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (!buttonRef.current || !buttonRef.current.contains(target)) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => updatePosition();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, openUpward]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Estimate menu height (~44px per item)
      const estimatedMenuHeight = statuses.length * 44 + 16;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const shouldOpenUp = spaceBelow < estimatedMenuHeight;
      setOpenUpward(shouldOpenUp);

      if (shouldOpenUp) {
        setDropdownPos({ top: rect.top - 8, left: rect.left });
      } else {
        setDropdownPos({ top: rect.bottom + 8, left: rect.left });
      }

      // Fine-tune after render with actual menu height
      requestAnimationFrame(() => {
        if (menuRef.current && buttonRef.current) {
          const menuHeight = menuRef.current.offsetHeight;
          if (shouldOpenUp) {
            const btnRect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({ top: btnRect.top - menuHeight - 8, left: btnRect.left });
          }
        }
      });
    }
  }, [isOpen]);

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
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(currentStatus)} transition-all cursor-pointer`}
      >
        {currentStatus}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {isOpen && createPortal(
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: openUpward ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}
          className="z-[9999] bg-white rounded-xl shadow-2xl border-2 border-slate-300 overflow-hidden w-fit"
        >
          {statuses.map((status) => (
            <motion.button
              key={status}
              onClick={() => handleStatusSelect(status)}
              disabled={status === currentStatus}
              className={`block px-3 py-2.5 text-sm transition-colors whitespace-nowrap hover:bg-slate-50 ${
                status === currentStatus ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(status)}`}>
                {status}
              </span>
            </motion.button>
          ))}
        </motion.div>,
        document.body
      )}
    </div>
  );
}