import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { site, whatsappLink } from '../config/site';
import { gsap, MOTION_OK, useGSAP } from '../lib/gsap';
import { WhatsAppIcon } from './Icons';

/**
 * Floating "chat on WhatsApp" button. Hidden on checkout, which has its own
 * order button that the floating one would otherwise cover on phones.
 */
export function WhatsAppButton() {
  const { pathname } = useLocation();
  const ref = useRef<HTMLAnchorElement>(null);
  const href = whatsappLink('Hello Durani Cosmetics');
  const hidden = pathname === '/checkout';

  useGSAP(
    () => {
      if (!ref.current) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(ref.current, { scale: 0, autoAlpha: 0, duration: 0.8, delay: 1.2, ease: 'back.out(1.8)' });
        // A soft ring every few seconds draws the eye without moving the button.
        gsap.fromTo(
          '[data-wa-ring]',
          { scale: 1, autoAlpha: 0.55 },
          { scale: 1.7, autoAlpha: 0, duration: 1.6, ease: 'power2.out', repeat: -1, repeatDelay: 3.4, delay: 2 },
        );
      });
    },
    { scope: ref, dependencies: [hidden] },
  );

  if (!href || hidden) return null;

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-4 bottom-4 z-30 flex h-14 items-center gap-2 rounded-full bg-[#25d366] pr-4 pl-3.5 text-white shadow-lift transition hover:bg-[#1ebe5a] sm:right-6 sm:bottom-6"
      aria-label={`Chat with ${site.name} on WhatsApp, ${site.contact.phone ?? ''} (opens in a new tab)`}
    >
      <span data-wa-ring aria-hidden="true" className="absolute inset-0 rounded-full bg-[#25d366] opacity-0" />
      <WhatsAppIcon width={26} height={26} className="relative" />
      <span className="relative hidden text-sm font-medium sm:inline">WhatsApp</span>
    </a>
  );
}
