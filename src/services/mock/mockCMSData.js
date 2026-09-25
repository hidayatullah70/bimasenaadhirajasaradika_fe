/**
 * Website CMS Mock Seed Data — PT. BARAK IOMS
 * Source of Truth: PRD Section 2.1 (Public Site), Section 6.8 (Admin Website),
 * Section 17 (Admin Website / CMS: Pages, Services, News, Blog, Careers, FAQ, Inquiries, SEO),
 * Section 18 (Cross-department workflow: Incoming Leads to Marketing), Section 22 (Audit Log).
 */

import { STATUS } from '@/constants/status';

// ── 1. ARTICLES & BLOG POSTS (PRD Section 17) ──────────────────────────────
export const MOCK_ARTICLES = [
  {
    id: 'ART-2026-001',
    title: 'Standar Operasional Pengamanan Terpadu Badan Usaha Jasa Pengamanan (BUJP)',
    slug: 'standar-operasional-pengamanan-terpadu-bujp',
    category: 'KEAMANAN',
    categoryLabel: 'Keamanan & Sekuriti',
    excerpt: 'Bagaimana PT. BARAK menerapkan protokol kepatuhan Polri dan manajemen risiko modern untuk melindungi fasilitas industri dan kawasan komersial.',
    content: `
Penerapan standar operasional prosedur (SOP) pengamanan yang ketat merupakan fondasi utama reputasi PT. Bhimasena Adhirajasa Radhika (PT. BARAK) sebagai Badan Usaha Jasa Pengamanan (BUJP) resmi terdaftar di Mabes Polri.

Setiap personel satpam yang ditempatkan pada lokasi mitra wajib mengantongi kualifikasi legalitas Gada Pratama dan menjalani pelatihan berkala terkait:
1. Tindakan Pertama di Tempat Kejadian Perkara (TPTKP).
2. Pengendalian sistem pintu barrier gate dan pengawasan CCTV perimeter.
3. Protokol pencegahan sabotase muatan barang logistik.
4. Komunikasi taktis radio handy talky dan pelaporan digital melalui aplikasi IOMS.

Dengan integrasi teknologi dan ketegasan disiplin militer yang terukur, PT. BARAK menjamin perlindungan aset bergerak dan tidak bergerak bagi para klien korporat di seluruh wilayah Jabodetabek dan Banten.
    `.trim(),
    author: 'Mayor (Purn.) Sudrajat',
    authorRole: 'Direktur Operasional & Keamanan',
    status: 'PUBLISHED',
    featured: true,
    publishedAt: '2026-09-15T09:00:00Z',
    viewsCount: 1240,
    metaTitle: 'Standar Operasional Pengamanan Terpadu BUJP — PT. BARAK',
    metaDescription: 'Pelajari penerapan SOP pengamanan resmi BUJP Mabes Polri dan manajemen risiko modern PT. BARAK untuk fasilitas industri.',
    ogImage: '/images/articles/security-standard.jpg',
  },
  {
    id: 'ART-2026-002',
    title: 'Transformasi Sistem Barrier Gate Otomatis & Manajemen Parkir Komersial',
    slug: 'transformasi-sistem-barrier-gate-otomatis-parkir',
    category: 'TEKNOLOGI',
    categoryLabel: 'Teknologi & Fasilitas',
    excerpt: 'Efisiensi arus lalu lintas kendaraan dan pencegahan kebocoran pendapatan parkir melalui integrasi gerbang otomatis berkecepatan 1.5 detik.',
    content: `
Kawasan bisnis modern seperti Bona City Business Park dan Salembaran Warehouse menuntut alur keluar-masuk kendaraan yang cepat dan tercatat secara transparan.

PT. BARAK mengintegrasikan barrier gate berkecepatan 1.5 detik dengan sistem sensor optocoupler dan pembacaan barcode tiket:
- Mengurangi antrean kendaraan pada jam sibuk hingga 60%.
- Mengeliminasi potensi kebocoran retribusi parkir melalui pencatatan otomatis transaksi pada sistem cloud IOMS.
- Melindungi kendaraan dari benturan menggunakan sensor photocell anti-tabrak cerdas.
    `.trim(),
    author: 'Fajar Nugroho, S.Kom',
    authorRole: 'IT System Administrator',
    status: 'PUBLISHED',
    featured: false,
    publishedAt: '2026-09-18T11:30:00Z',
    viewsCount: 890,
    metaTitle: 'Teknologi Barrier Gate Otomatis Parkir — PT. BARAK',
    metaDescription: 'Solusi pengelolaan parkir modern bebas hambatan dan transparan untuk gedung komersial dan kawasan pergudangan.',
    ogImage: '/images/articles/barrier-gate.jpg',
  },
  {
    id: 'ART-2026-003',
    title: 'Mitigasi Risiko Selisih Uang Tunai pada Ekspedisi Kurir Cash on Delivery (COD)',
    slug: 'mitigasi-risiko-selisih-uang-tunai-ekspedisi-cod',
    category: 'LOGISTIK',
    categoryLabel: 'Logistik & Kurir',
    excerpt: 'Pentingnya rekonsiliasi harian tiga lapis antara Finance, Operasional Hub, dan pengawalan legal untuk memastikan akurasi setoran COD.',
    content: `
Layanan ekspedisi Cash on Delivery (COD) memiliki perputaran arus kas fisik yang tinggi di lapangan. Tanpa sistem kontrol yang ketat, celah selisih bayar atau keterlambatan setoran dapat merugikan perusahaan logistik.

PT. BARAK memelopori alur kerja rekonsiliasi terintegrasi:
1. Kurir melakukan serah terima setoran harian di drop point maksimal pukul 20:00 WIB.
2. Finance melakukan pencocokan antara manifest resi aplikasi dengan rekening koran penampung.
3. Selisih dana di atas Rp 500.000 otomatis dilimpahkan ke tim investigasi lapangan dalam 24 jam untuk pencegahan kecurangan.
    `.trim(),
    author: 'Siti Rahma, S.Ak',
    authorRole: 'Finance & Billing Specialist',
    status: 'PUBLISHED',
    featured: false,
    publishedAt: '2026-09-20T14:15:00Z',
    viewsCount: 650,
    metaTitle: 'Mitigasi Risiko COD Ekspedisi — PT. BARAK',
    metaDescription: 'Strategi pencegahan selisih setoran COD kurir dengan rekonsiliasi harian terpadu dan audit investigatif.',
    ogImage: '/images/articles/cod-logistics.jpg',
  },
  {
    id: 'ART-2026-004',
    title: 'Hak Ketenagakerjaan & Jaminan Kesejahteraan Karyawan Outsourcing di PT. BARAK',
    slug: 'hak-ketenagakerjaan-dan-jaminan-outsourcing',
    category: 'HRD',
    categoryLabel: 'Ketenagakerjaan & HR',
    excerpt: 'Komitmen PT. BARAK dalam memenuhi upah minimum resmi (UMR/UMK), perlindungan BPJS Ketenagakerjaan, dan kepastian kontrak kerja.',
    content: `
Kesejahteraan pekerja adalah kunci utama loyalitas dan kedisiplinan kerja di garda depan operasional. Berbeda dengan agen penyalur tenaga kerja informal, PT. BARAK menjamin seluruh 40 personel aktif terlindungi oleh:
- Pembayaran upah penuh tepat waktu sesuai standar UMK wilayah kerja masing-masing.
- Kepesertaan aktif BPJS Ketenagakerjaan (JKK, JKM, JHT) dan BPJS Kesehatan Badan Usaha.
- Penyediaan perlengkapan seragam kerja (atribut satpam/kurir/cleaner) standar kedinasan.
    `.trim(),
    author: 'Anisa Kusuma, S.Psi',
    authorRole: 'HRD & Talent Development',
    status: 'PUBLISHED',
    featured: false,
    publishedAt: '2026-09-21T10:00:00Z',
    viewsCount: 1120,
    metaTitle: 'Hak Ketenagakerjaan Karyawan Outsourcing — PT. BARAK',
    metaDescription: 'Komitmen keterbukaan dan perlindungan hak pekerja outsourcing resmi PT. BARAK sesuai regulasi Kemnaker RI.',
    ogImage: '/images/articles/hr-welfare.jpg',
  },
  {
    id: 'ART-2026-005',
    title: 'Panduan Audit Kebersihan & Sanitasi Industri (Industrial Cleaning Standard)',
    slug: 'panduan-audit-kebersihan-sanitasi-industri',
    category: 'CLEANING',
    categoryLabel: 'Kebersihan & Sanitasi',
    excerpt: 'Penerapan standar Chemical Safety Data Sheet (MSDS) dan metode pembersihan higienis untuk pabrik manufaktur dan area publik.',
    content: `
Kebersihan area produksi pada industri makanan dan farmasi tidak hanya berdampak pada estetika, namun secara langsung mempengaruhi kelulusan audit ISO dan BPOM.

Divisi Cleaning Service PT. BARAK menerapkan:
- Zonasi warna kain microfiber (*Color-Coded Cleaning*) untuk mencegah kontaminasi silang.
- Penggunaan chemical pembersih bersertifikasi ramah lingkungan dan aman untuk pekerja.
- Pelaksanaan deep cleaning lantai secara berkala dengan mesin scrubber otomatis.
    `.trim(),
    author: 'Bagus Prakoso',
    authorRole: 'Operations Quality Officer',
    status: 'DRAFT',
    featured: false,
    publishedAt: null,
    viewsCount: 0,
    metaTitle: 'Standar Cleaning Service Industri — PT. BARAK',
    metaDescription: 'Panduan tata kelola sanitasi pabrik dan gedung perkantoran profesional bersertifikasi.',
    ogImage: '/images/articles/cleaning.jpg',
  },
  {
    id: 'ART-2026-006',
    title: 'Pencegahan Kehilangan (Loss Prevention) di Area Pergudangan Kontainer Pelabuhan',
    slug: 'pencegahan-kehilangan-loss-prevention-pergudangan',
    category: 'KEAMANAN',
    categoryLabel: 'Keamanan & Sekuriti',
    excerpt: 'Metode pemeriksaan segel kontainer, pencocokan surat jalan, dan ronda perimeter posko untuk meminimalisir pencurian barang kargo.',
    content: `
Kawasan logistik maritim seperti Marunda Center dan Cikarang Dry Port memiliki intensitas bongkar muat ratusan kontainer setiap harinya.

Layanan Loss Prevention PT. BARAK berfokus pada:
- Pengecekan fisik segel kontainer (*bolt seal inspection*) sebelum pintu keluar kawasan.
- Patroli rutin titik rawan setiap 2 jam dengan pembuktian digital barcode checkpoint.
- Integrasi rekaman CCTV gerbang utama dengan nomor polisi truk pengangkut.
    `.trim(),
    author: 'Hadi Suprianto',
    authorRole: 'Koordinator Lapangan Operasional',
    status: 'PUBLISHED',
    featured: false,
    publishedAt: '2026-09-22T08:00:00Z',
    viewsCount: 430,
    metaTitle: 'Loss Prevention Pergudangan & Kontainer — PT. BARAK',
    metaDescription: 'Strategi pencegahan penyusutan aset kargo logistik di kawasan pergudangan dan pelabuhan.',
    ogImage: '/images/articles/loss-prevention.jpg',
  },
];

