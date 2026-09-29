import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

/**
 * Breadcrumbs component
 * @param {{ items: Array<{ label: string, href?: string }> }} props
 */
export function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center text-xs text-muted mb-2 select-none" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/ops"
            className="inline-flex items-center gap-1 text-muted hover:text-ink transition-colors"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight className="h-3.5 w-3.5 text-muted/60 mx-1 flex-shrink-0" aria-hidden />
              {isLast || !item.href ? (
                <span className={clsx('font-medium', isLast ? 'text-ink' : 'text-muted')}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="hover:text-ink text-muted transition-colors font-medium"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
