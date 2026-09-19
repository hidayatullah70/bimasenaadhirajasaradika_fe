// PT. Bhimasena Adhirajasa Radhika — Mock Data Layer
// Aligned with SOT: 01-PRD.md, 03-UI-GUIDELINE.md, 04-API-SPEC.md

export const INITIAL_SERVICES = [
  {
    id: 'srv-1',
    code: 'SEC',
    title: 'Pengamanan / Security',
    slug: 'security',
    shortDesc: 'Garda pengamanan bersertifikasi resmi dengan kedisiplinan tinggi, patroli terstruktur, dan protokol tanggap darurat.',
    description: 'Penyediaan dan pengelolaan satuan pengamanan profesional yang telah melalui seleksi ketat dan sertifikasi Gada Pratama hingga Gada Madya. Dilengkapi dengan SOP patroli modern, pelaporan berkala, dan koordinasi cepat dengan aparat kepolisian setempat.',
    icon: 'Shield',
    activePersonnel: 480,
    clientCount: 18,
    features: [
      'Personel tersertifikasi Gada Pratama / Madya',
      'SOP patroli digital & checkpoint pelaporan',
      'Pelatihan penanganan ancaman & evakuasi berkala',
      'Supervisi inspeksi mendadak 24/7'
    ]
  },
  {
    id: 'srv-2',
    code: 'EXP',
    title: 'Ekspedisi Kurir',
    slug: 'ekspedisi-kurir',
    shortDesc: 'Kurir andal dan pengemudi logistik berdedikasi tinggi dengan kepatuhan SLA ketat serta integrasi rute efisien.',
    description: 'Layanan penyediaan kurir motor dan driver mobil untuk kebutuhan logistik perusahaan, e-commerce fulfillment, serta distribusi dokumen antar-cabang. Menjamin integritas barang dan kecepatan serah terima.',
    icon: 'Truck',
    activePersonnel: 260,
    clientCount: 9,
    features: [
      'Personel paham rute & memiliki SIM terverifikasi',
      'Tingkat kepatuhan waktu (SLA on-time) > 99%',
      'Protokol perlindungan paket berharga',
      'Penggantian cepat (backup rider) bila berhalangan'
    ]
  },
  {
    id: 'srv-3',
    code: 'MAN',
    title: 'Man Power',
    slug: 'man-power',
    shortDesc: 'Tenaga kerja operasional siap kerja untuk pergudangan, manufaktur, staf administrasi, dan pendukung retail.',
    description: 'Solusi pemenuhan kebutuhan tenaga kerja umum berskala fleksibel. Meliputi staf gudang (packer, picker), operator produksi, staf administrasi kantor, helper, hingga tenaga kasir dengan pelatihan etos kerja prima.',
    icon: 'Users',
    activePersonnel: 380,
    clientCount: 14,
    features: [
      'Database tenaga kerja siap penempatan cepat',
      'Skrining latar belakang, rekam medis & SKCK',
      'Program orientasi budaya kerja klien',
      'Manajemen mutasi, rotasi & administrasi legal lengkap'
    ]
  },
  {
    id: 'srv-4',
    code: 'CLN',
    title: 'Cleaning Service',
    slug: 'cleaning-service',
    shortDesc: 'Kebersihan, sanitasi, dan kerapian lingkungan kantor serta komersial dengan standar higienitas tinggi.',
    description: 'Layanan kebersihan menyeluruh untuk gedung perkantoran, pusat perbelanjaan, rumah sakit, dan pabrik. Menggunakan chemical ramah lingkungan yang aman dan perlengkapan mesin sanitasi modern.',
    icon: 'Sparkles',
    activePersonnel: 210,
    clientCount: 12,
    features: [
      'Tenaga terlatih teknik sanitasi & pembersihan mendalam',
      'Standar chemical ramah lingkungan & tersertifikasi',
      'Checklist kebersihan area terstandarisasi harian',
      'Pembersihan khusus (kaca gedung, poles lantai marmer)'
    ]
  },
  {
    id: 'srv-5',
    code: 'PRK',
    title: 'Parkir',
    slug: 'parkir',
    shortDesc: 'Pengelolaan area parkir tertib, ramah pengunjung, pengaturan lalu lintas lancar, dan proteksi kendaraan prima.',
    description: 'Penyediaan petugas juru parkir, operator pos kasir masuk/keluar, dan pengatur sirkulasi kendaraan untuk mal, perkantoran, dan rumah sakit. Mengedepankan keramahan layanan (service excellence) dan keamanan menyeluruh.',
    icon: 'Car',
    activePersonnel: 120,
    clientCount: 8,
    features: [
      'Pelatihan service excellence & etika sapa ramah',
      'Pengaturan kapasitas & sirkulasi bebas macet',
      'Pemeriksaan keamanan STNK & fisik kendaraan',
      'Kemampuan penanganan kendala sistem parkir'
    ]
  },
  {
    id: 'srv-6',
    code: 'LPR',
    title: 'Loss Prevention',
    slug: 'loss-prevention',
    shortDesc: 'Mitigasi risiko penyusutan barang (shrinkage), audit inventaris lapangan, dan pengawasan internal toko ritel.',
    description: 'Layanan spesialis pengawasan dan pencegahan kerugian inventaris pada sektor ritel, supermarket, dan pergudangan sentral. Meliputi patroli tidak berseragam (undercover), audit titik rawan, dan investigasi ketidaksesuaian stok.',
    icon: 'SearchCheck',
    activePersonnel: 75,
    clientCount: 6,
    features: [
      'Metodologi deteksi pencurian internal & eksternal',
      'Audit rutin rekonsiliasi stok barang rawan hilang',
      'Investigasi sistematis sesuai koridor hukum',
      'Laporan evaluasi titik buta (blind-spot) berkala'
    ]
  }
];

