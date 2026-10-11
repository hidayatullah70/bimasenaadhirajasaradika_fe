# INDEKS DOKUMENTASI SISTEM — PT. BARAK IOMS
**Versi:** 3.0 (Unified & Streamlined Documentation Index)  
**Tanggal:** 11 Oktober 2026  
**Status:** FRONTEND 100% READY FOR BACKEND IMPLEMENTATION (143/143 TESTS PASS, 0 LINT ERRORS)

---

## 1. Panduan Membaca untuk Pengembang Backend (Backend Developer Onboarding)

Jika Anda adalah pengembang backend yang akan mengimplementasikan REST API (Express.js) dan Database (MySQL 8.0) di folder `backend/`, gunakan urutan bacaan dan referensi berikut:

1. **[docs/sot/MASTER_SOURCE_OF_TRUTH.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/sot/MASTER_SOURCE_OF_TRUTH.md) (DOKUMEN UTAMA / WAJIB):**
   Konsolidasi menyeluruh (*all-in-one authoritative contract*) yang memuat:
   - Skema DDL 29 Entitas Relasional MySQL 8.0 lengkap dengan relasi dan indeks.
   - Seeding resmi 18 Klien riil terverifikasi PT. BARAK (`CLI-000001` s/d `CLI-000018`).
   - Format amplop respons standar JSON (`{ success, data, message, meta }`) dan penanganan error validasi (`{ success: false, errors }`).
   - Matriks izin RBAC granular 8 peran, inputer, dan PIC klien, serta batas *Maker-Checker*.
   - 7 Alur bisnis lintas departemen (Hapus Karyawan, Presensi, Marketing WON Cascade, Rekonsiliasi COD, Payroll Maker-Checker, Impor Excel Karyawan Atomik, serta Manajemen Keamanan Akun, Kata Sandi & Avatar).
   - Kamus status enum seragam huruf kapital (*uppercase*).
   - Urutan 20 Tahap Implementasi Backend (*Step-by-step Execution Order*).
   - Panduan konfigurasi CORS Express, JWT middleware, dan upload berkas multipart S3/MinIO.

2. **[docs/PRD.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/PRD.md):**
   Spesifikasi produk lengkap, latar belakang bisnis, dan kebutuhan operasional perusahaan outsourcing PT. BARAK.

3. **[docs/API-SPEC.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/API-SPEC.md):**
   Katalog detail endpoint REST untuk seluruh 15 modul operasional.

4. **[docs/DEPARTMENT-INPUT-REPORTING-MATRIX.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/DEPARTMENT-INPUT-REPORTING-MATRIX.md):**
   Matriks pemetaan input formulir/menu di setiap divisi hingga agregasi laporannya ke Cockpit & Approval Center Direktur.

5. **[docs/USER-FLOW.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/USER-FLOW.md):**
   Diagram dan narasi alur kerja operasional antar divisi.

6. **[docs/UI-GUIDELINE.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/UI-GUIDELINE.md):**
   Standar desain visual antarmuka, token warna resmi, dan 12 komponen standar UI.

7. **[docs/IMPLEMENTATION-PLAN.md](file:///c:/laragon/www/bimasenaadhirajasaradika/frontend/docs/IMPLEMENTATION-PLAN.md):**
   Rencana umum implementasi backend dan integrasi sistem.

---

## 2. Struktur Berkas Dokumentasi Ringkas (Streamlined Directory Structure)

```text
docs/
├── sot/
│   └── MASTER_SOURCE_OF_TRUTH.md           # Master Tunggal: Konsolidasi Arsitektur, Kontrak DDL 29 Entitas,
│                                           # API Contract, RBAC Matrix, Workflow, Enums, & Roadmap Backend
├── PRD.md                                  # Spesifikasi Produk & Kebutuhan Fungsional
├── API-SPEC.md                             # Spesifikasi Detail Endpoint REST
├── DEPARTMENT-INPUT-REPORTING-MATRIX.md   # Matriks Input Form & Laporan Eksekutif
├── USER-FLOW.md                            # Alur Bisnis Pengguna Multi-Divisi
├── UI-GUIDELINE.md                         # Standar Desain UI & Token Warna
├── IMPLEMENTATION-PLAN.md                  # Rencana Implementasi Teknis
└── README.md                               # Indeks Dokumentasi Ini
```
