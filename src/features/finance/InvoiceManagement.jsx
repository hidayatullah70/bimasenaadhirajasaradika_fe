import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { Plus, Eye, CheckCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';

export function InvoiceManagement() {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    invoice_no: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-00${Math.floor(10 + Math.random() * 90)}`,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: '45000000',
    tax: '4950000',
    total: '49950000',
    status: 'issued',
    notes: 'Tagihan alih daya personil periode berjalan'
  });

  const getDeletedInvoiceIds = () => {
    try {
      const raw = localStorage.getItem('barak_deleted_ids_invoices');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (e) {
      return new Set();
    }
  };

  const saveDeletedInvoiceId = (id, invoiceNo) => {
    try {
      const set = getDeletedInvoiceIds();
      if (id) set.add(String(id));
      if (invoiceNo) set.add(String(invoiceNo).trim());
      localStorage.setItem('barak_deleted_ids_invoices', JSON.stringify([...set]));
    } catch (e) {}
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const deletedIds = getDeletedInvoiceIds();
      const res = await api.getInvoices({ search, status: statusFilter });
      if (res?.success && Array.isArray(res.data)) {
        setInvoices(res.data.filter(i => !deletedIds.has(String(i.id)) && !deletedIds.has(String(i.invoice_no || i.invoiceNumber || ''))));
      } else {
        setInvoices([]);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat daftar invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.getClients();
      if (res?.success && Array.isArray(res.data)) {
        setClients(res.data);
        if (res.data.length > 0 && !formData.client_id) {
          setFormData(prev => ({ ...prev, client_id: String(res.data[0].id) }));
        }
      }
    } catch (err) {
      console.warn('Failed to load clients list:', err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  const handleSubtotalChange = (val) => {
    const num = Number(val) || 0;
    const tax = Math.round(num * 0.11);
    const total = num + tax;
    setFormData(prev => ({
      ...prev,
      subtotal: String(num),
      tax: String(tax),
      total: String(total)
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id) {
      addToast('Harap pilih klien yang ditagih.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client_id: parseInt(formData.client_id, 10),
        invoice_no: formData.invoice_no,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        subtotal: Number(formData.subtotal),
        tax: Number(formData.tax),
        total: Number(formData.total),
        status: formData.status,
        notes: formData.notes
      };

      const res = await api.createInvoice(payload);
      if (res?.success) {
        addToast(`Invoice ${formData.invoice_no} berhasil diterbitkan di database backend!`, 'success');
        setIsCreateModalOpen(false);
        fetchInvoices();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menerbitkan invoice di server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      const res = await api.updateInvoiceStatus(invoiceId, { status: newStatus });
      if (res?.success) {
        addToast(`Status invoice #${invoiceId} berhasil diperbarui menjadi ${newStatus.toUpperCase()}`, 'success');
        if (selectedInvoice && selectedInvoice.id === invoiceId) {
          setSelectedInvoice({ ...selectedInvoice, status: newStatus });
        }
        fetchInvoices();
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengubah status di backend', 'error');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      saveDeletedInvoiceId(selectedInvoice.id, selectedInvoice.invoice_no || selectedInvoice.invoiceNumber);
      setInvoices(prev => prev.filter(i => String(i.id) !== String(selectedInvoice.id)));

      const res = await api.deleteInvoice(selectedInvoice.id);
      if (res?.success) {
        addToast(`Invoice #${selectedInvoice.invoice_no || selectedInvoice.id} berhasil dihapus permanen dari sistem.`, 'success');
        setIsDeleteModalOpen(false);
        setSelectedInvoice(null);
        fetchInvoices();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menghapus invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const columns = [
    {
      header: 'No. Faktur / Invoice',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark font-mono text-xs">{row.invoice_no || row.invoiceNumber || `INV-${row.id}`}</p>
          <p className="text-xs text-slate-500 font-mono">{row.invoice_date || '-'}</p>
        </div>
      )
    },
    {
      header: 'Klien Mitra',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.client_name || row.clientName || `Klien ID #${row.client_id}`}</p>
          <p className="text-xs text-slate-400">{row.notes || 'Tagihan Jasa Alih Daya'}</p>
        </div>
      )
    },
    {
      header: 'Tgl Jatuh Tempo',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.due_date || row.dueDate || '-'}</span>
      )
    },
    {
      header: 'Total Tagihan',
      render: (row) => (
        <span className="font-bold text-brand-dark text-sm">{formatRupiah(row.total)}</span>
      )
    },
    {
      header: 'Status Pembayaran',
      render: (row) => <StatusBadge status={row.status} type="invoice" />
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-500 hover:text-brand-dark"
            title="Lihat Rincian Tagihan"
            onClick={() => {
              setSelectedInvoice(row);
              setIsDetailModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>

          {row.status !== 'paid' && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-300"
              onClick={() => handleUpdateStatus(row.id, 'paid')}
            >
              Set Lunas
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-400 hover:text-brand-red"
            title="Hapus Invoice"
            onClick={() => {
              setSelectedInvoice(row);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Tagihan & Piutang Klien (Invoices)"
        subtitle="Penerbitan faktur tagihan jasa alih daya, rekonsiliasi pembayaran kas, dan pengawasan batas jatuh tempo."
        breadcrumb={['Dashboard', 'Finance', 'Invoices']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setFormData({
                client_id: clients.length > 0 ? String(clients[0].id) : '1',
                invoice_no: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-00${Math.floor(10 + Math.random() * 90)}`,
                invoice_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                subtotal: '45000000',
                tax: '4950000',
                total: '49950000',
                status: 'issued',
                notes: 'Tagihan layanan alih daya personil'
              });
              setIsCreateModalOpen(true);
            }}
          >
            Terbitkan Invoice Baru
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-56">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Status Pembayaran' },
              { value: 'issued', label: 'Diterbitkan (Issued)' },
              { value: 'pending', label: 'Menunggu Pembayaran (Pending)' },
              { value: 'paid', label: 'Telah Lunas (Paid)' },
              { value: 'overdue', label: 'Jatuh Tempo (Overdue)' }
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nomor invoice, klien, atau status..."
      />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Penerbitan Faktur Invoice Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilih Klien Tertagih"
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              options={
                clients.length > 0
                  ? clients.map(c => ({ value: String(c.id), label: `${c.name} (${c.client_code || `CLN-${c.id}`})` }))
                  : [{ value: '1', label: 'PT. Nusantara Graha Pratama' }]
              }
              required
            />
            <Input
              label="Nomor Invoice"
              value={formData.invoice_no}
              onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal Terbit"
              type="date"
              value={formData.invoice_date}
              onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
              required
            />
            <Input
              label="Tanggal Jatuh Tempo"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subtotal DPP (Rp)"
              type="number"
              value={formData.subtotal}
              onChange={(e) => handleSubtotalChange(e.target.value)}
              required
            />
            <Select
              label="Status Tagihan"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'issued', label: 'Diterbitkan (Issued)' },
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Lunas (Paid)' }
              ]}
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal (DPP):</span>
              <span>{formatRupiah(formData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>PPN (11%):</span>
              <span>{formatRupiah(formData.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-brand-dark pt-1 border-t border-slate-200">
              <span>Estimasi Total Faktur:</span>
              <span>{formatRupiah(formData.total)}</span>
            </div>
          </div>

          <Textarea
            label="Catatan Invoice / Uraian Layanan"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Terbitkan Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Rincian Faktur Tagihan"
        maxWidth="max-w-lg"
      >
        {selectedInvoice && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-brand-dark text-sm">{selectedInvoice.invoice_no || selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id}`}</span>
                <StatusBadge status={selectedInvoice.status} type="invoice" />
              </div>
              <p className="font-bold text-slate-800 text-sm">{selectedInvoice.client_name || selectedInvoice.clientName || `Klien ID #${selectedInvoice.client_id}`}</p>
              <p className="text-slate-500">Uraian: {selectedInvoice.notes || 'Layanan Alih Daya'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Tanggal Terbit:</span>
                <span className="font-semibold text-slate-700 font-mono">{selectedInvoice.invoice_date || selectedInvoice.issueDate || '-'}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Jatuh Tempo:</span>
                <span className="font-semibold text-slate-700 font-mono">{selectedInvoice.due_date || selectedInvoice.dueDate || '-'}</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Dasar Pengenaan Pajak (DPP):</span>
                <span className="font-mono">{formatRupiah(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PPN 11%:</span>
                <span className="font-mono">{formatRupiah(selectedInvoice.tax || Math.round((Number(selectedInvoice.subtotal) || 0) * 0.11))}</span>
              </div>
              <div className="flex justify-between font-extrabold text-brand-dark text-sm pt-2 border-t border-slate-200">
                <span>Total Tagihan:</span>
                <span className="font-mono text-brand-red">{formatRupiah(selectedInvoice.total)}</span>
              </div>
            </div>

            {/* Change status actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Ubah Status:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInvoice.id, 'paid')}
                  className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] hover:bg-emerald-200 cursor-pointer"
                >
                  Lunas
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInvoice.id, 'pending')}
                  className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-[11px] hover:bg-amber-200 cursor-pointer"
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInvoice.id, 'overdue')}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded font-semibold text-[11px] hover:bg-red-200 cursor-pointer"
                >
                  Overdue
                </button>
              </div>

              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteInvoice}
        title="Hapus Invoice"
        message={`Apakah Anda yakin ingin menghapus invoice #${selectedInvoice?.invoice_no || selectedInvoice?.id}?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
