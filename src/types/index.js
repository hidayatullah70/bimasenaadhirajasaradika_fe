/**
 * Centralized Domain Contracts & Type Definitions — PT. BARAK IOMS
 * Source of Truth: PRD Section 6, 9, 11-18 / Architecture Refactor Step 2.
 */

import { STATUS } from '@/constants/status';

/**
 * 6 Canonical Outsourcing Service Types
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
 * Employee Category
 */
export const EMPLOYEE_TYPE = Object.freeze({
  INTERNAL: 'INTERNAL',
  OUTSOURCING: 'OUTSOURCING',
});

/**
 * Placement Status
 */
export const PLACEMENT_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  ROTATED: 'ROTATED',
  COMPLETED: 'COMPLETED',
  TERMINATED: 'TERMINATED',
});

/**
 * ── 1. EMPLOYEE CONTRACTS ──────────────────────────────────────────────────
 * @typedef {Object} InternalEmployee
 * @property {string} id - Format: BRK-EMP-XXX
 * @property {'INTERNAL'} employeeType
 * @property {string} nik - 16-digit KTP NIK
 * @property {string} fullName
 * @property {'L'|'P'} gender
 * @property {string} email
 * @property {string} phone
 * @property {string} department - HRD, Finance, Legal, Direksi, Operasional, IT Support
 * @property {string} position - Staff, Manager, Kepala Divisi, Direktur
 * @property {string} employmentStatus - TETAP, KONTRAK, PROBATION
 * @property {string} joinDate - YYYY-MM-DD
 * @property {string} bankName
 * @property {string} bankAccountNumber
 * @property {string} npwp
 * @property {string} status - ACTIVE, INACTIVE
 * @property {boolean} [isDeleted]
 */

/**
 * @typedef {Object} OutsourcingEmployee
 * @property {string} id - Format: BRK-EMP-XXX
 * @property {'OUTSOURCING'} employeeType
 * @property {string} nik - 16-digit KTP NIK
 * @property {string} fullName
 * @property {'L'|'P'} gender
 * @property {string} phone
 * @property {string} certification - Gada Pratama, Gada Madya, SIM B1, K3, etc.
 * @property {keyof typeof OUTSOURCING_SERVICES} primarySkill
 * @property {'READY_POOL'|'ASSIGNED'|'ON_LEAVE'|'RESIGNED'} poolStatus
 * @property {string} employmentStatus - KONTRAK, PKWT, MITRA
 * @property {string} joinDate - YYYY-MM-DD
 * @property {string} bankName
 * @property {string} bankAccountNumber
 * @property {string} status - ACTIVE, INACTIVE
 * @property {boolean} [isDeleted]
 */

/**
 * ── 2. CLIENT & SITE CONTRACTS ─────────────────────────────────────────────
 * @typedef {Object} Client
 * @property {string} id - Format: CLI-XXXXXX
 * @property {string} code
 * @property {string} name
 * @property {string} industry - Logistik, Retail, Area Komersial, Perumahan
 * @property {string} address
 * @property {string} city
 * @property {string} picName
 * @property {string} picPhone
 * @property {string} [picEmail]
 * @property {string} status - ACTIVE, INACTIVE, LEAD
 * @property {boolean} [isDeleted]
 */

/**
 * @typedef {Object} SiteLocation
 * @property {string} id - Format: LOC-XXX
 * @property {string} code
 * @property {string} clientId
 * @property {string} [projectId]
 * @property {string} name
 * @property {string} address
 * @property {string} city
 * @property {string} contactPerson
 * @property {string} contactPhone
 * @property {number} manpowerQuota
 * @property {number} [activeManpower]
 * @property {{ lat: number, lng: number }} [coordinates]
 * @property {string} status - ACTIVE, INACTIVE
 * @property {boolean} [isDeleted]
 */

