import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Select } from '../../components/ui/Input';
import { api } from '../../services/api/apiClient';
import { Clock } from 'lucide-react';

export function AttendanceSummary() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.getAttendance({
        search,
        status: statusFilter
      });
      if (res?.success && Array.isArray(res.data)) {
        setAttendance(res.data);
      } else {
        setAttendance([]);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [search, statusFilter]);

  const columns = [
    {
      header: 'Nama Personel & Lokasi Site',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.employee_name || row.employeeName || `Karyawan #${row.employee_id}`}</p>
          <p className="text-xs text-slate-400">{row.site_name || row.siteName || 'Site Gedung Utama'}</p>
        </div>
      )
    },
    {
      header: 'Tanggal & Shift',
      render: (row) => (
        <div>
          <p className="font-semibold text-brand-dark font-mono text-xs">{row.attendance_date || row.date || 'Hari Ini'}</p>
          <p className="text-xs text-slate-500 capitalize">{row.shift || 'Pagi / Reguler'}</p>
        </div>
      )
    },
    {
      header: 'Jam Masuk / Pulang',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-mono text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.clock_in || row.checkIn || '07:55'} — {row.clock_out || row.checkOut || 'On Duty'}</span>
        </div>
      )
    },
    {
      header: 'Status Presensi',
      render: (row) => <StatusBadge status={row.status} type="attendance" />
    },
    {
      header: 'Catatan Supervisi Lapangan',
      render: (row) => (
        <span className="text-xs text-slate-600 italic">{row.notes || '-'}</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekapitulasi Absensi & Kesiapan Shift"
        subtitle="Pemantauan kehadiran harian, waktu check-in, dan kepatuhan tugas seluruh personel di site klien."
        breadcrumb={['Dashboard', 'HRD', 'Attendance']}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Status Presensi' },
              { value: 'present', label: 'Hadir (Present)' },
              { value: 'late', label: 'Terlambat (Late)' },
              { value: 'permit', label: 'Izin / Sakit (Permit)' },
              { value: 'absent', label: 'Alpha (Absent)' }
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={attendance}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama personel atau nama site..."
      />
    </div>
  );
}
