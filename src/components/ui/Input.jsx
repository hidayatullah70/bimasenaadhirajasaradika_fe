import React from 'react';

export function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  icon: Icon,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-brand-red">*</span>}
        </label>
      )}
      <div className="relative rounded-btn shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          required={required}
          className={`block w-full rounded-btn border text-sm transition-colors py-2 px-3 text-brand-dark placeholder-slate-400 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-9' : ''
          } ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
              : 'border-slate-300 focus:border-brand-red focus:ring-red-100 bg-white'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-brand-red font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

export function Select({
  label,
  id,
  options = [],
  error,
  helperText,
  className = '',
  required = false,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-brand-red">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`block w-full rounded-btn border text-sm py-2 px-3 text-brand-dark bg-white focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
            : 'border-slate-300 focus:border-brand-red focus:ring-red-100'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-brand-red font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

export function Textarea({
  label,
  id,
  rows = 3,
  error,
  helperText,
  className = '',
  required = false,
  ...props
}) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-brand-red">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={`block w-full rounded-btn border text-sm py-2 px-3 text-brand-dark placeholder-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
            : 'border-slate-300 focus:border-brand-red focus:ring-red-100 bg-white'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-brand-red font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
