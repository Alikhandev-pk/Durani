import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { categories, products } from '../data/products';
import { useMagnetic } from '../hooks/useMagnetic';
import { cutout } from '../lib/images';
import { FINE_POINTER, gsap, MOTION_OK, useGSAP } from '../lib/gsap';
import { ArrowRightIcon } from './Icons';

/**
 * Products arranged on the plinth. `depth` scales the mouse parallax, so
 * products further forward move more.
 */
const stage = [
  { slug: 'durani-skin-whitening-serum', pos: 'left-1/2 bottom-[19%] h-[60%] -translate-x-1/2 z-10', depth: 0.5 },
  { slug: 'durani-skin-brightening-face-wash', pos: 'left-[3%] bottom-[18%] h-[47%] -rotate-[9deg] z-20', depth: 0.9 },
  { slug: 'durani-rice-face-wash', pos: 'right-[4%] bottom-[18%] h-[47%] rotate-[8deg] z-20', depth: 0.9 },
  { slug: 'durani-beauty-cream', pos: 'left-1/2 bottom-[9%] h-[27%] -translate-x-[18%] z-30', depth: 1.4 },
];

const chip =
  'glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.6rem] font-medium tracking-[0.12em] whitespace-nowrap uppercase sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.14em]';

/** Positions for the twinkling sparkles around the stage. */
const sparkles = [
  'left-[8%] top-[14%] w-5',
  'right-[14%] top-[34%] w-3',
  'left-[20%] top-[46%] w-2.5',
  'right-[6%] bottom-[38%] w-4',
  'left-[46%] top-[3%] w-3',
];

function Sparkle({ className }: { className: string }) {
  return (
    <svg data-sparkle viewBox="0 0 24 24" aria-hidden="true" className={`absolute text-gold ${className}`}>
      <path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
    </svg>
  );
}

/** Rotating circular label taken from the pack line "Unlock Your Natural Beauty". */
function Badge() {
  return (
    <div data-badge className="absolute top-[2%] right-0 z-40 h-20 w-20 sm:right-[1%] sm:h-28 sm:w-28" aria-hidden="true">
      <svg data-badge-ring viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <path id="hero-badge-circle" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
        </defs>
        <circle cx="50" cy="50" r="49" className="fill-ivory/80" />
        <text className="fill-espresso text-[7.6px] font-medium uppercase">
          {/* textLength spreads the phrase evenly around the full circle (2πr ≈ 238). */}
          <textPath href="#hero-badge-circle" textLength="236" lengthAdjust="spacing">
            Unlock your natural beauty ✦ 100% natural ✦
          </textPath>
        </text>
      </svg>
      <img
        src="/images/logo/durani-logo-160.webp"
        alt=""
        width={160}
        height={160}
        className="absolute inset-[25%] h-1/2 w-1/2 rounded-full shadow-soft"
      />
    </div>
  );
}

