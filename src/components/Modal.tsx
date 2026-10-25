import { useEffect, useRef, type ReactNode } from 'react';

type Variant = 'right' | 'left' | 'top' | 'center';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  variant: Variant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  right: 'ml-auto mr-0 h-dvh max-h-none w-full max-w-md animate-[slide-in-right_.35s_cubic-bezier(.2,.7,.2,1)]',
  left: 'mr-auto ml-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none animate-[slide-in-left_.35s_cubic-bezier(.2,.7,.2,1)]',
  top: 'mt-0 mb-auto w-full max-w-none animate-[slide-in-top_.3s_cubic-bezier(.2,.7,.2,1)]',
  center: 'm-auto h-dvh max-h-none w-full max-w-none animate-[fade-in_.25s_ease-out]',
};

/**
 * Native <dialog> rendered as a modal: the browser handles focus trapping,
 * Escape to close, inert background and returning focus on close.
 */
export function Modal({ open, onClose, labelledBy, variant, children, className = '' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() focuses the first focusable element; honour an explicit target instead.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        // Clicks on the ::backdrop target the dialog element itself.
        if (e.target === ref.current) onClose();
      }}
      className={`bg-transparent p-0 text-espresso backdrop:bg-espresso/40 backdrop:backdrop-blur-[2px] ${variantClasses[variant]} ${className}`}
    >
      {open && children}
    </dialog>
  );
}
