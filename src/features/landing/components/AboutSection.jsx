import React, { useState } from 'react';
import {
  CheckCircle2,
  Scale,
  RefreshCw,
  UserCheck,
  HeartHandshake,
  Headphones,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function AboutSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 6 members combining Direksi & Tim Operasional
  const teamMembers = [
    {
      id: 1,
      name: 'Juli Priyanto',
      position: 'Direktur Utama',
      image: '/assets/img/team/person-3.jpeg'
    },
    {
      id: 2,
      name: 'Hendri Nopamin',
      position: 'Direktur Operasional',
      image: '/assets/img/team/person-2.jpeg'
    },
    {
      id: 3,
      name: 'Zaenal Arifin',
      position: 'Direktur HC',
      image: '/assets/img/team/person-4.jpeg'
    },
    {
      id: 4,
      name: 'Gheril Ramaditya S',
      position: 'IT Support',
      image: '/assets/img/team/person-5.jpeg'
    },
    {
      id: 5,
      name: 'Nazi Rinaldi',
      position: 'Finance & Accountant Manager',
      image: '/assets/img/team/nazi.jpg'
    },
    {
      id: 6,
      name: 'Robyn Topani, S.H.',
      position: 'Legal & Support',
      image: '/assets/img/team/person-7.jpeg'
    }
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % teamMembers.length);
  };

  // 3D Carousel offset calculations matching the logic:
  // offset 0: center, 1: right-1, 2: right-2, length-1: left-1, length-2: left-2, other: hidden
  const getCardStyle = (offset) => {
    if (offset === 0) {
      return 'translate-x-0 scale-100 z-30 opacity-100 shadow-2xl brightness-100 cursor-default ring-2 ring-white/80';
    } else if (offset === 1) {
      return 'translate-x-[46%] sm:translate-x-[62%] md:translate-x-[72%] scale-[0.84] z-20 opacity-80 shadow-xl brightness-90 cursor-pointer hover:brightness-100';
    } else if (offset === 2) {
      return 'translate-x-[85%] sm:translate-x-[114%] md:translate-x-[130%] scale-[0.68] z-10 opacity-45 shadow-md brightness-75 cursor-pointer hover:opacity-75';
    } else if (offset === teamMembers.length - 1) {
      return '-translate-x-[46%] sm:-translate-x-[62%] md:-translate-x-[72%] scale-[0.84] z-20 opacity-80 shadow-xl brightness-90 cursor-pointer hover:brightness-100';
    } else if (offset === teamMembers.length - 2) {
      return '-translate-x-[85%] sm:-translate-x-[114%] md:-translate-x-[130%] scale-[0.68] z-10 opacity-45 shadow-md brightness-75 cursor-pointer hover:opacity-75';
    } else {
      return 'translate-x-0 scale-50 z-0 opacity-0 pointer-events-none hidden';
    }
  };

  const happyValues = [
    {
      title: 'Honesty',
      desc: 'Bertindak jujur, tulus, menjunjung tinggi etika dan integritas serta memegang teguh kepercayaan yang diberikan.',
      icon: Scale,
      color: 'text-brand-red',
      bg: 'bg-red-50'
    },
    {
      title: 'Adaptability',
      desc: 'Bekerja dengan antusias dan menunjukkan komitmen untuk menjadi yang terbaik dalam setiap pekerjaan baik secara individu maupun kelompok.',
      icon: RefreshCw,
      color: 'text-brand-yellow-dark',
      bg: 'bg-amber-50'
    },
    {
      title: 'Profesionalism',
      desc: 'Bekerja dengan sepenuh hati dan disiplin, berorientasi pada pelayanan prima guna mencapai hasil maksimal sesuai dengan wewenang, tanggung jawab, aturan, keteladanan, norma dan etika profesi.',
      icon: UserCheck,
      color: 'text-brand-green',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Polite',
      desc: 'Konsistensi dalam bekerja dengan senantiasa menunjukkan sikap santun, saling menghormati dan menghargai.',
      icon: HeartHandshake,
      color: 'text-brand-red',
      bg: 'bg-red-50'
    },
    {
      title: 'Customer Centrity',
      desc: 'Bekerja dengan senantiasa fokus pada kebutuhan pelanggan, proaktif untuk memberikan pelayanan yang bernilai tambah, mengembangkan dan mempertahankan hubungan baik dengan pelanggan eksternal maupun internal.',
      icon: Headphones,
      color: 'text-brand-yellow-dark',
      bg: 'bg-amber-50'
    }
  ];

  const missionPoints = [
    'Mengelola dan mengembangkan potensi tenaga kerja / SDM dengan mengutamakan penyelenggaraan usaha yang tetap memperhatikan harkat, martabat manusia.',
    'Mengelola dan mengembangkan pelayanan Alih Daya sebagai salah satu solusi terciptanya kenyamanan hubungan industrial di perusahaan mitra.',
    'Memberikan konsep solusi yang cepat dan tepat, untuk memberikan pelayanan yang prima demi kepuasan kepada para pengguna jasa.',
    'Membantu peran pemerintah dalam mengurangi pengangguran.',
    'Mensupport perusahaan mitra agar tumbuh dan berkembang sehingga dapat berakibat pada penambahan tenaga kerja.'
  ];

  return (
    <section id="tentang" className="py-20 bg-white border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header: Tentang PT. BARAK */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-3 tracking-tight">
            Tentang <span className="text-brand-red">PT. BARAK</span>
          </h2>
          <div className="w-20 h-1 bg-brand-red mx-auto mb-6 rounded-full"></div>

          <div className="space-y-4 max-w-4xl mx-auto text-slate-600 text-sm sm:text-base leading-relaxed">
            <p>
              <strong className="text-brand-dark">PT. BIMASENA ADHIRAJASA RADHIKA (BARAK)</strong> adalah sebuah organisasi yang dibentuk khusus sebagai wadah pengembangan SDM yang memiliki standar kualitas yang mampu bersaing sesuai kebutuhan dan tantangan ke depan, memberikan kontribusi dan rasa nyaman di lingkungan kerja.
            </p>
            <p>
              <strong className="text-brand-dark">PT. BIMASENA ADHIRAJASA RADHIKA (BARAK)</strong> memiliki tenaga pengembang dan profesional yang telah berpengalaman dibidangnya selama lebih dari 5 tahun. dengan semangat yang tinggi untuk menjadi bagian dari solusi kebutuhan SDM yang berkualitas dan menjadi mitra kerja/vendor yang dapat diandalkan, menjadi solusi yang tepat bagi perusahaan mitra kerja di manapun berada.
            </p>
          </div>
        </div>

        {/* Visual & Visi Misi Container */}
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-24">
          {/* Left: Office Image with 5+ Tahun Pengalaman Badge */}
          <div className="lg:w-1/2 w-full">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src="/assets/img/hero/barak1.png"
                  alt="Kantor Operasional PT. Bhimasena Adhirajasa Radhika"
                  className="w-full h-auto object-cover max-h-[460px]"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-brand-red text-white p-4 sm:p-5 rounded-2xl shadow-xl hidden md:block border-2 border-white">
                <div className="text-2xl sm:text-3xl text-center font-black text-brand-yellow">5+</div>
                <div className="text-xs sm:text-sm text-center font-semibold whitespace-nowrap">Tahun Pengalaman</div>
              </div>
            </div>
          </div>

          {/* Right: Visi & Misi */}
          <div className="lg:w-1/2 w-full space-y-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-dark text-center lg:text-left tracking-tight">
              Visi & Misi Perusahaan
            </h3>

            {/* Visi */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-base font-bold text-brand-red mb-2 uppercase tracking-wider">Visi</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Menjadi perusahaan yang mempunyai nilai tambah sehingga lebih unggul dan terdepan dalam memberikan pelayanan sebagai solusi pengembangan dan pengelolaan tenaga kerja / SDM guna mendukung meningkatkan produktivitas di perusahaan mitra serta menjadi perusahaan Alih Daya dengan pelayanan manajemen yang transparan, bertanggung jawab, jujur dan terpercaya.
              </p>
            </div>

            {/* Misi */}
            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-base font-bold text-brand-red uppercase tracking-wider">Misi</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  {missionPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3 Quick Stats from Website */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-100 rounded-xl p-3 sm:p-4 text-center border border-slate-200/70">
                <div className="text-xl sm:text-2xl font-black text-brand-red mb-0.5">1000+</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-600">Personel Aktif</div>
              </div>
              <div className="bg-slate-100 rounded-xl p-3 sm:p-4 text-center border border-slate-200/70">
                <div className="text-xl sm:text-2xl font-black text-brand-red mb-0.5">100+</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-600">Klien Puas</div>
              </div>
              <div className="bg-slate-100 rounded-xl p-3 sm:p-4 text-center border border-slate-200/70">
                <div className="text-xl sm:text-2xl font-black text-brand-red mb-0.5">6</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-600">Layanan Unggulan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Budaya Kerja: "H A P P Y" */}
        <div className="mt-20 pt-16 border-t border-slate-200">
          <div className="text-center mb-12">
            <h3 className="text-xl sm:text-2xl font-bold text-brand-dark mb-1">Budaya Kerja :</h3>
            <h4 className="text-3xl sm:text-4xl font-extrabold text-brand-red tracking-wider">"H A P P Y"</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {happyValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col items-center text-center"
                >
                  <div className={`w-14 h-14 ${val.bg} rounded-full flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${val.color}`} />
                  </div>
                  <h5 className="text-base font-bold text-brand-red mb-2">{val.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3D CAROUSEL SECTION: OUR TEAM (Direksi & Tim Operasional - 6 Foto) */}
        <div className="mt-24 pt-16 border-t border-slate-200">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-5xl font-black text-brand-dark tracking-wider uppercase mb-2">
              OUR TEAM
            </h3>
            <div className="w-16 h-1 bg-brand-red mx-auto rounded-full mb-3"></div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold uppercase tracking-wider">
              Direksi & Tim Operasional PT. Bhimasena Adhirajasa Radhika
            </p>
          </div>

          {/* 3D Carousel Container */}
          <div className="relative w-full max-w-5xl mx-auto h-[290px] sm:h-[350px] md:h-[420px] flex items-center justify-center [perspective:1000px] select-none">
            {/* Nav Arrow Left */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 md:left-6 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 shadow-xl border border-slate-200 text-brand-dark hover:bg-brand-red hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none"
              aria-label="Previous team member"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Carousel Cards Track */}
            <div className="relative w-48 h-64 sm:w-56 sm:h-80 md:w-64 md:h-92 flex items-center justify-center">
              {teamMembers.map((member, i) => {
                const offset = (i - currentIndex + teamMembers.length) % teamMembers.length;
                return (
                  <div
                    key={member.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`absolute top-0 w-48 h-64 sm:w-56 sm:h-80 md:w-64 md:h-92 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 transition-all duration-500 ease-out select-none ${getCardStyle(offset)}`}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top pointer-events-none"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                );
              })}
            </div>

            {/* Nav Arrow Right */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-4 md:right-6 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 shadow-xl border border-slate-200 text-brand-dark hover:bg-brand-red hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none"
              aria-label="Next team member"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Member Info: Name and Role as shown in attached design */}
          <div className="mt-8 text-center">
            <h4
              key={teamMembers[currentIndex].name}
              className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight animate-in fade-in zoom-in-95 duration-300"
            >
              {teamMembers[currentIndex].name}
            </h4>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="w-8 h-[2px] bg-slate-300"></span>
              <p
                key={teamMembers[currentIndex].position}
                className="text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-red animate-in fade-in duration-300"
              >
                {teamMembers[currentIndex].position}
              </p>
              <span className="w-8 h-[2px] bg-slate-300"></span>
            </div>
          </div>

          {/* Dots Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {teamMembers.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${idx === currentIndex
                  ? 'w-7 h-2.5 bg-brand-red'
                  : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Statistik Tim Section */}
        <div className="mt-20 bg-slate-50 rounded-2xl p-8 border border-slate-200">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-brand-red mb-8">Statistik Tim</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-brand-red mb-1">45+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600">Total Team</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-brand-red mb-1">3</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600">Management</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-brand-red mb-1">25+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600">Certifications</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-brand-red mb-1">8.5+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600">Avg. Experience</div>
            </div>
          </div>
        </div>

        {/* Company Profile Download Section - Compact & Responsive */}
        <div className="mt-8 sm:mt-10 max-w-xl mx-auto px-2 sm:px-0">
          <div className="bg-gradient-to-r from-brand-red to-brand-red-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-red-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                <FileText className="w-5 h-5 text-brand-yellow" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Company Profile PT. BARAK
                </h4>
                <p className="text-[11px] sm:text-xs text-white/85 leading-snug mt-0.5">
                  Profil resmi, legalitas, struktur tim & portofolio layanan.
                </p>
              </div>
            </div>

            <a
              href="/assets/documents/company-profile-barak.pdf"
              download="Company-Profile-PT-BARAK.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 bg-brand-yellow text-brand-dark font-bold text-xs rounded-lg shadow-md hover:bg-yellow-400 transition-all active:scale-95 whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
