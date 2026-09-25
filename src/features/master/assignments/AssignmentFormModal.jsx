/**
 * Assignment Form Modal (Create / Edit Penugasan) — PT. BARAK IOMS
 * Relational pivot connecting Employee, Client, Location, and Shift.
 * Source of Truth: PRD Section 11.2, 20 & 21.
 */

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MOCK_EMPLOYEES, MOCK_CLIENTS, MOCK_LOCATIONS, MOCK_SHIFTS } from '@/services/mock/mockMasterData';

export default function AssignmentFormModal({ isOpen, assignment, onClose, onSave }) {
  const [formData, setFormData] = useState({
    employeeId: MOCK_EMPLOYEES[0]?.id || '',
    clientId: MOCK_CLIENTS[0]?.id || '',
    locationId: MOCK_LOCATIONS[0]?.id || '',
    shiftId: MOCK_SHIFTS[0]?.id || '',
    roleInUnit: 'Anggota',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    notes: '',
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        employeeId: assignment.employeeId || MOCK_EMPLOYEES[0]?.id || '',
        clientId: assignment.clientId || MOCK_CLIENTS[0]?.id || '',
        locationId: assignment.locationId || MOCK_LOCATIONS[0]?.id || '',
        shiftId: assignment.shiftId || MOCK_SHIFTS[0]?.id || '',
        roleInUnit: assignment.roleInUnit || 'Anggota',
        startDate: assignment.startDate || new Date().toISOString().split('T')[0],
        endDate: assignment.endDate || '2026-12-31',
        notes: assignment.notes || '',
      });
    } else {
      setFormData({
        employeeId: MOCK_EMPLOYEES[0]?.id || '',
        clientId: MOCK_CLIENTS[0]?.id || '',
        locationId: MOCK_LOCATIONS[0]?.id || '',
        shiftId: MOCK_SHIFTS[0]?.id || '',
        roleInUnit: 'Anggota',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2026-12-31',
        notes: '',
      });
    }
  }, [assignment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const empObj = MOCK_EMPLOYEES.find((e) => e.id === formData.employeeId);
    const clientObj = MOCK_CLIENTS.find((c) => c.id === formData.clientId);
    const locObj = MOCK_LOCATIONS.find((l) => l.id === formData.locationId);
    const shiftObj = MOCK_SHIFTS.find((s) => s.id === formData.shiftId);

    const payload = {
      ...formData,
      employeeName: empObj ? empObj.nama_lengkap_sesuai_KTP : '',
      employeeNik: empObj ? empObj.NIK : '',
      clientName: clientObj ? clientObj.name : '',
      locationName: locObj ? locObj.name : '',
      shiftName: shiftObj ? shiftObj.name : '',
      serviceType: empObj ? empObj.jenis_layanan : 'security',
    };

    onSave(payload);
  };

  // Filter locations by chosen client if available
  const availableLocations = MOCK_LOCATIONS.filter((l) => l.clientId === formData.clientId);
  const locationsToDisplay = availableLocations.length > 0 ? availableLocations : MOCK_LOCATIONS;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {assignment ? 'Ubah Penugasan Personel' : 'Penempatan / Assignment Baru'}
            </h2>
            <p className="text-xs text-muted">
              Menghubungkan data personel ke klien, lokasi pos, dan shift kerja resmi.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1">Personel Karyawan *</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              {MOCK_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nama_lengkap_sesuai_KTP} — {emp.id_karyawan} ({emp.jenis_pekerjaan})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Klien Mitra *</label>
              <select
                value={formData.clientId}
                onChange={(e) => {
                  const newClientId = e.target.value;
                  const matchingLoc = MOCK_LOCATIONS.find((l) => l.clientId === newClientId);
                  setFormData({
                    ...formData,
                    clientId: newClientId,
                    locationId: matchingLoc ? matchingLoc.id : formData.locationId,
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {MOCK_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Pos Penempatan / Lokasi *</label>
              <select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {locationsToDisplay.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Shift Kerja *</label>
              <select
                value={formData.shiftId}
                onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {MOCK_SHIFTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Posisi / Peran di Unit</label>
              <select
                value={formData.roleInUnit}
                onChange={(e) => setFormData({ ...formData, roleInUnit: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Anggota">Anggota Regu</option>
                <option value="Danru">Danru (Komandan Regu)</option>
                <option value="Koordinator Lapangan">Koordinator Lapangan</option>
                <option value="Supervisor Pos">Supervisor Pos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Tanggal Mulai Penempatan</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Tanggal Selesai Kontrak Penempatan</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">Catatan Penugasan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Instruksi khusus atau catatan penempatan personel..."
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              Simpan Penugasan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
