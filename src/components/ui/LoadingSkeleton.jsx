import React from 'react';

export function LoadingSkeleton({ type = 'table', count = 5, className = '' }) {
  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200/80 rounded-card border border-slate-200" />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`w-full bg-white rounded-card border border-slate-200 p-4 space-y-4 animate-pulse ${className}`}>
        <div className="h-8 bg-slate-200/70 rounded-btn w-1/3" />
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-btn w-full flex items-center px-4 gap-4">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // default block skeleton
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded w-full" />
      ))}
    </div>
  );
}
