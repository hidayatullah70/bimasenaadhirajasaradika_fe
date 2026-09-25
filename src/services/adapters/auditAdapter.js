/**
 * Audit Log Service Adapter.
 * Interface: getLogs(filters), createLog(entry)
 * Source of Truth: API-SPEC.md Section 12, PRD Section 22.
 * Critical actions must be audited: see AUDIT_ACTIONS constants.
 */

import { isMockMode, apiSuccess } from '@/services/apiClient';
import { AUDIT_ACTIONS } from '@/constants/business';
import restClient from '@/services/apiClient';

// In-memory audit log store (mock only)
let mockAuditStore = [
  {
    id: 'audit-001',
    actor: 'Zaenal Arifin (HRD)',
    actor_id: 'usr-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    action: AUDIT_ACTIONS.ATTENDANCE_FINALIZE,
    module: 'attendance',
    entity: 'AttendanceSheet',
    record_id: 'SHEET-2026-09-001',
    old_value: { status: 'OPEN' },
    new_value: { status: 'FINALIZED' },
    ip: '192.168.1.10',
  },
  {
    id: 'audit-002',
    actor: 'Nazi Rinaldi (Finance)',
    actor_id: 'usr-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    action: AUDIT_ACTIONS.COD_SETTLEMENT,
    module: 'cod',
    entity: 'CODCase',
    record_id: 'COD-2026-000002',
    old_value: { status: 'OPEN', outstanding_amount: 1500000 },
    new_value: { status: 'SETTLED', outstanding_amount: 0 },
    ip: '192.168.1.15',
  },
  {
    id: 'audit-003',
    actor: 'Juli Priyanto (Direktur)',
    actor_id: 'usr-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    action: AUDIT_ACTIONS.PAYROLL_APPROVE,
    module: 'finance',
    entity: 'Payroll',
    record_id: 'PAY-2026-000001',
    old_value: { status: 'FINANCE_REVIEW' },
    new_value: { status: 'APPROVED' },
    ip: '192.168.1.5',
  },
];

const mockAudit = {
  async getLogs({ module, action, dateFrom, dateTo, page = 1, limit = 20 } = {}) {
    await new Promise((r) => setTimeout(r, 300));

    let data = [...mockAuditStore];

    if (module) data = data.filter((l) => l.module === module);
    if (action) data = data.filter((l) => l.action === action);
    if (dateFrom) data = data.filter((l) => new Date(l.timestamp) >= new Date(dateFrom));
    if (dateTo) data = data.filter((l) => new Date(l.timestamp) <= new Date(dateTo));

    const total = data.length;
    const start = (page - 1) * limit;
    const paginated = data.slice(start, start + limit);

    return apiSuccess(paginated, { total, page, limit, totalPages: Math.ceil(total / limit) });
  },

  async createLog(entry) {
    // Client-side audit record — sent to backend in REST mode
    const log = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    mockAuditStore.unshift(log);
    return apiSuccess(log);
  },
};

const restAudit = {
  async getLogs(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return restClient.get(`/audit-logs?${params}`);
  },
  async createLog(entry) {
    return restClient.post('/audit-logs', entry);
  },
};

const auditAdapter = isMockMode() ? mockAudit : restAudit;
auditAdapter.getAuditLogs = (filters) => auditAdapter.getLogs(filters);

export { auditAdapter };
export default auditAdapter;
