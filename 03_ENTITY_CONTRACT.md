# 03_ENTITY_CONTRACT.md — PT. BARAK IOMS
**Versi:** 2.0 (Relational Schema & Field Specifications)  
**Tanggal:** 29 September 2026  
**Status:** COMPLETE & AUTHORITATIVE  
**Ruang Lingkup:** Kontrak Entitas Data Relasional Backend (MySQL Engine)

---

## 1. Aturan Fundamental Relasi (Core Relationship Rules)

> [!IMPORTANT]
> **Prinsip Mobilitas Personel (Workforce Mobility):**
> Entitas `employees` **TIDAK BOLEH** memiliki relasi permanen *foreign key* `client_id` secara langsung. Personel PT. BARAK dipekerjakan oleh PT. BARAK dan dialokasikan ke Klien melalui entitas perantara `placements`. Satu karyawan dapat memiliki banyak riwayat penugasan (`placements`) di berbagai klien sepanjang masa kerjanya.

### Diagram Relasi Utama (Entity-Relationship Flow)
```
[Client] ──< [Sites/Locations]
   │
   ├──< [Contracts] (PKS Korporat)
   ├──< [Invoices] ──< [Payments]
   └──< [Placements] >── [Employee] ──< [Employee_Documents]
            │
            ├──> [Site]
            ├──> [Service]
            ├──> [Position]
            ├──> [Shift]
            └──< [Attendance]
```

---

## 2. Rincian 28 Entitas Sistem (28 System Entities)

### 2.1 Autentikasi, Pengguna & Otorisasi
1. **`users`**:
   - `id`: `VARCHAR(36)` / `CHAR(36)` (PK, UUID)
   - `username`: `VARCHAR(50)` (UNIQUE, NOT NULL)
   - `email`: `VARCHAR(100)` (UNIQUE, NOT NULL)
   - `password_hash`: `VARCHAR(255)` (NOT NULL, Argon2 / Bcrypt)
   - `full_name`: `VARCHAR(100)` (NOT NULL)
   - `role_id`: `VARCHAR(30)` (FK $\rightarrow$ `roles.id`)
   - `status`: `ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE')` (DEFAULT: `'ACTIVE'`)
   - `created_at`, `updated_at`: `TIMESTAMP`

2. **`roles`**:
   - `id`: `VARCHAR(30)` (PK, e.g. `'DIREKTUR'`, `'HRD'`, `'OPERASIONAL'`, `'FINANCE'`, `'LEGAL'`, `'MARKETING'`, `'IT_SUPPORT'`, `'ADMIN_WEBSITE'`)
   - `name`: `VARCHAR(50)` (NOT NULL)
   - `description`: `TEXT`

3. **`permissions` & `role_permissions`**:
   - `id`: `VARCHAR(50)` (PK, e.g. `'employee.create'`, `'payroll.approve'`)
   - `name`: `VARCHAR(100)`
   - `module`: `VARCHAR(30)`
   - Junction table `role_permissions`: (`role_id`, `permission_id`) sebagai Composite PK.

### 2.2 Sumber Daya Manusia (HRD) & Personil
4. **`employees`**:
   - `id`: `VARCHAR(36)` (PK, UUID)
   - `employee_code`: `VARCHAR(30)` (UNIQUE, format: `'BRK-EMP-XXX'`)
   - `nik`: `CHAR(16)` (UNIQUE, NOT NULL, 16 digit KTP)
   - `full_name`: `VARCHAR(120)` (NOT NULL)
   - `gender`: `ENUM('L', 'P')` (NOT NULL)
   - `birth_place`: `VARCHAR(60)`
   - `birth_date`: `DATE`
   - `join_date`: `DATE` (NOT NULL)
   - `job_type`: `VARCHAR(50)` (e.g. `'Security'`, `'Cleaning'`, `'Driver'`, `'Staff'`)
   - `position`: `VARCHAR(50)` (e.g. `'Anggota'`, `'Danru'`, `'Chief'`, `'Staff'`)
   - `department`: `VARCHAR(50)` (e.g. `'Operasional'`, `'HRD'`, `'Finance'`)
   - `employment_status`: `ENUM('TETAP', 'KONTRAK', 'PROBATION', 'NON_AKTIF')` (DEFAULT: `'KONTRAK'`)
   - `tax_status`: `VARCHAR(10)` (DEFAULT: `'TK0'`)
   - `npwp`: `VARCHAR(30)`
   - `bpjs_kesehatan`: `VARCHAR(30)`
   - `bpjs_ketenagakerjaan`: `VARCHAR(30)`
   - `bank_name`: `VARCHAR(40)` (DEFAULT: `'Bank Mandiri'`)
   - `bank_account_number`: `VARCHAR(30)`
   - `emergency_name`: `VARCHAR(100)`
   - `emergency_relation`: `VARCHAR(30)`
   - `emergency_phone`: `VARCHAR(25)`
   - `is_deleted`: `BOOLEAN` (DEFAULT: `FALSE`, Soft Delete Flag)
   - `deleted_at`: `TIMESTAMP` (NULLABLE)
   - `deleted_by`: `VARCHAR(36)` (NULLABLE)

