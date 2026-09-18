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
import { Building2, Plus, MapPin, Phone, Mail, Trash2 } from 'lucide-react';

export function SiteManagement() {
  const { addToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.getClients({ search });
      if (res?.success && Array.isArray(res.data)) {
        setClients(res.data);
      } else {
        setClients([]);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat data klien & site dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('Harap isi nama perusahaan mitra klien.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createClient(formData);
      if (res?.success) {
        addToast(`Klien ${formData.name} berhasil ditambahkan ke database backend!`, 'success');
        setIsAddModalOpen(false);
        fetchClients();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menambahkan klien', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    setSubmitting(true);
    try {
      const res = await api.deleteClient(selectedClient.id);
      if (res?.success) {
        addToast(`Klien ${selectedClient.name} berhasil dinonaktifkan.`, 'success');
        setIsDeleteModalOpen(false);
        fetchClients();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menghapus klien', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Nama Mitra Klien & Kode',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.name}</p>
          <span className="text-xs text-slate-400 font-mono">{row.client_code || `CLN-${row.id}`}</span>
        </div>
      )
    },
    {
      header: 'Kontak Telepon & Email',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 font-mono text-xs">{row.phone || '-'}</p>
          <p className="text-xs text-slate-500">{row.email || '-'}</p>
        </div>
      )
    },
    {
      header: 'Alamat Penempatan',
      render: (row) => (
        <p className="text-xs text-slate-600 max-w-xs truncate">{row.address || '-'}</p>
      )
    },
    {
      header: 'Total Site & Personel',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark text-xs">{row.total_sites || 1} Lokasi Site</p>
          <p className="text-xs text-slate-500">{row.active_personnel || 0} Personel Aktif</p>
        </div>
      )
    },
    {
      header: 'Status Operasi',
      render: (row) => <StatusBadge status={row.status} />
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
            className="!p-1.5 text-slate-400 hover:text-brand-red"
            title="Hapus Klien"
            onClick={() => {
              setSelectedClient(row);
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
        title="Kelola Mitra Klien & Site Operasional"
        subtitle="Daftar mitra korporasi resmi, kontak penanggung jawab, dan sebaran lokasi site alih daya."
        breadcrumb={['Dashboard', 'Operasional', 'Sites']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                status: 'active'
              });
              setIsAddModalOpen(true);
            }}
          >
            Daftarkan Klien Baru
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama klien, telepon, atau alamat..."
      />

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Daftarkan Mitra Klien Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Perusahaan Klien"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: PT Graha Finansial Mandiri"
              required
            />
            <Input
              label="Nomor Telepon Kantor / PIC"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="021-5551234 / 081234567890"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Alamat Email Klien"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="procurement@grahamandiri.com"
            />
            <Select
              label="Status Kemitraan"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Aktif Bekerja (Active)' },
                { value: 'inactive', label: 'Non-Aktif' }
              ]}
            />
          </div>

          <Textarea
            label="Alamat Lengkap Site / Gedung Kantor"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Alamat lengkap lokasi operasional penempatan..."
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Simpan Klien Baru
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Client Confirm */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClient}
        title="Nonaktifkan Klien"
        message={`Apakah Anda yakin ingin menonaktifkan kemitraan dengan ${selectedClient?.name}?`}
        confirmText="Ya, Nonaktifkan"
        cancelText="Batal"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
