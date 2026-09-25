import React from 'react';
import clsx from 'clsx';

/**
 * PageHeader — standard internal page header.
 * Pattern: title + description + primary action slot.
 * Source of Truth: UI-GUIDELINE §5 / PRD §8.
 */
export default function PageHeader({ title, description, actions, className }) {
  return (
    <div className={clsx('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6', className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-ink leading-tight truncate">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted leading-relaxed">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-none flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
