import { cutout } from '../lib/images';

interface Props {
  slug: string;
  /** Height of the product relative to the stage. */
  size?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

/**
 * Transparent product cutout standing on a soft spotlight with a contact
 * shadow. Hover effects respond to an ancestor with the `group` class.
 */
export function ProductStage({ slug, size = 'h-[68%]', className = '', imgClassName = '', eager = false }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`relative isolate flex items-end justify-center overflow-hidden bg-[radial-gradient(120%_80%_at_50%_30%,#ffffff_0%,var(--color-cream)_62%,var(--color-sand)_120%)] ${className}`}
    >
      <span className="absolute top-[10%] left-1/2 -z-10 aspect-square w-[70%] -translate-x-1/2 rounded-full bg-white/80 blur-2xl" />
      <span className="absolute bottom-[11%] left-1/2 -z-10 h-[7%] w-[46%] -translate-x-1/2 rounded-[50%] bg-espresso/25 blur-md transition duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:w-[36%] group-hover:opacity-60" />
      <img
        {...cutout(slug)}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className={`product-shadow relative mb-[13%] w-auto max-w-[80%] object-contain transition duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-[5%] group-hover:scale-[1.05] group-hover:-rotate-2 ${size} ${imgClassName}`}
      />
    </div>
  );
}
