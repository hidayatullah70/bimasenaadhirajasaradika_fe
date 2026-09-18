import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import {
  Headphones,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  User,
  Building2,
  FileCheck,
  Send,
  AlertTriangle
} from 'lucide-react';

const INITIAL_TICKETS = [
  {
    id: 'TKT-2026-089',
    title: 'Mesin Absensi Biometrik Lobi Barat Gagal Sinkronisasi',
    category: 'Biometric Attendance',
    site: 'PT. Telkom Indonesia Tbk (Landmark Tower)',
    reportedBy: 'Nazi Rinaldi (Operasional)',
    priority: 'high',
    status: 'in_progress',
    createdAt: '18 Sep 2026, 08:30',
    description: 'Data tap kartu dan presensi wajah staf keamanan shift malam tidak masuk ke rekap HRD otomatis.',
    resolutionNotes: 'Sedang dilakukan remote rebooting pada service biometric listener di port 8080.'
  },
  {
    id: 'TKT-2026-088',
    title: 'GPS Patrol Wand Pos 3 Perlu Penggantian Baterai',
    category: 'Hardware & IoT',
    site: 'PT. Mayora Indah Tbk',
    reportedBy: 'Hendrik Gunawan (Chief Security)',
    priority: 'medium',
    status: 'open',
    createdAt: '18 Sep 2026, 09:15',
    description: 'Tongkat patroli RFID mati mendadak setelah putaran pos 3 kemarin malam.',
    resolutionNotes: ''
  },
  {
    id: 'TKT-2026-087',
    title: 'Permintaan Reset Kata Sandi Akun HRD Staf Baru',
    category: 'Portal & User Access',
    site: 'Kantor Pusat PT. BARAK',
    reportedBy: 'Robyn Topani (HRD)',
    priority: 'low',
    status: 'resolved',
    createdAt: '18 Sep 2026, 07:45',
    description: 'Staf admin HRD baru lupa password default portal setelah aktivasi.',
    resolutionNotes: 'Password telah di-reset ke password123 dan panduan keamanan telah dikirimkan via email internal.'
  },
  {
    id: 'TKT-2026-086',
    title: 'Koneksi Router 4G Backup Pos Gerbang Tol Terputus',
    category: 'Network & Connectivity',
    site: 'PT. Gudang Garam Tbk',
    reportedBy: 'Susilo Bambang (Security Leader)',
    priority: 'critical',
    status: 'resolved',
    createdAt: '17 Sep 2026, 21:00',
    description: 'Modem SIM card kehabisan kuota data darurat.',
    resolutionNotes: 'Kuota data darurat 50GB telah di-topup dan router kembali online dengan latensi normal.'
  }
];

