/**
 * Role constants for PT. BARAK IOMS.
 * These must match the backend role enum exactly.
 * Source of Truth: PRD Section 6 / AGENTS.md
 */

/** @type {Record<string, string>} */
export const ROLES = Object.freeze({
  DIREKTUR: 'DIREKTUR',
  HRD: 'HRD',
  LEGAL: 'LEGAL',
  OPERASIONAL: 'OPERASIONAL',
  FINANCE: 'FINANCE',
  MARKETING: 'MARKETING',
  IT_SUPPORT: 'IT_SUPPORT',
  ADMIN_WEBSITE: 'ADMIN_WEBSITE',
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.DIREKTUR]: 'Direktur',
  [ROLES.HRD]: 'HRD',
  [ROLES.LEGAL]: 'Legal',
  [ROLES.OPERASIONAL]: 'Operasional',
  [ROLES.FINANCE]: 'Finance',
  [ROLES.MARKETING]: 'Marketing',
  [ROLES.IT_SUPPORT]: 'IT Support',
  [ROLES.ADMIN_WEBSITE]: 'Admin Website',
});

/** Default internal route per role after login */
export const ROLE_DEFAULT_ROUTE = Object.freeze({
  [ROLES.DIREKTUR]: '/ops/director',
  [ROLES.HRD]: '/ops/hrd',
  [ROLES.LEGAL]: '/ops/legal',
  [ROLES.OPERASIONAL]: '/ops/operations',
  [ROLES.FINANCE]: '/ops/finance',
  [ROLES.MARKETING]: '/ops/marketing',
  [ROLES.IT_SUPPORT]: '/ops/it',
  [ROLES.ADMIN_WEBSITE]: '/ops/website',
});
