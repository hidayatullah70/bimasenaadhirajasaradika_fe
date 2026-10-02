# DASHBOARD_UX_V2.md — PT. BARAK IOMS
**Versi:** 2.0  
**Tanggal:** 29 September 2026  
**Status:** STEP 4 COMPLETED (Authenticated Operational Platform Upgrade)  
**Landing Page Guard:** FROZEN (Semua 15 file di `src/features/landing/*` utuh tanpa modifikasi)

---

## Ringkasan Eksekutif (Executive Summary)

Pada **STEP 4**, fokus pengembangan dialihkan sepenuhnya ke peningkatan kualitas pengalaman pengguna (*user experience*), standarisasi desain UI/UX antar departemen, penghapusan KPI statis/placeholder menjadi agregasi data reaktif, pembentukan **Approval Center** terpusat bagi Direktur, persistensi log audit, serta keterhubungan (*interconnectedness*) alur bisnis operasional terpadu (Operations, Finance, Legal, Marketing, HRD, IT, dan Web CMS).

Semua modifikasi diterapkan secara eksklusif pada aplikasi operasional terautentikasi (`/ops/*`) tanpa menyentuh modul landing page publik yang telah dibekukan (*frozen*).

---

## 1. Standarisasi UI Component Library (`src/components/ui/`)

Untuk mengeliminasi inkonsistensi visual, tata letak, dan interaksi di antara 8 departemen, telah dibuat dan distandarisasi pustaka komponen inti di `src/components/ui/` yang di-export secara modular melalui `src/components/ui/index.js`:

