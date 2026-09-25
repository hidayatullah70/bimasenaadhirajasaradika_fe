/**
 * Modal Penyelesaian Tiket Kendala IT (Ticket Resolution) — PT. BARAK IOMS
 * Source of Truth: PRD Section 16 (IT Support Module: Resolution & SLA Closure)
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { itAdapter } from '@/services/adapters/itAdapter';
import { CheckCircle2 } from 'lucide-react';

export default function TicketResolveModal({ isOpen, onClose, ticket, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [sparepartNote, setSparepartNote] = useState('');

  if (!ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionText.trim()) {
      toast.error('Keterangan tindakan resolusi wajib diisi.');
      return;
    }

    const fullResolution = sparepartNote.trim()
      ? `${resolutionText} (Suku Cadang/Part: ${sparepartNote})`
      : resolutionText;

    setLoading(true);
    try {
      const res = await itAdapter.resolveTicket(ticket.id, fullResolution);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`Tiket ${ticket.ticketNumber} resmi diselesaikan (RESOLVED)!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Gagal mencatat resolusi tiket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selesaikan Tiket Kendala IT (Resolve Ticket)"
      description="Catat tindakan teknis perbaikan perangkat atau penanganan sistem untuk menutup tiket bantuan."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner Info Tiket */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-ink flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-accent-green">{ticket.subject}</p>
            <p className="text-muted mt-0.5">
              {ticket.ticketNumber} · Pelapor: {ticket.requester} ({ticket.departmentLabel || ticket.department})
            </p>
            <p className="text-muted">Lokasi: {ticket.locationName}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Uraian Tindakan Perbaikan (Resolution Details) <span className="text-primary-red">*</span>
          </label>
          <textarea
            rows={3}
            value={resolutionText}
            onChange={(e) => setResolutionText(e.target.value)}
            placeholder="Jelaskan langkah teknis yang telah dikerjakan, hasil pengujian, dan status perangkat/sistem saat ini..."
            required
            className="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Catatan Penggantian Komponen / Suku Cadang (Jika Ada)
          </label>
          <input
            type="text"
            value={sparepartNote}
            onChange={(e) => setSparepartNote(e.target.value)}
            placeholder="Contoh: Penggantian Adaptor 12V 1.5A original TP-Link"
            className="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading}
            className="bg-accent-green hover:bg-emerald-600 border-none"
          >
            {loading ? 'Menyimpan...' : 'Konfirmasi Selesai (Resolve)'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
