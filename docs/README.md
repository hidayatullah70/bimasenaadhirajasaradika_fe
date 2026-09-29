# INDEKS DOKUMENTASI SISTEM — PT. BARAK IOMS
**Versi:** 2.0 (Authoritative Documentation Index)  
**Tanggal:** 29 September 2026  
**Status:** FRONTEND 100% READY FOR BACKEND IMPLEMENTATION  

---

## 1. Panduan Membaca untuk Pengembang Backend (Backend Developer Onboarding)

Jika Anda adalah pengembang backend yang akan mengimplementasikan REST API (Express.js) dan Database (MySQL 8.0), gunakan urutan bacaan berikut:

1. **[docs/PRD.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/PRD.md):**
   Memahami visi produk, 28 entitas database relasional (Section 20), aturan mobilitas personil (karyawan tidak terikat langsung ke satu klien), matriks hak akses RBAC (Section 19), pusat persetujuan Direktur (Section 39), dan kamus status enum lengkap (Section 40).
2. **[docs/API-SPEC.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/API-SPEC.md):**
   Spesifikasi lengkap seluruh endpoint REST untuk 15 modul operasional, format amplop respons standar (`{ success, data, message, meta }`), penanganan error validasi (`{ success: false, errors }`), dan endpoint unggah berkas S3/MinIO.
3. **[docs/IMPLEMENTATION-PLAN.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/IMPLEMENTATION-PLAN.md):**
   Roadmap 20 tahap implementasi backend dari migrasi tabel database hingga pelaporan eksekutif, serta panduan konfigurasi CORS, JWT, dan integrasi dengan frontend.
4. **[docs/USER-FLOW.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/USER-FLOW.md):**
   Alur bisnis multi-divisi yang harus didukung oleh transaksi database: Delete Request personil, Kunci & Pembukaan Presensi, Marketing WON Cascade lintas 4 divisi, Rekonsiliasi kas titipan COD, dan alur Penggajian Maker-Checker.
5. **[docs/UI-GUIDELINE.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/UI-GUIDELINE.md):**
   Standar desain visual antarmuka, 12 pustaka komponen UI, token warna resmi, serta tata cara penanganan kendala runtime melalui Route Error Boundary.
6. **[AGENTS.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/AGENTS.md):**
   Aturan rekayasa non-negosiasi, batasan landing page yang terbekukan (*frozen*), tata kelola kode, dan protokol verifikasi pengujian.

---

## 2. Peta Sinkronisasi Berkas Refaktorisasi (Refactoring Contracts Map)

Seluruh dokumen di dalam `docs/` telah **menggabungkan dan menyinkronkan** intisari berkas kontrak refaktorisasi:

| Dokumen Master di `docs/` | Berkas Kontrak Asal yang Diserap & Disinkronkan |
|---|---|
| **`docs/PRD.md`** | `03_ENTITY_CONTRACT.md` (28 entitas DDL & mobilitas personil)<br>`04_RBAC_PERMISSION_MATRIX.md` (Izin & Maker-Checker)<br>`06_STATUS_ENUMS.md` (Kamus status enum terpusat) |
| **`docs/API-SPEC.md`** | `02_API_CONTRACT.md` (Format amplop JSON, REST endpoints, upload berkas) |
| **`docs/IMPLEMENTATION-PLAN.md`** | `07_BACKEND_IMPLEMENTATION_ORDER.md` (Urutan 20 tahap backend)<br>`08_FRONTEND_BACKEND_INTEGRATION_GUIDE.md` (CORS, JWT interceptor, deployment) |
| **`docs/USER-FLOW.md`** | `05_WORKFLOW_CONTRACT.md` (Alur Hapus Karyawan, Presensi, Marketing WON, COD, Payroll) |
| **`docs/UI-GUIDELINE.md`** | `DASHBOARD_UX_V2.md` (Pustaka 12 komponen UI terstandarisasi, Route Error Boundary) |
| **`AGENTS.md`** | `01_FRONTEND_FINAL_ARCHITECTURE.md` & `FINAL_FRONTEND_HANDOFF.md` |

---

## 3. Berkas Referensi Khusus & Riwayat Audit
- **[FINAL_FRONTEND_HANDOFF.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/FINAL_FRONTEND_HANDOFF.md):** Laporan eksekutif penyerahan hasil frontend lengkap (14 bagian).
- **[FRONTEND_QA_REPORT.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/FRONTEND_QA_REPORT.md):** Laporan jaminan kualitas menyeluruh (166 tes otomatis lolos).
- **[CRUD_PERSISTENCE_V2.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/CRUD_PERSISTENCE_V2.md):** Dokumentasi engine penyimpanan mandiri dan seeding 18 klien resmi.
- **[FRONTEND_AUDIT.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/FRONTEND_AUDIT.md):** Hasil audit komparasi awal dengan baseline Vercel.
