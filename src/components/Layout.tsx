import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { gsap, MOTION_OK, ScrollTrigger, SplitText, useGSAP } from '../lib/gsap';
import { CartDrawer } from './CartDrawer';
import { Footer } from './Footer';
import { AnnouncementBar, Header } from './Header';

/**
 * Scroll to top on navigation, or to the #hash target when present. Runs as a
 * layout effect so the page is at its final position before scroll
 * animations are measured.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    // Jump instantly: a smooth scroll (html has scroll-behavior: smooth) would be
    // cancelled when ScrollTrigger re-measures the new page and restores the old position.
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView({ behavior: 'instant' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

/**
 * Page-level motion, set up again on every route:
 * - the page fades up on arrival;
 * - `[data-reveal]` elements rise into view as they are scrolled to (batched,
 *   so neighbours stagger);
 * - `[data-split]` headings reveal word by word.
 * Elements rendered later (e.g. filtered results) simply appear.
 */
function usePageMotion(scope: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation();

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          root,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
        );

        const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
        if (items.length) {
          gsap.set(items, { autoAlpha: 0, y: 44 });
          ScrollTrigger.batch(items, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
          });
        }

        gsap.utils.toArray<HTMLElement>('[data-split]', root).forEach((el) => {
          // Masks get the class `split-word-mask` (padded in index.css so descenders aren't clipped).
          const split = SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'split-word' });
          gsap.from(split.words, {
            yPercent: 115,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.05,
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          });
        });
      });
      ScrollTrigger.refresh();
    },
    { scope, dependencies: [pathname], revertOnUpdate: true },
  );

  // Content height changes (images, filters, accordions) move trigger points.
  useEffect(() => {
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
}

export function Layout() {
  const mainRef = useRef<HTMLElement>(null);
  usePageMotion(mainRef);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-espresso px-5 py-3 text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <ScrollManager />
      <AnnouncementBar />
      <Header />
      <main ref={mainRef} id="main" tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
