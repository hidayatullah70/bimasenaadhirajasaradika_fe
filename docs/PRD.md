# PRD — PT. BARAK Integrated Outsourcing Management System (IOMS)

**Project:** PT. Bhimasena Adhirajasa Radhika (PT. BARAK)  
**System:** Integrated Outsourcing Management System (IOMS)  
**Version:** 1.1 — SOT Baseline (Refined)  
**Language:** Bahasa Indonesia  
**Status:** Ready for staged implementation

> Refinement note: this revision preserves the supplied PRD scope and terminology while clarifying SOT governance, API contracts, workflow ownership, acceptance gates, and implementation sequencing. No new business module is introduced.  
**Frontend:** React + Vite + Tailwind CSS  
**Backend:** Node.js + Express.js  
**Database:** MySQL (Laragon local → Railway production)  
**API Testing:** Hoppscotch  
**Public site:** Landing Page + CMS  
**Internal app:** Operational dashboard; login is not exposed in public navigation

---

## 1. PRODUCT VISION

Bangun satu sistem internal terintegrasi untuk perusahaan outsourcing PT. BARAK yang menempatkan tenaga kerja pada lokasi client.

Enam layanan utama:

1. Jasa Pengamanan / Security
2. Ekspedisi Kurir
3. Parkir
4. Cleaning Service
5. Man Power
6. Loss Prevention

Prinsip utama:

> **Single Source of Truth → Workflow → Permission → Auditability → Usability.**

Data Employee, Client, Project, Location, Assignment, Attendance, Contract, Payroll, Invoice, COD, Legal Case, IT Ticket, Lead, dan CMS tidak boleh diduplikasi antar-departemen.

---

## 2. SCOPE

### 2.1 Public Landing Page & Website Experience

Landing page PT. BARAK untuk calon client, pelamar kerja, dan publik:

- **Home / Beranda**: Hero banner, ringkasan keunggulan, showcase 6 layanan utama, portofolio klien, dan CTA konsultasi.
- **Tentang Perusahaan (`/perusahaan/profil`)**: Sejarah, legalitas, visi misi ("H A P P Y"), dewan direksi, manajemen operasional, sertifikat, dan unduhan resmi Company Profile PDF.
- **Layanan (`/layanan`)**: Detail 6 unit bisnis (Security, Kurir/COD, Parkir, Cleaning Service, Man Power, Loss Prevention).
- **Client & Portofolio (`/client`)**: Daftar 18+ klien aktif dan rekam jejak pengamanan fasilitas industri.
- **Karir (`/career`)**: Informasi rekrutmen dan peluang karir dengan form lamaran terhubung ke HRD.
- **Warta & Publikasi (`/news`)**: Berita resmi sertifikasi BUJP Polri dan kepatuhan industri.
- **Blog & Edukasi (`/blog`)**: Wawasan manajemen fasilitas dan regulasi ketenagakerjaan.
- **Pusat Informasi & FAQ (`/faq`)**: Tanya jawab legalitas, standar UMK, dan SOP darurat.
- **Halaman Kontak Dedikasi (`/contact`)**:
  - Form konsultasi / inquiry ("Kirim Pesan") terintegrasi dengan Marketing Lead Queue.
  - Peta interaktif Google Maps resmi PT. Bimasena Adhirajasa Radhika di Tangerang.
  - Kanal kontak langsung: WhatsApp Konsultasi (`0851 2479 9305`), WhatsApp Lowongan Kerja (`0851 8784 5044`), dan email resmi.
- **Public Navbar**:
  - Warna default `bg-accent-green` (`#32B23E`), scroll transition ke `bg-white/95 backdrop-blur-md`.
  - Sinkronisasi responsive breakpoint pada `lg` (1024px) untuk menu navigasi penuh, input pencarian cepat (Quick Search), dan tombol merah CTA "Hubungi Kami".
  - Mode mobile/tablet (`< 1024px`) menampilkan drawer menu rapi dengan hamburger button.
- **Standar Hero Header**: Menggunakan dark header (`bg-ink py-20`) dan badge hijau seragam (`bg-accent-green/20 text-accent-green`) di seluruh halaman publik.
- **Public Footer**: 4 Kolom navigasi (Brand, Layanan, Tautan Cepat, Kontak), link peta Google Maps, sosial media resmi (Facebook, Instagram, TikTok, Twitter), serta atribusi developer `Sistem IOMS v1.0 by BionoraDev` berfont *Orbitron*.

Landing page tidak menampilkan menu Login Dashboard (keamanan by obscurity di level publik; route `/ops/login` terisolasi).

### 2.2 Internal IOMS

Role:

1. Direktur
2. HRD
3. Legal
4. Operasional
5. Finance
6. Marketing
7. IT Support
8. Admin Website

Login internal tetap ada pada route internal/private dan backend wajib melakukan authentication + RBAC. Route login tidak ditautkan dari landing page.

---

## 3. EXISTING PROJECT BASELINE

Referensi aplikasi front end yang diberikan user:

`https://bimasenaadhirajasaradika.vercel.app/`

---

## 4. BUSINESS OBJECTIVES

- Menjadi pusat data operasional perusahaan.
- Mengurangi input data berulang.
- Menjaga relasi Employee → Assignment → Attendance → Payroll.
- Menjaga relasi Client → Project → Location → Service → Billing.
- Menjaga alur Finance COD → Operations Verification → Legal → Director.
- Menjaga alur Website Lead → Marketing → Opportunity → Client → Operations → Finance.
- Memberi Direktur visibility tanpa membuka data sensitif yang tidak diperlukan.
- Menyediakan audit trail untuk tindakan kritis.
- Menyiapkan arsitektur yang mudah dipindahkan dari mock repository ke REST API.

---

## 5. NON-GOALS / BATASAN

Jangan membangun pada fase awal:

- full accounting software
- real banking integration
- payroll bank transfer production
- WhatsApp API production
- payment gateway production
- automatic legal advice
- automatic criminal classification
- predictive employee scoring
- AI yang mengambil keputusan HR/legal tanpa approval manusia

Gunakan abstraction/mock service bila integrasi production belum tersedia.

---

## 6. ROLE & RESPONSIBILITY

### 6.1 Direktur

Fokus: executive visibility dan approval.

Menu:

- Executive Dashboard
- KPI Perusahaan
- Client Performance
- Location Monitoring
- Workforce Overview
- Finance Overview
- Legal & Risk
- Management Reports
- Approval Center
- Executive Activity

Hak akses default: read + approval tertentu.

### 6.2 HRD

Fokus:

- employee master
- recruitment
- onboarding
- employee documents
- employment contract
- placement administratif
- attendance
- leave/permission
- mutation
- promotion
- violation
- evaluation
- offboarding

**Kebutuhan khusus:** Attendance Spreadsheet per lokasi.

### 6.3 Legal

Fokus:

- legalitas employee
- kontrak dan perjanjian
- compliance
- legal case
- COD collection escalation
- surat/teguran/somasi sesuai kewenangan perusahaan
- proses hukum
- deadline
- legal document

### 6.4 Operasional

Fokus:

- client
- project
- location
- post/area
- manpower requirement
- assignment
- shift
- schedule
- operational attendance
- inspection
- incident
- replacement
- field report

### 6.5 Finance

Fokus:

- billing
- invoice
- payment
- receivable
- payroll
- cash/bank reference
- COD reconciliation
- financial report

### 6.6 Marketing

Fokus:

- leads
- prospects
- opportunities
- pipeline
- activities
- meetings
- survey
- proposal
- quotation
- tender/RFP
- follow-up
- campaign
- won/lost
- handover client

### 6.7 IT Support

Fokus:

