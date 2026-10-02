# 04_RBAC_PERMISSION_MATRIX.md — PT. BARAK IOMS
**Versi:** 2.0 (Authoritative Role-Based Access Control)  
**Tanggal:** 29 September 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Ruang Lingkup:** Matriks Izin Granular 8 Peran & Penegakan Maker-Checker

---

## 1. Prinsip Otorisasi Keamanan (Security Principles)

> [!WARNING]
> **Prinsip Frontend Hiding vs Backend Enforcement:**
> Penonaktifan tombol atau penyembunyian menu di antarmuka frontend **hanya bertujuan sebagai perlindungan pengalaman pengguna (*UX protection*)**. Backend API Express **wajib memeriksa dan memvalidasi token JWT serta izin granular pada setiap request HTTP secara independen**.

---

## 2. Definisi Identifier Izin Granular (Permission Identifiers)

Berikut adalah daftar string identifier izin sistem yang digunakan di Frontend (`src/constants/permissions.js`):

```text
// Employee
employee.view                - Melihat daftar dan detail publik karyawan
employee.view_sensitive      - Melihat NIK lengkap, gaji, info perbankan
employee.create              - Mendaftarkan personil baru
employee.edit                - Memperbarui data personil
employee.delete.request      - Mengajukan permohonan hapus/nonaktif personil ke Direktur
employee.delete.approve      - Otorisasi final dan eksekusi soft delete personil (Direktur only)
employee.export              - Mengunduh rekapitulasi data personil (.CSV / .Excel)

// Attendance
attendance.view              - Melihat spreadsheet absensi posko
attendance.edit              - Melakukan koreksi jam kehadiran personil
attendance.finalize          - Mengunci lembar absensi bulanan (HRD)
attendance.reopen            - Membuka lembar absensi yang terkunci (Hak istimewa Direktur)
attendance.export            - Ekspor lembar kehadiran posko

// Clients & Sites
client.view                  - Melihat daftar klien mitra bisnis
client.create                - Menambahkan mitra klien korporat baru
client.edit                  - Memperbarui profil klien dan kontak
location.view                - Melihat daftar posko / lokasi
location.create              - Mendaftarkan posko operasional baru
location.edit                - Menyesuaikan kuota dan pos jaga

// Operations & Placements
placement.view               - Melihat plotting penugasan aktif
placement.create             - Plotting personil ke posko klien
placement.transfer           - Melakukan rotasi personil antar posko
incident.view                - Melihat register insiden keamanan posko
incident.create              - Melaporkan insiden lapangan baru
incident.resolve             - Menyelesaikan penanganan insiden posko
incident.escalate            - Mengeskalasi insiden ke Legal / Manajemen

// Finance & COD
invoice.view                 - Melihat faktur tagihan outsourcing
invoice.create               - Menerbitkan faktur baru ke klien
invoice.edit                 - Menyesuaikan termin faktur
invoice.status_change        - Memperbarui status faktur (ISSUED, PAID, OVERDUE, VOID)
payroll.view                 - Melihat rekapitulasi penggajian
payroll.create               - Menghitung dan menerbitkan draf payroll (Maker: Finance)
payroll.approve              - Menyetujui pencairan gaji (Checker: Direktur Only)
cod.view                     - Melihat arus uang kas titipan kurir COD
cod.reconcile                - Melakukan rekonsiliasi kas titipan kurir
cod.escalate                 - Mengeskalasi selisih kas kurir ke Legal
cod.settle                   - Menyelesaikan sengketa kas COD kurir

// Legal
contract.view                - Melihat arsip Perjanjian Kerja Sama (PKS)
contract.create              - Menyusun draf PKS baru
contract.edit                - Memperbarui klausul kontrak
contract.approve             - Otorisasi penandatanganan kontrak
legal.case.view              - Melihat register sengketa perkara hukum
legal.case.create            - Membuka berkas perkara perdata/pidana/perburuhan
compliance.view              - Memonitor izin SIO BUJP Polri & kepatuhan BPJS

// Marketing
lead.view                    - Melihat daftar prospek B2B
lead.create                  - Mendaftarkan prospek baru
opportunity.view             - Melihat pipeline tender
opportunity.win              - Menandai kesepakatan menang (memicu cascade lintas divisi)

// IT Support
it.ticket.view               - Melihat tiket helpdesk & status SLA
it.ticket.resolve            - Menyelesaikan tiket gangguan teknis
it.asset.view                - Memonitor perangkat IT posko
it.asset.manage              - Registrasi & inventarisasi radio HT / tablet

// Executive & Governance
director.dashboard           - Mengakses Cockpit Eksekutif Direktur
approval.view                - Melihat antrean permohonan persetujuan
approval.act                 - Eksekusi persetujuan atau penolakan permohonan
audit.log.view               - Mengakses rekam jejak audit sistem permanen
```

