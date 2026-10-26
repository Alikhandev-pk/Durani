import { useId, useRef, useState, type PointerEvent } from 'react';
import type { ProductImage as ProductImageData } from '../data/products';
import { gsap, MOTION_OK, useGSAP } from '../lib/gsap';
import { imageDimensions } from '../lib/images';
import { CloseIcon, MinusIcon, PlusIcon, ZoomIcon } from './Icons';
import { Modal } from './Modal';
import { ProductImage } from './ProductImage';

interface Props {
  images: ProductImageData[];
  productName: string;
}

export function ProductGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hoverZoom, setHoverZoom] = useState<{ x: number; y: number } | null>(null);
  const image = images[active];
  const stageRef = useRef<HTMLDivElement>(null);
  // Portrait artwork (supplied posters) gets a taller frame so its label text
  // stays readable, and the zoom button moves below it so it covers nothing.
  const portrait = images.some((img) => {
    const { width, height } = imageDimensions(img);
    return height > width;
  });
  const frame = portrait ? 'aspect-[4/5]' : 'aspect-square';

  // Ease the image in on load and when another thumbnail is chosen. Scale stays
  // at or below 1 so the artwork is never cropped mid-animation.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from('[data-gallery-image]', {
          autoAlpha: 0,
          scale: 0.96,
          y: 12,
          filter: 'blur(6px)',
          duration: 0.9,
          ease: 'expo.out',
          clearProps: 'filter',
        });
      });
    },
    { dependencies: [active], scope: stageRef, revertOnUpdate: true },
  );

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const zoomButton = (
    <button
      type="button"
      onClick={() => setLightboxOpen(true)}
      className={`${portrait ? 'self-end' : 'absolute right-3 bottom-3'} inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white/95 px-4 text-xs font-medium tracking-[0.1em] text-espresso uppercase shadow-soft transition hover:border-espresso`}
    >
      <ZoomIcon width={18} height={18} />
      Zoom<span className="sr-only"> image of {productName}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div ref={stageRef} className="relative overflow-hidden rounded-3xl border border-line/70 bg-white">
        {/* Hover magnifier (mouse only); click or the zoom button opens the full view. */}
        <div
          data-gallery-image
          className="cursor-zoom-in"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverZoom(null)}
          onClick={() => setLightboxOpen(true)}
        >
          <div
            className="transition-transform duration-200 ease-out"
            style={
              hoverZoom
                ? { transform: 'scale(1.9)', transformOrigin: `${hoverZoom.x}% ${hoverZoom.y}%` }
                : undefined
            }
          >
            <ProductImage image={image} eager frame={frame} sizes="(min-width: 1024px) 560px, 92vw" />
          </div>
        </div>
        {!portrait && zoomButton}
      </div>
      {portrait && zoomButton}

      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.base}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active ? 'true' : undefined}
                className={`block w-full overflow-hidden rounded-xl border bg-white transition ${
                  i === active ? 'border-espresso ring-1 ring-espresso' : 'border-line hover:border-champagne'
                }`}
              >
                <ProductImage image={{ ...img, alt: '' }} sizes="96px" frame={frame} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        image={image}
        productName={productName}
      />
    </div>
  );
}

function Lightbox({
  open,
  onClose,
  image,
  productName,
}: {
  open: boolean;
  onClose: () => void;
  image: ProductImageData;
  productName: string;
}) {
  const titleId = useId();
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);
  const { width, height } = imageDimensions(image);

  const close = () => {
    setScale(1);
    setOrigin({ x: 50, y: 50 });
    onClose();
  };

  const moveOrigin = (clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    });
  };

  const zoomButton =
    'grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-espresso transition hover:border-espresso disabled:opacity-40';

  return (
    <Modal open={open} onClose={close} labelledBy={titleId} variant="center">
      <div
        className="flex h-full flex-col bg-white"
        onKeyDown={(e) => {
          // Arrow keys pan while zoomed.
          const step: Record<string, [number, number]> = {
            ArrowLeft: [-10, 0],
            ArrowRight: [10, 0],
            ArrowUp: [0, -10],
            ArrowDown: [0, 10],
          };
          const delta = step[e.key];
          if (!delta || scale === 1) return;
          e.preventDefault();
          setOrigin((o) => ({
            x: Math.min(100, Math.max(0, o.x + delta[0])),
            y: Math.min(100, Math.max(0, o.y + delta[1])),
          }));
        }}
      >
        <div className="container-page flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line">
          <h2 id={titleId} className="truncate font-serif text-lg">
            {productName}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={zoomButton}
              onClick={() => setScale((s) => Math.max(1, s - 1))}
              disabled={scale <= 1}
              aria-label="Zoom out"
            >
              <MinusIcon width={18} height={18} />
            </button>
            <span className="w-10 text-center text-sm tabular-nums" aria-live="polite">
              {scale}×
            </span>
            <button
              type="button"
              className={zoomButton}
              onClick={() => setScale((s) => Math.min(3, s + 1))}
              disabled={scale >= 3}
              aria-label="Zoom in"
            >
              <PlusIcon width={18} height={18} />
            </button>
            <button type="button" className={`${zoomButton} ml-2`} onClick={close} aria-label="Close zoomed image">
              <CloseIcon />
            </button>
          </div>
        </div>
        <div
          ref={frameRef}
          className={`flex flex-1 items-center justify-center overflow-hidden ${
            scale > 1 ? 'cursor-zoom-out touch-none' : 'cursor-zoom-in'
          }`}
          onClick={(e) => {
            if (scale === 1) {
              moveOrigin(e.clientX, e.clientY);
              setScale(2);
            } else {
              setScale(1);
            }
          }}
          onPointerMove={(e) => {
            if (scale > 1) moveOrigin(e.clientX, e.clientY);
          }}
        >
          <div
            className="h-full max-h-full w-auto max-w-full transition-transform duration-200 ease-out"
            style={{
              aspectRatio: `${width} / ${height}`,
              transform: `scale(${scale})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          >
            {/* The wrapper already has the image's aspect ratio, so no frame is needed. */}
            <ProductImage image={image} sizes="100vw" eager frame="" />
          </div>
        </div>
        <p className="shrink-0 pb-4 text-center text-xs text-cocoa">
          {scale > 1 ? 'Move to pan · tap to reset' : 'Tap the image or use + to zoom'}
        </p>
      </div>
    </Modal>
  );
}