- users/access
- IT assets
- tickets
- SLA
- maintenance
- network
- backup
- security
- system monitoring

### 6.8 Admin Website

Fokus:

- pages
- services
- portfolio
- news
- blog
- careers
- FAQ
- contact
- media
- banner
- SEO
- website settings
- incoming website leads

### 6.9 Matriks Otorisasi & Hak Akses Granular (Granular RBAC & Workflow Governance)

#### 6.9.1 Prinsip Tata Kelola Hak Akses & Kewenangan
Sistem IOMS PT. BARAK menerapkan prinsip tata kelola akses berbasis peran (*Role-Based Access Control*) yang ketat dengan aturan non-negosiasi berikut:
1. **Otoritas Tertinggi pada Direktur**: Direktur memegang wewenang eksekutif tertinggi (*Supreme Executive Authority*), memiliki visibilitas lintas modul (Read global), hak persetujuan mutlak (*Executive Sign-off & Final Approval*), hak override pengecualian SOP, serta akses forensik audit trail global.
2. **Pemisahan Tugas (Segregation of Duties / Maker-Checker Principle)**: Departemen pembuat/pengusul draft (*maker*) dilarang keras mengesahkan persetujuan final atas tindakannya sendiri (*checker*). Contoh: Tim Finance yang menghitung kalkulasi Payroll tidak dapat melakukan persetujuan final (Approval mutlak di tangan Direktur).
3. **Integritas Transaksi & Anti-Tampering**: Seluruh data yang telah difinalisasi atau disetujui (misal: Absensi Terfinalisasi, Faktur Terbit, Payroll Disetujui, Perjanjian Kontrak Aktif) terkunci secara permanen (*immutable state*). Tindakan pembukaan kembali (*reopen*) atau pembatalan (*void*) mewajibkan otorisasi Direksi dan otomatis dicatat pada audit log.
4. **Larangan Penghapusan Fisik (No Hard Delete on Core Data)**: Seluruh penghapusan data operasional bersifat *Soft-Delete / Archive / Void*. Data riwayat transaksi, kontrak, absensi, dan keuangan wajib tersimpan permanen untuk kepatuhan hukum dan audit ketenagakerjaan.

#### 6.9.2 Definisi Kode Izin Granular (Action Codes)
Otorisasi pada setiap modul didefinisikan dengan kode aksi granular sebagai berikut:
- **C (Create)**: Hak membuat record baru atau menginisiasi draft awal transaksi (HTTP `POST`).
- **R (Read)**: Hak membaca daftar data, meninjau detail record, memfilter pencarian, dan melihat dashboard (HTTP `GET`).
- **U (Update)**: Hak menyunting, melengkapi, atau mengoreksi data pada status aktif/draft (HTTP `PUT / PATCH`).
- **D (Delete / Archive)**: Hak menghapus draft sementara atau mengarsipkan/menonaktifkan record aktif melalui *soft-delete* (HTTP `DELETE`).
- **X (Execute Workflow)**: Hak menjalankan aksi alur kerja kritis (*Approve, Reject, Finalize/Lock, Reopen, Escalate, Reconcile, Handover, Publish*) (HTTP `POST /action`).
- **E (Export)**: Hak mengunduh dokumen laporan resmi dalam format Excel/PDF/CSV berstempel digital/audit (HTTP `GET /export`).
- **- (Forbidden)**: Dibatasi penuh. Tidak memiliki izin akses melihat atau mengelola modul/sumber daya tersebut.

#### 6.9.3 Tabel Matriks Otorisasi Granular (15 Modul x 8 Peran)

| No | Modul & Sumber Daya | Direktur | Legal | HRD | Operasional | Finance | Marketing | IT Support | Admin Website |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | **Executive Dashboard & KPI** | **C, R, U, E, X** | **R** | **R** | **R** | **R** | **R** | **R** | **R** |
| 2 | **Approval Center (Otoritas Direksi)** | **R, X** | **-** | **-** | **-** | **-** | **-** | **-** | **-** |
| 3 | **Manajemen Pengguna & Staf** | **C, R, U, D, X** | **-** | **-** | **-** | **-** | **-** | **R, U** | **C, R, U** |
| 4 | **Tenaga Kerja (Employees)** | **R, E** | **R, E** | **C, R, U, D, E** | **R, U** *(pos/shift)* | **R** *(bank BCA)* | **R** *(kualifikasi)* | **R** *(akun/email)* | **-** |
| 5 | **Kehadiran Biometrik (Attendance)** | **R, E, X** *(reopen)* | **R** | **C, R, U, E, X** *(lock)*| **R, U** *(izin site)* | **R, E** | **-** | **R** *(scanner)* | **-** |
| 6 | **Penempatan & Pos Site (Placements)**| **R, E** | **R** | **R, U** *(admin/PKWT)*| **C, R, U, D, X** | **R** *(billing/site)*| **R** *(kapasitas)* | **R** *(geo-tag)* | **-** |
| 7 | **Insiden Lapangan & Relief Guard** | **R, X** *(high risk)*| **R, U, X** *(BAP)* | **R, U** *(SP staf)* | **C, R, U, X** | **R** *(lembur/klaim)*| **-** | **-** | **-** |
| 8 | **Faktur & Piutang (Invoices)** | **R, E, X** *(write-off)*| **R, X** *(somasi)* | **-** | **R** *(hari kerja)* | **C, R, U, D, E, X** | **R** *(status bayar)*| **-** | **-** |
| 9 | **Payroll Ketenagakerjaan** | **R, E, X** *(approve)* | **R** *(UMK rule)* | **R, U, E** *(pre-check)*| **-** | **C, R, U, E, X** *(submit)*| **-** | **-** | **-** |
| 10 | **Rekonsiliasi Kas COD Kurir** | **R, E, X** *(write-off)*| **R, U, X** *(litigasi)*| **R** *(evaluasi)* | **R, U** *(verif fisik)*| **C, R, U, E, X** | **-** | **-** | **-** |
| 11 | **Kasus Hukum & Kontrak Mitra (PKS)**| **R, E, X** *(sign/tutup)*| **C, R, U, D, E, X** | **R** *(ketenagakerjaan)*| **R** *(lingkup SOP)*| **R** *(termin bayar)*| **R, U** *(draft tender)*| **-** | **-** |
| 12 | **Prospek & CRM Pipeline (Leads)** | **R, E, X** *(diskon)* | **R** *(uji tuntas)* | **R** *(proyeksi)* | **R** *(survei site)* | **R** *(termin klien)*| **C, R, U, D, E, X** | **-** | **C, R** *(web inquiry)*|
| 13 | **Aset IT & Tiket Helpdesk** | **C, R** | **C, R** | **C, R** | **C, R** | **C, R** | **C, R** | **C, R, U, D, E, X** | **C, R** |
| 14 | **CMS Website & SEO Management** | **R, X** *(approve)* | **-** | **R, U** *(materi loker)*| **-** | **-** | **R** *(materi promo)*| **-** | **C, R, U, D, E, X** |
| 15 | **Audit Activity Feed & Forensik** | **R, E** *(global)* | **R, E** *(hukum)* | **R** *(divisi)* | **R** *(divisi)* | **R** *(divisi)* | **R** *(divisi)* | **R** *(divisi)* | **R** *(divisi)* |

