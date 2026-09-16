import React from 'react';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-slate-200 gap-2 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              isActive
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-red-100 text-brand-red' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
