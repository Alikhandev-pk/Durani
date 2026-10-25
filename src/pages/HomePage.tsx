import { Link } from 'react-router-dom';
import { Accordion, type AccordionItem } from '../components/Accordion';
import { HeroSlider } from '../components/HeroSlider';
import { HomeHero } from '../components/HomeHero';
import { ArrowRightIcon } from '../components/Icons';
import { Marquee } from '../components/Marquee';
import { ProductCard } from '../components/ProductCard';
import { ProductDiscovery } from '../components/ProductDiscovery';
import { ProductStage } from '../components/ProductStage';
import { ScrubText } from '../components/ScrubText';
import { SectionHeading } from '../components/SectionHeading';
import { isCheckoutLive, site, whatsappLink } from '../config/site';
import { categories, products } from '../data/products';
import { usePageMeta } from '../hooks/usePageMeta';
import { cutout } from '../lib/images';

/** Phrases printed on the Durani packs, for the ribbon under the hero. */
const packPhrases = [
  '100% Natural',
  'Unlock Your Natural Beauty',
  'Skin Rejuvenation',
  'Avocado & Aloe Vera',
  'Skin Brightening',
  'Skin Whitening + Glowing',
];

/** Product photo used to represent each category. */
const categoryCover: Record<string, string> = {
  'face-wash': 'durani-skin-brightening-face-wash',
  serums: 'durani-skin-whitening-serum',
  'beauty-cream': 'durani-beauty-cream',
};

const facebookLink = (
  <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="link-underline text-espresso">
    Facebook<span className="sr-only"> (opens in a new tab)</span>
  </a>
);

