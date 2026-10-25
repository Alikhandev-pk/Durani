import type { ReactNode } from 'react';

interface NoticeProps {
  title: string;
  children?: ReactNode;
  tone?: 'info' | 'draft';
  className?: string;
}

/** Highlighted note for demo and draft states. */
export function Notice({ title, children, tone = 'info', className = '' }: NoticeProps) {
  const styles = tone === 'draft' ? 'border-champagne bg-[#fbf1df]' : 'border-line bg-cream';
  return (
    <div role="note" className={`rounded-xl border-l-4 px-5 py-4 text-sm ${styles} ${className}`}>
      <p className="font-semibold text-espresso">{title}</p>
      {children && <div className="mt-1 text-cocoa">{children}</div>}
    </div>
  );
}
