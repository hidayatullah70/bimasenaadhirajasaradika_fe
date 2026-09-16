import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    red: 'bg-red-50 text-brand-red border-red-200 font-semibold',
    yellow: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    dark: 'bg-brand-dark text-white border-transparent font-medium'
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variants[variant] || variants.neutral} ${
        sizes[size] || sizes.sm
      } ${className}`}
    >
      {children}
    </span>
  );
}