/**
 * ── 3. PLACEMENT CONTRACT (DECOUPLED ASSIGNMENT) ───────────────────────────
 * @typedef {Object} Placement
 * @property {string} id - Format: BRK-ASN-XXX
 * @property {string} placementCode
 * @property {string} employeeId - FK to Employee
 * @property {string} employeeName
 * @property {string} employeeNik
 * @property {string} clientId - FK to Client
 * @property {string} clientName
 * @property {string} locationId - FK to SiteLocation
 * @property {string} locationName
 * @property {string} shiftId - FK to Shift
 * @property {string} shiftName
 * @property {keyof typeof OUTSOURCING_SERVICES} serviceType
 * @property {'Danru'|'Staff'|'Koordinator Lapangan'|'Supervisor'|'Anggota'} roleInUnit
 * @property {string} startDate - YYYY-MM-DD
 * @property {string} endDate - YYYY-MM-DD
 * @property {keyof typeof PLACEMENT_STATUS} status
 * @property {string} assignedBy
 * @property {string} [notes]
 * @property {boolean} [isDeleted]
 */

/**
 * ── 4. OPERATIONAL CONTRACTS ──────────────────────────────────────────────
 * @typedef {Object} Shift
 * @property {string} id - Format: SH-XXX
 * @property {string} code - PAGI, SIANG, MALAM, OFFICE
 * @property {string} name
 * @property {string} startTime - HH:mm
 * @property {string} endTime - HH:mm
 * @property {number} durationHours
 * @property {boolean} crossesMidnight
 * @property {string} status
 */

/**
 * @typedef {Object} AttendanceRecord
 * @property {string} id
 * @property {string} sheetId
 * @property {string} employeeId
 * @property {string} employeeName
 * @property {string} locationId
 * @property {string} shiftId
 * @property {string} date - YYYY-MM-DD
 * @property {string} checkIn - HH:mm
 * @property {string} checkOut - HH:mm
 * @property {'PRESENT'|'LATE'|'ABSENT'|'SICK'|'LEAVE'} status
 * @property {string} [verifiedBy]
 */

/**
 * @typedef {Object} Incident
 * @property {string} id - Format: INC-YYYY-MM-XXX
 * @property {string} incidentNumber
 * @property {string} title
 * @property {string} locationId
 * @property {string} locationName
 * @property {string} clientId
 * @property {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} severity
 * @property {string} date - YYYY-MM-DD
 * @property {string} time - HH:mm
 * @property {string} description
 * @property {'OPEN'|'INVESTIGATION'|'ESCALATED'|'RESOLVED'|'CLOSED'} status
 * @property {string} reportedBy
 * @property {string} [escalatedTo]
 * @property {string} [resolutionNotes]
 * @property {boolean} [isDeleted]
 */

/**
 * @typedef {Object} ReplacementRequest
 * @property {string} id - Format: REP-YYYY-MM-XXX
 * @property {string} requestNumber
 * @property {string} locationId
 * @property {string} locationName
 * @property {string} clientId
 * @property {string} originalEmployeeId
 * @property {string} originalEmployeeName
 * @property {string} replacementEmployeeId
 * @property {string} replacementEmployeeName
 * @property {string} reason
 * @property {string} dateFrom
 * @property {string} dateTo
 * @property {'PENDING'|'APPROVED'|'REJECTED'|'COMPLETED'} status
 * @property {boolean} [isDeleted]
 */

/**
 * ── 5. FINANCE CONTRACTS ──────────────────────────────────────────────────
 * @typedef {Object} Invoice
 * @property {string} id - Format: INV-YYYY-MM-XXX
 * @property {string} invoiceNumber
 * @property {string} clientId
 * @property {string} clientName
 * @property {string} billingPeriod
 * @property {number} amount
 * @property {number} taxAmount
 * @property {number} totalAmount
 * @property {string} issueDate
 * @property {string} dueDate
 * @property {'DRAFT'|'PENDING'|'PARTIAL'|'PAID'|'OVERDUE'} status
 * @property {number} [paidAmount]
 * @property {boolean} [isDeleted]
 */

/**
 * @typedef {Object} PayrollPeriod
 * @property {string} id - Format: PAY-YYYY-MM
 * @property {string} periodName
 * @property {number} totalEmployees
 * @property {number} totalGross
 * @property {number} totalDeductions
 * @property {number} totalNet
 * @property {'DRAFT'|'HRD_REVIEW'|'FINANCE_REVIEW'|'DIRECTOR_APPROVAL'|'PROCESSED'} status
 * @property {string} [approvedByDirectorAt]
 */