// ── 2. CAREER JOB POSTINGS (PRD Section 17 & 2.1) ───────────────────────────
export const MOCK_CAREER_POSTINGS = [
  {
    id: 'JOB-2026-001',
    title: 'Anggota Satpam / Security Guard (Kualifikasi Gada Pratama)',
    slug: 'anggota-satpam-gada-pratama-cikarang-tangerang',
    department: 'OPERATIONS',
    departmentLabel: 'Divisi Pengamanan',
    employmentType: 'KONTRAK (PKWT)',
    location: 'Cikarang (Bekasi) & Tangerang',
    manpowerQuota: 10,
    salaryRange: 'Rp 5.200.000 - Rp 5.600.000 / bln',
    deadline: '2026-10-15',
    status: 'PUBLISHED',
    description: 'Dibutuhkan segera 10 personel satpam pria/wanita berdedikasi tinggi untuk penempatan di kawasan pergudangan industri dan gedung perkantoran mitra PT. BARAK.',
    requirements: [
      'Warga Negara Indonesia, usia 20 - 35 tahun.',
      'Tinggi badan minimal 168 cm (Pria) / 160 cm (Wanita), berat badan proporsional.',
      'Wajib memiliki Ijazah & KTA Satpam resmi Gada Pratama Ditbinmas Polda.',
      'Tidak bertato, tidak bertindik, dan bebas narkoba (dibuktikan dengan SKBN).',
      'Pendidikan minimal SMA/SMK sederajat.',
      'Bersedia bekerja sistem shift 3 regu (Pagi, Sore, Malam).',
    ],
  },
  {
    id: 'JOB-2026-002',
    title: 'Kurir Ekspedisi Motor (Central Hub JNT & Drop Point)',
    slug: 'kurir-ekspedisi-motor-tangerang-jakarta',
    department: 'OPERATIONS',
    departmentLabel: 'Divisi Ekspedisi Logistik',
    employmentType: 'KONTRAK (PKWT)',
    location: 'Tangerang (Benda/Rawa Bokor) & Jakarta Barat',
    manpowerQuota: 8,
    salaryRange: 'Rp 4.900.000 - Rp 5.400.000 / bln + Insentif',
    deadline: '2026-10-20',
    status: 'PUBLISHED',
    description: 'Penempatan pengantaran paket ekspedisi wilayah Banten dan DKI Jakarta, mengelola transaksi Cash on Delivery (COD) harian secara akurat.',
    requirements: [
      'Pria, usia 21 - 35 tahun.',
      'Memiliki sepeda motor pribadi dalam kondisi prima dan SIM C aktif.',
      'Memiliki smartphone Android dengan RAM minimal 4GB untuk aplikasi delivery.',
      'Hafal rute jalan wilayah Tangerang atau Jakarta Barat.',
      'Jujur, teliti dalam perhitungan uang tunai COD, dan bertanggung jawab.',
      'Memiliki penjamin keluarga resmi.',
    ],
  },
  {
    id: 'JOB-2026-003',
    title: 'Koordinator Lapangan Operasional (Korlap Security & Manpower)',
    slug: 'koordinator-lapangan-operasional-korlap',
    department: 'OPERATIONS',
    departmentLabel: 'Manajemen Operasional',
    employmentType: 'TETAP (PKWTT)',
    location: 'Jabodetabek Area',
    manpowerQuota: 2,
    salaryRange: 'Rp 6.500.000 - Rp 7.500.000 / bln',
    deadline: '2026-10-10',
    status: 'PUBLISHED',
    description: 'Memimpin koordinasi posko pengamanan di beberapa titik klien mitra, menyusun jadwal roster absensi, inspeksi kepatuhan seragam, dan komunikasi intensif dengan manajemen klien.',
    requirements: [
      'Pengalaman minimal 3 tahun sebagai Komandan Regu (Danru) atau Korlap BUJP.',
      'Memiliki sertifikasi minimal Gada Madya menjadi nilai tambah utama.',
      'Mampu mengendarai mobil dinas (memiliki SIM A & C).',
      'Mampu mengoperasikan komputer dan aplikasi spreadsheet absensi IOMS.',
      'Memiliki jiwa kepemimpinan tegas, komunikatif, dan problem-solving yang baik.',
    ],
  },
  {
    id: 'JOB-2026-004',
    title: 'Teknisi IT Field Support (CCTV, Barrier Gate & Network)',
    slug: 'teknisi-it-field-support-cctv-barrier-gate',
    department: 'INTERNAL_IT',
    departmentLabel: 'Divisi Teknologi Informasi',
    employmentType: 'KONTRAK (PKWT)',
    location: 'Kantor Pusat Tangerang & Mobilisasi Posko',
    manpowerQuota: 2,
    salaryRange: 'Rp 5.500.000 - Rp 6.200.000 / bln',
    deadline: '2026-10-25',
    status: 'PUBLISHED',
    description: 'Bertanggung jawab atas pemeliharaan preventif, perbaikan gangguan (troubleshooting), dan instalasi perangkat barrier gate, kamera IP CCTV, serta mesin fingerprint di pos jaga klien.',
    requirements: [
      'Pria, usia maksimal 30 tahun, pendidikan SMK/D3 Teknik Komputer Jaringan atau Elektronika.',
      'Memahami instalasi kabel UTP RJ45, crimping, mikrotik router, dan switch LAN.',
      'Berpengalaman melakukan setting IP Camera Hikvision/Dahua dan Barrier Gate MX-50.',
      'Memiliki SIM C pribadi dan siap bertugas mobile ke posko mitra saat terjadi gangguan.',
    ],
  },
  {
    id: 'JOB-2026-005',
    title: 'Cleaning Service & Sanitasi Pabrik Manufaktur',
    slug: 'cleaning-service-sanitasi-pabrik-jatake',
    department: 'OPERATIONS',
    departmentLabel: 'Divisi Kebersihan Lingkungan',
    employmentType: 'KONTRAK (PKWT)',
    location: 'Kawasan Industri Jatake, Tangerang',
    manpowerQuota: 6,
    salaryRange: 'Rp 4.700.000 - Rp 5.000.000 / bln',
    deadline: '2026-09-30',
    status: 'CLOSED',
    description: 'Pelaksanaan kebersihan ruang kantor pabrik, toilet, dan area koridor gedung manajemen.',
    requirements: [
      'Pria/Wanita, usia 19 - 32 tahun.',
      'Pendidikan minimal SMP/SMA sederajat.',
      'Rajin, sopan, bersih, dan berorientasi pada kerapian.',
      'Pengalaman kerja cleaning service gedung perkantoran diutamakan.',
    ],
  },
];