*Catatan Khusus Aksi Granular:*
- Modul 2 (**Approval Center**): Eksklusif bagi **Direktur** untuk menyetujui mutasi finansial (Payroll), pembukaan kembali data terkunci (Reopen Absensi), penghapusan piutang (Write-off COD), kontrak bernilai strategis, dan eskalasi kasus tingkat tinggi.
- Modul 4 (**Employees**): Hanya **HRD** yang berhak menambah/mengubah data personal sensitif dan rekening bank BCA. Tim **Operasional** hanya berhak memperbarui status penempatan kualifikasi lapangan, sertifikasi garda, dan jadwal ketersediaan.
- Modul 5 (**Attendance**): **HRD** memegang wewenang *Finalize/Lock*. Setelah status terkunci, mutasi rekap dilarang total; pembukaan kembali (*Reopen*) hanya dapat dieksekusi dengan otorisasi **Direktur**.
- Modul 8 & 9 (**Invoices & Payroll**): **Finance** menyusun kalkulasi dan memverifikasi potongan. Pada Payroll, Finance wajib men-submit ke Direktur untuk proses *Approval* (Finance dilarang meng-approve kalkulasi gajinya sendiri).
- Modul 10 (**COD Kurir**): **Operasional** memverifikasi fisik paket/uang kurir di lapangan. Jika terjadi selisih kas tak terselesaikan, **Finance** merekonsiliasi dan melimpahkan kasus ke **Legal** untuk penindakan hukum/somasi.
- Modul 13 (**Aset IT & Tiket Helpdesk**): Seluruh departemen memiliki hak `C, R` (dapat membuat tiket permohonan bantuan teknis atau keluhan fasilitas dan memantau status tiketnya). Hak alokasi teknisi, pembaruan progres, dan penyelesaian (*Close/Resolve*) tiket dipegang oleh **IT Support**.

#### 6.9.4 Matriks Keterkaitan Alur Kerja Antar-Departemen (Cross-Department Workflow Handover)
Sistem IOMS PT. BARAK menghubungkan aktivitas antar-divisi melalui gerbang otorisasi (*Workflow Gates*) yang berkesinambungan:
```text
1. Alur Klien & Komersial:
   Marketing (Leads → Proposal → WON) 
   → Legal (Penyusunan & Pengesahan PKS Kontrak Klien) 
   → Operasional (Survei Lokasi, Alokasi Pos, & Penempatan Personel) 
   → Finance (Penerbitan Invoice Tagihan & Penerimaan Piutang).

2. Alur Karyawan, Presensi, & Penggajian:
   HRD (Rekrutmen Karyawan, Berkas eKTP, Rekening BCA, & Kontrak PKWT) 
   → Operasional (Penugasan Pos Site, Alokasi Shift, & Laporan Kehadiran Site) 
   → HRD (Koreksi Jam Kerja, Validasi Kehadiran, & Finalisasi/Lock Absensi) 
   → Finance (Penarikan Data Absensi Final, Perhitungan Tunjangan/Potongan, & Submit Payroll) 
   → Direktur (Persetujuan Final di Approval Center & Otorisasi Pencairan Gaji).

3. Alur Rekonsiliasi Kas COD Ekspedisi:
   Finance (Impor Manifest Transaksi & Identifikasi Selisih Kas Kurir) 
   → Operasional (Verifikasi Lapangan & Klarifikasi Berita Acara Kurir) 
   → Finance (Penagihan Kasbon/Potongan Kurir Jika Bersedia Ganti Rugi) 
   → Legal (Eskalasi Somasi/Tindakan Hukum Jika Terjadi Penggelapan/Unresolved) 
   → Direktur (Otorisasi Penghapusan Piutang Macet / Persetujuan Jalur Litigasi).

4. Alur Manajemen Insiden Lapangan:
   Operasional (Pencatatan Insiden Pos Site & Pengerahan Personel Pengganti/Relief Guard) 
   → HRD (Penerbitan Surat Peringatan/Tindakan Disiplin Karyawan Pelanggar) 
   → Legal (Investigasi BAP Hukum, Mediasi Klien, atau Laporan Kepolisian) 
   → Direktur (Monitoring Eskalasi Insiden Kritis Berdampak Finansial/Reputasi).
```

#### 6.9.5 Aturan Visibilitas Menu Sidebar
Setiap akun staf yang berhasil terotentikasi hanya akan disajikan menu navigasi yang relevan sesuai perannya untuk menjamin kerapian antarmuka dan keamanan data:
- **Direktur**: Menampilkan seluruh menu navigasi modul: Executive Dashboard, Approval Center, Audit Forensik, Master Data, HRD, Operasional, Finance, Legal, Marketing, IT Support, dan CMS Website.
- **HRD**: Menampilkan menu **Master Data** (Karyawan, Penempatan Administratif, Shift) dan **HRD** (Attendance Spreadsheet, Rekap Payroll, Kontrak PKWT/PKWTT).
- **Legal**: Menampilkan menu **Master Data** (Klien, Karyawan) dan **Legal** (Kontrak PKS, Kepatuhan SIO/BPJS, Kasus Hukum, Eskalasi COD).
- **Operasional**: Menampilkan menu **Master Data** (Klien, Proyek, Lokasi, Pos Site) dan **Operasional** (Monitoring Manpower, Penjadwalan Shift, Insiden, Pergantian Personel, Laporan Lapangan).
- **Finance**: Menampilkan menu **Master Data** (Klien, Proyek) dan **Finance** (Faktur & Piutang, Payroll Karyawan, Rekonsiliasi Kas COD).
- **Marketing**: Menampilkan menu **Master Data** (Klien) dan **Marketing** (Manajemen Leads, CRM Pipeline, Peluang Tender, Handover WON).
- **IT Support**: Menampilkan menu **Master Data** (Pengguna & Peran) dan **IT Support** (Tiket Helpdesk, Aset Perangkat Posko, Jadwal Pemeliharaan).
- **Admin Website**: Menampilkan menu **Master Data** (Pengguna) dan **Website CMS** (Kelola Berita, Blog, Karir Loker, FAQ, Media, SEO, Web Inquiries).

---

## 7. INFORMATION ARCHITECTURE

### Public

```text
/
├── /tentang
├── /layanan
├── /layanan/security
├── /layanan/kurir
├── /layanan/parkir
├── /layanan/cleaning-service
├── /layanan/man-power
├── /layanan/loss-prevention
├── /client
├── /career
├── /news
├── /blog
├── /faq
└── /contact
```

### Internal

```text
/ops/login                 # private; tidak ditampilkan di landing
/ops
├── /director
├── /hrd
├── /legal
├── /operations
├── /finance
├── /marketing
├── /it
├── /website
├── /notifications
├── /search
├── /audit
└── /profile
```

---

## 8. GLOBAL APP SHELL

Setiap halaman internal:

- collapsible sidebar
- topbar
- breadcrumb
- global search
- notification center
- profile
- page title + description
- filter/date range jika relevan
- quick actions
- KPI
- table/card/chart yang memiliki nilai bisnis
- activity
- empty/loading/error state

Sidebar tidak boleh menampilkan modul yang tidak diizinkan oleh permission.

---

## 9. DAFTAR CLIENT AKTIF (REAL - PRODUCTION DATA)

18 Client existing PT BARAK (bukan dummy, wajib ada di production seed)

| No | Nama Client | Tipe |
|---|---|---|
| 1 | JNT LOGISTIK | Logistik |
| 2 | PT SURYA DUNIA EXPRESS | Logistik |
| 3 | MEGAH JAYA SEMESTA | Logistik |
| 4 | MAHARDIKA JAYA LOGISTIK | Logistik |
| 5 | SALEMBARAN 99 | Area |
| 6 | BONA CITY | Area |
| 7 | GERAJA ABBHALOVE | Area |
| 8 | DROP POINT PAKOJAN | Drop Point |
| 9 | DROP POINT KIBIN | Drop Point |
| 10 | DROP POINT PASGAD | Drop Point |
| 11 | DROP POINT JATIUWUNG | Drop Point |
| 12 | DROP POINT WANAKERTA | Drop Point |
| 13 | DROP POINT BATU CEPER | Drop Point |
| 14 | DROP POINT PINANG CIPONDOH | Drop Point |
| 15 | DROP POINT CIBODAH RAYA | Drop Point |
| 16 | DROP POINT PANONGAN | Drop Point |
| 17 | DROP POINT PIK 2 | Drop Point |
| 18 | DROP POINT KELAPA DUA | Drop Point |

