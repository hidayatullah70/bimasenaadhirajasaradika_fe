# AGENTS.md — PT. BARAK IOMS
Version 1.0

## Mission
Build PT. BARAK IOMS as an operational system, not a dashboard-only mockup.

## Source of Truth
Primary functional source: `docs/PRD.md`.
Supporting SOT: `docs/USER-FLOW.md`, `docs/UI-GUIDELINE.md`, `docs/API-SPEC.md`, `docs/IMPLEMENTATION-PLAN.md`.
If code and SOT conflict, stop and document the conflict before changing business behavior.

## Non-negotiable
1. Audit existing repository before rewriting.
2. Preserve reusable landing-page code from the supplied Vercel baseline where compatible.
3. Employee, Client, Assignment, Attendance, Invoice, COD, Legal Case, Lead and IT Ticket have one authoritative source.
4. Backend authorization is mandatory; frontend hiding is not security.
5. Critical mutations are audited.
6. Do not invent legal/company policy. Use configurable thresholds and document assumptions.
7. Do not fabricate completed integrations.
8. No secrets in source control.
9. Do not use static KPI numbers when repository/data selectors can calculate them.
10. Keep feature architecture modular; avoid giant components.

## Stack
Frontend: React + Vite + Tailwind CSS.
Typography: Inter (primary system UI) + Orbitron (futuristic accents, developer branding & identifiers).
Brand Tokens: `--primary-red: #BA1D23`, `--primary-yellow: #F9CE3B`, `--accent-green: #32B23E` (replaces generic blue for landing accents/borders), `--ink: #0F172A`.
Backend: Node.js + Express.js.
Database: MySQL.
Local DB: Laragon.
API testing: Hoppscotch.
Hosting target: Vercel/frontend + Railway/backend/MySQL unless project decisions change.

## Coding Rules
- Type-safe interfaces/types where applicable.
- Feature-based frontend structure.
- API calls through service adapters.
- Validate on server and client.
- Loading/empty/error states are required.
- Destructive actions require confirmation.
- Accessible semantic HTML.
- Responsive at 1440/1280/1024/768/390:
  - Public Navbar & Desktop navigation links synchronized at `lg` (1024px); mobile drawer & hamburger below 1024px.
- Centralize status enums and permission constants.
- Prefer small composable components.
- Brand Consistency:
  - Dark hero headers (`bg-ink py-20`) flush with navbar logo (`w-full px-4 sm:px-6 lg:px-8`).
  - Hero pill badges unified to `bg-accent-green/20 text-accent-green border border-accent-green/30`.
  - Authoritative contact details: verified Tangerang office address (clickable to Google Maps), dual WhatsApp channels (Konsultasi & Karir), and official Company Profile PDF download.

## Workflow Rules
Attendance: roster from active assignments; HRD edits time only; finalize locks; reopen requires privileged permission + audit.
COD: Finance reconciliation → Operations verification → collection → Legal escalation when unresolved.
Marketing: Lead → Opportunity → Won → Client → Operations → Finance.
Payroll: Attendance → HRD Review → Finance Review → Director Approval → Processed.

## Verification
Run available:
```bash
npm install
npm run lint
npm run build
npm run test
```
Also test critical role boundaries and cross-module workflows.

## Change Protocol
For every significant change:
1. State affected SOT.
2. Identify impacted modules.
3. Implement smallest coherent change.
4. Test.
5. Update docs if behavior changes.
6. Do not silently alter business rules.
