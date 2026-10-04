# FINAL_FRONTEND_HANDOFF.md — PT. BARAK IOMS
**Versi:** 2.1 (Executive Frontend Handoff Deliverable)  
**Tanggal:** 4 Oktober 2026  
**Status:** FRONTEND 100% READY FOR BACKEND IMPLEMENTATION  
**Landing Page Guard:** STRICTLY FROZEN (15 Berkas di `src/features/landing/*` Utuh Tanpa Modifikasi)

---

## 1. What Was Changed (Ringkasan Riwayat Perubahan)

Sepanjang rangkaian pengembangan dari STEP 1 hingga STEP 5, sistem frontend telah bertransformasi dari sekadar mockup parsial menjadi platform operasional terpadu (*Integrated Outsourcing Management System*) yang siap dipasangkan dengan backend Express & MySQL:

1. **Audit & Penyelarasan Fondasi:**
   - Audit arsitektur dan pemulihan baseline landing page Vercel tanpa merusak aset orisinal.
   - Pembedaan tegas antara area publik (`/`) dan area operasional terproteksi (`/ops/*`).
2. **Pola Akses Data & Persistensi Mandiri:**
   - Pembentukan **Repository Pattern** (`BaseRepository`, `EmployeeRepository`, `PlacementRepository`, dll.) dan engine penyimpanan `storageEngine.js` dengan mekanisme deduplikasi otomatis dan *self-healing*.
   - Seeding **18 Klien Resmi Otoritatif** PT. BARAK (`CLI-000001` s/d `CLI-000018`) yang terlindungi dari penimpaan data dummy.
3. **Standarisasi Komponen UI (`src/components/ui/`):**
   - Pembuatan 12 komponen standar industri (`PageHeader`, `Breadcrumbs`, `Table`, `Drawer`, `Pagination`, `Tabs`, `FormField`, `Button`, `Badge`, `Modal`, `PageLoader`, `StateViews`).
4. **Peningkatan Kualitas Dashboard & Real-Time Dynamic KPIs:**
   - Eliminasi seluruh angka statis/placeholder.
   - Seluruh 8 dashboard (Direktur, HRD, Operasional, Finance, Legal, Marketing, IT, Website) menghitung KPI secara reaktif dari data relasional.
5. **Pusat Persetujuan Eksekutif & Jejak Audit Persisten:**
   - Pembangunan **Approval Center** terpusat bagi Direktur untuk 8 jenis permohonan dengan mutasi otomatis saat *Approve* dan pencatatan alasan saat *Reject*.
   - Penyimpanan jejak audit permanen di `barak_audit_logs`.
6. **Keterhubungan Alur Bisnis (Interconnected Workflows):**
   - Integrasi alur penugasan posko $\rightarrow$ presensi harian $\rightarrow$ tiket penggantian personil.
   - Alur faktur keuangan $\rightarrow$ piutang $\rightarrow$ arus kas masuk.
   - Alur PKS korporat $\rightarrow$ kepatuhan SIO Mabes Polri $\rightarrow$ sengketa COD.
   - Alur **Marketing WON Cascade** yang otomatis memicu pembuatan draf kontrak Legal, akun penagihan Finance, dan posko baru Operasional.
7. **Abstraksi Dokumen & File Storage:**
   - Pembuatan `fileAdapter.js` yang mengabstraksikan unggahan berkas (KTP, foto, kontrak) untuk kompatibel dengan S3, MinIO, atau Cloud Storage tanpa vendor lock-in.
8. **Jaminan Kualitas Komprehensif (QA 100% Pass):**
   - 105 / 105 pengujian otomatis lolos (`npm test`), 0 error linter (`npm run lint`), dan build produksi bersih (`npm run build`).
9. **Impor Excel Karyawan Massal & Penugasan Atomik:**
   - Penambahan modal impor Excel `.xlsx` (`EmployeeImportModal.jsx`) dengan template terstandarisasi yang secara otomatis membuat rekaman karyawan sekaligus mengikat penugasan aktif ke Klien dan Lokasi Penempatan terpilih.
10. **Presensi Dinamis & Isolasi Sesi Petugas Inputer:**
    - Integrasi seleksi Klien dan Lokasi pada spreadsheet presensi dengan penarikan nama karyawan otomatis, penyediaan field entri jam kerja kosong untuk pengisian manual, format ekspor berkop resmi, serta pembersihan draf lembar kerja saat petugas lapangan `user1` dan `user2` logout.

---

## 2. Final Architecture (Arsitektur Berlapis Final)

Arsitektur aplikasi menerapkan struktur berlapis tanpa kopling langsung:
$$\text{UI Layer} \longrightarrow \text{Custom Hooks} \longrightarrow \text{Application Services} \longrightarrow \text{Repositories} \longrightarrow \text{Service Adapters} \longrightarrow \text{API Client}$$