5. **`employee_documents`**:
   - `id`: `VARCHAR(36)` (PK, UUID)
   - `employee_id`: `VARCHAR(36)` (FK $\rightarrow$ `employees.id`, ON DELETE CASCADE)
   - `document_type`: `ENUM('KTP', 'FOTO', 'IJAZAH', 'SERTIFIKAT_GADA', 'SKCK', 'SURAT_SEHAT')`
   - `file_url`: `VARCHAR(255)` (NOT NULL, S3/Cloud Storage URL)
   - `file_size`: `INT`
   - `mime_type`: `VARCHAR(50)`
   - `verified`: `BOOLEAN` (DEFAULT: `FALSE`)

### 2.3 Klien, Lokasi, Layanan & Posko
6. **`clients`**:
   - `id`: `VARCHAR(36)` (PK, UUID)
   - `client_code`: `VARCHAR(30)` (UNIQUE, format: `'CLI-XXXXXX'`)
   - `name`: `VARCHAR(120)` (NOT NULL)
   - `industry`: `VARCHAR(60)` (e.g. `'Infrastruktur & Transportasi'`, `'Finansial'`)
   - `city`: `VARCHAR(60)` (NOT NULL)
   - `address`: `TEXT`
   - `contact_person`: `VARCHAR(100)` (NOT NULL)
   - `email`: `VARCHAR(100)`
   - `phone`: `VARCHAR(30)`
   - `status`: `ENUM('ACTIVE', 'PROSPECT', 'INACTIVE')` (DEFAULT: `'ACTIVE'`)

7. **`sites` (Locations)**:
   - `id`: `VARCHAR(36)` (PK, UUID)
   - `site_code`: `VARCHAR(30)` (UNIQUE, format: `'LOC-XXX'`)
   - `client_id`: `VARCHAR(36)` (FK $\rightarrow$ `clients.id`, ON DELETE CASCADE)
   - `name`: `VARCHAR(100)` (NOT NULL, e.g. `'Pos Jaga Gerbang Barat'`)
   - `address`: `TEXT`
   - `type`: `ENUM('POS_UTAMA', 'PATROLI', 'LOBBY', 'PARKIR', 'GUDANG')`
   - `target_quota`: `INT` (DEFAULT: 1, Kuota personil yang dibutuhkan)
   - `status`: `ENUM('ACTIVE', 'INACTIVE')` (DEFAULT: `'ACTIVE'`)

8. **`services`**:
   - `id`: `VARCHAR(30)` (PK, e.g. `'security'`, `'cleaning'`, `'driver'`, `'parking'`)
   - `name`: `VARCHAR(60)` (NOT NULL)
   - `sla_standard_hours`: `INT` (DEFAULT: 24)

9. **`positions`**:
   - `id`: `VARCHAR(36)` (PK)
   - `title`: `VARCHAR(50)` (e.g. `'Chief Security'`, `'Danru'`, `'Anggota'`)
   - `hierarchy_level`: `INT`

