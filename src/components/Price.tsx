import { formatPrice } from '../lib/format';

interface PriceProps {
  price: number | null;
  className?: string;
}

export function Price({ price, className = '' }: PriceProps) {
  if (price === null) {
    return <span className={`text-sm font-medium tracking-wide text-cocoa ${className}`}>Contact for price</span>;
  }
  return <span className={`font-medium text-espresso ${className}`}>{formatPrice(price)}</span>;
}
