# API-SPEC — PT. BARAK IOMS
Version 1.0

## 1. Contract
Base URL: `/api/v1`
JSON UTF-8. REST semantics. Auth/session abstraction. IDs are business IDs or UUIDs as implementation dictates.

Standard response:
```json
{"data": {}, "meta": {}, "error": null}
```
Error:
```json
{"data": null, "meta": {}, "error":{"code":"VALIDATION_ERROR","message":"...","fields":{}}}
```

## 2. Auth
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
Backend enforces authentication + RBAC.

## 3. Core Master
- `GET/POST /employees`
- `GET/PATCH/DELETE /employees/:id`
- `GET/POST /clients`
- `GET/PATCH /clients/:id`
- `GET/POST /projects`
- `GET/POST /locations`
- `GET/POST /assignments`
- `GET/POST /shifts`

## 4. Attendance
- `POST /attendance/sheets/generate`
- `GET /attendance/sheets`
- `GET /attendance/sheets/:id`
- `PATCH /attendance/sheets/:id/rows/:rowId`
- `POST /attendance/sheets/:id/validate`
- `POST /attendance/sheets/:id/finalize`
- `POST /attendance/sheets/:id/reopen`
- `GET /attendance/sheets/:id/export`
Rules: roster comes from active assignments; master fields are not editable; finalized sheet is protected.

## 5. Finance
- `GET/POST /invoices`
- `GET/PATCH /invoices/:id`
- `GET/POST /payments`
- `GET /receivables`
- `GET/POST /payroll`
- `POST /payroll/:id/submit`
- `POST /payroll/:id/approve`
- `POST /payroll/:id/process`

## 6. COD
- `GET/POST /cod/transactions`
- `POST /cod/reconcile`
- `GET/POST /cod/cases`
- `GET/PATCH /cod/cases/:id`
- `POST /cod/cases/:id/collection-attempts`
- `POST /cod/cases/:id/settlements`
- `POST /cod/cases/:id/escalate`

## 7. Legal
- `GET/POST /legal/cases`
- `GET/PATCH /legal/cases/:id`
- `GET/POST /legal/cases/:id/actions`
- `GET/POST /legal/documents`
- `GET/POST /legal/compliance`

## 8. Operations
- `GET/POST /incidents`
- `GET/POST /replacement-requests`
- `GET /locations/:id/manpower`
- `GET /assignments`

## 9. Marketing
- `GET/POST /leads`
- `GET/PATCH /leads/:id`
- `GET/POST /opportunities`
- `POST /opportunities/:id/activities`
- `POST /opportunities/:id/win`
- `POST /opportunities/:id/loss`

## 10. IT
- `GET/POST /it/tickets`
- `GET/PATCH /it/tickets/:id`
- `POST /it/tickets/:id/assign`
- `POST /it/tickets/:id/resolve`
- `GET/POST /it/assets`

## 11. CMS & Public Website
- `GET/POST /cms/pages`
- `GET/POST /cms/services`
- `GET/POST /cms/portfolio`
- `GET/POST /cms/news`
- `GET/POST /cms/blog`
- `GET/POST /cms/careers`
- `GET/POST /cms/faq`
- `GET/POST /cms/media`
- `GET/POST /cms/leads`
- `POST /cms/inquiries` (Public inquiry & consultation submission: `name`, `company`, `email`, `phone`, `service`, `message` -> automatically creates lead in Marketing queue)
- `GET /cms/contact-info` (Public office coordinates, Tangerang address, WhatsApp hotlines, email, social links)
- `GET /cms/documents/company-profile` (Official PT. BARAK Company Profile PDF `/assets/documents/company-profile-barak.pdf`)

## 12. Cross-cutting
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `GET /search?q=`
- `GET /audit-logs`
- `GET /approvals`

## 13. Query conventions
Pagination: `page`, `limit`; filtering via named fields; sorting `sortBy`, `sortOrder`; date ranges use ISO dates.
Permission-sensitive exports require `EXPORT`.

## 14. Validation & security
Validate request schema server-side. Sanitize rich text. Never expose secrets. Mask sensitive employee/financial fields. Soft delete/archive critical business records. Audit critical mutations.

## 15. Transaction boundaries
Attendance finalize, payroll approval, COD settlement, legal closure, permission changes and other critical actions must be atomic and audited.

## 16. Integration contract
Frontend uses service adapters, not direct fetch calls inside feature components:
```text
feature → service adapter → API client → REST API
```
Mock adapter and REST adapter share the same interface.