// ── 3. FREQUENTLY ASKED QUESTIONS (FAQ) (PRD Section 17 & 2.1) ─────────────
export const MOCK_FAQS = [
  {
    id: 'FAQ-001',
    category: 'LEGALITAS',
    categoryLabel: 'Perizinan & Legalitas BUJP',
    question: 'Apakah PT. BARAK memiliki legalitas resmi sebagai Badan Usaha Jasa Pengamanan (BUJP)?',
    answer: 'Ya, PT. Bhimasena Adhirajasa Radhika (PT. BARAK) beroperasi secara sah berdasarkan Surat Izin Operasional (SIO BUJP) resmi dari Markas Besar Kepolisian Negara Republik Indonesia (Mabes Polri) dan rekomendasi wilayah Ditbinmas Polda Metro Jaya, serta tersertifikasi SMK3 PP 50/2012 dan ISO 9001:2015.',
    order: 1,
    status: 'PUBLISHED',
  },
  {
    id: 'FAQ-002',
    category: 'LAYANAN',
    categoryLabel: 'Layanan Outsourcing',
    question: 'Apa saja bidang layanan tenaga kerja yang disediakan oleh PT. BARAK?',
    answer: 'PT. BARAK mengkhususkan diri pada 6 layanan utama: 1) Jasa Pengamanan (Security), 2) Ekspedisi Kurir & Pengawalan Logistik, 3) Pengelolaan Parkir & Barrier Gate, 4) Cleaning Service & Sanitasi Industri, 5) Jasa Tenaga Kerja (Labor Supply/Operator Pabrik), dan 6) Loss Prevention & Proteksi Muatan Kargo.',
    order: 2,
    status: 'PUBLISHED',
  },
  {
    id: 'FAQ-003',
    category: 'KOMERSIAL',
    categoryLabel: 'Kontrak & Pembayaran',
    question: 'Bagaimana mekanisme termin pembayaran tagihan (billing term) jasa outsourcing?',
    answer: 'Pembayaran tagihan jasa dilakukan secara bulanan menggunakan faktur resmi (invoice) PT. BARAK dengan termin standar Net 30 Hari atau Net 14 Hari setelah rekapitulasi kehadiran personel ditandatangani oleh manajemen klien mitra.',
    order: 3,
    status: 'PUBLISHED',
  },
  {
    id: 'FAQ-004',
    category: 'KESEJAHTERAAN',
    categoryLabel: 'Gaji & BPJS Tenaga Kerja',
    question: 'Apakah seluruh personel yang ditempatkan memperoleh perlindungan BPJS dan upah standar UMR?',
    answer: 'Seluruh tenaga kerja resmi PT. BARAK didaftarkan secara wajib pada BPJS Ketenagakerjaan (JKK, JKM, JHT) dan BPJS Kesehatan Badan Usaha, serta menerima upah pokok yang memenuhi ketentuan upah minimum regional (UMR/UMK) daerah penempatan kerja.',
    order: 4,
    status: 'PUBLISHED',
  },
  {
    id: 'FAQ-005',
    category: 'OPERASIONAL',
    categoryLabel: 'Insiden & Penggantian',
    question: 'Bagaimana jika petugas satpam berhalangan hadir atau terjadi insiden darurat di posko?',
    answer: 'PT. BARAK memiliki tim cadangan operasional (Replacement Standby) yang siap dikerahkan dalam waktu kurang dari 2 jam oleh Koordinator Lapangan (Korlap). Seluruh insiden darurat tercatat dalam sistem IOMS dan otomatis dilaporkan kepada pihak manajemen klien.',
    order: 5,
    status: 'PUBLISHED',
  },
  {
    id: 'FAQ-006',
    category: 'TEKNOLOGI',
    categoryLabel: 'Sistem Barrier Gate & CCTV',
    question: 'Apakah PT. BARAK juga menyediakan penyewaan dan instalasi perangkat barrier gate parkir?',
    answer: 'Ya, kami menyediakan paket terpadu hardware barrier gate otomatis, kamera CCTV DarkFighter 4K, sistem tiket barcode, dan komputer posko parkir lengkap beserta teknisi pemeliharaan preventif berkala.',
    order: 6,
    status: 'PUBLISHED',
  },
  {
    id: 'FAQ-007',
    category: 'LOGISTIK',
    categoryLabel: 'Kurir & Cash on Delivery (COD)',
    question: 'Bagaimana penanganan keamanan perputaran uang setoran tunai COD pada kurir ekspedisi?',
    answer: 'Setoran COD dipantau melalui pencocokan manifest harian digital IOMS. Setiap selisih dana di atas toleransi langsung diinvestigasi oleh supervisor logistik dan diteruskan ke bagian hukum jika terdapat indikasi wanprestasi.',
    order: 7,
    status: 'PUBLISHED',
  },
  {
    id: 'FAQ-008',
    category: 'KEMITRAAN',
    categoryLabel: 'Proses Menjadi Klien',
    question: 'Bagaimana alur kerja untuk memulai kerjasama pengamanan atau outsourcing dengan PT. BARAK?',
    answer: 'Alur kerjasama dimulai dari: 1) Pengisian formulir inquiry konsultasi / survei lokasi, 2) Analisis titik rawan & pengiriman proposal penawaran, 3) Negosiasi komersial & penandatanganan PKS, 4) Serah terima (handover) penempatan personel satpam di pos jaga klien.',
    order: 8,
    status: 'PUBLISHED',
  },
];

