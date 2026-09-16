import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { INITIAL_SERVICES, INITIAL_CLIENTS } from '../../services/mock/mockData';
import { UserPlus, Edit2, Trash2, Eye, FileText, CheckCircle2 } from 'lucide-react';

export function EmployeeManagement() {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, totalPages: 1 });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Laki-laki',
    service: 'Pengamanan / Security',
    position: '',
    clientName: 'PT Menara Graha Mandiri',
    siteName: 'Gedung Graha Mandiri Tower A & B',
    phone: '',
    certification: 'Gada Pratama'
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees({
        search,
        service: serviceFilter,
        status: statusFilter,
        page,
        limit: 10
      });
      if (res.success) {
        setEmployees(res.data);
        setPaginationMeta({
          total: res.meta?.total || res.data.length,
          totalPages: res.meta?.totalPages || 1
        });
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat data tenaga kerja', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, serviceFilter, statusFilter, page]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      gender: 'Laki-laki',
      service: 'Pengamanan / Security',
      position: 'Garda Pengamanan',
      clientName: 'PT Menara Graha Mandiri',
      siteName: 'Gedung Graha Mandiri Tower A & B',
      phone: '+62 821-0000-0000',
      certification: 'Gada Pratama'
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setIsEditMode(true);
    setActiveEmployee(emp);
    setFormData({
      name: emp.name,
      gender: emp.gender || 'Laki-laki',
      service: emp.service,
      position: emp.position,
      clientName: emp.clientName,
      siteName: emp.siteName,
      phone: emp.phone,
      certification: emp.certification || ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (emp) => {
    setActiveEmployee(emp);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (emp) => {
    setActiveEmployee(emp);
    setIsDeleteConfirmOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.position) {
      addToast('Harap lengkapi nama dan posisi jabatan personil.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && activeEmployee) {
        const res = await api.updateEmployee(activeEmployee.id, formData);
        if (res.success) {
          addToast('Data personil berhasil diperbarui.', 'success');
          setIsFormModalOpen(false);
          fetchEmployees();
        }
      } else {
        const res = await api.createEmployee(formData);
        if (res.success) {
          addToast('Data personil baru berhasil ditambahkan.', 'success');
          setIsFormModalOpen(false);
          fetchEmployees();
        }
      }
    } catch (err) {
      addToast(err.message || 'Terjadi kendala penyimpanan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeEmployee) return;
    setSubmitting(true);
    try {
      const res = await api.deleteEmployee(activeEmployee.id);
      if (res.success) {
        addToast(`Personil ${activeEmployee.name} berhasil dihapus dari sistem.`, 'success');
        setIsDeleteConfirmOpen(false);
        fetchEmployees();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menghapus data', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'NIK & Nama Lengkap',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.nik}</p>
        </div>
      )
    },
    {
      header: 'Layanan & Posisi',
      render: (row) => (
        <div>
          <span className="font-semibold text-brand-dark">{row.service}</span>
          <p className="text-xs text-slate-500">{row.position}</p>
        </div>
      )
    },
    {
      header: 'Penempatan Site Klien',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.clientName}</p>
          <p className="text-xs text-slate-400">{row.siteName}</p>
        </div>
      )
    },
    {
      header: 'Sertifikasi / Kualifikasi',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
          {row.certification || '-'}
        </span>
      )
    },
    {
      header: 'Status',
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
            className="!p-1.5 text-slate-500 hover:text-brand-dark"
            title="Lihat Detail Profil"
            onClick={() => handleOpenDetail(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-500 hover:text-brand-dark"
            title="Edit Data Personel"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
            title="Hapus Personel"
            onClick={() => handleOpenDelete(row)}
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
        title="Master Data Tenaga Kerja (Manpower)"
        subtitle="Pengelolaan profil, kualifikasi sertifikasi, riwayat PKWT, dan penempatan lokasi kerja."
        breadcrumb={['Dashboard', 'HRD', 'Employees']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={handleOpenAdd}
          >
            Tambah Tenaga Kerja
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-56">
          <Select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'Semua Pilar Layanan' },
              ...INITIAL_SERVICES.map(s => ({ value: s.title, label: s.title }))
            ]}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'Semua Status' },
              { value: 'active', label: 'Aktif Bekerja' },
              { value: 'inactive', label: 'Non-Aktif / Resign' }
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Cari nama, NIK, posisi, atau site..."
        pagination={{
          page,
          totalPages: paginationMeta.totalPages,
          total: paginationMeta.total,
          onPageChange: (p) => setPage(p)
        }}
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditMode ? 'Edit Profil Tenaga Kerja' : 'Registrasi Tenaga Kerja Baru'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap Personel"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Tri Wahyudi"
              required
            />
            <Select
              label="Jenis Kelamin"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'Laki-laki', label: 'Laki-laki' },
                { value: 'Perempuan', label: 'Perempuan' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilar Layanan"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              options={INITIAL_SERVICES.map(s => ({ value: s.title, label: s.title }))}
            />
            <Input
              label="Posisi / Jabatan Lapangan"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Contoh: Danru / Senior Guard"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Klien Penempatan"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              options={INITIAL_CLIENTS.map(c => ({ value: c.name, label: c.name }))}
            />
            <Input
              label="Lokasi Site Penugasan"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              placeholder="Contoh: Gedung Tower A"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kontak Telepon / WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+62 821-xxxx-xxxx"
              required
            />
            <Input
              label="Sertifikasi / Kualifikasi"
              value={formData.certification}
              onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
              placeholder="Contoh: Gada Pratama & K3 Dasar"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsFormModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              {isEditMode ? 'Simpan Perubahan' : 'Daftarkan Personel'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Profil Personel"
        maxWidth="max-w-md"
      >
        {activeEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-brand-dark text-white font-bold flex items-center justify-center text-sm">
                {activeEmployee.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-brand-dark">{activeEmployee.name}</h4>
                <p className="text-xs text-slate-500 font-mono">NIK: {activeEmployee.nik}</p>
                <StatusBadge status={activeEmployee.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Layanan:</span>
                <span className="font-semibold text-brand-dark">{activeEmployee.service}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Jabatan:</span>
                <span className="font-semibold text-brand-dark">{activeEmployee.position}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Mitra Klien:</span>
                <span className="font-semibold text-brand-dark">{activeEmployee.clientName}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Site:</span>
                <span className="font-semibold text-brand-dark">{activeEmployee.siteName}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Kontrak Selesai:</span>
                <span className="font-semibold text-brand-dark">{activeEmployee.contractEnd}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Sertifikasi:</span>
                <span className="font-semibold text-brand-dark">{activeEmployee.certification || '-'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog (Mandatory UX requirement) */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Tenaga Kerja?"
        message={`Apakah Anda yakin ingin menghapus data personil ${activeEmployee?.name} (NIK: ${activeEmployee?.nik})? Seluruh riwayat penempatan terkait akan dinonaktifkan.`}
        confirmText="Ya, Hapus Data"
        loading={submitting}
      />
    </div>
  );
}