export const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Juli Priyanto (Direktur)',
    email: 'direktur@bimasenaadhirajasaradika.com',
    role: 'owner',
    roleLabel: 'Direktur',
    phone: '+62 811-2345-6789',
    status: 'active',
    lastLogin: '2026-09-18 08:30',
    avatar: '/assets/img/team/person-3.jpeg'
  },
  {
    id: 'usr-2',
    name: 'Robyn Topani (HRD)',
    email: 'hrd@bimasenaadhirajasaradika.com',
    role: 'hrd',
    roleLabel: 'Kepala Divisi HRD',
    phone: '+62 812-3456-7890',
    status: 'active',
    lastLogin: '2026-09-18 08:45',
    avatar: '/assets/img/team/person-7.jpeg'
  },
  {
    id: 'usr-3',
    name: 'Nazi Rinaldi (operasional)',
    email: 'operasional@bimasenaadhirajasaradika.com',
    role: 'operasional',
    roleLabel: 'Manager Operasional & Lapangan',
    phone: '+62 813-4567-8901',
    status: 'active',
    lastLogin: '2026-09-18 07:15',
    avatar: '/assets/img/team/nazi.jpg'
  },
  {
    id: 'usr-4',
    name: 'Zaenal Arifin (Finance)',
    email: 'finance@bimasenaadhirajasaradika.com',
    role: 'finance',
    roleLabel: 'Finance & Billing Lead',
    phone: '+62 814-5678-9012',
    status: 'active',
    lastLogin: '2026-09-18 09:10',
    avatar: '/assets/img/team/person-4.jpeg'
  },
  {
    id: 'usr-5',
    name: 'Hendri Nopamin (Marketing)',
    email: 'marketing@bimasenaadhirajasaradika.com',
    role: 'marketing',
    roleLabel: 'Business Development & Marketing',
    phone: '+62 815-6789-0123',
    status: 'active',
    lastLogin: '2026-09-18 10:00',
    avatar: '/assets/img/team/person-2.jpeg'
  },
  {
    id: 'usr-6',
    name: 'Gheril Ramaditya S.',
    email: 'itsupport@bimasenaadhirajasaradika.com',
    role: 'it_support',
    roleLabel: 'IT Support & Infrastruktur',
    phone: '+62 816-7890-1234',
    status: 'active',
    lastLogin: '2026-09-18 09:30',
    avatar: '/assets/img/team/person-5.jpeg'
  }
];

