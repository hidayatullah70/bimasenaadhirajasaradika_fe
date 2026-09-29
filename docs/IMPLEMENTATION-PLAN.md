# IMPLEMENTATION-PLAN — PT. BARAK IOMS
**Versi:** 2.0 (Integrated Frontend-Complete & Backend Roadmap)  
**Tanggal:** 29 September 2026  
**Status:** FRONTEND 100% COMPLETED — READY FOR BACKEND IMPLEMENTATION  
**Sinkronisasi:** Mengintegrasikan `07_BACKEND_IMPLEMENTATION_ORDER.md`, `08_FRONTEND_BACKEND_INTEGRATION_GUIDE.md`, dan `FINAL_FRONTEND_HANDOFF.md`.

---

## 0. Prinsip Tata Kelola (SOT Rule)
1. **Audit Terlebih Dahulu:** Jangan pernah menulis ulang kode tanpa memahami arsitektur eksisting.
2. **Prioritas:** Integritas Data $>$ Alur Bisnis $>$ Penegakan RBAC $>$ Aksesibilitas UI $>$ Performa.
3. **Pemisahan Lapisan Mutlak:** UI $\rightarrow$ Hooks $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ API Client.
4. **Landing Page Terkunci (FROZEN):** Seluruh 15 berkas di `src/features/landing/*` dipertahankan utuh dan tidak boleh dimodifikasi.

---

## 1. Status Realisasi Fase Frontend (Phases 0 – 10: 100% COMPLETE)

| Fase | Nama Modul / Aktivitas | Status | Hasil & Bukti Pengujian |
|---|---|:---:|---|
| **Fase 0** | Audit Repositori & Baseline Vercel | ✅ Selesai | Inventarisasi rute, isolasi area operasional `/ops` dari landing page |
| **Fase 1** | Fondasi Arsitektur & Tokens | ✅ Selesai | Shell aplikasi, token warna resmi, router modular, auth context |
| **Fase 2** | Master Data Terpadu | ✅ Selesai | Master Karyawan, 18 Klien Riil (`CLI-000001` - `018`), Posko, Shift, Pengguna |
| **Fase 3** | HRD & Presensi Posko | ✅ Selesai | Roster bulanan, spreadsheet kehadiran, validasi jam lembur, PKWT |
| **Fase 4** | Operasional Lapangan | ✅ Selesai | Plotting penugasan posko, tiket pergantian personil, log insiden, patroli |
| **Fase 5** | Keuangan & Penggajian | ✅ Selesai | Siklus faktur invoice, rekonsiliasi kas titipan COD, Maker-Checker payroll |
| **Fase 6** | Legal & Kepatuhan PKS | ✅ Selesai | Register PKS, eskalasi sengketa hukum, pemantauan SIO Mabes Polri |
| **Fase 7** | Marketing & CRM Pipeline | ✅ Selesai | Manajemen prospek, sales pipeline tender, Marketing WON cascade |
| **Fase 8** | IT Support & Aset Posko | ✅ Selesai | Helpdesk SLA tiket, inventarisasi radio HT & aset IT posko, maintenance |
| **Fase 9** | Website CMS & Publik | ✅ Selesai | Berita, FAQ, portal lowongan karir, form konsultasi publik terintegrasi |
| **Fase 10** | Cockpit Direktur & Persetujuan | ✅ Selesai | KPI dinamis lintas divisi, Centralized Approval Center, Audit Log |

**Metrik Kualitas Frontend Final:**
- Pengujian Otomatis (`npm test`): **166 / 166 Lolos (100%)**
- Analisis Kode Statis (`npm run lint`): **0 Error, 0 Warning** (dengan aturan `no-undef: error`)
- Build Produksi (`npm run build`): **Sukses & Teroptimasi (4.31s)**

---

## 2. Fase 11: Roadmap 20 Tahap Implementasi Backend (Authoritative Sequence)

Pengembangan backend Node.js / Express / MySQL **wajib mengikuti urutan 20 tahap logis berikut** untuk memastikan integrasi mulus dengan 24 adapter frontend:

