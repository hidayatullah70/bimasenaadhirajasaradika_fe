# AGENTS.md — PT. BARAK IOMS
**Versi:** 2.0 (Authoritative Governance & Engineering Rules)  
**Tanggal:** 29 September 2026  
**Status:** FRONTEND 100% COMPLETE & TESTED (166/166 PASS) — READY FOR BACKEND IMPLEMENTATION  

---

## 1. Misi Sistem (Mission)
Bangun dan pelihara PT. BARAK IOMS (*Integrated Outsourcing Management System*) sebagai sistem operasional perusahaan terpadu kelas enterprise, bukan sekadar dashboard mockup.

---

## 2. Sumber Kebenaran Tunggal (Source of Truth / SOT)
- **Sumber Fungsional Primer:** `docs/PRD.md` (Spesifikasi produk, 28 entitas database, RBAC, dan status enum).
- **Spesifikasi REST & Endpoint:** `docs/API-SPEC.md` & `02_API_CONTRACT.md`.
- **Alur Bisnis Lintas Divisi:** `docs/USER-FLOW.md` & `05_WORKFLOW_CONTRACT.md`.
- **Standar Desain & Komponen UI:** `docs/UI-GUIDELINE.md` & `DASHBOARD_UX_V2.md`.
- **Roadmap Pengembangan Backend:** `docs/IMPLEMENTATION-PLAN.md` & `07_BACKEND_IMPLEMENTATION_ORDER.md`.
- **Panduan Integrasi Backend:** `08_FRONTEND_BACKEND_INTEGRATION_GUIDE.md`.
- **Laporan Handoff Eksekutif:** `FINAL_FRONTEND_HANDOFF.md`.

*Jika terjadi ketidaksesuaian antara kode dan dokumen SOT di atas, stop dan konsultasikan sebelum mengubah perilaku bisnis sistem.*

---

## 3. Aturan Non-Negosiasi (Non-negotiables)
1. **Audit Terlebih Dahulu:** Jangan pernah menulis ulang kode secara membabi buta tanpa audit arsitektur.
2. **Landing Page Terkunci (STRICTLY FROZEN):** Seluruh 15 berkas di `src/features/landing/*` adalah baseline terverifikasi yang tidak boleh dimodifikasi.
3. **Satu Sumber Otoritatif per Entitas:** Karyawan, Klien, Penugasan, Presensi, Faktur, COD, Berkas Hukum, Prospek, dan Tiket IT masing-masing hanya memiliki satu *single source of truth*.
4. **Otorisasi Backend Mutlak:** Hiding/menyembunyikan menu di frontend adalah kenyamanan UI semata; backend Express wajib menegakkan autentikasi JWT dan pengecekan izin RBAC pada setiap endpoint.
5. **Jejak Audit Seluruh Mutasi Kritis:** Setiap aksi perubahan data penting (persetujuan, soft-delete, rotasi penugasan, finalisasi/pembukaan presensi, rekonsiliasi COD) wajib tercatat di tabel `audit_logs`.
6. **Mobilitas Tenaga Kerja (Workforce Mobility):** Entitas `employees` **tidak boleh** terikat permanen ke satu `clients`. Hubungan Karyawan $\leftrightarrow$ Klien wajib dijembatani oleh `placements` dengan histori status (`ACTIVE`, `ROTATED`, `ENDED`).
7. **Batas Maker-Checker (Segregation of Duties):**
   - Penggajian: Dibuat oleh Keuangan (`payroll.create`), disetujui secara eksklusif oleh Direktur (`payroll.approve`).
   - Presensi: Difinalisasi oleh HRD (`attendance.finalize`), hanya dibuka kembali oleh Direktur (`attendance.reopen`).
   - Hapus Karyawan: Diajukan oleh HRD (`employee.delete.request`), dieksekusi soft-delete oleh Direktur (`employee.delete.approve`).
8. **Tidak Ada Angka KPI Statis:** Seluruh indikator kartu analitik dashboard dihitung secara dinamis dari repository/data selektor aktif.
9. **Kemandirian Penyimpanan Dokumen:** Berkas dan dokumen diabstraksikan melalui `fileAdapter.js` tanpa keterikatan pada satu penyedia cloud tertentu.
10. **Tidak Ada Kunci/Rahasia di Source Control:** Variabel rahasia dan URL backend dikonfigurasi melalui `.env`.

---

## 4. Teknologi & Stack
- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide Icons + React Router DOM 6.
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
npm test        # Wajib 166/166 tes lolos
npm run build   # Wajib build produksi sukses tanpa kegagalan impor
```
Pastikan `git status src/features/landing` tetap bersih (*working tree clean*).
