import type { ComponentType, SVGProps } from 'react';
import { site } from '../config/site';
import { FacebookIcon, InstagramIcon, TikTokIcon } from './Icons';

export interface SocialProfile {
  label: string;
  href: string;
  /** Display form of the address, e.g. instagram.com/duranicosmetics1 */
  display: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const display = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '');

export const socialProfiles: SocialProfile[] = [
  { label: 'Facebook', href: site.social.facebook, display: display(site.social.facebook), Icon: FacebookIcon },
  { label: 'Instagram', href: site.social.instagram, display: display(site.social.instagram), Icon: InstagramIcon },
  { label: 'TikTok', href: site.social.tiktok, display: display(site.social.tiktok), Icon: TikTokIcon },
];

/** Round icon buttons linking to each social profile. */
export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex gap-2 ${className}`}>
      {socialProfiles.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-11 w-11 place-items-center rounded-full border border-espresso/30 text-espresso transition duration-300 hover:-translate-y-0.5 hover:border-espresso hover:bg-espresso hover:text-ivory"
            aria-label={`Durani Cosmetics on ${label} (opens in a new tab)`}
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
