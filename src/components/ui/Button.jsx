import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

const SIZES = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

const VARIANTS = {
  primary:
    'bg-primary-red text-white hover:bg-red-800 active:bg-red-900 focus-visible:ring-primary-red shadow-sm',
  secondary:
    'bg-white text-ink border border-border hover:bg-canvas active:bg-slate/10 focus-visible:ring-slate shadow-sm',
  danger:
    'bg-danger text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-danger shadow-sm',
  ghost:
    'text-slate hover:bg-slate/10 active:bg-slate/20 focus-visible:ring-slate',
  link:
    'text-primary-red underline-offset-4 hover:underline focus-visible:ring-primary-red p-0',
  success:
    'bg-success text-white hover:bg-green-700 active:bg-green-800 focus-visible:ring-success shadow-sm',
  warning:
    'bg-warning text-white hover:bg-amber-700 active:bg-amber-800 focus-visible:ring-warning shadow-sm',
};

/**
 * @param {{
 *   variant?: keyof VARIANTS,
 *   size?: keyof SIZES,
 *   loading?: boolean,
 *   iconLeft?: React.ReactNode,
 *   iconRight?: React.ReactNode,
 *   className?: string,
 *   children: React.ReactNode,
 * } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={clsx(BASE, SIZES[size], VARIANTS[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        iconLeft && <span aria-hidden>{iconLeft}</span>
      )}
      {children}
      {!loading && iconRight && <span aria-hidden>{iconRight}</span>}
    </button>
  );
}

export default Button;
