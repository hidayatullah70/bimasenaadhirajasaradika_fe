/**
 * ExecutiveActivityPage — Director Audit Trail & Executive Decisions Log
 * Source of Truth: PRD Section 6.1 (Direktur: Executive Activity), Section 22 (Audit Log),
 * Section 39 (Approval), and IMPLEMENTATION-PLAN Phase 10.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  History, Search, ShieldCheck, RefreshCw, FileText,
  CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import directorAdapter from '@/services/adapters/directorAdapter';
import toast from 'react-hot-toast';

export default function ExecutiveActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await directorAdapter.getDirectorAuditLogs();
      if (res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load director audit logs', err);
      toast.error('Gagal memuat rekam jejak aktivitas Direktur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.entity && log.entity.toLowerCase().includes(q)) ||
      (log.entityId && log.entityId.toLowerCase().includes(q)) ||
      (log.actorName && log.actorName.toLowerCase().includes(q)) ||
      (log.module && log.module.toLowerCase().includes(q)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <History className="h-5 w-5 text-primary-red" />
            Rekam Jejak Otoritas & Log Keputusan Direktur
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Audit trail immutable mencatat seluruh keputusan persetujuan, penolakan, dan pengesahan berkas oleh Direksi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Muat Ulang Log
          </Button>
        </div>
      </div>

      {/* Filter and Table */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari aksi, entitas, atau kata kunci keputusan..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary-red"
              />
            </div>
            <span className="text-xs text-muted">
              {filteredLogs.length} catatan aktivitas eksekutif ditemukan
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              <RefreshCw className="h-6 w-6 text-primary-red animate-spin mx-auto mb-2" />
              Mengambil audit log eksekutif...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              Belum ada log keputusan eksekutif yang sesuai pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-muted uppercase text-2xs tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Waktu & Tanggal</th>
                    <th className="px-4 py-3 font-semibold">Aksi Otoritas</th>
                    <th className="px-4 py-3 font-semibold">Modul & Entitas</th>
                    <th className="px-4 py-3 font-semibold">Aktor / Pejabat</th>
                    <th className="px-4 py-3 font-semibold">Rincian Keputusan & Parameter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => {
                    const isApproval = log.action && log.action.includes('APPROVE');
                    const isReject = log.action && log.action.includes('REJECT');

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted font-mono">
                          {new Date(log.timestamp).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-bold ${
                              isApproval
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isReject
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {isApproval ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : isReject ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <ShieldCheck className="h-3 w-3" />
                            )}
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                          <span className="font-semibold text-ink">{log.module}</span>
                          <p className="text-2xs text-muted font-mono mt-0.5">
                            {log.entity} #{log.entityId}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                          <p className="font-semibold text-ink">{log.actorName || 'Juli Priyanto'}</p>
                          <span className="text-2xs px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                            {log.actorRole || 'DIREKTUR'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink max-w-md">
                          {log.details ? (
                            <div className="space-y-0.5 bg-slate-50 p-2 rounded border border-slate-200 font-mono text-2xs">
                              {Object.entries(log.details).map(([k, v]) => (
                                <div key={k} className="truncate">
                                  <span className="text-muted">{k}:</span>{' '}
                                  <span className="font-semibold text-ink">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
