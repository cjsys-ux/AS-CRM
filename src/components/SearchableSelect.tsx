import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, Check, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export interface SelectOption {
  id: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  clearable?: boolean;
  searchable?: boolean;
  accentColor?: 'cyan' | 'blue';
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyIcon,
  emptyMessage = 'No options found',
  loading = false,
  loadingMessage = 'Loading...',
  clearable = true,
  searchable = true,
  accentColor = 'cyan',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const accent = accentColor === 'blue'
    ? { ring: 'ring-blue-500/20', border: 'border-blue-500', bg: 'bg-blue-50', borderL: 'border-l-blue-500', iconBg: 'bg-blue-100', iconText: 'text-blue-600', labelText: 'text-blue-900', check: 'text-blue-600', searchRing: 'focus:ring-blue-500/20', searchBorder: 'focus:border-blue-500', spinner: 'text-blue-500' }
    : { ring: 'ring-cyan-500/20', border: 'border-cyan-500', bg: 'bg-cyan-50', borderL: 'border-l-cyan-500', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', labelText: 'text-cyan-900', check: 'text-cyan-600', searchRing: 'focus:ring-cyan-500/20', searchBorder: 'focus:border-cyan-500', spinner: 'text-cyan-500' };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === value || o.label === value);
  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.subtitle && o.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-left font-medium transition-all flex items-center justify-between gap-2 ${
          isOpen
            ? `${accent.border} ring-2 ${accent.ring}`
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <div className="min-w-0 flex-1">
            {selectedOption ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-900 truncate">{selectedOption.label}</span>
                {selectedOption.subtitle && (
                  <span className="text-xs text-slate-500 font-normal">{selectedOption.subtitle}</span>
                )}
              </div>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Search bar */}
            {searchable && (
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${accent.searchRing} ${accent.searchBorder} transition-all`}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="max-h-52 overflow-y-auto dropdown-scroll">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className={`w-5 h-5 ${accent.spinner} animate-spin`} />
                  <span className="text-sm text-slate-500 font-medium">{loadingMessage}</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8">
                  {emptyIcon || <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />}
                  <p className="text-sm text-slate-500 font-medium">
                    {options.length === 0 ? emptyMessage : 'No matching results'}
                  </p>
                </div>
              ) : (
                filtered.map(option => {
                  const isSelected = value === option.id || value === option.label;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        onChange(option.id === option.label ? option.label : option.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? `${accent.bg} border-l-3 ${accent.borderL}`
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {option.icon && (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? accent.iconBg : 'bg-slate-100'
                        }`}>
                          {option.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? accent.labelText : 'text-slate-900'}`}>
                          {option.label}
                        </p>
                        {option.subtitle && (
                          <p className="text-xs text-slate-500">{option.subtitle}</p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className={`w-4 h-4 ${accent.check} flex-shrink-0`} />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Clear selection */}
            {clearable && value && (
              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
