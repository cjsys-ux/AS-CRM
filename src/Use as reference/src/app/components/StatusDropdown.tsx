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
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'In Progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Ready For Live':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Live':
      return 'bg-green-50 text-green-700 border-green-200';
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
      setDropdownPos({ top: rect.top - menuHeight - 4, left: rect.left });
    } else {
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
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
      const estimatedMenuHeight = statuses.length * 36 + 8;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const shouldOpenUp = spaceBelow < estimatedMenuHeight;
      setOpenUpward(shouldOpenUp);

      if (shouldOpenUp) {
        setDropdownPos({ top: rect.top - 4, left: rect.left });
      } else {
        setDropdownPos({ top: rect.bottom + 4, left: rect.left });
      }

      requestAnimationFrame(() => {
        if (menuRef.current && buttonRef.current) {
          const menuHeight = menuRef.current.offsetHeight;
          if (shouldOpenUp) {
            const btnRect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({ top: btnRect.top - menuHeight - 4, left: btnRect.left });
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
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(currentStatus)} transition-all cursor-pointer hover:shadow-sm`}
      >
        {currentStatus}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: openUpward ? 4 : -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}
          className="z-[9999] bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden py-1"
        >
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              disabled={status === currentStatus}
              className={`block w-full px-3 py-1.5 text-left text-sm transition-colors whitespace-nowrap hover:bg-slate-50 ${
                status === currentStatus ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(status)}`}>
                {status}
              </span>
            </button>
          ))}
        </motion.div>,
        document.body
      )}
    </div>
  );
}