**Note:**
- Data client di atas adalah data real production.
- Untuk development: pakai 18 data ini + 5 employees dummy.
- Saat build ke hosting: data dummy employees dihapus, tapi 18 client ini TETAP ADA.


## 10.DIRECTOR DASHBOARD

### KPI

- active employees
- active clients
- active projects
- active locations
- monthly revenue
- outstanding receivables
- payroll total
- active legal cases
- unresolved COD
- open incidents
- open IT tickets
- new website leads

### Widgets

**Workforce**
- headcount
- per service
- active/inactive
- expiring contracts
- location staffing gap

**Operations**
- active locations
- understaffed locations
- attendance issue
- incidents
- replacement requests

**Finance**
- invoice issued
- paid
- outstanding
- overdue
- payroll
- COD outstanding

**Legal**
- open cases
- cases approaching deadline
- contract/document expiry
- COD legal escalations

**Marketing**
- leads
- qualified leads
- pipeline value
- proposals
- won/lost counts

**IT**
- open tickets
- SLA breach
- critical assets/alerts

Setiap KPI clickable menuju filtered detail.

---

## 11. HRD MODULE

### 11.1 Employee Master

Minimum:

- id_karyawan
- NIK
- nama_lengkap_sesuai_KTP
- jenis_kelamin
- tempat_lahir
- tanggal_lahir
- alamat_sesuai_KTP
- nomor_telepon
- email
- kontak_darurat
- tanggal_masuk
- status_kerja
- jenis_pekerjaan
- jabatan
- departemen
- jenis_layanan
- cabang
- penugasan_klien
- lokasi_penugasan
- atasan
- nama_bank
- nomor_rekening_bank
- NPWP
- BPJS_kesehatan
- BPJS_ketenagakerjaan
- kelengkapan dokumen
- status kontrak
- foto_3x4 (wajib, JPG/PNG, rasio 3:4, diambil dengan perangkat/kamera, maksimal 2MB)

Sensitive fields harus permission-based dan masking.

### 11.2 Attendance Spreadsheet — REQUIREMENT KHUSUS

Attendance menjadi fitur utama HRD dan sumber input payroll/billing.

#### Konsep

Attendance dibuat per:

```text
Bulan → Client → Location → Service → Roster
```

Contoh:

```text
September 2026
└── Client ABC
    └── Location Gudang Jakarta
        └── Security
            ├── EMP-0001
            ├── EMP-0002
            └── EMP-0003
```

#### Kolom spreadsheet

Kolom master/locked:

- Employee ID
- NIK
- Nama
- Service
- Jabatan
- Client
- Location
- Shift
- Jadwal Masuk
- Jadwal Pulang

Kolom input HRD:

- Jam Datang
- Jam Pulang

Kolom calculated/read-only:

- Total Jam
- Status
- Keterlambatan
- Lembur bila diaktifkan
- Catatan sistem

HRD tidak mengetik ulang nama/NIK/client/location. Semua diambil dari Employee + Assignment + Shift.

#### Dynamic roster

Jumlah karyawan per bulan dapat bertambah/berkurang.

Aturan:

1. Roster bulan baru dibuat dari active assignment.
2. Employee yang baru ditempatkan masuk roster jika assignment aktif pada periode tersebut.
3. Employee yang selesai assignment tidak muncul pada roster baru setelah end date.
4. Historical attendance tidak berubah hanya karena master employee berubah.
5. Roster bulan yang sudah final menjadi snapshot.
6. Master fields di attendance dikunci.
7. HRD hanya mengisi jam datang/pulang pada periode open.
8. Setelah `FINALIZED`, edit hanya melalui reopen dengan permission khusus dan audit trail.

#### Attendance status

System-derived:

- PRESENT
- LATE
- EARLY_LEAVE
- PRESENT_PARTIAL
- ABSENT
- INCOMPLETE
- UNFILLED

Jangan menjadikan blank otomatis sebagai ABSENT sebelum sheet difinalisasi.

#### Actions

- pilih bulan
- pilih client
- pilih location
- pilih service
- pilih shift
- bulk fill time
- copy previous day bila diizinkan
- clear input
- validate
- save draft
- finalize month
- reopen dengan approval
- export Excel/CSV
- print

#### Payroll integration

```text
HRD Attendance
→ Attendance Validation
→ Monthly Attendance Summary
→ Finance Payroll Input
```

Finance dapat membaca summary, bukan mengubah attendance.

#### Billing integration

Jika kontrak billing berbasis manpower/attendance:

```text
Attendance Summary
→ Operations Validation
→ Finance Billing Preparation
```

---

## 12. LEGAL MODULE

### 12.1 Employee Legal

Checklist configurable:

- KTP
- KK
- NPWP
- employment agreement
- PKWT/PKWTT
- BPJS-related documents
- role certificate
- SIM jika relevan
- vehicle documents jika relevan
- integrity statement
- other required document

Setiap requirement:

- required flag
- status
- expiry date
- uploaded document
- reviewer
- review note

Jangan hardcode aturan hukum sebagai legal advice.

### 12.2 Contract & Agreement

Jenis:

- employee contract
- client contract
- outsourcing agreement
- vendor agreement
- cooperation agreement
- NDA
- statement letter
- integrity pact

Status:

- DRAFT
- REVIEW
- PENDING_APPROVAL
- ACTIVE
- EXPIRING
- EXPIRED
- TERMINATED

### 12.3 Compliance

- compliance checklist
- regulation register
- license monitoring
- findings
- corrective actions
- status

### 12.4 Legal Case

ID:

`CASE-YYYY-XXXXXX`

Fields:

- case_id
- case_type
- source_department
- subject
- employee/client/vendor
- incident_date
- report_date
- chronology
- financial_impact
- evidence
- witnesses
- assigned_legal
- priority
- status
- deadline
- actions
- documents
- notes
- approval_history

### 12.5 COD Case — INTEGRASI KHUSUS

COD discrepancy biasanya berasal dari Finance.

Fields:

- cod_case_id
- courier_employee_id
- client_id
- shipment_reference
- cod_amount
- collected_amount
- deposited_amount
- outstanding_amount
- transaction_date
- due_date
- detection_date
- finance_verification
- operational_verification
- collection_status
- legal_status
- assigned_collector
- assigned_legal
- evidence
- chronology
- contact_attempts
- settlement_records
- legal_documents

Workflow:

```text
COD Transaction
→ Finance Reconciliation
→ Difference Detected
→ Operations Verification
→ Employee Clarification
→ Collector Assignment
→ Collection Attempts
├── Settled
└── Unresolved
    → Legal Review
    → Warning/Statement/Somasi as applicable
    → Legal Process
    → Resolution
    → Closed
```

Collection attempt wajib menyimpan:

- tanggal/waktu
- PIC
- metode kontak
- hasil
- nominal yang dijanjikan
- next action
- attachment/evidence

Jika kurir tidak dapat dihubungi/meninggalkan pekerjaan, sistem hanya mencatat fakta dan proses. Jangan otomatis menyimpulkan tindak pidana.

### 12.6 Legal escalation

Rule configurable:

- outstanding di atas threshold
- due date terlewati
- collection attempts mencapai threshold
- management escalation
- compliance/deadline issue

Semua threshold harus configurable.

---

## 13. OPERATIONS MODULE

