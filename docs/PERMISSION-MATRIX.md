# Matriks Otorisasi & Hak Akses (Permission Matrix)
**PT. Bhimasena Adhirajasa Radhika (PT. BARAK IOMS)**  
*Dokumen Resmi Kontrol Akses Berbasis Peran (Role-Based Access Control / RBAC)*  
*Versi: 1.0 — Sumber Kebenaran Otorisasi Sistem*

---

## 1. Definisi Level Otorisasi
- **R/W (Read / Write)**: Memiliki hak penuh untuk melihat data dan melakukan mutasi data (tambah, ubah, hapus, eskalasi, finalisasi, atau approve).
- **R (Read-Only)**: Memiliki hak untuk melihat dan membaca data untuk keperluan koordinasi atau pengawasan lintas divisi tanpa hak mutasi.
- **- (Forbidden)**: Dibatasi penuh. Tidak memiliki hak akses melihat atau mengelola modul/sumber daya tersebut.

---

## 2. Tabel Matriks Otorisasi & Hak Akses

| No | Modul & Sumber Daya | Direktur | Legal | HRD | Operasional | Finance | Marketing | IT Support | Admin Website |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | **Executive Dashboard & KPI** | **R/W** | **R** | **R** | **R** | **R** | **R** | **R** | **R** |
| 2 | **Approval Center (Otoritas Direksi)** | **R/W** | **-** | **-** | **-** | **-** | **-** | **-** | **-** |
| 3 | **Manajemen Pengguna & Staf** | **R/W** | **-** | **-** | **-** | **-** | **-** | **R** | **R/W** |
| 4 | **Tenaga Kerja (Employees)** | **R/W** | **R** | **R/W** | **R/W** | **R** | **R** | **R** | **R** |
| 5 | **Kehadiran Biometrik (Attendance)** | **R/W** | **R** | **R/W** | **R/W** | **R** | **R** | **R** | **-** |
| 6 | **Penempatan & Pos Site (Placements)** | **R/W** | **R** | **R/W** | **R/W** | **R** | **R** | **R** | **-** |
| 7 | **Insiden Lapangan & Relief Guard** | **R/W** | **R** | **R** | **R/W** | **-** | **-** | **-** | **-** |
| 8 | **Faktur & Piutang (Invoices)** | **R/W** | **R** | **-** | **-** | **R/W** | **R** | **-** | **-** |
| 9 | **Payroll Ketenagakerjaan** | **R/W** | **R** | **R** | **-** | **R/W** | **-** | **-** | **-** |
| 10 | **Rekonsiliasi Kas COD Kurir** | **R/W** | **R/W** | **-** | **R** | **R/W** | **-** | **-** | **-** |
| 11 | **Kasus Hukum & Kontrak Mitra** | **R/W** | **R/W** | **R** | **-** | **R** | **-** | **-** | **-** |
| 12 | **Prospek & CRM Pipeline (Leads)** | **R/W** | **-** | **-** | **-** | **-** | **R/W** | **-** | **-** |
| 13 | **Aset IT & Tiket Helpdesk** | **R/W** | **-** | **-** | **-** | **-** | **-** | **R/W** | **-** |
| 14 | **CMS Website & SEO Management** | **R/W** | **-** | **-** | **-** | **-** | **-** | **-** | **R/W** |
| 15 | **Audit Activity Feed** | **R/W** | **R** | **R** | **R** | **R** | **R** | **R** | **R** |

---

## 3. Aturan Visibilitas Menu Sidebar
Setiap akun hanya melihat menu navigasi yang relevan sesuai perannya:
- **Direktur**: Melihat seluruh modul operasional, pengawasan eksekutif, dan pusat persetujuan.
- **HRD**: Melihat menu **Master Data** (Karyawan, Penempatan, Shift) dan **HRD** (Attendance, Rekap Payroll, Kontrak).
- **Legal**: Melihat menu **Master Data** (Klien, Karyawan) dan **Legal** (Kasus Hukum, Kontrak PKS, Kepatuhan SIO, Eskalasi COD).
- **Operasional**: Melihat menu **Master Data** dan **Operasional** (Kesiapan Manpower, Insiden, Pergantian Personel, Jurnal Patroli).
- **Finance**: Melihat menu **Master Data** dan **Finance** (Faktur & Piutang, Payroll, Rekonsiliasi COD).
- **Marketing**: Melihat menu **Master Data** (Klien) dan **Marketing** (Manajemen Leads, CRM Pipeline, Handover WON).
- **IT Support**: Melihat menu **Master Data** (Pengguna) dan **IT Support** (Tiket Helpdesk, Aset Posko, Maintenance).
- **Admin Website**: Melihat menu **Master Data** (Pengguna) dan **Website** (CMS Artikel, Karir, FAQ, Inquiries, SEO).
