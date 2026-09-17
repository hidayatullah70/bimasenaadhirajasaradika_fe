# AGENTS.md

# AI AGENT INSTRUCTIONS

## PT. Bhimasena Adhirajasa Radhika

**Document Status:** Active
**Version:** 2.0
**Architecture:** SOT-Driven Development
**Frontend:** React + Vite + Tailwind CSS
**Database:** MySQL-Compatible Relational Database

---

## 1. PURPOSE

Dokumen ini adalah aturan utama bagi AI Agent/Developer Agent yang mengerjakan project website dan aplikasi internal PT. Bhimasena Adhirajasa Radhika.

Semua implementasi WAJIB mengikuti dokumen SOT (Source of Truth).

AI Agent TIDAK BOLEH membuat keputusan arsitektur, fitur, business logic, database structure, atau UI behavior yang bertentangan dengan SOT.

---

# 2. SOURCE OF TRUTH

Sebelum melakukan coding, AI Agent WAJIB membaca seluruh dokumen berikut:

```text
01-PRD.md
02-USER-FLOW.md
03-UI-GUIDELINE.md
04-API-SPEC.md
05-IMPLEMENTATION-PLAN.md
BUSINESS-RULES.md
DATABASE-SPEC.md
AGENTS.md
```

Prioritas pengambilan keputusan:

```text
AGENTS.md
    ↓
BUSINESS-RULES.md
    ↓
DATABASE-SPEC.md
    ↓
01-PRD.md
    ↓
02-USER-FLOW.md
    ↓
03-UI-GUIDELINE.md
    ↓
04-API-SPEC.md
    ↓
05-IMPLEMENTATION-PLAN.md
```

Jika terjadi konflik antar dokumen, jangan menebak.

STOP → identifikasi konflik → laporkan → minta keputusan/update SOT.

---

# 3. SOT FIRST PRINCIPLE

Gunakan prinsip:

```text
SOT
 ↓
Business Rules
 ↓
Database Rules
 ↓
Architecture
 ↓
Implementation
 ↓
Testing
```

Jangan melakukan:

```text
Coding
 ↓
Menentukan business rules sendiri
 ↓
Mengubah database sendiri
 ↓
Menambahkan fitur
```

Business logic tidak boleh dibuat hanya berdasarkan asumsi AI Agent.

---

# 4. PROJECT OBJECTIVE

Project memiliki dua area utama:

## Public Website

Digunakan untuk memperkenalkan perusahaan kepada calon client, partner, dan publik.

Konten utama:

* Hero
* Company Profile
* Value Proposition
* Services
* Benefits
* Statistics
* Process
* Clients/Portfolio
* Testimonials
* FAQ
* Contact
* Footer

## Internal Application

Digunakan untuk pengelolaan operasional perusahaan.

Role utama:

```text
Direktur
HRD
Finance
Marketing
Operasional
```

---

# 5. COMPANY SERVICES

Project memiliki enam layanan utama:

```text
1. Security / Pengamanan
2. Courier / Ekspedisi Kurir
3. Man Power
4. Cleaning Service
5. Parking / Parkir
6. Loss Prevention
```

Service code harus mengikuti:

```text
security
courier
manpower
cleaning
parking
loss_prevention
```

Jangan membuat service code baru tanpa perubahan SOT.

---

# 6. ROLE & ACCESS CONTROL

Role yang diperbolehkan:

```text
direktur
hrd
finance
marketing
operasional
```

AI Agent WAJIB mengikuti permission matrix pada:

```text
BUSINESS-RULES.md
```

Jangan menentukan permission berdasarkan asumsi.

Frontend hanya mengontrol UX.

Backend/API/database tetap menjadi sumber kebenaran permission dan authorization.

---

# 7. BUSINESS RULES ARE MANDATORY

Semua business logic WAJIB mengikuti:

```text
BUSINESS-RULES.md
```

Contoh aturan yang harus dihormati:

