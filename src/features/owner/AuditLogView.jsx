import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { api } from '../../services/api/apiClient';
import { Activity, ArrowLeft, RefreshCw, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AuditLogView({ onNavigate }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAction, setFilterAction] = useState('ALL');

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getActivities({ limit: 50 });
      if (res?.success && Array.isArray(res.data)) {
        setActivities(res.data);
      } else {
        setActivities([]);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat log audit aktivitas dari backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredList = activities.filter((act) => {
    if (filterAction === 'ALL') return true;
    return act.action === filterAction;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Log Audit & Aktivitas Terkini"
          subtitle="Pencatatan rekam jejak seluruh aksi manajerial, perubahan status, dan operasional sistem (BR-ACT)."
          breadcrumb={['Dashboard', 'Direktur', 'Audit Trail']}
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => onNavigate('owner-overview')}
          >
            Kembali ke Overview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={fetchActivities}
            title="Muat Ulang"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {['ALL', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'RECORD', 'UPDATE_STATUS'].map((act) => (
          <button
            key={act}
            type="button"
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterAction === act
                ? 'bg-brand-dark text-white font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {act === 'ALL' ? 'Semua Aktivitas' : act}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-4">
          <LoadingSkeleton type="table" count={5} />
        </div>
      )}

      {error && <ErrorState message={error} onRetry={fetchActivities} />}

      {!loading && !error && filteredList.length === 0 && (
        <Card className="p-8 text-center text-slate-500 text-sm">
          Belum ada catatan log aktivitas yang sesuai dengan filter ini.
        </Card>
      )}

      {!loading && !error && filteredList.length > 0 && (
        <Card className="overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Resource / Target</th>
                  <th className="py-3 px-4">Rincian Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {item.created_at || item.timestamp || '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-brand-dark">
                      {item.user_name || item.user || 'Sistem / Karyawan'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.role_name || item.role || 'direktur'} type="role" />
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {item.resource} {item.resource_id ? `#${item.resource_id}` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {item.description || (item.after_data ? (typeof item.after_data === 'string' ? item.after_data : JSON.stringify(item.after_data)) : '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
