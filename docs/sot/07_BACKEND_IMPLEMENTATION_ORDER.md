# 07_BACKEND_IMPLEMENTATION_ORDER.md — PT. BARAK IOMS
**Versi:** 2.0 (Step-by-Step Implementation Roadmap)  
**Tanggal:** 29 September 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Ruang Lingkup:** Urutan Eksekusi Pengembangan Backend Node.js / Express / MySQL

---

## 1. Pendahuluan & Strategi Eksekusi

Untuk memastikan integrasi antara Backend dan Frontend berjalan tanpa hambatan dan minim refactoring, tim pengembang backend **sangat disarankan mengikuti urutan 20 langkah logis berikut**.

Frontend telah siap 100% dan dapat diuji secara bertahap dengan mengalihkan endpoint per modul dari `mock` ke `rest` melalui adapter masing-masing.

---

## 2. Urutan 20 Tahap Implementasi Backend (20 Implementation Stages)

```
[Tahap 1-3: Core & Auth] ──> [Tahap 4-8: Master Data & Placements] ──> [Tahap 9-11: Workforce & Payroll]
                                                                                │
[Tahap 16-20: Governance & Reporting] <── [Tahap 12-15: Finance, Legal & Ops] <──┘
```

### Tahap 1: Skema Database & Migrasi (Database Schema & DDL)
- Buat database `barak_ioms` pada MySQL (Laragon / Railway).
- Eksekusi DDL 28 tabel sesuai spesifikasi `03_ENTITY_CONTRACT.md`.
- Pasang indeks pada kolom foreign key, NIK, kode klien, kode penugasan, dan nomor faktur.

### Tahap 2: Autentikasi & Sesi (JWT Authentication)
- Endpoint `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`.
- Penerapan hashing kata sandi aman (Bcrypt / Argon2).
- Pembuatan token akses JWT berdurasi 15–60 menit dan refresh token rotasi (7 hari).

### Tahap 3: Pengguna, Peran & Hak Akses (Users, Roles & RBAC Middleware)
- Buat middleware Express `requireAuth` dan `requireRole(allowedRoles)`.
- Buat middleware validasi izin granular `requirePermission(permissionId)`.
- Seeding 8 pengguna default internal (Direktur, HRD, Operasional, Finance, Legal, Marketing, IT Support, Admin Website).

### Tahap 4: Manajemen Karyawan (Employees Module)
- Endpoint `GET /employees`, `GET /employees/:id`, `POST /employees`, `PATCH /employees/:id`.
- Validasi ketat NIK 16 digit angka unik.
- Mekanisme soft-delete (`is_deleted = TRUE`).

### Tahap 5: Mitra Bisnis & Klien (Clients Module)
- Endpoint `GET /clients`, `GET /clients/:id`, `POST /clients`, `PATCH /clients/:id`.
- Seeding wajib 18 Klien riil otoritatif PT. BARAK (`CLI-000001` s/d `CLI-000018`).

### Tahap 6: Posko & Lokasi Lapangan (Sites / Locations Module)
- Endpoint `GET /sites`, `POST /sites`, `PATCH /sites/:id`.
- Validasi relasi wajib `client_id` dan kuota personil posko.

### Tahap 7: Layanan & SLA (Services Module)
- Master data 4 layanan inti: Security, Cleaning, Driver, Parking.

### Tahap 8: Penugasan & Plotting Personil (Placements Module)
- Endpoint `GET /placements`, `POST /placements`, `POST /placements/:id/transfer`, `POST /placements/:id/end`.
- Logika transaksi rotasi: penugasan lama otomatis menjadi `ROTATED` dan penugasan baru diterbitkan sebagai `ACTIVE`.

### Tahap 9: Presensi & Roster Shift (Attendance & Roster Module)
- Endpoint `GET /shifts`, `POST /shifts`, `GET /attendance`, `POST /attendance/check-in`.
- Endpoint finalisasi bulanan `POST /attendance/finalize` (mengunci lembar absensi).
- Endpoint pembukaan kembali `POST /attendance/reopen` (khusus peran `DIREKTUR`).