* Email/username user harus unik.
* User inactive tidak boleh login.
* Employee number harus unik.
* Employee inactive/terminated tidak boleh menerima active placement baru.
* Client inactive tidak boleh menerima placement baru.
* Site harus memiliki client.
* Active site harus memiliki active client.
* Placement harus memiliki employee, client, site, dan service.
* Active placement hanya boleh menggunakan entity yang aktif.
* Attendance maksimal satu record per employee + placement + tanggal.
* Invoice number harus unik.
* Invoice yang sudah cancelled tetap dipertahankan sebagai histori.
* Lead pipeline harus dapat diaudit.
* Perubahan data penting harus tercatat dalam activity/audit.

Jika sebuah aturan belum didefinisikan:

```text
JANGAN MENEBak.
```

Laporkan aturan yang belum tersedia.

---

# 8. DATABASE IS CONTRACT

Struktur database WAJIB mengikuti:

```text
DATABASE-SPEC.md
```

Entity utama:

```text
roles
users
employees
clients
sites
services
placements
attendance
invoices
leads
activities
notifications
```

Jangan membuat tabel tambahan untuk fitur baru tanpa persetujuan dan update SOT.

---

# 9. DATABASE RELATIONSHIP

Relasi utama:

```text
roles
  └── users

clients
  ├── sites
  ├── placements
  └── invoices

employees
  ├── placements
  └── attendance

services
  └── placements

sites
  └── placements

placements
  └── attendance

users
  ├── activities
  ├── notifications
  ├── placements.created_by
  ├── attendance.recorded_by
  ├── attendance.updated_by
  ├── invoices.created_by
  └── leads.assigned_to
```

Foreign key dan referential integrity harus mengikuti `DATABASE-SPEC.md`.

---

# 10. DATABASE INTEGRITY

Database/backend adalah sumber kebenaran.

Frontend validation hanya untuk meningkatkan UX.

WAJIB melakukan validation pada backend/API.

Jangan mengandalkan:

```text
React validation
```

sebagai satu-satunya mekanisme keamanan atau business rule.

Contoh:

```text
Frontend:
"Email sudah digunakan"

Backend:
UNIQUE constraint tetap wajib ada.
```

---

# 11. DELETE POLICY

Jangan sembarangan melakukan hard delete terhadap data yang memiliki nilai histori.

Utamakan:

```text
inactive
terminated
cancelled
```

atau mekanisme soft delete jika memang diperlukan.

Historical records harus tetap dapat digunakan untuk:

* audit
* laporan
* histori placement
* histori attendance
* histori invoice
* histori aktivitas

---

# 12. STATUS VALUES

Jangan membuat status baru tanpa update SOT.

## Employee

```text
active
inactive
terminated
```

## Placement

```text
planned
active
ended
cancelled
```

## Attendance

```text
present
absent
late
leave
sick
off
```

## Invoice

```text
draft
issued
partially_paid
paid
overdue
cancelled
```

## Lead

```text
new
contacted
qualified
proposal
won
lost
```

---

# 13. DATE & TIME FORMAT

API date:

```text
YYYY-MM-DD
```

Timestamp:

```text
ISO 8601
```

Contoh:

```text
2026-08-21
```

atau:

```text
2026-08-21T10:30:00+07:00
```

---

# 14. FRONTEND TECHNOLOGY

Gunakan:

```text
React
Vite
Tailwind CSS
```

Gunakan component-based architecture.

Hindari membuat satu file React yang terlalu besar.

Gunakan reusable components.

Contoh:

```text
src/
├── components/
├── layouts/
├── pages/
├── features/
├── services/
├── hooks/
├── utils/
├── data/
├── assets/
├── App.jsx
├── main.jsx
└── index.css
```

Struktur boleh disesuaikan selama tidak bertentangan dengan `IMPLEMENTATION-PLAN.md`.

---

# 15. UI PRINCIPLES

WAJIB mengikuti:

```text
03-UI-GUIDELINE.md
```

Karakter desain:

* Modern
* Professional
* Corporate
* Clean
* Responsive
* Mobile-first
* Accessible
* Consistent
* Reusable

