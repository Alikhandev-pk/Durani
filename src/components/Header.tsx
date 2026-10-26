import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { mainNav } from '../config/navigation';
import { site, whatsappLink } from '../config/site';
import { useCart } from '../context/CartContext';
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from '../lib/gsap';
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, WhatsAppIcon } from './Icons';
import { Modal } from './Modal';
import { SearchDialog } from './SearchDialog';
import { SocialLinks } from './SocialLinks';
import { Wordmark } from './Wordmark';

const iconButton =
  'relative grid h-11 w-11 place-items-center rounded-full text-espresso transition duration-300 hover:bg-cream hover:text-gold-deep active:scale-90';

/** Slim brand line above the header; scrolls away with the page. */
export function AnnouncementBar() {
  return (
    <div className="bg-espresso text-ivory">
      <p className="container-page flex h-10 items-center justify-center gap-3 text-[0.7rem] tracking-[0.22em] uppercase">
        <span aria-hidden="true" className="text-champagne">
          ✦
        </span>
        <span>
          Unlock your natural beauty
          <span className="hidden sm:inline">
            {' '}
            —{' '}
            <Link to="/shop" className="text-champagne underline-offset-4 hover:underline">
              Shop the Durani range
            </Link>
          </span>
        </span>
        <span aria-hidden="true" className="text-champagne">
          ✦
        </span>
      </p>
    </div>
  );
}

const whatsapp = whatsappLink('Hello Durani Cosmetics');

export function Header() {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const menuTitleId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const reveal = useRef<gsap.core.Tween | null>(null);
  const previousCount = useRef(count);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from('[data-header-item]', { autoAlpha: 0, y: -16, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.1 });

        // Hide while scrolling down, return on scroll up.
        reveal.current = gsap
          .from(headerRef.current, { yPercent: -100, duration: 0.45, ease: 'power3.out', paused: true })
          .progress(1);
        ScrollTrigger.create({
          start: 'top top',
          end: 'max',
          onUpdate: (self) => {
            if (self.scroll() < 240 || self.direction === -1) reveal.current?.play();
            else reveal.current?.reverse();
          },
        });
      });

      // Reading progress along the bottom edge.
      gsap.fromTo(
        '[data-scroll-progress]',
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
      );
    },
    { scope: headerRef },
  );

  // Bump the cart badge when items are added.
  useGSAP(
    () => {
      if (count > previousCount.current && badgeRef.current) {
        gsap.fromTo(badgeRef.current, { scale: 1.7 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.35)' });
      }
      previousCount.current = count;
    },
    { dependencies: [count] },
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus when the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header
      ref={headerRef}
      // Keep the header visible while keyboard focus is inside it.
      onFocus={() => reveal.current?.play()}
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-500 ${
        scrolled ? 'border-line/80 bg-ivory/85 shadow-header' : 'border-transparent bg-ivory/60'
      }`}
    >
      <span
        data-scroll-progress
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-gradient-to-r from-champagne via-gold to-gold-deep"
      />
      <div className="container-page grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-2 lg:h-20 lg:grid-cols-[auto_1fr_auto] lg:gap-8">
        {/* Mobile: menu button */}
        <div data-header-item className="flex lg:hidden">
          <button
            type="button"
            className={`${iconButton} -ml-2`}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon width={22} height={22} />
          </button>
        </div>

        <div data-header-item className="justify-self-center lg:justify-self-start">
          <Wordmark className="h-12 lg:h-14" />
        </div>

        <nav aria-label="Main" className="hidden justify-center lg:flex">
          <ul className="flex items-center gap-0.5 xl:gap-3">
            {mainNav.map((item) => (
              <li key={item.to} data-header-item>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative inline-flex min-h-11 items-center px-2 text-[0.72rem] font-medium tracking-[0.1em] whitespace-nowrap uppercase transition-colors after:absolute after:inset-x-2 xl:px-3 xl:text-[0.8rem] xl:tracking-[0.14em] xl:after:inset-x-3 after:bottom-2 after:h-px after:origin-left after:bg-gold-deep after:transition-transform after:duration-300 hover:text-gold-deep ${
                      isActive ? 'text-gold-deep after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div data-header-item className="-mr-2 flex items-center justify-self-end">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`${iconButton} xl:w-auto xl:gap-2 xl:px-3`}
              aria-label={`WhatsApp ${site.contact.phone ?? ''} (opens in a new tab)`}
            >
              <WhatsAppIcon width={21} height={21} />
              <span aria-hidden="true" className="hidden text-[0.8rem] font-medium tabular-nums xl:inline">
                {site.contact.phone}
              </span>
            </a>
          )}
          <button
            type="button"
            className={iconButton}
            aria-label="Search products"
            aria-haspopup="dialog"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon width={21} height={21} />
          </button>
          <button
            type="button"
            className={iconButton}
            aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
            aria-haspopup="dialog"
            onClick={openCart}
          >
            <BagIcon width={21} height={21} />
            <span
              ref={badgeRef}
              aria-hidden="true"
              className={`absolute top-1 right-0.5 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full px-1 text-[0.65rem] leading-none font-semibold tabular-nums transition ${
                count > 0 ? 'bg-espresso text-ivory' : 'bg-sand text-cocoa'
              }`}
            >
              {count}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} labelledBy={menuTitleId} variant="left">
        <div className="flex h-full flex-col bg-ivory">
          <div className="flex h-[4.5rem] items-center justify-between border-b border-line px-5">
            <h2 id={menuTitleId} className="eyebrow">
              Menu
            </h2>
            <button
              type="button"
              className={`${iconButton} -mr-2`}
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <CloseIcon width={22} height={22} />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-4">
            <ul>
              {mainNav.map((item) => (
                <li key={item.to} className="border-b border-line/70">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-14 items-center font-serif text-xl transition-colors ${
                        isActive ? 'text-gold-deep' : 'text-espresso hover:text-gold-deep'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-line px-5 py-5">
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-5 flex min-h-12 items-center gap-3 rounded-2xl bg-cream px-4 text-espresso"
              >
                <WhatsAppIcon width={22} height={22} />
                <span>
                  <span className="block text-xs tracking-[0.14em] text-cocoa uppercase">Order on WhatsApp</span>
                  <span className="block font-medium tabular-nums">{site.contact.phone}</span>
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <p className="eyebrow mb-3">Follow us</p>
            <SocialLinks />
          </div>
        </div>
      </Modal>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