export const INITIAL_CLIENTS = [
  {
    id: 'cli-1',
    name: 'PT Menara Graha Mandiri',
    industry: 'Properti & Komersial',
    contactPerson: 'Bambang Soediro',
    phone: '+62 21 5289-1000',
    email: 'bambang.s@grahamandiri.com',
    address: 'Jl. Jend. Sudirman Kav. 54-55, Jakarta Selatan',
    serviceType: 'Pengamanan / Security, Cleaning Service, Parkir',
    activeSites: 2,
    activeHeadcount: 65,
    status: 'active',
    contractEnd: '2027-03-31'
  },
  {
    id: 'cli-2',
    name: 'PT Logistik Nusantara Prima',
    industry: 'Transportasi & Logistik',
    contactPerson: 'Farhan Maulana',
    phone: '+62 21 8934-2211',
    email: 'f.maulana@logistikprima.co.id',
    address: 'Kawasan Industri MM2100, Cikarang Barat, Bekasi',
    serviceType: 'Ekspedisi Kurir, Man Power',
    activeSites: 3,
    activeHeadcount: 140,
    status: 'active',
    contractEnd: '2026-12-31'
  },
  {
    id: 'cli-3',
    name: 'Super Indo Mitra Ritel Group',
    industry: 'Retail & Supermarket',
    contactPerson: 'Jessica Tanuwidjaja',
    phone: '+62 21 7890-4433',
    email: 'jessica.t@mitraritel.id',
    address: 'Jl. Margonda Raya No. 120, Depok',
    serviceType: 'Loss Prevention, Pengamanan / Security',
    activeSites: 4,
    activeHeadcount: 48,
    status: 'active',
    contractEnd: '2027-06-30'
  },
  {
    id: 'cli-4',
    name: 'PT Surya Elektronik Sentosa',
    industry: 'Manufaktur & Elektronik',
    contactPerson: 'Dwi Prasetyo',
    phone: '+62 21 8970-1122',
    email: 'procurement@suryaelektronik.com',
    address: 'Kawasan EJIP Blok 5C, Cikarang Selatan',
    serviceType: 'Man Power, Cleaning Service',
    activeSites: 1,
    activeHeadcount: 95,
    status: 'active',
    contractEnd: '2026-11-15'
  },
  {
    id: 'cli-5',
    name: 'RS Medika Husada Sejahtera',
    industry: 'Kesehatan & Rumah Sakit',
    contactPerson: 'Dr. Indah Wardani, MARS',
    phone: '+62 21 4589-7700',
    email: 'operasional@rsmedikahusada.org',
    address: 'Jl. Raya Bogor Km. 28, Jakarta Timur',
    serviceType: 'Pengamanan / Security, Cleaning Service, Parkir',
    activeSites: 1,
    activeHeadcount: 72,
    status: 'active',
    contractEnd: '2027-08-31'
  }
];

export const INITIAL_SITES = [
  {
    id: 'ste-1',
    clientId: 'cli-1',
    clientName: 'PT Menara Graha Mandiri',
    name: 'Gedung Graha Mandiri Tower A & B',
    location: 'Sudirman, Jakarta Selatan',
    assignedSupervisor: 'Ahmad Faisal (Danru)',
    totalPersonnel: 45,
    services: ['Pengamanan / Security', 'Parkir'],
    status: 'operational',
    slaScore: '99.8%'
  },
  {
    id: 'ste-2',
    clientId: 'cli-1',
    clientName: 'PT Menara Graha Mandiri',
    name: 'Graha Mandiri Commercial Hall',
    location: 'Sudirman, Jakarta Selatan',
    assignedSupervisor: 'Rini Hidayati (Leader Clean)',
    totalPersonnel: 20,
    services: ['Cleaning Service'],
    status: 'operational',
    slaScore: '99.5%'
  },
  {
    id: 'ste-3',
    clientId: 'cli-2',
    clientName: 'PT Logistik Nusantara Prima',
    name: 'Central Distribution Hub Cikarang',
    location: 'Kawasan Industri MM2100',
    assignedSupervisor: 'Budi Santoso (Koordinator Hub)',
    totalPersonnel: 90,
    services: ['Ekspedisi Kurir', 'Man Power'],
    status: 'operational',
    slaScore: '99.2%'
  },
  {
    id: 'ste-4',
    clientId: 'cli-3',
    clientName: 'Super Indo Mitra Ritel Group',
    name: 'Super Indo Flagship Store Depok',
    location: 'Margonda Raya, Depok',
    assignedSupervisor: 'Eko Wahyudi (Senior LP)',
    totalPersonnel: 18,
    services: ['Loss Prevention', 'Pengamanan / Security'],
    status: 'operational',
    slaScore: '100%'
  },
  {
    id: 'ste-5',
    clientId: 'cli-4',
    clientName: 'PT Surya Elektronik Sentosa',
    name: 'Pabrik Perakitan Modul Surya',
    location: 'EJIP Cikarang Selatan',
    assignedSupervisor: 'Tatang Sutarman (Spv Ops)',
    totalPersonnel: 95,
    services: ['Man Power', 'Cleaning Service'],
    status: 'operational',
    slaScore: '98.9%'
  }
];