/**
 * @typedef {Object} CODTransaction
 * @property {string} id
 * @property {string} trackingNumber
 * @property {string} courierId
 * @property {string} courierName
 * @property {string} clientId
 * @property {number} codAmount
 * @property {number} collectedAmount
 * @property {number} variance
 * @property {'COLLECTED'|'RECONCILED'|'DISCREPANCY'|'ESCALATED_LEGAL'|'SETTLED'} status
 */

/**
 * @typedef {Object} Expense
 * @property {string} id - Format: EXP-YYYY-MM-XXX
 * @property {string} category - Operasional, Perlengkapan Satpam, BBM, Konsumsi, Pemeliharaan
 * @property {number} amount
 * @property {string} date
 * @property {string} notes
 * @property {string} recordedBy
 * @property {string} status - PENDING, APPROVED, REJECTED
 */

/**
 * ── 6. LEGAL & MARKETING CONTRACTS ─────────────────────────────────────────
 * @typedef {Object} Contract
 * @property {string} id - Format: CTR-YYYY-XXX
 * @property {string} pksNumber
 * @property {string} clientId
 * @property {string} clientName
 * @property {string} serviceType
 * @property {number} manpowerCount
 * @property {number} monthlyValue
 * @property {string} startDate
 * @property {string} endDate
 * @property {'DRAFT'|'ACTIVE'|'EXPIRING'|'RENEWED'|'TERMINATED'} status
 */

/**
 * @typedef {Object} Lead
 * @property {string} id - Format: LEAD-YYYY-XXX
 * @property {string} leadNumber
 * @property {string} companyName
 * @property {string} picName
 * @property {string} picPhone
 * @property {string} serviceInterested
 * @property {'NEW'|'CONTACTED'|'SURVEY_SCHEDULED'|'QUOTATION_SENT'|'WON'|'LOST'} status
 * @property {number} [estimatedValue]
 */

/**
 * @typedef {Object} Quotation
 * @property {string} id - Format: QUO-YYYY-XXX
 * @property {string} quotationNumber
 * @property {string} leadId
 * @property {string} clientName
 * @property {number} headcount
 * @property {number} unitRate
 * @property {number} totalMonthly
 * @property {string} validUntil
 * @property {'DRAFT'|'SENT'|'ACCEPTED'|'REJECTED'} status
 */

/**
 * ── 7. GOVERNANCE & APPROVAL CONTRACTS ─────────────────────────────────────
 * @typedef {Object} DeleteRequest
 * @property {string} id - Format: DEL-REQ-XXX
 * @property {string} entityType - Employee, Client, Contract, User
 * @property {string} recordId
 * @property {string} recordIdentifier - e.g. "Budi Prasetyo (BRK-EMP-001)"
 * @property {string} reason
 * @property {string} requestedBy
 * @property {string} requestedAt
 * @property {'PENDING'|'APPROVED'|'REJECTED'} status
 * @property {string} [reviewedBy]
 * @property {string} [reviewedAt]
 * @property {string} [reviewNotes]
 */

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id
 * @property {string} timestamp
 * @property {string} actor
 * @property {string} actorId
 * @property {string} action
 * @property {string} module
 * @property {string} entity
 * @property {string} recordId
 * @property {object} [oldValue]
 * @property {object} [newValue]
 */

/**
 * ── 8. IT SUPPORT CONTRACTS ────────────────────────────────────────────────
 * @typedef {Object} ITTicket
 * @property {string} id - Format: TCK-YYYY-XXX
 * @property {string} ticketNumber
 * @property {string} subject
 * @property {string} requester
 * @property {string} department
 * @property {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} priority
 * @property {'OPEN'|'ASSIGNED'|'IN_PROGRESS'|'RESOLVED'|'CLOSED'} status
 * @property {string} [assignedTo]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ITAsset
 * @property {string} id - Format: AST-XXX
 * @property {string} assetTag
 * @property {string} name
 * @property {string} category - Hardware, Network, CCTV, Radio HT, Fingerprint
 * @property {string} assignedLocation
 * @property {'OPERATIONAL'|'MAINTENANCE'|'DECOMMISSIONED'} status
 */
