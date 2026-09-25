import React from 'react';
import clsx from 'clsx';
import { STATUS_COLORS, STATUS_LABELS } from '@/constants/status';

const VARIANT_MAP = {
  success: 'bg-success/10 text-success ring-1 ring-success/20',
  info: 'bg-info/10 text-info ring-1 ring-info/20',
  warning: 'bg-warning/10 text-warning ring-1 ring-warning/20',
  danger: 'bg-primary-red/10 text-primary-red ring-1 ring-primary-red/20',
  default: 'bg-slate/10 text-slate ring-1 ring-border',
};

/**
 * Status Badge — always pairs color with text (never color-only).
 * Source of Truth: UI-GUIDELINE.md Section 8.
 *
 * @param {{ status?: string, variant?: string, label?: string, children?: React.ReactNode, className?: string, icon?: React.ReactNode }} props
 */
export function Badge({ status, variant, label, children, className, icon }) {
  const colorClasses =
    (variant && VARIANT_MAP[variant]) ||
    (status && STATUS_COLORS[status]) ||
    'bg-slate/10 text-slate ring-1 ring-border';
  const displayLabel = children || label || (status && STATUS_LABELS[status]) || status;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClasses,
        className
      )}
    >
      {icon && <span aria-hidden className="h-3 w-3">{icon}</span>}
      {displayLabel}
    </span>
  );
}

export default Badge;
