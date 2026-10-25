import { useRef } from 'react';
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from '../lib/gsap';

/**
 * Endless ribbon of short phrases. Decorative: the phrases repeat text shown
 * elsewhere on the page, so the whole ribbon is hidden from assistive tech.
 * Scrolling speeds it up briefly and sets its direction.
 */
export function Marquee({ items }: { items: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const loop = gsap.to(trackRef.current, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
        // Start deep into the repeats so playing in reverse never reaches the start.
        loop.totalTime(loop.duration() * 1000);
        ScrollTrigger.create({
          trigger: rootRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 400);
            gsap.to(loop, { timeScale: boost * self.direction, duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.2, ease: 'power2.out' });
          },
        });
      });
    },
    { scope: rootRef },
  );

  const group = (
    <div className="flex shrink-0 items-center">
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-6 font-serif text-2xl whitespace-nowrap text-ivory italic sm:px-10 sm:text-4xl">{item}</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-champagne sm:h-5 sm:w-5">
            <path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div ref={rootRef} aria-hidden="true" className="overflow-hidden bg-espresso py-5 sm:py-7">
      <div ref={trackRef} className="flex w-max">
        {group}
        {group}
      </div>
    </div>
  );
}
