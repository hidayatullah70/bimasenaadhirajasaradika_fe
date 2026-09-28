/**
 * Personnel Replacement List Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Replacement) & Section 18 (Cross-department workflow).
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  UserX,
  Building2,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import replacementAdapter from '@/services/adapters/replacementAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import locationAdapter from '@/services/adapters/locationAdapter';
import employeeAdapter from '@/services/adapters/employeeAdapter';
import { MOCK_REPLACEMENTS } from '@/services/mock/mockOperationsData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ReplacementFormModal from './ReplacementFormModal';
import { STATUS } from '@/constants/status';

export default function ReplacementListPage() {
  // Authoritative persistent state with MOCK_REPLACEMENTS as initial fallback
  const [replacements, setReplacements] = useLocalStorage('barak_replacements', MOCK_REPLACEMENTS);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  // Modals & Action States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [clientRes, locRes, empRes] = await Promise.all([
          clientAdapter.getClients({ pageSize: 50 }),
          locationAdapter.getLocations({ pageSize: 50 }),
          employeeAdapter.getEmployees({ pageSize: 100 }),
        ]);
        if (clientRes.data) setClients(clientRes.data);
        if (locRes.data) setLocations(locRes.data);
        if (empRes.data) setEmployees(empRes.data);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      }
    };
    loadDropdownData();
  }, []);

  const filteredReplacements = useMemo(() => {
    let result = Array.isArray(replacements) ? replacements : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (rep) =>
          rep.currentEmployeeName?.toLowerCase().includes(q) ||
          rep.candidateEmployeeName?.toLowerCase().includes(q) ||
          rep.locationName?.toLowerCase().includes(q) ||
          rep.clientName?.toLowerCase().includes(q) ||
          rep.reason?.toLowerCase().includes(q) ||
          rep.requestNumber?.toLowerCase().includes(q)
      );
    }
    if (selectedStatus) {
      result = result.filter((rep) => rep.status === selectedStatus);
    }
    if (selectedClient) {
      result = result.filter((rep) => rep.clientId === selectedClient);
    }
    return result;
  }, [replacements, search, selectedStatus, selectedClient]);

  const handleCreateReplacement = async (payload) => {
    try {
      const res = await replacementAdapter.createReplacementRequest(payload);
      const newRep = res?.data || {
        ...payload,
        id: `REP-${Date.now()}`,
        requestNumber: `REP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${((replacements?.length || 0) + 1).toString().padStart(3, '0')}`,
        status: STATUS.PENDING,
        createdAt: new Date().toISOString(),
      };
      setReplacements((prev) => [newRep, ...(Array.isArray(prev) ? prev : [])]);
      toast.success('Pengajuan pergantian personel berhasil dikirim.');
    } catch (err) {
      toast.error(err.message || 'Gagal mengajukan pergantian personel.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await replacementAdapter.approveReplacement(id);
      setReplacements((prev) =>
        Array.isArray(prev)
          ? prev.map((r) =>
              r.id === id ? { ...r, status: STATUS.APPROVED, approvedAt: new Date().toISOString() } : r
            )
          : []
      );
      toast.success('Pengajuan pergantian personel telah disetujui.');
    } catch (err) {
      toast.error(err.message || 'Gagal menyetujui pengajuan.');
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      toast.error('Alasan penolakan wajib diisi.');
      return;
    }
    try {
      await replacementAdapter.rejectReplacement(id, { reason: rejectReason });
      setReplacements((prev) =>
        Array.isArray(prev)
          ? prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: STATUS.REJECTED,
                    rejectionReason: rejectReason,
                    rejectedAt: new Date().toISOString(),
                  }
                : r
            )
          : []
      );
      toast.success('Pengajuan pergantian personel telah ditolak.');
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err.message || 'Gagal menolak pengajuan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary-red" />
            <span>Manajemen Pergantian Personel (Replacement)</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Rotasi personel pos, backup darurat sakit/cuti, dan penempatan kandidat pengganti dari standby pool.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Ajukan Pergantian</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari nomor, nama personel, alasan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Status Persetujuan</option>
                <option value={STATUS.PENDING_APPROVAL}>PENDING_APPROVAL (Menunggu Persetujuan)</option>
                <option value={STATUS.APPROVED}>APPROVED (Disetujui)</option>
                <option value={STATUS.COMPLETED}>COMPLETED (Selesai Bertugas)</option>
                <option value={STATUS.REJECTED}>REJECTED (Ditolak)</option>
              </select>
            </div>

            <div>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Klien</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replacement Table */}
      {filteredReplacements.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pengajuan Pergantian"
          description="Tidak ditemukan berkas permohonan pergantian personel dengan filter saat ini."
        />
      ) : (
        <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-muted uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4">No. Pengajuan / Tgl</th>
                  <th className="py-3 px-4">Klien & Lokasi Pos</th>
                  <th className="py-3 px-4">Personel Saat Ini → Kandidat Pengganti</th>
                  <th className="py-3 px-4">Alasan Pergantian</th>
                  <th className="py-3 px-4">Pemohon</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReplacements.map((rep) => {
                  const isRejecting = rejectingId === rep.id;

                  return (
                    <React.Fragment key={rep.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink block">{rep.requestNumber}</span>
                          <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            Efektif: {rep.requiredDate}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-ink block">{rep.clientName}</span>
                          <span className="text-[11px] text-muted block line-clamp-1">{rep.locationName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-primary-red font-semibold">{rep.currentEmployeeName}</span>
                            <ArrowRight className="h-3 w-3 text-muted flex-none" />
                            <span className="text-accent-green font-semibold">{rep.candidateEmployeeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-ink line-clamp-1">{rep.reason}</p>
                          <span className="text-[10px] uppercase font-bold text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                            {rep.reasonType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-ink">
                          {rep.requestedBy || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge status={rep.status} size="sm" />
                          {rep.approvedBy && (
                            <span className="text-[10px] text-muted block mt-0.5">
                              Disetujui: {rep.approvedBy}
                            </span>
                          )}
                          {rep.rejectedBy && (
                            <span className="text-[10px] text-primary-red block mt-0.5">
                              Ditolak: {rep.rejectedReason || rep.rejectedBy}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {rep.status === STATUS.PENDING_APPROVAL ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApprove(rep.id)}
                                className="p-1.5 text-accent-green hover:bg-accent-green/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                title="Setujui Pergantian"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Setujui</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId(isRejecting ? null : rep.id)}
                                className="p-1.5 text-primary-red hover:bg-primary-red/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                title="Tolak Pengajuan"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted">Telah Diproses</span>
                          )}
                        </td>
                      </tr>

                      {/* Inline Reject Form */}
                      {isRejecting && (
                        <tr className="bg-primary-red/5">
                          <td colSpan={7} className="p-4 border-b border-primary-red/20">
                            <div className="bg-white p-4 rounded-xl border border-primary-red/30 shadow-2xs space-y-3 max-w-xl ml-auto">
                              <h5 className="text-xs font-bold text-ink flex items-center gap-1.5">
                                <XCircle className="h-4 w-4 text-primary-red" />
                                <span>Alasan Penolakan Pengajuan #{rep.requestNumber}</span>
                              </h5>
                              <textarea
                                rows={2}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Tuliskan alasan penolakan (misal: kandidat belum sertifikasi, personel utama masih bisa berdinas)..."
                                className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => {
                                    setRejectingId(null);
                                    setRejectReason('');
                                  }}
                                >
                                  Batal
                                </Button>
                                <Button
                                  size="xs"
                                  variant="danger"
                                  onClick={() => handleReject(rep.id)}
                                >
                                  Konfirmasi Tolak
                                </Button>
                              </div>
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
        </div>
      )}

      {/* Modal Form */}
      <ReplacementFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        clients={clients}
        locations={locations}
        employees={employees}
        onSubmit={handleCreateReplacement}
      />
    </div>
  );
}
