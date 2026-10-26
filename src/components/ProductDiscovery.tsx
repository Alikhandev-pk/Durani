import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { getCategory, products } from '../data/products';
import { gsap, MOTION_OK, useGSAP } from '../lib/gsap';
import { ArrowRightIcon } from './Icons';
import { Price } from './Price';
import { ProductStage } from './ProductStage';

/** Tabbed explorer linking to each product, showing details taken from the pack. */
export function ProductDiscovery() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const baseId = useId();
  const product = products[active];

  // Swap animation when a different product is chosen.
  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('[data-disc-product]', { autoAlpha: 0, yPercent: 14, rotate: -6, scale: 0.88, duration: 1.1 })
          .from('[data-disc-text] > *', { autoAlpha: 0, y: 22, stagger: 0.06, duration: 0.8 }, 0.08);
      });
    },
    { dependencies: [active], scope: panelRef, revertOnUpdate: true },
  );

  const onKeyDown = (e: KeyboardEvent) => {
    const last = products.length - 1;
    const keyMap: Record<string, number> = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowDown: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      ArrowUp: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    const next = keyMap[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-14">
      <div
        role="tablist"
        aria-label="Durani products"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0 lg:flex-col lg:flex-nowrap lg:overflow-visible"
      >
        {products.map((p, i) => {
          const selected = i === active;
          return (
            <button
              key={p.slug}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${baseId}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`shrink-0 snap-start rounded-full border px-5 py-3 text-left text-sm transition duration-300 lg:rounded-2xl lg:px-6 lg:py-5 ${
                selected
                  ? 'border-espresso bg-espresso text-ivory shadow-lift lg:translate-x-2'
                  : 'border-line bg-white text-espresso hover:border-champagne lg:hover:translate-x-1'
              }`}
            >
              <span
                className={`hidden text-[0.65rem] tracking-[0.24em] uppercase lg:block ${
                  selected ? 'text-champagne' : 'text-gold-deep'
                }`}
              >
                {getCategory(p.category)?.name}
              </span>
              <span className="font-serif text-base lg:mt-1 lg:block lg:text-lg">{p.shortName}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={panelRef}
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
        className="grid items-center gap-8 overflow-hidden rounded-[2rem] border border-line/70 bg-white p-4 shadow-soft sm:grid-cols-2 sm:p-6 lg:p-8"
      >
        <div className="group overflow-hidden rounded-[1.5rem]">
          <div data-disc-product>
            <ProductStage product={product} size="h-[72%]" sizes="(min-width: 640px) 40vw, 92vw" className="aspect-square" />
          </div>
        </div>
        <div data-disc-text className="sm:pr-4">
          <p className="eyebrow">{getCategory(product.category)?.name}</p>
          <h3 className="mt-2 text-2xl sm:text-3xl">{product.name}</h3>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {product.size && (
              <>
                <dt className="text-cocoa">Size</dt>
                <dd>{product.size}</dd>
              </>
            )}
            <dt className="text-cocoa">Price</dt>
            <dd>
              <Price price={product.price} />
            </dd>
          </dl>
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-xs tracking-[0.18em] text-cocoa uppercase">Printed on the pack</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.packagingText.slice(0, 4).map((line) => (
                <li key={line} className="rounded-full bg-cream px-3 py-1 text-sm">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <Link to={`/product/${product.slug}`} className="btn-primary mt-8">
            View product
            <span className="sr-only">: {product.name}</span>
            <ArrowRightIcon width={16} height={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
