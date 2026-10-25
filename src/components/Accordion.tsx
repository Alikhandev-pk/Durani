import { useRef, type MouseEvent, type ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '../lib/gsap';
import { ChevronDownIcon } from './Icons';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

/**
 * Native <details> accordion: keyboard accessible with no extra script.
 * GSAP only smooths the height change; with reduced motion it toggles instantly.
 */
export function Accordion({ items, defaultOpen }: { items: AccordionItem[]; defaultOpen?: string }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <AccordionRow key={item.id} item={item} defaultOpen={item.id === defaultOpen} />
      ))}
    </div>
  );
}

function AccordionRow({ item, defaultOpen }: { item: AccordionItem; defaultOpen: boolean }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  const onSummaryClick = (e: MouseEvent) => {
    const details = detailsRef.current;
    const panel = panelRef.current;
    if (!details || !panel || prefersReducedMotion()) return;
    e.preventDefault();
    tween.current?.kill();

    const closing = details.open && details.dataset.closing === undefined;
    if (closing) {
      details.dataset.closing = '';
      tween.current = gsap.to(panel, {
        height: 0,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power3.inOut',
        onComplete: () => {
          details.open = false;
          delete details.dataset.closing;
          gsap.set(panel, { clearProps: 'height,opacity,visibility' });
        },
      });
    } else {
      const from = details.open ? panel.offsetHeight : 0;
      delete details.dataset.closing;
      details.open = true;
      tween.current = gsap.fromTo(
        panel,
        { height: from, autoAlpha: 0 },
        { height: 'auto', autoAlpha: 1, duration: 0.55, ease: 'power3.out', clearProps: 'height,opacity,visibility' },
      );
    }
  };

  return (
    <details ref={detailsRef} className="group" open={defaultOpen}>
      <summary
        onClick={onSummaryClick}
        className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-serif text-lg transition-colors hover:text-gold-deep sm:text-xl marker:hidden [&::-webkit-details-marker]:hidden"
      >
        {item.title}
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line transition-colors duration-300 group-open:border-espresso group-open:bg-espresso group-open:text-ivory">
          <ChevronDownIcon width={18} height={18} className="accordion-chevron transition-[rotate] duration-300 group-open:rotate-180" />
        </span>
      </summary>
      <div ref={panelRef} className="overflow-hidden">
        <div className="pb-6 text-cocoa">{item.content}</div>
      </div>
    </details>
  );
}
