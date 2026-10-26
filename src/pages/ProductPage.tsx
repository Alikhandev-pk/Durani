import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Accordion } from '../components/Accordion';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FacebookIcon, WhatsAppIcon } from '../components/Icons';
import { Price } from '../components/Price';
import { ProductCard } from '../components/ProductCard';
import { ProductGallery } from '../components/ProductGallery';
import { QuantitySelector } from '../components/QuantitySelector';
import { SectionHeading } from '../components/SectionHeading';
import { site, whatsappLink } from '../config/site';
import { useCart } from '../context/CartContext';
import { getCategory, getProduct, isPurchasable, relatedProducts } from '../data/products';
import { usePageMeta } from '../hooks/usePageMeta';
import { clampQuantity } from '../lib/cart';
import { NotFoundPage } from './NotFoundPage';

export function ProductPage() {
  const { slug } = useParams();
  // Keyed by slug so quantity, gallery and "added" state reset when moving between products.
  return <ProductDetail key={slug} slug={slug} />;
}

function ProductDetail({ slug }: { slug: string | undefined }) {
  const product = getProduct(slug);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number>();
  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  usePageMeta({
    title: product?.name ?? 'Product not found',
    description: product
      ? `${product.name}${product.size ? `, ${product.size}` : ''} from Durani Cosmetics. ${product.description}`
      : undefined,
  });

  if (!product) return <NotFoundPage />;

  const category = getCategory(product.category);
  const purchasable = isPurchasable(product);
  const whatsapp = whatsappLink(`Hello Durani Cosmetics, I'd like to order: ${product.name}`);

  const addToCart = () => {
    if (addItem(product.slug, quantity)) {
      setAdded(true);
      window.clearTimeout(addedTimer.current);
      addedTimer.current = window.setTimeout(() => setAdded(false), 2500);
    }
  };

  const buyNow = () => {
    if (addItem(product.slug, quantity, { openDrawer: false })) navigate('/checkout');
  };

  const sections = [
    {
      id: 'description',
      title: 'Description',
      content: <p>{product.description}</p>,
    },
    {
      id: 'pack',
      title: 'Printed on the pack',
      content: (
        <>
          <p className="mb-3 text-sm">Text as printed on the product packaging:</p>
          <ul className="space-y-1.5">
            {product.packagingText.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                <span className="text-espresso">{line}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: 'usage',
      title: 'How to use',
      content: product.usage ? (
        <p>{product.usage}</p>
      ) : (
        <p>Usage directions haven't been published here yet. Please follow the directions on the product packaging.</p>
      ),
    },
    {
      id: 'ingredients',
      title: 'Ingredients',
      content: product.ingredients ? (
        <p>{product.ingredients}</p>
      ) : (
        <p>The full ingredient list hasn't been published here yet. Please refer to the product packaging.</p>
      ),
    },
  ];

  return (
    <>
      <div className="container-page pt-8 sm:pt-10">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/shop' },
            ...(category ? [{ label: category.name, to: `/shop/${category.slug}` }] : []),
            { label: product.shortName },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          <div data-reveal>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div data-reveal className="lg:pt-4">
            {category && (
              <Link to={`/shop/${category.slug}`} className="eyebrow hover:text-espresso">
                {category.name}
              </Link>
            )}
            <h1 className="mt-3 text-4xl tracking-[-0.01em] sm:text-5xl xl:text-6xl">{product.name}</h1>

            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-y border-line py-5">
              <dt className="text-sm text-cocoa">Price</dt>
              <dd>
                <Price price={product.price} className="text-xl" />
              </dd>
              <dt className="text-sm text-cocoa">Size</dt>
              <dd>{product.size ?? <span className="text-sm text-cocoa">To be confirmed</span>}</dd>
            </dl>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-cocoa" aria-hidden="true">
                  Quantity
                </span>
                <QuantitySelector
                  value={quantity}
                  onChange={(q) => setQuantity(clampQuantity(q))}
                  label={`Quantity for ${product.name}`}
                  disabled={!purchasable}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" className="btn-outline" onClick={addToCart} disabled={!purchasable}>
                  {added ? 'Added to cart' : 'Add to Cart'}
                </button>
                <button type="button" className="btn-primary" onClick={buyNow} disabled={!purchasable}>
                  Buy Now
                </button>
              </div>
              <p className="sr-only" role="status">
                {added ? `${product.name} added to cart` : ''}
              </p>

              {!purchasable && (
                <div className="rounded-2xl bg-cream px-5 py-4 text-sm text-cocoa">
                  <p className="font-medium text-espresso">Contact for price</p>
                  <p className="mt-1">
                    Online ordering for this product will open once its price is confirmed.
                    {whatsapp ? ' You can message us on WhatsApp to ask about it.' : ' You can ask about it on Facebook.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {whatsapp && (
                      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-gold min-h-11 px-5">
                        <WhatsAppIcon width={18} height={18} /> Order on WhatsApp
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                    <a
                      href={site.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 font-medium text-espresso link-underline"
                    >
                      <FacebookIcon width={18} height={18} /> Message us on Facebook
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10">
              <Accordion items={sections} defaultOpen="description" />
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="related-heading" className="container-page pt-24">
        <SectionHeading eyebrow="You may also like" title="Related products" id="related-heading" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
          {relatedProducts(product).map((p) => (
            <li key={p.slug} data-reveal>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
