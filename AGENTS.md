# AGENTS.md — PT. BARAK IOMS
**Versi:** 2.1 (Authoritative Governance & Engineering Rules)  
**Tanggal:** 4 Oktober 2026  
**Status:** FRONTEND 100% COMPLETE & TESTED (105/105 PASS, 0 LINT ERRORS, CLEAN BUILD) — READY FOR BACKEND IMPLEMENTATION  

---

## 1. Misi Sistem (Mission)
Bangun dan pelihara PT. BARAK IOMS (*Integrated Outsourcing Management System*) sebagai sistem operasional perusahaan alih daya tenaga kerja terpadu kelas enterprise, bukan sekadar dashboard mockup.

---

## 2. Sumber Kebenaran Tunggal (Source of Truth / SOT)
- **Sumber Fungsional Primer:** `docs/PRD.md` (Spesifikasi produk, 28 entitas database, RBAC, dan status enum).
- **Arsitektur Final Terpadu:** `docs/sot/01_FRONTEND_FINAL_ARCHITECTURE.md`.
- **Spesifikasi REST & Endpoint:** `docs/API-SPEC.md` & `docs/sot/02_API_CONTRACT.md`.
- **Skema & Kontrak Entitas Relasional:** `docs/sot/03_ENTITY_CONTRACT.md`.
- **Matriks Izin Granular RBAC:** `docs/sot/04_RBAC_PERMISSION_MATRIX.md`.
- **Alur Bisnis Lintas Divisi:** `docs/USER-FLOW.md` & `docs/sot/05_WORKFLOW_CONTRACT.md`.
- **Enum Status Siklus Hidup:** `docs/sot/06_STATUS_ENUMS.md`.
- **Standar Desain & Komponen UI:** `docs/UI-GUIDELINE.md` & `docs/sot/DASHBOARD_UX_V2.md`.
- **Roadmap Pengembangan Backend:** `docs/IMPLEMENTATION-PLAN.md` & `docs/sot/07_BACKEND_IMPLEMENTATION_ORDER.md`.
- **Panduan Integrasi Backend:** `docs/sot/08_FRONTEND_BACKEND_INTEGRATION_GUIDE.md`.
- **Persistensi Data & Operasi CRUD:** `docs/sot/CRUD_PERSISTENCE_V2.md`.
- **Matriks Input Bagian & Laporan:** `docs/DEPARTMENT-INPUT-REPORTING-MATRIX.md`.
- **Laporan Handoff Eksekutif:** `docs/sot/FINAL_FRONTEND_HANDOFF.md`.

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
    - Penggajian: Dibuat oleh Keuangan (`payroll.create`), disetujui secara eksklusif oleh Direktur (`payroll.approve`).
    - Presensi: Difinalisasi oleh HRD (`attendance.finalize`), hanya dibuka kembali oleh Direktur (`attendance.reopen`).
    - Hapus Karyawan: Diajukan oleh HRD (`employee.delete.request`), dieksekusi soft-delete oleh Direktur (`employee.delete.approve`).
11. **Tidak Ada Angka KPI Statis:** Seluruh indikator kartu analitik dashboard dihitung secara dinamis dari repository/data selektor aktif.
12. **Kemandirian Penyimpanan Dokumen:** Berkas dan dokumen diabstraksikan melalui `fileAdapter.js` tanpa keterikatan pada satu penyedia cloud tertentu.
13. **Tidak Ada Kunci/Rahasia di Source Control:** Variabel rahasia dan URL backend dikonfigurasi melalui `.env`.

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

