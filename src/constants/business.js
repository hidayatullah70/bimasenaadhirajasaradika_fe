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

/** PT. BARAK employee & operational service lines (including Head Office) */
export const EMPLOYEE_SERVICE_TYPES = Object.freeze([
  { key: 'head-office', label: 'Head Office (HO)', slug: 'head-office' },
  { key: 'security', label: 'Jasa Pengamanan / Security', slug: 'security' },
  { key: 'kurir', label: 'Ekspedisi Kurir', slug: 'kurir' },
  { key: 'parkir', label: 'Parkir', slug: 'parkir' },
  { key: 'cleaning-service', label: 'Cleaning Service', slug: 'cleaning-service' },
  { key: 'man-power', label: 'Man Power', slug: 'man-power' },
  { key: 'loss-prevention', label: 'Loss Prevention', slug: 'loss-prevention' },
]);

/**
 * Retrieve user-defined custom service lines from local persistence
 */
export function getCustomServices() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('barak_custom_services');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Persist a newly typed service line into local storage
 */
export function saveCustomService(service) {
  if (typeof window === 'undefined' || !service) return null;
  try {
    const label = typeof service === 'string' ? service.trim() : (service.label || '').trim();
    if (!label) return null;
    const key = typeof service === 'object' && service.key
      ? service.key
      : label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const list = getCustomServices();
    const existing = list.find((s) => s.key === key || s.label.toLowerCase() === label.toLowerCase());
    if (!existing) {
      const newEntry = { key, label, slug: key };
      list.push(newEntry);
      localStorage.setItem('barak_custom_services', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('barak_services_updated', { detail: newEntry }));
      return newEntry;
    }
    return existing;
  } catch {
    return null;
  }
}

/**
 * Retrieve all employee service lines (canonical + custom)
 */
export function getAllEmployeeServiceTypes() {
  const custom = getCustomServices();
  const canonicalKeys = new Set(EMPLOYEE_SERVICE_TYPES.map((s) => s.key));
  const uniqueCustom = custom.filter((c) => !canonicalKeys.has(c.key));
  return [...EMPLOYEE_SERVICE_TYPES, ...uniqueCustom];
}

/**
 * Helper to get user-friendly service label from key or slug
 */
export function getServiceLabel(key) {
  if (!key) return '-';
  const allServices = getAllEmployeeServiceTypes();
  const found = allServices.find(
    (s) => s.key === key || s.slug === key || s.label?.toLowerCase() === key?.toLowerCase()
  );
  return found ? found.label : key;
}

/**
 * 6 Canonical Outsourcing Service Types (Requirement 8)
 */
export const OUTSOURCING_SERVICES = Object.freeze({
  SECURITY: 'SECURITY',
  COURIER_EXPEDITION: 'COURIER_EXPEDITION',
  CLEANING_SERVICE: 'CLEANING_SERVICE',
  PARKING: 'PARKING',
  MAN_POWER: 'MAN_POWER',
  LOSS_PREVENTION: 'LOSS_PREVENTION',
});

/**
 * Canonical Service Master Catalog (Requirement 8)
 */
export const SERVICE_MASTER = Object.freeze([
  {
    id: 'SRV-SEC',
    service_type: 'SECURITY',
    code: 'SECURITY',
    name: 'Jasa Pengamanan Fisik / Security',
    label: 'Security & Pengamanan',
    slug: 'security',
    positions: ['Danru', 'Staff', 'Koordinator Lapangan', 'Chief Security'],
    certifications: ['Gada Pratama', 'Gada Madya', 'Gada Utama'],
    status: 'ACTIVE',
  },
  {
    id: 'SRV-EXP',
    service_type: 'COURIER_EXPEDITION',
    code: 'COURIER_EXPEDITION',
    name: 'Ekspedisi Kurir & Drop Point Logistics',
    label: 'Kurir / Ekspedisi',
    slug: 'kurir',
    positions: ['Driver / Kurir', 'Sorter', 'Drop Point Staff', 'Koordinator Drop Point'],
    certifications: ['SIM A', 'SIM B1 Umum', 'SIM C'],
    status: 'ACTIVE',
  },
  {
    id: 'SRV-CLN',
    service_type: 'CLEANING_SERVICE',
    code: 'CLEANING_SERVICE',
    name: 'Cleaning Service & Sanitasi Fasilitas',
    label: 'Cleaning Service',
    slug: 'cleaning-service',
    positions: ['Cleaner Staff', 'Team Leader Cleaning', 'Specialist Cleaner'],
    certifications: ['Basic Housekeeping', 'Chemical Handling K3'],
    status: 'ACTIVE',
  },
  {
    id: 'SRV-PRK',
    service_type: 'PARKING',
    code: 'PARKING',
    name: 'Pengelolaan Parkir & Valet Service',
    label: 'Pengelolaan Parkir',
    slug: 'parkir',
    positions: ['Petugas Parkir', 'Kasir Parkir', 'Supervisor Parkir'],
    certifications: ['Sertifikasi Manajemen Parkir'],
    status: 'ACTIVE',
  },
  {
    id: 'SRV-MPW',
    service_type: 'MAN_POWER',
    code: 'MAN_POWER',
    name: 'Penyedia Tenaga Kerja Alih Daya (Man Power)',
    label: 'Man Power Supply',
    slug: 'man-power',
    positions: ['Admin Operasional', 'Resepsionis', 'Operator Produksi', 'Office Boy/Girl'],
    certifications: ['Service Excellence', 'Sertifikasi K3 Perkantoran'],
    status: 'ACTIVE',
  },
  {
    id: 'SRV-LPR',
    service_type: 'LOSS_PREVENTION',
    code: 'LOSS_PREVENTION',
    name: 'Loss Prevention & Investigasi Internal',
    label: 'Loss Prevention',
    slug: 'loss-prevention',
    positions: ['Loss Prevention Officer', 'Investigator', 'Auditor Lapangan'],
    certifications: ['Gada Madya', 'Fraud & Risk Mitigation'],
    status: 'ACTIVE',
  },
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