export const INITIAL_EMPLOYEES = [
  {
    id: 'emp-101',
    nik: 'BA-2024-001',
    name: 'Ahmad Faisal',
    gender: 'Laki-laki',
    service: 'Pengamanan / Security',
    position: 'Komandan Regu (Danru)',
    siteName: 'Gedung Graha Mandiri Tower A & B',
    clientName: 'PT Menara Graha Mandiri',
    phone: '+62 821-1122-3344',
    status: 'active',
    certification: 'Gada Pratama & Gada Madya',
    joinDate: '2024-01-15',
    contractEnd: '2026-12-31'
  },
  {
    id: 'emp-102',
    nik: 'BA-2024-002',
    name: 'Bagus Setiawan',
    gender: 'Laki-laki',
    service: 'Pengamanan / Security',
    position: 'Anggota Garda Pengamanan',
    siteName: 'Gedung Graha Mandiri Tower A & B',
    clientName: 'PT Menara Graha Mandiri',
    phone: '+62 821-2233-4455',
    status: 'active',
    certification: 'Gada Pratama',
    joinDate: '2024-03-01',
    contractEnd: '2026-12-31'
  },
  {
    id: 'emp-103',
    nik: 'BA-2024-003',
    name: 'Rudi Hermawan',
    gender: 'Laki-laki',
    service: 'Ekspedisi Kurir',
    position: 'Lead Rider Ekspedisi',
    siteName: 'Central Distribution Hub Cikarang',
    clientName: 'PT Logistik Nusantara Prima',
    phone: '+62 821-3344-5566',
    status: 'active',
    certification: 'SIM C & SIM A Terverifikasi',
    joinDate: '2024-02-10',
    contractEnd: '2026-12-31'
  },
  {
    id: 'emp-104',
    nik: 'BA-2024-004',
    name: 'Rini Hidayati',
    gender: 'Perempuan',
    service: 'Cleaning Service',
    position: 'Team Leader Kebersihan',
    siteName: 'Graha Mandiri Commercial Hall',
    clientName: 'PT Menara Graha Mandiri',
    phone: '+62 821-4455-6677',
    status: 'active',
    certification: 'BNSP Cleaning Specialist',
    joinDate: '2024-04-01',
    contractEnd: '2026-12-31'
  },
  {
    id: 'emp-105',
    nik: 'BA-2024-005',
    name: 'Eko Wahyudi',
    gender: 'Laki-laki',
    service: 'Loss Prevention',
    position: 'Senior Loss Prevention Officer',
    siteName: 'Super Indo Flagship Store Depok',
    clientName: 'Super Indo Mitra Ritel Group',
    phone: '+62 821-5566-7788',
    status: 'active',
    certification: 'Sertifikasi Audit Ritel & Investigasi',
    joinDate: '2024-01-20',
    contractEnd: '2026-12-31'
  },
  {
    id: 'emp-106',
    nik: 'BA-2024-006',
    name: 'Yusuf Maulana',
    gender: 'Laki-laki',
    service: 'Parkir',
    position: 'Koordinator Pos Masuk / Kasir',
    siteName: 'Gedung Graha Mandiri Tower A & B',
    clientName: 'PT Menara Graha Mandiri',
    phone: '+62 821-6677-8899',
    status: 'active',
    certification: 'Standar Layanan Parkir Prima',
    joinDate: '2024-05-15',
    contractEnd: '2026-12-31'
  },
  {
    id: 'emp-107',
    nik: 'BA-2024-007',
    name: 'Doni Saputra',
    gender: 'Laki-laki',
    service: 'Man Power',
    position: 'Operator Logistik & Picker',
    siteName: 'Central Distribution Hub Cikarang',
    clientName: 'PT Logistik Nusantara Prima',
    phone: '+62 821-7788-9900',
    status: 'active',
    certification: 'K3 Pergudangan Dasar',
    joinDate: '2024-06-01',
    contractEnd: '2026-12-31'
  },
  {
    id: 'emp-108',
    nik: 'BA-2024-008',
    name: 'Tri Wahyuni',
    gender: 'Perempuan',
    service: 'Man Power',
    position: 'Staff Administrasi Gudang',
    siteName: 'Pabrik Perakitan Modul Surya',
    clientName: 'PT Surya Elektronik Sentosa',
    phone: '+62 821-8899-0011',
    status: 'active',
    certification: 'Sertifikasi Administrasi Perkantoran',
    joinDate: '2024-06-15',
    contractEnd: '2026-12-31'
  }
];

