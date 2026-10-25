import { Link } from 'react-router-dom';
import { site } from '../config/site';
import { isPurchasable, products } from '../data/products';
import { BagIcon } from './Icons';

const anyPurchasable = products.some(isPurchasable);

export function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="mx-auto max-w-sm py-10 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream text-gold-deep">
        <BagIcon width={28} height={28} />
      </div>
      <p className="mt-5 font-serif text-2xl">Your cart is empty</p>
      {anyPurchasable ? (
        <p className="mt-2 text-sm text-cocoa">Browse the range and add your favourites.</p>
      ) : (
        <p className="mt-2 text-sm text-cocoa">
          Online prices are being finalised, so products can't be added to the cart yet. To ask about ordering,
          message us on{' '}
          <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="link-underline">
            Facebook<span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
      )}
      <Link to="/shop" onClick={onNavigate} className="btn-primary mt-6">
        Shop all products
      </Link>
    </div>
  );
}
