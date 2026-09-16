import React from 'react';
import { Quote } from 'lucide-react';
import { COMPANY_INFO } from '../../../services/mock/mockData';

export function TestimonialsSection() {
  return (
    <section id="testimoni" className="py-24 bg-brand-neutral border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Suara Mitra
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Apa Kata Para Pimpinan Operasional?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Bukti nyata dedikasi dan profesionalitas tenaga kerja PT. Bhimasena di lapangan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMPANY_INFO.testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-brand-border p-6 sm:p-7 shadow-sm flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-brand-red/30 mb-4" />
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-dark text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {t.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-dark">{t.author}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}, {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