function buildFaq(): AccordionItem[] {
  const whatsapp = whatsappLink('Hello Durani Cosmetics, I would like to place an order.');
  return [
    {
      id: 'range',
      title: 'Which products does Durani Cosmetics offer?',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          {products.map((p) => (
            <li key={p.slug}>
              <Link to={`/product/${p.slug}`} className="link-underline text-espresso">
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'sizes',
      title: 'What sizes are available?',
      content: (
        <ul className="list-disc space-y-1 pl-5">
          {products.map((p) => (
            <li key={p.slug}>
              {p.shortName}: {p.size ?? 'size to be confirmed'}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'order',
      title: 'How can I place an order?',
      content: isCheckoutLive ? (
        <p>Add products to your cart and complete the checkout form.</p>
      ) : whatsapp ? (
        <p>
          Message us on{' '}
          <a href={whatsapp} className="link-underline text-espresso" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>{' '}
          to place an order.
        </p>
      ) : (
        <p>Online ordering is being set up. In the meantime, please message Durani Cosmetics on {facebookLink} to ask about ordering.</p>
      ),
    },
    {
      id: 'delivery',
      title: 'What delivery and payment options are available?',
      content: <p>Please contact us on {facebookLink} for current delivery and payment options.</p>,
    },
    {
      id: 'ingredients',
      title: 'Where can I find ingredient and usage information?',
      content: (
        <p>
          Each product page shows the details printed on its pack. Full ingredient lists and usage directions will be
          added as they are published — until then, please refer to the product packaging.
        </p>
      ),
    },
  ];
}

export function HomePage() {
  usePageMeta({});

  return (
    <>
      <HomeHero />
      <Marquee items={packPhrases} />

      {/* Shop by category */}
      <section aria-labelledby="categories-heading" className="container-page pt-24 sm:pt-32">
        <SectionHeading eyebrow="Explore" title="Shop by Category" id="categories-heading" align="center" />
        <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-8">
          {categories.map((c, i) => {
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <li key={c.slug} data-reveal>
                <Link
                  to={`/shop/${c.slug}`}
                  className="group relative flex items-center overflow-hidden rounded-[2rem] border border-line/70 bg-white transition duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:shadow-lift sm:block"
                >
                  <ProductStage slug={categoryCover[c.slug]} className="aspect-square w-32 shrink-0 sm:aspect-[5/4] sm:w-auto" />
                  <span
                    aria-hidden="true"
                    className="absolute top-4 right-5 hidden font-serif text-5xl text-champagne/60 italic transition-colors duration-500 group-hover:text-gold sm:block"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-1 items-center justify-between gap-3 px-5 py-4 sm:px-7 sm:py-6">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl">{c.name}</h3>
                      <p className="text-sm text-cocoa">
                        {count} {count === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line text-espresso transition duration-500 group-hover:-rotate-45 group-hover:border-espresso group-hover:bg-espresso group-hover:text-ivory">
                      <ArrowRightIcon width={18} height={18} />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Campaign banners */}
      <section aria-labelledby="campaign-heading" className="container-page pt-24 sm:pt-32">
        <SectionHeading eyebrow="Campaign" title="Meet the Durani range" id="campaign-heading" />
        <HeroSlider />
      </section>

      {/* Featured products */}
      <section aria-labelledby="featured-heading" className="container-page pt-24 sm:pt-32">
        <SectionHeading
          eyebrow="The Range"
          title="Featured Products"
          id="featured-heading"
          action={
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 text-sm font-medium tracking-[0.12em] uppercase link-underline"
            >
              Shop all
              <ArrowRightIcon width={16} height={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          }
        />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.slug} data-reveal>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>

      {/* Brand introduction */}
      <section
        aria-labelledby="about-heading"
        className="grain relative isolate mt-24 overflow-hidden bg-espresso text-ivory sm:mt-32"
      >
        <div aria-hidden="true" className="absolute -top-32 -right-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-gold/25 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-40 -left-20 -z-10 h-[26rem] w-[26rem] rounded-full bg-cocoa/60 blur-3xl" />
        <div className="container-page grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div>
            <p data-reveal className="eyebrow mb-5 flex items-center gap-3 text-champagne">
              <span aria-hidden="true" className="h-px w-8 bg-champagne" />
              About Durani
            </p>
            <h2 id="about-heading" data-split className="text-4xl text-ivory sm:text-5xl lg:text-6xl">
              Skincare, simply presented.
            </h2>
            <ScrubText className="mt-8 max-w-2xl font-serif text-2xl leading-snug text-ivory sm:text-3xl">
              Durani Cosmetics is a Pakistani skincare brand. Every product here is shown in its original packaging,
              with sizes and label details taken directly from the pack — so you know exactly what you are choosing.
            </ScrubText>
            <div data-reveal className="mt-10">
              <Link to="/shop" className="btn-gold h-14 px-8">
                Discover the range
                <ArrowRightIcon width={16} height={16} />
              </Link>
            </div>
          </div>

          <ul data-reveal className="grid grid-cols-2 gap-4 pb-8" aria-label="The current range">
            {products.map((p, i) => (
              <li key={p.slug} className={i % 2 ? 'translate-y-8' : ''}>
                <Link
                  to={`/product/${p.slug}`}
                  className="group block rounded-[1.5rem] border border-ivory/10 bg-ivory/5 p-4 backdrop-blur transition duration-500 hover:-translate-y-1 hover:border-champagne/40 hover:bg-ivory/10"
                >
                  <div className="relative aspect-square">
                    <img
                      {...cutout(p.slug)}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 m-auto h-[82%] w-auto max-w-full object-contain drop-shadow-[0_18px_24px_rgb(0_0_0/0.35)] transition duration-700 group-hover:-translate-y-1 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-center font-serif text-sm text-ivory/90 sm:text-base">{p.shortName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Product discovery */}
      <section id="discover" aria-labelledby="discover-heading" className="container-page scroll-mt-24 pt-24 sm:pt-32">
        <SectionHeading
          eyebrow="Discover"
          title="Find your Durani product"
          id="discover-heading"
          description="Choose a product to see its size, price and what's printed on the pack."
        />
        <div data-reveal>
          <ProductDiscovery />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-heading" className="container-page scroll-mt-24 pt-24 sm:pt-32">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <SectionHeading
            eyebrow="Help"
            title="Frequently asked questions"
            id="faq-heading"
            description={
              <p>
                Can't find your answer? <Link to="/contact" className="link-underline text-espresso">Contact us</Link>.
              </p>
            }
          />
          <div data-reveal>
            <Accordion items={buildFaq()} />
          </div>
        </div>
      </section>
    </>
  );
}
