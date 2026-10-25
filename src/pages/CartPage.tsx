import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CartLineItem } from '../components/CartLineItem';
import { EmptyCart } from '../components/EmptyCart';
import { useCart } from '../context/CartContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrice } from '../lib/format';

export function CartPage() {
  const { items, count, subtotal, clear } = useCart();
  usePageMeta({ title: 'Your Cart', noindex: true });

  return (
    <div className="container-page pt-8 sm:pt-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <h1 className="mt-6 text-4xl sm:text-5xl">Your cart</h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <section aria-label="Cart items">
            <div className="flex items-center justify-between border-b border-line pb-4 text-sm text-cocoa">
              <p>
                {count} {count === 1 ? 'item' : 'items'}
              </p>
              <button type="button" onClick={clear} className="min-h-10 link-underline">
                Empty cart
              </button>
            </div>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <CartLineItem key={item.slug} item={item} />
              ))}
            </ul>
          </section>

          <aside aria-labelledby="summary-heading" className="h-fit rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-28">
            <h2 id="summary-heading" className="font-serif text-2xl">
              Order summary
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-cocoa">Subtotal</dt>
                <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-cocoa">Delivery</dt>
                <dd className="text-right text-cocoa">To be confirmed</dd>
              </div>
            </dl>
            <Link to="/checkout" className="btn-primary mt-6 w-full">
              Proceed to checkout
            </Link>
            <Link to="/shop" className="mt-3 flex min-h-11 items-center justify-center text-sm link-underline">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
