import { Link } from 'react-router-dom';
import { site } from '../config/site';

/** Official round Durani Cosmetics logo, linking home. Size it with `className` (height). */
export function Wordmark({ className = 'h-14', onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="inline-flex shrink-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:scale-105 hover:-rotate-3"
    >
      <img
        src="/images/logo/durani-logo-160.webp"
        srcSet="/images/logo/durani-logo-160.webp 1x, /images/logo/durani-logo-320.webp 2x"
        alt={`${site.name} home`}
        width={160}
        height={160}
        className={`aspect-square w-auto rounded-full shadow-soft ${className}`}
      />
    </Link>
  );
}
