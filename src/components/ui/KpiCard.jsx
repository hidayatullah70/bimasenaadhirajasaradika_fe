import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * KPI Card — displays a computed metric.
 * KPI values MUST come from data selectors, not hardcoded (PRD §38).
 *
 * @param {{
 *   title: string,
 *   value: string | number,
 *   subtitle?: string,
 *   icon: React.ReactNode,
 *   iconBg?: string,
 *   trend?: { value: number, label: string },
 *   loading?: boolean,
 *   onClick?: () => void,
 *   className?: string,
 * }} props
 */
export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-primary-red/10',
  trend,
  loading = false,
  onClick,
  className,
}) {
  const isClickable = !!onClick;

  const TrendIcon =
    trend?.value > 0
      ? TrendingUp
      : trend?.value < 0
      ? TrendingDown
      : Minus;

  const trendColor =
    trend?.value > 0
      ? 'text-success'
      : trend?.value < 0
      ? 'text-danger'
      : 'text-muted';

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={clsx(
        'bg-surface rounded-card border border-border shadow-card p-5 transition-all duration-150',
        isClickable &&
          'cursor-pointer hover:shadow-dropdown hover:border-primary-red/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red',
        className
      )}
      aria-label={isClickable ? `${title}: ${value} — klik untuk detail` : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted uppercase tracking-wide truncate">
            {title}
          </p>
          {loading ? (
            <div className="mt-2 h-8 w-24 rounded bg-border animate-pulse" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums truncate">
              {value}
            </p>
          )}
          {subtitle && !loading && (
            <p className="mt-0.5 text-xs text-muted truncate">{subtitle}</p>
          )}
        </div>
        <div className={clsx('flex-none rounded-xl p-2.5', iconBg)} aria-hidden>
          {icon}
        </div>
      </div>

      {trend && !loading && (
        <div className={clsx('mt-3 flex items-center gap-1 text-xs', trendColor)}>
          <TrendIcon className="h-3.5 w-3.5 flex-none" aria-hidden />
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
