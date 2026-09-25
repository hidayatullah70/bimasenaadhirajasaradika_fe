/**
 * Shift List Page — PT. BARAK IOMS
 * Authoritative Shift Master.
 * Source of Truth: PRD Section 20 & 21 / IMPLEMENTATION-PLAN Phase 2.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, Moon, Sun, Sunrise, Building2 } from 'lucide-react';
import shiftAdapter from '@/services/adapters/shiftAdapter';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import ShiftFormModal from './ShiftFormModal';
import toast from 'react-hot-toast';

export default function ShiftListPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.SHIFT_CREATE) || hasPermission(PERMISSIONS.SHIFT_EDIT);

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shiftAdapter.getShifts();
      if (res.data) setShifts(res.data);
    } catch {
      toast.error('Gagal memuat data shift.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editingShift) {
        await shiftAdapter.updateShift(editingShift.id, payload);
        toast.success(`Shift ${payload.name} berhasil diperbarui.`);
      } else {
        await shiftAdapter.createShift(payload);
        toast.success(`Shift ${payload.name} berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Gagal menyimpan shift.');
    }
  };

  const getShiftIcon = (code) => {
    if (code === 'PAGI') return <Sunrise className="h-5 w-5 text-amber-500" />;
    if (code === 'SIANG') return <Sun className="h-5 w-5 text-orange-500" />;
    if (code === 'MALAM') return <Moon className="h-5 w-5 text-indigo-500" />;
    return <Building2 className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-ink">Master Jadwal & Shift Kerja</h2>
          <p className="text-xs text-muted">
            Definisi jam operasional kerja personel lapangan dan kantor untuk pembentukan absensi bulanan.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Shift</span>
          </Button>
        )}
      </div>

      {loading ? (
        <StateLoading message="Memuat shift kerja operasional..." />
      ) : shifts.length === 0 ? (
        <StateEmpty title="Belum ada shift" description="Silakan buat konfigurasi shift pertama." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {shifts.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-border p-5 shadow-xs hover:border-primary-red/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-canvas border border-border">
                    {getShiftIcon(s.code)}
                  </div>
                  <Badge variant={s.crossesMidnight ? 'warning' : 'info'}>
                    {s.durationHours} Jam Kerja
                  </Badge>
                </div>

                <div className="mt-3">
                  <span className="font-mono text-[10px] text-muted">{s.id}</span>
                  <h3 className="text-base font-bold text-ink mt-0.5">{s.name}</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{s.description}</p>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-canvas border border-border space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Jam Kerja:</span>
                    <span className="font-mono font-bold text-ink">
                      {s.startTime} - {s.endTime} WIB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Toleransi Terlambat:</span>
                    <span className="font-medium text-ink">{s.gracePeriodMinutes} Menit</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Lintas Hari:</span>
                    <span className="font-medium text-ink">{s.crossesMidnight ? 'Ya (H+1)' : 'Tidak'}</span>
                  </div>
                </div>
              </div>

              {canManage && (
                <div className="mt-4 pt-3 border-t border-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(s)}
                    className="text-xs font-medium text-primary-red hover:underline"
                  >
                    Ubah Pengaturan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ShiftFormModal
        isOpen={isModalOpen}
        shift={editingShift}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
