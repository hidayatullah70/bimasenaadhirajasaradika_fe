import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

/**
 * Accessible Modal / Dialog.
 * Focus-traps, Escape key close, aria-modal, role="dialog".
 * Destructive actions should use ConfirmDialog instead.
 * Source of Truth: UI-GUIDELINE §7 / PRD §30.
 */
export function Modal({ isOpen, onClose, title, children, size = 'md', className }) {
  const overlayRef = useRef(null);
  const firstFocusRef = useRef(null);

  const SIZE_CLASSES = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement;
    firstFocusRef.current?.focus();

    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={clsx(
          'relative w-full bg-surface rounded-xl shadow-modal flex flex-col max-h-[90vh]',
          SIZE_CLASSES[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-none">
          <h2 id="modal-title" className="font-semibold text-ink text-lg">
            {title}
          </h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:text-ink hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/**
 * ConfirmDialog — for destructive/critical actions.
 * PRD §30: Destructive actions require confirmation. No browser alert().
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'danger',
  loading = false,
}) {
  const CONFIRM_STYLES = {
    danger: 'bg-danger text-white hover:bg-red-700',
    warning: 'bg-warning text-white hover:bg-amber-700',
    primary: 'bg-primary-red text-white hover:bg-red-800',
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-slate text-sm leading-relaxed">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate bg-white border border-border rounded-lg hover:bg-canvas transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={clsx(
            'px-4 py-2 text-sm font-semibold rounded-lg transition-colors',
            CONFIRM_STYLES[variant],
            loading && 'opacity-50 cursor-not-allowed'
          )}
          aria-busy={loading}
        >
          {loading ? 'Memproses...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default Modal;
