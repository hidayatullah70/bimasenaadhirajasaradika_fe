/**
 * IT Support Tickets Helpdesk Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 16 (IT Support Module: Tickets & SLA), Section 18, Section 22.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  User,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { itAdapter } from '@/services/adapters/itAdapter';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import { STATUS } from '@/constants/status';
import TicketFormModal from './TicketFormModal';
import TicketResolveModal from './TicketResolveModal';

const DEPARTMENTS = [
  { value: '', label: 'Semua Departemen' },
  { value: 'OPERATIONS', label: 'Operasional Lapangan' },
  { value: 'HRD', label: 'Human Resources (HRD)' },
  { value: 'FINANCE', label: 'Keuangan & Penagihan (Finance)' },
  { value: 'LEGAL', label: 'Hukum & Kepatuhan (Legal)' },
  { value: 'MARKETING', label: 'Pemasaran & Penjualan (Marketing)' },
  { value: 'DIRECTOR', label: 'Direksi' },
];

const PRIORITIES = [
  { value: '', label: 'Semua Prioritas' },
  { value: 'CRITICAL', label: 'Kritis (4 Jam)' },
  { value: 'HIGH', label: 'Tinggi (8 Jam)' },
  { value: 'MEDIUM', label: 'Sedang (24 Jam)' },
  { value: 'LOW', label: 'Rendah (48 Jam)' },
];

const STATUSES = [
  { value: '', label: 'Semua Status' },
  { value: STATUS.OPEN, label: 'Baru (Open)' },
  { value: STATUS.ASSIGNED, label: 'Ditugaskan (Assigned)' },
  { value: STATUS.IN_PROGRESS, label: 'Diproses (In Progress)' },
  { value: STATUS.WAITING, label: 'Menunggu Part (Waiting)' },
  { value: STATUS.RESOLVED, label: 'Selesai (Resolved)' },
  { value: STATUS.CLOSED, label: 'Ditutup (Closed)' },
];

export default function TicketListPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.IT_TICKET_CREATE);
  const canResolve = hasPermission(PERMISSIONS.IT_TICKET_RESOLVE);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Expanded row ID
  const [expandedId, setExpandedId] = useState(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itAdapter.getTickets({
        search,
        department,
        priority,
        status,
        page,
        pageSize: 10,
      });
      if (res.data) {
        setTickets(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat daftar tiket IT.');
    } finally {
      setLoading(false);
    }
  }, [search, department, priority, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await itAdapter.updateTicketStatus(ticketId, newStatus);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Status tiket diperbarui menjadi: ${newStatus}`);
      loadData();
    } catch {
      toast.error('Gagal memperbarui status tiket.');
    }
  };

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const isSlaBreached = (deadline, currentStatus) => {
    if (currentStatus === STATUS.RESOLVED || currentStatus === STATUS.CLOSED) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Cari tiket, kendala, pelapor, pos..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Create Button */}
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 self-start md:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Tiket Bantuan</span>
          </Button>
        )}
      </div>

      {/* Tickets Table */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat database tiket bantuan IT Support..." />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Tidak ada tiket yang ditemukan"
            description="Belum ada tiket bantuan kendala teknis yang sesuai dengan kriteria filter Anda."
            actionLabel={canCreate ? 'Buat Tiket Baru' : undefined}
            onAction={canCreate ? () => setIsCreateOpen(true) : undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-muted font-medium">
                  <th className="py-3 px-4">No. Tiket & Subjek</th>
                  <th className="py-3 px-4">Pelapor & Dept</th>
                  <th className="py-3 px-4">Lokasi Posko</th>
                  <th className="py-3 px-4">Prioritas & SLA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Teknisi (Assignee)</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((t) => {
                  const isExpanded = expandedId === t.id;
                  const breached = isSlaBreached(t.slaDeadline, t.status);

                  return (
                    <React.Fragment key={t.id}>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        {/* No Ticket & Subject */}
                        <td className="py-3.5 px-4 max-w-[280px]">
                          <div className="font-semibold text-ink leading-snug line-clamp-2">
                            {t.subject}
                          </div>
                          <div className="text-[11px] text-muted font-mono mt-0.5 flex items-center gap-1.5">
                            <span>{t.ticketNumber}</span>
                            <span>·</span>
                            <span className="text-slate-600">{t.categoryLabel}</span>
                          </div>
                        </td>

                        {/* Requester & Dept */}
                        <td className="py-3.5 px-4">
                          <div className="text-ink font-medium flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span>{t.requester}</span>
                          </div>
                          <div className="text-xs text-muted mt-0.5">
                            {t.departmentLabel || t.department}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-ink flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary-red shrink-0" />
                            <span>{t.locationName}</span>
                          </div>
                        </td>

                        {/* Priority & SLA */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getPriorityBadgeClass(
                              t.priority
                            )}`}
                          >
                            {t.priority}
                          </span>

                          <div className="mt-1 flex items-center gap-1 text-[11px]">
                            {breached ? (
                              <span className="text-rose-700 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>SLA Terlewati!</span>
                              </span>
                            ) : (
                              <span className="text-muted flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(t.slaDeadline).toLocaleDateString('id-ID')}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <Badge status={t.status} />
                          {t.status !== STATUS.RESOLVED && t.status !== STATUS.CLOSED && (
                            <div className="mt-1">
                              <select
                                value={t.status}
                                onChange={(e) => handleStatusChange(t.id, e.target.value)}
                                className="text-[11px] border border-border rounded px-1.5 py-0.5 bg-white text-muted focus:outline-none focus:border-primary-red"
                              >
                                <option value={STATUS.OPEN}>Set: Open</option>
                                <option value={STATUS.ASSIGNED}>Set: Assigned</option>
                                <option value={STATUS.IN_PROGRESS}>Set: In Progress</option>
                                <option value={STATUS.WAITING}>Set: Waiting Part</option>
                              </select>
                            </div>
                          )}
                        </td>

                        {/* Assignee */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-ink font-medium">{t.assignedTo || '-'}</div>
                          <div className="text-[11px] text-muted">
                            {new Date(t.createdAt).toLocaleDateString('id-ID')}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canResolve && t.status !== STATUS.RESOLVED && t.status !== STATUS.CLOSED && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setResolvingTicket(t)}
                                className="text-xs text-accent-green border-accent-green/30 hover:bg-emerald-50 gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Resolve</span>
                              </Button>
                            )}

                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : t.id)}
                              className="p-1.5 text-muted hover:text-ink rounded hover:bg-slate-100 transition-colors"
                              title="Lihat Rincian Kronologi"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-border">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="space-y-3 text-xs">
                              <div>
                                <h5 className="font-semibold text-ink mb-1">
                                  Uraian Deskripsi & Kronologi Gangguan:
                                </h5>
                                <p className="text-slate-700 bg-white p-3 rounded-lg border border-border leading-relaxed">
                                  {t.description}
                                </p>
                              </div>

                              {t.resolution && (
                                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                                  <h5 className="font-semibold text-accent-green flex items-center gap-1.5 mb-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Tindakan Resolusi Teknis (Selesai pada: {t.closedAt ? new Date(t.closedAt).toLocaleString('id-ID') : '-'})</span>
                                  </h5>
                                  <p className="text-emerald-900 leading-relaxed">{t.resolution}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted">
            <div>
              Total: <span className="font-semibold text-ink">{meta.total}</span> tiket (Halaman {meta.page} dari {meta.totalPages || 1})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <TicketFormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={loadData}
        />
      )}

      {resolvingTicket && (
        <TicketResolveModal
          isOpen={Boolean(resolvingTicket)}
          ticket={resolvingTicket}
          onClose={() => setResolvingTicket(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