Master relationship:

```text
Client
→ Project
→ Location
→ Post/Area
→ Shift
→ Assignment
→ Attendance
→ Incident
```

### Client

- client_id
- company_name
- PIC
- contact
- contract
- service_type
- billing_model
- status

### Location

- location_id
- client_id
- project_id
- address
- operational_pic
- required_manpower
- active_manpower
- shift_count
- status

### Assignment

- employee_id
- client_id
- project_id
- location_id
- post_id
- shift_id
- start_date
- end_date
- status

### Incident

Jenis:

- absence
- security incident
- customer complaint
- accident
- lost item
- operational disruption
- misconduct
- other

Incident dapat di-escalate ke HRD, Legal, atau Director.

### Replacement

- replacement request
- reason
- required date
- location
- service
- current employee
- replacement candidate
- approval/status

---

## 14. FINANCE MODULE

### Invoice

```text
Service Delivered
→ Billing Preparation
→ Draft Invoice
→ Review
→ Sent
→ Partially Paid / Paid
→ Overdue
→ Collection
```

### Payroll

```text
Attendance
→ Validation
→ Payroll Calculation
→ HRD Review
→ Finance Review
→ Director Approval
→ Processed
```

### COD

Finance menjadi source transaksi:

- import transaction
- reconcile
- detect difference
- assign case
- record payment
- recovery

Historical transaction tidak boleh hard-delete tanpa permission khusus.

---

## 15. MARKETING MODULE

### Lead

Source:

- website
- referral
- outbound
- event
- tender/RFP
- social/media
- other

Workflow:

```text
NEW
→ CONTACTED
→ QUALIFIED
→ OPPORTUNITY
→ PROPOSAL
→ NEGOTIATION
├── WON
└── LOST
```

### Opportunity

Fields:

- opportunity_id
- lead_id
- company
- PIC
- service_interest
- estimated_manpower
- location
- estimated_value
- probability field (informational only)
- expected_close_date
- stage
- owner
- activities
- notes

### Won handover

```text
Marketing WON
→ Client Master
→ Contract Setup
→ Operations Handover
→ Location/Manpower Setup
→ Finance Billing Setup
→ Director Visibility
```

Lost opportunity wajib menyimpan alasan.

---

## 16. IT SUPPORT MODULE

### Ticket

- ticket_id
- requester
- department
- category
- priority
- subject
- description
- attachment
- assigned_to
- SLA
- status
- resolution
- closed_at

Status:

```text
OPEN
→ ASSIGNED
→ IN_PROGRESS
→ WAITING
→ RESOLVED
→ CLOSED
```

### Asset

- asset_id
- asset_type
- serial_number
- owner
- department
- location
- purchase_date
- warranty
- status
- maintenance_history

---

## 17. ADMIN WEBSITE / CMS

Manage:

- pages
- services
- portfolio
- news
- blog
- careers
- FAQ
- contact
- media
- banner
- SEO metadata
- website settings (official Tangerang address, Google Maps embed parameters, WhatsApp consultation & recruitment hotlines, email, social media links)
- website leads & public inquiries (Name, Company, Email, Phone, Service, Message)

SEO fields:

- meta_title
- meta_description
- slug
- canonical
- og_title
- og_description
- og_image
- publish_status

Inquiry & Lead Pipeline:
Setiap permohonan konsultasi yang dikirim melalui halaman `/contact` otomatis divalidasi dan dicatat ke dalam database lead website (`cmsAdapter.submitInquiry()`), kemudian diteruskan ke Marketing Lead Queue untuk kualifikasi penawaran jasa.

---

## 18. CROSS-DEPARTMENT WORKFLOW

### Employee

```text
HRD Employee
→ Operations Assignment
→ Attendance
→ Finance Payroll
→ Legal Completeness
```

### Attendance

```text
HRD Monthly Roster
→ HRD Fill Time In/Out
→ Validation
→ Finalize
→ Finance Payroll Input
→ Operations Billing Validation (jika relevan)
```

### COD

```text
Finance Difference
→ Operations Verification
→ Collector
→ Settlement
OR
→ Legal Case
→ Director Alert
```

### Contract expiry

```text
HRD/Legal Contract Expiry
→ HRD Alert
→ Legal Alert
→ Operations Alert
→ Director Alert sesuai severity
```

### Incident

```text
Operations Incident
→ HRD
→ Legal jika escalated
→ Director jika high priority
```

### Lead

```text
Website Lead
→ Marketing
→ Qualification
→ Opportunity
→ Proposal/Quotation
→ WON
→ Client Master
→ Operations Handover
→ Finance Billing Setup
→ Director Visibility
```

### IT

Semua department dapat membuat IT ticket sesuai permission.

---

## 19. RBAC (ROLE-BASED ACCESS CONTROL)

### 19.1 Peran Resmi & Kode Pengenal
Sistem mengakui tepat 8 peran internal resmi:
1. `DIREKTUR`: Otoritas eksekutif tertinggi (Super Admin operasional).
2. `HRD`: Pengelola master personil, presensi posko, kontrak PKWT, dan rekrutmen.
3. `OPERASIONAL`: Pengelola penugasan lapangan, posko klien, insiden, pergantian personil, dan patroli.
4. `FINANCE`: Pengelola draf payroll (Maker), faktur tagihan klien, pengeluaran, dan kas titipan kurir COD.
5. `LEGAL`: Pengelola Perjanjian Kerja Sama (PKS), dokumen kepatuhan SIO Mabes Polri, dan sengketa hukum.
6. `MARKETING`: Pengelola prospek web/sales (Leads), pipeline tender (Opportunities), dan pendelegasian klien menang.
7. `IT_SUPPORT`: Pengelola tiket helpdesk, SLA respon teknis, dan inventarisasi aset IT posko.
8. `ADMIN_WEBSITE`: Pengelola konten CMS publik (berita, FAQ, lowongan karir).

### 19.2 Pengenal Izin Granular (Permission String Identifiers)
Format standar: `<module>.<resource>.<action>`
- **Employee:** `employee.read`, `employee.create`, `employee.update`, `employee.export`, `employee.sensitive.read`, `employee.delete.request`, `employee.delete.approve`
- **Placement:** `placement.read`, `placement.create`, `placement.update`, `placement.transfer`, `placement.end`
- **Attendance:** `attendance.read`, `attendance.record`, `attendance.edit`, `attendance.finalize`, `attendance.reopen`, `attendance.export`
- **Client & Site:** `client.read`, `client.create`, `client.update`, `site.read`, `site.create`, `site.update`
- **Finance & Payroll:** `invoice.read`, `invoice.create`, `invoice.update`, `invoice.payment`, `payroll.read`, `payroll.create`, `payroll.approve`, `cod.read`, `cod.reconcile`, `cod.escalate`
- **Legal:** `contract.read`, `contract.create`, `contract.update`, `legal.case.read`, `legal.case.create`, `compliance.read`
- **Marketing:** `lead.read`, `lead.create`, `opportunity.read`, `opportunity.update`, `opportunity.win`
- **Operations:** `incident.read`, `incident.create`, `incident.resolve`, `replacement.read`, `replacement.create`, `patrol.read`
- **IT Support:** `ticket.read`, `ticket.create`, `ticket.update`, `ticket.resolve`, `asset.read`, `asset.create`
- **Governance:** `approval.read`, `approval.act`, `audit.read`

### 19.3 Penegakan Batasan Maker-Checker (Segregation of Duties)
Untuk mencegah *fraud* dan tindakan sepihak, batas kewenangan berikut **wajib ditegakkan di backend**:
1. **Penggajian (Payroll):**
   - *Maker:* Staf Finance menyusun perhitungan gaji (`payroll.create`).
   - *Checker:* Direktur memeriksa dan mengesahkan pencairan (`payroll.approve`). Finance dilarang menyetujui payroll buatannya sendiri.