- **Presentation Layer (`src/features/*`, `src/components/*`):** Murni merender tampilan, menangani interaksi pengguna, dan memvalidasi formulir secara visual.
- **Service Layer (`src/services/adapters/*`):** Mengelola aturan bisnis, transformasi payload, dan mencatat log audit.
- **Repository Layer (`src/data/repositories/*`):** Menangani kueri, paginasi, pencarian, dan penegakan soft-delete.
- **Storage Layer (`src/data/storage/*`, `src/utils/storage.js`):** Penyimpanan lokal reaktif dengan sistem penamaan (*namespacing*) aman.
- **API Client Layer (`src/services/apiClient.js`):** Titik tunggal komunikasi HTTP dengan dukungan sakelar `VITE_API_MODE=mock` (pengembangan mandiri) atau `VITE_API_MODE=rest` (koneksi backend Express).

---

## 3. Final Folder Structure (Struktur Direktori Final)

```text
frontend/
├── 01_FRONTEND_FINAL_ARCHITECTURE.md
├── 02_API_CONTRACT.md
├── 03_ENTITY_CONTRACT.md
├── 04_RBAC_PERMISSION_MATRIX.md
├── 05_WORKFLOW_CONTRACT.md
├── 06_STATUS_ENUMS.md
├── 07_BACKEND_IMPLEMENTATION_ORDER.md
├── 08_FRONTEND_BACKEND_INTEGRATION_GUIDE.md
├── FINAL_FRONTEND_HANDOFF.md
├── FRONTEND_QA_REPORT.md
├── DASHBOARD_UX_V2.md
├── CRUD_PERSISTENCE_V2.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── vercel.json
├── .env.example
├── scripts/
│   ├── alias-loader.js
│   ├── test-rbac-internal.js
│   ├── test-crud-persistence.js
│   ├── test-step4-dashboard-ux.js
│   └── test-step5-qa-functional.js
└── src/
    ├── app/ (guards, router, routes)
    ├── components/ (layout, ui)
    ├── constants/ (business, permissions, roles, status)
    ├── data/ (repositories, storage)
    ├── features/ (8 departments, master, audit, auth, landing [frozen])
    ├── services/ (adapters, apiClient, mock)
    └── utils/ (auditLogger, demoDataReset, storage)
```

---

## 4. Modules Completed (Modul yang Telah Diselesaikan)

1. **Direktur Module:** Cockpit Eksekutif, Pusat Persetujuan (Approval Center), Peringatan Risiko, Laporan Eksekutif, Riwayat Aktivitas Audit.
2. **HRD Module:** Dashboard SDM Dinamis, Spreadsheet Presensi Posko, Rekapitulasi Absensi-Payroll, Pemantauan Kontrak PKWT Karyawan.
3. **Operasional Module:** Manpower Readiness Monitoring, Manajemen Penugasan Lapangan, Tiket Pergantian (*Replacement*), Register Insiden Posko, Jurnal Laporan Patroli.
4. **Keuangan Module:** Dashboard Finansial, Manajemen Faktur Tagihan, Penggajian Karyawan (Maker-Checker), Rekonsiliasi Kas Titipan COD Kurir, Arus Kas Bersih (*Net Cash Flow*).
5. **Legal Module:** Register Perjanjian Kerja Sama (PKS), Manajemen Perkara Hukum & Sengketa COD, Kepatuhan Perizinan SIO BUJP Mabes Polri & BPJS.
6. **Marketing Module:** CRM Prospek Masuk (Leads), Pipeline Tender & Negosiasi Harga, Pemenangan Tender & Serah Terima Klien (*Handover Cascade*).
7. **IT Support Module:** Helpdesk Tiket Gangguan, Pemantauan SLA Respon, Inventarisasi Aset IT Posko (Radio HT, Tablet), Jadwal Maintenance, Status Kesehatan Sistem & Backup.
8. **Website CMS Module:** Publikasi Berita & Edukasi Keamanan, Portal Lowongan Karir, Inbox Lamaran Kerja, Pesan Konsultasi Masuk, Basis Pengetahuan FAQ, Skor Kepatuhan SEO.
9. **Master Data Module:** Master Karyawan, Master 18 Klien Riil, Master Lokasi/Posko Jaga, Master Shift, Master Penugasan, Master Pengguna Sistem.
10. **Cross-Cutting Modules:** Pencarian Global Multi-Entitas, Pusat Notifikasi, Jejak Log Audit, Profil Akun.

---

## 5. CRUD Completed (Operasi CRUD Lengkap)

