/**
 * Shift Form Modal (Create / Edit) — PT. BARAK IOMS
 * Source of Truth: PRD Section 20 & 21 (Attendance shifts).
 */

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function ShiftFormModal({ isOpen, shift, onClose, onSave }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    startTime: '07:00',
    endTime: '15:00',
    durationHours: 8,
    crossesMidnight: false,
    gracePeriodMinutes: 15,
    description: '',
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        code: shift.code || '',
        name: shift.name || '',
        startTime: shift.startTime || '07:00',
        endTime: shift.endTime || '15:00',
        durationHours: shift.durationHours || 8,
        crossesMidnight: !!shift.crossesMidnight,
        gracePeriodMinutes: shift.gracePeriodMinutes || 15,
        description: shift.description || '',
      });
    } else {
      setFormData({
        code: '',
        name: '',
        startTime: '07:00',
        endTime: '15:00',
        durationHours: 8,
        crossesMidnight: false,
        gracePeriodMinutes: 15,
        description: '',
      });
    }
  }, [shift, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama shift wajib diisi.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-scale-up">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {shift ? 'Ubah Shift Kerja' : 'Tambah Shift Operasional Baru'}
            </h2>
            <p className="text-xs text-muted">Konfigurasi jam kerja, durasi, dan toleransi kehadiran.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1">Nama Shift *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              placeholder="Contoh: Shift Pagi Operasional"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Jam Mulai</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Jam Selesai</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Durasi Kerja (Jam)</label>
              <input
                type="number"
                value={formData.durationHours}
                onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value, 10) || 8 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Toleransi Telat (Menit)</label>
              <input
                type="number"
                value={formData.gracePeriodMinutes}
                onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-canvas border border-border flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">Lintas Hari (Crosses Midnight)</p>
              <p className="text-[11px] text-muted">Centang jika shift berakhir keesokan harinya (Shift Malam).</p>
            </div>
            <input
              type="checkbox"
              checked={formData.crossesMidnight}
              onChange={(e) => setFormData({ ...formData, crossesMidnight: e.target.checked })}
              className="h-4 w-4 rounded text-primary-red focus:ring-primary-red"
            />
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">Keterangan / SOP Shift</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Deskripsi tugas dan catatan shift..."
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              Simpan Shift
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
