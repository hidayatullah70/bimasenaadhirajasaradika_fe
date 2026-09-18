import React from 'react';
import { Shield, ArrowRight, CheckCircle, Award } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function HeroSection({ onOpenContact, onExploreServices }) {
  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Full Section Background Image with Subtle, Light Overlay to Ensure Image is Clearly Visible and Bright */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/assets/img/hero/office-new.jpeg"
          alt="Kantor Operasional PT. Bhimasena Adhirajasa Radhika"
          className="w-full h-full object-cover object-center brightness-105"
        />
        {/* Soft, minimal gradient: hero background is clearly visible, bright, and vibrant */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-slate-950/15 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/95 border border-slate-300 text-brand-red text-xs font-bold tracking-wide uppercase backdrop-blur-md shadow-sm">
              <Shield className="w-3.5 h-3.5 fill-brand-yellow text-brand-red" />
              <span>Penyedia & Pengelola Tenaga Kerja Outsourcing Resmi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              Solusi Outsourcing Terpercaya untuk{' '}
              <span className="text-brand-yellow">Ketahanan Bisnis</span>{' '}
              dan Operasional Prima.
            </h1>

            <p className="text-base sm:text-lg text-slate-100 max-w-2xl leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
              <strong className="text-white font-semibold">PT. Bhimasena Adhirajasa Radhika</strong> menyediakan tenaga kerja terampil, disiplin, dan patuh hukum untuk 6 pilar layanan vital:{' '}
              <span className="text-brand-yellow font-medium">Security, Ekspedisi Kurir, Man Power, Cleaning Service, Pengelolaan Parkir,</span> hingga{' '}
              <span className="text-brand-yellow font-medium">Loss Prevention</span>.
            </p>

            {/* Quick Value Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-bold">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/95 backdrop-blur-md border border-slate-300/90 text-slate-800 shadow-sm">
                <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>100% Kontrak Kerja & BPJS Resmi</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/95 backdrop-blur-md border border-slate-300/90 text-slate-800 shadow-sm">
                <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>Pencapaian SLA Layanan &gt; 99%</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/95 backdrop-blur-md border border-slate-300/90 text-slate-800 shadow-sm">
                <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>Penggantian Tenaga Standby 3 Jam</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/95 backdrop-blur-md border border-slate-300/90 text-slate-800 shadow-sm">
                <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
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
                className="border-slate-300 bg-slate-100/95 text-slate-800 hover:bg-white hover:text-brand-red backdrop-blur-md font-bold shadow-sm"
              >
                Jelajahi 6 Pilar Layanan
              </Button>
            </div>
          </div>

          {/* Right Column: Key Hero Metrics Card with Light Grey Card Design */}
          <div className="lg:col-span-5">
            <div className="bg-slate-100/95 backdrop-blur-xl border border-slate-300/90 p-6 sm:p-8 rounded-2xl shadow-2xl relative text-slate-800">
              <div className="flex items-center justify-between pb-5 border-b border-slate-200">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ringkasan Operasional</span>
                  <h3 className="text-lg font-bold text-slate-900">PT. Bhimasena In Numbers</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-brand-red/40 hover:shadow-sm transition-all">
                  <span className="text-2xl font-black text-brand-red drop-shadow-xs">1,500+</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">Personel Aktif</p>
                  <span className="text-[10px] font-medium text-slate-500">Tersaring & terlatih</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-brand-green/40 hover:shadow-sm transition-all">
                  <span className="text-2xl font-black text-brand-green drop-shadow-xs">99.4%</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">Kepatuhan SLA</p>
                  <span className="text-[10px] font-medium text-slate-500">Presensi & tugas site</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all">
                  <span className="text-2xl font-black text-amber-600 drop-shadow-xs">48+</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">Mitra Korporasi</p>
                  <span className="text-[10px] font-medium text-slate-500">Lintas industri nasional</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all">
                  <span className="text-2xl font-black text-blue-600 drop-shadow-xs">24/7</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">Dukungan Darurat</p>
                  <span className="text-[10px] font-medium text-slate-500">Tim reaksi cepat standby</span>
                </div>
              </div>

              {/* Service Badges Row */}
              <div className="pt-4">
                <p className="text-xs text-slate-700 font-bold mb-2">Cakupan Penempatan Tenaga Kerja:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Security Gada Pratama', 'Kurir Logistik', 'Operator Gudang', 'Sanitasi Komersial', 'Juru Parkir', 'Loss Prevention'].map((item, idx) => (
                    <span key={idx} className="text-[11px] font-semibold bg-white text-slate-700 border border-slate-300/80 px-2.5 py-1 rounded-md shadow-2xs">
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