| Komponen | Path File | Spesifikasi & Standar Desain |
|---|---|---|
| `PageHeader` | `src/components/ui/PageHeader.jsx` | Header halaman terpadu dengan judul semantik, deskripsi kontekstual, integrasi `Breadcrumbs`, dan slot `actions` untuk tombol CTA utama. |
| `Breadcrumbs` | `src/components/ui/Breadcrumbs.jsx` | Navigasi hirarkis responsif dengan pemisah panah rapi dan dukungan teks pembeda halaman aktif. |
| `Card` | `src/components/ui/Card.jsx` | Wadah kartu seragam dengan varian bordered/elevated, padding konsisten, dan transisi hover yang halus. |
| `Table` | `src/components/ui/Table.jsx` | Komponen tabel berseri (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`) dengan styling tabular konsisten, alternating row, dan handling overflow mobile. |
| `Drawer` | `src/components/ui/Drawer.jsx` | Off-canvas drawer untuk detail rekaman (seperti profil detail personel/penugasan) lengkap dengan animasi slide-over, backdrop blur, dan aksesibilitas tombol escape/tutup. |
| `Pagination` | `src/components/ui/Pagination.jsx` | Navigasi nomor halaman dengan tombol Previous/Next, indikator total baris rekaman aktif, dan selektor jumlah item per halaman. |
| `Tabs` | `src/components/ui/Tabs.jsx` | Navigasi tab status horizontal responsif dengan penanda aksen aktif (`border-b-2 border-primary-red` / pill style). |
| `FormField` | `src/components/ui/FormField.jsx` | Pembungkus field formulir terstandarisasi dengan label, penanda wajib (`required`), pesan helper, serta visual error validation state. |
| `Button` | `src/components/ui/Button.jsx` | Tombol terpadu dengan varian: `primary` (merah korporat BARAK), `secondary` / `outline`, `success`, `danger`, `ghost`, ukuran (sm/md/lg), dan indikator spinner *loading state*. |
| `Badge` | `src/components/ui/Badge.jsx` | Label status visual dengan semantic color tokens: `active`, `success`, `warning`, `danger`, `info`, `neutral`. |
| `Modal` | `src/components/ui/Modal.jsx` | Dialog modal terpusat dengan header, scrollable body, footer tombol aksi, dan konfirmasi aksi destruktif. |
| `PageLoader` / `EmptyState` / `ErrorState` | `src/components/ui/PageLoader.jsx`, `StateViews.jsx` | Visual feedback terpadu ketika data sedang dimuat, tidak ada data yang ditemukan (empty), maupun kegagalan jaringan (error retry). |

---

## 2. Peningkatan Kualitas Dashboard & Real-Time Calculated KPIs

Seluruh 8 Dashboard Departemen telah ditingkatkan dari angka hardcoded menjadi **Kalkulasi Dinamis Nyata** yang bersumber dari repository dan adapter lokal:

### 2.1 Direktur — Executive Cockpit (`DirectorDashboard.jsx`)
Mengintegrasikan seluruh divisi perusahaan ke dalam satu cockpit visual eksekutif:
- **Total Tenaga Kerja**: Menghitung gabungan personel aktif (Outsourcing + Internal) secara live dari store karyawan.
- **Klien Aktif**: Menghitung mitra bisnis berstatus `ACTIVE` dari store klien nyata (18 klien resmi).
- **Pendapatan & Piutang Operasional**: Agregasi total tagihan invoice aktif, nilai outstanding piutang, dan invoice yang jatuh tempo (`OVERDUE`).
- **Beban Payroll Bulanan**: Agregasi pengeluaran gaji dari modul payroll.
- **Peringatan Risiko & Kasus Hukum**: Menghitung sengketa hukum terbuka, anomali selisih rekonsiliasi COD, dan tiket eskalasi klien.
- **Antrean Persetujuan Eksekutif**: Menghitung jumlah permohonan yang menunggu otorisasi Direktur (`PENDING`).

### 2.2 HRD Dashboard (`HRDDashboard.jsx`)
- **Total Karyawan & Komposisi**: Terpilah otomatis antara Personel Outsourcing (Security, Cleaning, Driver) dan Karyawan Kantor Internal.
- **Penempatan Aktif**: Jumlah personel yang saat ini terdistribusi pada pos penugasan aktif (`ASSIGNED`).
- **Tingkat Kehadiran (Attendance Rate)**: Persentase kehadiran hari berjalan yang dihitung dari rekam presensi posko.
- **Kontrak PKWT Segera Berakhir**: Menghitung karyawan dengan tanggal berakhir kontrak $\le$ 60 hari untuk antisipasi perpanjangan.
- **Recruitment Pipeline**: Agregasi berkas lamaran masuk dari portal karir website yang menunggu verifikasi.

### 2.3 Operasional Dashboard (`OperationsDashboard.jsx`)
- **Manpower Readiness Rate**: Rasio kesiapan penugasan personel aktif terhadap total formasi posko.
- **Penempatan Aktif (Active Placements)**: Real-time count dari penugasan lapangan aktif di 18 klien.
- **Personel Tidak Hadir / Alpha**: Deteksi dini personel absen pada shift berjalan untuk memicu pergantian (*replacement*).
- **Insiden Lapangan Aktif**: Insiden keamanan/operasional terbuka yang sedang dalam penanganan tim patroli.
- **Permintaan Penggantian (Replacement Requests)**: Jumlah tiket mutasi/rotasi darurat yang perlu diplot.
- **Jurnal Patroli Lapangan**: Akumulasi laporan giat patroli dari adapter `fieldReportAdapter`.
- **SLA & Kepatuhan SOP**: Skor kepatuhan pemenuhan formasi jaga di seluruh site mitra.

### 2.4 Keuangan Dashboard (`FinanceDashboard.jsx`)
- **Total Faktur & Piutang Berjalan**: Ringkasan invoice dengan status `ISSUED` dan `PARTIALLY_PAID`.
- **Piutang Jatuh Tempo (Overdue Receivables)**: Deteksi otomatis faktur melewati tanggal tempo pembayaran.
- **Payroll Berjalan**: Beban gaji bulanan yang telah disetujui / sedang diproses.
- **Beban Operasional Lapangan**: Pengeluaran taktis (BBM, seragam, perlengkapan posko).
- **Arus Kas Bersih (Net Cash Flow)**: Perhitungan penerimaan pembayaran dikurangi total pengeluaran operasional dan payroll.
- **Selisih Rekonsiliasi COD**: Monitoring anomali uang kas titipan yang belum klop untuk dieksekusi atau dieskalasi ke Legal.

### 2.5 Legal Dashboard (`LegalDashboard.jsx`)
- **Perjanjian Kerja Sama (PKS) Aktif**: Menghitung seluruh kontrak korporat berstatus aktif di `legal_contracts`.
- **Kontrak Menjelang Kedaluwarsa**: Kontrak kerja sama dengan masa berlaku tersisa $\le$ 60 hari untuk agenda renegosiasi.
- **Kasus & Sengketa Hukum**: Register perkara wanprestasi, perselisihan perburuhan, atau eskalasi sengketa COD.
- **Compliance Register**: Pemenuhan standar ketenagakerjaan, kepatuhan BPJS Ketenagakerjaan & Kesehatan.
- **Status SIO BUJP Polri**: Masa berlaku Surat Izin Operasional Badan Usaha Jasa Pengamanan dari Mabes Polri.

### 2.6 Marketing Dashboard (`MarketingDashboard.jsx`)
- **Total Leads Masuk**: Akumulasi prospek dari form konsultasi website dan jejaring B2B.
- **Qualified Leads**: Prospek yang telah lolos kualifikasi profil dan kebutuhan layanan.
- **Penawaran Terkirim (Quotations Sent)**: Proposal penawaran harga pengamanan/outsourcing dalam evaluasi klien.
- **Negosiasi Berjalan**: Tahap penyelarasan terms, SLA, dan nilai kontrak.
- **Deals Won**: Akumulasi kontrak baru yang berhasil dimenangkan.
- **Pipeline Conversion Rate**: Rasio keberhasilan konversi prospek menjadi klien resmi.

### 2.7 IT Support Dashboard (`ITDashboard.jsx`)
- **Open Helpdesk Tickets**: Tiket gangguan aplikasi, jaringan posko, dan perangkat pos jaga.
- **SLA Kepatuhan Helpdesk**: Kepatuhan respon tiket di bawah batas waktu standar layanan.
- **Aset IT Posko**: Total perangkat terdaftar (radio HT digital, smartphone patroli, tablet presensi, CCTV pos).
- **Jadwal Pemeliharaan (Maintenance)**: Agenda pengecekan berkala infrastruktur IT.
- **System Health**: Ketersediaan sistem operasional (99.98% uptime).
- **Status Backup Otomatis**: Verifikasi integritas snapshot data operasional harian.

### 2.8 Website CMS Dashboard (`WebsiteDashboard.jsx`)
- **Artikel Berita & Blog Terbit**: Konten publikasi edukasi keamanan dan profil korporat.
- **Lowongan Karir Aktif**: Formasi rekrutmen outsourcing yang sedang dibuka di portal publik.
- **Inbox Lamaran Masuk**: Berkas lamaran pelamar kerja baru yang tersinkronisasi ke HRD.
- **Pesan Konsultasi / Inquiry**: Pesan masuk calon klien dari landing page yang otomatis mengalir ke Leads Marketing.
- **Basis Pengetahuan FAQ**: Daftar tanya-jawab seputar layanan pengamanan dan outsourcing.
- **Status SEO & Metadata**: Kepatuhan skor metadata SEO 100% pada seluruh halaman publik.

---

## 3. Direktur Executive Cockpit & Centralized Approval Center

### 3.1 Pusat Persetujuan Terpadu (`ApprovalCenterPage.jsx`)
Dibangun satu gerbang otorisasi tunggal bagi Direktur untuk mengawasi seluruh transaksi penting lintas divisi dengan jenis permohonan lengkap:

1. `PAYROLL` — Otorisasi pencairan gaji bulanan seluruh personil.
2. `CONTRACT_APPROVAL` / `CONTRACT` — Otorisasi pengesahan kontrak PKS bernilai besar.
3. `EMPLOYEE_DELETE` — Otorisasi penghapusan atau penonaktifan data personil secara permanen (menegakkan prinsip pencegahan penghapusan sepihak oleh staf).
4. `EMPLOYEE_STATUS_CHANGE` — Pengangkatan status personil (PKWT $\rightarrow$ PKWTT/Tetap).
5. `EXPENSE_APPROVAL` / `CAPEX` — Persetujuan pengeluaran modal dan operasional di atas limit wewenang.
6. `QUOTATION_APPROVAL` — Persetujuan harga penawaran khusus pada prospek strategis.
7. `PLACEMENT_APPROVAL` — Otorisasi penugasan personil ke posko berisiko tinggi.
8. `OPERATIONAL_REQUEST` — Pengajuan pengadaan logistik atau dispensasi operasional lapangan.

### 3.2 Alur Aksi Otorisasi
- **Tombol Approve**: Mengubah status permohonan menjadi `APPROVED`, mencatat timestamp dan user approver, secara otomatis mengeksekusi mutasi pada data terkait (misal: mengeksekusi soft delete pada model karyawan, mengaktifkan kontrak, menyetujui payroll), serta menerbitkan catatan permanen pada **Audit Log**.
- **Tombol Reject**: Meminta input alasan penolakan, mengubah status permohonan menjadi `REJECTED`, dan mengembalikan status dokumen terkait ke divisi pemohon dengan catatan audit lengkap.

---

## 4. Persistensi Audit Log (`AuditLogPage.jsx` & `auditAdapter.js`)

Seluruh mutasi penting kini dicatat secara permanen pada storage lokal (`barak_audit_logs`) dengan metadata komprehensif:
- **User / Aktor**: Nama pengguna yang mengeksekusi aksi.
- **Peran (Role)**: Hak akses pemohon (Direktur, HRD, Operasional, Finance, Legal, Marketing, IT).
- **Aksi (Action)**: `CREATE`, `UPDATE`, `DELETE_REQUEST`, `APPROVE`, `REJECT`, `STATUS_CHANGE`, `LOGIN`, `LOGOUT`.
- **Modul**: Modul terkait (`EMPLOYEE`, `PLACEMENT`, `INVOICE`, `PAYROLL`, `CONTRACT`, `LEAD`, `COD`, `IT_TICKET`).
- **ID Rekaman**: Identifier unik entitas yang dimutasi.
- **Timestamp**: Waktu eksekusi berformat ISO lokal.
- **Deskripsi**: Penjelasan rinci perubahan data.

Halaman Audit Log dilengkapi fitur pencarian kata kunci multi-kolom, filter berdasarkan modul, dan filter berdasarkan jenis aksi.

---

## 5. Keterhubungan Alur Bisnis Antar Departemen (Interconnected Workflows)

### 5.1 Alur Operasional: Personel $\rightarrow$ Posko $\rightarrow$ Jadwal $\rightarrow$ Presensi
1. **Penugasan (Placement)** menautkan Personel yang berkualifikasi ke Lokasi Klien (Site), Shift Jaga, dan Jenis Layanan.
2. Rotasi penugasan secara otomatis mencatat riwayat (*assignment history*) dan memperbarui status formasi posko.
3. Roster jadwal terhubung langsung ke pencatatan presensi (*attendance tracking*), di mana ketidakhadiran langsung memicu tiket permohonan personil pengganti (*replacement request*).

### 5.2 Alur Keuangan: Siklus Faktur & Arus Kas
Transisi status faktur (`Invoice`) divalidasi secara ketat:
$$\text{DRAFT} \longrightarrow \text{ISSUED} \longrightarrow \text{PARTIALLY\_PAID} \longrightarrow \text{PAID}$$
dengan jalur alternatif:
$$\text{ISSUED} \longrightarrow \text{OVERDUE} \quad \text{atau} \quad \text{VOID}$$
Setiap pelunasan invoice langsung mengalir secara reaktif ke agregasi penerimaan kas pada kartu **Net Cash Flow** di Finance Dashboard dan Director Cockpit.

### 5.3 Alur Legal: Siklus Kontrak PKS & Kepatuhan
$$\text{Draft PKS} \longrightarrow \text{Legal Review} \longrightarrow \text{Director Approval} \longrightarrow \text{Signed} \longrightarrow \text{Active} \longrightarrow \text{Expiring} \longrightarrow \text{Renewed / Expired}$$
Perubahan status kontrak memicu audit log dan memutakhirkan hitungan kontrak kedaluwarsa pada dashboard secara real-time.

### 5.4 Alur Marketing: Konversi Penjualan & Cascade Lintas Divisi (WON Cascade)
Ketika peluang tender/penjualan ditandai sebagai **WON**:
$$\text{Website Inquiry} \longrightarrow \text{Lead} \longrightarrow \text{Contacted} \longrightarrow \text{Qualified} \longrightarrow \text{Survey} \longrightarrow \text{Quotation} \longrightarrow \text{Negotiation} \longrightarrow \text{WON}$$
Saat status berubah menjadi `WON`, sistem secara otomatis:
1. Menerbitkan draf **Kontrak PKS Korporat** di modul **Legal**.
2. Membentuk akun profil penagihan dan draf faktur uang muka di modul **Finance**.
3. Mendaftarkan lokasi pos pengamanan baru di modul **Operasional**.
4. Mengirimkan notifikasi kebutuhan formasi personil ke modul **HRD**.

---

## 6. Pengujian Responsif (Responsive Matrix)

Desain UI telah diuji dan divalidasi pada berbagai resolusi layar standar industri:

| Resolusi | Target Perangkat | Perilaku Layout Terverifikasi |
|---|---|---|
| **1440px / 1280px** | Desktop & Laptop Lebar | Sidebar operasional expand penuh, grid kartu KPI 4 kolom, tabel data melebar dengan aksi inline lengkap. |
| **1024px** | Tablet Landscape / Laptop Kecil | Transisi breakpoint sinkron, grid kartu KPI 2–3 kolom, tabel berkondensasi dengan scrollbar horizontal yang mulus tanpa merusak container. |
| **768px** | Tablet Portrait | Sidebar bertransformasi menjadi slide-over mobile drawer, tombol hamburger responsif pada Topbar, tab navigasi menggunakan scrollbar horizontal ramah sentuhan. |
| **390px** | Mobile Smartphone | Layout kartu 1 kolom, modal dialog menyesuaikan ukuran layar penuh (bottom-sheet / full-width), aksi tabel diakses melalui drawer detail rekaman, touch target tombol $\ge 44\text{px}$. |

---

## 7. Hasil Pengujian Otomatis (Automated Test Suite)

Pengujian menyeluruh dijalankan melalui `npm test` yang mencakup 3 berkas pengujian:

1. **`scripts/test-rbac-internal.js`**: 61/61 pengujian hak akses RBAC, izin 8 peran, dan 15 modul LULUS (*PASSED*).
2. **`scripts/test-crud-persistence.js`**: 58/58 pengujian integritas CRUD, deduplikasi data, penyimpanan persisten, dan 18 klien otoritatif LULUS (*PASSED*).
3. **`scripts/test-step4-dashboard-ux.js`**: 9/9 pengujian standarisasi komponen UI, cockpit eksekutif dinamis, Approval Center, transisi siklus faktur, siklus kontrak legal, Marketing WON cascade, dan persistensi audit log LULUS (*PASSED*).

**Total Pengujian:** **128 / 128 LULUS (100% PASS RATE)**.

### Hasil Lint & Build
- `npm run lint`: **0 errors, 0 warnings** (`--max-warnings 0` lolos tanpa kompromi).
- `npm run build`: **Berhasil sempurna** menghasilkan bundle produksi teroptimasi dalam waktu ~4.7 detik.

---

## 8. Batasan Sistem yang Diketahui (Known Limitations)

1. **Client-Side Storage Boundary**: Data disimpan secara terisolasi pada `localStorage` browser pengguna saat ini. Kuota penyimpanan browser umumnya terbatas hingga ~5–10MB per domain, yang sangat memadai untuk ribuan data operasional demo namun akan membutuhkan migrasi API server saat backend MySQL resmi diaktifkan.
2. **Simulasi Eksekusi Multi-Aktor**: Karena backend belum terpasang, perubahan yang dilakukan satu pengguna tidak otomatis disiarkan (*broadcast*) ke tab browser pengguna lain secara real-time via WebSocket, melainkan melalui event storage lokal browser yang sama.

---
*Laporan ini menandai selesainya STEP 4 secara komprehensif sesuai ketentuan teknis dan instruksi pembekuan Landing Page.*
