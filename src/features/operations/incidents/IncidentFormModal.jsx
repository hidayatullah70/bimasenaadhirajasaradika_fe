/**
 * Incident Form Modal — PT. BARAK IOMS
 * Create new incident report from field operations.
 * Source of Truth: PRD Section 13.
 */

import React, { useState } from 'react';
import { AlertTriangle, X, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function IncidentFormModal({ isOpen, onClose, clients, locations, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'security_incident',
    typeLabel: 'Insiden Keamanan',
    severity: 'MEDIUM',
    clientId: '',
    locationId: '',
    reportedBy: '',
    incidentDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    description: '',
    actionTaken: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const filteredLocations = formData.clientId
    ? locations.filter((l) => l.clientId === formData.clientId)
    : locations;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type') {
      const labels = {
        security_incident: 'Insiden Keamanan',
        misconduct: 'Pelanggaran Disiplin',
        accident: 'Kecelakaan Kerja (K3)',
        customer_complaint: 'Komplain Layanan',
        lost_item: 'Barang Temuan / Hilang',
        operational_disruption: 'Gangguan Operasional',
      };
      setFormData((prev) => ({ ...prev, type: value, typeLabel: labels[value] || value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.clientId || !formData.description.trim()) {
      setError('Judul, Klien, dan Deskripsi kejadian wajib diisi.');
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
      setError(err?.message || 'Gagal menyimpan laporan insiden.');
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
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Catat Insiden Lapangan Baru</h3>
              <p className="text-xs text-muted">Dokumentasikan insiden atau anomali keamanan di pos penempatan</p>
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

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Judul / Ringkasan Insiden <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Percobaan pembobolan pagar barat / Selisih paket COD"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Kategori Insiden <span className="text-primary-red">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="security_incident">Insiden Keamanan</option>
                <option value="misconduct">Pelanggaran Disiplin Personel</option>
                <option value="accident">Kecelakaan Kerja (K3)</option>
                <option value="customer_complaint">Komplain Layanan Klien</option>
                <option value="lost_item">Barang Temuan / Kehilangan</option>
                <option value="operational_disruption">Gangguan Operasional / COD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Tingkat Keparahan (Severity) <span className="text-primary-red">*</span>
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="LOW">LOW (Dapat ditangani pos langsung)</option>
                <option value="MEDIUM">MEDIUM (Butuh penanganan korlap/HRD)</option>
                <option value="HIGH">HIGH (Potensi kerugian/tindak pidana)</option>
                <option value="CRITICAL">CRITICAL (Keadaan darurat/direksi)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Klien Terkait <span className="text-primary-red">*</span>
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
                Titik Lokasi / Pos Jaga
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Pilih Lokasi</option>
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
                Pelapor / Personel di Lapangan
              </label>
              <input
                type="text"
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleChange}
                placeholder="Contoh: Danru Budi / Korlap Hadi"
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Waktu Kejadian
              </label>
              <input
                type="text"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleChange}
                placeholder="YYYY-MM-DD HH:mm:ss"
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Kronologi / Deskripsi Kejadian <span className="text-primary-red">*</span>
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan detail waktu, pihak yang terlibat, dan kronologis fakta lapangan..."
              className="w-full text-sm border border-border rounded-lg p-3 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Tindakan Awal yang Sudah Diambil
            </label>
            <textarea
              rows={2}
              name="actionTaken"
              value={formData.actionTaken}
              onChange={handleChange}
              placeholder="Contoh: Pembuatan BAP, pertolongan pertama, penahanan sementara kendaraan ekspedisi..."
              className="w-full text-sm border border-border rounded-lg p-3 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Simpan Laporan Insiden</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
