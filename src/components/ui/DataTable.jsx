import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'Data Tidak Ditemukan',
  emptyDescription = 'Tidak ada baris data yang cocok dengan kriteria saat ini.',
  search = '',
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  filterSlot,
  actionSlot,
  pagination, // { page, totalPages, total, onPageChange }
  className = ''
}) {
  return (
    <div className={`bg-white rounded-card border border-brand-border shadow-sm overflow-hidden ${className}`}>
      {/* Top Controls Bar */}
      {(onSearchChange || filterSlot || actionSlot) && (
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {onSearchChange && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red"
                />
              </div>
            )}
            {filterSlot}
          </div>
          {actionSlot && <div className="flex-shrink-0">{actionSlot}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={col.key || idx} className={`py-3 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-6">
                  <LoadingSkeleton count={4} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={col.key || colIdx} className={`py-3 px-4 align-middle ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="p-3 sm:px-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50/40">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-slate-700">{data.length}</span> dari{' '}
            <span className="font-semibold text-slate-700">{pagination.total || data.length}</span> data
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span>
              Halaman {pagination.page} dari {pagination.totalPages || 1}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="!p-1"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange && pagination.onPageChange(pagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="!p-1"
                disabled={pagination.page >= (pagination.totalPages || 1)}
                onClick={() => pagination.onPageChange && pagination.onPageChange(pagination.page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