export function HomeHero() {
  const rootRef = useRef<HTMLElement>(null);
  const primaryCta = useMagnetic<HTMLAnchorElement>(0.35);
  const secondaryCta = useMagnetic<HTMLAnchorElement>(0.25);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const intro = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.3 } });
        intro
          .from('[data-blob]', { autoAlpha: 0, scale: 0.6, duration: 2, stagger: 0.2 }, 0)
          .from('[data-eyebrow-line]', { scaleX: 0, transformOrigin: 'left center', duration: 1 }, 0.15)
          .from('[data-eyebrow]', { autoAlpha: 0, x: -12, duration: 0.9 }, 0.25)
          .from('[data-line]', { yPercent: 115, rotate: 2, duration: 1.4, stagger: 0.12 }, 0.3)
          .from('[data-intro]', { autoAlpha: 0, y: 24, stagger: 0.1, duration: 1 }, 0.75)
          .from('[data-arch]', { autoAlpha: 0, scale: 0.86, transformOrigin: '50% 100%', duration: 1.6 }, 0.2)
          .from('[data-plinth]', { autoAlpha: 0, scaleX: 0.6, duration: 1.4 }, 0.35)
          .from('[data-product]', { autoAlpha: 0, yPercent: 30, scale: 0.9, duration: 1.5, stagger: 0.12 }, 0.5)
          .from('[data-chip]', { autoAlpha: 0, scale: 0.6, y: 14, ease: 'back.out(2)', duration: 0.8, stagger: 0.15 }, 1.25)
          .from('[data-badge]', { autoAlpha: 0, scale: 0.4, rotate: -90, ease: 'back.out(1.6)', duration: 1.1 }, 1.1)
          .from('[data-sparkle]', { autoAlpha: 0, scale: 0, stagger: 0.08, ease: 'back.out(3)', duration: 0.6 }, 1.3);

        // Ambient loops.
        gsap.to('[data-badge-ring]', { rotate: 360, duration: 22, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
        gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el, i) => {
          gsap.to(el, { y: -10 - i * 2, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.3 });
        });
        gsap.utils.toArray<HTMLElement>('[data-sparkle]').forEach((el) => {
          gsap.to(el, {
            scale: 0.4,
            opacity: 0.3,
            rotate: 45,
            duration: gsap.utils.random(1.2, 2.2),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: gsap.utils.random(1.5, 3),
          });
        });
        gsap.utils.toArray<HTMLElement>('[data-blob]').forEach((el, i) => {
          gsap.to(el, { xPercent: i ? -12 : 10, yPercent: i ? 8 : -10, duration: 9 + i * 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        });

        // Scroll away: text and stage drift apart at different speeds.
        const scrollAway = { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: 0.6 };
        gsap.to('[data-hero-copy]', { yPercent: -18, autoAlpha: 0.2, ease: 'none', scrollTrigger: scrollAway });
        gsap.to('[data-hero-stage]', { yPercent: 10, scale: 0.94, ease: 'none', scrollTrigger: scrollAway });
      });

      // Mouse parallax across the product stage.
      mm.add(`${MOTION_OK} and ${FINE_POINTER}`, () => {
        const root = rootRef.current;
        if (!root) return;
        const layers = gsap.utils.toArray<HTMLElement>('[data-depth]').map((el) => ({
          depth: Number(el.dataset.depth),
          x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
        }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => {
            l.x(nx * 36 * l.depth);
            l.y(ny * 24 * l.depth);
          });
        };
        root.addEventListener('pointermove', move);
        return () => root.removeEventListener('pointermove', move);
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="grain relative isolate overflow-hidden" aria-labelledby="hero-heading">
      {/* Soft colour fields */}
      <div
        data-blob
        aria-hidden="true"
        className="absolute -top-40 -right-40 -z-10 h-[38rem] w-[38rem] rounded-full bg-champagne/35 blur-3xl"
      />
      <div
        data-blob
        aria-hidden="true"
        className="absolute -bottom-56 -left-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-blush blur-3xl"
      />

      <div className="container-page grid items-center gap-8 pt-10 pb-16 sm:pt-14 lg:min-h-[calc(100svh-7.5rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:py-14">
        <div data-hero-copy className="relative z-10 max-w-xl">
          <p className="flex items-center gap-3 sm:gap-4">
            <span data-eyebrow-line aria-hidden="true" className="h-px w-8 shrink-0 bg-gold sm:w-12" />
            <span data-eyebrow className="eyebrow text-[0.66rem] tracking-[0.22em] whitespace-nowrap sm:text-xs sm:tracking-[0.28em]">
              Durani Cosmetics · Pakistan
            </span>
          </p>

          <h1
            id="hero-heading"
            className="mt-5 text-[2.9rem] leading-[0.98] min-[380px]:text-[3.25rem] sm:mt-6 font-medium tracking-[-0.02em] sm:text-7xl xl:text-[5.75rem]"
          >
            <span className="sr-only">Durani Cosmetics — </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-line className="block">
                Unlock your
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <span data-line className="block">
                natural <em className="text-gold-gradient pr-[0.06em] font-normal">beauty.</em>
              </span>
            </span>
          </h1>

          <p data-intro className="mt-5 max-w-md text-base text-cocoa sm:mt-6 sm:text-xl">
            Serum, face washes and beauty cream from Durani — four everyday essentials, shown just as they come in the
            pack.
          </p>

          <div data-intro className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9">
            <Link ref={primaryCta} to="/shop" className="btn-primary h-13 px-6 shadow-lift sm:h-14 sm:px-8">
              Shop the range
              <ArrowRightIcon width={16} height={16} />
            </Link>
            <a ref={secondaryCta} href="#discover" className="btn-outline h-13 border-espresso/25 bg-white/50 px-6 backdrop-blur sm:h-14 sm:px-8">
              Find your product
            </a>
          </div>

          <div data-intro className="mt-12 hidden items-center gap-4 sm:flex">
            <ul className="flex -space-x-3" aria-hidden="true">
              {products.map((p) => (
                <li
                  key={p.slug}
                  className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-ivory bg-white shadow-soft"
                >
                  <img {...cutout(p.slug)} alt="" className="h-9 w-auto object-contain" />
                </li>
              ))}
            </ul>
            <p className="text-sm leading-snug text-cocoa">
              <span className="block font-serif text-base text-espresso">The Durani range</span>
              {products.length} essentials · {categories.length} categories
            </p>
          </div>
        </div>

        {/* Product stage */}
        <div
          data-hero-stage
          role="img"
          aria-label="The Durani range: serum, face wash, rice face wash and beauty cream on a plinth"
          className="relative mx-auto aspect-[5/6] w-full max-w-[24rem] sm:max-w-[30rem] lg:max-w-[36rem]"
        >
          <div aria-hidden="true" className="absolute inset-0">
            {/* Arch backdrop */}
            <div data-depth="0.15" className="absolute inset-x-[12%] top-[1%] bottom-[22%]">
              <div
                data-arch
                className="absolute inset-0 rounded-t-full bg-gradient-to-b from-white via-cream to-sand/80 shadow-[inset_0_2px_40px_rgb(255_255_255/0.9),0_40px_80px_-40px_rgb(125_90_36/0.45)]"
              >
                <div className="absolute inset-[6%] rounded-t-full border border-champagne/50" />
                <div className="absolute top-[12%] left-1/2 h-1/2 w-3/4 -translate-x-1/2 rounded-full bg-white/70 blur-2xl" />
              </div>
            </div>

            {/* Plinth */}
            <div data-depth="0.3" className="absolute inset-x-[6%] bottom-[4%] h-[24%]">
              <div data-plinth className="absolute inset-0">
                <div
                  className="absolute inset-x-0 top-[28%] bottom-0 bg-gradient-to-r from-sand via-cream to-[#e2cfb3] shadow-[0_30px_40px_-24px_rgb(51_32_15/0.45)]"
                  style={{ borderRadius: '0 0 50% 50% / 0 0 28% 28%' }}
                />
                <div className="absolute inset-x-0 top-0 h-[56%] rounded-[50%] bg-gradient-to-b from-white to-cream ring-1 ring-white" />
              </div>
            </div>

            {/* Products */}
            {stage.map((item) => (
              <div key={item.slug} className={`absolute ${item.pos}`}>
                <div data-depth={item.depth} className="h-full">
                  <div data-product className="h-full">
                    <img
                      data-float
                      {...cutout(item.slug)}
                      alt=""
                      draggable={false}
                      className="product-shadow h-full w-auto max-w-none select-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Pack callouts */}
            <div data-depth="1.6" className="absolute top-[24%] left-0 z-40 sm:top-[30%] sm:-left-[6%]">
              <span data-chip className={chip}>
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                100% Natural
              </span>
            </div>
            <div data-depth="1.8" className="absolute right-0 bottom-[6%] z-40 sm:-right-[4%] sm:bottom-[33%]">
              <span data-chip className={chip}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#7a9a4a]" />
                Avocado &amp; Aloe Vera
              </span>
            </div>

            <Badge />
            {sparkles.map((s) => (
              <Sparkle key={s} className={s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
