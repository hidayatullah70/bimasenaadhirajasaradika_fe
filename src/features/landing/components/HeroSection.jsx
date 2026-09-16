import React from 'react';
import { Shield, ArrowRight, CheckCircle, Award } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function HeroSection({ onOpenContact, onExploreServices }) {
  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Full Section Background Image with Balanced Overlay to Ensure Image is Clearly Visible */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/assets/img/hero/office-new.jpeg"
          alt="Kantor Operasional PT. Bhimasena Adhirajasa Radhika"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft, balanced dark overlay: image remains bright & clearly visible while ensuring text readability */}
        <div className="absolute inset-0 bg-slate-950/35 bg-gradient-to-r from-slate-950/70 via-slate-950/40 to-slate-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-black/25" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/60 border border-white/20 text-brand-yellow text-xs font-bold tracking-wide uppercase backdrop-blur-md shadow-md">
              <Shield className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
              <span>Penyedia & Pengelola Tenaga Kerja Outsourcing Resmi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Solusi Outsourcing Terpercaya untuk{' '}
              <span className="text-brand-yellow">Ketahanan Bisnis</span>{' '}
              dan Operasional Prima.
            </h1>

            <p className="text-base sm:text-lg text-slate-100 max-w-2xl leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              <strong className="text-white font-semibold">PT. Bhimasena Adhirajasa Radhika</strong> menyediakan tenaga kerja terampil, disiplin, dan patuh hukum untuk 6 pilar layanan vital:{' '}
              <span className="text-brand-yellow font-medium">Security, Ekspedisi Kurir, Man Power, Cleaning Service, Pengelolaan Parkir,</span> hingga{' '}
              <span className="text-brand-yellow font-medium">Loss Prevention</span>.
            </p>

            {/* Quick Value Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-semibold">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-white/10 text-slate-200 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>100% Kontrak Kerja & BPJS Resmi</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-white/10 text-slate-200 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Pencapaian SLA Layanan &gt; 99%</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-white/10 text-slate-200 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Penggantian Tenaga Standby 3 Jam</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-white/10 text-slate-200 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Supervisi & Pengawasan Lapangan 24/7</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={onOpenContact}
                className="shadow-lg shadow-red-950/50 bg-brand-red hover:bg-brand-red-dark text-white font-bold"
              >
                Konsultasi Kebutuhan & Penawaran
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onExploreServices}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md font-semibold"
              >
                Jelajahi 6 Pilar Layanan
              </Button>
            </div>
          </div>

          {/* Right Column: Key Hero Metrics Card with Glassmorphic Design */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-2xl shadow-2xl relative text-white">
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ringkasan Operasional</span>
                  <h3 className="text-lg font-bold text-white">PT. Bhimasena In Numbers</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-brand-yellow border border-amber-500/30 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-5 border-b border-white/10">
                <div className="p-3.5 rounded-xl bg-slate-800/70 border border-white/10 hover:border-white/25 transition-all">
                  <span className="text-2xl font-black text-brand-red drop-shadow-sm">1,500+</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">Personel Aktif</p>
                  <span className="text-[10px] text-slate-400">Tersaring & terlatih</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/70 border border-white/10 hover:border-white/25 transition-all">
                  <span className="text-2xl font-black text-emerald-400 drop-shadow-sm">99.4%</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">Kepatuhan SLA</p>
                  <span className="text-[10px] text-slate-400">Presensi & tugas site</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/70 border border-white/10 hover:border-white/25 transition-all">
                  <span className="text-2xl font-black text-brand-yellow drop-shadow-sm">48+</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">Mitra Korporasi</p>
                  <span className="text-[10px] text-slate-400">Lintas industri nasional</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/70 border border-white/10 hover:border-white/25 transition-all">
                  <span className="text-2xl font-black text-cyan-400 drop-shadow-sm">24/7</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">Dukungan Darurat</p>
                  <span className="text-[10px] text-slate-400">Tim reaksi cepat standby</span>
                </div>
              </div>

              {/* Service Badges Row */}
              <div className="pt-4">
                <p className="text-xs text-slate-300 font-semibold mb-2">Cakupan Penempatan Tenaga Kerja:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Security Gada Pratama', 'Kurir Logistik', 'Operator Gudang', 'Sanitasi Komersial', 'Juru Parkir', 'Loss Prevention'].map((item, idx) => (
                    <span key={idx} className="text-[11px] font-medium bg-slate-800/90 text-slate-200 border border-white/10 px-2.5 py-1 rounded-md">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
