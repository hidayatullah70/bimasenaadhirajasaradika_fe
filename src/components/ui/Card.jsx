import React from 'react';
import clsx from 'clsx';

/**
 * Card — base surface component.
 * Subtle shadow, consistent radius (UI-GUIDELINE §3).
 */
export function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface rounded-card border border-border shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={clsx('px-5 py-4 border-b border-border flex items-center justify-between gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={clsx('font-semibold text-ink text-base', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={clsx('px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={clsx('px-5 py-3 border-t border-border bg-canvas rounded-b-card', className)}
      {...props}
    >
      {children}
    </div>
  );
}