Seluruh entitas primer mendukung alur siklus hidup lengkap:
- **CREATE:** Formulir standar dengan validasi format, penomoran kode unik otomatis (e.g. `BRK-EMP-XXX`, `CLI-XXXXXX`, `LOC-XXX`, `BRK-ASN-XXX`, `INV-XXX`), pencegahan duplikasi, dan indikator loading.
- **READ / DETAIL:** Tampilan tabel tabular responsif, drawer off-canvas untuk profil detail, pencarian kata kunci multi-kolom, filter kategori, dan paginasi data.
- **UPDATE:** Pengeditan in-place pada modal atau detail page dengan data terisi otomatis (*pre-populated*), pencatatan timestamp modifikasi, dan notifikasi toast sukses/gagal.
- **DELETE / DEACTIVATE:** Diterapkan mekanisme proteksi ganda:
  - *Hard Delete* dicegah pada data personil.
  - HRD/Staf mengajukan *Delete Request* $\rightarrow$ Direktur mengeksekusi *Soft Delete* (`isDeleted: true`, `status_kerja: 'NON_AKTIF'`).

---

## 6. Persistence Strategy (Strategi Persistensi Data)

1. **Storage Engine Namespacing:** Seluruh data diisolasi dalam *key* terstruktur (`barak_employees`, `barak_clients`, `barak_assignments`, `barak_invoices`, dll.).
2. **Deduplikasi & Self-Healing:** Pada saat pembacaan data, engine secara otomatis mendeteksi dan mengeliminasi duplikasi ID primer, mempertahankan rekaman pertama, dan menyimpan kembali data yang bersih.
3. **No-Rollback Persistence:** Penghapusan data bersifat permanen dan tidak akan membangkitkan kembali data dummy lama saat halaman dimuat ulang.
4. **Proteksi 18 Klien Resmi:** Reset demo pabrik secara ketat melindungi 18 klien riil otoritatif dari penghapusan.

---

## 7. RBAC Strategy (Strategi Hak Akses Peran)

1. **8 Peran Resmi:** `DIREKTUR`, `HRD`, `OPERASIONAL`, `FINANCE`, `LEGAL`, `MARKETING`, `IT_SUPPORT`, `ADMIN_WEBSITE`.
2. **Penegakan Maker-Checker:**
   - Penggajian: Dibuat oleh Keuangan (`PAYROLL_CREATE`), disetujui secara eksklusif oleh Direktur (`PAYROLL_APPROVE`).
   - Absensi: Difinalisasi oleh HRD (`ATTENDANCE_FINALIZE`), hanya dapat dibuka kembali oleh Direktur (`ATTENDANCE_REOPEN`).
   - Hapus Karyawan: Diajukan oleh HRD (`employee.delete.request`), disahkan oleh Direktur (`employee.delete.approve`).
3. **Guard Ganda:** Rute dilindungi di tingkat navigasi melalui `RequireAuth` dan `RequireRole`.

---

## 8. Approval Workflow (Alur Persetujuan Terpusat)

Direktur memiliki kendali tunggal pada `/ops/director/approvals` untuk:
- `EMPLOYEE_DELETE`: Otorisasi soft-delete personil.
- `EMPLOYEE_STATUS_CHANGE`: Pengangkatan PKWT ke Karyawan Tetap.
- `CONTRACT_APPROVAL`: Pengesahan kontrak PKS bernilai besar.
- `EXPENSE_APPROVAL` / `CAPEX`: Otorisasi belanja modal posko.
- `PAYROLL`: Otorisasi pencairan gaji bulanan.
- `QUOTATION_APPROVAL`: Persetujuan penawaran tender khusus.
- `OPERATIONAL_REQUEST`: Dispensasi operasional lapangan.

Setiap persetujuan mengeksekusi mutasi model terkait secara langsung dan menerbitkan catatan audit. Setiap penolakan mewajibkan pengisian alasan tertulis dan mengembalikan status dokumen pemohon.

---

## 9. API Abstraction (Abstraksi API)

Frontend mengonsumsi data secara eksklusif melalui **24 Service Adapter** di `src/services/adapters/`. Setiap adapter mengimplementasikan gerbang:
- Jika `isMockMode() === true`: Beroperasi menggunakan repository lokal persisten.
- Jika `isMockMode() === false`: Mengirimkan request HTTP REST menggunakan `apiClient` Axios/Fetch.

Penyimpanan dokumen dan gambar diabstraksikan melalui `fileAdapter.js`, siap dipasangkan dengan endpoint S3 presigned URL atau REST multipart form-data tanpa mengubah kode komponen antarmuka.

---

## 10. API Contract (Ringkasan Kontrak API)