export const INITIAL_INVOICES = [
  {
    id: 'inv-2026-001',
    invoiceNumber: 'INV/BAR/2026/09/001',
    clientId: 'cli-1',
    clientName: 'PT Menara Graha Mandiri',
    serviceType: 'Pengamanan, Cleaning & Parkir',
    period: 'September 2026',
    subtotal: 215000000,
    ppn: 23650000,
    total: 238650000,
    issueDate: '2026-09-01',
    dueDate: '2026-09-20',
    status: 'pending',
    headcountBilled: 65,
    notes: 'Penagihan jasa outsourcing periode September 2026'
  },
  {
    id: 'inv-2026-002',
    invoiceNumber: 'INV/BAR/2026/09/002',
    clientId: 'cli-2',
    clientName: 'PT Logistik Nusantara Prima',
    serviceType: 'Ekspedisi Kurir & Man Power Hub',
    period: 'September 2026',
    subtotal: 420000000,
    ppn: 46200000,
    total: 466200000,
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'paid',
    paidDate: '2026-09-10',
    headcountBilled: 140,
    notes: 'Pembayaran transfer Mandiri Corporate No. Ref 908711'
  },
  {
    id: 'inv-2026-003',
    invoiceNumber: 'INV/BAR/2026/08/045',
    clientId: 'cli-3',
    clientName: 'Super Indo Mitra Ritel Group',
    serviceType: 'Loss Prevention & Security',
    period: 'Agustus 2026',
    subtotal: 165000000,
    ppn: 18150000,
    total: 183150000,
    issueDate: '2026-08-01',
    dueDate: '2026-08-25',
    status: 'paid',
    paidDate: '2026-08-22',
    headcountBilled: 48,
    notes: 'Pelunasan tepat waktu'
  },
  {
    id: 'inv-2026-004',
    invoiceNumber: 'INV/BAR/2026/08/046',
    clientId: 'cli-4',
    clientName: 'PT Surya Elektronik Sentosa',
    serviceType: 'Man Power Operasional',
    period: 'Agustus 2026',
    subtotal: 285000000,
    ppn: 31350000,
    total: 316350000,
    issueDate: '2026-08-01',
    dueDate: '2026-08-20',
    status: 'overdue',
    headcountBilled: 95,
    notes: 'Menunggu konfirmasi approval finance kantor pusat klien'
  },
  {
    id: 'inv-2026-005',
    invoiceNumber: 'INV/BAR/2026/09/003',
    clientId: 'cli-5',
    clientName: 'RS Medika Husada Sejahtera',
    serviceType: 'Integrated Facilities & Security',
    period: 'September 2026',
    subtotal: 240000000,
    ppn: 26400000,
    total: 266400000,
    issueDate: '2026-09-05',
    dueDate: '2026-09-25',
    status: 'pending',
    headcountBilled: 72,
    notes: 'Faktur pajak elektronik terbit'
  }
];

export const INITIAL_LEADS = [
  {
    id: 'led-1',
    company: 'PT Sentra Megah Logistik',
    picName: 'Hendra Gunawan',
    picPhone: '+62 811-9876-543',
    email: 'h.gunawan@sentramegah.com',
    serviceInterested: 'Ekspedisi Kurir & Man Power',
    requestedHeadcount: 50,
    estimatedValue: 175000000,
    stage: 'penawaran', // baru, diskusi, penawaran, negosiasi, menang
    probability: '75%',
    source: 'Website Landing Page Form',
    notes: 'Klien butuh 50 kurir motor untuk operasional fulfillment baru di Cibitung.',
    createdAt: '2026-09-10'
  },
  {
    id: 'led-2',
    company: 'Plaza Simatupang Office Suites',
    picName: 'Irene Kusuma',
    picPhone: '+62 812-4455-8899',
    email: 'property@plazasimatupang.co.id',
    serviceInterested: 'Pengamanan / Security & Parkir',
    requestedHeadcount: 35,
    estimatedValue: 120000000,
    stage: 'negosiasi',
    probability: '90%',
    source: 'Rujukan Klien Tetap',
    notes: 'Sudah presentasi proposal teknis. Sedang negosiasi penyesuaian klausul shift patroli.',
    createdAt: '2026-09-05'
  },
  {
    id: 'led-3',
    company: 'PT Pharma Indo Mandiri',
    picName: 'Bambang Irawan',
    picPhone: '+62 813-7788-9911',
    email: 'bambang@pharmaindo.co.id',
    serviceInterested: 'Cleaning Service & Sanitasi',
    requestedHeadcount: 25,
    estimatedValue: 85000000,
    stage: 'diskusi',
    probability: '50%',
    source: 'Website Landing Page Form',
    notes: 'Memerlukan chemical food-grade untuk pabrik obat di Cikarang.',
    createdAt: '2026-09-12'
  },
  {
    id: 'led-4',
    company: 'Retailmart Express Jawa Barat',
    picName: 'Denny Pratama',
    picPhone: '+62 815-2233-4411',
    email: 'denny@retailmartexpress.id',
    serviceInterested: 'Loss Prevention',
    requestedHeadcount: 15,
    estimatedValue: 60000000,
    stage: 'baru',
    probability: '30%',
    source: 'Website Landing Page Form',
    notes: 'Permintaan audit pencegahan shrinkage di 6 gerai retail.',
    createdAt: '2026-09-14'
  },
  {
    id: 'led-5',
    company: 'Hotel Grand Mercure Kemayoran',
    picName: 'Sarah Amalia',
    picPhone: '+62 811-3322-1144',
    email: 'hr.gm@grandmercure.co.id',
    serviceInterested: 'Pengamanan / Security & Cleaning',
    requestedHeadcount: 40,
    estimatedValue: 145000000,
    stage: 'menang',
    probability: '100%',
    source: 'Tender Terbuka',
    notes: 'SPK telah ditandatangani, penempatan tenaga kerja dimulai 1 Oktober 2026.',
    createdAt: '2026-08-20'
  }
];

