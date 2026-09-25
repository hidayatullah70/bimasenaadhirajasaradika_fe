import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  Truck,
  ParkingCircle,
  Sparkles,
  Users,
  Eye,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Award,
  ChevronRight,
} from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import { SERVICE_TYPES } from '@/constants/business';
import clsx from 'clsx';

const SERVICE_ICONS = {
  security: Shield,
  kurir: Truck,
  parkir: ParkingCircle,
  'cleaning-service': Sparkles,
  'man-power': Users,
  'loss-prevention': Eye,
};

const SERVICE_DATA = {
  security: {
    icon: Shield,
    img: '/assets/img/services/security.png',
    title: 'Jasa Pengamanan / Security',
    tagline: 'Solusi Keamanan Fisik & Elektronik Terpadu 24/7',
    desc: 'Hadir sebagai mitra terpercaya, kami menyediakan personel satpam terlatih berijazah resmi Mabes Polri (Gada Pratama / Madya) dengan integritas tinggi. Kami mengombinasikan kesiapsiagaan personel di pos jaga, patroli rutin terjadwal, dan sistem pengawasan checkpoint digital untuk menjaga aset dan ketertiban fasilitas bisnis Anda.',
    scope: [
      'Penjagaan pos gerbang utama, lobi, dan area perimeter 24 jam.',
      'Pemeriksaan keluar-masuk kendaraan, tamu, dan barang bawaan.',
      'Patroli pos berkala dengan sistem digital barcode checkpoint.',
      'Koordinasi dan respons cepat terhadap situasi darurat dengan aparat kepolisian setempat.',
    ],
    features: [
      'Satpam bersertifikat resmi Gada Pratama / Madya',
      'Pembinaan fisik, mental, & etika pelayanan prima H A P P Y',
      'Supervisi lapangan 24 jam oleh Komandan Regu (Danru) & Korlap',
      'Jaminan penggantian personel (replacement) instan jika berhalangan',
    ],
  },
  kurir: {
    icon: Truck,
    img: '/assets/img/services/kurir.png',
    title: 'Ekspedisi Kurir',
    tagline: 'Armada Pengantaran Cepat, Tepat, & Pengelolaan COD Transparan',
    desc: 'Layanan armada kurir profesional roda dua dan roda empat untuk mendukung operasional logistik e-commerce dan distribusi ritel. Dilengkapi keahlian penanganan barang bernilai tinggi serta kepatuhan ketat rekonsiliasi kas Cash-on-Delivery (COD) yang diawasi langsung melalui sistem IOMS kami.',
    scope: [
      'Pengantaran paket Last-Mile delivery tepat waktu ke pelanggan.',
      'Penjemputan (pick up) berkala dari drop point dan gudang klien.',
      'Pengelolaan dan serah terima setoran kas COD secara harian.',
      'Pemeriksaan kelayakan armada dan kepatuhan keselamatan berkendara.',
    ],
    features: [
      'Kurir berpengalaman dengan pemahaman rute area luas',
      'SOP penanganan dan rekonsiliasi COD zero-defect',
      'Pemeriksaan latar belakang (background check) & SKCK aktif',
      'Didukung sistem monitoring status pengiriman dan absensi real-time',
    ],
  },
  parkir: {
    icon: ParkingCircle,
    img: '/assets/img/services/parkir.png',
    title: 'Parkir',
    tagline: 'Manajemen Tata Kelola Lahan Parkir Modern & Akuntabel',
    desc: 'Pengelolaan sistem perparkiran komersial untuk gedung perkantoran, pusat perbelanjaan, rumah sakit, dan kawasan niaga. Menghadirkan petugas tiket ramah, pengatur sirkulasi kendaraan yang sigap, serta sistem pelaporan pendapatan parkir yang transparan.',
    scope: [
      'Pengaturan alur sirkulasi lalu lintas dan penataan kendaraan di slot parkir.',
      'Pelayanan loket karcis masuk/keluar serta sistem pembayaran tunai & non-tunai.',
      'Pengawasan keamanan helm, barang bawaan, dan pencegahan curanmor.',
      'Audit pendapatan harian dan pemeliharaan palang gerbang otomatis.',
    ],
    features: [
      'Petugas parkir ramah dengan standar keramahan prima',
      'Penataan slot kendaraan teratur dan efisien',
      'Sistem pelaporan kendaraan dan pengawasan CCTV area parkir',
      'Kemitraan fleksibel dengan skema bagi hasil atau manajemen fee',
    ],
  },
  'cleaning-service': {
    icon: Sparkles,
    img: '/assets/img/services/cleaning-service.png',
    title: 'Cleaning Service',
    tagline: 'Standar Kebersihan & Sanitasi Higienis untuk Fasilitas Anda',
    desc: 'Layanan perawatan kebersihan fasilitas gedung, perkantoran, gudang industri, dan area publik. Menggunakan peralatan modern, bahan pembersih ramah lingkungan (eco-friendly), serta tenaga cleaning crew yang teliti dan disiplin menjaga higienitas lingkungan kerja Anda.',
    scope: [
      'Pembersihan harian ruang kantor, koridor, toilet, dan kaca jendela.',
      'Sanitasi berkala dan disinfeksi area dengan intensitas sentuhan tinggi.',
      'Perawatan lantai khusus (polishing, scrubbing, dan kristalisasi marmer/keramik).',
      'Pengelolaan pembuangan limbah domestik sesuai standar kebersihan.',
    ],
    features: [
      'Cleaning crew terlatih dan menggunakan seragam rapi & APD lengkap',
      'Dukungan mesin pembersih modern (scrubber, polisher, vacuum HEPA)',
      'Jadwal kerja fleksibel (sebelum jam kerja, operasional, atau shift malam)',
      'Pengawasan berkala oleh Supervisor Kebersihan bersertifikasi',
    ],
  },
  'man-power': {
    icon: Users,
    img: '/assets/img/services/man-power.jpg',
    title: 'Man Power',
    tagline: 'Penyedia Tenaga Kerja Terampil Siap Kerja Sesuai Kebutuhan',
    desc: 'Penyediaan dan pengelolaan tenaga kerja alih daya (outsourcing) untuk berbagai posisi fungsional, seperti staf administrasi, resepsionis, operator gudang, helper, dan teknisi. Kami mengelola seluruh proses rekrutmen, payroll, BPJS, hingga pembinaan kinerja.',
    scope: [
      'Perekrutan, seleksi kualifikasi ketat, dan uji keterampilan kerja.',
      'Pengelolaan administrasi kontrak kerja, penggajian, dan perpajakan (PPh 21).',
      'Pendaftaran dan pemrosesan klaim BPJS Ketenagakerjaan & Kesehatan.',
      'Manajemen kedisiplinan dan program peningkatan produktivitas SDM.',
    ],
    features: [
      'Database talenta siap kerja dengan waktu onboarding cepat',
      'Bebas dari beban administrasi personalia dan mitigasi sengketa ketenagakerjaan',
      'Kepatuhan 100% pada regulasi upah minimum dan ketenagakerjaan RI',
      'Evaluasi kinerja berkala bersama perwakilan manajemen klien',
    ],
  },
  'loss-prevention': {
    icon: Eye,
    img: '/assets/img/services/loss-prevention.png',
    title: 'Loss Prevention',
    tagline: 'Mitigasi Risiko Kehilangan Aset & Pengawasan Rantai Pasok',
    desc: 'Unit spesialis pencegahan penyusutan barang dan kehilangan aset pada sektor ritel, pergudangan modern, dan rantai pasok logistik. Memadukan keahlian investigasi internal, audit stok berkala, serta pemantauan titik-titik rawan secara tersamar maupun terbuka.',
    scope: [
      'Analisis risiko kerentanan titik rawan di area gudang dan toko ritel.',
      'Pengawasan penerimaan, penyimpanan, dan proses serah terima barang bernilai tinggi.',
      'Audit fisik berkala dan pencocokan data inventaris stok.',
      'Investigasi internal profesional terhadap indikasi ketidaksesuaian barang.',
    ],
    features: [
      'Tim investigator berpengalaman dengan keahlian deteksi manipulasi data',
      'Integrasi pengawasan analitik CCTV dan sensor keamanan perimeter',
      'Laporan komprehensif analisis penyebab kehilangan (Root Cause Analysis)',
      'Rekomendasi perbaikan SOP operasional demi efisiensi jangka panjang',
    ],
  },
};

