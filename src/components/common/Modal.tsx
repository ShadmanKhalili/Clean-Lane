import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Shared accessible dialog. Replaces the hand-rolled `fixed inset-0` overlays.
 *
 * - role="dialog", aria-modal, aria-labelledby (from `title` or `labelledBy`)
 * - Escape and backdrop click close (both can be disabled for destructive flows)
 * - focus moves into the dialog, is trapped while open, and is restored on close
 * - body scroll is locked while any dialog is open (nested dialogs supported)
 *
 * Children are unmounted while closed, so any state that lives *inside* the
 * children resets on reopen. State held by the caller does not — reset it there.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Visible heading. Omit only if you render your own heading and pass `labelledBy`. */
  title?: React.ReactNode;
  /** Optional short line under the title. */
  description?: React.ReactNode;
  labelledBy?: string;
  /** 'center' card (default) or right-hand 'drawer'. */
  variant?: 'center' | 'drawer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Defaults to true. Set false for multi-step flows where an accidental close loses work. */
  dismissible?: boolean;
  /** Extra classes for the panel. */
  className?: string;
  /** Hide the built-in close button (e.g. when the body has its own). */
  hideCloseButton?: boolean;
  closeLabel?: string;
  /** Rendered in a sticky footer area. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const SIZE: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

let openCount = 0;

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  labelledBy,
  variant = 'center',
  size = 'md',
  dismissible = true,
  className = '',
  hideCloseButton = false,
  closeLabel = 'Close',
  footer,
  children
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const autoId = useId();
  const titleId = labelledBy ?? `${autoId}-title`;
  const descId = description ? `${autoId}-desc` : undefined;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    openCount += 1;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element that is not the close button, else the panel.
    const panel = panelRef.current;
    const focusables = panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    const firstField = focusables.find((el) => !el.dataset.modalClose) ?? focusables[0];
    (firstField ?? panel)?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (!panelRef.current) return;
      // Only the top-most dialog reacts.
      const dialogs = document.querySelectorAll('[data-modal-panel]');
      if (dialogs[dialogs.length - 1] !== panelRef.current) return;

      if (e.key === 'Escape' && dismissible) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab') {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null || el === document.activeElement
        );
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      openCount -= 1;
      if (openCount === 0) document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, dismissible]);

  if (!open) return null;

  const isDrawer = variant === 'drawer';

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] flex ${
        isDrawer ? 'justify-end' : 'items-end sm:items-center justify-center p-0 sm:p-4'
      } bg-slate-900/40 backdrop-blur-xs animate-fade-in`}
      onMouseDown={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        data-modal-panel=""
        role="dialog"
        aria-modal="true"
        aria-labelledby={title || labelledBy ? titleId : undefined}
        aria-describedby={descId}
        tabIndex={-1}
        className={`relative bg-white text-[#202B38] shadow-2xl outline-none flex flex-col ${
          isDrawer
            ? 'h-full w-full max-w-md border-l border-[#EDE4D8]'
            : `w-full ${SIZE[size]} max-h-[92vh] rounded-t-3xl sm:rounded-3xl border border-[#EDE4D8]`
        } ${className}`}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-[#F1EBE1] shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-base sm:text-lg font-bold text-[#172521] leading-snug">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-xs text-[#53616D] mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                data-modal-close=""
                onClick={onClose}
                aria-label={closeLabel}
                className="shrink-0 w-9 h-9 -mr-1 rounded-xl flex items-center justify-center text-[#53616D] hover:bg-[#F8F7F1] hover:text-[#172521] cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer && <div className="shrink-0 px-5 py-3 border-t border-[#F1EBE1] bg-[#FDFCF9] rounded-b-3xl">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
