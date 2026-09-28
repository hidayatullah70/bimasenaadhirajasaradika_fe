/**
 * Assignment List Page — PT. BARAK IOMS
 * Authoritative Personnel Assignment & Placement Master (30 Records).
 * Source of Truth: PRD Section 11.2, 14, 20 / IMPLEMENTATION-PLAN Phase 2.
 */

import React, { useState, useMemo } from 'react';
import { UserCheck, Search, Plus, MapPin, Building2, Clock, Calendar, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import assignmentAdapter from '@/services/adapters/assignmentAdapter';
import { MOCK_CLIENTS, MOCK_LOCATIONS, MOCK_SHIFTS, MOCK_ASSIGNMENTS } from '@/services/mock/mockMasterData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLES } from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateEmpty } from '@/components/ui/StateViews';
import AssignmentFormModal from './AssignmentFormModal';
import toast from 'react-hot-toast';

export default function AssignmentListPage() {
  const { hasPermission, hasRole } = useAuth();
  const canEdit = hasRole([ROLES.DIREKTUR, ROLES.HRD]);
  const canCreate = canEdit && hasPermission(PERMISSIONS.ASSIGNMENT_CREATE);

  // Authoritative persistent state with MOCK_ASSIGNMENTS as initial fallback
  const [assignments, setAssignments] = useLocalStorage('barak_assignments', MOCK_ASSIGNMENTS);
  const [search, setSearch] = useState('');
  const [clientId, setClientId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const filteredAssignments = useMemo(() => {
    let result = Array.isArray(assignments) ? assignments : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.employeeName?.toLowerCase().includes(q) ||
          a.locationName?.toLowerCase().includes(q) ||
          a.role?.toLowerCase().includes(q) ||
          a.id?.toLowerCase().includes(q)
      );
    }
    if (clientId) {
      result = result.filter((a) => a.clientId === clientId);
    }
    if (locationId) {
      result = result.filter((a) => a.locationId === locationId);
    }
    if (shiftId) {
      result = result.filter((a) => a.shiftId === shiftId);
    }
    return result;
  }, [assignments, search, clientId, locationId, shiftId]);

  const pageSize = 10;
  const total = filteredAssignments.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const displayedAssignments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, page, pageSize]);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asn) => {
    setEditingAssignment(asn);
    setIsModalOpen(true);
  };

  const handleEndAssignment = async (asn) => {
    if (!window.confirm(`Akhiri penugasan ${asn.employeeName} di ${asn.locationName}?`)) return;
    try {
      await assignmentAdapter.endAssignment(asn.id, 'Rotasi penempatan');
      setAssignments((prev) =>
        Array.isArray(prev)
          ? prev.map((a) => (a.id === asn.id ? { ...a, status: 'ENDED', endDate: new Date().toISOString() } : a))
          : []
      );
      toast.success(`Penugasan ${asn.employeeName} telah diakhiri.`);
    } catch {
      toast.error('Gagal mengakhiri penugasan.');
    }
  };

  const handleSave = async (payload) => {
    try {
      if (editingAssignment) {
        await assignmentAdapter.updateAssignment(editingAssignment.id, payload);
        const updated = { ...editingAssignment, ...payload, updatedAt: new Date().toISOString() };
        setAssignments((prev) => (Array.isArray(prev) ? prev.map((a) => (a.id === editingAssignment.id ? updated : a)) : [updated]));
        toast.success(`Penugasan ${payload.employeeName} berhasil diperbarui.`);
      } else {
        const res = await assignmentAdapter.createAssignment(payload);
        const newAsn = res?.data || {
          ...payload,
          id: `ASN-${((assignments?.length || 0) + 1).toString().padStart(4, '0')}`,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        setAssignments((prev) => [newAsn, ...(Array.isArray(prev) ? prev : [])]);
        toast.success(`Penugasan baru untuk ${payload.employeeName} berhasil disimpan.`);
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Gagal menyimpan penugasan.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari personel, NIK, klien, atau kode penugasan..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Klien</option>
            {MOCK_CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={locationId}
            onChange={(e) => {
              setLocationId(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Lokasi</option>
            {MOCK_LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <select
            value={shiftId}
            onChange={(e) => {
              setShiftId(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Shift</option>
            {MOCK_SHIFTS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {canCreate && (
            <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Penugasan Baru</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        {filteredAssignments.length === 0 ? (
          <StateEmpty
            title="Tidak ada penugasan"
            description="Tidak ada penugasan personel yang sesuai dengan kriteria filter."
            actionLabel={canCreate ? 'Buat Penugasan Baru' : undefined}
            onAction={canCreate ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas/50 border-b border-border text-muted uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Kode</th>
                  <th className="px-4 py-3.5">Personel Karyawan</th>
                  <th className="px-4 py-3.5">Klien Mitra & Pos</th>
                  <th className="px-4 py-3.5">Shift & Posisi</th>
                  <th className="px-4 py-3.5">Periode Penugasan</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedAssignments.map((asn) => (
                  <tr key={asn.id} className="hover:bg-primary-red/5 transition-colors">
                    {/* Kode */}
                    <td className="px-4 py-3 font-mono font-semibold text-primary-red">
                      {asn.assignmentCode}
                    </td>

                    {/* Personel */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{asn.employeeName}</p>
                      <p className="text-[11px] font-mono text-muted">{asn.employeeId} ({asn.employeeNik})</p>
                    </td>

                    {/* Klien & Pos */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted flex-none" />
                        <span className="font-medium text-ink truncate max-w-[170px]">{asn.clientName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted">
                        <MapPin className="h-3 w-3 flex-none" />
                        <span className="truncate max-w-[170px]">{asn.locationName}</span>
                      </div>
                    </td>

                    {/* Shift & Role */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted flex-none" />
                        <span className="font-medium text-ink">{asn.shiftName}</span>
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">{asn.roleInUnit}</p>
                    </td>

                    {/* Periode */}
                    <td className="px-4 py-3 font-mono text-[11px] text-muted">
                      <span>{asn.startDate} s/d {asn.endDate}</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant={asn.status === 'ACTIVE' ? 'success' : 'default'}>
                        {asn.status === 'ACTIVE' ? 'Aktif' : 'Selesai'}
                      </Badge>
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3 text-right">
                      {canEdit ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(asn)}
                            className="px-2.5 py-1 text-xs rounded border border-border bg-white text-muted hover:text-ink font-medium"
                          >
                            Ubah
                          </button>
                          {asn.status === 'ACTIVE' && (
                            <button
                              type="button"
                              onClick={() => handleEndAssignment(asn)}
                              className="px-2 py-1 text-xs rounded border border-red-200 bg-white text-error hover:bg-error/10 font-medium"
                              title="Rotasi / Selesai Penugasan"
                            >
                              Akhiri
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted text-xs font-mono">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredAssignments.length > 0 && (
          <div className="p-3.5 border-t border-border bg-canvas/30 flex items-center justify-between text-xs text-muted">
            <p>
              Menampilkan <span className="font-medium text-ink">{(page - 1) * pageSize + 1}</span> -{' '}
              <span className="font-medium text-ink">{Math.min(page * pageSize, total)}</span> dari{' '}
              <span className="font-medium text-ink">{total}</span> penugasan personel
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-medium text-ink">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AssignmentFormModal
        isOpen={isModalOpen}
        assignment={editingAssignment}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
