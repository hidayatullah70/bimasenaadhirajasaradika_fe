import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { COMPANY_INFO } from '../../../services/mock/mockData';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Pertanyaan Umum
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
            Kerap Ditanyakan Seputar Kerjasama
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Transparansi mengenai legalitas, SLA, mitigasi risiko, dan tata kelola personil.
          </p>
        </div>

        <div className="space-y-3">
          {COMPANY_INFO.faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-brand-red/40 bg-red-50/10 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'text-brand-red' : 'text-slate-400'}`} />
                    <span className="text-sm sm:text-base font-bold text-brand-dark">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-red' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