// ── 4. PAGE SEO METADATA (PRD Section 17) ──────────────────────────────────
export const MOCK_PAGE_SEO = [
  {
    pageKey: 'home',
    pageName: 'Beranda / Home',
    slug: '/',
    metaTitle: 'PT. Bhimasena Adhirajasa Radhika (BARAK) — Jasa Pengamanan & Outsourcing Terpercaya',
    metaDescription: 'Penyedia jasa keamanan resmi BUJP Mabes Polri, kurir ekspedisi logistik, pengelolaan parkir barrier gate, dan tenaga kerja profesional di Indonesia.',
    ogTitle: 'PT. BARAK — Integrated Outsourcing Management System',
    ogDescription: 'Solusi terintegrasi tenaga pengamanan, kurir, dan manajemen fasilitas terpercaya.',
    ogImage: '/images/og/og-home.jpg',
    canonical: 'https://bimasenaadhirajasaradika.vercel.app/',
    updatedAt: '2026-09-20T10:00:00Z',
  },
  {
    pageKey: 'about',
    pageName: 'Tentang Perusahaan',
    slug: '/about',
    metaTitle: 'Tentang Kami — Profil Perusahaan PT. BARAK BUJP',
    metaDescription: 'Mengenal visi, misi, legalitas SIO Mabes Polri, dan jajaran kepemimpinan PT. Bhimasena Adhirajasa Radhika.',
    ogTitle: 'Profil PT. BARAK — Mitra Keamanan & Outsourcing',
    ogDescription: 'Profil resmi badan usaha jasa pengamanan dan ketenagakerjaan terpadu.',
    ogImage: '/images/og/og-about.jpg',
    canonical: 'https://bimasenaadhirajasaradika.vercel.app/about',
    updatedAt: '2026-09-20T10:00:00Z',
  },
  {
    pageKey: 'services',
    pageName: 'Layanan Outsourcing',
    slug: '/layanan',
    metaTitle: 'Layanan Kami — Security, Kurir, Parkir & Manpower PT. BARAK',
    metaDescription: 'Eksplorasi 6 pilar layanan outsourcing profesional: Jasa Pengamanan, Ekspedisi Kurir, Parkir, Cleaning Service, Man Power, dan Loss Prevention.',
    ogTitle: 'Layanan Lengkap PT. BARAK',
    ogDescription: 'Solusi tenaga kerja terlatih dan manajemen fasilitas terpadu untuk bisnis Anda.',
    ogImage: '/images/og/og-services.jpg',
    canonical: 'https://bimasenaadhirajasaradika.vercel.app/layanan',
    updatedAt: '2026-09-20T10:00:00Z',
  },
  {
    pageKey: 'careers',
    pageName: 'Karir & Lowongan Kerja',
    slug: '/career',
    metaTitle: 'Karir — Lowongan Kerja Satpam, Kurir & Operasional PT. BARAK',
    metaDescription: 'Bergabunglah menjadi bagian dari tim profesional PT. BARAK. Temukan lowongan kerja resmi satpam Gada Pratama, kurir ekspedisi, dan staf teknisi.',
    ogTitle: 'Karir di PT. BARAK',
    ogDescription: 'Peluang berkarir dengan jaminan upah UMK dan perlindungan BPJS Ketenagakerjaan.',
    ogImage: '/images/og/og-career.jpg',
    canonical: 'https://bimasenaadhirajasaradika.vercel.app/career',
    updatedAt: '2026-09-20T10:00:00Z',
  },
  {
    pageKey: 'contact',
    pageName: 'Kontak & Konsultasi',
    slug: '/contact',
    metaTitle: 'Hubungi Kami — Konsultasi Kebutuhan Pengamanan & Outsourcing',
    metaDescription: 'Diskusikan kebutuhan keamanan kawasan industri dan pengelolaan tenaga kerja Anda dengan tim komersial PT. BARAK.',
    ogTitle: 'Konsultasi Layanan PT. BARAK',
    ogDescription: 'Dapatkan penawaran proposal dan survei lokasi gratis dari tim ahli kami.',
    ogImage: '/images/og/og-contact.jpg',
    canonical: 'https://bimasenaadhirajasaradika.vercel.app/contact',
    updatedAt: '2026-09-20T10:00:00Z',
  },
];

