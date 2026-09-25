import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import { REAL_CLIENTS } from '@/constants/business';
import { Building2, Briefcase, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const PORTFOLIO_PROJECTS = [
  {
    id: 'PRJ-01',
    title: 'Pergudangan Salembaran 99 Blok A-D',
    client: 'SALEMBARAN 99',
    category: 'Logistik & Pergudangan',
    location: 'Kosambi, Tangerang, Banten',
    services: ['Jasa Pengamanan / Security', 'Loss Prevention', 'Patroli 24 Jam'],
    personnel: '18 Personel Aktif',
    image: '/assets/img/portfolio/salembaran.jpg',
    description: 'Penyelenggaraan sistem keamanan perimeter terpadu, kontrol akses keluar masuk truk kontainer, serta mitigasi risiko kehilangan barang logistik.',
  },
  {
    id: 'PRJ-02',
    title: 'Kawasan Bisnis & Niaga Bona City',
    client: 'BONA CITY',
    category: 'Commercial & Area Bisnis',
    location: 'Cikokol, Kota Tangerang',
    services: ['Jasa Pengamanan / Security', 'Manajemen Parkir & Valet', 'Cleaning Service'],
    personnel: '24 Personel Aktif',
    image: '/assets/img/portfolio/bonacity.jpg',
    description: 'Manajemen fasilitas operasional harian terpadu mencakup keamanan ruko komersial, ticketing sistem parkir otomatis, dan kebersihan public area.',
  },
  {
    id: 'PRJ-03',
    title: 'Central Hub Drop Point J&T Logistik',
    client: 'JNT LOGISTIK',
    category: 'Ekspedisi & Kurir',
    location: 'Jakarta Barat & Tangerang',
    services: ['Ekspedisi Kurir', 'Handling COD', 'Man Power Operasional'],
    personnel: '35+ Kurir & Staff',
    image: '/assets/img/portfolio/gudang-logistik.jpg',
    description: 'Dukungan armada kurir profesional dan staf sortir drop point untuk memastikan ketepatan waktu pengiriman dan rekonsiliasi kas COD tanpa selisih.',
  },
  {
    id: 'PRJ-04',
    title: 'Pusat Distribusi Logistik Pasar Kemis',
    client: 'PT SURYA DUNIA EXPRESS',
    category: 'Distribusi & Supply Chain',
    location: 'Pasar Kemis, Kab. Tangerang',
    services: ['Jasa Pengamanan', 'Man Power Gudang', 'Pengawasan CCTV'],
    personnel: '15 Personel Aktif',
    image: '/assets/img/portfolio/pasar-kemis.jpg',
    description: 'Pengamanan pos jaga utama, pemeriksaan muatan armada distribusi, serta penyediaan tenaga kerja bongkar muat bersertifikasi.',
  },
  {
    id: 'PRJ-05',
    title: 'Area Pergudangan Kavling Kenanga',
    client: 'MAHARDIKA JAYA LOGISTIK',
    category: 'Kawasan Komersial & Depo',
    location: 'Cipondoh, Tangerang',
    services: ['Security 24 Jam', 'Loss Prevention', 'Cleaning Service'],
    personnel: '12 Personel Aktif',
    image: '/assets/img/portfolio/kavlingkenanga.jpeg',
    description: 'Pengamanan fasilitas penyimpanan material bernilai tinggi dengan implementasi checkpoint digital barcode dan audit berkala.',
  },
  {
    id: 'PRJ-06',
    title: 'Kantor Pusat & Fasilitas Pelayanan',
    client: 'MEGAH JAYA SEMESTA',
    category: 'Corporate Office',
    location: 'Jabodetabek',
    services: ['Frontline Security', 'Resepsionis', 'Facility Care'],
    personnel: '10 Personel Aktif',
    image: '/assets/img/portfolio/pusat.jpg',
    description: 'Layanan standar korporat dengan personel berseragam rapi, bersertifikat Gada Pratama, serta mengedepankan etika pelayanan prima H A P P Y.',
  },
];

export default function ClientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'portfolio' ? 'portfolio' : 'klien';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'portfolio') {
      setActiveTab('portfolio');
    } else {
      setActiveTab('klien');
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'portfolio' ? { tab: 'portfolio' } : {});
  };

  const byType = REAL_CLIENTS.reduce((acc, c) => {
    (acc[c.type] = acc[c.type] || []).push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <main className="pt-16">
        {/* Hero Header */}
        <section className="bg-ink text-white py-20">
          <div className="w-full px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
            <nav className="flex justify-center items-center gap-2 text-xs uppercase tracking-wider text-white/60 mb-3">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-primary-red font-semibold">Klien & Portofolio</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              {activeTab === 'portfolio' ? 'Portofolio Proyek Klien' : 'Klien & Mitra Kami'}
            </h1>
            <div className="w-16 h-1 bg-primary-red mx-auto mb-4 rounded-full" />
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Dipercaya oleh puluhan korporasi, kawasan industri, dan jaringan ekspedisi logistik terkemuka di Jabodetabek & Banten.
            </p>

            {/* Tab switchers */}
            <div className="mt-8 inline-flex p-1 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/60 shadow-lg">
              <button
                type="button"
                onClick={() => handleTabChange('klien')}
                className={clsx(
                  'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  activeTab === 'klien'
                    ? 'bg-primary-red text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <Building2 className="w-4 h-4" />
                <span>Klien Kami ({REAL_CLIENTS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('portfolio')}
                className={clsx(
                  'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  activeTab === 'portfolio'
                    ? 'bg-primary-red text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <Briefcase className="w-4 h-4" />
                <span>Portofolio Klien ({PORTFOLIO_PROJECTS.length})</span>
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-14">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {activeTab === 'klien' ? (
              <div className="space-y-12">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Daftar Mitra & Klien Aktif</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Hubungan kemitraan jangka panjang berlandaskan integritas, transparansi operasional, dan kepatuhan SLA.
                  </p>
                </div>

                {Object.entries(byType).map(([type, clients]) => (
                  <div key={type} className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
                      <div className="w-3 h-3 rounded-full bg-accent-green" />
                      <h3 className="text-lg font-bold text-slate-800">
                        Kategori: {type} ({clients.length} Klien)
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {clients.map((c) => (
                        <div
                          key={c.id}
                          className="group p-4 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/60 hover:border-accent-green hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                                {c.id}
                              </span>
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                            <p className="font-bold text-slate-900 text-sm group-hover:text-primary-red transition-colors line-clamp-2">
                              {c.name}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200/40 text-[11px] text-slate-500 flex items-center justify-between">
                            <span>{c.type}</span>
                            <span className="text-emerald-600 font-semibold">Aktif</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <h2 className="text-2xl font-bold text-slate-900">Studi Kasus & Penempatan Proyek</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Dokumentasi nyata operasional dan implementasi solusi tenaga kerja PT. BARAK di berbagai lokasi mitra.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {PORTFOLIO_PROJECTS.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-900">
                        <img
                          src={proj.image}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                        <div className="absolute top-3 left-3 bg-primary-red/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          {proj.category}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-xs text-white/80 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-accent-green" />
                            {proj.location}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                            {proj.client}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-red transition-colors">
                            {proj.title}
                          </h3>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                            {proj.description}
                          </p>
                        </div>

                        <div>
                          <div className="border-t border-slate-100 pt-3 mb-4">
                            <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                              Layanan Diberikan:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {proj.services.map((s) => (
                                <span
                                  key={s}
                                  className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1"
                                >
                                  <ShieldCheck className="w-3 h-3 text-accent-green" />
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{proj.personnel}</span>
                            <Link
                              to="/contact"
                              className="text-primary-red font-semibold hover:text-red-800 flex items-center gap-0.5"
                            >
                              Konsultasi Solusi <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