### 2.4 Penugasan, Roster & Presensi
10. **`placements`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `assignment_code`: `VARCHAR(30)` (UNIQUE, format: `'BRK-ASN-XXX'`)
    - `employee_id`: `VARCHAR(36)` (FK $\rightarrow$ `employees.id`, NOT NULL)
    - `client_id`: `VARCHAR(36)` (FK $\rightarrow$ `clients.id`, NOT NULL)
    - `site_id`: `VARCHAR(36)` (FK $\rightarrow$ `sites.id`, NOT NULL)
    - `service_id`: `VARCHAR(30)` (FK $\rightarrow$ `services.id`, NOT NULL)
    - `shift_id`: `VARCHAR(36)` (FK $\rightarrow$ `shifts.id`, NOT NULL)
    - `role_title`: `VARCHAR(50)` (e.g. `'Danru Security'`)
    - `start_date`: `DATE` (NOT NULL)
    - `end_date`: `DATE` (NULLABLE)
    - `is_current`: `BOOLEAN` (DEFAULT: `TRUE`)
    - `status`: `ENUM('REQUESTED', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'ROTATED', 'ENDED')` (DEFAULT: `'ACTIVE'`)
    - `rotation_notes`: `TEXT`

11. **`shifts`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `shift_code`: `VARCHAR(30)` (UNIQUE, e.g. `'SH-PAGI'`, `'SH-SIANG'`, `'SH-MALAM'`)
    - `name`: `VARCHAR(50)` (NOT NULL)
    - `start_time`: `TIME` (NOT NULL)
    - `end_time`: `TIME` (NOT NULL)
    - `is_overnight`: `BOOLEAN` (DEFAULT: `FALSE`)

12. **`rosters`**:
    - `id`: `VARCHAR(36)` (PK)
    - `placement_id`: `VARCHAR(36)` (FK $\rightarrow$ `placements.id`)
    - `scheduled_date`: `DATE` (NOT NULL)
    - `shift_id`: `VARCHAR(36)` (FK $\rightarrow$ `shifts.id`)

13. **`attendance`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `employee_id`: `VARCHAR(36)` (FK $\rightarrow$ `employees.id`)
    - `placement_id`: `VARCHAR(36)` (FK $\rightarrow$ `placements.id`)
    - `date`: `DATE` (NOT NULL)
    - `check_in`: `TIMESTAMP` (NULLABLE)
    - `check_out`: `TIMESTAMP` (NULLABLE)
    - `status`: `ENUM('PRESENT', 'LATE', 'ABSENT', 'SICK', 'LEAVE', 'ALPHA')`
    - `is_locked`: `BOOLEAN` (DEFAULT: `FALSE`, Dikunci saat finalisasi bulanan)
    - `notes`: `VARCHAR(255)`

### 2.5 Rekrutmen & Karir
14. **`recruitment` (Applicants & Career Postings)**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `job_posting_id`: `VARCHAR(36)`
    - `candidate_name`: `VARCHAR(100)` (NOT NULL)
    - `nik`: `CHAR(16)`
    - `phone`: `VARCHAR(25)`
    - `email`: `VARCHAR(100)`
    - `resume_url`: `VARCHAR(255)`
    - `status`: `ENUM('APPLICANT', 'SCREENING', 'INTERVIEW', 'ACCEPTED', 'REJECTED')`

### 2.6 Keuangan, Faktur & COD
15. **`payroll`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `period_month`: `INT` (1-12)
    - `period_year`: `INT`
    - `total_disbursement`: `DECIMAL(15, 2)` (NOT NULL)
    - `total_headcount`: `INT` (NOT NULL)
    - `maker_user_id`: `VARCHAR(36)` (FK $\rightarrow$ `users.id`, Staf Keuangan pembuat)
    - `approver_user_id`: `VARCHAR(36)` (FK $\rightarrow$ `users.id`, Direktur penyetuju)
    - `status`: `ENUM('DRAFT', 'HRD_VERIFIED', 'FINANCE_REVIEW', 'APPROVED', 'PROCESSED')`

16. **`invoices`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `invoice_number`: `VARCHAR(40)` (UNIQUE, e.g. `'INV-2026-09-001'`)
    - `client_id`: `VARCHAR(36)` (FK $\rightarrow$ `clients.id`, NOT NULL)
    - `period`: `VARCHAR(30)` (e.g. `'September 2026'`)
    - `subtotal`: `DECIMAL(15, 2)` (NOT NULL)
    - `tax_amount`: `DECIMAL(15, 2)` (PPN 11%)
    - `total_amount`: `DECIMAL(15, 2)` (NOT NULL)
    - `amount_paid`: `DECIMAL(15, 2)` (DEFAULT: 0.00)
    - `issue_date`: `DATE` (NOT NULL)
    - `due_date`: `DATE` (NOT NULL)
    - `status`: `ENUM('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID')`

