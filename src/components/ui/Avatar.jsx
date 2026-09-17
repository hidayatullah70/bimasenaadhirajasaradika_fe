import React, { useState } from 'react';

export function Avatar({
  src,
  alt = 'User Avatar',
  name = '',
  size = 'md',
  className = ''
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base'
  };

  const getInitials = (n) => {
    if (!n) return 'BA';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const isImage = Boolean(src && !hasError && (src.startsWith('/') || src.startsWith('http')));

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 overflow-hidden select-none bg-brand-red ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {isImage ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}
    </div>
  );
}