```text
[Tahap 1-3: Core & Auth] ──> [Tahap 4-8: Master Data & Placements] ──> [Tahap 9-11: Workforce & Payroll]
                                                                                │
[Tahap 16-20: Governance & Reporting] <── [Tahap 12-15: Finance, Legal & Ops] <──┘
```

### Tahap 1: Skema Database & Migrasi (Database Schema & DDL)
- Buat database `barak_ioms` pada MySQL 8.0 (Laragon lokal / Railway cloud).
- Eksekusi DDL 28 tabel relasional sesuai spesifikasi [03_ENTITY_CONTRACT.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/03_ENTITY_CONTRACT.md).
- Pasang indeks primer dan komposit pada foreign key, NIK, kode klien, kode penugasan, dan nomor faktur.

### Tahap 2: Autentikasi & Sesi (JWT Authentication)
- Endpoint `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`.
- Hashing kata sandi aman (Bcrypt / Argon2) dengan salt rounds minimum 10.
- Token akses JWT berdurasi 15–60 menit dan refresh token rotasi (7 hari).

### Tahap 3: Pengguna, Peran & Hak Akses (Users, Roles & RBAC Middleware)
- Middleware Express `requireAuth` (verifikasi Bearer JWT).
- Middleware izin `requirePermission(permissionId)` sesuai [04_RBAC_PERMISSION_MATRIX.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/04_RBAC_PERMISSION_MATRIX.md).
- Seeding 8 pengguna default internal PT. BARAK.

### Tahap 4: Manajemen Karyawan (Employees Module)
- Endpoint `GET /employees`, `GET /employees/:id`, `POST /employees`, `PATCH /employees/:id`.
- Validasi ketat NIK 16 digit angka unik dan penegakan soft-delete (`is_deleted = TRUE`).

### Tahap 5: Mitra Bisnis & Klien (Clients Module)
- Endpoint `GET /clients`, `GET /clients/:id`, `POST /clients`, `PATCH /clients/:id`.
- Seeding wajib 18 Klien riil otoritatif PT. BARAK (`CLI-000001` s/d `CLI-000018`).

### Tahap 6: Posko & Lokasi Lapangan (Sites / Locations Module)
- Endpoint `GET /sites`, `POST /sites`, `PATCH /sites/:id`.
- Validasi relasi wajib `client_id` dan kuota personil posko.

### Tahap 7: Layanan & SLA (Services Module)
- Master data 6 layanan: Security, Kurir/COD, Parkir, Cleaning Service, Man Power, Loss Prevention.

### Tahap 8: Penugasan & Plotting Personil (Placements Module)
- Endpoint `GET /placements`, `POST /placements`, `POST /placements/:id/transfer`, `POST /placements/:id/end`.
- Logika transaksi rotasi: penugasan lama otomatis menjadi `ROTATED` dan penugasan baru diterbitkan sebagai `ACTIVE`. Karyawan tidak terikat permanen ke satu klien.

### Tahap 9: Presensi & Roster Shift (Attendance & Roster Module)
- Endpoint `GET /shifts`, `POST /shifts`, `GET /attendance`, `POST /attendance/check-in`.
- Endpoint finalisasi bulanan `POST /attendance/finalize` (mengunci lembar absensi).
- Endpoint pembukaan kembali `POST /attendance/reopen` (khusus otorisasi Direktur).

### Tahap 10: Rekrutmen & Pelamar (Recruitment Module)
- Endpoint `GET /cms/careers`, `POST /recruitment/apply`.
- Manajemen berkas CV pelamar dan integrasi webhook formulir karir.

### Tahap 11: Penggajian Karyawan (Payroll Module — Maker-Checker)
- Endpoint `GET /finance/payroll`, `POST /finance/payroll` (Maker: Finance).
- Endpoint `POST /finance/payroll/:id/approve` (Checker: Direktur Only).
- Validasi prasyarat: Lembar absensi periode bersangkutan wajib berstatus terkunci (`FINALIZED`).

### Tahap 12: Keuangan, Faktur & COD (Finance Module)
- Endpoint faktur: `GET /finance/invoices`, `POST /finance/invoices`, `PATCH /finance/invoices/:id/status`, `POST /finance/invoices/:id/payment`.
- Penjadwalan transisi status jatuh tempo otomatis (`OVERDUE`).
- Endpoint monitoring kas titipan kurir COD: rekonsiliasi dan eskalasi selisih dana.