17. **`payments`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `invoice_id`: `VARCHAR(36)` (FK $\rightarrow$ `invoices.id`, ON DELETE CASCADE)
    - `amount`: `DECIMAL(15, 2)` (NOT NULL)
    - `payment_method`: `ENUM('BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'GIRO', 'CHEQUE')`
    - `reference_number`: `VARCHAR(50)` (NOT NULL)
    - `payment_date`: `DATE` (NOT NULL)

18. **`expenses`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `category`: `ENUM('OPERASIONAL', 'BBM_PATROLI', 'LOGISTIK', 'SERAGAM', 'CAPEX')`
    - `amount`: `DECIMAL(15, 2)` (NOT NULL)
    - `description`: `VARCHAR(255)`
    - `receipt_url`: `VARCHAR(255)`
    - `approved_by`: `VARCHAR(36)`

### 2.7 Legal, Kontrak & Sengketa
19. **`contracts`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `contract_number`: `VARCHAR(50)` (UNIQUE, format: `'PKS/BARAK/CLI/001/2026'`)
    - `client_id`: `VARCHAR(36)` (FK $\rightarrow$ `clients.id`, NOT NULL)
    - `contract_value`: `DECIMAL(15, 2)` (NOT NULL)
    - `start_date`: `DATE` (NOT NULL)
    - `end_date`: `DATE` (NOT NULL)
    - `document_url`: `VARCHAR(255)`
    - `status`: `ENUM('DRAFT', 'LEGAL_REVIEW', 'APPROVED', 'SIGNED', 'ACTIVE', 'EXPIRING', 'RENEWED', 'EXPIRED')`

### 2.8 Marketing, Leads & Peluang
20. **`leads`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `lead_number`: `VARCHAR(30)` (UNIQUE, format: `'LED-2026-XXXX'`)
    - `company_name`: `VARCHAR(120)` (NOT NULL)
    - `pic_name`: `VARCHAR(100)` (NOT NULL)
    - `phone`: `VARCHAR(30)` (NOT NULL)
    - `email`: `VARCHAR(100)`
    - `source`: `ENUM('WEBSITE_FORM', 'DIRECT_CALL', 'TENDER_B2B', 'REFERRAL')`
    - `status`: `ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'SURVEY', 'QUOTED', 'NEGOTIATION', 'WON', 'LOST')`

21. **`quotations` (Opportunities)**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `lead_id`: `VARCHAR(36)` (FK $\rightarrow$ `leads.id`)
    - `quotation_number`: `VARCHAR(40)` (UNIQUE)
    - `deal_value`: `DECIMAL(15, 2)` (NOT NULL)
    - `target_start_date`: `DATE`
    - `is_won`: `BOOLEAN` (DEFAULT: `FALSE`)

### 2.9 Operasional, Insiden & Pergantian
22. **`incidents`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `incident_number`: `VARCHAR(30)` (UNIQUE, format: `'INC-2026-XXXX'`)
    - `site_id`: `VARCHAR(36)` (FK $\rightarrow$ `sites.id`, NOT NULL)
    - `client_id`: `VARCHAR(36)` (FK $\rightarrow$ `clients.id`, NOT NULL)
    - `severity`: `ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')` (NOT NULL)
    - `title`: `VARCHAR(120)` (NOT NULL)
    - `description`: `TEXT` (NOT NULL)
    - `status`: `ENUM('OPEN', 'INVESTIGATING', 'ESCALATED', 'RESOLVED')`
    - `reported_by`: `VARCHAR(100)`
    - `resolution_notes`: `TEXT`

23. **`replacements`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `request_number`: `VARCHAR(30)` (UNIQUE, format: `'REP-2026-XXXX'`)
    - `current_employee_id`: `VARCHAR(36)` (FK $\rightarrow$ `employees.id`, Personil berhalangan)
    - `candidate_employee_id`: `VARCHAR(36)` (FK $\rightarrow$ `employees.id`, Personil pengganti)
    - `site_id`: `VARCHAR(36)` (FK $\rightarrow$ `sites.id`)
    - `reason`: `VARCHAR(255)`
    - `status`: `ENUM('PENDING', 'ASSIGNED', 'COMPLETED', 'CANCELLED')`