2. **Kunci Presensi (Attendance Lock):**
   - *Finalisasi:* HRD mengunci lembar absensi bulanan (`attendance.finalize`).
   - *Pembukaan Kembali (Reopen):* Hanya Direktur yang berwenang membuka kunci lembar absensi (`attendance.reopen`).
3. **Penghapusan Personil (Employee Deletion):**
   - *Pemohon:* HRD / Staf Operasional mengajukan permohonan hapus/nonaktif (`employee.delete.request`).
   - *Pemberi Otorisasi:* Direktur menyetujui soft-delete (`employee.delete.approve`).

---

## 20. DATA MODEL (28 AUTHORITATIVE RELATIONAL ENTITIES)

### 20.1 Prinsip Relasi Mobilitas Tenaga Kerja (Workforce Mobility)
> **ATURAN UTAMA:** Entitas `employees` **TIDAK BOLEH** terikat langsung ke satu `clients`.  
> Hubungan antara Karyawan dan Klien **wajib dijembatani oleh entitas `placements`**. Hal ini memungkinkan satu karyawan memiliki rekam jejak rotasi penugasan di berbagai klien/posko tanpa merusak data historis presensi maupun penggajian sebelumnya.

```text
Client (1) ───< Sites (N)
Client (1) ───< Contracts (N)
Client (1) ───< Invoices (N)

Employee (1) ───< Placements (N)
Placement (N) >─── Client (1)
Placement (N) >─── Site (1)
Placement (N) >─── Shift (1)
Placement (1) ───< Attendance Records (N)
```

### 20.2 Daftar 28 Entitas Database Relasional
1. **`users`:** Akun pengguna internal (id, username, email, password_hash, role_id, is_active).
2. **`roles`:** 8 Peran sistem (id, name, code, description).
3. **`permissions`:** Hak akses granular (id, permission_key, module, description).
4. **`role_permissions`:** Tabel junction peran $\leftrightarrow$ izin (role_id, permission_id).
5. **`employees`:** Master tenaga kerja (id, id_karyawan, nik, nama_lengkap, jenis_kelamin, status_kerja, tanggal_masuk, status_pajak, npwp, bpjs_kesehatan, bpjs_ketenagakerjaan, is_deleted).
6. **`employee_documents`:** Berkas digital KTP, KK, SKCK, Ijazah, Foto (id, employee_id, document_type, file_url).
7. **`clients`:** 18 Mitra korporat resmi PT. BARAK (id, code, name, industry, city, address, contact_person, phone, email, status).
8. **`sites`:** Posko pengamanan & lokasi tugas lapangan (id, code, client_id, name, address, city, manpower_quota, lat, lng, status).
9. **`services`:** 6 Unit layanan inti PT. BARAK (id, code, name, description).
10. **`positions`:** Master jabatan fungsional personil (id, code, service_id, title).
11. **`placements`:** Riwayat & formasi penugasan aktif (id, code, employee_id, client_id, site_id, position_id, shift_id, start_date, end_date, status: ACTIVE|ROTATED|ENDED).
12. **`shifts`:** Master jadwal jaga posko (id, code, name, start_time, end_time, description).
13. **`rosters`:** Formasi jadwal kerja bulanan per posko (id, site_id, period_year, period_month, status).
14. **`attendance`:** Log presensi harian personil (id, sheet_id, employee_id, placement_id, shift_id, attendance_date, check_in, check_out, status, total_hours, late_minutes, is_locked).
15. **`recruitment`:** Lamaran kerja masuk dari publik (id, candidate_name, nik, phone, email, service_applied, status).
16. **`payroll`:** Periode & kalkulasi gaji bulanan (id, period_month, period_year, total_gross, total_deductions, total_net, status: DRAFT|FINANCE_REVIEW|APPROVED|PROCESSED).
17. **`payroll_items`:** Rincian take-home pay per karyawan (id, payroll_id, employee_id, base_salary, overtime_pay, allowances, bpjs_deduction, net_salary).
18. **`invoices`:** Faktur tagihan jasa outsourcing (id, invoice_number, client_id, period, subtotal, tax_ppn, total_amount, due_date, status: DRAFT|ISSUED|PARTIALLY_PAID|PAID|OVERDUE|VOID).
19. **`payments`:** Histori penerimaan pembayaran faktur (id, invoice_id, payment_date, amount, payment_method, reference_number).
20. **`expenses`:** Rekam pengeluaran operasional perusahaan (id, category, amount, description, expense_date, approved_by).
21. **`contracts`:** Perjanjian Kerja Sama (PKS) korporat (id, contract_number, client_id, title, start_date, end_date, contract_value, status: DRAFT|LEGAL_REVIEW|APPROVED|SIGNED|ACTIVE|EXPIRING|RENEWED|EXPIRED).
22. **`leads`:** Calon klien masuk dari publik/sales (id, company_name, pic_name, phone, email, service_interest, status: NEW|CONTACTED|QUALIFIED|LOST|WON).
23. **`quotations`:** Dokumen penawaran harga & proposal tender (id, lead_id, quotation_number, proposal_value, stage, created_by).
24. **`incidents`:** Kejadian luar biasa / gangguan posko (id, incident_number, site_id, client_id, title, severity: LOW|MEDIUM|HIGH|CRITICAL, status: OPEN|INVESTIGATING|RESOLVED|ESCALATED).
25. **`replacements`:** Tiket permohonan personil cadangan pengganti (id, ticket_number, site_id, absent_employee_id, replacement_employee_id, reason, status: REQUESTED|APPROVED|REPLACED).
26. **`approvals`:** Antrean persetujuan eksekutif Direktur (id, request_type, entity_id, requested_by, status: PENDING|APPROVED|REJECTED, notes, acted_at).
27. **`audit_logs`:** Jejak audit permanen seluruh mutasi sistem (id, actor_id, actor_name, actor_role, action, module, record_id, description, ip_address, created_at).
28. **`it_tickets` & `it_assets`:** Helpdesk gangguan teknis & inventaris radio HT posko (id, ticket_number, title, category, priority, status: OPEN|ASSIGNED|IN_PROGRESS|RESOLVED|CLOSED).

---

## 21. ATTENDANCE DATA MODEL

### attendance_sheets

```text
id
sheet_code
period_year
period_month
client_id
location_id
service_type
status: OPEN|FINALIZED|REOPENED
generated_at
finalized_at
finalized_by
version
created_at
updated_at
```

### attendance_rows

```text
id
sheet_id
employee_id
assignment_id
shift_id
attendance_date
scheduled_in
scheduled_out
check_in
check_out
status
total_minutes
late_minutes
early_leave_minutes
notes
created_at
updated_at
```

Constraint:

```text
UNIQUE(sheet_id, employee_id, attendance_date)
```

Master fields ditampilkan dari relationship, bukan disalin sebagai editable fields. Snapshot dapat disimpan untuk audit/historical rendering bila diperlukan.

---

## 22. AUDIT LOG

Wajib:

- actor
- timestamp
- action
- module
- entity
- record_id
- old_value
- new_value
- IP/device jika backend mendukung

Critical actions:

- delete/archive
- approve
- payroll approval
- payment
- legal status change
- case closure
- permission change
- attendance finalize/reopen
- COD settlement

---

## 23. NOTIFICATION CENTER

Kategori:

- approval
- deadline
- contract expiry
- document expiry
- legal
- COD
- invoice overdue
- attendance
- incident
- IT ticket
- website lead

Fields:

- title
- message
- severity
- timestamp
- read
- target_route

