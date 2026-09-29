import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  full: 'max-w-5xl',
};

/**
 * Standardized Accessible Slide-over Drawer
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   title: React.ReactNode,
 *   subtitle?: React.ReactNode,
 *   children: React.ReactNode,
 *   footer?: React.ReactNode,
 *   size?: 'sm' | 'md' | 'lg' | 'xl' | 'full',
 *   className?: string
 * }} props
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  className,
}) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const prevActiveElement = document.activeElement;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (prevActiveElement && prevActiveElement.focus) {
        prevActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-ink/40 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div
        className={clsx(
          'relative w-full bg-surface h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-border',
          SIZES[size] || SIZES.md,
          className
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-canvas/40 flex-none">
          <div className="min-w-0 pr-4">
            <h2 id="drawer-title" className="text-lg font-bold text-ink truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:text-ink hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate flex-shrink-0"
            aria-label="Tutup panel"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border bg-canvas/40 flex-none flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Drawer;
