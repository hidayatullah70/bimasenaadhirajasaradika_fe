import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — used for empty table/list results.
 * Source of Truth: UI-GUIDELINE / USER-FLOW §14 (global UX states).
 */
export function EmptyState({ title = 'Tidak ada data', description, action, icon }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-canvas py-14 px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full bg-border/60 p-4 text-muted" aria-hidden>
        {icon || <Inbox className="h-8 w-8" />}
      </div>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/**
 * LoadingState — skeleton or spinner for async data.
 */
export function LoadingState({ rows = 4, className }) {
  return (
    <div className={`space-y-3 ${className || ''}`} role="status" aria-label="Memuat data...">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-border animate-pulse flex-none" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-border animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-border animate-pulse" />
          </div>
        </div>
      ))}
      <span className="sr-only">Memuat data...</span>
    </div>
  );
}

/**
 * ErrorState — for failed API calls. Never swallows errors silently.
 */
export function ErrorState({ title = 'Terjadi Kesalahan', message, retry, technicalDetail }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-danger/20 bg-danger/5 py-12 px-6 text-center"
      role="alert"
    >
      <div className="rounded-full bg-danger/10 p-4">
        <svg className="h-8 w-8 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {message && <p className="mt-1 text-sm text-muted">{message}</p>}
        {technicalDetail && (
          <p className="mt-1 text-xs text-danger/70 font-mono">{technicalDetail}</p>
        )}
      </div>
      {retry && (
        <button
          onClick={retry}
          className="text-sm font-medium text-primary-red hover:underline"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

/**
 * PermissionState — for 403 / missing permission within a page section.
 */
export function PermissionState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-canvas py-10 px-6 text-center"
      role="status"
    >
      <svg className="h-10 w-10 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
      <div>
        <p className="font-semibold text-ink">Akses Dibatasi</p>
        <p className="mt-1 text-sm text-muted">Anda tidak memiliki izin untuk melihat konten ini.</p>
      </div>
    </div>
  );
}

export function StateLoading({ message = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-muted">
      <div className="h-6 w-6 border-2 border-primary-red border-t-transparent rounded-full animate-spin" />
      <p className="text-xs">{message}</p>
    </div>
  );
}

export function StateEmpty({ title = 'Tidak ada data', description, actionLabel, onAction }) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-red text-white hover:bg-red-800 transition-colors"
          >
            {actionLabel}
          </button>
        ) : null
      }
    />
  );
}