Gunakan design system yang konsisten.

Jangan membuat setiap halaman memiliki style berbeda tanpa alasan.

---

# 16. RESPONSIVE DESIGN

Minimal mendukung:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Gunakan pendekatan:

```text
Mobile First
```

Pastikan:

* navbar responsive
* sidebar responsive
* table responsive
* form responsive
* dashboard responsive
* card responsive
* modal responsive

---

# 17. BRAND COLORS

Gunakan warna brand yang telah ditentukan dalam UI Guideline/SOT.

Warna utama:

```text
Red
Yellow
Green
```

Gunakan neutral colors untuk:

```text
background
surface
border
text
muted text
```

Jangan menggunakan terlalu banyak warna tambahan tanpa alasan desain.

---

# 18. COMPONENT REUSE

Sebelum membuat component baru, cek apakah component serupa sudah tersedia.

Contoh reusable components:

```text
Button
Input
Select
Textarea
Modal
Table
Badge
Card
StatCard
Dropdown
Toast
Alert
Navbar
Sidebar
PageHeader
EmptyState
LoadingState
ErrorState
ConfirmDialog
```

Jangan menduplikasi component yang sama di banyak halaman.

---

# 19. API RULES

API mengikuti:

```text
04-API-SPEC.md
```

Base path:

```text
/api/v1
```

Gunakan JSON.

Authentication menggunakan mekanisme yang didefinisikan pada API specification.

Jangan membuat endpoint baru tanpa alasan yang jelas.

Jika endpoint baru diperlukan:

```text
STOP
↓
cek API-SPEC.md
↓
identifikasi kebutuhan
↓
update SOT jika diperlukan
↓
baru implementasi
```

---

# 20. MOCK DATA

Mock data diperbolehkan untuk tahap frontend development jika backend belum tersedia.

Namun:

```text
Mock Data ≠ Business Truth
```

Mock data harus mengikuti struktur:

```text
DATABASE-SPEC.md
```

dan business logic:

```text
BUSINESS-RULES.md
```

Jangan membuat mock data yang bertentangan dengan database contract.

---

# 21. LOADING / EMPTY / ERROR / SUCCESS

Setiap feature yang mengambil data harus mempertimbangkan:

```text
Loading
Empty
Success
Error
```

Contoh:

```text
Loading → skeleton/spinner
Empty → empty state
Success → data
Error → error message + retry
```

Jangan hanya membuat happy-path UI.

---

# 22. FORM RULES

Semua form harus memiliki:

* Label
* Validation
* Error message
* Loading state
* Success feedback
* Disabled state saat submit
* Clear action

Frontend validation harus mengikuti business rules.

Tetapi backend tetap wajib melakukan validation.

---

# 23. SECURITY

Jangan pernah menyimpan:

```text
Database password
API secret
Private key
Production credential
Real user password
```

di frontend atau Git repository.

Gunakan environment variables.

Contoh:

```text
.env
```

dan pastikan credential sensitif tidak di-commit.

---

# 24. AUTHENTICATION

Authentication harus memperhatikan:

```text
User exists
User active
Credential valid
Role valid
Permission valid
```

User inactive tidak boleh melakukan authentication.

Authorization harus dicek di backend/API, bukan hanya dengan menyembunyikan menu frontend.

---

# 25. AUDIT & ACTIVITY

Perubahan penting harus dapat dilacak.

Minimal mempertimbangkan audit terhadap:

```text
User / Role
Employee
Placement
Attendance correction
Invoice status
Lead changes
Permission changes
```

Activity record minimal memiliki:

```text
actor
action
resource
resource_id
timestamp
before
after
```

Jangan menghapus audit history secara sembarangan.

---

# 26. FINANCIAL DATA

Invoice memiliki status:

```text
draft
issued
partially_paid
paid
overdue
cancelled
```

Status finansial harus authoritative dari backend.

Frontend tidak boleh menentukan sendiri bahwa invoice:

