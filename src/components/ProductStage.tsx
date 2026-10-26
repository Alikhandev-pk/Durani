import type { Product } from '../data/products';
import { cutout, productThumb } from '../lib/images';

interface Props {
  product: Product;
  /** Height of the product relative to the stage (cutouts only). */
  size?: string;
  /** `sizes` for poster images, which are responsive by width. */
  sizes?: string;
  /** Padding around a poster, keeping it clear of overlays placed on the stage. */
  posterPadding?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

const backdrop =
  'relative isolate flex justify-center overflow-hidden bg-[radial-gradient(120%_80%_at_50%_30%,#ffffff_0%,var(--color-cream)_62%,var(--color-sand)_120%)]';

/**
 * Transparent product cutout standing on a soft spotlight with a contact
 * shadow. Products without a cutout show their supplied artwork whole
 * (object-contain, with room for the hover lift so nothing is clipped).
 * Hover effects respond to an ancestor with the `group` class.
 */
export function ProductStage({
  product,
  size = 'h-[68%]',
  sizes = '(min-width: 1024px) 25vw, 50vw',
  posterPadding = 'p-[4%]',
  className = '',
  imgClassName = '',
  eager = false,
}: Props) {
  if (!product.cutout) {
    return (
      <div aria-hidden="true" className={`${backdrop} items-center ${posterPadding} ${className}`}>
        <img
          {...productThumb(product, sizes)}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className={`h-full w-full object-contain drop-shadow-[0_14px_22px_rgb(51_32_15/0.18)] transition duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-[2%] group-hover:scale-[1.03] ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={`${backdrop} items-end ${className}`}>
      <span className="absolute top-[10%] left-1/2 -z-10 aspect-square w-[70%] -translate-x-1/2 rounded-full bg-white/80 blur-2xl" />
      <span className="absolute bottom-[11%] left-1/2 -z-10 h-[7%] w-[46%] -translate-x-1/2 rounded-[50%] bg-espresso/25 blur-md transition duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:w-[36%] group-hover:opacity-60" />
      <img
        {...cutout(product.slug)}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className={`product-shadow relative mb-[13%] w-auto max-w-[80%] object-contain transition duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-[5%] group-hover:scale-[1.05] group-hover:-rotate-2 ${size} ${imgClassName}`}
      />
    </div>
  );
}
