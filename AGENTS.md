# AGENTS.md — PT. BARAK IOMS
**Versi:** 2.1 (Authoritative Governance & Engineering Rules)  
**Tanggal:** 4 Oktober 2026  
**Status:** FRONTEND 100% COMPLETE & TESTED (105/105 PASS, 0 LINT ERRORS, CLEAN BUILD) — READY FOR BACKEND IMPLEMENTATION  

---

## 1. Misi Sistem (Mission)
Bangun dan pelihara PT. BARAK IOMS (*Integrated Outsourcing Management System*) sebagai sistem operasional perusahaan alih daya tenaga kerja terpadu kelas enterprise, bukan sekadar dashboard mockup.

---

## 2. Sumber Kebenaran Tunggal (Source of Truth / SOT)
- **Master Terpadu SOT & Kontrak Backend:** `docs/sot/MASTER_SOURCE_OF_TRUTH.md` (Konsolidasi seluruh arsitektur, 29 entitas DDL MySQL, 18 klien resmi, spesifikasi REST API & amplop JSON, RBAC, alur bisnis lintas divisi, status enum, roadmap 20 tahap backend, dan panduan integrasi).
- **Spesifikasi Fungsional Produk (PRD):** `docs/PRD.md` (Spesifikasi produk, aturan bisnis, dan kebutuhan operasional).
- **Katalog Endpoint REST Lengkap:** `docs/API-SPEC.md` (Daftar endpoint per modul operasional).
- **Alur Bisnis Lintas Divisi:** `docs/USER-FLOW.md` (Diagram transaksi dan alur kerja lintas departemen).
- **Matriks Input Formulir & Pelaporan:** `docs/DEPARTMENT-INPUT-REPORTING-MATRIX.md` (Alur formulir ke Cockpit Direktur).
- **Panduan Desain & UI:** `docs/UI-GUIDELINE.md` (Standar visual, token warna, dan layout).
- **Rencana Implementasi Backend:** `docs/IMPLEMENTATION-PLAN.md` (Rencana eksekusi dan konfigurasi server).

*Jika terjadi ketidaksesuaian antara kode dan dokumen SOT di atas, stop dan konsultasikan sebelum mengubah perilaku bisnis sistem.*

---

## 3. Aturan Non-Negosiasi (Non-negotiables)
1. **Audit Terlebih Dahulu:** Jangan pernah menulis ulang kode secara membabi buta tanpa audit arsitektur.
2. **Landing Page Terkunci (STRICTLY FROZEN):** Seluruh 15 berkas di `src/features/landing/*` adalah baseline terverifikasi yang tidak boleh dimodifikasi sama sekali.
3. **Satu Sumber Otoritatif per Entitas:** Karyawan, Klien, Penugasan, Presensi, Faktur, COD, Berkas Hukum, Prospek, dan Tiket IT masing-masing hanya memiliki satu *single source of truth*.
4. **Otorisasi Backend Mutlak:** Hiding/menyembunyikan menu di frontend adalah kenyamanan UI semata; backend Express wajib menegakkan autentikasi JWT dan pengecekan izin RBAC pada setiap endpoint.
5. **Jejak Audit Seluruh Mutasi Kritis:** Setiap aksi perubahan data penting (persetujuan, soft-delete, rotasi penugasan, finalisasi/pembukaan presensi, rekonsiliasi COD) wajib tercatat di tabel `audit_logs`.
6. **Mobilitas Tenaga Kerja (Workforce Mobility):** Entitas `employees` **tidak boleh** terikat permanen ke satu `clients`. Hubungan Karyawan $\leftrightarrow$ Klien wajib dijembatani oleh `placements` dengan histori status (`ACTIVE`, `ROTATED`, `ENDED`).
7. **Sinkronisasi Otomatis Impor Karyawan (Atomic Bulk Import):** Fitur Impor Excel Karyawan (`EmployeeImportModal.jsx`) wajib mengeksekusi pembuatan entitas karyawan sekaligus menerbitkan entitas penugasan aktif (`placements`) yang terikat ke Klien dan Lokasi Penempatan terpilih secara atomik.
8. **Sinkronisasi Presensi Berbasis Klien & Lokasi:** Lembar presensi (`AttendanceSpreadsheetPage.jsx`) wajib secara otomatis menampilkan daftar karyawan aktif pada Klien dan Lokasi terpilih dengan kolom jam Datang, Pulang, Lembur disiapkan kosong untuk entri manual, serta menampilkan notifikasi informatif jika data karyawan pada lokasi klien tersebut masih kosong.
9. **Isolasi Sesi Petugas Inputer:** Ketika petugas inputer (`user1`, `user2`) melakukan logout, riwayat kerja sementara / draft lembar ("Lembar Tersedia") wajib dibersihkan dari penyimpanan sesi agar login berikutnya dimulai dalam kondisi bersih.
10. **Batas Maker-Checker (Segregation of Duties):**
    - Penggajian: Dibuat oleh Keuangan (`payroll.create`), disetujui secara eksklusif oleh Direktur Utama (`payroll.approve`).
    - Presensi: Difinalisasi oleh HRD (`attendance.finalize`), hanya dibuka kembali oleh Direktur Utama (`attendance.reopen`).
    - Hapus Karyawan: Diajukan oleh HRD (`employee.delete.request`), dieksekusi soft-delete oleh Direktur Utama (`employee.delete.approve`).
