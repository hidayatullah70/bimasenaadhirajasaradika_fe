/**
 * Audit Log Service Adapter.
 * Interface: getLogs(filters), createLog(entry)
 * Source of Truth: API-SPEC.md Section 12, PRD Section 22.
 * Critical actions must be audited: see AUDIT_ACTIONS constants.
 */

import { isMockMode, apiSuccess } from '@/services/apiClient';
import { AUDIT_ACTIONS } from '@/constants/business';
import restClient from '@/services/apiClient';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const INITIAL_AUDIT_LOGS = [
  {
    id: 'audit-001',
    actor: 'Zaenal Arifin (HRD)',
    actor_id: 'usr-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    action: AUDIT_ACTIONS.ATTENDANCE_FINALIZE || 'ATTENDANCE_FINALIZE',
    module: 'attendance',
    entity: 'AttendanceSheet',
    record_id: 'SHEET-2026-09-001',
    old_value: { status: 'OPEN' },
    new_value: { status: 'FINALIZED' },
    description: 'Finalisasi lembar absensi bulanan periode September 2026',
    ip: '192.168.1.10',
  },
  {
    id: 'audit-002',
    actor: 'Nazi Rinaldi (Finance)',
    actor_id: 'usr-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    action: AUDIT_ACTIONS.COD_SETTLEMENT || 'COD_SETTLEMENT',
    module: 'cod',
    entity: 'CODCase',
    record_id: 'COD-2026-000002',
    old_value: { status: 'OPEN', outstanding_amount: 1500000 },
    new_value: { status: 'SETTLED', outstanding_amount: 0 },
    description: 'Penyelesaian selisih titipan kas COD kurir via kasir',
    ip: '192.168.1.15',
  },
  {
    id: 'audit-003',
    actor: 'Juli Priyanto (Direktur)',
    actor_id: 'usr-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    action: AUDIT_ACTIONS.PAYROLL_APPROVE || 'PAYROLL_APPROVE',
    module: 'finance',
    entity: 'Payroll',
    record_id: 'PAY-2026-000001',
    old_value: { status: 'FINANCE_REVIEW' },
    new_value: { status: 'APPROVED' },
    description: 'Otorisasi eksekutif penggajian 40 karyawan PT. BARAK',
    ip: '192.168.1.5',
  },
];

function getAuditStore() {
  return getStoredCollection('barak_audit_logs', () => [...INITIAL_AUDIT_LOGS]);
}

function saveAuditStore(logs) {
  saveStoredCollection('barak_audit_logs', logs);
}

const mockAudit = {
  async getLogs({ module, action, dateFrom, dateTo, search = '', page = 1, limit = 20 } = {}) {
    await new Promise((r) => setTimeout(r, 100));

    let data = [...getAuditStore()];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (l) =>
          (l.actor && l.actor.toLowerCase().includes(q)) ||
          (l.action && l.action.toLowerCase().includes(q)) ||
          (l.module && l.module.toLowerCase().includes(q)) ||
          (l.record_id && l.record_id.toLowerCase().includes(q)) ||
          (l.description && l.description.toLowerCase().includes(q))
      );
    }

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
    const store = getAuditStore();
    const log = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      user: entry.actor || entry.user || 'Sistem PT. BARAK',
      role: entry.role || 'OPERASIONAL',
      description: entry.description || entry.details?.title || `${entry.action} pada ${entry.entity || entry.module}`,
      ...entry,
    };
    saveAuditStore([log, ...store]);
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
