import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export type ResolvedAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  formatted: string;
  latitude?: number;
  longitude?: number;
};

type Suggestion = {
  placeId: string;
  provider: 'google' | 'nominatim';
  description: string;
  mainText?: string;
  secondaryText?: string;
};

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: ResolvedAddress) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Start typing an address...',
  label,
  className = '',
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('autocomplete failed');
        const data = await res.json();
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const handlePick = async (s: Suggestion) => {
    setResolving(true);
    try {
      const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(s.placeId)}`);
      if (!res.ok) throw new Error('details failed');
      const data = await res.json();
      if (data.address) {
        onChange(data.address.street || s.mainText || s.description);
        onSelect(data.address as ResolvedAddress);
        setIsOpen(false);
        setSuggestions([]);
      }
    } finally {
      setResolving(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && <label className="block text-xs font-medium text-slate-700 mb-2">{label}</label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        {(loading || resolving) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            {suggestions.map((s) => (
              <button
                key={s.placeId}
                type="button"
                onClick={() => handlePick(s)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <p className="text-sm font-medium text-slate-900 truncate">{s.mainText || s.description}</p>
                {s.secondaryText && (
                  <p className="text-xs text-slate-500 truncate">{s.secondaryText}</p>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
