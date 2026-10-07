/**
 * Assignment List Page — PT. BARAK IOMS
 * Authoritative Personnel Assignment & Placement Master (30 Records).
 * Source of Truth: PRD Section 11.2, 14, 20 / IMPLEMENTATION-PLAN Phase 2.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Search, Plus, MapPin, Building2, Clock, Calendar, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import assignmentAdapter from '@/services/adapters/assignmentAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import locationAdapter from '@/services/adapters/locationAdapter';
import shiftAdapter from '@/services/adapters/shiftAdapter';
import employeeAdapter from '@/services/adapters/employeeAdapter';
import { MOCK_CLIENTS, MOCK_LOCATIONS, MOCK_SHIFTS } from '@/services/mock/mockMasterData';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLES } from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import AssignmentFormModal from './AssignmentFormModal';
import AssignmentDetailModal from './AssignmentDetailModal';
import AssignmentTransferModal from './AssignmentTransferModal';
import toast from 'react-hot-toast';

export default function AssignmentListPage() {
  const { hasPermission, hasRole } = useAuth();
  const canEdit =
    hasRole([ROLES.DIREKTUR, ROLES.OPERASIONAL, ROLES.HRD]) ||
    hasPermission(PERMISSIONS.ASSIGNMENT_EDIT);
  const canCreate =
    hasRole([ROLES.DIREKTUR, ROLES.OPERASIONAL, ROLES.HRD]) ||
    hasPermission(PERMISSIONS.ASSIGNMENT_CREATE);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientId, setClientId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Dynamic relational options
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [locations, setLocations] = useState(MOCK_LOCATIONS);
  const [shifts, setShifts] = useState(MOCK_SHIFTS);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [cRes, lRes, sRes, eRes] = await Promise.all([
          clientAdapter.getClients({ pageSize: 100 }),
          locationAdapter.getLocations({ pageSize: 100 }),
          shiftAdapter.getShifts(),
          employeeAdapter.getEmployees({ pageSize: 100 }),
        ]);
        if (cRes.data && cRes.data.length > 0) setClients(cRes.data);
        if (lRes.data && lRes.data.length > 0) setLocations(lRes.data);
        if (sRes.data && sRes.data.length > 0) setShifts(sRes.data);
        if (eRes.data && eRes.data.length > 0) setEmployees(eRes.data);
      } catch (err) {
        console.warn('Failed to load dynamic options for assignments:', err);
      }
    }
    loadOptions();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [transferringAssignment, setTransferringAssignment] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleOpenDetail = (asn) => {
    setSelectedAssignment(asn);
    setIsDetailModalOpen(true);
  };

  const handleOpenTransfer = (asn) => {
    setTransferringAssignment(asn);
    setIsTransferModalOpen(true);
  };


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assignmentAdapter.getAssignments({
        search,
        clientId,
        locationId,
        shiftId,
        page,
        pageSize: 10,
      });
      if (res.data) {
        setAssignments(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat data penugasan.');
    } finally {
      setLoading(false);
    }
  }, [search, clientId, locationId, shiftId, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      toast.success(`Penugasan ${asn.employeeName} telah diakhiri.`);
      loadData();
    } catch {
      toast.error('Gagal mengakhiri penugasan.');
    }
  };

  const handleSave = async (payload) => {
    try {
      if (editingAssignment) {
        await assignmentAdapter.updateAssignment(editingAssignment.id, payload);
        toast.success(`Penugasan ${payload.employeeName} berhasil diperbarui.`);
      } else {
        await assignmentAdapter.createAssignment(payload);
        toast.success(`Penugasan baru untuk ${payload.employeeName} berhasil disimpan.`);
      }
      setIsModalOpen(false);
      loadData();
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
            {clients.map((c) => (
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
            {locations.map((l) => (
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
            {shifts.map((s) => (
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
        {loading ? (
          <StateLoading message="Memuat 30 data penugasan personel aktif..." />
        ) : assignments.length === 0 ? (
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
                {assignments.map((asn) => (
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
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(asn)}
                          className="px-2 py-1 text-xs rounded border border-border bg-white text-muted hover:text-ink font-medium"
                          title="Lihat Detail Penempatan"
                        >
                          Detail
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(asn)}
                            className="px-2 py-1 text-xs rounded border border-border bg-white text-muted hover:text-ink font-medium"
                            title="Ubah Data Penempatan"
                          >
                            Ubah
                          </button>
                        )}
                        {canEdit && asn.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleOpenTransfer(asn)}
                            className="px-2 py-1 text-xs rounded border border-warning/40 bg-white text-warning hover:bg-warning/10 font-medium"
                            title="Rotasi / Pindahkan Personel ke Klien/Lokasi Lain"
                          >
                            Rotasi
                          </button>
                        )}
                        {canEdit && asn.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleEndAssignment(asn)}
                            className="px-2 py-1 text-xs rounded border border-red-200 bg-white text-error hover:bg-error/10 font-medium"
                            title="Akhiri Penugasan Personel Ini"
                          >
                            Akhiri
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && assignments.length > 0 && (
          <div className="p-3.5 border-t border-border bg-canvas/30 flex items-center justify-between text-xs text-muted">
            <p>
              Menampilkan <span className="font-medium text-ink">{(page - 1) * 10 + 1}</span> -{' '}
              <span className="font-medium text-ink">{Math.min(page * 10, meta.total)}</span> dari{' '}
              <span className="font-medium text-ink">{meta.total}</span> penugasan aktif (30 Otoritatif PRD)
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-7 w-7 p-0 border border-primary-red/50 text-primary-red bg-primary-red/10 hover:bg-primary-red hover:text-white transition-colors disabled:opacity-30 disabled:border-border disabled:text-slate-400 disabled:bg-transparent"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-medium text-ink">
                Halaman {page} dari {meta.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="h-7 w-7 p-0 border border-primary-red/50 text-primary-red bg-primary-red/10 hover:bg-primary-red hover:text-white transition-colors disabled:opacity-30 disabled:border-border disabled:text-slate-400 disabled:bg-transparent"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
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
        employees={employees}
        clients={clients}
        locations={locations}
        shifts={shifts}
      />

      <AssignmentDetailModal
        isOpen={isDetailModalOpen}
        assignment={selectedAssignment}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={canEdit ? handleOpenEdit : undefined}
        onTransfer={canEdit ? handleOpenTransfer : undefined}
      />

      <AssignmentTransferModal
        isOpen={isTransferModalOpen}
        assignment={transferringAssignment}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={loadData}
        clients={clients}
        locations={locations}
        shifts={shifts}
      />
    </div>
  );
}
