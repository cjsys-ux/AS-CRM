import { Plus, Minus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Show a wider input area for larger numbers */
  wide?: boolean;
  /** Optional label for screen readers */
  label?: string;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  wide = false,
  label,
  disabled = false,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    const next = value - step;
    if (min !== undefined && next < min) return;
    onChange(next);
  };

  const handleIncrement = () => {
    const next = value + step;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || (min !== undefined && value <= min)}
        aria-label={label ? `Decrease ${label}` : 'Decrease'}
        className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <div className={`relative ${wide ? 'w-14' : 'w-10'} h-9 flex items-center justify-center`}>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const parsed = parseInt(e.target.value);
            if (isNaN(parsed)) return;
            if (min !== undefined && parsed < min) return onChange(min);
            if (max !== undefined && parsed > max) return onChange(max);
            onChange(parsed);
          }}
          disabled={disabled}
          className="w-full h-full bg-transparent text-center text-sm font-bold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        aria-label={label ? `Increase ${label}` : 'Increase'}
        className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
