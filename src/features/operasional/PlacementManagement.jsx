import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

export function PlacementManagement() {
  const { addToast } = useToast();
  const [placements, setPlacements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    client_id: '',
    site_id: '',
    service_id: '',
    shift: 'pagi',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active'
  });

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await api.getPlacements({ search });
      if (res?.success) {
        setPlacements(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat data penempatan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [empRes, cliRes, siteRes, srvRes] = await Promise.all([
        api.getEmployees({ limit: 100 }).catch(() => ({ success: false })),
        api.getClients().catch(() => ({ success: false })),
        api.getSites().catch(() => ({ success: false })),
        api.getServices().catch(() => ({ success: false }))
      ]);

      if (empRes?.success && Array.isArray(empRes.data)) setEmployees(empRes.data);
      if (cliRes?.success && Array.isArray(cliRes.data)) setClients(cliRes.data);
      if (siteRes?.success && Array.isArray(siteRes.data)) setSites(siteRes.data);
      if (srvRes?.success && Array.isArray(srvRes.data)) setServices(srvRes.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchPlacements();
  }, [search]);

  const handleCreatePlacement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        employee_id: parseInt(formData.employee_id, 10),
        client_id: parseInt(formData.client_id, 10),
        site_id: parseInt(formData.site_id, 10),
        service_id: parseInt(formData.service_id, 10),
        shift: formData.shift,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status
      };

      const res = await api.createPlacement(payload);
      if (res?.success) {
        addToast('Penempatan personil baru berhasil dicatat di server!', 'success');
        setIsAddModalOpen(false);
        fetchPlacements();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan penempatan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlacement = async () => {
    if (!selectedPlacement) return;
    setSubmitting(true);
    try {
      const res = await api.deletePlacement(selectedPlacement.id);
      if (res?.success) {
        addToast('Data penempatan berhasil dihapus.', 'success');
        setIsDeleteModalOpen(false);
        setSelectedPlacement(null);
        fetchPlacements();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menghapus penempatan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Nama Personel & NIK',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.employee_name || row.name || `Karyawan #${row.employee_id}`}</p>
          <p className="text-xs text-slate-500 font-mono">{row.employee_nik || row.employee_no || row.nik || '-'}</p>
        </div>
      )
    },
    {
      header: 'Lokasi Penempatan Site',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.site_name || row.siteName || 'Gedung Operasional'}</p>
          <p className="text-xs text-slate-500">{row.client_name || row.clientName || 'Mitra Korporasi'}</p>
        </div>
      )
    },
    {
      header: 'Penugasan Layanan & Shift',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-brand-dark bg-slate-100 px-2.5 py-0.5 rounded">
            {row.service_name || row.service || 'Security'}
          </span>
          <p className="text-xs text-slate-500 mt-0.5 capitalize">Shift: {row.shift || 'Pagi'}</p>
        </div>
      )
    },
    {
      header: 'Masa Penugasan',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.start_date || row.joinDate} s/d {row.end_date || row.contractEnd}</span>
      )
    },
    {
      header: 'Status Disposisi',
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
            title="Hapus Penempatan"
            onClick={() => {
              setSelectedPlacement(row);
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
        title="Disposisi & Penempatan Personel Lapangan"
        subtitle="Pemetaan personil ke site penugasan, batas waktu kontrak kerja klien, dan struktur regu alih daya."
        breadcrumb={['Dashboard', 'Operasional', 'Placements']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setFormData({
                employee_id: employees.length > 0 ? String(employees[0].id) : '1',
                client_id: clients.length > 0 ? String(clients[0].id) : '1',
                site_id: sites.length > 0 ? String(sites[0].id) : '1',
                service_id: services.length > 0 ? String(services[0].id) : '1',
                shift: 'pagi',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'active'
              });
              setIsAddModalOpen(true);
            }}
          >
            Disposisi Personel Baru
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={placements}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari berdasarkan personel, NIK, atau lokasi site..."
      />

      {/* Modal Add Placement */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Form Penugasan & Disposisi Personel"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreatePlacement} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilih Personel Karyawan"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              options={
                employees.length > 0
                  ? employees.map(emp => ({ value: String(emp.id), label: `${emp.name} (${emp.employee_no || emp.nik || emp.id})` }))
                  : [{ value: '1', label: 'Budi Santoso' }]
              }
              required
            />
            <Select
              label="Pilar Layanan"
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              options={
                services.length > 0
                  ? services.map(srv => ({ value: String(srv.id), label: srv.name }))
                  : [{ value: '1', label: 'Security & Guard Services' }]
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Mitra Klien Tertuju"
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              options={
                clients.length > 0
                  ? clients.map(cli => ({ value: String(cli.id), label: cli.name }))
                  : [{ value: '1', label: 'PT. Nusantara Graha Pratama' }]
              }
              required
            />
            <Select
              label="Lokasi Site Penugasan"
              value={formData.site_id}
              onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
              options={
                sites.length > 0
                  ? sites.map(site => ({ value: String(site.id), label: `${site.name} (${site.city || 'Site'})` }))
                  : [{ value: '1', label: 'Nusantara Tower Sudirman' }]
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Jadwal Shift"
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              options={[
                { value: 'pagi', label: 'Pagi (07:00 - 15:00)' },
                { value: 'siang', label: 'Siang (15:00 - 23:00)' },
                { value: 'malam', label: 'Malam (23:00 - 07:00)' },
                { value: 'general', label: 'General / Office' }
              ]}
            />
            <Input
              label="Mulai Tugas"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            <Input
              label="Selesai Tugas"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Simpan Penempatan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Delete Placement */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Penempatan"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Apakah Anda yakin ingin menghapus data penempatan ini?</p>
              <p className="mt-1 text-red-700">
                Personel <span className="font-semibold">{selectedPlacement?.employee_name || selectedPlacement?.name}</span> di lokasi <span className="font-semibold">{selectedPlacement?.site_name || selectedPlacement?.siteName}</span> akan dilepaskan dari status penugasan aktif.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="!bg-red-600 hover:!bg-red-700"
              loading={submitting}
              icon={Trash2}
              onClick={handleDeletePlacement}
            >
              Ya, Hapus Penempatan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
