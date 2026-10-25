import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { bannerWidths, banners } from '../data/banners';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { gsap, useGSAP } from '../lib/gsap';
import { srcSet } from '../lib/images';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from './Icons';

const AUTOPLAY_MS = 6500;
const SWIPE_THRESHOLD = 45;

/**
 * Four-banner campaign carousel. The banners already contain their headlines,
 * so no text is layered over the artwork; the product title and shop link sit
 * underneath. Banners are shown at their native aspect ratio, so nothing is
 * cropped. Slides wipe in with GSAP; the autoplay timer is the progress tween.
 */
export function HeroSlider() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  // Autoplay is off by default for users who prefer reduced motion.
  const [userPaused, setUserPaused] = useState(reducedMotion);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const shown = useRef(index);
  const direction = useRef(1);
  const transition = useRef<gsap.core.Timeline | null>(null);
  const timer = useRef<gsap.core.Tween | null>(null);

  const count = banners.length;
  const playing = !userPaused && !interactionPaused && visible;
  const active = banners[index];

  const goTo = useCallback(
    (i: number, dir?: number) => {
      const target = ((i % count) + count) % count;
      direction.current = dir ?? (target > index ? 1 : -1);
      setIndex(target);
    },
    [count, index],
  );
  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  useEffect(() => {
    if (reducedMotion) setUserPaused(true);
  }, [reducedMotion]);

  // Slide change.
  useGSAP(
    () => {
      const slides = slideRefs.current;
      const from = shown.current;
      shown.current = index;
      transition.current?.progress(1).kill();

      if (from === index || reducedMotion) {
        gsap.set(slides, { autoAlpha: (i: number) => (i === index ? 1 : 0), zIndex: 0, clipPath: 'none' });
        return;
      }

      const dir = direction.current;
      const incoming = slides[index]!;
      const outgoing = slides[from]!;
      gsap.set(slides, { zIndex: (i: number) => (i === index ? 2 : i === from ? 1 : 0) });
      transition.current = gsap
        .timeline({ defaults: { duration: 1.15, ease: 'expo.inOut' } })
        .set(incoming, { autoAlpha: 1 })
        .fromTo(
          incoming,
          { clipPath: dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)' },
          0,
        )
        .fromTo(incoming.querySelector('img'), { scale: 1.18, xPercent: dir * 8 }, { scale: 1, xPercent: 0, duration: 1.6, ease: 'expo.out' }, 0)
        .to(outgoing.querySelector('img'), { xPercent: dir * -10, scale: 1.04 }, 0)
        // Hide the old slide as soon as the wipe has covered it.
        .set(outgoing, { autoAlpha: 0 }, 1.15)
        .set(outgoing.querySelector('img'), { clearProps: 'transform' }, 1.15);

      if (captionRef.current) {
        gsap.fromTo(
          captionRef.current.querySelectorAll('[data-caption]'),
          { yPercent: 100, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.25 },
        );
      }
    },
    { dependencies: [index, reducedMotion], scope: rootRef },
  );

  // Autoplay: the active dot fills up, then advances.
  useGSAP(
    () => {
      timer.current = gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: AUTOPLAY_MS / 1000,
          ease: 'none',
          paused: true,
          onComplete: () => {
            direction.current = 1;
            setIndex((i) => (i + 1) % count);
          },
        },
      );
    },
    { dependencies: [index, count], scope: rootRef, revertOnUpdate: true },
  );

  useEffect(() => {
    if (playing) timer.current?.play();
    else timer.current?.pause();
  }, [playing, index]);

  // Stop rotating while the carousel is off-screen or the tab is hidden.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(el);
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) next();
      else prev();
    }
  };

  const controlButton =
    'grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-espresso transition duration-300 hover:-translate-y-0.5 hover:border-espresso hover:bg-espresso hover:text-ivory hover:shadow-lift';

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Featured Durani products"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocus={() => setInteractionPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteractionPaused(false);
      }}
      onKeyDown={onKeyDown}
    >
      {/* Slides: stacked, each at the banner's own aspect ratio. */}
      <div
        data-reveal
        className="relative -mx-4 touch-pan-y overflow-hidden bg-cream shadow-lift select-none sm:mx-0 sm:rounded-[2.5rem]"
        style={{ aspectRatio: `${active.width} / ${active.height}` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (pointerStart.current = null)}
        aria-live={playing ? 'off' : 'polite'}
      >
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${banner.title}`}
            aria-hidden={i !== index}
            // Initial state only; GSAP owns visibility after mount.
            className={`absolute inset-0 overflow-hidden ${i === 0 ? '' : 'invisible opacity-0'}`}
          >
            <picture>
              <source type="image/webp" srcSet={srcSet(banner.base, bannerWidths)} sizes="(min-width: 1280px) 1240px, 100vw" />
              <img
                src={`${banner.base}.png`}
                alt={banner.alt}
                width={banner.width}
                height={banner.height}
                loading={i === 0 ? 'eager' : 'lazy'}
                // Lower-case attribute: React 18 doesn't map the camelCase prop.
                {...{ fetchpriority: i === 0 ? 'high' : 'auto' }}
                decoding={i === 0 ? 'sync' : 'async'}
                draggable={false}
                className="h-full w-full object-contain"
              />
            </picture>
          </div>
        ))}
      </div>

      {/* Caption + controls, below the artwork so nothing covers it. */}
      <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div ref={captionRef} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="min-w-0 overflow-hidden">
            <p data-caption className="eyebrow text-[0.68rem]" aria-hidden="true">
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </p>
            <p data-caption className="font-serif text-2xl leading-tight sm:text-3xl">
              {active.title}
            </p>
          </div>
          <Link to={`/product/${active.productSlug}`} className="btn-primary w-full self-start sm:w-auto">
            Shop This Product
            <span className="sr-only">: {active.title}</span>
            <ArrowRightIcon width={16} height={16} />
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <button type="button" className={controlButton} onClick={prev} aria-label="Previous slide">
            <ChevronLeftIcon />
          </button>
          <div className="flex items-center" role="group" aria-label="Choose slide">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}: ${banner.title}`}
                aria-current={i === index ? 'true' : undefined}
                className="group grid h-11 min-w-8 place-items-center px-1"
              >
                <span
                  className={`relative block h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
                    i === index ? 'w-12 bg-champagne/40' : 'w-1.5 bg-champagne group-hover:bg-gold'
                  }`}
                >
                  {i === index && (
                    <span ref={progressRef} className="absolute inset-0 origin-left rounded-full bg-espresso" />
                  )}
                </span>
              </button>
            ))}
          </div>
          <button type="button" className={controlButton} onClick={next} aria-label="Next slide">
            <ChevronRightIcon />
          </button>
          <button
            type="button"
            className={`${controlButton} ml-1`}
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? 'Start automatic slide show' : 'Pause automatic slide show'}
          >
            {userPaused ? <PlayIcon width={18} height={18} /> : <PauseIcon width={18} height={18} />}
          </button>
        </div>
      </div>
    </section>
  );
}