---

## 24. GLOBAL SEARCH

Search:

- employee
- NIK
- employee ID
- client
- contract
- location
- invoice
- COD case
- legal case
- IT ticket
- lead

Result harus menampilkan category + identifier + status.

---

## 25. TABLE UX

Jika relevan:

- search
- filter
- sorting
- pagination
- column visibility
- export
- bulk selection
- status badge
- row action
- detail drawer/page

Desktop-first enterprise table; mobile memakai horizontal scroll atau card transformation.

---

## 26. DETAIL PAGE STANDARD

```text
Header
├── ID
├── Name/Title
├── Status
└── Primary Actions

Summary

Tabs
├── Overview
├── Documents
├── Related Data
├── Activity
└── Audit Log
```

Employee:

```text
Overview
Employment
Assignment
Attendance
Documents
Leave
Violation
Evaluation
Payroll Summary
Legal
Activity
Audit
```

COD:

```text
Overview
Transaction
Collection
Evidence
Legal
Settlement
Timeline
Audit
```

---

## 27. DESIGN SYSTEM

Brand:

- Primary Red: `#BA1D23`
- Primary Yellow: `#F9CE3B`
- Primary Green: `#32B23E`

Supporting:

- Ink: `#0F172A`
- Slate: `#334155`
- Muted: `#64748B`
- Border: `#E2E8F0`
- Surface: `#FFFFFF`
- Canvas: `#F8FAFC`
- Info: `#2563EB`
- Warning: `#D97706`
- Danger: `#DC2626`
- Success: `#16A34A`

Style:

- modern enterprise
- clean
- dense but breathable
- subtle shadow
- 10–14px radius
- minimal gradients
- consistent iconography
- clear typography hierarchy
- no decorative UI without business value

Do not rely on color alone; pair status color with text/icon.

---

## 28. RESPONSIVE

Desktop:

- sidebar + content
- multi-column widgets

Tablet:

- collapsible sidebar
- responsive cards
- table scroll

Mobile:

- drawer sidebar
- stacked KPI
- horizontal table scroll
- compact filter
- mobile-friendly forms
- bottom quick action only when justified

Required test sizes:

- 1440px
- 1280px
- 1024px
- 768px
- 390px

---

## 29. ACCESSIBILITY

- semantic HTML
- keyboard navigation
- visible focus
- form labels
- ARIA where required
- sufficient contrast
- clear validation errors
- tooltip/label for icon-only actions
- no color-only status

---

## 30. FORM RULES

Every form:

- required validation
- format validation
- duplicate prevention
- loading state
- success state
- error state
- confirmation for destructive actions
- unsaved-change warning where relevant

Do not use browser `alert()` as primary UX.

---

## 31. FILE MANAGEMENT

Document metadata:

```text
document_id
document_type
owner_type
owner_id
file_name
file_size
uploaded_by
upload_date
expiry_date
status
version
```

Storage abstraction:

```text
Local/Mock
→ S3 / Cloudinary / Supabase Storage / other
```

Do not hardwire storage provider into feature UI.

---

## 32. REPORT & EXPORT

Minimum:

- CSV
- Excel-ready API
- print view
- PDF-ready report structure

Permission-aware.

Key reports:

- HRD attendance recap
- payroll input
- location manpower
- invoice aging
- COD outstanding
- legal cases
- IT SLA
- marketing pipeline
- executive summary

---

## 33. SECURITY

- protected internal routes
- authentication abstraction
- RBAC
- permission guard
- backend authorization
- session handling
- no secrets in frontend
- no hardcoded credentials
- sanitize rich text
- audit critical actions
- sensitive data masking
- soft delete/archive for important business records

---

## 34. FRONTEND ARCHITECTURE

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── guards/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── tables/
│   ├── forms/
│   ├── charts/
│   └── feedback/
├── features/
│   ├── director/
│   ├── legal/
│   ├── hrd/
│   ├── operations/
│   ├── finance/
│   ├── marketing/
│   ├── it/
│   ├── website/
│   ├── attendance/
│   ├── cod/
│   ├── notifications/
│   ├── search/
│   └── audit/
├── services/
├── hooks/
├── types/
├── utils/
├── constants/
└── assets/
```

Feature-based architecture. Hindari giant component.

---

## 35. BACKEND ARCHITECTURE

Target:

```text
backend/
├── src/
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── jobs/
│   └── app.js
├── migrations/
├── seeders/
├── tests/
├── .env.example
└── package.json
```

Flow:

```text
Route
→ Middleware/Auth/Permission
→ Validator
→ Controller
→ Service
→ Repository/Model
→ MySQL
```

---

## 36. BACKEND DEV FLOW

### Local

```text
MySQL via Laragon
↓
Node.js + Express
↓
Hoppscotch API Testing
↓
React Frontend
```

### Production

```text
GitHub
├── frontend
└── backend

MySQL production
↓
Railway

Express API
↓
Railway
↓
Public API endpoint

React/Vite
↓
Vercel or agreed hosting
```

Use environment variables:

```text
DATABASE_URL
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
JWT_SECRET
CORS_ORIGIN
PORT
```

Never commit `.env`.

---

## 37. MOCK DATA

Minimum seed:

- 40 employees
- 8 clients
- 12 locations
- 30 assignments
- 3 months attendance samples
- 12 invoices
- 12 COD transactions
- 6 COD cases
- 6 legal cases
- 10 IT tickets
- 15 leads
- 8 opportunities

Relations must be valid.

---

## 38. KPI RULE

KPI harus dihitung dari repository/data selectors.

Contoh:

```js
const activeEmployees =
  employees.filter(e => e.employment_status === "ACTIVE").length;
```

Jangan membuat angka KPI statis kecuali memang berasal dari seed data.

---

## 39. APPROVAL (PUSAT PERSETUJUAN DIREKTUR & WORKFLOW)

### 39.1 Delapan Kategori Persetujuan Eksekutif (`approvals.request_type`)
Direktur memegang kendali tunggal di `/ops/director/approvals` untuk:
1. `EMPLOYEE_DELETE`: Otorisasi penghapusan personil (Maker: HRD $\rightarrow$ Checker: Direktur).
2. `EMPLOYEE_STATUS_CHANGE`: Pengangkatan status kerja (PKWT ke Karyawan Tetap).
3. `CONTRACT_APPROVAL`: Pengesahan draf Perjanjian Kerja Sama (PKS) bernilai strategis.
4. `EXPENSE_APPROVAL`: Otorisasi pengeluaran kas operasional / belanja modal posko (CAPEX).
5. `PAYROLL`: Otorisasi pencairan dana gaji bulanan seluruh personil.
6. `QUOTATION_APPROVAL`: Otorisasi diskon penawaran harga tender besar.
7. `OPERATIONAL_REQUEST`: Dispensasi formasi posko atau pergantian mendesak.
8. `ATTENDANCE_REOPEN`: Pembukaan kembali lembar presensi yang telah terkunci permanen.

### 39.2 Alur Penghapusan Personil (Delete Workflow)
```text
Staf / HRD Mengajukan Hapus (Input Alasan)
  └── Backend menerbitkan approval_request (category: EMPLOYEE_DELETE, status: PENDING)
        ├── Karyawan ditandai: pendingDelete = true (Data tetap aktif di sistem)
        ├── DIREKTUR APPROVE:
        │     └── Soft-delete dieksekusi (is_deleted = true, status_kerja = 'NON_AKTIF')
        │     └── Penugasan posko aktif diakhiri (status = 'ENDED')
        │     └── Log Audit permanen dicatat
        └── DIREKTUR REJECT:
              └── Alasan penolakan diinput
              └── Status pendingDelete dibatalkan (Karyawan tetap aktif normal)
              └── Log Audit penolakan dicatat
