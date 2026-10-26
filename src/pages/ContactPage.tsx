import { Breadcrumbs } from '../components/Breadcrumbs';
import { WhatsAppIcon } from '../components/Icons';
import { socialProfiles } from '../components/SocialLinks';
import { site, whatsappLink } from '../config/site';
import { usePageMeta } from '../hooks/usePageMeta';

export function ContactPage() {
  usePageMeta({
    title: 'Contact',
    description: `Contact Durani Cosmetics on WhatsApp${site.contact.phone ? ` (${site.contact.phone})` : ''}, Facebook, Instagram or TikTok.`,
  });
  const whatsapp = whatsappLink('Hello Durani Cosmetics');
  const { phone, email, address } = site.contact;

  return (
    <div className="container-page pt-8 sm:pt-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow mb-3">Get in touch</p>
          <h1 data-split className="text-[2.6rem] tracking-[-0.01em] sm:text-6xl">Contact Durani Cosmetics</h1>
          <p className="mt-5 max-w-md text-lg text-cocoa">
            For questions about our products or ordering, send us a message — we'd love to hear from you.
          </p>
        </div>

        <ul className="space-y-4">
          {socialProfiles.map(({ label, href, display, Icon }) => (
            <li key={label} data-reveal>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 rounded-3xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:border-champagne hover:shadow-lift"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cream text-espresso transition group-hover:bg-espresso group-hover:text-ivory">
                  <Icon width={24} height={24} />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-xl">{label}</span>
                  <span className="block truncate text-sm text-cocoa">{display}</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
          {whatsapp && (
            <li data-reveal>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 rounded-3xl border border-line bg-white p-6 transition hover:border-champagne hover:shadow-soft"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cream text-espresso transition group-hover:bg-espresso group-hover:text-ivory">
                  <WhatsAppIcon width={24} height={24} />
                </span>
                <span>
                  <span className="block font-serif text-xl">WhatsApp</span>
                  <span className="block text-sm text-cocoa tabular-nums">{phone ?? 'Message us to order'}</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
              </a>
            </li>
          )}
          {phone && (
            <li data-reveal className="rounded-3xl border border-line bg-white p-6">
              <span className="block font-serif text-xl">Phone</span>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="link-underline">
                {phone}
              </a>
            </li>
          )}
          {email && (
            <li data-reveal className="rounded-3xl border border-line bg-white p-6">
              <span className="block font-serif text-xl">Email</span>
              <a href={`mailto:${email}`} className="link-underline">
                {email}
              </a>
            </li>
          )}
          {address && (
            <li data-reveal className="rounded-3xl border border-line bg-white p-6">
              <span className="block font-serif text-xl">Address</span>
              <address className="not-italic text-cocoa">{address}</address>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
