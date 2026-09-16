import React from 'react';
import {
  ShieldCheck,
  Truck,
  Users,
  Sparkles,
  Car,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  CalendarCheck
} from 'lucide-react';

export function ServicesSection({ onSelectService }) {
  const services = [
    {
      id: 'security',
      title: 'Pengamanan (Security)',
      image: '/assets/img/services/security.png',
      icon: ShieldCheck,
      iconBg: 'bg-red-50 text-brand-red border-red-100',
      description:
        'Layanan keamanan komprehensif dengan personel bersertifikat, sistem pengawasan modern, dan protokol keamanan terstandar.',
      points: [
        'Satpam bersertifikat garda utama',
        'Sistem CCTV & monitoring',
        'Pengamanan event & properti'
      ]
    },
    {
      id: 'kurir',
      title: 'Ekspedisi Kurir',
      image: '/assets/img/services/kurir.png',
      icon: Truck,
      iconBg: 'bg-amber-50 text-brand-red border-amber-100',
      description:
        'Layanan pengiriman barang yang cepat, aman, dan terpercaya dengan jaringan luas dan sistem tracking real-time.',
      points: [
        'Pengiriman lokal & nasional',
        'Tracking real-time',
        'Layanan express & reguler'
      ]
    },
    {
      id: 'man-power',
      title: 'Man Power',
      image: '/assets/img/services/man-power.jpg',
      icon: Users,
      iconBg: 'bg-emerald-50 text-brand-green border-emerald-100',
      description:
        'Penyediaan tenaga kerja profesional untuk berbagai kebutuhan industri dengan sistem seleksi dan pelatihan yang ketat.',
      points: [
        'Tenaga kerja terampil',
        'Staff administrasi & operasional',
        'Outsourcing tenaga kerja'
      ]
    },
    {
      id: 'cleaning-service',
      title: 'Cleaning Service',
      image: '/assets/img/services/cleaning-service.png',
      icon: Sparkles,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      description:
        'Layanan kebersihan profesional untuk kantor, gedung, mall, dan properti komersial dengan standar kebersihan tinggi.',
      points: [
        'Cleaning harian & berkala',
        'Deep cleaning & spesialis',
        'Pengelolaan sampah'
      ]
    },
    {
      id: 'parkir',
      title: 'Parkir',
      image: '/assets/img/services/parkir.png',
      icon: Car,
      iconBg: 'bg-red-50 text-brand-red border-red-100',
      description:
        'Manajemen dan operasional area parkir dengan sistem terintegrasi untuk efisiensi dan keamanan kendaraan.',
      points: [
        'Manajemen parkir gedung',
        'Sistem ticketing & payment',
        'Valet parking service'
      ]
    },
    {
      id: 'loss-prevention',
      title: 'Loss Prevention',
      image: '/assets/img/services/loss-prevention.png',
      icon: ShieldAlert,
      iconBg: 'bg-emerald-50 text-brand-green border-emerald-100',
      description:
        'Sistem pencegahan kerugian dengan pengawasan ketat, audit internal, dan prosedur keamanan untuk minimalkan risiko.',
      points: [
        'Risk assessment & audit',
        'Pencegahan penyusupan',
        'Monitoring aset & inventori'
      ]
    }
  ];

  const handleConsultationClick = (serviceTitle) => {
    if (onSelectService) {
      onSelectService(serviceTitle);
    } else {
      const contactEl = document.getElementById('kontak');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="layanan" className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4 tracking-tight">
            Layanan <span className="text-brand-red">Kami</span>
          </h2>
          <div className="w-20 h-1 bg-brand-red mx-auto mb-6 rounded-full"></div>
          <p className="text-slate-600 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            Kami menyediakan 6 layanan terintegrasi untuk mendukung operasional bisnis Anda dengan standar profesional tertinggi.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-slate-200/80 hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group"
              >
                <div>
                  {/* Service Image */}
                  <div className="h-52 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={srv.image}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7">
                    {/* Icon + Title Header */}
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 border ${srv.iconBg} flex-shrink-0 shadow-sm`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand-red transition-colors">
                        {srv.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {srv.description}
                    </p>

                    {/* Bullet Points */}
                    <ul className="space-y-2.5 mb-6">
                      {srv.points.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-center text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mr-3" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="px-6 pb-6 pt-0 sm:px-7 sm:pb-7">
                  <a
                    href="#kontak"
                    onClick={(e) => {
                      e.preventDefault();
                      handleConsultationClick(srv.title);
                    }}
                    className="text-brand-red font-bold hover:text-brand-red-dark inline-flex items-center text-sm group/btn transition-colors"
                  >
                    <span>Konsultasi Sekarang</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1.5 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action Banner */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-r from-brand-red to-brand-red-dark rounded-2xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-4 tracking-tight">
              Butuh Solusi Terintegrasi untuk Bisnis Anda?
            </h3>
            <p className="text-white/90 mb-8 text-sm sm:text-base leading-relaxed">
              Tim profesional kami siap membantu mengoptimalkan operasional bisnis Anda dengan layanan keamanan, logistik, dan manajemen yang terpercaya.
            </p>
            <a
              href="#kontak"
              onClick={(e) => {
                e.preventDefault();
                handleConsultationClick('Konsultasi Solusi Terintegrasi');
              }}
              className="inline-flex items-center gap-2 bg-white text-brand-red hover:bg-slate-100 font-bold py-3.5 px-8 rounded-btn shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 text-sm sm:text-base"
            >
              <CalendarCheck className="w-5 h-5 text-brand-red" />
              <span>Jadwalkan Konsultasi</span>
            </a>
          </div>

          {/* Subtle Decorative Background Accents */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-brand-yellow/20 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
