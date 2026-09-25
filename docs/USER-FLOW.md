# USER FLOW — PT. BARAK IOMS
Version 1.0

## 1. Prinsip
Single Source of Truth → Workflow → Permission → Auditability → Usability.

## 2. Public → Lead & Visitor Journey

### 2.1 Public Navigation & Quick Search Flow
```text
Public Visitor
├── Navbar Menu (Beranda, Perusahaan, Layanan, Klien & Portfolio, Karir, News, Blog, FAQ, Kontak)
├── Quick Search Keyword Router
│   ├── "keamanan" / "security" / "satpam" → /layanan/security
│   ├── "kurir" / "ekspedisi" / "cod"     → /layanan/kurir
│   ├── "parkir"                          → /layanan/parkir
│   ├── "cleaning" / "bersih"             → /layanan/cleaning-service
│   ├── "karir" / "loker" / "kerja"       → /career
│   ├── "klien" / "portfolio" / "proyek"  → /client
│   ├── "profil" / "tentang" / "direksi"  → /perusahaan/profil
│   └── other queries                     → /news
└── Company Profile Download
    └── Sidebar / Landing CTA → direct download /assets/documents/company-profile-barak.pdf (with cache-bust timestamp)
```

### 2.2 Consultation Inquiry & Direct Contact Flow (/contact)
```text
Visitor navigates to /contact (via Navbar CTA / Menu / Footer)
├── Option 1: Inquiry Form Submission ("Kirim Pesan")
│   ├── Input: Name, Company, Email, Phone, Service, Message
│   ├── Client Validation
│   ├── cmsAdapter.submitInquiry()
│   ├── Success confirmation banner + state reset
│   └── Website Lead record generated in Marketing Queue
│       └── Marketing Lead Qualification → Opportunity → Client
├── Option 2: Direct WhatsApp Channel
│   ├── WhatsApp Konsultasi (0851 2479 9305) → Opens WA chat with Client Relations
│   └── WhatsApp Karir / Pelamar (0851 8784 5044) → Opens WA chat with HR/Recruitment
└── Option 3: Office Location & Navigation
    ├── Interactive Google Maps Embed (PT. BARAK Tangerang)
    └── Clickable Address → Direct Google Maps pin in new tab
```

## 3. Authentication & RBAC
```text
/ops/login
→ authenticate
→ session/token
→ load role
→ load permissions
→ route guard
→ role dashboard
```
Frontend hiding is UX only; backend permission enforcement is mandatory.

## 4. Employee Lifecycle
```text
HRD Employee Create
→ Document Completeness
→ Employment Contract
→ Operations Assignment
→ Attendance Roster
→ Payroll Input
→ Legal Monitoring
→ Mutation / Promotion
→ Offboarding
```
Employee remains one master record.

## 5. Attendance
```text
Select Month
→ Client
→ Location
→ Service
→ Generate Roster from Active Assignment
→ HRD edits Check-in/Check-out only
→ Validate
→ Save Draft
→ Finalize
→ Finance Payroll Summary
→ Operations Billing Validation (if applicable)
```
Finalized sheets require privileged reopen + approval/audit.

## 6. Operations
```text
Client
→ Project
→ Location
→ Post/Area
→ Shift
→ Assignment
→ Attendance / Incident / Replacement
```

## 7. COD
```text
Finance Import/Reconcile
→ Difference
→ Operations Verification
→ Employee Clarification
→ Collection
├─ Settled → Settlement → Closed
└─ Unresolved → Legal Review
              → Applicable Warning/Statement/Somasi
              → Legal Process
              → Resolution
              → Closed
```
System records facts and workflow; it does not infer criminal conduct.

## 8. Payroll
```text
Attendance Finalized
→ Payroll Calculation
→ HRD Review
→ Finance Review
→ Director Approval
→ Processed
```

## 9. Contract Expiry
```text
Contract/Document Expiry Signal
→ HRD Alert
→ Legal Alert
→ Operations Alert
→ Director Alert (severity rule)
```

## 10. Incident
```text
Operations Incident
→ Triage
├─ HRD
├─ Legal if escalated
└─ Director if high priority
→ Resolution
→ Audit
```

## 11. Marketing Handover
```text
Lead
→ Contacted
→ Qualified
→ Opportunity
→ Proposal/Quotation
→ Negotiation
├─ WON → Client + Handover
└─ LOST → Reason + Close
```

## 12. IT Ticket
```text
OPEN
→ ASSIGNED
→ IN_PROGRESS
→ WAITING
→ RESOLVED
→ CLOSED
```
SLA breach creates notification/escalation according to configurable rules.

## 13. Cross-module ownership
| Data | Source of Truth | Consumers |
|---|---|---|
| Employee | HRD | Ops, Finance, Legal |
| Assignment | Operations | HRD, Finance |
| Attendance | HRD | Finance, Operations |
| Client | Operations/Commercial handover | Finance, Marketing, Director |
| Invoice | Finance | Director, Operations |
| COD Transaction | Finance | Operations, Legal |
| Legal Case | Legal | Director |
| Lead | Marketing | Operations, Finance |
| IT Ticket | IT | All departments |
| Website Content | Admin Website | Public site |

## 14. Global UX states
Every async flow: Loading → Success/Empty/Error. Destructive/critical actions require confirmation and audit.
