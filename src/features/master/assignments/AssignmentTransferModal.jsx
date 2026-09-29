/**
 * Assignment / Placement Transfer Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.2, 13 / Requirement 9.
 * Preserves movement history:
 * - Current placement is updated to ROTATED.
 * - New active placement is created with fresh client/site/shift.
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Building2, MapPin, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import assignmentAdapter from '@/services/adapters/assignmentAdapter';
import toast from 'react-hot-toast';

export default function AssignmentTransferModal({
  isOpen,
  assignment,
  onClose,
  onSuccess,
  clients = [],
  locations = [],
  shifts = [],
}) {
  const [targetClientId, setTargetClientId] = useState('');
  const [targetLocationId, setTargetLocationId] = useState('');
  const [targetShiftId, setTargetShiftId] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [roleInUnit, setRoleInUnit] = useState('Anggota');
  const [transferNotes, setTransferNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clients.length > 0) {
      // Pick first client different from current if possible
      const altClient = clients.find((c) => c.id !== assignment?.clientId) || clients[0];
      setTargetClientId(altClient?.id || '');
    }
    if (shifts.length > 0) {
      setTargetShiftId(shifts[0]?.id || '');
    }
    if (assignment) {
      setRoleInUnit(assignment.roleInUnit || 'Anggota');
    }
  }, [assignment, clients, shifts, isOpen]);

  // Filter locations by chosen target client
  const availableLocations = locations.filter((l) => l.clientId === targetClientId);
  const locationsToDisplay = availableLocations.length > 0 ? availableLocations : locations;

  useEffect(() => {
    if (locationsToDisplay.length > 0) {
      setTargetLocationId(locationsToDisplay[0]?.id || '');
    }
  }, [targetClientId, locationsToDisplay]);

  if (!isOpen || !assignment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const targetClient = clients.find((c) => c.id === targetClientId);
      const targetLoc = locations.find((l) => l.id === targetLocationId);
      const targetShift = shifts.find((s) => s.id === targetShiftId);

      // 1. Mark current placement as ROTATED
      await assignmentAdapter.updateAssignment(assignment.id, {
        status: 'ROTATED',
        endDate: transferDate,
        notes: `${assignment.notes ? assignment.notes + ' | ' : ''}Ditransfer ke ${targetLoc?.name || 'lokasi baru'} pada ${transferDate}. ${transferNotes}`.trim(),
      });

      // 2. Create new active placement preserving employee link
      await assignmentAdapter.createAssignment({
        employeeId: assignment.employeeId,
        employeeName: assignment.employeeName,
        employeeNik: assignment.employeeNik,
        clientId: targetClientId,
        clientName: targetClient?.name || '',
        locationId: targetLocationId,
        locationName: targetLoc?.name || '',
        shiftId: targetShiftId,
        shiftName: targetShift?.name || 'Shift Pagi',
        roleInUnit,
        serviceType: assignment.serviceType || 'security',
        startDate: transferDate,
        endDate: '2026-12-31',
        status: 'ACTIVE',
        notes: `Hasil rotasi dari ${assignment.locationName}. ${transferNotes}`.trim(),
      });

      toast.success(
        `Rotasi berhasil: ${assignment.employeeName} dipindahkan ke ${targetLoc?.name || 'lokasi baru'}.`
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Gagal memproses rotasi penempatan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Rotasi & Transfer Penempatan</h2>
              <p className="text-xs text-muted">Memindahkan personel sambil menjaga riwayat penugasan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Current Placement Summary */}
          <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Penugasan Saat Ini</span>
            <p className="font-semibold text-ink text-sm">{assignment.employeeName}</p>
            <p className="text-muted">
              {assignment.clientName} • {assignment.locationName} ({assignment.shiftName})
            </p>
            <p className="text-[11px] text-warning font-medium">
              Status lama akan diubah menjadi <strong className="font-bold">ROTATED</strong> dan tersimpan di riwayat.
            </p>
          </div>

          {/* Target Destination Fields */}
          <div className="space-y-3 pt-1">
            {/* Target Client */}
            <div className="space-y-1">
              <label className="block font-semibold text-ink">Klien Mitra Baru</label>
              <select
                value={targetClientId}
                onChange={(e) => setTargetClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Location */}
            <div className="space-y-1">
              <label className="block font-semibold text-ink">Lokasi / Site Tujuan Baru</label>
              <select
                value={targetLocationId}
                onChange={(e) => setTargetLocationId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
                required
              >
                {locationsToDisplay.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Shift & Role */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-ink">Shift Baru</label>
                <select
                  value={targetShiftId}
                  onChange={(e) => setTargetShiftId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
                  required
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-ink">Peran / Jabatan Unit</label>
                <input
                  type="text"
                  value={roleInUnit}
                  onChange={(e) => setRoleInUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
                  placeholder="Danru / Anggota"
                  required
                />
              </div>
            </div>

            {/* Effective Transfer Date */}
            <div className="space-y-1">
              <label className="block font-semibold text-ink">Tanggal Efektif Rotasi</label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
                required
              >
              </input>
            </div>

            {/* Transfer Notes */}
            <div className="space-y-1">
              <label className="block font-semibold text-ink">Catatan / Alasan Rotasi</label>
              <textarea
                rows={2}
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="Misal: Penyesuaian kebutuhan operasional klien atau rotasi berkala SOP..."
                className="w-full p-2.5 text-xs rounded-lg border border-border bg-white text-ink"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Simpan & Eksekusi Rotasi</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
