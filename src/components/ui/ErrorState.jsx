import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat menghubungi server. Silakan coba beberapa saat lagi.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-red-50/40 rounded-card border border-red-200 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-brand-red mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-brand-dark mb-1">{title}</h4>
      <p className="text-sm text-slate-600 max-w-md mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
