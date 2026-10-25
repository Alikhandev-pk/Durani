import type { ReactNode } from 'react';

interface Props {
  eyebrow?: string;
  title: string;
  id?: string;
  description?: ReactNode;
  action?: ReactNode;
  align?: 'left' | 'center';
}

/** Section title. `data-split` / `data-reveal` hook into the page motion in Layout. */
export function SectionHeading({ eyebrow, title, id, description, action, align = 'left' }: Props) {
  const centered = align === 'center';
  return (
    <div
      className={`mb-10 flex flex-col gap-4 sm:mb-14 ${
        centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      }`}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p data-reveal className={`eyebrow mb-4 flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            {eyebrow}
            {centered && <span aria-hidden="true" className="h-px w-8 bg-gold" />}
          </p>
        )}
        <h2 id={id} data-split className="text-[2.1rem] leading-[1.08] tracking-[-0.01em] sm:text-5xl">
          {title}
        </h2>
        {description && (
          <div data-reveal className="mt-4 text-cocoa">
            {description}
          </div>
        )}
      </div>
      {action && <div data-reveal>{action}</div>}
    </div>
  );
}
