# UI-GUIDELINE — PT. BARAK IOMS
**Versi:** 2.0 (Standardized Design System & Component Library)  
**Tanggal:** 29 September 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Sinkronisasi:** Mengintegrasikan `DASHBOARD_UX_V2.md`, standarisasi komponen UI `src/components/ui/`, dan panduan landing page Vercel baseline.

---

## 1. Arah Visual & Prinsip Desain
- **Modern Enterprise:** Profesional, bersih, padat informasi namun tetap memiliki ruang pernapasan visual (*breathable*).
- **No Static/Fake KPIs:** Seluruh indikator kinerja (KPI) dihitung secara dinamis dari data relasional aktif, tidak menggunakan angka statis/palsu.
- **Keterbukaan Status:** Status operasional tidak pernah mengandalkan warna semata; selalu dipadukan dengan teks dan ikon yang jelas.
- **Graceful Error Recovery:** Setiap kegagalan sistem ditangani oleh komponen pemulihan elegan (*Error Boundary* & *StateViews*).

---

## 2. Token Warna & Tipografi Resmi (Design Tokens)

### 2.1 Palet Warna Utama
```css
--primary-red: #BA1D23;      /* Aksen primer, tombol penting, peringatan bahaya */
--primary-yellow: #F9CE3B;   /* Aksen emas/kuning, highlight bintang/warning */
--accent-green: #32B23E;     /* Hijau navbar publik, status aktif, border sorotan */
--ink: #0F172A;              /* Latar hero gelap, teks utama pekat */
--slate: #334155;            /* Teks sekunder, pembatas */
--muted: #64748B;            /* Teks placeholder, deskripsi tabel */
--border: #E2E8F0;           /* Garis batas kartu dan tabel */
--canvas: #F8FAFC;           /* Latar belakang dashboard internal */
--surface: #FFFFFF;          /* Latar belakang kartu, modal, dan drawer */
--info: #2563EB;             /* Biru status informasi */
--warning: #D97706;          /* Oranye status perhatian/tinjauan */
--danger: #DC2626;           /* Merah status kedaluwarsa/gagal */
--success: #16A34A;          /* Hijau status berhasil/disetujui */
```

### 2.2 Hierarki Tipografi
- **Primary System UI:** `Inter`, `system-ui`, `-apple-system`, `sans-serif`.
- **Futuristic / Brand Accent:** `Orbitron` (`font-orbitron`), digunakan secara eksklusif untuk kode identifikasi teknis, versi sistem, dan hak cipta pengembang.
- **Angka Finansial & KPI:** Menggunakan format angka tabular (`font-mono` atau `tabular-nums`) untuk keterbacaan metrik.

---

## 3. Pustaka 12 Komponen Antarmuka Terstandarisasi (`src/components/ui/`)

Seluruh modul internal wajib memanfaatkan komponen standar yang telah disediakan di `src/components/ui/index.js`:

1. **`PageHeader`:** Judul halaman, subtitle penjelasan, breadcrumbs navigasi, dan tombol aksi primer/sekunder.
2. **`Breadcrumbs`:** Penunjuk lokasi hierarki rute interaktif dengan ikon pemisah chevron.
3. **`Table`:** Komponen tabel tabular dengan dukungan header sticky, zebra striping, indikator kosong, dan baris aksi.
4. **`Drawer`:** Panel samping off-canvas geser (*slide-over*) untuk menampilkan profil detail entitas (misal: rincian karyawan).
5. **`Pagination`:** Navigasi nomor halaman, tombol Previous/Next, dan ringkasan jumlah baris data.
6. **`Tabs`:** Tab navigasi horizontal dengan indikator garis bawah aktif untuk beralih antar-subkategori data.
7. **`FormField`:** Komponen input formulir terpadu (label, teks bantuan, pesan kesalahan validasi, status wajib `*`).
8. **`Button`:** Tombol varian `primary`, `secondary`, `outline`, `ghost`, `danger` dengan dukungan status `loading` spinner.
9. **`Badge`:** Lencana status kecil dengan varian warna semantik (`success`, `warning`, `danger`, `info`, `neutral`).
10. **`Modal`:** Kotak dialog terpusat dengan backdrop blur, penanganan tombol Escape, dan animasi transisi halus.
11. **`PageLoader`:** Indikator animasi pemuatan layar penuh (*fullscreen loader*) untuk React Suspense chunk loading.
12. **`StateViews` (`EmptyState`, `LoadingState`, `ErrorState`):** Penanganan status visual global untuk data kosong, pemuatan kerangka (*skeleton*), dan kegagalan API.

