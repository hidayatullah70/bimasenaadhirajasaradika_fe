/**
 * LandingPage — public home page.
 * Reuses existing assets from /public/assets/img/ (audit-compliant per UI-GUIDELINE §13).
 * Real 18 client list from PRD §9.
 * Sections: Hero, Stats, Services, Clients, Process, CTA.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, ParkingCircle, Sparkles, Users, Eye, ArrowRight, CheckCircle, Phone } from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import { REAL_CLIENTS, SERVICE_TYPES } from '@/constants/business';

const SERVICE_ICONS = {
  security: Shield,
  kurir: Truck,
  parkir: ParkingCircle,
  'cleaning-service': Sparkles,
  'man-power': Users,
  'loss-prevention': Eye,
};

const SERVICE_IMAGES = {
  security: '/assets/img/services/security.png',
  kurir: '/assets/img/services/kurir.png',
  parkir: '/assets/img/services/parkir.png',
  'cleaning-service': '/assets/img/services/cleaning-service.png',
  'man-power': '/assets/img/services/man-power.jpg',
  'loss-prevention': '/assets/img/services/loss-prevention.png',
};

const PORTFOLIO_IMAGES = [
  '/assets/img/portfolio/bonacity.jpg',
  '/assets/img/portfolio/gudang-logistik.jpg',
  '/assets/img/portfolio/kavlingkenanga.jpeg',
  '/assets/img/portfolio/pasar-kemis.jpg',
  '/assets/img/portfolio/pusat.jpg',
  '/assets/img/portfolio/salembaran.jpg',
];

const STATS = [
  { value: '6', label: 'Layanan Unggulan' },
  { value: '18+', label: 'Client Aktif' },
  { value: '1000+', label: 'Tenaga Kerja' },
  { value: '5+', label: 'Tahun Pengalaman' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Konsultasi', desc: 'Hubungi kami dan konsultasikan kebutuhan outsourcing bisnis Anda.' },
  { step: '02', title: 'Survey & Proposal', desc: 'Tim kami melakukan survey lokasi dan menyiapkan proposal terbaik.' },
  { step: '03', title: 'Kontrak & Persiapan', desc: 'Penandatanganan kontrak dan persiapan penempatan tenaga kerja.' },
  { step: '04', title: 'Penempatan', desc: 'Penempatan tenaga kerja profesional sesuai kebutuhan Anda.' },
];

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState(null);
  const FAQS = [
    { q: 'Apa saja layanan outsourcing PT. BARAK?', a: 'Kami menyediakan 6 layanan utama: Jasa Pengamanan/Security, Ekspedisi Kurir, Parkir, Cleaning Service, Man Power, dan Loss Prevention.' },
    { q: 'Bagaimana cara mendaftar sebagai client?', a: 'Hubungi kami melalui halaman Kontak atau formulir Konsultasi. Tim marketing kami akan segera menghubungi Anda.' },
    { q: 'Apakah ada kontrak minimum?', a: 'Durasi kontrak bervariasi sesuai kebutuhan bisnis Anda. Kami menyediakan skema kontrak yang fleksibel.' },
    { q: 'Berapa wilayah operasional PT. BARAK?', a: 'Saat ini kami beroperasi di wilayah Tangerang dan sekitarnya. Hubungi kami untuk informasi lebih lanjut.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section
        className="relative min-h-[calc(100vh-4rem)] mt-16 flex items-center overflow-hidden bg-ink"
        aria-label="Bagian utama"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/img/hero/heroBarak.jpeg"
            alt=""
            className="w-full h-full object-cover object-center"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-transparent" aria-hidden />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 pb-32">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-yellow/20 text-primary-yellow text-xs font-semibold uppercase tracking-wide mb-6">
              Mitra Outsourcing Terpercaya
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Solusi Outsourcing{' '}
              <span className="text-primary-red">Terpercaya</span> untuk{' '}
              <span className="text-primary-yellow">Bisnis Anda</span>
            </h1>
            <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-xl">
              PT. Bhimasena Adhirajasa Radhika hadir sebagai mitra strategis dari perspektif dan pengalaman tenaga kerja outsourcing yang profesional, kompeten dan berintegritas.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/contact"
                id="hero-cta-consultation"
                className="px-6 py-3 bg-primary-red text-white font-semibold rounded-xl hover:bg-red-800 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Konsultasi Sekarang
              </Link>
              <Link
                to="/layanan"
                id="hero-cta-services"
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Pelajari Layanan
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-white/10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {STATS.map((stat) => (
                <div key={stat.label} className="py-5 px-6 text-center">
                  <p className="text-2xl font-bold text-primary-yellow tabular-nums">{stat.value}</p>
                  <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-canvas" aria-labelledby="services-heading">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="services-heading" className="text-3xl font-bold text-ink">Layanan Kami</h2>
            <p className="mt-3 text-muted max-w-2xl mx-auto">
              Membantu operasional bisnis Anda dengan layanan outsourcing terbaik.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_TYPES.map((service) => {
              const Icon = SERVICE_ICONS[service.slug] || Shield;
              return (
                <Link
                  key={service.slug}
                  to={`/layanan/${service.slug}`}
                  id={`service-card-${service.slug}`}
                  className="group bg-surface rounded-xl border border-border shadow-card overflow-hidden hover:shadow-dropdown hover:border-primary-red/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red"
                >
                  <div className="relative h-44 overflow-hidden bg-slate/10">
                    <img
                      src={SERVICE_IMAGES[service.slug]}
                      alt={service.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" aria-hidden />
                    <div className="absolute top-4 left-4 h-10 w-10 rounded-xl bg-primary-red/90 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" aria-hidden />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-ink group-hover:text-primary-red transition-colors">{service.label}</h3>
                    <div className="mt-2 flex items-center gap-1 text-primary-red text-sm font-medium">
                      <span>Selengkapnya</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white" aria-labelledby="process-heading">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="process-heading" className="text-3xl font-bold text-ink">Alur Layanan</h2>
            <p className="mt-3 text-muted">Proses mudah untuk memulai kerjasama dengan PT. BARAK.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border -translate-y-px z-0" aria-hidden />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary-red/10 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary-red">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-20 bg-canvas" aria-labelledby="clients-heading">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="clients-heading" className="text-3xl font-bold text-ink">Klien Kami</h2>
            <p className="mt-3 text-muted">Dipercaya oleh {REAL_CLIENTS.length} client aktif di berbagai sektor.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {REAL_CLIENTS.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-center px-3 py-4 bg-surface rounded-xl border border-border text-center hover:border-primary-red/20 hover:shadow-card transition-all"
              >
                <div>
                  <p className="text-xs font-semibold text-ink leading-tight">{client.name}</p>
                  <p className="text-xs text-muted mt-0.5">{client.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-20 bg-white" aria-labelledby="portfolio-heading">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="portfolio-heading" className="text-3xl font-bold text-ink">Portofolio</h2>
            <p className="mt-3 text-muted">Lokasi operasional kami di berbagai wilayah.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PORTFOLIO_IMAGES.map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden aspect-video bg-slate/10 shadow-card hover:shadow-dropdown transition-all">
                <img src={src} alt={`Portofolio lokasi ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-canvas" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="faq-heading" className="text-3xl font-bold text-ink">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-surface rounded-xl border border-border overflow-hidden">
                <button
                  id={`faq-toggle-${i}`}
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                  aria-expanded={faqOpen === i}
                >
                  <span className="font-medium text-ink text-sm">{faq.q}</span>
                  <span className={`text-muted transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} aria-hidden>▾</span>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4 text-sm text-muted border-t border-border pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="text-primary-red font-medium text-sm hover:underline">
              Lihat semua FAQ →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-red" aria-labelledby="cta-heading">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-3xl font-bold text-white mb-4">
            Siap Bermitra dengan PT. BARAK?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Konsultasikan kebutuhan outsourcing bisnis Anda dengan tim profesional kami.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              id="cta-contact-btn"
              className="px-8 py-3.5 bg-white text-primary-red font-bold rounded-xl hover:bg-canvas transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Hubungi Kami
            </Link>
            <Link
              to="/layanan"
              id="cta-services-btn"
              className="px-8 py-3.5 bg-transparent text-white font-bold rounded-xl border-2 border-white/50 hover:border-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Lihat Layanan
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
