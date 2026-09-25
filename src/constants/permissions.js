/**
 * Centralized permission constants for PT. BARAK IOMS.
 * Source of Truth: PRD Section 19 / RBAC.
 *
 * Frontend permission checks are UX-only.
 * Backend MUST enforce all permissions server-side independently.
 */

export const PERMISSIONS = Object.freeze({
  // --- Employee ---
  EMPLOYEE_VIEW: 'employee.view',
  EMPLOYEE_VIEW_SENSITIVE: 'employee.view_sensitive',
  EMPLOYEE_CREATE: 'employee.create',
  EMPLOYEE_EDIT: 'employee.edit',
  EMPLOYEE_DELETE: 'employee.delete',
  EMPLOYEE_EXPORT: 'employee.export',

  // --- Attendance ---
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_EDIT: 'attendance.edit',
  ATTENDANCE_FINALIZE: 'attendance.finalize',
  ATTENDANCE_REOPEN: 'attendance.reopen',
  ATTENDANCE_EXPORT: 'attendance.export',

  // --- Client & Location ---
  CLIENT_VIEW: 'client.view',
  CLIENT_CREATE: 'client.create',
  CLIENT_EDIT: 'client.edit',
  CLIENT_EXPORT: 'client.export',
  LOCATION_VIEW: 'location.view',
  LOCATION_CREATE: 'location.create',
  LOCATION_EDIT: 'location.edit',

  // --- Operations & Shift ---
  OPERATIONS_VIEW: 'operations.view',
  OPERATIONS_CREATE: 'operations.create',
  OPERATIONS_EDIT: 'operations.edit',
  SHIFT_VIEW: 'shift.view',
  SHIFT_CREATE: 'shift.create',
  SHIFT_EDIT: 'shift.edit',
  ASSIGNMENT_VIEW: 'assignment.view',
  ASSIGNMENT_CREATE: 'assignment.create',
  ASSIGNMENT_EDIT: 'assignment.edit',
  INCIDENT_VIEW: 'incident.view',
  INCIDENT_CREATE: 'incident.create',
  INCIDENT_ESCALATE: 'incident.escalate',

  // --- Finance ---
  INVOICE_VIEW: 'invoice.view',
  INVOICE_CREATE: 'invoice.create',
  INVOICE_EDIT: 'invoice.edit',
  PAYMENT_VIEW: 'payment.view',
  PAYMENT_CREATE: 'payment.create',
  PAYROLL_VIEW: 'payroll.view',
  PAYROLL_CREATE: 'payroll.create',
  PAYROLL_APPROVE: 'payroll.approve',

  // --- COD ---
  COD_VIEW: 'cod.view',
  COD_COLLECT: 'cod.collect',
  COD_ESCALATE: 'cod.escalate',
  COD_SETTLE: 'cod.settle',
  COD_RECONCILE: 'cod.reconcile',

  // --- Legal ---
  LEGAL_CASE_VIEW: 'legal.case.view',
  LEGAL_CASE_CREATE: 'legal.case.create',
  LEGAL_CASE_EDIT: 'legal.case.edit',
  LEGAL_CASE_APPROVE: 'legal.case.approve',
  LEGAL_CASE_CLOSE: 'legal.case.close',
  LEGAL_DOCUMENT_VIEW: 'legal.document.view',
  LEGAL_DOCUMENT_UPLOAD: 'legal.document.upload',
  COMPLIANCE_VIEW: 'compliance.view',
  COMPLIANCE_EDIT: 'compliance.edit',

  // --- Marketing ---
  LEAD_VIEW: 'lead.view',
  LEAD_CREATE: 'lead.create',
  LEAD_EDIT: 'lead.edit',
  OPPORTUNITY_VIEW: 'opportunity.view',
  OPPORTUNITY_CREATE: 'opportunity.create',
  OPPORTUNITY_EDIT: 'opportunity.edit',
  OPPORTUNITY_WIN: 'opportunity.win',
  OPPORTUNITY_LOSS: 'opportunity.loss',

  // --- IT & User Management ---
  IT_TICKET_VIEW: 'it.ticket.view',
  IT_TICKET_CREATE: 'it.ticket.create',
  IT_TICKET_ASSIGN: 'it.ticket.assign',
  IT_TICKET_RESOLVE: 'it.ticket.resolve',
  IT_ASSET_VIEW: 'it.asset.view',
  IT_ASSET_MANAGE: 'it.asset.manage',
  USER_VIEW: 'user.view',
  USER_MANAGE: 'user.manage',

  // --- Website/CMS ---
  CMS_VIEW: 'cms.view',
  CMS_EDIT: 'cms.edit',
  CMS_PUBLISH: 'cms.publish',
  WEBSITE_LEAD_VIEW: 'website.lead.view',

  // --- Cross-cutting ---
  NOTIFICATION_VIEW: 'notification.view',
  AUDIT_LOG_VIEW: 'audit.log.view',
  SEARCH_GLOBAL: 'search.global',
  APPROVAL_VIEW: 'approval.view',
  APPROVAL_ACT: 'approval.act',
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',

  // --- Director only ---
  DIRECTOR_DASHBOARD: 'director.dashboard',
  DIRECTOR_APPROVAL: 'director.approval',
  EXECUTIVE_REPORT: 'executive.report',
});