```text
paid
```

tanpa response/API dari backend.

---

# 27. PLACEMENT RULE

Placement menghubungkan:

```text
Employee
+
Client
+
Site
+
Service
```

Placement active hanya dapat dilakukan jika:

```text
Employee = active
Client = active
Site = active
Service = active
```

Employee inactive/terminated tidak boleh mendapatkan active placement baru.

---

# 28. ATTENDANCE RULE

Attendance harus terhubung dengan:

```text
Employee
Placement
Date
```

Tidak boleh ada lebih dari satu attendance record untuk:

```text
employee + placement + attendance_date
```

Perubahan/correction attendance harus dapat diaudit.

---

# 29. LEAD RULE

Lead harus memiliki minimal:

```text
company_name
contact_name
phone/email
source
status
```

Pipeline:

```text
new
↓
contacted
↓
qualified
↓
proposal
↓
won / lost
```

Perubahan pipeline harus dapat diaudit.

---

# 30. OUT OF SCOPE

Jangan mengimplementasikan fitur berikut tanpa perubahan SOT:

```text
Payroll engine
Accounting engine
Biometric integration
Native mobile application
Advanced BI
Inventory management
Procurement
Complex CRM
Automatic WhatsApp backend
```

Jika user meminta fitur out-of-scope:

```text
STOP
↓
identifikasi konflik dengan SOT
↓
jelaskan dokumen yang perlu diperbarui
↓
tunggu approval
↓
baru implementasi
```

---

# 31. NO SCOPE INVENTION

AI Agent tidak boleh:

* Menambahkan fitur hanya karena dianggap bagus.
* Menambahkan tabel hanya karena frontend membutuhkannya.
* Menambahkan role baru.
* Menambahkan service baru.
* Mengubah status enum.
* Mengubah business logic.
* Mengubah API contract.
* Mengubah database relationship.
* Mengubah desain brand secara besar-besaran.

Semua perubahan besar harus berasal dari SOT update.

---

# 32. IMPLEMENTATION ORDER

Urutan implementasi yang direkomendasikan:

```text
1. Read SOT
2. Inspect existing project
3. Setup project foundation
4. Setup design system
5. Build public landing page
6. Build authentication
7. Build application shell
8. Build role-based dashboard
9. Build CRUD modules
10. Connect API
11. Implement validation
12. Implement loading/error/empty states
13. Implement audit behavior
14. QA
15. Build verification
```

---

# 33. BEFORE CODING CHECKLIST

Sebelum coding:

```text
[ ] Read AGENTS.md
[ ] Read PRD
[ ] Read USER FLOW
[ ] Read UI GUIDELINE
[ ] Read API SPEC
[ ] Read IMPLEMENTATION PLAN
[ ] Read BUSINESS RULES
[ ] Read DATABASE SPEC
[ ] Inspect existing project
[ ] Identify affected files
[ ] Identify affected API
[ ] Identify affected database entities
```

Jika salah satu dokumen relevan belum dibaca:

```text
JANGAN langsung coding.
```

---

# 34. BEFORE CREATING DATABASE CHANGE

Sebelum membuat migration/schema change:

```text
[ ] Check DATABASE-SPEC.md
[ ] Check BUSINESS-RULES.md
[ ] Check API-SPEC.md
[ ] Check affected relationships
[ ] Check foreign keys
[ ] Check indexes
[ ] Check status values
[ ] Check migration order
```

Jangan membuat tabel baru hanya untuk mempermudah frontend.

---

# 35. BEFORE CREATING NEW FEATURE

Gunakan checklist:

```text
Apakah fitur ada di PRD?
        ↓
      YA → lanjut
        ↓
      TIDAK
        ↓
Apakah fitur diperlukan untuk implementasi SOT?
        ↓
      YA → dokumentasikan alasan
        ↓
      TIDAK
        ↓
STOP dan minta SOT update
```

---

# 36. CHANGE MANAGEMENT

Jika requirement berubah:

