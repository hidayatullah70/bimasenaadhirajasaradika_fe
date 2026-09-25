import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import {
  Building2,
  Target,
  Users,
  UserCheck,
  Award,
  CheckCircle2,
  Download,
  Upload,
  Play,
  X,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Scale,
  RotateCcw,
  HeartHandshake,
  Headphones,
  GraduationCap,
  Briefcase,
  Star,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// Tab configuration matching Image 2 & user request
const COMPANY_TABS = [
  { id: 'profil', label: 'Profil Perusahaan', icon: Building2 },
  { id: 'visi-misi', label: 'Visi, Misi & Budaya', icon: Target },
  { id: 'direksi', label: 'Dewan Direksi', icon: Users },
  { id: 'manajemen', label: 'Manajemen', icon: UserCheck },
  { id: 'sertifikat', label: 'Sertifikat & Penghargaan', icon: Award },
];

export default function AboutPage() {
  const { tab: pathTab } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab resolution: priority pathTab -> query searchParam -> 'profil'
  const activeTabId = pathTab || searchParams.get('tab') || 'profil';
  const [activeTab, setActiveTab] = useState(activeTabId);

  // Video modal state
  const [videoOpen, setVideoOpen] = useState(false);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState(null);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState('/assets/documents/company-profile-barak.pdf');

  const handleDownloadPdf = (e) => {
    if (e) e.preventDefault();
    toast.success('Memulai unduhan berkas Company Profile (18.8 MB)...');
    const timestamp = Date.now();
    const targetUrl = `${pdfDownloadUrl}${pdfDownloadUrl.includes('?') ? '&' : '?'}dl=1&t=${timestamp}`;
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = uploadedPdfName || 'company-profile-barak.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (pathTab) {
      setActiveTab(pathTab);
    } else {
      const qTab = searchParams.get('tab');
      setActiveTab(qTab || 'profil');
    }
  }, [pathTab, searchParams]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/perusahaan/${tabId}`, { replace: true });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Format berkas tidak valid. Harap pilih file berekstensi PDF (.pdf).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Ukuran berkas melebihi batas 25 MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Silakan pilih berkas PDF terlebih dahulu.');
      return;
    }
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadedPdfName(selectedFile.name);
      try {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPdfDownloadUrl(objectUrl);
      } catch {
        // Fallback to default path
      }
      setUploadModalOpen(false);
      toast.success(`Company Profile "${selectedFile.name}" berhasil diunggah ke repositori.`);
      setSelectedFile(null);
    }, 1200);
  };

  const currentTabObj = COMPANY_TABS.find((t) => t.id === activeTab) || COMPANY_TABS[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 pt-16">
        {/* Hero Banner Header */}
        <section className="bg-ink text-white py-20">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/60 mb-3">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/80">Perusahaan</span>
              <span>/</span>
              <span className="text-primary-red font-semibold">{currentTabObj.label}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              {currentTabObj.label}
            </h1>
            <div className="w-16 h-1 bg-primary-red rounded-full mb-3" />
            <p className="text-white/70 text-sm sm:text-base max-w-3xl leading-relaxed">
              Mengenal lebih dekat PT. Bhimasena Adhirajasa Radhika (BARAK) — dedikasi terpercaya dalam solusi pengelolaan alih daya & pengembangan SDM profesional.
            </p>
          </div>
        </section>

        {/* 2-Column Layout */}
        <section className="py-12">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Column: Sidebar Navigation */}
              <aside className="lg:col-span-3">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sticky top-24">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Perusahaan
                    </p>
                  </div>
                  <nav className="mt-3 space-y-1" aria-label="Menu Perusahaan">
                    {COMPANY_TABS.map((t) => {
                      const Icon = t.icon;
                      const isActive = activeTab === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTabClick(t.id)}
                          className={clsx(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left relative',
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
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Sidebar Quick Download Card */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <FileText className="w-8 h-8 text-primary-red mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800">Company Profile (PDF)</p>
                    <p className="text-[11px] text-slate-500 mb-3">Versi Resmi PT. BARAK 2026 • 18.8 MB</p>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-primary-red hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Dokumen</span>
                    </button>
                  </div>
                </div>
              </aside>

              {/* Right Column: Dynamic Tab Content */}
              <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10">

                {/* ─────────────────────────────────────────────────────────────
                    TAB 1: PROFIL PERUSAHAAN (Tentang Kami, Video, Mengapa, Upload)
                ────────────────────────────────────────────────────────────── */}
                {activeTab === 'profil' && (
                  <div className="space-y-12">
                    {/* 1. Tentang Kami (Imported from live site id="about") */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Tentang Kami</h2>
                          <div className="w-12 h-1 bg-primary-red rounded-full mt-1" />
                        </div>
                      </div>

                      <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                        <p>
                          <strong className="text-slate-900">PT. BIMASENA ADHIRAJASA RADHIKA (BARAK)</strong> adalah sebuah organisasi yang dibentuk khusus sebagai wadah pengembangan SDM yang memiliki standar kualitas yang mampu bersaing sesuai kebutuhan dan tantangan ke depan, memberikan kontribusi dan rasa nyaman di lingkungan kerja.
                        </p>
                        <p>
                          <strong className="text-slate-900">PT. BIMASENA ADHIRAJASA RADHIKA (BARAK)</strong> memiliki tenaga pengembang dan profesional yang telah berpengalaman dibidangnya selama lebih dari 5 tahun. Dengan semangat yang tinggi untuk menjadi bagian dari solusi kebutuhan SDM yang berkualitas dan menjadi mitra kerja/vendor yang dapat diandalkan, menjadi solusi yang tepat bagi perusahaan mitra kerja di manapun berada.
                        </p>
                      </div>
                    </div>

                    {/* 2. Video Profile Perusahaan */}
                    <div className="border-t border-slate-100 pt-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Play className="w-5 h-5 text-primary-red" />
                          <h3 className="text-lg font-bold text-slate-900">Video Profile Perusahaan</h3>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Resolusi HD 1080p</span>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group">
                        <img
                          src="/assets/img/hero/office-new.jpeg"
                          alt="Gedung Kantor PT. BARAK"
                          className="w-full h-64 sm:h-80 md:h-96 object-cover opacity-85 group-hover:scale-102 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/30 to-black/20" />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                          <button
                            type="button"
                            onClick={() => setVideoOpen(true)}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-red hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all mb-4"
                            aria-label="Putar Video Profile Perusahaan"
                          >
                            <Play className="w-8 h-8 sm:w-9 sm:h-9 ml-1 fill-white" />
                          </button>
                          <h4 className="text-lg sm:text-xl font-bold mb-1">
                            Mengenal Layanan & Fasilitas PT. BARAK
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                            Tonton dedikasi personel operasional, standar pelatihan pos jaga, dan fasilitas pendukung kami.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Mengapa Memilih Kami */}
                    <div className="border-t border-slate-100 pt-8">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        Mengapa Memilih Kami?
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                          <div className="text-2xl sm:text-3xl font-extrabold text-accent-green mb-1">5+</div>
                          <p className="text-xs font-semibold text-slate-700">Tahun Pengalaman</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                          <div className="text-2xl sm:text-3xl font-extrabold text-accent-green mb-1">1000+</div>
                          <p className="text-xs font-semibold text-slate-700">Personel Aktif</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                          <div className="text-2xl sm:text-3xl font-extrabold text-accent-green mb-1">100+</div>
                          <p className="text-xs font-semibold text-slate-700">Klien Puas</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                          <div className="text-2xl sm:text-3xl font-extrabold text-accent-green mb-1">6</div>
                          <p className="text-xs font-semibold text-slate-700">Layanan Unggulan</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                          <span>Personel terlatih, bersertifikat resmi Polri (Gada Pratama), & patuh SOP.</span>
                        </div>
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                          <span>Didukung Sistem Manajemen Operasional Internal (IOMS) transparan 24/7.</span>
                        </div>
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                          <span>Garansi penggantian tenaga kerja (replacement) cepat saat berhalangan.</span>
                        </div>
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                          <span>Kepatuhan 100% regulasi ketenagakerjaan, BPJS TK, BPJS Kesehatan & Disnaker.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 2: VISI, MISI & BUDAYA ("H A P P Y")
                ────────────────────────────────────────────────────────────── */}
                {activeTab === 'visi-misi' && (
                  <div className="space-y-12">
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
                          <Target className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Visi & Misi Perusahaan</h2>
                          <div className="w-12 h-1 bg-primary-red rounded-full mt-1" />
                        </div>
                      </div>
                    </div>

                    {/* Visi */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
                      <span className="text-xs font-bold text-accent-green uppercase tracking-widest px-3 py-1 bg-accent-green/10 rounded-full">
                        Visi Perusahaan
                      </span>
                      <p className="mt-4 text-slate-800 text-base sm:text-lg leading-relaxed font-medium">
                        "Menjadi perusahaan yang mempunyai nilai tambah sehingga lebih unggul dan terdepan dalam memberikan pelayanan sebagai solusi pengembangan dan pengelolaan tenaga kerja / SDM guna mendukung meningkatkan produktivitas di perusahaan mitra serta menjadi perusahaan Alih Daya dengan pelayanan manajemen yang transparan, bertanggung jawab, jujur dan terpercaya."
                      </p>
                    </div>

                    {/* Misi */}
                    <div>
                      <span className="text-xs font-bold text-primary-red uppercase tracking-widest px-3 py-1 bg-red-100 rounded-full">
                        Misi Perusahaan
                      </span>
                      <div className="mt-4 space-y-3">
                        {[
                          'Mengelola dan mengembangkan potensi tenaga kerja / SDM dengan mengutamakan penyelenggaraan usaha yang tetap memperhatikan harkat, martabat manusia.',
                          'Mengelola dan mengembangkan pelayanan Alih Daya sebagai salah satu solusi terciptanya kenyamanan hubungan industrial di perusahaan mitra.',
                          'Memberikan konsep solusi yang cepat dan tepat, untuk memberikan pelayanan yang prima demi kepuasan kepada para pengguna jasa.',
                          'Membantu peran pemerintah dalam mengurangi pengangguran.',
                          'Mensupport perusahaan mitra agar tumbuh dan berkembang sehingga dapat berakibat pada penambahan tenaga kerja.',
                        ].map((misi, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs"
                          >
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-none mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">{misi}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Budaya Kerja: H A P P Y */}
                    <div className="border-t border-slate-100 pt-8">
                      <div className="text-center mb-8">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Nilai & Fondasi Karakter
                        </p>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                          Budaya Kerja : <span className="text-primary-red">"H A P P Y"</span>
                        </h3>
                        <div className="w-16 h-1 bg-primary-red mx-auto mt-2 rounded-full" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* H */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center mx-auto mb-4">
                            <Scale className="w-7 h-7" />
                          </div>
                          <h4 className="text-lg font-bold text-primary-red mb-2">Honesty</h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Bertindak jujur, tulus, menjunjung tinggi etika dan integritas serta memegang teguh kepercayaan yang diberikan.
                          </p>
                        </div>

                        {/* A */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 bg-red-100 text-primary-red rounded-full flex items-center justify-center mx-auto mb-4">
                            <RotateCcw className="w-7 h-7" />
                          </div>
                          <h4 className="text-lg font-bold text-primary-red mb-2">Adaptability</h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Bekerja dengan antusias dan menunjukkan komitmen untuk menjadi yang terbaik dalam setiap pekerjaan baik secara individu maupun kelompok.
                          </p>
                        </div>

                        {/* P */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-7 h-7" />
                          </div>
                          <h4 className="text-lg font-bold text-primary-red mb-2">Profesionalism</h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Bekerja dengan sepenuh hati dan disiplin, berorientasi pada pelayanan prima guna mencapai hasil maksimal sesuai aturan dan norma etika profesi.
                          </p>
                        </div>

                        {/* P */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HeartHandshake className="w-7 h-7" />
                          </div>
                          <h4 className="text-lg font-bold text-primary-red mb-2">Polite</h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Konsistensi dalam bekerja dengan senantiasa menunjukkan sikap santun, saling menghormati dan menghargai seluruh pemangku kepentingan.
                          </p>
                        </div>

                        {/* Y */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
                          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Headphones className="w-7 h-7" />
                          </div>
                          <h4 className="text-lg font-bold text-primary-red mb-2">Customer Centricity</h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Bekerja dengan senantiasa fokus pada kebutuhan pelanggan, proaktif memberikan solusi bernilai tambah dan menjaga relasi jangka panjang.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 3: DEWAN DIREKSI (Direktur Utama, Direktur Operasi, Direktur HC)
                ────────────────────────────────────────────────────────────── */}
                {activeTab === 'direksi' && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Dewan Direksi</h2>
                          <div className="w-12 h-1 bg-primary-red rounded-full mt-1" />
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        Pimpinan eksekutif strategis PT. Bhimasena Adhirajasa Radhika.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* 1. Direktur Utama */}
                      <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                          <img
                            src="/assets/img/team/direkturUtama.jpeg"
                            alt="Juli Priyanto"
                            className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-white shadow-md flex-none bg-slate-200"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <span className="text-xs font-bold text-primary-red uppercase tracking-wider px-3 py-1 bg-red-100 rounded-full">
                              Direktur Utama
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 mb-1">
                              Juli Priyanto
                            </h3>
                            <p className="text-xs text-slate-500 mb-3">PT. Bhimasena Adhirajasa Radhika</p>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                              Memiliki pengalaman lebih dari 15 tahun di industri jasa keamanan dan manajemen. Sebelum mendirikan BARAK, beliau menjabat sebagai Operations Director di perusahaan security multinasional. Spesialisasi dalam risk management dan strategic planning.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 border-t border-slate-200 pt-4">
                              <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                  <GraduationCap className="w-3.5 h-3.5 text-accent-green" /> Pendidikan & Lisensi
                                </h4>
                                <ul className="space-y-0.5 list-disc list-inside text-slate-600">
                                  <li>S1 Hukum - Universitas Pamulang</li>
                                  <li>Kualifikasi Garda Utama Polri</li>
                                  <li>Sertifikat Kompetensi BNSP</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Rekam Jejak
                                </h4>
                                <ul className="space-y-0.5 list-disc list-inside text-slate-600">
                                  <li>10+ Tahun Security BCA Operations</li>
                                  <li>Direktur Utama BARAK (2023 - Sekarang)</li>
                                  <li>Konsultan Keamanan Berbagai Proyek Vital</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Direktur Operasional */}
                      <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                          <img
                            src="/assets/img/team/direkturOps.jpeg"
                            alt="Hendri Nopamin"
                            className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-white shadow-md flex-none bg-slate-200"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <span className="text-xs font-bold text-accent-green uppercase tracking-wider px-3 py-1 bg-accent-green/10 rounded-full">
                              Direktur Operasional
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 mb-1">
                              Hendri Nopamin
                            </h3>
                            <p className="text-xs text-slate-500 mb-3">PT. Bhimasena Adhirajasa Radhika</p>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                              Profesional berpengalaman dalam manajemen operasional dan implementasi sistem keamanan terintegrasi. Memiliki rekam jejak dalam meningkatkan kualitas layanan, mengembangkan sumber daya manusia, serta memastikan efisiensi operasional perusahaan.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 border-t border-slate-200 pt-4">
                              <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                  <Briefcase className="w-3.5 h-3.5 text-accent-green" /> Pengalaman Lapangan
                                </h4>
                                <ul className="space-y-0.5 list-disc list-inside text-slate-600">
                                  <li>9+ Tahun Manajemen Keamanan Hotel & Komersial Jabodetabek</li>
                                  <li>Pengawas Pos Jaga Logistik & Area Industri</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                  <Star className="w-3.5 h-3.5 text-amber-600" /> Spesialisasi
                                </h4>
                                <ul className="space-y-0.5 list-disc list-inside text-slate-600">
                                  <li>Strategic Planning & Deployment</li>
                                  <li>Risk Mitigation & Audit Lapangan</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Direktur HC */}
                      <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                          <img
                            src="/assets/img/team/direkturHc.jpeg"
                            alt="Zaenal Arifin"
                            className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-white shadow-md flex-none bg-slate-200"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider px-3 py-1 bg-emerald-100 rounded-full">
                              Direktur Human Capital (HC)
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 mb-1">
                              Zaenal Arifin
                            </h3>
                            <p className="text-xs text-slate-500 mb-3">PT. Bhimasena Adhirajasa Radhika</p>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                              Bertanggung jawab atas pengelolaan Human Capital secara strategis, termasuk pengembangan organisasi, manajemen talenta, serta peningkatan kinerja karyawan. Berpengalaman dalam membangun budaya kerja yang produktif dan sistem HR yang efektif.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 border-t border-slate-200 pt-4">
                              <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                  <GraduationCap className="w-3.5 h-3.5 text-accent-green" /> Pendidikan & Sertifikasi
                                </h4>
                                <ul className="space-y-0.5 list-disc list-inside text-slate-600">
                                  <li>S1 Ekonomi Manajemen - Univ. Islam Syekh Yusuf</li>
                                  <li>Sertifikat K3 Lingkungan & AMDAL</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Rekam Jejak
                                </h4>
                                <ul className="space-y-0.5 list-disc list-inside text-slate-600">
                                  <li>12+ Tahun General Service Manager</li>
                                  <li>Human Capital Director BARAK (2023 - Sekarang)</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 4: MANAJEMEN (HRD, Legal, Marketing, Operasional, Finance, IT)
                ────────────────────────────────────────────────────────────── */}
                {activeTab === 'manajemen' && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
                          <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Tim Manajemen</h2>
                          <div className="w-12 h-1 bg-primary-red rounded-full mt-1" />
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        Struktur manajerial operasional dan fungsional PT. BARAK.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* HRD */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <img
                            src="/assets/img/team/direkturHc.jpeg"
                            alt="Zaenal Arifin - HRD"
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-3 border-white shadow"
                          />
                          <div className="text-center mb-3">
                            <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase">
                              HRD
                            </span>
                            <h4 className="font-bold text-slate-900 text-base mt-2">Zaenal Arifin</h4>
                            <p className="text-xs text-slate-500">Head of Human Resources</p>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed text-center">
                            Memimpin rekrutmen, pelatihan dasar personel, penempatan tenaga kerja, serta memastikan kepatuhan regulasi ketenagakerjaan.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
                          <span className="text-[11px] text-slate-500 font-medium">hrd@bimasenaadhirajasaradika.com</span>
                        </div>
                      </div>

                      {/* Legal */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <img
                            src="/assets/img/team/legal.jpeg"
                            alt="Robyn Topani, SH - Legal"
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-3 border-white shadow"
                          />
                          <div className="text-center mb-3">
                            <span className="text-[11px] font-bold text-accent-green bg-accent-green/10 px-2.5 py-0.5 rounded-full uppercase">
                              Legal
                            </span>
                            <h4 className="font-bold text-slate-900 text-base mt-2">Robyn Topani, SH</h4>
                            <p className="text-xs text-slate-500">Legal & Corporate Compliance</p>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed text-center">
                            Bertanggung jawab atas perjanjian kerja sama klien, legalitas perizinan operasional BUJP, mitigasi risiko hukum, dan mediasi.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
                          <span className="text-[11px] text-slate-500 font-medium">legal@bimasenaadhirajasaradika.com</span>
                        </div>
                      </div>

                      {/* Marketing */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <img
                            src="/assets/img/team/direkturOps.jpeg"
                            alt="Hendri Nopamin - Marketing"
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-3 border-white shadow"
                          />
                          <div className="text-center mb-3">
                            <span className="text-[11px] font-bold text-primary-red bg-red-100 px-2.5 py-0.5 rounded-full uppercase">
                              Marketing
                            </span>
                            <h4 className="font-bold text-slate-900 text-base mt-2">Hendri Nopamin</h4>
                            <p className="text-xs text-slate-500">Marketing & Partnership</p>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed text-center">
                            Mengembangkan jaringan klien baru, negosiasi kontrak SLA alih daya, dan menjaga kepuasan mitra bisnis secara berkelanjutan.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
                          <span className="text-[11px] text-slate-500 font-medium">marketing@bimasenaadhirajasaradika.com</span>
                        </div>
                      </div>

                      {/* Operasional */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <img
                            src="/assets/img/team/operasional.jpg"
                            alt="Nazi Rinaldi - Operasional"
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-3 border-white shadow"
                          />
                          <div className="text-center mb-3">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                              Operasional
                            </span>
                            <h4 className="font-bold text-slate-900 text-base mt-2">Nazi Rinaldi</h4>
                            <p className="text-xs text-slate-500">Manager Operasional Lapangan</p>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed text-center">
                            Memastikan kesiapan pos jaga, jadwal shift 24 jam, koordinasi korlap di area klien, serta penanganan insiden darurat lapangan.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
                          <span className="text-[11px] text-slate-500 font-medium">operasional@bimasenaadhirajasaradika.com</span>
                        </div>
                      </div>

                      {/* Finance */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <img
                            src="/assets/img/team/operasional.jpg"
                            alt="Nazi Rinaldi - Finance"
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-3 border-white shadow"
                          />
                          <div className="text-center mb-3">
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase">
                              Finance
                            </span>
                            <h4 className="font-bold text-slate-900 text-base mt-2">Nazi Rinaldi</h4>
                            <p className="text-xs text-slate-500">Finance & Accounting Manager</p>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed text-center">
                            Mengelola penggajian (payroll), rekonsiliasi kas COD ekspedisi, penagihan faktur piutang, dan pelaporan keuangan berkala.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
                          <span className="text-[11px] text-slate-500 font-medium">finance@bimasenaadhirajasaradika.com</span>
                        </div>
                      </div>

                      {/* IT Support */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <img
                            src="/assets/img/team/itSupport.jpeg"
                            alt="Gheril Ramaditya S - IT Support"
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-3 border-white shadow"
                          />
                          <div className="text-center mb-3">
                            <span className="text-[11px] font-bold text-cyan-700 bg-cyan-100 px-2.5 py-0.5 rounded-full uppercase">
                              IT Support
                            </span>
                            <h4 className="font-bold text-slate-900 text-base mt-2">Gheril Ramaditya S.</h4>
                            <p className="text-xs text-slate-500">IT Support & Systems</p>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed text-center">
                            Bertanggung jawab atas pemeliharaan perangkat IT, kestabilan platform sistem manajemen operasional (IOMS), dan helpdesk.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
                          <span className="text-[11px] text-slate-500 font-medium">itsupport@bimasenaadhirajasaradika.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 5: SERTIFIKAT & PENGHARGAAN
                ────────────────────────────────────────────────────────────── */}
                {activeTab === 'sertifikat' && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Sertifikat & Penghargaan</h2>
                          <div className="w-12 h-1 bg-primary-red rounded-full mt-1" />
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        Legalitas perizinan resmi dan sertifikasi kepatuhan standar industri yang dimiliki PT. BARAK.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 text-primary-red flex items-center justify-center flex-none">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">
                            Mabes Polri
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-1.5 mb-1">
                            Surat Izin Operasional BUJP
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Izin resmi dari Badan Pemelihara Keamanan (Baharkam) Mabes Polri untuk penyediaan jasa pengamanan, konsultasi keamanan, dan penerapan satpam bersertifikat.
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center flex-none">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded uppercase">
                            Kemenaker RI
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-1.5 mb-1">
                            Izin Operasional Alih Daya (PPJP)
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Terdaftar sah pada Dinas Tenaga Kerja sebagai Lembaga Penyedia Jasa Pekerja/Buruh sesuai UU Ketenagakerjaan dan standar perlindungan upah.
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-none">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                            BNSP
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-1.5 mb-1">
                            Sertifikasi Kompetensi BNSP
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Sertifikasi kompetensi profesi Badan Nasional Sertifikasi Profesi untuk instruktur pelatihan, chief security, dan spesialis manajemen risiko.
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-none">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded uppercase">
                            K3 & AMDAL
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-1.5 mb-1">
                            Sertifikasi K3 & Perlindungan Lingkungan
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Penerapan standar Keselamatan dan Kesehatan Kerja (K3) dalam seluruh prosedur operasional pos pergudangan dan area publik klien.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-base">Butuh Salinan Legalitas untuk Pengadaan / Tender?</h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Tim Legal kami siap mengirimkan paket kelengkapan dokumen resmi perusahaan.
                        </p>
                      </div>
                      <Link
                        to="/contact"
                        className="px-5 py-2.5 bg-primary-red hover:bg-red-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        Hubungi Tim Legal
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: VIDEO PROFILE PERUSAHAAN PLAYER
      ────────────────────────────────────────────────────────────── */}
      {videoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 text-white">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-primary-red fill-primary-red" />
                <h4 className="text-sm font-bold">Video Profil PT. Bhimasena Adhirajasa Radhika</h4>
              </div>
              <button
                type="button"
                onClick={() => setVideoOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex flex-col items-center justify-center relative p-8 text-center">
              <img
                src="/assets/img/hero/office-new.jpeg"
                alt="Video Preview"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-10 max-w-md">
                <div className="w-16 h-16 rounded-full bg-primary-red/90 text-white flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Play className="w-7 h-7 ml-1 fill-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  Profil Operasional & Fasilitas Pelatihan PT. BARAK
                </h3>
                <p className="text-slate-300 text-xs mb-6 leading-relaxed">
                  Menampilkan kesiapan personel satpam berstandar Gada Pratama, armada kurir, serta sistem pengawasan CCTV terpadu.
                </p>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-red hover:bg-red-700 text-white text-xs font-semibold shadow-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka di Layar Penuh YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: UPLOAD COMPANY PROFILE.PDF
      ────────────────────────────────────────────────────────────── */}
      {uploadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setUploadModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <Upload className="w-5 h-5 text-primary-red" />
                <h3 className="font-bold text-base">Unggah Company Profile (PDF)</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih berkas profil perusahaan resmi terbaru dalam format <strong>PDF (.pdf)</strong> maksimal 15 MB untuk diperbarui pada situs dan portal unduhan.
              </p>

              <div className="border-2 border-dashed border-slate-300 hover:border-primary-red rounded-xl p-6 text-center transition-colors bg-slate-50/50">
                <FileText className="w-10 h-10 text-primary-red mx-auto mb-2" />
                <label className="cursor-pointer block">
                  <span className="text-xs font-semibold text-accent-green hover:underline">
                    Pilih file dari perangkat
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">atau seret berkas ke sini</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-emerald-600 flex-none" />
                    <span className="font-semibold text-slate-800 truncate">{selectedFile.name}</span>
                  </div>
                  <span className="text-slate-500 text-[11px] flex-none">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-5 py-2 text-xs font-semibold bg-primary-red hover:bg-red-800 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  {isUploading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Simpan & Perbarui</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
