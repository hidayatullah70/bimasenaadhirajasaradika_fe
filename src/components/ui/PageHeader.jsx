import React from 'react';
import clsx from 'clsx';
import Breadcrumbs from './Breadcrumbs';

/**
 * Standardized PageHeader Component
 * @param {{
 *   title: React.ReactNode,
 *   subtitle?: React.ReactNode,
 *   badge?: React.ReactNode,
 *   breadcrumbs?: Array<{ label: string, href?: string }>,
 *   actions?: React.ReactNode,
 *   children?: React.ReactNode,
 *   className?: string
 * }} props
 */
export function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  children,
  className,
}) {
  return (
    <div className={clsx('mb-6', className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-sm text-muted">
              {subtitle}
            </p>
          )}
        </div>
        {(actions || children) && (
          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            {actions || children}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
