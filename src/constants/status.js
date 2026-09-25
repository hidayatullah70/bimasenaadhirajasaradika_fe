/**
 * Centralized status enumerations for PT. BARAK IOMS.
 * Source of Truth: PRD Section 40.
 * Never use raw strings — always reference these constants.
 */

export const STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING: 'WAITING',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  ESCALATED: 'ESCALATED',
  FINALIZED: 'FINALIZED',
  REOPENED: 'REOPENED',
  // Additional domain-specific statuses
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  OPPORTUNITY: 'OPPORTUNITY',
  PROPOSAL: 'PROPOSAL',
  NEGOTIATION: 'NEGOTIATION',
  WON: 'WON',
  LOST: 'LOST',
  EXPIRING: 'EXPIRING',
  TERMINATED: 'TERMINATED',
  REVIEW: 'REVIEW',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  COLLECTED: 'COLLECTED',
  PARTIAL: 'PARTIAL',
  SETTLED: 'SETTLED',
  // Attendance-specific
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  EARLY_LEAVE: 'EARLY_LEAVE',
  PRESENT_PARTIAL: 'PRESENT_PARTIAL',
  ABSENT: 'ABSENT',
  INCOMPLETE: 'INCOMPLETE',
  UNFILLED: 'UNFILLED',
  // Payroll workflow
  HRD_REVIEW: 'HRD_REVIEW',
  FINANCE_REVIEW: 'FINANCE_REVIEW',
  DIRECTOR_APPROVAL: 'DIRECTOR_APPROVAL',
  PROCESSED: 'PROCESSED',
  // Legal case
  INVESTIGATION: 'INVESTIGATION',
  LEGAL_REVIEW: 'LEGAL_REVIEW',
  ACTION: 'ACTION',
  RESOLUTION: 'RESOLUTION',
});

/** Human-readable labels for status values */
export const STATUS_LABELS = Object.freeze({
  [STATUS.ACTIVE]: 'Aktif',
  [STATUS.INACTIVE]: 'Tidak Aktif',
  [STATUS.PENDING]: 'Menunggu',
  [STATUS.DRAFT]: 'Draf',
  [STATUS.APPROVED]: 'Disetujui',
  [STATUS.REJECTED]: 'Ditolak',
  [STATUS.EXPIRED]: 'Kadaluarsa',
  [STATUS.OPEN]: 'Terbuka',
  [STATUS.ASSIGNED]: 'Ditugaskan',
  [STATUS.IN_PROGRESS]: 'Sedang Diproses',
  [STATUS.WAITING]: 'Menunggu',
  [STATUS.RESOLVED]: 'Diselesaikan',
  [STATUS.CLOSED]: 'Ditutup',
  [STATUS.ESCALATED]: 'Dieskalasi',
  [STATUS.FINALIZED]: 'Difinalisasi',
  [STATUS.REOPENED]: 'Dibuka Kembali',
  [STATUS.CONTACTED]: 'Dihubungi',
  [STATUS.QUALIFIED]: 'Dikualifikasi',
  [STATUS.WON]: 'Berhasil',
  [STATUS.LOST]: 'Gagal',
  [STATUS.EXPIRING]: 'Akan Kadaluarsa',
  [STATUS.PRESENT]: 'Hadir',
  [STATUS.LATE]: 'Terlambat',
  [STATUS.ABSENT]: 'Absen',
  [STATUS.PROCESSED]: 'Diproses',
});

/**
 * Status badge color mapping.
 * Never use color alone — always pair with text (see STATUS_LABELS).
 * Returns Tailwind utility classes.
 */
export const STATUS_COLORS = Object.freeze({
  [STATUS.ACTIVE]: 'bg-success/10 text-success ring-1 ring-success/20',
  [STATUS.INACTIVE]: 'bg-muted/10 text-muted ring-1 ring-border',
  [STATUS.PENDING]: 'bg-warning/10 text-warning ring-1 ring-warning/20',
  [STATUS.DRAFT]: 'bg-slate/10 text-slate ring-1 ring-border',
  [STATUS.APPROVED]: 'bg-success/10 text-success ring-1 ring-success/20',
  [STATUS.REJECTED]: 'bg-danger/10 text-danger ring-1 ring-danger/20',
  [STATUS.EXPIRED]: 'bg-danger/10 text-danger ring-1 ring-danger/20',
  [STATUS.EXPIRING]: 'bg-warning/10 text-warning ring-1 ring-warning/20',
  [STATUS.OPEN]: 'bg-info/10 text-info ring-1 ring-info/20',
  [STATUS.ASSIGNED]: 'bg-info/10 text-info ring-1 ring-info/20',
  [STATUS.IN_PROGRESS]: 'bg-primary-yellow/10 text-amber-700 ring-1 ring-primary-yellow/30',
  [STATUS.WAITING]: 'bg-warning/10 text-warning ring-1 ring-warning/20',
  [STATUS.RESOLVED]: 'bg-success/10 text-success ring-1 ring-success/20',
  [STATUS.CLOSED]: 'bg-slate/10 text-slate ring-1 ring-border',
  [STATUS.ESCALATED]: 'bg-danger/10 text-danger ring-1 ring-danger/20',
  [STATUS.FINALIZED]: 'bg-success/10 text-success ring-1 ring-success/20',
  [STATUS.REOPENED]: 'bg-warning/10 text-warning ring-1 ring-warning/20',
  [STATUS.WON]: 'bg-success/10 text-success ring-1 ring-success/20',
  [STATUS.LOST]: 'bg-danger/10 text-danger ring-1 ring-danger/20',
  [STATUS.PRESENT]: 'bg-success/10 text-success ring-1 ring-success/20',
  [STATUS.LATE]: 'bg-warning/10 text-warning ring-1 ring-warning/20',
  [STATUS.ABSENT]: 'bg-danger/10 text-danger ring-1 ring-danger/20',
  [STATUS.PROCESSED]: 'bg-success/10 text-success ring-1 ring-success/20',
});
