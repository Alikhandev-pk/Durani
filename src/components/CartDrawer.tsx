import { useId } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { CartLineItem } from './CartLineItem';
import { EmptyCart } from './EmptyCart';
import { CloseIcon } from './Icons';
import { Modal } from './Modal';

export function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart } = useCart();
  const titleId = useId();

  return (
    <Modal open={isOpen} onClose={closeCart} labelledBy={titleId} variant="right">
      <div className="flex h-full flex-col bg-ivory shadow-2xl">
        <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line px-5 sm:px-6">
          <h2 id={titleId} className="font-serif text-xl">
            Your cart <span className="font-sans text-sm text-cocoa">({count})</span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="-mr-2 grid h-11 w-11 place-items-center rounded-full hover:bg-cream"
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center px-6">
            <EmptyCart onNavigate={closeCart} />
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5 sm:px-6">
              {items.map((item) => (
                <CartLineItem key={item.slug} item={item} onNavigate={closeCart} />
              ))}
            </ul>
            <div className="shrink-0 border-t border-line bg-white px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <span className="text-sm tracking-[0.12em] uppercase">Subtotal</span>
                <span className="text-lg font-medium tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-cocoa">Delivery charges are not included and will be confirmed separately.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link to="/cart" onClick={closeCart} className="btn-outline px-4">
                  View cart
                </Link>
                <Link to="/checkout" onClick={closeCart} className="btn-primary px-4">
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
