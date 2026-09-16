import React from 'react';
import {
  Scale,
  GraduationCap,
  Activity,
  RefreshCw,
  TrendingDown,
  FileBarChart2,
  Check
} from 'lucide-react';
import { COMPANY_INFO } from '../../../services/mock/mockData';

export function AdvantagesSection() {
  const iconMap = {
    Scale,
    GraduationCap,
    Activity,
    RefreshCw,
    TrendingDown,
    FileBarChart2
  };

  return (
    <section id="keunggulan" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Nilai Tambah & Keunggulan
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
            Mengapa Korporasi Memilih PT. Bhimasena?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Kami bukan sekadar penyalur tenaga kerja, melainkan mitra manajemen operasional yang menjaga produktivitas, kepatuhan, dan reputasi bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPANY_INFO.advantages.map((adv, idx) => {
            const Icon = iconMap[adv.icon] || Check;

            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-red shadow-sm mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-brand-dark mb-2">{adv.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{adv.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
