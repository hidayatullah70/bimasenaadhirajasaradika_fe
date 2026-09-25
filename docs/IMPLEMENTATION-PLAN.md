# IMPLEMENTATION-PLAN — PT. BARAK IOMS
Version 1.0

## 0. SOT Rule
Audit first. Reuse before rewrite. Data integrity > workflow > RBAC > usability > UI > performance.

## 1. Phase 0 — Repository Audit
Deliver:
- route inventory
- component inventory
- dependency inventory
- current data/mock inventory
- reusable assets
- technical debt
- mismatch against supplied PRD
- baseline screenshots/preview notes
Gate: no blind rewrite.

## 2. Phase 1 — Foundation
- Tailwind tokens
- React/Vite app shell
- router
- mock auth
- RBAC/permission guards
- notification center
- global search
- audit infrastructure
- service adapter boundary

## 3. Phase 2 — Master Data
Users, roles, employees, clients, projects, locations, shifts, assignments.
Gate: no duplicate master records.

## 4. Phase 3 — HRD
Employee master, documents, contracts, monthly attendance spreadsheet, roster generation, validation/finalization, export, payroll input.
Gate: HRD can edit only check-in/out in finalized roster workflow.

## 5. Phase 4 — Operations
Client/project/location, manpower requirement, assignment, shifts, incidents, replacement, field reports.

## 6. Phase 5 — Finance
Invoice, payment, receivable, payroll, COD import/reconciliation.

## 7. Phase 6 — Legal
Employee legal, contracts, compliance, COD case, collection, legal case, documents, expiry.

## 8. Phase 7 — Marketing
Leads, opportunities, activities, proposal/quotation, tender/RFP, won/lost, handover.

## 9. Phase 8 — IT
Tickets, SLA, assets, maintenance, monitoring.

## 10. Phase 9 — Website CMS & Public Landing Experience
- Pages, services, portfolio, news, blog, careers, FAQ, media, SEO, lead capture.
- Landing page baseline audited and elevated with unified brand tokens:
  - **Public Navbar**: Responsive layout synchronized at `lg` (1024px) for desktop navigation, Quick Search, and Hubungi Kami CTA button; mobile drawer for `< 1024px`.
  - **Dedicated Contact Page (`/contact`)**: 2-column layout with interactive consultation inquiry form (connected to `cmsAdapter.submitInquiry()` and marketing queue), verified PT. BARAK Tangerang Google Maps embed, direct Google Maps link, and dual WhatsApp channels.
  - **Standardized Dark Hero Headers (`bg-ink py-20`)**: Applied across Profil Perusahaan, Layanan, Klien, Karir, News, Blog, FAQ with left-aligned padding (`w-full px-4 sm:px-6 lg:px-8`) matching navbar brand logo.
  - **Unified Accent Green Badges**: Pill badges styled with `bg-accent-green/20 text-accent-green border border-accent-green/30` across all public landing sections.
  - **Document Distribution**: Direct official PDF download for `/assets/documents/company-profile-barak.pdf` with cache-busting timestamp.
  - **Public Footer**: Synchronized Tangerang office coordinates, Google Maps link, dual WhatsApp numbers (Konsultasi & Karir), 4 social media channels (Facebook, Instagram, TikTok, Twitter with brand-specific hover colors), and developer credit styled with `Orbitron` typography and cyan accent.

## 11. Phase 10 — Director
Aggregate dashboards, approval center, executive reports, risk/alert views.

## 12. Phase 11 — Backend
Node.js + Express.js, MySQL, migrations, seeders, repositories/services/controllers/routes, auth/RBAC, validation, audit, Hoppscotch collection, frontend adapters.

## 13. Phase 12 — Deployment
GitHub → Railway MySQL + Express API → Vercel/agreed frontend host. Configure environment variables and CORS. Smoke test.

## 14. Seed policy
Development minimum from PRD: 40 employees, 8 clients, 12 locations, 30 assignments, 3 months attendance, 12 invoices, 12 COD transactions, 6 COD cases, 6 legal cases, 10 IT tickets, 15 leads, 8 opportunities.
Production retains the 18 supplied real client records and removes dummy employee data.

## 15. Definition of Done
All supplied acceptance criteria pass; critical workflows are traceable; RBAC is enforced server-side; audit records exist; responsive tests pass at 1440/1280/1024/768/390; build/lint/tests pass when configured; no fake-completed feature.

## 16. Execution order
Foundation → Master Data → HRD → Operations → Finance → Legal → Marketing → IT → CMS → Director → Backend integration → Deployment.
Each phase ends with test + review + documented delta.
