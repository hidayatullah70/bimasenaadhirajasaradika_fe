import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

/**
 * Standardized Pagination Component
 * @param {{
 *   currentPage: number,
 *   totalPages: number,
 *   totalItems?: number,
 *   pageSize?: number,
 *   onPageChange: (page: number) => void,
 *   label?: string,
 *   className?: string
 * }} props
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize = 10,
  onPageChange,
  label = 'data',
  className,
}) {
  if (totalPages <= 1 && (!totalItems || totalItems <= pageSize)) {
    if (totalItems !== undefined) {
      return (
        <div className={clsx('flex items-center justify-between text-xs text-muted py-3 px-1', className)}>
          <span>Total: <strong className="text-ink">{totalItems}</strong> {label}</span>
          <span>Halaman 1 dari 1</span>
        </div>
      );
    }
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-2 text-xs text-muted select-none border-t border-border/70',
        className
      )}
      aria-label="Paginasi tabel"
    >
      <div>
        {totalItems !== undefined ? (
          <span>
            Menampilkan <strong className="text-ink">{startItem}</strong> -{' '}
            <strong className="text-ink">{endItem}</strong> dari{' '}
            <strong className="text-ink">{totalItems}</strong> {label}
          </span>
        ) : (
          <span>Halaman <strong className="text-ink">{currentPage}</strong> dari <strong className="text-ink">{totalPages}</strong></span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Halaman sebelumnya"
          title="Halaman Sebelumnya"
          className="btn-pagination-nav"
        >
          <ChevronLeft className="h-4 w-4 text-primary-red" strokeWidth={2.5} />
        </button>

        <span className="px-2.5 py-1 text-xs font-semibold text-ink bg-canvas rounded border border-border">
          {currentPage} / {totalPages || 1}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman berikutnya"
          title="Halaman Berikutnya"
          className="btn-pagination-nav"
        >
          <ChevronRight className="h-4 w-4 text-primary-red" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
