import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-btn transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-brand-red text-white hover:bg-brand-red-dark focus:ring-brand-red shadow-sm',
    secondary: 'bg-brand-yellow text-brand-dark hover:bg-brand-yellow-dark focus:ring-brand-yellow font-semibold shadow-sm',
    success: 'bg-brand-green text-white hover:bg-brand-green-dark focus:ring-brand-green shadow-sm',
    outline: 'border border-slate-300 bg-white text-brand-dark hover:bg-slate-50 focus:ring-slate-400',
    ghost: 'text-slate-600 hover:text-brand-dark hover:bg-slate-100 focus:ring-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    dark: 'bg-brand-dark text-white hover:bg-brand-dark-light focus:ring-brand-dark shadow-sm'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 text-current" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 text-current" />}
        </>
      )}
    </button>
  );
}