11. **Tidak Ada Angka KPI Statis:** Seluruh indikator kartu analitik dashboard dihitung secara dinamis dari repository/data selektor aktif.
12. **Kemandirian Penyimpanan Dokumen:** Berkas dan dokumen diabstraksikan melalui `fileAdapter.js` tanpa keterikatan pada satu penyedia cloud tertentu.
13. **Tidak Ada Kunci/Rahasia di Source Control:** Variabel rahasia dan URL backend dikonfigurasi melalui `.env`.
14. **Standarisasi Faktur Penagihan & Rumus Finansial (Invoice Governance):** Pembuatan faktur (`InvoiceFormModal.jsx`) mendukung input Nomor Faktur manual atau generator otomatis, rincian penempatan jasa dan reward/potongan dinamis tak terhingga, Manajemen Fee ($n\% = \text{Sub Total Jasa} \times n\%$), PPh 23 ($2\% = \text{Manajemen Fee} \times 2\%$), dan toggle PPN 11% ($\text{Manajemen Fee} \times 11\%$). Snapshot data profil klien (Nama, Kontak U.P., Alamat lengkap, Kota) wajib tersimpan pada entitas invoice untuk integritas lembar cetak.
15. **Eksklusivitas Rekening Pembayaran (Single Corporate BCA Channel):** Kanal pembayaran invoice klien ditetapkan secara eksklusif ke Rekening Bank Central Asia (BCA) `8833951911` a.n. `BIMASENA ADHIRAJASA RADHIKA`. Modal pencatatan pembayaran (`PaymentRecordModal.jsx`) mengunci metode pembayaran ke `Bank Transfer (BCA)` dengan nomor referensi transfer bank wajib diisi.
16. **Integritas Aset Brand Resmi (Official Corporate Branding):** Seluruh badge placeholder huruf "B" dilarang dan digantikan secara permanen oleh aset logo resmi korporat `/assets/img/logo/logoAja.png` pada seluruh kop laporan eksekutif, lembar cetak faktur A4, modal dialog, dan bilah navigasi shell.
17. **Keamanan Kredensial Pengguna & Standarisasi Avatar (User Security & Profile Governance):** Fitur ubah kata sandi (`/ops/profile`) wajib memverifikasi kecocokan kata sandi lama, memvalidasi panjang kata sandi baru (minimal 6 karakter), dan mencatat aksi ke `audit_logs` (`USER_PASSWORD_CHANGE`). Pengelolaan foto profil/avatar diakses melalui ikon kamera pada lingkaran profil dengan auto-crop rasio 1:1 persegi (256x256 px). Foto profil wajib persisten secara permanen di database/storage dan tidak boleh kembali menjadi inisial huruf setelah logout maupun login ulang; sistem wajib memetakan avatar ke username utama, user ID, dan seluruh alias resmi (`direkturutama` $\leftrightarrow$ `juli.priyanto` $\leftrightarrow$ `usr-001`, dsb.) serta menyediakan fallback foto profil terakhir yang diperbarui. Penghapusan foto (`avatar: null`) secara eksplisit adalah satu-satunya aksi yang mengembalikan profil ke inisial nama. Perubahan avatar disinkronkan secara real-time ke seluruh bilah navigasi Shell (Sidebar & Topbar) melalui event `barak:avatar-updated` dan dicatat ke `audit_logs` (`USER_AVATAR_UPDATE`).

---

## 4. Teknologi & Stack
- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide Icons + React Router DOM 6 + SheetJS (XLSX).
- **Backend Target:** Node.js + Express.js.
- **Database:** MySQL 8.0 (Lokal: Laragon, Produksi: Railway).
- **Penyimpanan Berkas:** S3-compatible / MinIO / REST multipart.
- **Pengujian API:** Hoppscotch / Postman.
- **Tipografi:** `Inter` (antarmuka primer) + `Orbitron` (aksen futuristik, identitas teknis, dan kredit pengembang).
- **Token Warna Resmi:**
  - `--primary-red: #BA1D23`
  - `--primary-yellow: #F9CE3B`
  - `--accent-green: #32B23E`
  - `--ink: #0F172A`

---

## 5. Arsitektur Berlapis Frontend (Layered Architecture)
$$\text{UI Layer} \longrightarrow \text{Custom Hooks} \longrightarrow \text{Application Services} \longrightarrow \text{Repositories} \longrightarrow \text{Service Adapters} \longrightarrow \text{API Client}$$

- **Dual-Mode Switch:**
  - `VITE_API_MODE=mock`: Menggunakan repository lokal persisten (berjalan mandiri di browser tanpa server).
  - `VITE_API_MODE=rest`: Mengarahkan 24 service adapter ke endpoint REST Express melalui `apiClient.js`.

---

## 6. Prosedur Verifikasi Wajib (Verification Protocol)
Sebelum menyerahkan setiap perubahan kode, jalankan verifikasi:
```bash
npm run lint    # Wajib 0 error, 0 warning (dengan aturan no-undef: error)
npm test        # Wajib seluruh tes lolos (105/105)
npm run build   # Wajib build produksi sukses tanpa kegagalan impor
```
Pastikan `git status src/features/landing` tetap bersih (*working tree clean*).

