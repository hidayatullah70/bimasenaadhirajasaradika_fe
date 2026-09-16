import React, { useState } from 'react';
import { Users, Calendar, Building, ChevronRight } from 'lucide-react';

export function ClientsSection() {
  const [activeFilter, setActiveFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: 'JNT LOGISTIK',
      badge: 'JNT EXPRESS',
      badgeColor: 'bg-brand-red text-white',
      category: 'industrial',
      image: '/assets/img/portfolio/pusat.jpg',
      description: 'Layanan kurir, man power untuk PIC dan admin untuk pergudangan.',
      headcount: '180+ Personel',
      period: '2024 - Sekarang'
    },
    {
      id: 2,
      title: 'PT SURYA DUNIA EXPRESS',
      badge: 'KAVLING KENANGA',
      badgeColor: 'bg-brand-red text-white',
      category: 'industrial',
      image: '/assets/img/portfolio/kavlingkenanga.jpeg',
      description: 'Layanan kurir, man power untuk PIC dan admin, transporter, processing dan security yang sangat di butuh kan untuk kebutuhan gudang.',
      headcount: '200+ Personel',
      period: '2024 - Sekarang'
    },
    {
      id: 3,
      title: 'MEGAH JAYA SEMESTA',
      badge: 'ANGKASA NEW',
      badgeColor: 'bg-brand-green text-white',
      category: 'industrial',
      image: '/assets/img/portfolio/gudang-logistik.jpg',
      description: 'Penyediaan layanan Manpower pada gudang angkasa new dengan bagian processing, transporter, sprinter, admin dan security.',
      headcount: '250+ Personel',
      period: '2024 - Sekarang'
    },
    {
      id: 4,
      title: 'MAHARDIKA JAYA LOGISTIK',
      badge: 'PASAR KEMIS',
      badgeColor: 'bg-brand-red text-white',
      category: 'industrial',
      image: '/assets/img/portfolio/pasar-kemis.jpg',
      description: 'Layanan manpower pada PT MAHARDIKA JAYA LOGISTIK kita memberikan posisi Supervisor, Koordinator, Admin, Processing, Transporter, Sprinter dan Security.',
      headcount: '300+ Personel',
      period: '2024 - Sekarang'
    },
    {
      id: 5,
      title: 'SALEMBARAN 99',
      badge: 'SALEMBARAN 99',
      badgeColor: 'bg-brand-yellow-dark text-brand-dark',
      category: 'office',
      image: '/assets/img/portfolio/salembaran.jpg',
      description: 'Layanan yang kita berikan kepada salembaran 99 kita mensupport posisi Supervisor, Koordinator, Admin, Processing, Transporter, Sprinter dan juga security.',
      headcount: '350+ Personel',
      period: '2024 - Sekarang'
    },
    {
      id: 6,
      title: 'BONA CITY',
      badge: 'BONA CITY',
      badgeColor: 'bg-brand-green text-white',
      category: 'industrial',
      image: '/assets/img/portfolio/bonacity.jpg',
      description: 'Layanan keamanan gudang, man power untuk staf logistik, transporter, processing, admin, koordinator dan kita memberikan layanan security untuk keamanan gudang.',
      headcount: '200+ Personel',
      period: '2024 - Sekarang'
    }
  ];

  const clientLogos = [
    'GERAJA ABBHALOVE',
    'DROP POINT PAKOJAN',
    'DROP POINT KIBIN',
    'DROP POINT PASGAD',
    'DROP POINT JATIUWUNG',
    'DROP POINT WANAKERTA',
    'DROP POINT BATU CEPER',
    'DROP POINT PINANG CIPONDOH',
    'DROP POINT CIBODAH RAYA',
    'DROP POINT PANONGAN',
    'DROP POINT PIK 2',
    'DROP POINT KELAPA DUA'
  ];

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="klien" className="py-20 sm:py-24 bg-white border-b border-slate-200 scroll-mt-20">
      <div id="portfolio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4 tracking-tight">
            Klien & Proyek <span className="text-brand-red">Kami</span>
          </h2>
          <div className="w-20 h-1 bg-brand-red mx-auto mb-6 rounded-full"></div>
          <p className="text-slate-600 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            Telah dipercaya oleh berbagai perusahaan ternama dalam penyediaan layanan keamanan dan jasa terintegrasi.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeFilter === 'all'
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Klien & Proyek
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('industrial')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeFilter === 'industrial'
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Logistik & Industri
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('office')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeFilter === 'office'
                ? 'bg-brand-red text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pusat Distribusi & Pergudangan
          </button>
        </div>

        {/* Portfolio / Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-slate-200/80 hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              <div>
                {/* Project Image & Badge */}
                <div className="h-64 overflow-hidden relative bg-slate-100">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${project.badgeColor}`}>
                      {project.badge}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7">
                  <h3 className="text-xl font-bold text-brand-dark mb-3 group-hover:text-brand-red transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="px-6 pb-6 pt-0 sm:px-7 sm:pb-7 border-t border-slate-100 mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-4 h-4 text-brand-red" />
                  <span>{project.headcount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="w-4 h-4 text-brand-green" />
                  <span>{project.period}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Client Logos / Drop Points */}
        <div className="mt-20 pt-16 border-t border-slate-200">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-brand-dark mb-3 tracking-tight">
            Klien yang Mempercayai Kami
          </h3>
          <div className="w-16 h-1 bg-brand-red mx-auto mb-10 rounded-full"></div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
            {clientLogos.map((client, cIdx) => (
              <div
                key={cIdx}
                className="bg-slate-50 hover:bg-white p-5 rounded-xl border border-slate-200/80 hover:border-brand-red/40 hover:shadow-md transition-all duration-200 flex items-center justify-center text-center min-h-[90px] group"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400 group-hover:text-brand-red transition-colors flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-brand-dark transition-colors tracking-wide">
                    {client}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
