/**
 * Business ID prefix constants.
 * Source of Truth: PRD Section 41.
 */
export const BUSINESS_ID_PREFIX = Object.freeze({
  EMPLOYEE: 'EMP',
  CLIENT: 'CLI',
  PROJECT: 'PRJ',
  LOCATION: 'LOC',
  ASSIGNMENT: 'ASN',
  INVOICE: 'INV',
  PAYROLL: 'PAY',
  COD: 'COD',
  LEGAL_CASE: 'CASE',
  IT_TICKET: 'TCK',
  LEAD: 'LEAD',
  OPPORTUNITY: 'OPP',
});

/**
 * PT. BARAK real client list.
 * Source of Truth: PRD Section 9.
 * Used in development seed; these 18 records are RETAINED in production.
 * Do NOT modify names — these are real client identifiers.
 */
export const REAL_CLIENTS = Object.freeze([
  { id: 'CLI-000001', name: 'JNT LOGISTIK', type: 'Logistik' },
  { id: 'CLI-000002', name: 'PT SURYA DUNIA EXPRESS', type: 'Logistik' },
  { id: 'CLI-000003', name: 'MEGAH JAYA SEMESTA', type: 'Logistik' },
  { id: 'CLI-000004', name: 'MAHARDIKA JAYA LOGISTIK', type: 'Logistik' },
  { id: 'CLI-000005', name: 'SALEMBARAN 99', type: 'Area' },
  { id: 'CLI-000006', name: 'BONA CITY', type: 'Area' },
  { id: 'CLI-000007', name: 'GERAJA ABBHALOVE', type: 'Area' },
  { id: 'CLI-000008', name: 'DROP POINT PAKOJAN', type: 'Drop Point' },
  { id: 'CLI-000009', name: 'DROP POINT KIBIN', type: 'Drop Point' },
  { id: 'CLI-000010', name: 'DROP POINT PASGAD', type: 'Drop Point' },
  { id: 'CLI-000011', name: 'DROP POINT JATIUWUNG', type: 'Drop Point' },
  { id: 'CLI-000012', name: 'DROP POINT WANAKERTA', type: 'Drop Point' },
  { id: 'CLI-000013', name: 'DROP POINT BATU CEPER', type: 'Drop Point' },
  { id: 'CLI-000014', name: 'DROP POINT PINANG CIPONDOH', type: 'Drop Point' },
  { id: 'CLI-000015', name: 'DROP POINT CIBODAH RAYA', type: 'Drop Point' },
  { id: 'CLI-000016', name: 'DROP POINT PANONGAN', type: 'Drop Point' },
  { id: 'CLI-000017', name: 'DROP POINT PIK 2', type: 'Drop Point' },
  { id: 'CLI-000018', name: 'DROP POINT KELAPA DUA', type: 'Drop Point' },
]);

/** PT. BARAK service lines (PRD Section 1) */
export const SERVICE_TYPES = Object.freeze([
  { key: 'security', label: 'Jasa Pengamanan / Security', slug: 'security' },
  { key: 'kurir', label: 'Ekspedisi Kurir', slug: 'kurir' },
  { key: 'parkir', label: 'Parkir', slug: 'parkir' },
  { key: 'cleaning-service', label: 'Cleaning Service', slug: 'cleaning-service' },
  { key: 'man-power', label: 'Man Power', slug: 'man-power' },
  { key: 'loss-prevention', label: 'Loss Prevention', slug: 'loss-prevention' },
]);

/** Notification categories (PRD Section 23) */
export const NOTIFICATION_CATEGORIES = Object.freeze({
  APPROVAL: 'approval',
  DEADLINE: 'deadline',
  CONTRACT_EXPIRY: 'contract_expiry',
  DOCUMENT_EXPIRY: 'document_expiry',
  LEGAL: 'legal',
  COD: 'cod',
  INVOICE_OVERDUE: 'invoice_overdue',
  ATTENDANCE: 'attendance',
  INCIDENT: 'incident',
  IT_TICKET: 'it_ticket',
  WEBSITE_LEAD: 'website_lead',
});

/** Notification severity */
export const NOTIFICATION_SEVERITY = Object.freeze({
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger',
  SUCCESS: 'success',
});

/** Audit action types (PRD Section 22) */
export const AUDIT_ACTIONS = Object.freeze({
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  ARCHIVE: 'ARCHIVE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  PAYMENT: 'PAYMENT',
  LEGAL_STATUS_CHANGE: 'LEGAL_STATUS_CHANGE',
  CASE_CLOSE: 'CASE_CLOSE',
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',
  ATTENDANCE_FINALIZE: 'ATTENDANCE_FINALIZE',
  ATTENDANCE_REOPEN: 'ATTENDANCE_REOPEN',
  COD_SETTLEMENT: 'COD_SETTLEMENT',
  PAYROLL_APPROVE: 'PAYROLL_APPROVE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
});

/** Status Penghasilan Tidak Kena Pajak (PTKP) standar perpajakan Indonesia */
export const PTKP_OPTIONS = Object.freeze([
  { value: 'TK0', label: 'TK0 — Tidak Kawin (0 Tanggungan)' },
  { value: 'TK1', label: 'TK1 — Tidak Kawin (1 Tanggungan)' },
  { value: 'TK2', label: 'TK2 — Tidak Kawin (2 Tanggungan)' },
  { value: 'TK3', label: 'TK3 — Tidak Kawin (3 Tanggungan)' },
  { value: 'K0', label: 'K0 — Kawin (0 Tanggungan)' },
  { value: 'K1', label: 'K1 — Kawin (1 Tanggungan)' },
  { value: 'K2', label: 'K2 — Kawin (2 Tanggungan)' },
  { value: 'K3', label: 'K3 — Kawin (3 Tanggungan)' },
]);