- **Format Amplop Standar:**
  - Sukses: `{ success: true, data: ..., message: "...", meta: {} }`
  - Koleksi: `{ success: true, data: [...], meta: { page, limit, total, totalPages } }`
  - Validasi Gagal: `{ success: false, message: "...", errors: { field: ["pesan error"] } }`
- **Konvensi REST:** Pemanfaatan kata benda jamak (`/employees`, `/placements`, `/clients`, `/invoices`), kata kerja HTTP semantik (`GET`, `POST`, `PATCH`, `DELETE`), dan sub-resource terarah (`/placements/:id/transfer`, `/attendance/finalize`).
- Detail lengkap didokumentasikan pada: [02_API_CONTRACT.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/02_API_CONTRACT.md).

---

## 11. Entity Relationships (Relasi Entitas Penting)

- **Mobilitas Personel:** `employees` tidak terikat langsung ke `clients`. Hubungan dijembatani oleh `placements`.
- **Klien $\rightarrow$ Posko:** Satu klien memiliki banyak posko/lokasi (`sites`).
- **Penugasan:** Mengikat Personel + Klien + Posko + Layanan + Shift.
- **Rotasi:** Pemindahan personil menandai penugasan lama `ROTATED` dan membuat penugasan baru `ACTIVE` dengan mempertahankan riwayat pergerakan penugasan.
- Detail lengkap 28 entitas didokumentasikan pada: [03_ENTITY_CONTRACT.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/03_ENTITY_CONTRACT.md).

---

## 12. Known Limitations (Batasan Sistem Saat Ini)

1. **Penyimpanan Lokal Sisi Klien:** Data demo tersimpan di `localStorage` per browser (~5–10MB) dan belum tersinkronisasi lintas perangkat fisik sebelum backend Express aktif.
2. **Ketiadaan Real-time WebSocket:** Simulasi multi-tab disinkronkan melalui event storage browser lokal, bukan push notifikasi WebSocket server.

---

## 13. Backend Implementation Recommendations (Rekomendasi Implementasi Backend)

1. **Gunakan Stack Rekomendasi:** Node.js, Express.js, TypeScript/ESM, MySQL 8.0, Knex.js / Prisma ORM.
2. **Patuhi Urutan 20 Tahap:** Mulai dari migrasi database, autentikasi JWT, seeding RBAC, disusul entitas master, penugasan, presensi, hingga pelaporan (sesuai dokumen [07_BACKEND_IMPLEMENTATION_ORDER.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/07_BACKEND_IMPLEMENTATION_ORDER.md)).
3. **CORS & Middleware:** Konfigurasikan CORS Express untuk mengizinkan `http://localhost:5173` dengan kredensial aktif (sesuai dokumen [08_FRONTEND_BACKEND_INTEGRATION_GUIDE.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/08_FRONTEND_BACKEND_INTEGRATION_GUIDE.md)).
4. **Amankan Endpoint:** Jangan percaya frontend; selalu periksa token JWT dan izin granular pada setiap request HTTP.

---

## 14. Exact Next Step for Backend Developer (Langkah Tepat Berikutnya bagi Tim Backend)

Untuk memulai pengembangan backend tanpa menebak-nebak:

1. **Baca Dokumen Handoff:**
   - Pelajari [01_FRONTEND_FINAL_ARCHITECTURE.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/01_FRONTEND_FINAL_ARCHITECTURE.md) untuk memahami arsitektur sistem.
   - Pelajari [02_API_CONTRACT.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/02_API_CONTRACT.md) untuk spesifikasi URL endpoint dan amplop respons.
   - Pelajari [03_ENTITY_CONTRACT.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/03_ENTITY_CONTRACT.md) untuk DDL skema relasional 28 tabel MySQL.
2. **Inisialisasi Proyek Backend:**
   - Buat folder proyek backend terpisah (misal `backend/`) dengan Express.js.
   - Jalankan migrasi tabel MySQL sesuai `03_ENTITY_CONTRACT.md`.
3. **Implementasikan Tahap 1, 2, & 3:**
   - Terapkan endpoint login `/api/v1/auth/login` dan middleware JWT `requireAuth`.
   - Lakukan seeding 8 peran dan 8 akun default.
4. **Hubungkan ke Frontend:**
   - Ubah `.env` di frontend: `VITE_API_MODE=rest` dan `VITE_API_BASE_URL=http://localhost:3001/api/v1`.
   - Uji login dari antarmuka frontend `/ops/login`.
   - Lanjutkan implementasi endpoint per modul secara berurutan sesuai [07_BACKEND_IMPLEMENTATION_ORDER.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/07_BACKEND_IMPLEMENTATION_ORDER.md).

---
*Frontend PT. BARAK IOMS dinyatakan 100% SELESAI, TANGGUH, TERUJI, dan SIAP TERHUBUNG KE BACKEND.*
