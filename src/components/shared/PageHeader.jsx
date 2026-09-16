import React from 'react';

export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            {breadcrumb.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300">/</span>}
                <span className={idx === breadcrumb.length - 1 ? 'font-semibold text-brand-dark' : 'hover:text-slate-700 cursor-pointer'}>
                  {item}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}