export const INITIAL_ATTENDANCE = [
  {
    id: 'att-1',
    employeeId: 'emp-101',
    employeeName: 'Ahmad Faisal',
    service: 'Pengamanan / Security',
    siteName: 'Gedung Graha Mandiri Tower A & B',
    date: '2026-09-15',
    shift: 'Shift 1 (07:00 - 15:00)',
    checkIn: '06:42',
    checkOut: '15:05',
    status: 'on-duty', // on-duty, off, permit, absent
    notes: 'Tepat waktu, briefing apel pagi dipimpin'
  },
  {
    id: 'att-2',
    employeeId: 'emp-102',
    employeeName: 'Bagus Setiawan',
    service: 'Pengamanan / Security',
    siteName: 'Gedung Graha Mandiri Tower A & B',
    date: '2026-09-15',
    shift: 'Shift 1 (07:00 - 15:00)',
    checkIn: '06:50',
    checkOut: '15:00',
    status: 'on-duty',
    notes: 'Patroli lantai 1 - 5 tuntas'
  },
  {
    id: 'att-3',
    employeeId: 'emp-103',
    employeeName: 'Rudi Hermawan',
    service: 'Ekspedisi Kurir',
    siteName: 'Central Distribution Hub Cikarang',
    date: '2026-09-15',
    shift: 'Shift Reguler (08:00 - 17:00)',
    checkIn: '07:48',
    checkOut: '17:10',
    status: 'on-duty',
    notes: 'Pemberangkatan 35 batch kiriman on-time'
  },
  {
    id: 'att-4',
    employeeId: 'emp-104',
    employeeName: 'Rini Hidayati',
    service: 'Cleaning Service',
    siteName: 'Graha Mandiri Commercial Hall',
    date: '2026-09-15',
    shift: 'Shift 1 (06:00 - 14:00)',
    checkIn: '05:50',
    checkOut: '14:05',
    status: 'on-duty',
    notes: 'Sanitasi area lobby dan food court rampung'
  },
  {
    id: 'att-5',
    employeeId: 'emp-105',
    employeeName: 'Eko Wahyudi',
    service: 'Loss Prevention',
    siteName: 'Super Indo Flagship Store Depok',
    date: '2026-09-15',
    shift: 'Shift Middle (11:00 - 19:00)',
    checkIn: '10:45',
    checkOut: '19:15',
    status: 'on-duty',
    notes: 'Observasi area kosmetik & daging segar, aman'
  },
  {
    id: 'att-6',
    employeeId: 'emp-106',
    employeeName: 'Yusuf Maulana',
    service: 'Parkir',
    siteName: 'Gedung Graha Mandiri Tower A & B',
    date: '2026-09-15',
    shift: 'Shift 1 (07:00 - 15:00)',
    checkIn: '06:55',
    checkOut: '15:02',
    status: 'on-duty',
    notes: 'Sirkulasi basement 1 tertib'
  }
];

