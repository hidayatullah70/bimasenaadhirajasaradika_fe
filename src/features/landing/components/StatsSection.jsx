import React from 'react';
import { COMPANY_INFO } from '../../../services/mock/mockData';

export function StatsSection() {
  return (
    <section className="py-16 bg-brand-dark text-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {COMPANY_INFO.stats.map((stat, idx) => (
            <div key={idx} className="pt-6 lg:pt-0 lg:px-6 space-y-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-yellow tracking-tight">
                {stat.value}
              </span>
              <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">{stat.label}</p>
              <p className="text-[11px] text-slate-400">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
