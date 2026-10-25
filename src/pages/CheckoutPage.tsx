import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EmptyCart } from '../components/EmptyCart';
import { Notice } from '../components/Notice';
import { ProductImage } from '../components/ProductImage';
import { isCheckoutLive, site } from '../config/site';
import { useCart } from '../context/CartContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrice } from '../lib/format';

interface FormValues {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

type Errors = Partial<Record<keyof FormValues, string>>;

const empty: FormValues = { name: '', phone: '', address: '', city: '', notes: '' };

/** Accepts Pakistani mobile/landline formats such as 03001234567, +92 300 1234567, 042-1234567. */
const phonePattern = /^(\+92|0092|0)?[\s-]?\d{2,3}[\s-]?\d{6,8}$/;

function validate(values: FormValues): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your full name.';
  if (!phonePattern.test(values.phone.trim())) errors.phone = 'Please enter a valid phone number, e.g. 03001234567.';
  if (values.address.trim().length < 8) errors.address = 'Please enter your full delivery address.';
  if (values.city.trim().length < 2) errors.city = 'Please enter your city.';
  return errors;
}

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [values, setValues] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const formId = useId();

  usePageMeta({ title: 'Checkout', noindex: true });

  const set = (key: keyof FormValues) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
    setDemoSubmitted(false);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as (keyof FormValues)[])[0];
    if (firstInvalid) {
      document.getElementById(`${formId}-${firstInvalid}`)?.focus();
      return;
    }
    const endpoint = site.orders.endpoint;
    if (!endpoint) {
      // No order backend is configured: do not pretend the order was placed.
      setDemoSubmitted(true);
      return;
    }
    setStatus('sending');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: values,
          items: items.map((i) => ({ slug: i.slug, name: i.product.name, quantity: i.quantity, unitPrice: i.product.price })),
          subtotal,
          currency: site.currency,
        }),
      });
      if (!response.ok) throw new Error(`Order request failed: ${response.status}`);
      setStatus('sent');
      clear();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="container-page pt-16 text-center">
        <h1 className="text-4xl sm:text-5xl">Thank you</h1>
        <p className="mx-auto mt-4 max-w-md text-cocoa">Your order request has been received. We will contact you to confirm it.</p>
        <Link to="/shop" className="btn-primary mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page pt-8 sm:pt-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Checkout' }]} />
        <h1 className="mt-6 text-4xl sm:text-5xl">Checkout</h1>
        <EmptyCart />
      </div>
    );
  }

  const field = (key: keyof FormValues, label: string, props: Record<string, unknown> = {}) => {
    const id = `${formId}-${key}`;
    const errorId = `${id}-error`;
    return (
      <div>
        <label htmlFor={id} className="field-label">
          {label}
          {key !== 'notes' && (
            <span aria-hidden="true" className="text-gold-deep">
              {' '}
              *
            </span>
          )}
        </label>
        <input
          id={id}
          name={key}
          value={values[key]}
          onChange={set(key)}
          required={key !== 'notes'}
          aria-invalid={errors[key] ? true : undefined}
          aria-describedby={errors[key] ? errorId : undefined}
          className={`field-input ${errors[key] ? 'border-red-700' : ''}`}
          {...props}
        />
        {errors[key] && (
          <p id={errorId} className="mt-1.5 text-sm text-red-800">
            {errors[key]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="container-page pt-8 sm:pt-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="mt-6 text-4xl sm:text-5xl">Checkout</h1>

      {!isCheckoutLive && (
        <Notice title="Demo checkout" tone="draft" className="mt-6 max-w-3xl">
          Online ordering is not connected yet. You can fill in this form to preview checkout, but no order will be
          sent and no payment will be taken.
        </Notice>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-16">
        <form noValidate onSubmit={onSubmit} aria-labelledby={`${formId}-title`} className="space-y-5">
          <h2 id={`${formId}-title`} className="font-serif text-2xl">
            Delivery details
          </h2>
          <p className="text-sm text-cocoa">
            Fields marked <span className="text-gold-deep">*</span> are required.
          </p>
          {field('name', 'Full name', { autoComplete: 'name' })}
          {field('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '03XX XXXXXXX' })}
          {field('address', 'Address', { autoComplete: 'street-address' })}
          {field('city', 'City', { autoComplete: 'address-level2' })}
          <div>
            <label htmlFor={`${formId}-notes`} className="field-label">
              Order notes <span className="font-normal text-cocoa">(optional)</span>
            </label>
            <textarea
              id={`${formId}-notes`}
              name="notes"
              rows={4}
              value={values.notes}
              onChange={set('notes')}
              className="field-input"
            />
          </div>

          <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status === 'sending'}>
            {isCheckoutLive ? (status === 'sending' ? 'Sending…' : 'Place order') : 'Review demo order'}
          </button>

          <div aria-live="polite">
            {status === 'error' && (
              <Notice title="Your order could not be sent" tone="draft">
                Please check your connection and try again.
              </Notice>
            )}
            {demoSubmitted && (
              <Notice title="This order has not been sent" tone="draft">
                Your details look complete, but online ordering isn't connected yet, so nothing has been submitted. To
                ask about ordering, message us on{' '}
                <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="link-underline text-espresso">
                  Facebook<span className="sr-only"> (opens in a new tab)</span>
                </a>
                .
              </Notice>
            )}
          </div>
        </form>

        <aside aria-labelledby="checkout-summary" className="h-fit rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-28">
          <h2 id="checkout-summary" className="font-serif text-2xl">
            Order summary
          </h2>
          <ul className="mt-5 divide-y divide-line">
            {items.map(({ product, quantity, lineTotal }) => (
              <li key={product.slug} className="flex items-center gap-4 py-3">
                <div className="relative w-14 shrink-0 rounded-lg border border-line">
                  <ProductImage image={{ ...product.images[0], alt: '' }} sizes="56px" />
                  <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-espresso px-1 text-[0.65rem] text-ivory">
                    {quantity}
                  </span>
                </div>
                <p className="min-w-0 flex-1 text-sm leading-snug">
                  {product.name}
                  <span className="sr-only">, quantity {quantity}</span>
                </p>
                <p className="text-sm tabular-nums">{formatPrice(lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-cocoa">Subtotal</dt>
              <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa">Delivery</dt>
              <dd className="text-right text-cocoa">To be confirmed</dd>
            </div>
          </dl>
          <Link to="/cart" className="mt-5 flex min-h-11 items-center justify-center text-sm link-underline">
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