export const INITIAL_ACTIVITIES = [
  {
    id: 'act-1',
    user: 'Nazi Rinaldi',
    role: 'operasional',
    action: 'Inspeksi Mendadak Selesai',
    description: 'Melakukan inspeksi mendadak kesiapan regu shift malam di Site Graha Mandiri Tower.',
    timestamp: '15 Sep 2026, 14:20'
  },
  {
    id: 'act-2',
    user: 'Siti Nurhaliza, S.Psi',
    role: 'hrd',
    action: 'Pembaruan Data Penempatan',
    description: 'Menerbitkan surat tugas penempatan 10 personil Man Power baru ke Site PT Logistik Nusantara Prima.',
    timestamp: '15 Sep 2026, 11:35'
  },
  {
    id: 'act-3',
    user: 'Dewi Kartika, S.E., Ak.',
    role: 'finance',
    action: 'Verifikasi Pembayaran Invoice',
    description: 'Mencatat pelunasan tagihan INV/BAR/2026/09/002 sebesar Rp 466.200.000 dari PT Logistik Nusantara Prima.',
    timestamp: '15 Sep 2026, 10:15'
  },
  {
    id: 'act-4',
    user: 'Rian Pratama, B.B.A',
    role: 'marketing',
    action: 'Peningkatan Tahap Prospek',
    description: 'Mengubah status prospek Plaza Simatupang Office Suites ke tahap Negosiasi Final.',
    timestamp: '15 Sep 2026, 09:30'
  },
  {
    id: 'act-5',
    user: 'Bhimasena Adhirajasa',
    role: 'owner',
    action: 'Otorisasi Rencana Kerja Q4',
    description: 'Menyetujui target penambahan 300 personil outsourcing dan pembukaan cabang regional Jawa Barat.',
    timestamp: '14 Sep 2026, 16:45'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Pembayaran Tagihan Masuk',
    message: 'Pembayaran INV/BAR/2026/09/002 sebesar Rp 466.200.000 telah diverifikasi masuk ke rekening Giro.',
    time: '2 jam yang lalu',
    unread: true,
    type: 'finance'
  },
  {
    id: 'notif-2',
    title: 'Permintaan Penawaran Baru',
    message: 'PT Sentra Megah Logistik mengajukan inquiry 50 kurir motor via portal publik.',
    time: '4 jam yang lalu',
    unread: true,
    type: 'marketing'
  },
  {
    id: 'notif-3',
    title: 'Masa Kontrak Menjelang Habis',
    message: 'Kontrak site Pabrik PT Surya Elektronik Sentosa berakhir dalam 60 hari.',
    time: '1 hari yang lalu',
    unread: false,
    type: 'hrd'
  },
  {
    id: 'notif-4',
    title: 'Kepatuhan SLA Lapangan',
    message: 'Laporan kehadiran seluruh site hari ini mencapai rata-rata 99.4%.',
    time: '1 hari yang lalu',
    unread: false,
    type: 'operasional'
  }
];

