# MASTER_SOURCE_OF_TRUTH.md — PT. BARAK IOMS
**Versi:** 3.0 (Unified Authoritative Source of Truth & Backend Engineering Contract)  
**Tanggal:** 11 Oktober 2026  
**Perusahaan:** PT. BIMASENA ADHIRAJASA RADIKA (PT. BARAK)  
**Sistem:** Integrated Outsourcing Management System (IOMS)  
**Status:** COMPLETE, CONSOLIDATED & AUTHORITATIVE  
**Status Frontend:** 100% OPERATIONAL (143/143 TESTS PASS, 0 LINT ERRORS, CLEAN BUILD) — READY FOR BACKEND IMPLEMENTATION

---

## DAFTAR ISI
1. [Misi Sistem & Ketentuan Non-Negosiasi](#1-misi-sistem--ketentuan-non-negosiasi)
2. [Arsitektur Berlapis Frontend & Pola Akses Data](#2-arsitektur-berlapis-frontend--pola-akses-data)
3. [Skema Database Relasional 29 Entitas (MySQL 8.0 DDL Contract)](#3-skema-database-relasional-29-entitas-mysql-80-ddl-contract)
4. [Katalog 18 Klien Resmi Otoritatif PT. BARAK (Protected Seed Data)](#4-katalog-18-klien-resmi-otoritatif-pt-barak-protected-seed-data)
5. [Spesifikasi REST API, Format Amplop JSON & HTTP Protocol](#5-spesifikasi-rest-api-format-amplop-json--http-protocol)
6. [Matriks Hak Akses Granular RBAC & Batas Maker-Checker](#6-matriks-hak-akses-granular-rbac--batas-maker-checker)
7. [Kontrak Alur Bisnis Lintas Divisi (Workflows)](#7-kontrak-alur-bisnis-lintas-divisi-workflows)
8. [Kamus Status Enum Terpusat & Transisi Siklus Hidup](#8-kamus-status-enum-terpusat--transisi-siklus-hidup)
9. [Urutan 20 Tahap Implementasi Backend (Roadmap)](#9-urutan-20-tahap-implementasi-backend-roadmap)
10. [Panduan Integrasi Frontend-Backend (CORS, JWT & Deployment)](#10-panduan-integrasi-frontend-backend-cors-jwt--deployment)

---

## 1. Misi Sistem & Ketentuan Non-Negosiasi

PT. BARAK IOMS (*Integrated Outsourcing Management System*) adalah sistem operasional perusahaan alih daya tenaga kerja terpadu kelas enterprise. Sistem ini mencakup 6 lini layanan utama: Pengamanan Fisik (*Security Services*), Kebersihan Fasilitas (*Cleaning Services*), Pengemudi Profesional (*Driver Services*), Pengelolaan Parkir (*Parking Services*), Kurir & Penanganan COD (*Logistics & COD Handling*), serta Konsultasi Hukum Ketenagakerjaan.

### Ketentuan Non-Negosiasi (Engineering Non-negotiables)
1. **Landing Page Terkunci (STRICTLY FROZEN):** Seluruh 15 berkas di `src/features/landing/*` adalah baseline terverifikasi yang dilarang keras untuk dimodifikasi.
2. **Otorisasi Backend Mutlak:** Penyembunyian menu atau tombol di frontend hanyalah kenyamanan UX. Backend Express **wajib menegakkan autentikasi JWT dan pengecekan izin RBAC** pada setiap rute/endpoint secara independen.
3. **Mobilitas Tenaga Kerja (Workforce Mobility):** Entitas `employees` **tidak boleh memiliki foreign key langsung `client_id`**. Hubungan Karyawan $\leftrightarrow$ Klien wajib dijembatani oleh `placements` dengan histori status (`ACTIVE`, `ROTATED`, `ENDED`).
4. **Jejak Audit Seluruh Mutasi Kritis:** Setiap aksi perubahan data penting (persetujuan, soft-delete, rotasi penugasan, finalisasi presensi, rekonsiliasi COD) wajib tercatat di tabel `audit_logs`.
5. **Batas Maker-Checker (Segregation of Duties):**
   - **Penggajian:** Dibuat oleh Keuangan (`payroll.create`), disetujui secara eksklusif oleh Direktur Utama (`payroll.approve`).
   - **Presensi:** Difinalisasi oleh HRD (`attendance.finalize`), hanya dibuka kembali oleh Direktur Utama (`attendance.reopen`).
   - **Hapus Karyawan:** Diajukan oleh HRD (`employee.delete.request`), dieksekusi soft-delete oleh Direktur Utama (`employee.delete.approve`).
   - **Kontrak PKS:** Draf oleh Legal (`contract.create`), disetujui oleh Direktur Utama (`contract.approve`).
6. **Eksklusivitas Rekening Pembayaran (Single Corporate BCA Channel):** Kanal pembayaran faktur klien ditetapkan secara eksklusif ke Rekening Bank Central Asia (BCA) `8833951911` a.n. `BIMASENA ADHIRAJASA RADHIKA`.
7. **Standarisasi Faktur Penagihan (Invoice Governance):**
   $$\text{Sub Total Tagihan} = \sum (\text{Jasa Penempatan} + \text{Reward/Tunjangan} - \text{Potongan})$$
   $$\text{Manajemen Fee} = \text{Sub Total Jasa Penempatan} \times n\%$$
   $$\text{PPh 23} = 2\% \times \text{Manajemen Fee}$$
   $$\text{PPN 11\% (Opsional)} = 11\% \times \text{Manajemen Fee}$$
   $$\text{Total Invoice Akhir} = \text{Sub Total Tagihan} + \text{Manajemen Fee} + \text{PPN 11\%} - \text{PPh 23}$$
8. **Integritas Aset Brand Resmi:** Logo resmi korporat adalah `/assets/img/logo/logoAja.png` dengan token warna resmi: `--primary-red: #BA1D23`, `--primary-yellow: #F9CE3B`, `--accent-green: #32B23E`, dan `--ink: #0F172A`.

---

## 2. Arsitektur Berlapis Frontend & Pola Akses Data

Aplikasi frontend PT. BARAK IOMS menerapkan struktur berlapis murni tanpa kopling langsung:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│    (Pages, Modals, Drawers, 12 Standard UI Components)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Memanggil Hooks & Handlers
┌──────────────────────────────▼──────────────────────────────┐
│                      CUSTOM HOOKS                           │
│   (useAuth, useRole, usePermissions, useForm, useTable)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mengonsumsi Service Layer
┌──────────────────────────────▼──────────────────────────────┐
│                    APPLICATION SERVICES                     │
│  (Business Logic, Input Formatting, Validation, Audit Log)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Memanggil Repository Pattern
┌──────────────────────────────▼──────────────────────────────┐
│                     REPOSITORIES                            │
│  (Entity Queries, Filtering, Deduplication, Cache Sync)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Memanggil Service Adapters
┌──────────────────────────────▼──────────────────────────────┐
│                    SERVICE ADAPTERS                         │
│ (Dual-Mode: Mock LocalStore <--> Axios/Fetch REST Client)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST Requests
┌──────────────────────────────▼──────────────────────────────┐
│               BACKEND REST API (EXPRESS / MYSQL)            │
│                 Base URL: /api/v1/* (MySQL 8.0)             │
└─────────────────────────────────────────────────────────────┘
```

### Dual-Mode Switch (`src/services/apiClient.js`)
- **`VITE_API_MODE=mock`:** Aplikasi berjalan mandiri di browser tanpa server backend. Menggunakan *repository pattern* dan `storageEngine.js` dengan data ber-namespace (`barak_*`) di `localStorage`.
- **`VITE_API_MODE=rest`:** Aplikasi mengarahkan seluruh 24 service adapter ke backend REST Express melalui `apiClient.js` pada base URL `VITE_API_BASE_URL`.

### Pustaka 12 Komponen UI Terstandarisasi (`src/components/ui/`)
- `PageHeader`, `Breadcrumbs`, `Card`, `Table`, `Drawer`, `Pagination`, `Tabs`, `FormField`, `Button`, `Badge`, `Modal`, `StateViews` (`PageLoader`, `EmptyState`, `ErrorState`).

---

## 3. Skema Database Relasional 29 Entitas (MySQL 8.0 DDL Contract)

### Diagram Alur Relasi Entitas (ER Diagram)
```
[Client] ──< [Sites/Locations]
   │
   ├──< [Contracts] (PKS Korporat)
   ├──< [Invoices] ──< [Payments]
   ├──< [Placements] >── [Employee] ──< [Employee_Documents]
   │        │
   │        ├──> [Site]
   │        ├──> [Service]
   │        ├──> [Position]
   │        ├──> [Shift]
   │        └──< [Attendance] >── [Attendance_Sheets]
   │                                     │
   └──< [Users] (PIC Klien: client_id) ──┘ (Inputer: inputer_user_id)
```

### Rincian 29 Entitas Database

#### Kelompok 1: Autentikasi, Pengguna & RBAC
1. **`users`**:
   - `id`: `VARCHAR(36)` (PK, UUID)
   - `username`: `VARCHAR(50)` (UNIQUE, NOT NULL)
   - `email`: `VARCHAR(100)` (UNIQUE, NOT NULL)
   - `password_hash`: `VARCHAR(255)` (NOT NULL, Bcrypt / Argon2)
   - `full_name`: `VARCHAR(100)` (NOT NULL)
   - `role_id`: `VARCHAR(30)` (FK $\rightarrow$ `roles.id`)
   - `client_id`: `VARCHAR(36)` (NULLABLE, FK $\rightarrow$ `clients.id`, khusus akun PIC Klien)
   - `status`: `ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE')` (DEFAULT: `'ACTIVE'`)
   - `created_at`, `updated_at`: `TIMESTAMP`

2. **`roles`**:
   - `id`: `VARCHAR(30)` (PK: `'DIREKTUR'`, `'HRD'`, `'OPERASIONAL'`, `'FINANCE'`, `'LEGAL'`, `'MARKETING'`, `'IT_SUPPORT'`, `'ADMIN_WEBSITE'`, `'SUPERADMIN'`, `'INPUTER_1'`, `'INPUTER_2'`, `'PIC_CLIENT'`)
   - `name`: `VARCHAR(50)` (NOT NULL)
   - `description`: `TEXT`

3. **`permissions` & `role_permissions`**:
   - `id`: `VARCHAR(50)` (PK: `'employee.create'`, `'payroll.approve'`, dll.)
   - Junction table `role_permissions`: (`role_id`, `permission_id`) Composite PK.

#### Kelompok 2: Sumber Daya Manusia (HRD) & Personel
4. **`employees`**:
   - `id`: `VARCHAR(36)` (PK, UUID)
   - `employee_code`: `VARCHAR(30)` (UNIQUE, format: `'BRK-EMP-XXX'`)
   - `nik`: `CHAR(16)` (UNIQUE, NOT NULL, 16 digit KTP)
   - `full_name`: `VARCHAR(120)` (NOT NULL)
   - `gender`: `ENUM('L', 'P')` (NOT NULL)
   - `birth_place`: `VARCHAR(60)`, `birth_date`: `DATE`
   - `join_date`: `DATE` (NOT NULL)
   - `job_type`: `VARCHAR(50)` (`'Security'`, `'Cleaning'`, `'Driver'`, `'Staff'`)
   - `employee_type`: `ENUM('OUTSOURCING', 'INTERNAL')` (DEFAULT: `'OUTSOURCING'`)
   - `status_kerja`: `ENUM('PKWT', 'PKWTT', 'HARIAN_LEPAS', 'PROBATION', 'NON_AKTIF')`
   - `status`: `ENUM('APPLICANT', 'ONBOARDING', 'ACTIVE', 'PLACED', 'TRANSFERRED', 'ON_LEAVE', 'TERMINATED', 'INACTIVE')`
   - `bank_name`: `VARCHAR(50)`, `bank_account_number`: `VARCHAR(30)`, `bank_account_holder`: `VARCHAR(100)`
   - `phone_number`: `VARCHAR(20)`, `email`: `VARCHAR(100)`
   - `address`: `TEXT`, `city`: `VARCHAR(60)`
   - `is_deleted`: `BOOLEAN` (DEFAULT: `FALSE`), `pending_delete`: `BOOLEAN` (DEFAULT: `FALSE`)
   - `deleted_at`: `TIMESTAMP` (NULLABLE), `deleted_by`: `VARCHAR(36)` (NULLABLE)

5. **`employee_documents`**:
   - `id`: `VARCHAR(36)` (PK)
   - `employee_id`: `VARCHAR(36)` (FK $\rightarrow$ `employees.id`)
   - `document_type`: `ENUM('KTP', 'KK', 'SKCK', 'SERTIFIKAT_GADA_PRATAMA', 'SIM', 'IJAZAH', 'SURAT_SEHAT')`
   - `file_url`: `VARCHAR(255)` (NOT NULL)
   - `expiry_date`: `DATE` (NULLABLE)

#### Kelompok 3: Klien, Posko & Penugasan
6. **`clients`**:
   - `id`: `VARCHAR(36)` (PK, format: `'CLI-000001'` s/d `'CLI-000018'`)
   - `name`: `VARCHAR(150)` (NOT NULL)
   - `industry`: `VARCHAR(80)`
   - `contact_person`: `VARCHAR(100)`, `contact_phone`: `VARCHAR(25)`, `contact_email`: `VARCHAR(100)`
   - `address`: `TEXT`, `city`: `VARCHAR(60)`
   - `status`: `ENUM('ACTIVE', 'SUSPENDED', 'TERMINATED')` (DEFAULT: `'ACTIVE'`)

7. **`sites` / `locations`**:
   - `id`: `VARCHAR(36)` (PK)
   - `client_id`: `VARCHAR(36)` (FK $\rightarrow$ `clients.id`, NOT NULL)
   - `name`: `VARCHAR(120)` (NOT NULL)
   - `address`: `TEXT`, `city`: `VARCHAR(60)`
   - `latitude`: `DECIMAL(10,8)`, `longitude`: `DECIMAL(11,8)`
   - `quota`: `INT` (DEFAULT: 1)
   - `status`: `ENUM('ACTIVE', 'INACTIVE')`

8. **`services`**:
   - `id`: `VARCHAR(36)` (PK: `'SEC'`, `'CLN'`, `'DRV'`, `'PRK'`, `'COD'`, `'LEG'`)
   - `name`: `VARCHAR(80)` (NOT NULL)
   - `sla_standard`: `TEXT`

9. **`placements` (Jembatan Mutasi Personel $\leftrightarrow$ Klien)**:
   - `id`: `VARCHAR(36)` (PK, format: `'PLC-YYYYMM-XXX'`)
   - `employee_id`: `VARCHAR(36)` (FK $\rightarrow$ `employees.id`, NOT NULL)
   - `client_id`: `VARCHAR(36)` (FK $\rightarrow$ `clients.id`, NOT NULL)
   - `site_id`: `VARCHAR(36)` (FK $\rightarrow$ `sites.id`, NOT NULL)
   - `position`: `VARCHAR(60)` (NOT NULL)
   - `service_id`: `VARCHAR(36)` (FK $\rightarrow$ `services.id`)
   - `start_date`: `DATE` (NOT NULL), `end_date`: `DATE` (NULLABLE)
   - `status`: `ENUM('REQUESTED', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'ROTATED', 'ENDED')` (DEFAULT: `'ACTIVE'`)

10. **`shifts`**:
    - `id`: `VARCHAR(36)` (PK)
    - `name`: `VARCHAR(50)` (`'Shift Pagi'`, `'Shift Malam'`, `'Shift Siang'`)
    - `start_time`: `TIME`, `end_time`: `TIME`
    - `duration_hours`: `DECIMAL(4,2)`

#### Kelompok 4: Presensi & Penggajian
11. **`attendance_sheets` & `attendance`**:
    - `attendance_sheets`: (`id`, `client_id`, `site_id`, `period_month`, `period_year`, `status` (`'DRAFT'`, `'FINALIZED'`), `finalized_by`, `finalized_at`, `inputer_user_id`)
    - `attendance`: (`id`, `sheet_id`, `placement_id`, `employee_id`, `date`, `time_in`, `time_out`, `overtime_hours`, `status` (`'PRESENT'`, `'ABSENT'`, `'LATE'`, `'LEAVE'`, `'SICK'`))

12. **`leave_requests`**:
    - `id`: `VARCHAR(36)` (PK)
    - `employee_id`: `VARCHAR(36)` (FK)
    - `leave_type`: `ENUM('TAHUNAN', 'SAKIT', 'MELAHIRKAN', 'KHUSUS')`
    - `start_date`: `DATE`, `end_date`: `DATE`
    - `status`: `ENUM('PENDING', 'APPROVED', 'REJECTED')`

13. **`payroll_periods` & `payroll_items`**:
    - `payroll_periods`: (`id`, `period_name`, `start_date`, `end_date`, `total_employees`, `total_net_amount`, `status` (`'DRAFT'`, `'CALCULATED'`, `'PENDING_APPROVAL'`, `'APPROVED'`, `'PAID'`), `created_by`, `approved_by`, `approved_at`)
    - `payroll_items`: (`id`, `payroll_period_id`, `employee_id`, `basic_salary`, `overtime_allowance`, `position_allowance`, `bpjs_tk_deduction`, `bpjs_kes_deduction`, `tax_deduction`, `other_deductions`, `take_home_pay`)

#### Kelompok 5: Keuangan & COD
14. **`invoices` & `invoice_items`**:
    - `invoices`: (`id`, `invoice_number` (UNIQUE), `client_id`, `client_name`, `client_up`, `client_address`, `client_city`, `period_start`, `period_end`, `subtotal_manpower`, `management_fee_percent`, `management_fee_amount`, `ppn_percent` (11.00), `ppn_amount`, `pph23_percent` (2.00), `pph23_amount`, `grand_total`, `status` (`'DRAFT'`, `'SENT'`, `'PAID'`, `'PARTIAL'`, `'OVERDUE'`, `'CANCELLED'`), `due_date`)
    - `invoice_items`: (`id`, `invoice_id`, `description`, `category` (`'MANPOWER'`, `'REWARD'`, `'DEDUCTION'`), `quantity`, `unit_price`, `amount`)

15. **`payments`**:
    - `id`: `VARCHAR(36)` (PK)
    - `invoice_id`: `VARCHAR(36)` (FK $\rightarrow$ `invoices.id`)
    - `payment_date`: `DATE`
    - `amount`: `DECIMAL(15,2)`
    - `payment_method`: `ENUM('BANK_TRANSFER_BCA')` (Wajib BCA `8833951911`)
    - `bank_reference_number`: `VARCHAR(100)` (NOT NULL)
    - `receipt_url`: `VARCHAR(255)`

16. **`cod_transactions` & `cod_reconciliations`**:
    - `cod_transactions`: (`id`, `courier_id`, `courier_name`, `client_id`, `client_name`, `airwaybill_count`, `total_amount_collected`, `total_amount_deposited`, `difference_amount`, `status` (`'PENDING'`, `'DISCREPANCY'`, `'RECONCILED'`, `'TRANSFERRED_TO_CLIENT'`), `transaction_date`)
    - `cod_reconciliations`: (`id`, `transaction_id`, `discrepancy_amount`, `resolution_notes`, `reconciled_by`, `reconciled_at`)

#### Kelompok 6: Legal & Kepatuhan
17. **`contracts`**:
    - `id`: `VARCHAR(36)` (PK)
    - `contract_number`: `VARCHAR(60)` (UNIQUE)
    - `client_id`: `VARCHAR(36)` (FK)
    - `title`: `VARCHAR(150)`
    - `start_date`: `DATE`, `end_date`: `DATE`
    - `contract_value`: `DECIMAL(15,2)`
    - `document_url`: `VARCHAR(255)`
    - `status`: `ENUM('DRAFT', 'LEGAL_REVIEW', 'APPROVED', 'SIGNED', 'ACTIVE', 'EXPIRING', 'TERMINATED')`

18. **`legal_cases`**:
    - `id`: `VARCHAR(36)` (PK)
    - `case_number`: `VARCHAR(50)` (UNIQUE)
    - `case_type`: `ENUM('SOMASI', 'PERSELISIHAN_HUBUNGAN_INDUSTRIAL', 'SENGKETA_KONTRAK', 'PIDANA_POSKO', 'PERDATA')`
    - `party_name`: `VARCHAR(120)`
    - `status`: `ENUM('OPEN', 'IN_MEDIATION', 'COURT_PROCEEDING', 'SETTLED', 'CLOSED')`

19. **`legal_compliance`**:
    - `id`: `VARCHAR(36)` (PK)
    - `license_name`: `VARCHAR(120)` (e.g. `'SIO Mabes Polri'`, `'Tanda Daftar BUJP'`)
    - `issuing_body`: `VARCHAR(100)`
    - `license_number`: `VARCHAR(80)`
    - `expiry_date`: `DATE`
    - `status`: `ENUM('VALID', 'WARNING_90_DAYS', 'EXPIRED')`

#### Kelompok 7: Marketing & CRM
20. **`leads`**:
    - `id`: `VARCHAR(36)` (PK)
    - `company_name`: `VARCHAR(150)`
    - `contact_person`: `VARCHAR(100)`, `contact_phone`: `VARCHAR(25)`, `contact_email`: `VARCHAR(100)`
    - `service_interest`: `VARCHAR(50)`
    - `lead_source`: `VARCHAR(50)`
    - `status`: `ENUM('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'PROPOSAL_SENT', 'QUALIFIED', 'LOST')`

21. **`opportunities`**:
    - `id`: `VARCHAR(36)` (PK)
    - `lead_id`: `VARCHAR(36)` (FK)
    - `title`: `VARCHAR(150)`
    - `estimated_value`: `DECIMAL(15,2)`
    - `stage`: `ENUM('PROSPECT', 'SURVEY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST')`
    - *Aturan Cascade:* Ketika `stage = 'WON'`, sistem secara otomatis menerbitkan draf kontrak di `contracts`, profil tagihan di `invoices`, dan posko baru di `sites`.

#### Kelompok 8: Operasional Lapangan & Penggantian
22. **`incidents`**:
    - `id`: `VARCHAR(36)` (PK)
    - `site_id`: `VARCHAR(36)` (FK), `client_id`: `VARCHAR(36)` (FK)
    - `incident_date`: `DATETIME`
    - `severity`: `ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`
    - `title`: `VARCHAR(150)`, `description`: `TEXT`
    - `status`: `ENUM('REPORTED', 'INVESTIGATING', 'RESOLVED', 'ESCALATED')`

23. **`replacements`**:
    - `id`: `VARCHAR(36)` (PK)
    - `site_id`: `VARCHAR(36)` (FK)
    - `original_employee_id`: `VARCHAR(36)` (FK)
    - `substitute_employee_id`: `VARCHAR(36)` (FK)
    - `reason`: `ENUM('ABSENT', 'SICK', 'LEAVE', 'EMERGENCY_ROTATION')`
    - `shift_id`: `VARCHAR(36)` (FK)
    - `replacement_date`: `DATE`
    - `status`: `ENUM('REQUESTED', 'APPROVED', 'ASSIGNED', 'COMPLETED', 'CANCELLED')`

24. **`field_reports` & `pic_activities`**:
    - `field_reports`: Laporan patroli harian posko dari Danru.
    - `pic_activities`: Laporan kunjungan supervisor operasional ke posko klien.

#### Kelompok 9: IT Support & Inventaris
25. **`it_tickets`**:
    - `id`: `VARCHAR(36)` (PK)
    - `reporter_id`: `VARCHAR(36)` (FK $\rightarrow$ `users.id`)
    - `category`: `ENUM('HARDWARE', 'SOFTWARE', 'NETWORK', 'BARRIER_GATE', 'CCTV', 'ACCESS_CONTROL')`
    - `priority`: `ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`
    - `status`: `ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`

26. **`it_assets` & `it_maintenance`**:
    - `it_assets`: Inventaris perangkat barrier gate, radio HT, CCTV, PC, dan fingerprint scanner.
    - `it_maintenance`: Jadwal pemeliharaan berkala perangkat posko klien.

#### Kelompok 10: CMS Website Publik
27. **`cms_articles`, `cms_careers`, `cms_faqs`, `cms_inquiries`**:
    - Pengelolaan konten portal publik: artikel edukasi keamanan, lowongan pekerjaan aktif, pertanyaan umum FAQ, dan formulir konsultasi kerja sama masuk.

#### Kelompok 11: Tata Kelola Eksekutif (Direktur Utama)
28. **`approvals` (Centralized Approval Center)**:
    - `id`: `VARCHAR(36)` (PK)
    - `category`: `ENUM('PAYROLL', 'CONTRACT', 'EMPLOYEE_DELETE', 'EXPENSE', 'LEGAL_SETTLEMENT', 'PRICE_DISCOUNT')`
    - `reference_id`: `VARCHAR(50)` (ID entitas terkait)
    - `requested_by`: `VARCHAR(36)` (FK $\rightarrow$ `users.id`)
    - `requested_at`: `TIMESTAMP`
    - `status`: `ENUM('PENDING', 'APPROVED', 'REJECTED')`
    - `approved_by`: `VARCHAR(36)` (NULLABLE, FK $\rightarrow$ `users.id`)
    - `approved_at`: `TIMESTAMP` (NULLABLE)
    - `rejection_reason`: `TEXT` (NULLABLE)

29. **`audit_logs` (Pencatatan Jejak Audit Permanen)**:
    - `id`: `VARCHAR(36)` (PK)
    - `user_id`: `VARCHAR(36)` (FK $\rightarrow$ `users.id`)
    - `role_id`: `VARCHAR(30)`
    - `action`: `VARCHAR(60)` (e.g. `'PAYROLL_APPROVED'`, `'EMPLOYEE_SOFT_DELETED'`, `'INVOICE_CREATED'`)
    - `module`: `VARCHAR(40)`
    - `record_id`: `VARCHAR(50)`
    - `description`: `TEXT`
    - `ip_address`: `VARCHAR(45)`, `user_agent`: `TEXT`
    - `created_at`: `TIMESTAMP` (DEFAULT CURRENT_TIMESTAMP)

---

## 4. Katalog 18 Klien Resmi Otoritatif PT. BARAK (Protected Seed Data)

Seluruh data berikut **wajib di-seed secara permanen** pada tabel `clients` dan dilindungi dari pembersihan data demo:

| ID Klien | Nama Perusahaan Klien | Sektor Industri | Kota Operasional | Status |
|---|---|---|---|:---:|
| `CLI-000001` | PT Astra Tol Nusantara | Infrastruktur & Jalan Tol | Tangerang | `ACTIVE` |
| `CLI-000002` | PT Sinar Logistik Semesta | Pergudangan & Distribusi | Bekasi | `ACTIVE` |
| `CLI-000003` | PT Bank Mega Finansial | Perbankan & Jasa Keuangan | Jakarta Selatan | `ACTIVE` |
| `CLI-000004` | PT Cikarang Presisi Industri | Manufaktur Otomotif | Cikarang | `ACTIVE` |
| `CLI-000005` | PT Grand Indonesia Megah | Pusat Perbelanjaan & Ritel | Jakarta Pusat | `ACTIVE` |
| `CLI-000006` | RS Medika Husada Sejahtera | Layanan Kesehatan & RS | Depok | `ACTIVE` |
| `CLI-000007` | Apartemen Sudirman Park Residence | Hunian Bertingkat & Properti | Jakarta Pusat | `ACTIVE` |
| `CLI-000008` | PT Mitra Niaga Retailindo | Supermarket & Ritel Rantai | Bogor | `ACTIVE` |
| `CLI-000009` | PT Tanjung Priok Logistik | Pelabuhan & Terminal Kontainer | Jakarta Utara | `ACTIVE` |
| `CLI-000010` | Kampus Universitas Nusantara Prima | Pendidikan Tinggi | Tangerang Selatan | `ACTIVE` |
| `CLI-000011` | PT Sumber Berkat Elektronika | Pabrik Elektronika | Serang | `ACTIVE` |
| `CLI-000012` | Gedung Sentra Graha Danamon | Perkantoran Komersial | Jakarta Selatan | `ACTIVE` |
| `CLI-000013` | PT Indofood Prima Perkasa | Manufaktur Makanan & Minuman | Tangerang | `ACTIVE` |
| `CLI-000014` | Hotel Grand Mahakam Heritage | Perhotelan & Hospitality | Jakarta Selatan | `ACTIVE` |
| `CLI-000015` | PT Suryacipta Swadaya Park | Kawasan Industri Modern | Karawang | `ACTIVE` |
| `CLI-000016` | Data Center Cyber Nusantara | Fasilitas Teknologi & Komputasi | Jakarta Barat | `ACTIVE` |
| `CLI-000017` | PT Mayora Indah Distribusi | Logistik Konsumsi Massal | Cikupa | `ACTIVE` |
| `CLI-000018` | PT Kawasan Industri Jababeka | Pengembang Kawasan Industri | Cikarang | `ACTIVE` |

---

## 5. Spesifikasi REST API, Format Amplop JSON & HTTP Protocol

### 5.1 Format Amplop Respons Standar (Standard JSON Envelopes)

#### Respons Sukses Entitas Tunggal / Mutasi (Single Entity Envelope)
```json
{
  "success": true,
  "data": {
    "id": "BRK-EMP-001",
    "nama_lengkap_sesuai_KTP": "Budi Santoso",
    "status_kerja": "PKWT",
    "status": "ACTIVE",
    "updatedAt": "2026-10-11T10:30:00.000Z"
  },
  "message": "Data karyawan berhasil diperbarui.",
  "meta": {}
}
```

#### Respons Sukses Koleksi Data Berpaginasi (Paginated Collection Envelope)
```json
{
  "success": true,
  "data": [
    {
      "id": "CLI-000001",
      "name": "PT Astra Tol Nusantara",
      "city": "Tangerang",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 18,
    "totalPages": 1
  }
}
```

#### Respons Kegagalan Validasi / Error (Error Envelope)
```json
{
  "success": false,
  "message": "Validasi data gagal.",
  "errors": {
    "nik": ["NIK wajib terdiri dari tepat 16 digit angka."],
    "email": ["Format email tidak valid."]
  }
}
```

### 5.2 Ringkasan Endpoint Inti per Modul Operasional

| Modul | Method | Endpoint Path | Izin RBAC | Deskripsi |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/login` | Publik | Otentikasi username & password, kembalikan JWT |
| | `POST` | `/api/v1/auth/logout` | Terautentikasi | Hapus token, bersihkan draf kerja sesi inputer |
| | `GET` | `/api/v1/auth/me` | Terautentikasi | Profil pengguna, peran, dan daftar izin aktif |
| **Karyawan** | `GET` | `/api/v1/employees` | `employee.view` | Filter pencarian, tipe, site, dan paginasi |
| | `POST` | `/api/v1/employees` | `employee.create` | Tambah personel baru |
| | `PATCH` | `/api/v1/employees/:id`| `employee.edit` | Perbarui data pribadi personel |
| | `POST` | `/api/v1/employees/import` | `employee.import` | Impor Excel massal + auto-penugasan aktif |
| | `POST` | `/api/v1/employees/:id/delete-request` | `employee.delete.request` | Ajukan penghapusan ke Direktur |
| | `POST` | `/api/v1/employees/:id/soft-delete` | `employee.delete.approve` | Otorisasi penghapusan oleh Direktur |
| **Klien** | `GET` | `/api/v1/clients` | `client.view` | Daftar klien mitra bisnis |
| | `POST` | `/api/v1/clients` | `client.create` | Tambah mitra baru |
| | `PATCH` | `/api/v1/clients/:id` | `client.edit` | Perbarui profil klien |
| **Posko** | `GET` | `/api/v1/sites` | `location.view` | Daftar posko (filter `client_id`) |
| | `POST` | `/api/v1/sites` | `location.create` | Daftarkan posko baru |
| **Penugasan**| `GET` | `/api/v1/placements` | `placement.view` | Histori penugasan aktif & rotasi |
| | `POST` | `/api/v1/placements` | `placement.create`| Plotting personel ke posko klien |
| | `POST` | `/api/v1/placements/:id/transfer`| `placement.transfer` | Rotasi personel antar posko |
| **Presensi** | `GET` | `/api/v1/attendance/sheets` | `attendance.view` | Lembar presensi berbasis klien & site |
| | `POST` | `/api/v1/attendance` | `attendance.record` | Rekam jam masuk, pulang, lembur |
| | `POST` | `/api/v1/attendance/sheets/:id/finalize` | `attendance.finalize` | Kunci lembar presensi bulanan (HRD) |
| | `POST` | `/api/v1/attendance/sheets/:id/reopen` | `attendance.reopen` | Buka kembali lembar presensi (Direktur) |
| **Faktur** | `GET` | `/api/v1/invoices` | `invoice.view` | Daftar faktur tagihan |
| | `POST` | `/api/v1/invoices` | `invoice.create` | Terbitkan invoice (rumus PPN/PPh23) |
| | `POST` | `/api/v1/invoices/:id/payments` | `payment.record` | Catat pembayaran (khusus BCA 8833951911)|
| **Penggajian**| `GET` | `/api/v1/payrolls` | `payroll.view` | Rekap periode penggajian |
| | `POST` | `/api/v1/payrolls` | `payroll.create` | Hitung kalkulasi gaji (Finance) |
| | `POST` | `/api/v1/payrolls/:id/approve` | `payroll.approve` | Persetujuan penggajian (Direktur) |
| **COD** | `GET` | `/api/v1/cod/transactions` | `cod.view` | Transaksi titipan kurir COD |
| | `POST` | `/api/v1/cod/transactions/:id/settle` | `cod.reconcile` | Rekonsiliasi & penyelesaian sengketa |
| **Persetujuan**| `GET` | `/api/v1/approvals` | `approval.view` | Antrean Approval Center Direktur |
| | `POST` | `/api/v1/approvals/:id/action` | `approval.action` | Approve / Reject dengan catatan alasan |
| **Upload** | `POST` | `/api/v1/files/upload` | Terautentikasi | Unggah berkas multipart (S3 / MinIO) |

---

## 6. Matriks Hak Akses Granular RBAC & Batas Maker-Checker

### Matriks Hak Akses Peran

| Modul / Izin | DIREKTUR | HRD | OPERASIONAL | FINANCE | LEGAL | MARKETING | IT_SUPPORT | ADMIN_WEB | INPUTER | PIC_CLIENT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Karyawan (View)** | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | - | - | Rekan Site |
| **Karyawan (Create/Edit)** | ✓ | ✓ | - | - | - | - | - | - | - | - |
| **Karyawan (Delete Req)** | - | ✓ | - | - | - | - | - | - | - | - |
| **Karyawan (Delete Appr)**| **✓** | - | - | - | - | - | - | - | - | - |
| **Impor Excel Karyawan** | ✓ | ✓ | - | - | - | - | - | - | - | - |
| **Presensi (Input/Record)**| ✓ | ✓ | ✓ | - | - | - | - | - | **✓** | - |
| **Presensi (Finalize)** | - | **✓** | - | - | - | - | - | - | - | - |
| **Presensi (Reopen)** | **✓** | - | - | - | - | - | - | - | - | - |
| **Penugasan / Plotting** | ✓ | ✓ | **✓** | - | - | - | - | - | - | - |
| **Faktur (Create/Edit)** | ✓ | - | - | **✓** | - | - | - | - | - | - |
| **Pembayaran Faktur BCA** | ✓ | - | - | **✓** | - | - | - | - | - | - |
| **Payroll (Create/Calc)** | - | - | - | **✓** | - | - | - | - | - | - |
| **Payroll (Approve)** | **✓** | - | - | - | - | - | - | - | - | - |
| **COD Rekonsiliasi** | ✓ | - | ✓ | **✓** | - | - | - | - | - | - |
| **Kontrak PKS (Create)** | ✓ | - | - | - | **✓** | - | - | - | - | - |
| **Kontrak PKS (Approve)**| **✓** | - | - | - | - | - | - | - | - | - |
| **Kasus Hukum / Somasi** | ✓ | - | - | - | **✓** | - | - | - | - | - |
| **CRM / Pipeline Leads** | ✓ | - | - | - | - | **✓** | - | - | - | - |
| **Tiket & Aset IT** | ✓ | - | - | - | - | - | **✓** | - | - | - |
| **CMS Website Publik** | ✓ | - | - | - | - | - | - | **✓** | - | - |
| **Approval Center** | **✓** | - | - | - | - | - | - | - | - | - |
| **Manajemen Pengguna** | **✓** | - | - | - | - | - | **✓** | **✓** | - | - |

---

## 7. Kontrak Alur Bisnis Lintas Divisi (Workflows)

### 7.1 Alur Penghapusan Karyawan (Maker-Checker Soft Delete)
```
[HRD] -> [POST /employees/:id/delete-request] -> pendingDelete = true, Approval Record Created (PENDING)
                                                          │
                    ┌─────────────────────────────────────┴─────────────────────────────────────┐
                    ▼                                                                           ▼
           [DIREKTUR: APPROVE]                                                         [DIREKTUR: REJECT]
                    │                                                                           │
   is_deleted = true, status = NON_AKTIF,                                       pendingDelete = false, Karyawan AKTIF,
   penugasan diakhiri, Log Audit Tercatat                                      alasan penolakan dicatat di approval
```

### 7.2 Alur Presensi Posko & Isolasi Sesi Petugas Inputer
1. Petugas memilih **Klien** dan **Lokasi Penempatan** pada spreadsheet presensi.
2. Sistem otomatis menarik daftar penugasan aktif (`placements`) di lokasi tersebut. Kolom Datang, Pulang, Lembur disiapkan kosong untuk entri manual.
3. Saat petugas inputer (`user1`, `user2`) melakukan logout, riwayat kerja draf sementara ("Lembar Tersedia") **wajib dibersihkan dari penyimpanan sesi** agar login berikutnya selalu bersih.
4. Lembar presensi difinalisasi oleh HRD (`attendance.finalize`). Jika ada koreksi susulan, lembar hanya dapat dibuka kembali oleh Direktur Utama (`attendance.reopen`).

### 7.3 Alur Marketing WON Cascade
```
[Marketing: Status Peluang berubah menjadi 'WON']
                     │
                     ├──> [LEGAL]: Terbit otomatis draf Perjanjian Kerja Sama (PKS) di tabel `contracts`
                     ├──> [FINANCE]: Terbit otomatis profil penagihan awal & tagihan di tabel `invoices`
                     └──> [OPERASIONAL]: Terbit otomatis profil posko/site penempatan di tabel `sites`
```

### 7.4 Alur Rekonsiliasi Kas Titipan COD & Penanganan Selisih
1. Kurir menyetorkan uang titipan COD harian ke Finance.
2. Jika nominal setor $=$ total tagihan resi $\rightarrow$ Status: `RECONCILED`.
3. Jika terdapat selisih (kurang/lebih) $\rightarrow$ Status: `DISCREPANCY`, terbit tiket investigasi di `cod_reconciliations`.
4. Setelah diverifikasi bukti serah terima resi, dana diteruskan ke rekening klien $\rightarrow$ Status: `TRANSFERRED_TO_CLIENT`.

### 7.5 Alur Impor Excel Karyawan Massal Atomik
- Fitur Impor Excel (`EmployeeImportModal.jsx`) memproses berkas `.xlsx`.
- Eksekusi backend **wajib atomik**: membuat entitas `employees` sekaligus menerbitkan entitas `placements` aktif yang terikat ke Klien dan Lokasi Penempatan terpilih dalam satu transaksi database (`START TRANSACTION` $\rightarrow$ `COMMIT`).

---

## 8. Kamus Status Enum Terpusat & Transisi Siklus Hidup

Semua status disimpan dalam **huruf kapital (*uppercase*)**:

- **`EmployeeStatus`**: `APPLICANT` $\rightarrow$ `ONBOARDING` $\rightarrow$ `ACTIVE` $\leftrightarrow$ `PLACED` $\leftrightarrow$ `TRANSFERRED` $\rightarrow$ `ON_LEAVE` $\rightarrow$ `TERMINATED` / `INACTIVE`.
- **`PlacementStatus`**: `REQUESTED` $\rightarrow$ `APPROVED` $\rightarrow$ `SCHEDULED` $\rightarrow$ `ACTIVE` $\rightarrow$ `ROTATED` / `ENDED`.
- **`ContractStatus`**: `DRAFT` $\rightarrow$ `LEGAL_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `SIGNED` $\rightarrow$ `ACTIVE` $\rightarrow$ `EXPIRING` $\rightarrow$ `TERMINATED`.
- **`InvoiceStatus`**: `DRAFT` $\rightarrow$ `SENT` $\rightarrow$ `PARTIAL` $\rightarrow$ `PAID` / `OVERDUE` / `CANCELLED`.
- **`PayrollStatus`**: `DRAFT` $\rightarrow$ `CALCULATED` $\rightarrow$ `PENDING_APPROVAL` $\rightarrow$ `APPROVED` $\rightarrow$ `PAID`.
- **`CODStatus`**: `PENDING` $\rightarrow$ `DISCREPANCY` $\rightarrow$ `RECONCILED` $\rightarrow$ `TRANSFERRED_TO_CLIENT`.
- **`IncidentStatus`**: `REPORTED` $\rightarrow$ `INVESTIGATING` $\rightarrow$ `RESOLVED` / `ESCALATED`.
- **`ApprovalStatus`**: `PENDING` $\rightarrow$ `APPROVED` / `REJECTED`.
- **`TicketStatus`**: `OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`.
- **`LeadStatus`**: `NEW` $\rightarrow$ `CONTACTED` $\rightarrow$ `SURVEY_SCHEDULED` $\rightarrow$ `PROPOSAL_SENT` $\rightarrow$ `QUALIFIED` / `LOST`.
- **`OpportunityStage`**: `PROSPECT` $\rightarrow$ `SURVEY` $\rightarrow$ `PROPOSAL` $\rightarrow$ `NEGOTIATION` $\rightarrow$ `WON` / `LOST`.

---

## 9. Urutan 20 Tahap Implementasi Backend (Roadmap)

Tim backend disarankan membangun sistem secara berurutan sesuai roadmap 20 tahap ini:

```
[Tahap 1-3: Core & Auth] ──> [Tahap 4-8: Master Data & Placements] ──> [Tahap 9-11: Workforce & Payroll]
                                                                                │
[Tahap 16-20: Governance & Reporting] <── [Tahap 12-15: Finance, Legal & Ops] <──┘
```

1. **Tahap 1: Skema Database & Migrasi (DDL MySQL):** Eksekusi 29 tabel relasional dengan indeks dan foreign key.
2. **Tahap 2: Autentikasi JWT & Sesi:** Login, refresh token, logout dengan pembersihan sesi inputer.
3. **Tahap 3: Pengguna, Peran & Middleware RBAC:** Middleware `requireAuth`, `requireRole`, `requirePermission`.
4. **Tahap 4: Modul Karyawan & Impor Excel Massal:** Endpoint CRUD, NIK 16 digit, endpoint `/employees/import` atomik.
5. **Tahap 5: Mitra Bisnis & Klien:** Endpoint CRUD, seeding 18 klien resmi PT. BARAK.
6. **Tahap 6: Posko & Lokasi Lapangan (Sites):** Endpoint CRUD posko dengan kuota personel dan koordinat.
7. **Tahap 7: Layanan & SLA:** Master 6 lini layanan (Security, Cleaning, Driver, dll.).
8. **Tahap 8: Penugasan & Plotting Personel (Placements):** Endpoint plotting, transfer posko, dan pengakhiran tugas.
9. **Tahap 9: Presensi Posko & Penjadwalan Roster:** Spreadsheet presensi klien & site, finalisasi dan pembukaan presensi.
10. **Tahap 10: Penggajian Karyawan (Payroll):** Hitung slip gaji, maker-checker approval Direktur.
11. **Tahap 11: Rekrutmen & Pelamar (Applicants):** Verifikasi berkas KTP, SKCK, sertifikasi Gada Pratama.
12. **Tahap 12: Penagihan & Faktur (Invoices):** Rumus invoice (fee, PPh 23, PPN 11%), pencatatan bayar BCA.
13. **Tahap 13: Rekonsiliasi Kas Titipan COD:** Pencatatan resi kurir, penanganan selisih, transfer klien.
14. **Tahap 14: Legalitas, Kontrak PKS & Kepatuhan:** Manajemen PKS korporat, lisensi Mabes Polri, register sengketa.
15. **Tahap 15: Operasional Lapangan & Pergantian Personel:** Register insiden dan tiket pergantian personel posko.
16. **Tahap 16: Pemasaran & Pipeline CRM:** Leads, peluang komersial, dan otomatisasi Marketing WON cascade.
17. **Tahap 17: IT Support & Manajemen Aset:** Inventaris barrier gate, CCTV, pemeliharaan berkala posko.
18. **Tahap 18: CMS Website Publik:** Berita/artikel, lowongan karir publik, pertanyaan umum (FAQ).
19. **Tahap 19: Approval Center Terpusat Direktur:** Otorisasi 8 kategori permohonan dengan pencatatan log audit.
20. **Tahap 20: Audit Logs, Notifikasi & Laporan Eksekutif:** Konsolidasi jejak audit, agregasi KPI dashboard.

---

## 10. Panduan Integrasi Frontend-Backend (CORS, JWT & Deployment)

### 10.1 Konfigurasi Lingkungan Frontend (`.env`)
```env
# Aktifkan panggilan HTTP REST aktual ke Express backend
VITE_API_MODE=rest

# URL server backend lokal / produksi
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Lingkungan aplikasi
VITE_APP_ENV=development
```

### 10.2 Konfigurasi Wajib CORS di Express Backend
```javascript
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bimasenaadhirajasaradika.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Diblokir oleh kebijakan CORS PT. BARAK'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));
```

### 10.3 Protokol Autentikasi JWT
- Frontend secara otomatis menyisipkan header: `Authorization: Bearer <token>` pada setiap request via `apiClient.js`.
- Jika backend mengembalikan status `401 Unauthorized`, frontend akan otomatis mengarahkan pengguna ke `/ops/login`.