// ── 5. INCOMING WEBSITE INQUIRIES (PRD Section 17 & 18) ────────────────────
export const MOCK_INCOMING_INQUIRIES = [
  {
    id: 'INQ-2026-001',
    leadId: 'LEAD-2026-000001',
    name: 'Bapak Rudi Hermawan',
    company: 'PT. Cikarang Logistic Park',
    phone: '0812-8821-9920',
    email: 'rudi.hermawan@cikaranglp.co.id',
    service: 'security',
    serviceLabel: 'Jasa Pengamanan (Security)',
    message: 'Kami membutuhkan 8 personel satpam bersertifikat Gada Pratama untuk pengamanan kawasan pergudangan seluas 3 hektar di Cikarang GIIC.',
    status: 'CONVERTED_TO_LEAD',
    submittedAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'INQ-2026-002',
    name: 'Ibu Maya Hartono',
    company: 'Apartemen Green Kemayoran Tower C',
    phone: '0813-8829-1144',
    email: 'maya.hartono@greenkemayoran.id',
    service: 'parkir',
    serviceLabel: 'Pengelolaan Parkir & Valet',
    message: 'Tertarik sistem barrier gate otomatis dan petugas valet parkir untuk hunian apartemen 450 unit.',
    status: 'NEW',
    submittedAt: '2026-09-23T14:30:00Z',
  },
  {
    id: 'INQ-2026-003',
    name: 'Bapak Hendra Gunawan',
    company: 'PT. Sentosa Distribusi Pangan',
    phone: '0818-4422-9900',
    email: 'hendra.gunawan@sentosapangan.com',
    service: 'kurir',
    serviceLabel: 'Ekspedisi Kurir & Pengamanan',
    message: 'Kebutuhan 12 tenaga kurir motor dan 2 kurir mobil blind van untuk distribusi logistik harian.',
    status: 'NEW',
    submittedAt: '2026-09-23T16:00:00Z',
  },
];