### 2.10 Pusat Persetujuan & Jejak Audit
24. **`approvals`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `request_type`: `ENUM('EMPLOYEE_DELETE', 'EMPLOYEE_STATUS_CHANGE', 'PLACEMENT_APPROVAL', 'QUOTATION_APPROVAL', 'CONTRACT_APPROVAL', 'EXPENSE_APPROVAL', 'OPERATIONAL_REQUEST', 'PAYROLL')`
    - `reference_id`: `VARCHAR(36)` (ID entitas terkait, e.g. `employee_id`, `contract_id`)
    - `title`: `VARCHAR(150)` (NOT NULL)
    - `requester_user_id`: `VARCHAR(36)` (FK $\rightarrow$ `users.id`)
    - `department`: `VARCHAR(30)` (NOT NULL)
    - `reason`: `TEXT`
    - `amount`: `DECIMAL(15, 2)` (NULLABLE, untuk Capex/Payroll)
    - `status`: `ENUM('PENDING', 'APPROVED', 'REJECTED')` (DEFAULT: `'PENDING'`)
    - `action_date`: `TIMESTAMP`
    - `approver_user_id`: `VARCHAR(36)` (FK $\rightarrow$ `users.id`)
    - `director_notes`: `TEXT`

25. **`audit_logs`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `user_id`: `VARCHAR(36)` (FK $\rightarrow$ `users.id`, NULLABLE jika aksi sistem)
    - `actor_name`: `VARCHAR(100)` (NOT NULL)
    - `actor_role`: `VARCHAR(30)` (NOT NULL)
    - `action`: `VARCHAR(50)` (e.g. `'EMPLOYEE_CREATE'`, `'DIRECTOR_APPROVAL'`, `'INVOICE_PAID'`)
    - `module`: `VARCHAR(50)` (NOT NULL)
    - `record_id`: `VARCHAR(50)` (ID entitas yang dimutasi)
    - `description`: `TEXT` (Penjelasan rinci mutasi data)
    - `ip_address`: `VARCHAR(45)`
    - `timestamp`: `TIMESTAMP` (DEFAULT: CURRENT_TIMESTAMP)

### 2.11 IT Infrastructure & Aset
26. **`it_tickets`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `ticket_number`: `VARCHAR(30)` (UNIQUE, format: `'TKT-2026-XXXX'`)
    - `subject`: `VARCHAR(120)` (NOT NULL)
    - `category`: `ENUM('HARDWARE', 'NETWORK', 'SOFTWARE_APP', 'CCTV_POSKO')`
    - `priority`: `ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`
    - `assigned_to`: `VARCHAR(100)`
    - `sla_deadline`: `TIMESTAMP`
    - `status`: `ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`

27. **`it_assets` & `maintenance`**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `asset_tag`: `VARCHAR(40)` (UNIQUE, format: `'AST-POS-XXXX'`)
    - `name`: `VARCHAR(100)` (e.g. `'Radio HT Digital Motorola XiR P6620i'`)
    - `category`: `ENUM('RADIO_HT', 'SMARTPHONE_PATROLI', 'TABLET_ABSENSI', 'CCTV')`
    - `assigned_site_id`: `VARCHAR(36)` (FK $\rightarrow$ `sites.id`)
    - `condition`: `ENUM('GOOD', 'MAINTENANCE_REQUIRED', 'DAMAGED')`

### 2.12 Website CMS
28. **`website_content` (Articles, Careers, FAQs, Inquiries)**:
    - `id`: `VARCHAR(36)` (PK, UUID)
    - `content_type`: `ENUM('ARTICLE', 'CAREER_POSTING', 'FAQ', 'CLIENT_INQUIRY')`
    - `title`: `VARCHAR(200)`
    - `slug`: `VARCHAR(200)` (UNIQUE untuk artikel)
    - `body`: `LONGTEXT`
    - `meta_description`: `VARCHAR(255)`
    - `status`: `ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED')`
