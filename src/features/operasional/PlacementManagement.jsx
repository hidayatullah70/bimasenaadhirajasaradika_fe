import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { api } from '../../services/api/apiClient';
import { Users, Briefcase } from 'lucide-react';

export function PlacementManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getEmployees({ search });
        if (res.success) setEmployees(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search]);

  const columns = [
    {
      header: 'Nama Personel & NIK',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.nik}</p>
        </div>
      )
    },
    {
      header: 'Lokasi Penempatan Site',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.siteName}</p>
          <p className="text-xs text-slate-500">{row.clientName}</p>
        </div>
      )
    },
    {
      header: 'Penugasan Layanan',
      render: (row) => (
        <span className="text-xs font-semibold text-brand-dark bg-slate-100 px-2.5 py-1 rounded">
          {row.service}
        </span>
      )
    },
    {
      header: 'Jabatan Lapangan',
      render: (row) => <span className="text-xs font-medium text-slate-700">{row.position}</span>
    },
    {
      header: 'Masa Penugasan',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.joinDate} s/d {row.contractEnd}</span>
      )
    },
    {
      header: 'Status Disposisi',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disposisi & Penempatan Personel Lapangan"
        subtitle="Pemetaan personil ke site penugasan, batas waktu kontrak kerja klien, dan struktur regu."
        breadcrumb={['Dashboard', 'Operasional', 'Placements']}
      />

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari berdasarkan personel, NIK, atau lokasi site..."
      />
    </div>
  );
}
