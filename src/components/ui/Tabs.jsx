import React from 'react';
import clsx from 'clsx';
import { Badge } from './Badge';

/**
 * Standardized Tabs Component
 * @param {{
 *   items: Array<{ key: string, label: string, count?: number, icon?: React.ReactNode, disabled?: boolean }>,
 *   activeKey: string,
 *   onChange: (key: string) => void,
 *   variant?: 'underline' | 'pills',
 *   className?: string
 * }} props
 */
export function Tabs({
  items = [],
  activeKey,
  onChange,
  variant = 'underline',
  className,
}) {
  if (!items || items.length === 0) return null;

  return (
    <div
      role="tablist"
      aria-label="Tabs"
      className={clsx(
        variant === 'underline'
          ? 'flex items-center space-x-6 border-b border-border overflow-x-auto no-scrollbar select-none'
          : 'flex items-center gap-1.5 p-1 bg-canvas border border-border/80 rounded-xl overflow-x-auto no-scrollbar select-none',
        className
      )}
    >
      {items.map((tab) => {
        const isActive = tab.key === activeKey;

        if (variant === 'pills') {
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.key)}
              className={clsx(
                'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150',
                isActive
                  ? 'bg-surface text-ink shadow-sm ring-1 ring-border'
                  : 'text-muted hover:text-ink hover:bg-surface/50',
                tab.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {tab.icon && <span aria-hidden>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    isActive ? 'bg-primary-red/10 text-primary-red' : 'bg-border text-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange(tab.key)}
            className={clsx(
              'inline-flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors duration-150',
              isActive
                ? 'border-primary-red text-primary-red'
                : 'border-transparent text-muted hover:text-ink hover:border-border',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {tab.icon && <span aria-hidden>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <Badge
                variant={isActive ? 'danger' : 'default'}
                className="text-[10px] px-1.5 py-0.2"
              >
                {tab.count}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
