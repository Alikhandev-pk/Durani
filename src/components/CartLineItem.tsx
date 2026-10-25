import { Link } from 'react-router-dom';
import { useCart, type CartItem } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { ProductImage } from './ProductImage';
import { QuantitySelector } from './QuantitySelector';

export function CartLineItem({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const { setQuantity, removeItem } = useCart();
  const { product } = item;
  return (
    <li className="flex gap-4 py-5">
      <Link
        to={`/product/${product.slug}`}
        onClick={onNavigate}
        className="w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-white sm:w-24"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImage image={product.images[0]} sizes="96px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${product.slug}`}
              onClick={onNavigate}
              className="font-serif leading-snug hover:text-gold-deep"
            >
              {product.name}
            </Link>
            {product.size && <p className="text-sm text-cocoa">{product.size}</p>}
            <p className="text-sm text-cocoa">{formatPrice(product.price)} each</p>
          </div>
          <p className="shrink-0 font-medium tabular-nums">{formatPrice(item.lineTotal)}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <QuantitySelector
            size="sm"
            value={item.quantity}
            onChange={(q) => setQuantity(product.slug, q)}
            label={`Quantity for ${product.name}`}
          />
          <button
            type="button"
            onClick={() => removeItem(product.slug)}
            className="min-h-10 text-sm text-cocoa link-underline"
          >
            Remove<span className="sr-only"> {product.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
