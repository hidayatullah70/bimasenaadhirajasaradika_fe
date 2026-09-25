/**
 * Personnel Replacement Form Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Replacement) & Section 18.
 */

import React, { useState } from 'react';
import { UserCheck, X, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ReplacementFormModal({
  isOpen,
  onClose,
  clients,
  locations,
  employees,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    clientId: '',
    locationId: '',
    serviceType: 'security',
    currentEmployeeId: '',
    candidateEmployeeId: '',
    reasonType: 'SICK',
    reason: '',
    requiredDate: new Date().toISOString().slice(0, 10),
    requestedBy: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const filteredLocations = formData.clientId
    ? locations.filter((l) => l.clientId === formData.clientId)
    : locations;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.clientId ||
      !formData.currentEmployeeId ||
      !formData.candidateEmployeeId ||
      !formData.reason.trim()
    ) {
      setError('Klien, Personel Diganti, Kandidat Pengganti, dan Alasan wajib diisi.');
      return;
    }

    if (formData.currentEmployeeId === formData.candidateEmployeeId) {
      setError('Kandidat pengganti tidak boleh sama dengan personel yang digantikan.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const client = clients.find((c) => c.id === formData.clientId);
      const loc = locations.find((l) => l.id === formData.locationId);
      const currentEmp = employees.find((e) => e.id === formData.currentEmployeeId);
      const candEmp = employees.find((e) => e.id === formData.candidateEmployeeId);

      await onSubmit({
        ...formData,
        clientName: client ? client.name : 'Klien Lapangan',
        locationName: loc ? loc.name : 'Pos Lapangan',
        currentEmployeeName: currentEmp ? currentEmp.fullName : formData.currentEmployeeId,
        candidateEmployeeName: candEmp ? candEmp.fullName : formData.candidateEmployeeId,
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal mengajukan pergantian personel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-border overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border flex items-center justify-between bg-primary-red/5 flex-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary-red/10 text-primary-red">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Pengajuan Pergantian Personel</h3>
              <p className="text-xs text-muted">Penggantian personel pos jaga karena sakit, izin, atau rotasi klien</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-primary-red/10 text-primary-red rounded-lg border border-primary-red/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Klien Penempatan <span className="text-primary-red">*</span>
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              >
                <option value="">Pilih Klien</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Lokasi / Pos Penempatan
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Pilih Lokasi Pos</option>
                {filteredLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Personel yang Digantikan <span className="text-primary-red">*</span>
              </label>
              <select
                name="currentEmployeeId"
                value={formData.currentEmployeeId}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              >
                <option value="">Pilih Karyawan Aktif</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.nik})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Kandidat Personel Pengganti <span className="text-primary-red">*</span>
              </label>
              <select
                name="candidateEmployeeId"
                value={formData.candidateEmployeeId}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              >
                <option value="">Pilih Calon Pengganti</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.position || 'Security / Standby'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Kategori Alasan <span className="text-primary-red">*</span>
              </label>
              <select
                name="reasonType"
                value={formData.reasonType}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="SICK">Sakit / Rawat Inap (Surat Dokter)</option>
                <option value="LEAVE">Izin Cuti Resmi</option>
                <option value="MISCONDUCT">Sanksi / Pelanggaran Disiplin</option>
                <option value="CLIENT_REQUEST">Permintaan Klien (Rotasi)</option>
                <option value="OVERTIME">Kebutuhan Tambahan Darurat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Tanggal Mulai Efektif Penggantian <span className="text-primary-red">*</span>
              </label>
              <input
                type="date"
                name="requiredDate"
                value={formData.requiredDate}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Pemohon / Danru / Korlap
              </label>
              <input
                type="text"
                name="requestedBy"
                value={formData.requestedBy}
                onChange={handleChange}
                placeholder="Contoh: Danru Budi / Korlap Hadi"
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Divisi Layanan
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="security">Security Guard</option>
                <option value="kurir">Kurir Logistik</option>
                <option value="cleaning">Cleaning Service</option>
                <option value="parkir">Pengelola Parkir</option>
                <option value="admin">Admin / Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Alasan Penggantian Rinci <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Contoh: Sakit tipus opname 4 hari / Permintaan rotasi penyegaran pos dari klien"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Catatan Serah Terima / Dokumen Pendukung
            </label>
            <textarea
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Nomor surat keterangan sakit, kelengkapan seragam/atribut kandidat..."
              className="w-full text-sm border border-border rounded-lg p-3 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Kirim Pengajuan</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
