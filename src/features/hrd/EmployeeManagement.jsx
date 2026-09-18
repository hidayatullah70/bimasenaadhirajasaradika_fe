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
import { UserPlus, Edit2, Trash2, Eye, FileText, CheckCircle2 } from 'lucide-react';

export function EmployeeManagement() {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    phone: '',
    email: '',
    employment_type: 'kontrak',
    status: 'active',
    join_date: '2026-03-01',
    end_date: '2027-02-28',
    position: 'Garda Pengamanan',
    service: 'Security & Guard Services',
    certification: 'Gada Pratama'
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees({
        search,
        status: statusFilter,
        page,
        limit: 10
      });
      if (res?.success && Array.isArray(res.data)) {
        setEmployees(res.data);
        setPaginationMeta({
          total: res.meta?.total || res.data.length,
          totalPages: res.meta?.totalPages || 1
        });
      } else {
        setEmployees([]);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat data tenaga kerja', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [srvRes, cliRes] = await Promise.all([
        api.getServices().catch(() => ({ success: false })),
        api.getClients().catch(() => ({ success: false }))
      ]);
      if (srvRes?.success && Array.isArray(srvRes.data)) setServices(srvRes.data);
      if (cliRes?.success && Array.isArray(cliRes.data)) setClients(cliRes.data);
    } catch (e) {
      console.warn('Failed to load dropdown dependencies', e);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, statusFilter, page]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      email: '',
      employment_type: 'kontrak',
      status: 'active',
      join_date: '2026-03-01',
      end_date: '2027-02-28',
      position: 'Garda Pengamanan',
      service: 'Security & Guard Services',
      certification: 'Gada Pratama'
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setIsEditMode(true);
    setActiveEmployee(emp);
    setFormData({
      name: emp.name || '',
      phone: emp.phone || '',
      email: emp.email || '',
      employment_type: emp.employment_type || 'kontrak',
      status: emp.status || 'active',
      join_date: emp.join_date || '2026-01-01',
      end_date: emp.end_date || '2027-01-01',
      position: emp.position || 'Garda Pengamanan',
      service: emp.service || 'Security & Guard Services',
      certification: emp.certification || 'Gada Pratama'
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
    if (!formData.name) {
      addToast('Harap lengkapi nama personil.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && activeEmployee) {
        const res = await api.updateEmployee(activeEmployee.id, formData);
        if (res?.success) {
          addToast('Data personil berhasil diperbarui di backend.', 'success');
          setIsFormModalOpen(false);
          fetchEmployees();
        }
      } else {
        const res = await api.createEmployee(formData);
        if (res?.success) {
          addToast('Data personil baru berhasil ditambahkan ke backend.', 'success');
          setIsFormModalOpen(false);
          fetchEmployees();
        }
      }
    } catch (err) {
      addToast(err.message || 'Terjadi kendala penyimpanan di server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeEmployee) return;
    setSubmitting(true);
    try {
      const res = await api.deleteEmployee(activeEmployee.id);
      if (res?.success) {
        addToast(`Personil ${activeEmployee.name} berhasil dihapus dari database.`, 'success');
        setIsDeleteConfirmOpen(false);
        fetchEmployees();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menghapus data karyawan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'No. Pegawai & Nama Lengkap',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.employee_no || row.nik || `EMP-${row.id}`}</p>
        </div>
      )
    },
    {
      header: 'Layanan & Posisi',
      render: (row) => (
        <div>
          <span className="font-semibold text-brand-dark">{row.service || 'Security & Guard'}</span>
          <p className="text-xs text-slate-500">{row.position || row.employment_type || 'Garda Keamanan'}</p>
        </div>
      )
    },
    {
      header: 'Penempatan Site Klien',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.current_placement?.client_name || row.clientName || 'PT Menara Graha'}</p>
          <p className="text-xs text-slate-400">{row.current_placement?.site_name || row.siteName || 'Gedung Pusat'}</p>
        </div>
      )
    },
    {
      header: 'Kontak',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.phone || '-'}</span>
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
            title="Lihat Detail Personel"
            onClick={() => handleOpenDetail(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-500 hover:text-brand-blue"
            title="Ubah Data Personel"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-400 hover:text-brand-red"
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
        title="Master Data Personel & Tenaga Kerja"
        subtitle="Pengelolaan data induk karyawan alih daya, legalitas kontrak PKWT, dan riwayat penempatan site."
        breadcrumb={['Dashboard', 'HRD', 'Employees']}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={UserPlus}
            onClick={handleOpenAdd}
            className="shadow-md shadow-red-900/10"
          >
            Tambah Personel Baru
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Status' },
              { value: 'active', label: 'Aktif Bekerja' },
              { value: 'inactive', label: 'Non-Aktif' }
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari berdasarkan nama personel, NIK, atau kontak..."
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditMode ? 'Perbarui Data Personel' : 'Tambah Tenaga Kerja Baru'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap Karyawan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              required
            />
            <Input
              label="Nomor Telepon / WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Alamat Email (Opsional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="budi@example.com"
            />
            <Input
              label="Posisi / Jabatan"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Contoh: Security Guard / Danru"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilar Layanan"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              options={
                services.length > 0
                  ? services.map(s => ({ value: s.name, label: s.name }))
                  : [
                      { value: 'Security & Guard Services', label: 'Security & Guard Services' },
                      { value: 'Commercial Cleaning Service', label: 'Commercial Cleaning Service' },
                      { value: 'Valet & Parking Management', label: 'Valet & Parking Management' },
                      { value: 'Driver & Chauffeur Services', label: 'Driver & Chauffeur Services' },
                      { value: 'Office Support & Administration', label: 'Office Support & Administration' },
                      { value: 'General Labor & Warehousing', label: 'General Labor & Warehousing' }
                    ]
              }
            />
            <Select
              label="Tipe Kepegawaian"
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
              options={[
                { value: 'kontrak', label: 'PKWT / Kontrak' },
                { value: 'tetap', label: 'Tetap' },
                { value: 'magang', label: 'Magang / Trainee' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal Mulai Kontrak"
              type="date"
              value={formData.join_date}
              onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
              required
            />
            <Input
              label="Tanggal Akhir Kontrak"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sertifikasi / Lisensi"
              value={formData.certification}
              onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
              placeholder="Contoh: Gada Pratama / K3"
            />
            <Select
              label="Status Karyawan"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Aktif (Active)' },
                { value: 'inactive', label: 'Non-Aktif' }
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
            >
              {isEditMode ? 'Simpan Perubahan' : 'Daftarkan Personel'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Personel Tenaga Kerja"
        maxWidth="max-w-lg"
      >
        {activeEmployee && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-brand-dark text-sm">{activeEmployee.employee_no || activeEmployee.nik || `EMP-${activeEmployee.id}`}</span>
                <StatusBadge status={activeEmployee.status} />
              </div>
              <h3 className="text-base font-extrabold text-brand-dark">{activeEmployee.name}</h3>
              <p className="text-slate-500">{activeEmployee.position || 'Garda Keamanan'} • {activeEmployee.service || 'Security'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Telepon:</span>
                <span className="font-semibold text-slate-700 font-mono">{activeEmployee.phone || '-'}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Email:</span>
                <span className="font-semibold text-slate-700">{activeEmployee.email || '-'}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Tipe Kontrak:</span>
                <span className="font-semibold text-slate-700 capitalize">{activeEmployee.employment_type || 'PKWT'}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Masa Kontrak:</span>
                <span className="font-semibold text-slate-700 font-mono">{activeEmployee.join_date || '-'} s/d {activeEmployee.end_date || '-'}</span>
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Personel"
        message={`Apakah Anda yakin ingin menghapus data personil ${activeEmployee?.name}? Tindakan ini akan menghapus data dari sistem.`}
        confirmText="Ya, Hapus Data"
        cancelText="Batal"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