---

## 3. Matriks Hak Akses 8 Peran Resmi (Role Permission Matrix)

| Modul & Tindakan Kunci | DIREKTUR | HRD | OPERASIONAL | FINANCE | LEGAL | MARKETING | IT SUPPORT | ADMIN WEB |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Cockpit Eksekutif** | **YA** | - | - | - | - | - | - | - |
| **Approval Center (Otorisasi)** | **YA** | - | - | - | - | - | - | - |
| **Audit Log (Jejak Mutasi)** | **YA** | - | - | - | - | - | **YA** | - |
| **Karyawan: Read** | **YA** | **YA** | **YA** | **YA** | **YA** | **YA** | **YA** | - |
| **Karyawan: Create & Edit** | **YA** | **YA** | - | - | - | - | - | - |
| **Karyawan: Delete Request** | **YA** | **YA** | - | - | - | - | - | - |
| **Karyawan: Soft Delete Approve**| **YA** | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir |
| **Klien Mitra: Create & Edit** | **YA** | **YA** | ❌ Blokir | ❌ Blokir | ❌ Blokir | **YA** | ❌ Blokir | ❌ Blokir |
| **Absensi: Record & Edit** | **YA** | **YA** | **YA** | - | - | - | - | - |
| **Absensi: Finalize Bulanan** | **YA** | **YA** | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir |
| **Absensi: Reopen Lembar Terkunci**| **YA** | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir |
| **Penugasan / Rotasi Posko** | **YA** | **YA** | **YA** | - | - | - | - | - |
| **Insiden Posko & Patroli** | **YA** | - | **YA** | - | - | - | - | - |
| **Faktur: Read & Create** | **YA** | - | - | **YA** | - | - | - | - |
| **Payroll: Create (Maker)** | **YA** | - | - | **YA** | - | - | - | - |
| **Payroll: Approve (Checker)** | **YA** | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir | ❌ Blokir |
| **COD: Rekonsiliasi** | **YA** | - | **YA** | **YA** | - | - | - | - |
| **COD: Eskalasi & Settle** | **YA** | - | - | **YA** | **YA** | - | - | - |
| **Kontrak PKS: Kelola** | **YA** | - | - | - | **YA** | - | - | - |
| **Perkara Hukum: Kelola** | **YA** | - | - | - | **YA** | - | - | - |
| **Leads & Pipeline Tender** | **YA** | - | - | - | - | **YA** | - | - |
| **Tender Won Cascade** | **YA** | - | - | - | - | **YA** | - | - |
| **IT Helpdesk & Aset Posko** | **YA** | - | - | - | - | - | **YA** | - |
| **Website Berita, Karir & FAQ**| **YA** | - | - | - | - | - | - | **YA** |

---

## 4. Penegakan Batasan Maker-Checker (Maker-Checker Enforcement)

1. **Penggajian Karyawan (Payroll Lifecycle):**
   - **Maker:** Staf Keuangan (`FINANCE`) menyusun lembar draf gaji dan rekonsiliasi absensi.
   - **Checker:** Direktur (`DIREKTUR`) memverifikasi dan menyetujui (`PAYROLL_APPROVE`). Staf keuangan diblokir secara mutlak dari menyetujui gajinya sendiri.
2. **Penghapusan Personil (Workforce Integrity):**
   - Staf HRD atau Operasional **tidak dapat menghapus personil secara sepihak**. Staf hanya berhak membuat draf permohonan (`employee.delete.request`). Penghapusan logis hanya terjadi saat Direktur mengeksekusi `employee.delete.approve`.
3. **Pengesahan Kontrak Bernilai Besar:**
   - Bagian Legal menyusun draf klausul PKS (`LEGAL_REVIEW`), namun status `ACTIVE` hanya sah setelah otorisasi Direktur tercatat di sistem.
