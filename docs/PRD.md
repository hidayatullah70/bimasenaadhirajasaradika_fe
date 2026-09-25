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
  - Kanal kontak langsung: WhatsApp Konsultasi (`0851 2479 9305`), WhatsApp Lowongan Kerja (`0851 7433 4336`), dan email resmi.
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

## 19. RBAC

Permission minimum:

- VIEW
- CREATE
- EDIT
- DELETE
- APPROVE
- EXPORT
- ASSIGN
- ESCALATE
- CLOSE

Backend wajib memvalidasi permission. Hiding menu di frontend bukan security.

Permission contoh:

```text
employee.view
employee.create
employee.edit
employee.export

attendance.view
attendance.edit
attendance.finalize
attendance.reopen
attendance.export

cod.view
cod.collect
cod.escalate
cod.settle

legal.case.view
legal.case.create
legal.case.edit
legal.case.approve
legal.case.close
```

---

## 20. DATA MODEL

Core entities:

```text
User
Role
Permission
Employee
EmployeeDocument
EmploymentContract
AttendanceSheet
AttendanceRow
Assignment
Shift
Leave
Violation
Evaluation

Client
ClientContract
Project
Location
Post
ManpowerRequirement
Incident
ReplacementRequest

Invoice
InvoiceItem
Payment
Receivable
Payroll
PayrollItem
CODTransaction
CODCase
CODCollectionAttempt
CODSettlement

LegalCase
LegalAction
LegalDocument
ComplianceItem

Lead
Opportunity
MarketingActivity
Proposal
Quotation
Campaign

ITTicket
ITAsset
Maintenance

WebsitePage
Service
News
Blog
Career
FAQ
Media
WebsiteSetting

Notification
Approval
AuditLog
```

Tidak ada Employee duplicate di modul lain. Gunakan foreign key.

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

## 39. APPROVAL

### Payroll

```text
DRAFT
→ HRD_REVIEW
→ FINANCE_REVIEW
→ DIRECTOR_APPROVAL
→ APPROVED
→ PROCESSED
```

### Contract

```text
DRAFT
→ LEGAL_REVIEW
→ AUTHORIZED_APPROVAL
→ ACTIVE
```

### Legal Case

```text
OPEN
→ INVESTIGATION
→ LEGAL_REVIEW
→ ACTION
→ RESOLUTION
→ CLOSED
```

Approval menyimpan:

- approver
- timestamp
- decision
- comment

---

## 40. STATUS ENUM

Centralize:

```text
ACTIVE
INACTIVE
PENDING
DRAFT
APPROVED
REJECTED
EXPIRED
OPEN
ASSIGNED
IN_PROGRESS
WAITING
RESOLVED
CLOSED
ESCALATED
FINALIZED
REOPENED
```

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