---

## 4. Standar Penanganan Error & Notifikasi Toast

### 4.1 Route Error Boundary (`src/components/layout/RouteErrorBoundary.jsx`)
Jika terjadi *runtime exception* pada modul internal:
- Sistem tidak menampilkan pesan error teknis mentah atau layar putih.
- Menampilkan kartu dialog resmi PT. BARAK dengan ikon peringatan, pesan deskriptif, dan dua tombol pemulihan:
  1. **Muat Ulang (`RefreshCw`):** Memuat ulang halaman browser (`window.location.reload()`).
  2. **Kembali ke Operasional (`Home`):** Mengarahkan kembali ke rute aman `/ops`.

### 4.2 Notifikasi Toast (`react-hot-toast`)
- **Sukses:** `toast.success("Pesan aksi berhasil...")` — durasi 3 detik, warna hijau.
- **Peringatan/Gagal:** `toast.error("Pesan kendala...")` — durasi 4 detik, warna merah.

---

## 5. Standar Format Spreadsheet Presensi Posko (Attendance Sheet)

Pada halaman `/ops/hrd/attendance-spreadsheet`:
- **Kolom Terkunci (Read-Only):** ID Karyawan, NIK, Nama Lengkap, Layanan, Jabatan, Klien, Lokasi Posko, Jadwal Shift Masuk/Pulang.
- **Kolom Terbuka untuk HRD:** Jam Masuk Aktual (*Check-in*), Jam Pulang Aktual (*Check-out*), Keterangan.
- **Kolom Kalkulasi Otomatis:** Total Jam Kerja, Status Presensi (`TEPAT_WAKTU`, `TERLAMBAT`, `PULANG_CEPAT`, `LEMBUR`), Selisih Jam.
- **Aksi Siklus:** Simpan Draf $\rightarrow$ Validasi Jam Kerja $\rightarrow$ Finalisasi (Mengunci Permanen) $\rightarrow$ Ekspor Excel/CSV.

---

## 6. Standar Halaman Landing Page Publik (STRICTLY FROZEN BASELINE)

Sesuai aturan tata kelola, antarmuka publik yang mengacu pada baseline Vercel tetap dipertahankan 100% utuh:

### 6.1 Navbar Publik
- Latar belakang default hijau `--accent-green` (`#32B23E`), transisi scroll menjadi putih transparan dengan efek `backdrop-blur-md`.
- Breakpoint sinkron pada `lg` (1024px).
- Quick Search pill di navbar dengan pencarian kata kunci cerdas.
- Tombol CTA merah "Hubungi Kami" mengarah ke `/contact`.

### 6.2 Dark Hero Headers & Badges
- Menggunakan latar belakang gelap pekat (`bg-ink py-20`) dengan padding `w-full px-4 sm:px-6 lg:px-8`.
- Hero pill badge menggunakan format hijau seragam: `bg-accent-green/20 text-accent-green border border-accent-green/30`.

### 6.3 Halaman Kontak (`/contact`) & Floating Admin CTA
- Peta Google Maps resmi kantor Tangerang PT. BARAK.
- Dual channel WhatsApp (Konsultasi `0851 2479 9305` dan Karir `0851 8784 5044`).
- Floating CTA 3D emerald sphere di kanan bawah dengan popover cepat ke WhatsApp dan tombol Back-to-Top.
- Modal lamaran kerja terstruktur (`JobApplicationModal`) dengan validasi eKTP, rekening bank, dan nomor SIM khusus pengemudi/kurir.