### Tahap 10: Rekrutmen & Pelamar (Recruitment Module)
- Endpoint `GET /recruitment/careers`, `POST /recruitment/apply`.
- Penanganan berkas CV pelamar.

### Tahap 11: Penggajian Karyawan (Payroll Module — Maker-Checker)
- Endpoint `GET /finance/payroll`, `POST /finance/payroll` (Maker: Finance).
- Endpoint `POST /finance/payroll/:id/approve` (Checker: Direktur Only).
- Validasi bahwa lembar absensi telah berstatus terkunci sebelum payroll dapat dibentuk.

### Tahap 12: Keuangan, Faktur & COD (Finance Module)
- Endpoint faktur: `GET /finance/invoices`, `POST /finance/invoices`, `PATCH /finance/invoices/:id/status`, `POST /finance/invoices/:id/payment`.
- Endpoint kalkulasi jatuh tempo otomatis (`OVERDUE`).
- Endpoint kas titipan kurir COD: rekonsiliasi dan eskalasi selisih.

### Tahap 13: Hukum & Kontrak Korporat (Legal Module)
- Endpoint `GET /legal/contracts`, `POST /legal/contracts`, `PATCH /legal/contracts/:id/status`.
- Query kontrak menjelang kedaluwarsa (`end_date - NOW() <= 60 days`).
- Register berkas sengketa hukum: `GET /legal/cases`, `POST /legal/cases`.

### Tahap 14: Marketing & Pemenangan Tender (Marketing Module)
- Endpoint `GET /marketing/leads`, `POST /marketing/leads`, `GET /marketing/opportunities`.
- Endpoint `POST /marketing/opportunities/:id/win`: Menjalankan transaksi database cascade ke tabel `contracts`, `invoices`, dan `sites`.

### Tahap 15: Operasional Lapangan & Insiden (Operations Module)
- Endpoint laporan insiden posko: `GET /operations/incidents`, `POST /operations/incidents`, `POST /operations/incidents/:id/resolve`.
- Tiket permohonan pergantian personil mendesak: `GET /operations/replacements`, `POST /operations/replacements`.
- Jurnal patroli: `GET /operations/field-reports`, `POST /operations/field-reports`.

### Tahap 16: Pusat Persetujuan Terpadu (Approvals Module)
- Endpoint `GET /approvals?status=PENDING`.
- Endpoint `POST /approvals/:id/approve`: Menjalankan mutasi bisnis model terkait sesuai `request_type`.
- Endpoint `POST /approvals/:id/reject`: Menggagalkan permohonan dan memulihkan status data.

### Tahap 17: Jejak Audit Sistem (Audit Logging Middleware)
- Skema tabel append-only `audit_logs`.
- Interceptor otomatis untuk mencatat `actor_id`, `actor_role`, `action`, `module`, `record_id`, dan `description`.

### Tahap 18: Infrastruktur IT & Helpdesk (IT Support Module)
- Endpoint tiket gangguan IT: `GET /it/tickets`, `POST /it/tickets`, `PATCH /it/tickets/:id/resolve`.
- Inventarisasi aset posko (Radio HT, tablet): `GET /it/assets`, `POST /it/assets`.

### Tahap 19: Manajemen Konten Web (Website CMS Module)
- Endpoint artikel berita: `GET /cms/articles`, `POST /cms/articles`.
- Endpoint lowongan kerja & inbox pesan konsultasi klien dari landing page.

### Tahap 20: Agregasi Cockpit Eksekutif & Pelaporan (Executive Reporting)
- Endpoint `GET /director/dashboard-stats`: Menghitung metrik analitik agregasi langsung via kueri SQL `COUNT()`, `SUM()`, `AVG()` tanpa kalkulasi statis.
- Ekspor laporan rekapitulasi data (.CSV / .PDF).
