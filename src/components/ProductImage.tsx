import type { ProductImage as ProductImageData } from '../data/products';
import { productImageWidths, srcSet } from '../lib/images';

interface Props {
  image: ProductImageData;
  sizes: string;
  eager?: boolean;
  className?: string;
}

/** Square product image on a white canvas with WebP sources and a JPEG fallback. */
export function ProductImage({ image, sizes, eager = false, className = '' }: Props) {
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet(image.base, productImageWidths)} sizes={sizes} />
      <img
        src={`${image.base}-800.jpg`}
        alt={image.alt}
        width={1200}
        height={1200}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`aspect-square h-auto w-full object-contain ${className}`}
      />
    </picture>
  );
}