export function ItHelpdeskManagement() {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'open', 'in_progress', 'resolved'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [resolutionInput, setResolutionInput] = useState('');
  const [nextStatus, setNextStatus] = useState('resolved');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Biometric Attendance',
    site: '',
    reportedBy: 'Gheril Ramaditya S. (IT Support)',
    priority: 'medium',
    description: ''
  });

  const categoryOptions = [
    { value: 'Biometric Attendance', label: 'Biometrik & Presensi Realtime' },
    { value: 'Hardware & IoT', label: 'Perangkat Keras & IoT (GPS, Wand, NVR)' },
    { value: 'Network & Connectivity', label: 'Jaringan Internet / Router 4G Site' },
    { value: 'Portal & User Access', label: 'Akses Portal Internal & Akun' },
    { value: 'Software Bug / Issue', label: 'Gangguan Aplikasi / Sistem' }
  ];

  const priorityOptions = [
    { value: 'critical', label: 'Critical (Darurat - Operasional Terhenti)' },
    { value: 'high', label: 'High (Tinggi - Segera Ditangani)' },
    { value: 'medium', label: 'Medium (Sedang)' },
    { value: 'low', label: 'Low (Rendah / Rutin)' }
  ];

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.site || !formData.description) {
      addToast('Harap lengkapi judul tiket, site, dan deskripsi.', 'error');
      return;
    }

    const newTicket = {
      id: `TKT-2026-${String(tickets.length + 90).padStart(3, '0')}`,
      ...formData,
      status: 'open',
      createdAt: 'Baru saja',
      resolutionNotes: ''
    };

    setTickets([newTicket, ...tickets]);
    addToast(`Tiket ${newTicket.id} berhasil dibuat dan dialokasikan ke antrean IT Support.`, 'success');
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      category: 'Biometric Attendance',
      site: '',
      reportedBy: 'Gheril Ramaditya S. (IT Support)',
      priority: 'medium',
      description: ''
    });
  };

  const handleOpenDetail = (tkt) => {
    setSelectedTicket(tkt);
    setResolutionInput(tkt.resolutionNotes || '');
    setNextStatus(tkt.status === 'open' ? 'in_progress' : tkt.status === 'in_progress' ? 'resolved' : 'closed');
    setIsDetailModalOpen(true);
  };

  const handleUpdateTicketStatus = () => {
    if (!selectedTicket) return;

    setTickets(prev =>
      prev.map(t => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            status: nextStatus,
            resolutionNotes: resolutionInput || t.resolutionNotes
          };
        }
        return t;
      })
    );

    addToast(`Tiket ${selectedTicket.id} berhasil diperbarui ke status: ${nextStatus.toUpperCase()}`, 'success');
    setIsDetailModalOpen(false);
  };

  const displayedTickets = tickets.filter(t => {
    if (statusFilter === 'open') return t.status === 'open';
    if (statusFilter === 'in_progress') return t.status === 'in_progress';
    if (statusFilter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  const columns = [
    {
      header: 'Tiket & Masalah',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-brand-dark bg-slate-100 px-1.5 py-0.5 rounded">
              {row.id}
            </span>
            <p className="font-bold text-brand-dark text-xs">{row.title}</p>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1">{row.description}</p>
        </div>
      )
    },
    {
      header: 'Lokasi Site / Pelapor',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-slate-800 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[180px]">{row.site}</span>
          </p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            {row.reportedBy}
          </p>
        </div>
      )
    },
    {
      header: 'Prioritas',
      render: (row) => {
        const pMap = {
          critical: 'bg-rose-100 text-rose-800 border-rose-200',
          high: 'bg-red-100 text-brand-red border-red-200',
          medium: 'bg-amber-100 text-amber-800 border-amber-200',
          low: 'bg-slate-100 text-slate-600 border-slate-200'
        };
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${pMap[row.priority] || pMap.low}`}>
            {row.priority}
          </span>
        );
      }
    },
    {
      header: 'Status Penanganan',
      render: (row) => (
        <StatusBadge status={row.status} type="it_ticket" />
      )
    },
    {
      header: 'Waktu Tiket',
      render: (row) => (
        <span className="text-[11px] text-slate-500 font-medium">
          {row.createdAt}
        </span>
      )
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenDetail(row)}
        >
          Respon / Detail
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tiket Helpdesk & Gangguan Teknis"
        subtitle="Pusat pelaporan insiden perangkat biometrik, jaringan site, dan penanganan permintaan dukungan teknis operasional."
        breadcrumb={['Dashboard', 'IT Support', 'Helpdesk Tiket']}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-md shadow-red-900/10"
          >
            Buat Tiket Gangguan Baru
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'all'
              ? 'bg-brand-red text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua Tiket ({tickets.length})
        </button>
        <button
          onClick={() => setStatusFilter('open')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'open'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Menunggu / Open ({tickets.filter(t => t.status === 'open').length})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'in_progress'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          Sedang Ditangani ({tickets.filter(t => t.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'resolved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          Selesai / Resolved ({tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length})
        </button>
      </div>

      <DataTable
        columns={columns}
        data={displayedTickets}
        loading={loading}
        searchable
        searchPlaceholder="Cari nomor tiket, judul masalah, site, atau pelapor..."
        emptyMessage="Tidak ada tiket kendala dalam kategori ini."
      />

      {/* Modal Create Ticket */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Catat Tiket Kendala Teknis Baru"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Input
            label="Judul Kendala / Masalah"
            placeholder="Contoh: Terminal Wajah Pos 1 Error 'No Connection'"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kategori Gangguan"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categoryOptions}
            />
            <Select
              label="Tingkat Prioritas"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorityOptions}
            />
          </div>

          <Input
            label="Lokasi Site Terkait"
            placeholder="Contoh: PT. Telkom Landmark Tower"
            value={formData.site}
            onChange={(e) => setFormData({ ...formData, site: e.target.value })}
            required
          />

          <Input
            label="Pelapor Kendala"
            value={formData.reportedBy}
            onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi Lengkap Gejala Gangguan
            </label>
            <textarea
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              placeholder="Jelaskan detail kendala teknis dan dampaknya terhadap operasional lapangan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Buat Tiket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail & Resolution */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail & Tindak Lanjut Tiket IT Support"
        maxWidth="max-w-lg"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-brand-dark bg-slate-200 px-2 py-0.5 rounded">
                  {selectedTicket.id}
                </span>
                <StatusBadge status={selectedTicket.status} type="it_ticket" />
              </div>
              <p className="font-bold text-slate-800 text-sm">{selectedTicket.title}</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                <p>Site: <strong>{selectedTicket.site}</strong></p>
                <p>Pelapor: <strong>{selectedTicket.reportedBy}</strong></p>
                <p>Kategori: <strong>{selectedTicket.category}</strong></p>
                <p>Waktu: <strong>{selectedTicket.createdAt}</strong></p>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 text-slate-700 text-[11px]">
                <strong className="block text-slate-500 mb-0.5">Deskripsi Masalah:</strong>
                {selectedTicket.description}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Solusi / Tindakan Perbaikan IT Support:
              </label>
              <textarea
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                placeholder="Tuliskan investigasi teknis, langkah troubleshooting, dan tindakan yang telah diambil..."
                value={resolutionInput}
                onChange={(e) => setResolutionInput(e.target.value)}
              />
            </div>

            <Select
              label="Perbarui Status Tiket Menjadi"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              options={[
                { value: 'open', label: '1. Menunggu Penanganan (Open)' },
                { value: 'in_progress', label: '2. Sedang Diinvestigasi (In Progress)' },
                { value: 'resolved', label: '3. Masalah Telah Diperbaiki (Resolved)' },
                { value: 'closed', label: '4. Tiket Ditutup (Closed)' }
              ]}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateTicketStatus}>
                Simpan & Perbarui Tiket
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
