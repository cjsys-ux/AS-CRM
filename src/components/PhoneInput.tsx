import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import {
  AsYouType,
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
} from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

const REGION_NAMES =
  typeof Intl !== 'undefined' && (Intl as any).DisplayNames
    ? new (Intl as any).DisplayNames(['en'], { type: 'region' })
    : null;

const countryFlag = (code: string) =>
  code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

const COMMON_COUNTRIES: CountryCode[] = [
  'US',
  'CA',
  'MX',
  'GB',
  'AU',
  'DE',
  'FR',
  'ES',
  'IT',
  'NL',
  'BR',
  'IN',
  'CN',
  'JP',
];

type CountryEntry = { code: CountryCode; name: string; callingCode: string };

const ALL_COUNTRIES: CountryEntry[] = (() => {
  const all = getCountries().map((code) => ({
    code,
    name: REGION_NAMES?.of(code) ?? code,
    callingCode: getCountryCallingCode(code),
  }));
  const common = COMMON_COUNTRIES.map((code) => all.find((c) => c.code === code)).filter(
    (c): c is CountryEntry => !!c
  );
  const rest = all
    .filter((c) => !COMMON_COUNTRIES.includes(c.code))
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...common, ...rest];
})();

const findCountry = (code: CountryCode) =>
  ALL_COUNTRIES.find((c) => c.code === code) ?? ALL_COUNTRIES[0];

const detectCountry = (value: string, fallback: CountryCode): CountryCode => {
  if (!value) return fallback;
  if (value.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(value);
    if (parsed?.country) return parsed.country;
  }
  return fallback;
};

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: CountryCode;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  showValidation?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = 'US',
  disabled,
  placeholder,
  className,
  inputClassName,
  id,
  name,
  autoFocus,
  showValidation = true,
}: PhoneInputProps) {
  const [country, setCountry] = useState<CountryCode>(() => detectCountry(value, defaultCountry));

  useEffect(() => {
    if (value?.startsWith('+')) {
      const parsed = parsePhoneNumberFromString(value);
      if (parsed?.country && parsed.country !== country) {
        setCountry(parsed.country);
      }
    }
  }, [value]);

  const formattedValue = useMemo(() => {
    if (!value) return '';
    return new AsYouType(country).input(value);
  }, [value, country]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = new AsYouType(country).input(e.target.value);
    onChange(next);
  };

  const handleCountryChange = (next: CountryCode) => {
    setCountry(next);
    if (!value) return;
    const parsed = parsePhoneNumberFromString(value, country);
    const digits = parsed ? parsed.nationalNumber : value.replace(/\D/g, '');
    if (!digits) return;
    onChange(new AsYouType(next).input(`+${getCountryCallingCode(next)}${digits}`));
  };

  const isValid = useMemo(() => {
    if (!value) return null;
    try {
      return isValidPhoneNumber(value, country);
    } catch {
      return false;
    }
  }, [value, country]);

  const showInvalid = showValidation && isValid === false;

  return (
    <div
      className={
        className ??
        'flex items-stretch w-full bg-slate-50 border border-slate-200 rounded-lg overflow-visible focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'
      }
      data-invalid={showInvalid ? 'true' : undefined}
      style={showInvalid ? { borderColor: '#ef4444' } : undefined}
    >
      <CountryPicker country={country} onChange={handleCountryChange} disabled={disabled} />
      <div className="w-px self-stretch bg-slate-200" />
      <input
        id={id}
        name={name}
        type="tel"
        autoComplete="tel"
        autoFocus={autoFocus}
        value={formattedValue}
        onChange={handleInput}
        placeholder={placeholder ?? 'Phone number'}
        disabled={disabled}
        className={
          inputClassName ??
          'flex-1 min-w-0 bg-transparent border-0 outline-none px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed'
        }
      />
    </div>
  );
}

function CountryPicker({
  country,
  onChange,
  disabled,
}: {
  country: CountryCode;
  onChange: (next: CountryCode) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    setQuery('');
    setTimeout(() => searchRef.current?.focus(), 0);
    const onScroll = () => updatePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const current = findCountry(country);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.callingCode.includes(q)
    );
  }, [query]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
          open ? 'bg-slate-100' : ''
        }`}
        title={`${current.name} (+${current.callingCode})`}
      >
        <span className="text-base leading-none">{countryFlag(current.code)}</span>
        <span className="text-xs font-medium text-slate-500">+{current.callingCode}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: 280, zIndex: 99999 }}
            className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code"
                className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    c.code === country
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base leading-none">{countryFlag(c.code)}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-slate-500">+{c.callingCode}</span>
                  {c.code === country && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-slate-500">No matches</div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
