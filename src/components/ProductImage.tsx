import type { ProductImage as ProductImageData } from '../data/products';
import { imageDimensions, srcSet } from '../lib/images';

interface Props {
  image: ProductImageData;
  sizes: string;
  eager?: boolean;
  /** Aspect-ratio class for the frame; the whole image always fits inside it (object-contain). */
  frame?: string;
  className?: string;
}

/** Product image with WebP sources and a JPEG fallback, never cropped. */
export function ProductImage({ image, sizes, eager = false, frame = 'aspect-square', className = '' }: Props) {
  const { widths, width, height } = imageDimensions(image);
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet(image.base, widths)} sizes={sizes} />
      <img
        src={`${image.base}-800.jpg`}
        alt={image.alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-auto w-full object-contain ${frame} ${className}`}
      />
    </picture>
  );
}
