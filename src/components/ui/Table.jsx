import React from 'react';
import clsx from 'clsx';

/**
 * Standardized Responsive Table Container & Components
 */

export function TableContainer({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'w-full overflow-x-auto rounded-card border border-border bg-surface shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Table({ children, className, ...props }) {
  return (
    <table className={clsx('w-full text-left text-sm border-collapse', className)} {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead
      className={clsx(
        'bg-canvas/80 text-xs font-semibold uppercase tracking-wider text-muted border-b border-border select-none',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={clsx('divide-y divide-border/60 text-ink', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, isHoverable = true, ...props }) {
  return (
    <tr
      className={clsx(
        'transition-colors duration-100',
        isHoverable && 'hover:bg-canvas/50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className, align = 'left', ...props }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align] || 'text-left';

  return (
    <th
      scope="col"
      className={clsx('px-4 py-3.5 whitespace-nowrap', alignClass, className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className, align = 'left', ...props }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align] || 'text-left';

  return (
    <td
      className={clsx('px-4 py-3 text-sm whitespace-nowrap', alignClass, className)}
      {...props}
    >
      {children}
    </td>
  );
}

export default Table;
