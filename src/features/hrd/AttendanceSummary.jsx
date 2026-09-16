import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Select } from '../../components/ui/Input';
import { api } from '../../services/api/apiClient';
import { INITIAL_SERVICES } from '../../services/mock/mockData';
import { CalendarCheck, Clock } from 'lucide-react';

export function AttendanceSummary() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.getAttendance({
        search,
        service: serviceFilter,
        status: statusFilter
      });
      if (res.success) {
        setAttendance(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [search, serviceFilter, statusFilter]);

  const columns = [
    {
      header: 'Nama Personel & Site',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.employeeName}</p>
          <p className="text-xs text-slate-400">{row.siteName}</p>
        </div>
      )
    },
    {
      header: 'Layanan & Shift',
      render: (row) => (
        <div>
          <p className="font-semibold text-brand-dark">{row.service}</p>
          <p className="text-xs text-slate-500">{row.shift}</p>
        </div>
      )
    },
    {
      header: 'Jam Masuk / Pulang',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-mono text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.checkIn} — {row.checkOut || 'On Duty'}</span>
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
        <span className="text-xs text-slate-600 italic">{row.notes}</span>
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
        <div className="w-full sm:w-56">
          <Select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Pilar Layanan' },
              ...INITIAL_SERVICES.map(s => ({ value: s.title, label: s.title }))
            ]}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Status' },
              { value: 'on-duty', label: 'On Duty (Bertugas)' },
              { value: 'off', label: 'Off / Lepas Piket' },
              { value: 'permit', label: 'Izin / Sakit' }
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
