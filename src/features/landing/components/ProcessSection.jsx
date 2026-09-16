import React from 'react';
import { COMPANY_INFO } from '../../../services/mock/mockData';
import { ArrowRight } from 'lucide-react';

export function ProcessSection() {
  return (
    <section id="proses" className="py-24 bg-brand-neutral border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Alur Operasional Transparan
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
            4 Tahap Pengelolaan Manpower Terintegrasi
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Dari penetapan spesifikasi hingga penempatan dan evaluasi SLA berkala, setiap tahap dijalankan dengan disiplin ketat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {COMPANY_INFO.processSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-brand-red/20">{step.step}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Tahap {idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-brand-dark mb-2.5 leading-snug">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>

              {idx < COMPANY_INFO.processSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
