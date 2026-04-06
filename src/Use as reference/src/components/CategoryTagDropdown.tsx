import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Tag, Check, X } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Packaging Mockup',
  'Dieline',
  'CAD File',
  'Spec Sheet',
  'Label Design',
  'Barcode/UPC',
  'Compliance Doc',
  'Photo',
  'Certificate',
  'Test Report',
];

export const categoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    'Packaging Mockup': 'bg-pink-100 text-pink-700',
    'Dieline': 'bg-purple-100 text-purple-700',
    'CAD File': 'bg-indigo-100 text-indigo-700',
    'Spec Sheet': 'bg-orange-100 text-orange-700',
    'Label Design': 'bg-blue-100 text-blue-700',
    'Barcode/UPC': 'bg-slate-200 text-slate-700',
    'Compliance Doc': 'bg-green-100 text-green-700',
    'Photo': 'bg-cyan-100 text-cyan-700',
    'Certificate': 'bg-emerald-100 text-emerald-700',
    'Test Report': 'bg-yellow-100 text-yellow-700',
  };
  return colors[cat] || 'bg-amber-100 text-amber-700';
};

interface CategoryTagDropdownProps {
  value: string;
  onChange: (v: string) => void;
}

export function CategoryTagDropdown({ value, onChange }: CategoryTagDropdownProps) {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      // Position to the left of the button
      setPos({ top: r.bottom + 4, left: Math.max(8, r.right - 200) });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setShowCustom(false);
      setCustomInput('');
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
        title={value ? `Category: ${value}` : 'Set category'}
      >
        <Tag className="w-3.5 h-3.5" />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 200, zIndex: 99999 }}
          className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</p>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <X className="w-3 h-3" /> Remove category
              </button>
            )}
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { onChange(cat); setOpen(false); }}
                className={`w-full px-3 py-1.5 text-left text-sm transition-colors flex items-center justify-between gap-2 ${
                  value === cat ? 'bg-slate-50' : 'hover:bg-slate-50'
                }`}
              >
                <span className="text-slate-700 text-xs">{cat}</span>
                {value === cat && <Check className="w-3 h-3 text-green-600 shrink-0" />}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100">
            {showCustom ? (
              <div className="p-2 flex items-center gap-1">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      onChange(customInput.trim());
                      setOpen(false);
                      setShowCustom(false);
                      setCustomInput('');
                    }
                    if (e.key === 'Escape') {
                      setShowCustom(false);
                      setCustomInput('');
                    }
                  }}
                  placeholder="Type name..."
                  className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customInput.trim()) {
                      onChange(customInput.trim());
                      setOpen(false);
                      setShowCustom(false);
                      setCustomInput('');
                    }
                  }}
                  className="px-2 py-1 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className="w-full px-3 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 transition-colors font-medium"
              >
                + Custom category...
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