```text
Requirement Change
       ↓
Impact Analysis
       ↓
Update SOT
       ↓
Update affected documents
       ↓
Implementation
       ↓
Testing
```

Minimal cek dampak terhadap:

```text
PRD
USER FLOW
UI GUIDELINE
API SPEC
BUSINESS RULES
DATABASE SPEC
IMPLEMENTATION PLAN
```

---

# 37. CODE QUALITY

Kode harus:

* readable
* maintainable
* reusable
* modular
* predictable
* consistent

Hindari:

* duplicate logic
* magic values
* unnecessary dependencies
* giant components
* inline business logic berlebihan
* hardcoded credentials
* unused code

---

# 38. ERROR HANDLING

Error harus ditangani secara eksplisit.

Minimal:

```text
Network Error
Validation Error
Authentication Error
Authorization Error
Not Found
Server Error
```

UI harus memberikan feedback yang jelas kepada user.

Jangan menampilkan technical stack trace kepada user biasa.

---

# 39. ACCESSIBILITY

Gunakan:

```text
semantic HTML
proper labels
keyboard navigation
visible focus
sufficient contrast
alt text
ARIA hanya jika diperlukan
```

Interactive element harus dapat digunakan dengan keyboard.

---

# 40. PERFORMANCE

Hindari:

* unnecessary re-render
* unnecessary API request
* duplicate fetch
* giant bundle jika dapat dihindari
* loading asset yang tidak diperlukan

Gunakan lazy loading/code splitting jika memang diperlukan.

Jangan melakukan premature optimization yang membuat kode menjadi kompleks.

---

# 41. TESTING

Sebelum menyatakan pekerjaan selesai:

```text
[ ] npm install
[ ] npm run dev
[ ] npm run build
[ ] Check console errors
[ ] Check responsive layout
[ ] Check navigation
[ ] Check forms
[ ] Check loading states
[ ] Check empty states
[ ] Check error states
[ ] Check role access
[ ] Check API integration
[ ] Check database relationships
```

Jika `npm run build` gagal:

```text
PROJECT BELUM SELESAI.
```

---

# 42. REPORTING

Setelah implementasi, AI Agent harus memberikan laporan singkat:

```text
Implemented:
- ...

Changed:
- ...

Files:
- ...

API:
- ...

Database:
- ...

Business Rules:
- ...

Testing:
- ...

Build:
- PASS / FAIL

Remaining:
- ...
```

Jangan mengatakan "selesai" jika masih ada error yang diketahui.

---

# 43. HANDLING UNCERTAINTY

Jika AI Agent tidak mengetahui sesuatu:

```text
JANGAN MENGARANG.
```

Gunakan:

```text
UNKNOWN
```

lalu jelaskan apa yang diperlukan.

Contoh:

```text
UNKNOWN:
Invoice tax calculation belum didefinisikan dalam SOT.

ACTION:
Tidak membuat formula pajak baru.
```

---

# 44. FINAL DEVELOPMENT PRINCIPLE

Seluruh project harus mengikuti:

```text
SOURCE OF TRUTH
       ↓
BUSINESS RULES
       ↓
DATABASE CONTRACT
       ↓
API CONTRACT
       ↓
UI / UX
       ↓
IMPLEMENTATION
       ↓
TESTING
```

Prioritas utama:

```text
Correctness
Consistency
Maintainability
Security
Accessibility
Performance
```

Bukan sekadar membuat UI terlihat bagus.

---

# 45. GOLDEN RULE

> **DO NOT INVENT BUSINESS LOGIC.**
>
> **DO NOT INVENT DATABASE STRUCTURE.**
>
> **DO NOT INVENT API CONTRACTS.**
>
> **DO NOT INVENT FEATURES.**
>
> **FOLLOW THE SOT.**

Jika requirement belum tersedia:

```text
STOP
→ IDENTIFY GAP
→ UPDATE SOT
→ GET APPROVAL
→ IMPLEMENT
→ TEST
```

**SOT First → Business Rule Second → Database Contract Third → Implementation Fourth.**
