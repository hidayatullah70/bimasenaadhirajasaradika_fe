/**
 * Field Patrol Report Form Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Field Reports & Patrol Journal).
 */

import React, { useState } from 'react';
import { ClipboardList, X, Plus, CheckSquare, Square } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function FieldReportFormModal({ isOpen, onClose, clients, locations, onSubmit }) {
  const [formData, setFormData] = useState({
    clientId: '',
    locationId: '',
    shift: 'Shift Malam (23:00 - 07:00)',
    patrolTeam: '',
    observations: '',
    checklist: {
      aparReady: true,
      cctvActive: true,
      gateLocked: true,
      logBookFilled: true,
      lightsOperational: true,
    },
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

  const toggleChecklist = (key) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.patrolTeam.trim() || !formData.observations.trim()) {
      setError('Klien, Tim Patroli, dan Hasil Observasi wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const client = clients.find((c) => c.id === formData.clientId);
      const loc = locations.find((l) => l.id === formData.locationId);

      await onSubmit({
        ...formData,
        clientName: client ? client.name : 'Klien Lapangan',
        locationName: loc ? loc.name : 'Pos Lapangan',
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan jurnal patroli.');
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
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Catat Jurnal Patroli Lapangan</h3>
              <p className="text-xs text-muted">Laporan berkala hasil inspeksi pos jaga dan kesiapan fasilitas pengamanan</p>
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
                Klien Lokasi Jaga <span className="text-primary-red">*</span>
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
                Titik Pos Penugasan
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Pilih Titik Pos</option>
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
                Shift Patroli <span className="text-primary-red">*</span>
              </label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="Shift Pagi (07:00 - 15:00)">Shift Pagi (07:00 - 15:00)</option>
                <option value="Shift Siang (15:00 - 23:00)">Shift Siang (15:00 - 23:00)</option>
                <option value="Shift Malam (23:00 - 07:00)">Shift Malam (23:00 - 07:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Personel Tim Patroli / Danru <span className="text-primary-red">*</span>
              </label>
              <input
                type="text"
                name="patrolTeam"
                value={formData.patrolTeam}
                onChange={handleChange}
                placeholder="Contoh: Danru Budi & Anggota Hendra"
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              />
            </div>
          </div>

          {/* Checklist Pos */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Daftar Periksa Kesiapan Pos & Perimeter (Checklist)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-surface rounded-xl border border-border">
              {[
                { key: 'aparReady', label: 'APAR Siaga & Tidak Kedaluwarsa' },
                { key: 'cctvActive', label: 'Kamera CCTV & DVR Aktif Merekam' },
                { key: 'gateLocked', label: 'Pagar & Gerbang Perimeter Aman' },
                { key: 'logBookFilled', label: 'Buku Mutasi & Buku Tamu Terisi' },
                { key: 'lightsOperational', label: 'Lampu Penerangan Normal' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleChecklist(key)}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs text-left hover:bg-white transition-colors border border-transparent hover:border-border"
                >
                  {formData.checklist[key] ? (
                    <CheckSquare className="h-4 w-4 text-accent-green flex-none" />
                  ) : (
                    <Square className="h-4 w-4 text-muted flex-none" />
                  )}
                  <span className={formData.checklist[key] ? 'text-ink font-medium' : 'text-muted'}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Hasil Observasi & Kondisi Pos <span className="text-primary-red">*</span>
            </label>
            <textarea
              rows={3}
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              placeholder="Jelaskan jumlah putaran patroli perimeter, serah terima alat kerja, dan anomali yang ditemukan..."
              className="w-full text-sm border border-border rounded-lg p-3 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Simpan Jurnal Patroli</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