### Tahap 13: Hukum & Kontrak Korporat (Legal Module)
- Endpoint `GET /legal/contracts`, `POST /legal/contracts`, `PATCH /legal/contracts/:id/status`.
- Query kontrak menjelang kedaluwarsa (`end_date - NOW() <= 60 days`).
- Register berkas sengketa hukum: `GET /legal/cases`, `POST /legal/cases`.

### Tahap 14: Marketing & Pemenangan Tender (Marketing Module)
- Endpoint `GET /marketing/leads`, `POST /marketing/leads`, `GET /marketing/opportunities`.
- Endpoint `POST /marketing/opportunities/:id/win`: Menjalankan transaksi database cascade ke tabel `contracts`, `clients`, dan `sites`.

### Tahap 15: Operasional Lapangan & Insiden (Operations Module)
- Endpoint laporan insiden posko: `GET /operations/incidents`, `POST /operations/incidents`, `POST /operations/incidents/:id/resolve`.
- Tiket permohonan pergantian personil mendesak: `GET /operations/replacements`, `POST /operations/replacements`.
- Jurnal patroli: `GET /operations/field-reports`, `POST /operations/field-reports`.

### Tahap 16: Pusat Persetujuan Terpadu (Approvals Module)
- Endpoint `GET /approvals?status=PENDING`.
- Endpoint `POST /approvals/:id/approve`: Menjalankan mutasi bisnis model terkait sesuai `request_type`.
- Endpoint `POST /approvals/:id/reject`: Menggagalkan permohonan dan memulihkan status data pemohon.

### Tahap 17: Jejak Audit Sistem (Audit Logging Middleware)
- Skema tabel append-only `audit_logs`.
- Interceptor otomatis untuk mencatat `actor_id`, `actor_role`, `action`, `module`, `record_id`, dan `description`.

### Tahap 18: Infrastruktur IT & Helpdesk (IT Support Module)
- Endpoint tiket gangguan IT: `GET /it/tickets`, `POST /it/tickets`, `PATCH /it/tickets/:id/resolve`.
- Inventarisasi aset posko (Radio HT, tablet): `GET /it/assets`, `POST /it/assets`.

### Tahap 19: Manajemen Konten Web (Website CMS Module)
- Endpoint artikel berita: `GET /cms/articles`, `POST /cms/articles`.
- Endpoint lowongan kerja & inbox pesan konsultasi klien dari landing page (`/cms/inquiries`).

### Tahap 20: Agregasi Cockpit Eksekutif & Pelaporan (Executive Reporting)
- Endpoint `GET /director/dashboard-stats`: Menghitung metrik analitik agregasi langsung via kueri SQL `COUNT()`, `SUM()`, `AVG()` tanpa angka statis.
- Ekspor laporan rekapitulasi data (.CSV / .PDF).

---

## 3. Fase 12: Integrasi & Deployment (Integration & Deployment Guide)

### 3.1 Konfigurasi Lingkungan (Environment Variables)
Frontend telah memiliki file `.env.example`. Untuk menghubungkan ke backend Express:
```bash
# Ubah nilai di frontend/.env
VITE_API_MODE=rest
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### 3.2 Penanganan CORS di Express
Backend Express wajib menyertakan middleware CORS untuk origin frontend:
```javascript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
```

### 3.3 Penanganan Token Kedaluwarsa (401 Interceptor)
`src/services/apiClient.js` secara otomatis mendeteksi error `401 Unauthorized` dari backend:
1. Menghapus sesi lokal yang tidak valid.
2. Mengarahkan pengguna secara elegan ke `/ops/login`.
3. Menampilkan notifikasi *"Sesi Anda telah berakhir. Silakan masuk kembali."*

### 3.4 Target Hosting & Arsitektur Produksi
- **Frontend:** Vercel (SPA routing didukung penuh via `vercel.json`).
- **Backend API:** Railway / VPS (Node.js runtime, port `3001` atau `8080`).
- **Database:** Railway Managed MySQL 8.0 / AWS RDS.
- **Penyimpanan Berkas:** AWS S3 / MinIO / Cloudflare R2 (diabstraksikan via `fileAdapter.js`).