export default function ServiceDetailPage() {
  const { slug } = useParams();

  // If slug is not provided or invalid, default to 'security'
  const currentSlug = slug && SERVICE_DATA[slug] ? slug : 'security';
  const service = SERVICE_TYPES.find((s) => s.slug === currentSlug) || SERVICE_TYPES[0];
  const data = SERVICE_DATA[currentSlug];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 pt-16">
        {/* Hero Header */}
        <section className="bg-ink text-white py-20">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/60 mb-3">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link to="/layanan" className="hover:text-white transition-colors">Jasa Layanan</Link>
              <span>/</span>
              <span className="text-primary-red font-semibold">{service.label}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Jasa Layanan — {service.label}
            </h1>
            <div className="w-16 h-1 bg-primary-red rounded-full mb-3" />
            <p className="text-white/70 text-sm sm:text-base max-w-3xl leading-relaxed">
              Solusi tenaga kerja dan pengelolaan fasilitas terintegrasi dari PT. Bhimasena Adhirajasa Radhika untuk mendukung efisiensi bisnis Anda.
            </p>
          </div>
        </section>

        {/* 2-Column Section */}
        <section className="py-12">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: KATEGORI LAYANAN Sidebar */}
              <aside className="lg:col-span-3">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sticky top-24">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Kategori Layanan
                    </p>
                  </div>
                  <nav className="mt-3 space-y-1" aria-label="Daftar Kategori Layanan">
                    {SERVICE_TYPES.map((s) => {
                      const Icon = SERVICE_ICONS[s.slug] || Shield;
                      const isActive = s.slug === currentSlug;
                      return (
                        <Link
                          key={s.slug}
                          to={`/layanan/${s.slug}`}
                          className={clsx(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative',
                            isActive
                              ? 'bg-accent-green/10 text-accent-green shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          )}
                        >
                          {isActive && (
                            <span
                              className="absolute left-0 top-2 bottom-2 w-1.5 bg-accent-green rounded-r-md"
                              aria-hidden="true"
                            />
                          )}
                          <Icon
                            className={clsx(
                              'w-4 h-4 flex-none',
                              isActive ? 'text-accent-green' : 'text-slate-400'
                            )}
                          />
                          <span className="truncate">{s.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Consultation Banner */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white text-center">
                    <PhoneCall className="w-6 h-6 text-primary-red mx-auto mb-2" />
                    <p className="text-xs font-bold">Konsultasi Kebutuhan Layanan</p>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3">
                      Diskusikan estimasi manpower dan penawaran SLA terbaik untuk lokasi Anda.
                    </p>
                    <Link
                      to="/contact"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-primary-red hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <span>Hubungi Kami</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </aside>

              {/* Right Column: Detailed Service Card */}
              <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
                <div className="space-y-10">
                  {/* Service Heading & Image Grid */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                      <div>
                        <span className="text-xs font-bold text-accent-green uppercase tracking-widest px-3 py-1 bg-accent-green/10 rounded-full">
                          Layanan Resmi PT. BARAK
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                          {data.title}
                        </h2>
                        <div className="w-16 h-1 bg-primary-red rounded-full mt-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-6">
                      <div className="md:col-span-7 space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                        <p className="font-medium text-slate-800 text-base">
                          {data.tagline}
                        </p>
                        <p>{data.desc}</p>
                      </div>

                      <div className="md:col-span-5">
                        <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
                          <img
                            src={data.img}
                            alt={data.title}
                            className="w-full h-56 sm:h-64 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ruang Lingkup Layanan */}
                  <div className="border-t border-slate-100 pt-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-accent-green" />
                      Ruang Lingkup Operasional
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {data.scope.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <span className="w-5 h-5 rounded-full bg-accent-green/15 text-accent-green flex items-center justify-center text-xs font-bold flex-none mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keunggulan Layanan */}
                  <div className="border-t border-slate-100 pt-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Keunggulan & Nilai Tambah
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none" />
                          <span className="text-xs sm:text-sm font-medium text-slate-800">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA Box */}
                  <div className="border-t border-slate-100 pt-8">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                      <div>
                        <h4 className="text-lg font-bold mb-1">Siap Mengoptimalkan Operasional Anda?</h4>
                        <p className="text-xs text-slate-300">
                          Hubungi tim kami untuk peninjauan lokasi (survey lapangan) dan penawaran proposal penempatan.
                        </p>
                      </div>
                      <Link
                        to="/contact"
                        className="px-6 py-3 bg-primary-red hover:bg-red-700 text-white font-semibold rounded-xl text-sm whitespace-nowrap transition-all shadow-md active:scale-95"
                      >
                        Hubungi Tim BARAK
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