export const COMPANY_INFO = {
  name: 'PT. Bhimasena Adhirajasa Radhika',
  shortName: 'Bhimasena Radhika',
  tagline: 'Mitra Strategis Penyedia & Pengelola Tenaga Kerja Outsourcing Profesional',
  legal: 'Keputusan Menkumham RI No. AHU-0146154.AH.01.11. TAHUN 2023',
  nib: 'NIB : 0108230077863',
  address: 'Jl. Melati I RT. 002/RW.005 Kel. Tanah Tinggi Kec. Tangerang, Kota Tangerang, Banten 15119',
  phone: '0851 2479 9305',
  fax: '-',
  whatsapp: '0851 2479 9305',
  whatsappRecruitment: '0851 7433 4336',
  email: 'ptbimasenaadhirajasaradhika@gmail.com',
  operationalHours: 'Senin - Jumat: 08:00 - 17:00 WIB |  Sabtu: 08:00 - 12:00 WIB',
  operationalHoursWeekdays: 'Senin - Jumat: 08:00 - 17:00 WIB |',
  operationalHoursSaturday: 'Sabtu: 08:00 - 12:00 WIB',
  stats: [
    { value: '1,520+', label: 'Tenaga Kerja Aktif Lapangan', detail: 'Tersaring & terlatih' },
    { value: '48+', label: 'Mitra Perusahaan Nasional', detail: 'Kerjasama jangka panjang' },
    { value: '99.4%', label: 'Pencapaian Pemenuhan SLA', detail: 'Kehadiran & performa kerja' },
    { value: '14', label: 'Wilayah Layanan di Indonesia', detail: 'Jabodetabek, Jabar, Jatim, Jateng' }
  ],
  advantages: [
    {
      title: 'Kepatuhan Hukum & Legalitas Mutlak',
      desc: 'Seluruh tenaga kerja memiliki kontrak kerja resmi, jaminan BPJS Ketenagakerjaan & Kesehatan, serta penggajian patuh UMR.',
      icon: 'Scale'
    },
    {
      title: 'Skrining & Pelatihan Berkelanjutan',
      desc: 'Proses rekrutmen berbasis uji kompetensi, cek rekam jejak kriminal (SKCK), tes bebas narkoba, dan pembekalan berkala.',
      icon: 'GraduationCap'
    },
    {
      title: 'Supervisi Operasional 24/7',
      desc: 'Didukung oleh perwira pengawas lapangan berpengalaman dan tim tanggap darurat yang siap meluncur kapan saja.',
      icon: 'Activity'
    },
    {
      title: 'Sistem Penggantian Tenaga Cepat',
      desc: 'Jaminan penyediaan backup personil maksimal dalam tempo 3 jam jika terdapat anggota berhalangan sakit atau cuti.',
      icon: 'RefreshCw'
    },
    {
      title: 'Efisiensi Biaya & Beban HR Klien',
      desc: 'Klien bebas dari beban rekrutmen, administrasi pesangon, kompensasi, dan seragam, sehingga fokus ke bisnis inti.',
      icon: 'TrendingDown'
    },
    {
      title: 'Transparansi Laporan & Monitoring',
      desc: 'Klien mendapatkan akses laporan presensi, catatan patroli, dan performa SLA secara transparan dan terukur.',
      icon: 'FileBarChart2'
    }
  ],
  processSteps: [
    {
      step: '01',
      title: 'Konsultasi & Analisis Kebutuhan',
      desc: 'Kami mempelajari spesifikasi pekerjaan, profil risiko lingkungan, jumlah personil yang dibutuhkan, serta target SLA klien.'
    },
    {
      step: '02',
      title: 'Seleksi, Skrining & Pembekalan',
      desc: 'Penyaringan kandidat terbaik, pemeriksaan latar belakang dan tes kesehatan, dilanjutkan pembekalan SOP khusus site klien.'
    },
    {
      step: '03',
      title: 'Penempatan & Serah Terima Tugas',
      desc: 'Mobilisasi personil ke lokasi klien dengan kelengkapan seragam, atribut, identitas kerja, dan pengenalan manajerial.'
    },
    {
      step: '04',
      title: 'Supervisi & Evaluasi Berkala',
      desc: 'Inspeksi rutin oleh Danru/Spv, pemantauan kehadiran harian, dan evaluasi bulanan bersama pimpinan klien.'
    }
  ],
  testimonials: [
    {
      quote: 'PT. Bhimasena Adhirajasa Radhika telah mengelola 45 personel satuan pengamanan dan parkir di gedung komersial kami dengan kedisiplinan luar biasa. Komplain tenant menurun drastis.',
      author: 'Bambang Soediro',
      role: 'Building Manager',
      company: 'PT Menara Graha Mandiri'
    },
    {
      quote: 'Kebutuhan armada kurir kami melonjak saat peak season, dan Bhimasena mampu menyediakan puluhan rider terlatih hanya dalam hitungan hari dengan SLA on-time di atas 99%.',
      author: 'Farhan Maulana',
      role: 'Operations Director',
      company: 'PT Logistik Nusantara Prima'
    },
    {
      quote: 'Tim Loss Prevention dari Bhimasena sangat cermat dalam mendeteksi kebocoran barang di supermarket kami. Angka shrinkage inventaris berhasil ditekan hingga 65% dalam 6 bulan.',
      author: 'Jessica Tanuwidjaja',
      role: 'Head of Store Operations',
      company: 'Super Indo Mitra Ritel Group'
    }
  ],
  faqs: [
    {
      question: 'Apakah seluruh tenaga kerja Bhimasena dilindungi BPJS dan mematuhi regulasi ketenagakerjaan?',
      answer: 'Ya, 100% tenaga kerja yang kami tempatkan terdaftar dalam program BPJS Ketenagakerjaan (JKK, JKM, JHT, JP) dan BPJS Kesehatan, serta menerima upah sesuai ketentuan UMR/UMK wilayah penempatan tanpa potongan ilegal.'
    },
    {
      question: 'Bagaimana penanganan jika personil yang ditempatkan berhalangan hadir atau sakit?',
      answer: 'Kami memiliki cadangan tenaga standby (buffer team) untuk setiap sektor layanan. Tim cadangan akan langsung dimobilisasi menggantikan personil yang berhalangan dalam tempo maksimal 2-3 jam tanpa biaya tambahan.'
    },
    {
      question: 'Layanan outsourcing apa saja yang saat ini disediakan oleh PT. Bhimasena Adhirajasa Radhika?',
      answer: 'Kami melayani 6 pilar utama: 1) Pengamanan / Security bersertifikasi Gada Pratama/Madya, 2) Ekspedisi Kurir & logistik, 3) Man Power (pabrik, gudang, staf kantor), 4) Cleaning Service & sanitasi komersial, 5) Petugas & Pengelolaan Parkir, dan 6) Loss Prevention untuk pencegahan penyusutan aset ritel.'
    },
    {
      question: 'Berapa lama estimasi waktu mobilisasi tenaga kerja setelah kontrak SPK disepakati?',
      answer: 'Untuk kebutuhan reguler (10-50 personil), mobilisasi umumnya dapat dituntaskan dalam kurun waktu 7 hingga 14 hari kalender, mencakup seleksi khusus, penyesuaian seragam, dan induksi SOP klien.'
    },
    {
      question: 'Bagaimana tata cara mengajukan penawaran kerjasama atau konsultasi kebutuhan?',
      answer: 'Anda dapat mengisi formulir konsultasi kebutuhan di situs ini, menghubungi hotline WhatsApp kami di +62 0851 2479 9305, atau mengirimkan email ke ptbimasenaadhirajasaradhika@gmail.com. Tim Business Development kami akan merespons dalam waktu 1x24 jam kerja.'
    }
  ]
};
