/**
 * AuditLogPage — read-only audit trail at /ops/audit.
 * Records: actor, timestamp, action, module, entity, record_id, old_value, new_value.
 * Source of Truth: PRD §22 / API-SPEC §12.
 * Permission: PERMISSIONS.AUDIT_LOG_VIEW — enforced on backend too.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/StateViews';
import Badge from '@/components/ui/Badge';
import RequirePermission from '@/app/guards/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { AUDIT_ACTIONS } from '@/constants/business';
import { STATUS } from '@/constants/status';
import auditAdapter from '@/services/adapters/auditAdapter';


const ACTION_LABELS = {
  [AUDIT_ACTIONS.ATTENDANCE_FINALIZE]: 'Finalisasi Absensi',
  [AUDIT_ACTIONS.ATTENDANCE_REOPEN]: 'Buka Kembali Absensi',
  [AUDIT_ACTIONS.COD_SETTLEMENT]: 'Penyelesaian COD',
  [AUDIT_ACTIONS.PAYROLL_APPROVE]: 'Persetujuan Payroll',
  [AUDIT_ACTIONS.LEGAL_STATUS_CHANGE]: 'Perubahan Status Legal',
  [AUDIT_ACTIONS.CASE_CLOSE]: 'Penutupan Kasus',
  [AUDIT_ACTIONS.PERMISSION_CHANGE]: 'Perubahan Izin',
  [AUDIT_ACTIONS.CREATE]: 'Dibuat',
  [AUDIT_ACTIONS.UPDATE]: 'Diperbarui',
  [AUDIT_ACTIONS.DELETE]: 'Dihapus',
  [AUDIT_ACTIONS.ARCHIVE]: 'Diarsipkan',
  [AUDIT_ACTIONS.APPROVE]: 'Disetujui',
  [AUDIT_ACTIONS.REJECT]: 'Ditolak',
  [AUDIT_ACTIONS.PAYMENT]: 'Pembayaran',
  [AUDIT_ACTIONS.LOGIN]: 'Login',
  [AUDIT_ACTIONS.LOGOUT]: 'Logout',
};

const MODULE_OPTIONS = ['attendance', 'finance', 'cod', 'legal', 'hr', 'it', 'operations', 'auth'];

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ module: '', action: '' });
  const [meta, setMeta] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filters.module) params.module = filters.module;
    if (filters.action) params.action = filters.action;
    const { data, meta: m, error: err } = await auditAdapter.getLogs(params);
    if (err) { setError(err.message); } else { setLogs(data || []); setMeta(m || {}); }
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <RequirePermission permission={PERMISSIONS.AUDIT_LOG_VIEW}>
      <div>
        <PageHeader
          title="Audit Log"
          description="Riwayat tindakan kritis dalam sistem. Hanya baca."
        />

        {/* Filters */}
        <Card className="mb-5">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-muted flex-none" aria-hidden />
              <select
                id="audit-filter-module"
                value={filters.module}
                onChange={(e) => setFilters((f) => ({ ...f, module: e.target.value }))}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/30"
                aria-label="Filter modul"
              >
                <option value="">Semua Modul</option>
                {MODULE_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                id="audit-filter-action"
                value={filters.action}
                onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/30"
                aria-label="Filter aksi"
              >
                <option value="">Semua Aksi</option>
                {Object.keys(AUDIT_ACTIONS).map((k) => (
                  <option key={k} value={AUDIT_ACTIONS[k]}>{ACTION_LABELS[AUDIT_ACTIONS[k]] || k}</option>
                ))}
              </select>
              {meta.total !== undefined && (
                <span className="text-xs text-muted ml-auto">{meta.total} entri</span>
              )}
            </div>
          </CardContent>
        </Card>

        {loading && <LoadingState rows={5} />}
        {error && <ErrorState message={error} retry={load} />}

        {!loading && !error && logs.length === 0 && (
          <EmptyState
            icon={<Shield className="h-8 w-8" />}
            title="Tidak ada log audit"
            description="Belum ada tindakan kritis yang tercatat sesuai filter ini."
          />
        )}

        {!loading && !error && logs.length > 0 && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="Audit log">
                <thead>
                  <tr className="border-b border-border bg-canvas">
                    {['Waktu', 'Aktor', 'Aksi', 'Modul', 'Entitas', 'ID Record'].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-canvas transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted font-mono">
                        {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink truncate max-w-[140px]">{log.actor}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-canvas border border-border text-muted">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{log.entity}</td>
                      <td className="px-4 py-3 text-xs font-mono text-ink">{log.record_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </RequirePermission>
  );
}
