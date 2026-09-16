import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { Building2, Plus, MapPin, Phone, Mail } from 'lucide-react';

export function SiteManagement() {
  const { addToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: 'Properti & Komersial',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    serviceType: 'Pengamanan / Security',
    activeHeadcount: '20',
    contractEnd: '2027-12-31'
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.getClients({ search });
      if (res.success) {
        setClients(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat data klien & site', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson) {
      addToast('Harap isi nama klien dan kontak PIC.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createClient(formData);
      if (res.success) {
        addToast(`Klien ${formData.name} berhasil ditambahkan ke daftar operasional.`, 'success');
        setIsAddModalOpen(false);
        fetchClients();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menambahkan klien', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Nama Mitra Klien & Industri',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.name}</p>
          <span className="text-xs text-brand-red font-medium">{row.industry}</span>
        </div>
      )
    },
    {
      header: 'Layanan Aktif',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
          {row.serviceType}
        </span>
      )
    },
    {
      header: 'PIC / Penanggung Jawab',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.contactPerson}</p>
          <p className="text-xs text-slate-400">{row.phone}</p>
        </div>
      )
    },
    {
      header: 'Personel Ditempatkan',
      render: (row) => (
        <span className="font-bold text-brand-dark text-sm">{row.activeHeadcount} Orang</span>
      )
    },
    {
      header: 'Masa Berlaku Kontrak',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.contractEnd}</span>
      )
    },
    {
      header: 'Status Operasi',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Mitra Klien & Site Operasional"
        subtitle="Daftar perjanjian penempatan tenaga kerja, lokasi site, dan kontak manajerial klien."
        breadcrumb={['Dashboard', 'Operasional', 'Sites']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
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
        searchPlaceholder="Cari nama klien, industri, atau PIC..."
      />

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Daftarkan Klien & Lokasi Site Baru"
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
            <Select
              label="Sektor Industri"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              options={[
                { value: 'Properti & Komersial', label: 'Properti & Komersial' },
                { value: 'Transportasi & Logistik', label: 'Transportasi & Logistik' },
                { value: 'Retail & Supermarket', label: 'Retail & Supermarket' },
                { value: 'Manufaktur & Pabrik', label: 'Manufaktur & Pabrik' },
                { value: 'Kesehatan & Rumah Sakit', label: 'Kesehatan & Rumah Sakit' },
                { value: 'Perbankan & Lembaga Finansial', label: 'Perbankan & Finansial' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama PIC / Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Nama Pejabat Klien"
              required
            />
            <Input
              label="Nomor Telepon Kantor / WA"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+62 21 xxxx-xxxx"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Jumlah Personel yang Ditempatkan"
              type="number"
              value={formData.activeHeadcount}
              onChange={(e) => setFormData({ ...formData, activeHeadcount: e.target.value })}
              required
            />
            <Input
              label="Batas Akhir Kontrak Kerjasama"
              type="date"
              value={formData.contractEnd}
              onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Alamat Lengkap Site / Gedung Klien"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Alamat penempatan operasional..."
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
    </div>
  );
}
