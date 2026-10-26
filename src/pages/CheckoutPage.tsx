import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EmptyCart } from '../components/EmptyCart';
import { WhatsAppIcon } from '../components/Icons';
import { Notice } from '../components/Notice';
import { ProductImage } from '../components/ProductImage';
import { site } from '../config/site';
import { useCart } from '../context/CartContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrice } from '../lib/format';
import { gsap, MOTION_OK, useGSAP } from '../lib/gsap';
import { buildOrderMessage, createOrderReference, orderTotals, whatsappOrderUrl, type OrderLine } from '../lib/order';

interface FormValues {
  name: string;
  phone: string;
  address: string;
  city: string;
}

type Errors = Partial<Record<keyof FormValues, string>>;

const empty: FormValues = { name: '', phone: '', address: '', city: '' };

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

/** A WhatsApp order message that has been opened for the customer to send. */
interface OrderRequest {
  reference: string;
  url: string;
}

export function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [values, setValues] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [request, setRequest] = useState<OrderRequest | null>(null);
  const formId = useId();
  const requestRef = useRef<HTMLDivElement>(null);

  usePageMeta({ title: 'Checkout', noindex: true });

  const lines: OrderLine[] = items.map((i) => ({
    name: i.product.name,
    quantity: i.quantity,
    unitPrice: i.product.price ?? 0,
  }));
  const delivery = site.orders.deliveryCharge;
  const { total } = orderTotals(lines, delivery);

  // A changed cart needs a new message, so the opened one no longer applies.
  const cartKey = items.map((i) => `${i.slug}:${i.quantity}`).join(',');
  useEffect(() => setRequest(null), [cartKey]);

  useGSAP(
    () => {
      if (!request) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(requestRef.current, { autoAlpha: 0, y: 16, duration: 0.7, ease: 'expo.out' });
      });
    },
    { dependencies: [request?.reference], revertOnUpdate: true },
  );

  const set = (key: keyof FormValues) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
    setRequest(null);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as (keyof FormValues)[])[0];
    if (firstInvalid) {
      document.getElementById(`${formId}-${firstInvalid}`)?.focus();
      return;
    }
    if (!site.contact.whatsapp) return;
    const reference = createOrderReference();
    const message = buildOrderMessage(
      reference,
      { name: values.name, phone: values.phone, address: `${values.address.trim()}, ${values.city.trim()}` },
      lines,
      delivery,
    );
    const url = whatsappOrderUrl(site.contact.whatsapp, message);
    // Opening WhatsApp neither sends the message nor confirms the order, so the
    // cart is kept and nothing is marked as placed or paid.
    window.open(url, '_blank', 'noopener,noreferrer');
    setRequest({ reference, url });
  };

  if (items.length === 0) {
    return (
      <div className="container-page pt-8 sm:pt-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Checkout' }]} />
        <h1 className="mt-6 text-4xl sm:text-5xl">Checkout</h1>
        <EmptyCart />
      </div>
    );
  }

  const field = (key: keyof FormValues, label: string, props: Record<string, unknown> = {}, multiline = false) => {
    const id = `${formId}-${key}`;
    const errorId = `${id}-error`;
    const shared = {
      id,
      name: key,
      value: values[key],
      onChange: set(key),
      required: true,
      'aria-invalid': errors[key] ? true : undefined,
      'aria-describedby': errors[key] ? errorId : undefined,
      className: `field-input ${errors[key] ? 'border-red-700' : ''}`,
      ...props,
    };
    return (
      <div>
        <label htmlFor={id} className="field-label">
          {label}
          <span aria-hidden="true" className="text-gold-deep">
            {' '}
            *
          </span>
        </label>
        {multiline ? <textarea rows={3} {...shared} /> : <input {...shared} />}
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
      <p className="mt-3 max-w-2xl text-cocoa">
        Orders are confirmed on WhatsApp. Enter your details, review your order, then send the prepared message to
        Durani Cosmetics{site.contact.phone ? ` (${site.contact.phone})` : ''}.
      </p>

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
          {field('address', 'Delivery address', { autoComplete: 'street-address' }, true)}
          {field('city', 'City', { autoComplete: 'address-level2' })}

          {site.contact.whatsapp ? (
            <button type="submit" className="btn-gold min-h-13 w-full gap-2 sm:w-auto sm:px-8">
              <WhatsAppIcon width={20} height={20} />
              Place Order via WhatsApp
            </button>
          ) : (
            <Notice title="Ordering is not available yet" tone="draft">
              Please message Durani Cosmetics on{' '}
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="link-underline text-espresso">
                Facebook<span className="sr-only"> (opens in a new tab)</span>
              </a>{' '}
              to order.
            </Notice>
          )}

          <div aria-live="polite">
            {request && (
              <div ref={requestRef} className="rounded-3xl border border-champagne bg-[#fbf1df] p-5 sm:p-6">
                <p className="font-serif text-xl text-espresso">Send your message on WhatsApp to request confirmation.</p>
                <p className="mt-2 text-sm text-cocoa">
                  Your order is not placed yet. WhatsApp has opened with your order message ready — press{' '}
                  <strong className="text-espresso">Send</strong> in WhatsApp, and Durani Cosmetics will confirm your
                  order in the chat. Your cart is kept until then.
                </p>
                <p className="mt-3 text-sm">
                  Order reference: <strong className="tabular-nums text-espresso">{request.reference}</strong>
                </p>
                <a
                  href={request.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline mt-4 min-h-12 w-full gap-2 sm:w-auto"
                >
                  <WhatsAppIcon width={18} height={18} />
                  Open WhatsApp Again
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            )}
          </div>
        </form>

        {/* On phones the summary comes first, so the order is reviewed before the details are sent. */}
        <aside
          aria-labelledby="checkout-summary"
          className="order-first h-fit rounded-3xl border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-28 lg:order-none"
        >
          <h2 id="checkout-summary" className="font-serif text-2xl">
            Order summary
          </h2>
          <ul className="mt-5 divide-y divide-line">
            {items.map(({ product, quantity, lineTotal }) => (
              <li key={product.slug} className="flex items-center gap-4 py-3">
                <div className="relative w-14 shrink-0 rounded-lg border border-line">
                  <ProductImage image={{ ...product.images[0], alt: '' }} sizes="56px" />
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-espresso px-1 text-[0.65rem] text-ivory"
                  >
                    {quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-sm leading-snug">
                  <p>{product.name}</p>
                  <p className="mt-0.5 text-cocoa tabular-nums">
                    {quantity} × {formatPrice(product.price ?? 0)}
                  </p>
                </div>
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
              <dd className="text-right text-cocoa tabular-nums">
                {delivery === null ? 'To be confirmed' : formatPrice(delivery)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
              <dt className="font-medium text-espresso">Total</dt>
              <dd className="text-right">
                <span className="text-lg font-medium tabular-nums">{formatPrice(total)}</span>
                {delivery === null && <span className="block text-xs text-cocoa">Excluding delivery</span>}
              </dd>
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
