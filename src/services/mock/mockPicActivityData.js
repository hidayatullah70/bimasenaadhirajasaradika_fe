/**
 * Mock Data & Constants for PIC (Koordinator Lapangan) Activity Reports — PT. BARAK IOMS
 * Source of Truth: Operasional Lapangan & Supervisi Area.
 */

export const PIC_LIST = [
  'PIC 1',
  'PIC 2',
  'PIC 3',
  'PIC 4',
  'PIC 5',
  'PIC 6',
  'PIC 7',
  'PIC 8',
];

export const VISIT_REGIONS = [
  'Tangerang & Banten (Area Barat)',
  'Jakarta Barat & Daan Mogot',
  'Jakarta Timur & Kawasan Industri Cakung',
  'Jakarta Utara & Pelabuhan Tanjung Priok',
  'Jakarta Pusat & Komersial Sudirman',
  'Jakarta Selatan & TB Simatupang',
  'Bekasi & Cikarang (Area Timur)',
  'Bogor & Depok (Area Selatan)',
];

// Sample SVG placeholder 16:9 for seed data (960x540)
const sample16x9Svg = (title, location) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#1E293B" />
      </linearGradient>
    </defs>
    <rect width="960" height="540" fill="url(#bg)" />
    <circle cx="480" cy="270" r="160" fill="#BA1D23" opacity="0.12" />
    <path d="M480 180 L520 250 L440 250 Z" fill="#BA1D23" opacity="0.8" />
    <rect x="440" y="270" width="80" height="8" rx="4" fill="#F9CE3B" />
    <text x="480" y="320" font-family="sans-serif" font-size="24" font-weight="bold" fill="#F8FAFC" text-anchor="middle">${title}</text>
    <text x="480" y="360" font-family="sans-serif" font-size="16" fill="#94A3B8" text-anchor="middle">${location} • Foto Kunjungan 16:9 HD</text>
    <rect x="30" y="30" width="130" height="32" rx="6" fill="#BA1D23" opacity="0.9" />
    <text x="95" y="52" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ASPECT 16:9</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_PIC_ACTIVITY_REPORTS = [
  {
    id: 'RPT-KORLAP-2026-001',
    picName: 'PIC 1',
    lokasiKunjungan: 'Tangerang & Banten (Area Barat)',
    namaLokasi: 'Central Hub JNT Rawa Bokor',
    tanggalKunjungan: '2026-09-28',
    jamKunjungan: '09:30',
    mingguKe: 4,
    bulan: '09',
    tahun: '2026',
    fotoKunjungan: sample16x9Svg('Inspeksi Regu Pagi & Kerapian Seragam', 'Central Hub JNT Rawa Bokor'),
    fotoMeta: { ratio: '16:9', width: 1280, height: 720 },
    isiKegiatan: 'Melakukan apel pagi dan briefing SOP pemeriksaan muatan armada kurir. Memeriksa kerapian seragam kemeja, badge kewenangan, dan kelengkapan tongkat T serta borgol 12 personel security. Seluruh personel hadir lengkap dan pos penjagaan bersih.',
    status: 'DIVERIFIKASI',
    verifiedAt: '2026-09-28T14:00:00Z',
    verifiedBy: 'Nazi Rinaldi (Head Operasional)',
    createdAt: '2026-09-28T10:15:00Z',
  },
  {
    id: 'RPT-KORLAP-2026-002',
    picName: 'PIC 2',
    lokasiKunjungan: 'Jakarta Barat & Daan Mogot',
    namaLokasi: 'Gateway Surya Dunia Daan Mogot',
    tanggalKunjungan: '2026-09-29',
    jamKunjungan: '14:15',
    mingguKe: 4,
    bulan: '09',
    tahun: '2026',
    fotoKunjungan: sample16x9Svg('Pengecekan Perimeter & Logbook Gerbang', 'Gateway Surya Dunia Daan Mogot'),
    fotoMeta: { ratio: '16:9', width: 1280, height: 720 },
    isiKegiatan: 'Supervisi pos jaga pintu masuk ekspedisi kargo. Menguji fungsi CCTV pantau gerbang utama dan memastikan logbook kendaraan ekspedisi keluar-masuk dicatat teliti. Koordinasi dengan Supervisor Lapangan Klien mengenai pengamanan menjelang lonjakan paket awal bulan.',
    status: 'TERKIRIM',
    verifiedAt: null,
    verifiedBy: null,
    createdAt: '2026-09-29T15:00:00Z',
  },
  {
    id: 'RPT-KORLAP-2026-003',
    picName: 'PIC 3',
    lokasiKunjungan: 'Jakarta Timur & Kawasan Industri Cakung',
    namaLokasi: 'Gudang Megah Jaya Cakung',
    tanggalKunjungan: '2026-09-30',
    jamKunjungan: '11:00',
    mingguKe: 5,
    bulan: '09',
    tahun: '2026',
    fotoKunjungan: sample16x9Svg('Uji Tekanan APAR & Jalur Evakuasi', 'Gudang Megah Jaya Cakung'),
    fotoMeta: { ratio: '16:9', width: 1280, height: 720 },
    isiKegiatan: 'Pengecekan fasilitas keselamatan K3 dan fire protection di area pergudangan. Melakukan inspeksi fisik pada 6 tabung APAR serbuk kimia di Pos Barat, memastikan pin pengaman masih utuh dan jarum barometer berada di zona hijau normal.',
    status: 'TERKIRIM',
    verifiedAt: null,
    verifiedBy: null,
    createdAt: '2026-09-30T11:45:00Z',
  },
  {
    id: 'RPT-KORLAP-2026-004',
    picName: 'PIC 4',
    lokasiKunjungan: 'Jakarta Utara & Pelabuhan Tanjung Priok',
    namaLokasi: 'Terminal Logistik Kargo Prima Priok',
    tanggalKunjungan: '2026-10-01',
    jamKunjungan: '10:00',
    mingguKe: 1,
    bulan: '10',
    tahun: '2026',
    fotoKunjungan: sample16x9Svg('Koordinasi Otoritas Pelabuhan & Shift Siang', 'Terminal Logistik Priok'),
    fotoMeta: { ratio: '16:9', width: 1280, height: 720 },
    isiKegiatan: 'Kunjungan rutin dan koordinasi dengan manajer keamanan setempat. Personel satuan pengamanan shift siang menjalankan tugas pemeriksaan kontainer dengan tertib. Tidak ditemukan potensi kerawanan keamanan.',
    status: 'TERKIRIM',
    verifiedAt: null,
    verifiedBy: null,
    createdAt: '2026-10-01T10:45:00Z',
  },
  {
    id: 'RPT-KORLAP-2026-005',
    picName: 'PIC 1',
    lokasiKunjungan: 'Tangerang & Banten (Area Barat)',
    namaLokasi: 'Bona City Center Mall',
    tanggalKunjungan: '2026-10-02',
    jamKunjungan: '16:00',
    mingguKe: 1,
    bulan: '10',
    tahun: '2026',
    fotoKunjungan: sample16x9Svg('Briefing Valet & Pengamanan Parkir', 'Bona City Center Mall'),
    fotoMeta: { ratio: '16:9', width: 1280, height: 720 },
    isiKegiatan: 'Briefing tim pengamanan parkir dan valet runner. Memastikan prosedur ticketing parkir berjalan cepat untuk menghindari antrean kendaraan di gerbang masuk akhir pekan.',
    status: 'TERKIRIM',
    verifiedAt: null,
    verifiedBy: null,
    createdAt: '2026-10-02T16:30:00Z',
  },
];
