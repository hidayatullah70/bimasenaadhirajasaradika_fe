/**
 * Employee List Page — PT. BARAK IOMS
 * Authoritative Employee Master Listing.
 * Source of Truth: PRD Section 11.1 / IMPLEMENTATION-PLAN Phase 2.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, Plus, Download, Eye, EyeOff,
  MoreVertical, Shield, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import employeeAdapter from '@/services/adapters/employeeAdapter';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';
import { SERVICE_TYPES } from '@/constants/business';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import EmployeeDetailDrawer from './EmployeeDetailDrawer';
import EmployeeFormModal from './EmployeeFormModal';
import toast from 'react-hot-toast';

export default function EmployeeListPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.EMPLOYEE_CREATE);
  const canExport = hasPermission(PERMISSIONS.EMPLOYEE_EXPORT);
  const canViewSensitive = hasPermission(PERMISSIONS.EMPLOYEE_VIEW_SENSITIVE);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Sensitive data global toggle
  const [showSensitive, setShowSensitive] = useState(false);

  // Modals & Drawers state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeAdapter.getEmployees({
        search,
        department,
        serviceType,
        status,
        page,
        pageSize: 10,
      });
      if (res.data) {
        setEmployees(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat data karyawan.');
    } finally {
      setLoading(false);
    }
  }, [search, department, serviceType, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    setIsDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editingEmployee) {
        await employeeAdapter.updateEmployee(editingEmployee.id, payload);
        toast.success(`Data ${payload.nama_lengkap_sesuai_KTP} berhasil diperbarui.`);
      } else {
        await employeeAdapter.createEmployee(payload);
        toast.success(`Karyawan baru ${payload.nama_lengkap_sesuai_KTP} berhasil didaftarkan.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data karyawan.');
    }
  };

  const handleExportCSV = () => {
    if (!employees.length) return;
    const headers = ['ID Karyawan', 'Nama Lengkap', 'NIK', 'Jenis Kelamin', 'Layanan', 'Jabatan', 'Status', 'Tanggal Bergabung', 'Status Pajak (PTKP)', 'NPWP', 'Klien Penugasan'];
    const rows = employees.map((e) => [
      e.id_karyawan,
      `"${e.nama_lengkap_sesuai_KTP}"`,
      showSensitive ? e.NIK : `"${e.NIK.slice(0, 4)}************"`,
      e.jenis_kelamin,
      e.jenis_layanan,
      e.jabatan,
      e.status_kerja,
      e.tanggal_masuk || '-',
      e.status_pajak || 'TK0',
      `"${e.NPWP || '-'}"`,
      `"${e.clientName || '-'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Karyawan_BARAK_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil diunduh.');
  };

  const maskNik = (nik) => {
    if (!nik) return '-';
    if (showSensitive && canViewSensitive) return nik;
    return nik.slice(0, 4) + '************';
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Actions Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, NIK, ID karyawan, atau klien..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-canvas/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
          />
        </div>

        {/* Filters & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Status</option>
            <option value="TETAP">Tetap (PKWTT)</option>
            <option value="KONTRAK">Kontrak (PKWT)</option>
            <option value="PROBATION">Probation</option>
          </select>

          {/* Filter Departemen */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Departemen</option>
            <option value="Operasional">Operasional</option>
            <option value="HRD">HRD</option>
            <option value="Finance">Finance</option>
            <option value="Legal">Legal</option>
            <option value="IT">IT</option>
          </select>

          {/* Filter Layanan */}
          <select
            value={serviceType}
            onChange={(e) => {
              setServiceType(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Layanan</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>

          {/* Masking Toggle for Sensitive Data */}
          {canViewSensitive && (
            <button
              type="button"
              onClick={() => setShowSensitive(!showSensitive)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-border bg-white text-muted hover:text-ink font-medium transition-colors"
              title="Buka / Tutup Masking NIK dan Data Finansial"
            >
              {showSensitive ? <EyeOff className="h-3.5 w-3.5 text-info" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{showSensitive ? 'Tutup NIK' : 'Lihat NIK'}</span>
            </button>
          )}

          {/* Export CSV */}
          {canExport && (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
          )}

          {/* Tambah Karyawan */}
          {canCreate && (
            <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Karyawan</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <StateLoading message="Memuat daftar master karyawan PT. BARAK..." />
        ) : employees.length === 0 ? (
          <StateEmpty
            title="Tidak ada karyawan ditemukan"
            description="Tidak ada data karyawan yang cocok dengan kriteria pencarian atau filter yang dipilih."
            actionLabel={canCreate ? 'Tambah Karyawan Pertama' : undefined}
            onAction={canCreate ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas/50 border-b border-border text-muted uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Karyawan</th>
                  <th className="px-4 py-3.5">NIK (KTP)</th>
                  <th className="px-4 py-3.5">Layanan & Jabatan</th>
                  <th className="px-4 py-3.5">Penempatan Klien</th>
                  <th className="px-4 py-3.5">Status Kerja</th>
                  <th className="px-4 py-3.5">Kelengkapan</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => handleRowClick(emp)}
                    className="hover:bg-primary-red/5 transition-colors cursor-pointer group"
                  >
                    {/* Profil & Nama */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-7 rounded overflow-hidden bg-primary-red/10 text-primary-red font-bold flex items-center justify-center flex-none shadow-2xs border border-border">
                          {emp.foto_3x4 ? (
                            <img
                              src={emp.foto_3x4}
                              alt={emp.nama_lengkap_sesuai_KTP}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            emp.nama_lengkap_sesuai_KTP ? emp.nama_lengkap_sesuai_KTP.charAt(0) : 'E'
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-ink group-hover:text-primary-red transition-colors">
                            {emp.nama_lengkap_sesuai_KTP}
                          </p>
                          <p className="text-[11px] text-muted font-mono">{emp.id_karyawan}</p>
                        </div>
                      </div>
                    </td>

                    {/* NIK */}
                    <td className="px-4 py-3 font-mono text-muted">
                      {maskNik(emp.NIK)}
                    </td>

                    {/* Layanan & Jabatan */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink capitalize">{emp.jenis_pekerjaan}</p>
                      <p className="text-[11px] text-muted">{emp.jabatan} • {emp.sertifikasi || 'Standard'}</p>
                    </td>

                    {/* Klien & Lokasi */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink truncate max-w-[180px]">{emp.clientName || 'Standby'}</p>
                      <p className="text-[11px] text-muted truncate max-w-[180px]">{emp.locationName || '-'}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant={emp.status_kerja === 'TETAP' ? 'success' : emp.status_kerja === 'KONTRAK' ? 'info' : 'warning'}>
                        {emp.status_kerja}
                      </Badge>
                    </td>

                    {/* Kelengkapan Dokumen */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <span className="text-[11px] font-medium text-ink">
                          {emp.kelengkapan_dokumen?.percentage ?? 100}%
                        </span>
                      </div>
                    </td>

                    {/* Aksi Button */}
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(emp)}
                        className="px-2.5 py-1 text-xs rounded border border-border bg-white text-muted hover:text-primary-red hover:border-primary-red/30 transition-colors font-medium"
                      >
                        Ubah
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && employees.length > 0 && (
          <div className="p-3.5 border-t border-border bg-canvas/30 flex items-center justify-between text-xs text-muted">
            <p>
              Menampilkan <span className="font-medium text-ink">{(page - 1) * 10 + 1}</span> -{' '}
              <span className="font-medium text-ink">{Math.min(page * 10, meta.total)}</span> dari{' '}
              <span className="font-medium text-ink">{meta.total}</span> data karyawan
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-medium text-ink">
                Halaman {page} dari {meta.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <EmployeeDetailDrawer
        employee={selectedEmployee}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleOpenEdit}
      />

      <EmployeeFormModal
        isOpen={isModalOpen}
        employee={editingEmployee}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
