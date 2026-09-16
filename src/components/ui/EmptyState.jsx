import React from 'react';
import { Inbox, FolderSearch } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'Belum Ada Data',
  description = 'Tidak ada catatan yang ditemukan untuk kriteria pencarian atau filter yang dipilih.',
  actionText,
  onAction,
  icon: Icon = Inbox,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-card border border-dashed border-slate-300 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-semibold text-brand-dark mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
