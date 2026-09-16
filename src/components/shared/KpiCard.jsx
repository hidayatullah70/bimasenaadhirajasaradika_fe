import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'red', // red, green, yellow, dark, blue
  onClick
}) {
  const colorMap = {
    red: {
      bg: 'bg-red-50',
      text: 'text-brand-red',
      border: 'border-red-100'
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-brand-green',
      border: 'border-emerald-100'
    },
    yellow: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100'
    },
    dark: {
      bg: 'bg-slate-100',
      text: 'text-brand-dark',
      border: 'border-slate-200'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100'
    }
  };

  const scheme = colorMap[color] || colorMap.red;

  return (
    <Card hover={!!onClick} onClick={onClick} className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-medium text-slate-500 truncate uppercase tracking-wider">{title}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-brand-dark mt-1 truncate">{value}</h3>
          
          {(subtitle || trend) && (
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {trend && (
                <span
                  className={`inline-flex items-center font-semibold ${
                    trendDirection === 'up' ? 'text-brand-green' : 'text-brand-red'
                  }`}
                >
                  {trendDirection === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {trend}
                </span>
              )}
              {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border ${scheme.bg} ${scheme.text} ${scheme.border}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
