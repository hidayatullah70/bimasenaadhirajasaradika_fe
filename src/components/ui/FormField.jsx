import React from 'react';
import clsx from 'clsx';

/**
 * Standardized Form Field Wrapper
 */
export function FormField({
  label,
  required,
  error,
  hint,
  id,
  children,
  className,
}) {
  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-ink"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-danger font-medium mt-1">{error}</p>
      )}
      {!error && hint && (
        <p className="text-xs text-muted mt-1">{hint}</p>
      )}
    </div>
  );
}

/**
 * Standardized Input Component
 */
export const Input = React.forwardRef(function Input(
  { className, hasError, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={clsx(
        'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-red/20 disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-60',
        hasError
          ? 'border-danger focus:border-danger'
          : 'border-border focus:border-primary-red',
        className
      )}
      {...props}
    />
  );
});

/**
 * Standardized Select Component
 */
export const Select = React.forwardRef(function Select(
  { className, hasError, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={clsx(
        'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-red/20 disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-60',
        hasError
          ? 'border-danger focus:border-danger'
          : 'border-border focus:border-primary-red',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

/**
 * Standardized Textarea Component
 */
export const Textarea = React.forwardRef(function Textarea(
  { className, hasError, rows = 3, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-red/20 disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-60 resize-y',
        hasError
          ? 'border-danger focus:border-danger'
          : 'border-border focus:border-primary-red',
        className
      )}
      {...props}
    />
  );
});

export default FormField;
