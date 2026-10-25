import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { mainNav, policyNav } from '../config/navigation';
import { site, whatsappLink } from '../config/site';
import { gsap, MOTION_OK, useGSAP } from '../lib/gsap';
import { WhatsAppIcon } from './Icons';
import { SocialLinks } from './SocialLinks';
import { Wordmark } from './Wordmark';

export function Footer() {
  const shopLinks = mainNav.filter((n) => n.to.startsWith('/shop'));
  const whatsapp = whatsappLink('Hello Durani Cosmetics');
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-footer-mark]',
          { yPercent: 55, letterSpacing: '0.12em', autoAlpha: 0.2 },
          {
            yPercent: 0,
            letterSpacing: '-0.02em',
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: { trigger: footerRef.current, start: 'top 85%', end: 'bottom bottom', scrub: 0.8 },
          },
        );
      });
    },
    { scope: footerRef },
  );

  return (
    <footer ref={footerRef} className="grain relative isolate mt-28 overflow-hidden border-t border-line bg-cream">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-14 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12 lg:py-16">
        <div className="col-span-2 max-w-xs sm:col-span-3 lg:col-span-1">
          <Wordmark className="h-20" />
          <p className="mt-5 text-sm text-cocoa">
            Skincare from Durani Cosmetics, Pakistan — serum, face washes and beauty cream.
          </p>
          <div className="mt-5 flex gap-2">
            <SocialLinks />
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-11 w-11 place-items-center rounded-full border border-espresso/30 text-espresso transition hover:border-espresso hover:bg-espresso hover:text-ivory"
                aria-label="Message Durani Cosmetics on WhatsApp (opens in a new tab)"
              >
                <WhatsAppIcon />
              </a>
            )}
          </div>
        </div>

        <FooterColumn title="Shop" links={shopLinks} />
        <FooterColumn
          title="Help"
          links={[
            { label: 'Contact', to: '/contact' },
            { label: 'Cart', to: '/cart' },
            { label: 'FAQ', to: '/#faq' },
          ]}
        />
        <FooterColumn title="Policies" links={policyNav} note="Drafts — pending confirmation" />
      </div>
      <div aria-hidden="true" className="container-page overflow-hidden">
        <p
          data-footer-mark
          className="text-gold-gradient text-center font-serif text-[24vw] leading-[0.82] font-medium tracking-[-0.02em] select-none xl:text-[18rem]"
        >
          Durani
        </p>
      </div>
      <div className="border-t border-line/80">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-cocoa sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links, note }: { title: string; links: { label: string; to: string }[]; note?: string }) {
  return (
    <div>
      <h2 className="eyebrow">{title}</h2>
      {note && <p className="mt-1 text-xs text-cocoa/80">{note}</p>}
      <ul className="mt-4 space-y-1">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="inline-flex min-h-10 items-center text-sm text-espresso transition duration-300 hover:translate-x-1 hover:text-gold-deep"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
