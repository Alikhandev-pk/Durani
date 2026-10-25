import { MAX_QUANTITY } from '../lib/cart';
import { MinusIcon, PlusIcon } from './Icons';

interface Props {
  value: number;
  onChange: (value: number) => void;
  /** Accessible group label, e.g. "Quantity for Durani Serum". */
  label: string;
  disabled?: boolean;
  size?: 'md' | 'sm';
}

export function QuantitySelector({ value, onChange, label, disabled = false, size = 'md' }: Props) {
  const h = size === 'sm' ? 'h-10' : 'h-12';
  const w = size === 'sm' ? 'w-10' : 'w-11';
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex ${h} items-center rounded-full border border-line bg-white ${disabled ? 'opacity-60' : ''}`}
    >
      <button
        type="button"
        className={`grid ${h} ${w} place-items-center rounded-l-full text-espresso hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
      >
        <MinusIcon width={16} height={16} />
      </button>
      <output className="min-w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
        <span className="sr-only">Quantity </span>
        {value}
      </output>
      <button
        type="button"
        className={`grid ${h} ${w} place-items-center rounded-r-full text-espresso hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= MAX_QUANTITY}
        aria-label="Increase quantity"
      >
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