```

---

## 40. STATUS ENUM (KAMUS STATUS ENUM OTORITATIF)

Semua status dalam sistem menggunakan huruf kapital (*uppercase*) terpusat:

### 40.1 Karyawan (`employees.status_kerja`)
`APPLICANT` $\rightarrow$ `ONBOARDING` $\rightarrow$ `ACTIVE` $\rightarrow$ `PLACED` $\rightarrow$ `TRANSFERRED` $\rightarrow$ `ON_LEAVE` $\rightarrow$ `TERMINATED` $\rightarrow$ `INACTIVE`

### 40.2 Penugasan Posko (`placements.status`)
`REQUESTED` $\rightarrow$ `APPROVED` $\rightarrow$ `SCHEDULED` $\rightarrow$ `ACTIVE` $\rightarrow$ `TRANSFERRED` / `ROTATED` $\rightarrow$ `ENDED`

### 40.3 Kontrak PKS Klien (`contracts.status`)
`DRAFT` $\rightarrow$ `LEGAL_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `SIGNED` $\rightarrow$ `ACTIVE` $\rightarrow$ `EXPIRING` $\rightarrow$ `RENEWED` $\rightarrow$ `EXPIRED`

### 40.4 Prospek Penjualan (`leads.status`)
`NEW` $\rightarrow$ `CONTACTED` $\rightarrow$ `QUALIFIED` $\rightarrow$ `SURVEY` $\rightarrow$ `QUOTED` $\rightarrow$ `NEGOTIATION` $\rightarrow$ `WON` / `LOST`

### 40.5 Faktur Tagihan (`invoices.status`)
`DRAFT` $\rightarrow$ `ISSUED` $\rightarrow$ `PARTIALLY_PAID` $\rightarrow$ `PAID` $\rightarrow$ `OVERDUE` $\rightarrow$ `VOID`

### 40.6 Penggajian (`payroll.status`)
`DRAFT` $\rightarrow$ `FINANCE_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `PROCESSED`

### 40.7 Insiden Posko (`incidents.status` & `severity`)
- Status: `OPEN` $\rightarrow$ `INVESTIGATING` $\rightarrow$ `RESOLVED` $\rightarrow$ `ESCALATED`
- Severity: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

### 40.8 Tiket IT Support (`it_tickets.status` & `priority`)
- Status: `OPEN` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `WAITING` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`
- Priority: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

### 40.9 Persetujuan (`approvals.status`)
`PENDING` $\rightarrow$ `APPROVED` / `REJECTED`

---

## 41. BUSINESS ID

```text
EMP-000001
CLI-000001
PRJ-000001
LOC-000001
ASN-000001
INV-2026-000001
PAY-2026-000001
COD-2026-000001
CASE-2026-000001
TCK-2026-000001
LEAD-2026-000001
OPP-2026-000001
```

---

## 42. IMPLEMENTATION PHASES

### Phase 0 — Audit

- inspect repository
- inspect current routes
- inspect components
- inspect dependencies
- inspect data/mock
- inspect current dashboard
- identify reusable pieces
- document technical debt
- do not rewrite blindly

### Phase 1 — Foundation

- app shell
- design tokens
- router
- mock auth
- RBAC
- permission guards
- notification center
- global search
- audit infrastructure

### Phase 2 — Master Data

- users
- employees
- clients
- projects
- locations
- shifts
- assignments

### Phase 3 — HRD

- employee master
- documents
- contract
- attendance spreadsheet
- roster generation
- validation/finalization
- export
- payroll input

### Phase 4 — Operations

- client/project/location
- manpower requirement
- assignment
- shift
- incidents
- replacement
- field reports

### Phase 5 — Finance

- invoice
- payment
- receivable
- payroll
- COD transaction
- reconciliation

### Phase 6 — Legal

- employee legal
- contract
- compliance
- COD cases
- legal cases
- collection
- legal process
- documents
- expiry

### Phase 7 — Marketing

- leads
- opportunities
- pipeline
- activities
- proposal
- quotation
- tender
- handover

### Phase 8 — IT

- tickets
- assets
- maintenance
- monitoring

### Phase 9 — Website CMS

- pages
- services
- portfolio
- news
- blog
- careers
- FAQ
- media
- SEO
- leads

### Phase 10 — Director

- aggregate all modules
- approval center
- executive reports
- risk/alert view

### Phase 11 — Backend Integration

- MySQL schema
- migrations
- seeders
- Express routes/controllers/services/repositories
- auth/RBAC
- API tests in Hoppscotch
- frontend service adapters
- integration tests

### Phase 12 — Deployment

- GitHub
- Railway MySQL
- Railway Express API
- frontend hosting
- environment variables
- CORS
- smoke test

---

## 43. ACCEPTANCE CRITERIA

### Authentication/RBAC

- internal user can authenticate
- unauthorized route rejected
- role controls navigation
- permission controls actions
- backend enforces authorization

### HRD

- employee CRUD
- employee assignment
- monthly attendance sheet by location
- locked employee fields
- dynamic roster
- HRD enters only check-in/out
- attendance calculates status/summary
- month can be finalized
- finalized sheet protected
- reopen audited
- export attendance
- Finance reads payroll input

### Legal

- employee legal completeness
- contract monitoring
- COD case from discrepancy
- collection attempts
- settlement
- legal escalation
- legal case timeline
- deadline alert
- document attachments

### Operations

- client → project → location → assignment
- shift
- manpower gap
- incident
- replacement

### Finance

- invoice
- payment
- receivable
- payroll
- COD reconciliation

### Marketing

- lead
- qualification
- opportunity
- activity
- proposal/quotation
- won/lost
- client handover

### IT

- ticket
- SLA
- assignment
- resolution
- asset

### Website

- CMS
- lead capture
- SEO metadata

### Integration

Must pass these scenarios:

```text
HRD Employee
→ Operations Assignment
→ HRD Attendance
→ Finance Payroll

Finance COD Difference
→ Operations Verification
→ Collection
→ Legal Case
→ Director Alert

Website Lead
→ Marketing
→ Opportunity
→ Won
→ Client
→ Operations
→ Finance

Contract Expiry
→ HRD/Legal
→ Operations
→ Director Alert

Operations Incident
→ HRD
→ Legal if escalated
→ Director if high priority
```

---

## 44. QUALITY GATES

Run:

```bash
npm install
npm run lint
npm run build
npm run test
```

If scripts exist.

Check:

- no broken route
- no missing import
- no undefined variable
- no critical console error
- no fake completed feature
- no horizontal overflow
- responsive 1440/1280/1024/768/390
- loading/empty/error states
- permission boundaries

---

## 45. DEFINITION OF DONE

Done only when:

- 8 roles are represented correctly
- internal navigation follows permission
- Employee and Client are single master records
- attendance is monthly/location-based
- HRD only edits time fields
- attendance can feed Finance
- COD flows Finance → Operations → Legal → Director
- legal cases have timeline
- IT ticket has SLA/status
- Marketing pipeline works
- website lead enters central database
- Director aggregates data
- audit log records critical actions
- responsive
- build passes
- lint passes
- tests pass when configured

---

## 46. AI AGENT RULE

Do not only create dashboard visuals.

Build the information architecture and workflows so the application can become the operational system of PT. BARAK.

Order of priority:

```text
DATA INTEGRITY
→ WORKFLOW
→ RBAC
→ USABILITY
→ UI QUALITY
→ PERFORMANCE
```

If a business rule is unclear:

- do not invent legal policy
- do not invent company policy
- use configurable settings
- document assumptions
- continue with non-blocking implementation

First audit. Then plan. Then implement in phases. Then test.
