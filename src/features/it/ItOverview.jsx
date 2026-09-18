import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import {
  Server,
  Activity,
  HardDrive,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Cpu,
  Wifi,
  ShieldAlert,
  Terminal,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { useToast } from '../../app/context/ToastContext';

export function ItOverview({ onNavigate }) {
  const { addToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [backupRunning, setBackupRunning] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      addToast('Status infrastruktur & telemetri server berhasil diperbarui.', 'success');
    }, 600);
  };

  const handleRunBackup = () => {
    setBackupRunning(true);
    setTimeout(() => {
      setBackupRunning(false);
      addToast('Pencadangan snapshot database MySQL & S3 Storage selesai (Size: 142.8 MB).', 'success');
    }, 1200);
  };

  const systemServices = [
    { name: 'Core API Gateway (Railway Cloud)', status: 'Online', uptime: '99.98%', latency: '24ms', health: 'healthy' },
    { name: 'MySQL Relational Database (Primary)', status: 'Online', uptime: '99.95%', latency: '12ms', health: 'healthy' },
    { name: 'Biometric Attendance Sync Engine', status: 'Online', uptime: '99.90%', latency: '45ms', health: 'healthy' },
    { name: 'Guard Patrol GPS Stream Ingestion', status: 'Online', uptime: '99.85%', latency: '58ms', health: 'healthy' },
    { name: 'Vercel Edge Frontend CDN', status: 'Online', uptime: '100.00%', latency: '8ms', health: 'healthy' }
  ];

  const recentSiteIncidents = [
    {
      id: 'TKT-2026-089',
      site: 'PT. Telkom Indonesia Tbk (Landmark Tower)',
      issue: 'Terminal Presensi Wajah Lobi Barat perlu sinkronisasi ulang firmware',
      priority: 'high',
      status: 'in_progress',
      reportedBy: 'Nazi Rinaldi (Operasional)',
      time: '25 mnt yang lalu'
    },
    {
      id: 'TKT-2026-088',
      site: 'Pabrik Mayora Tangerang',
      issue: 'Perangkat GPS Patrol Wand Pos 3 baterai drop saat patroli malam',
      priority: 'medium',
      status: 'open',
      reportedBy: 'Hendrik Gunawan (Chief Security)',
      time: '1 jam yang lalu'
    },
    {
      id: 'TKT-2026-087',
      site: 'Kantor Pusat PT. BARAK',
      issue: 'Permintaan reset sandi & otorisasi portal staf HRD baru',
      priority: 'low',
      status: 'resolved',
      reportedBy: 'Robyn Topani (HRD)',
      time: '3 jam yang lalu'
    }
  ];

  const hardwareStats = [
    { title: 'Mesin Biometrik Wajah Site', total: 24, online: 23, offline: 1 },
    { title: 'GPS Guard Tour Patrol Wand', total: 42, online: 40, offline: 2 },
    { title: 'CCTV Command NVR Stream', total: 16, online: 16, offline: 0 },
    { title: 'Laptop Operasional & HQ', total: 35, online: 35, offline: 0 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ringkasan Sistem & Infrastruktur IT"
        subtitle="Monitoring realtime server, perangkat keras IoT di site klien, konektivitas biometrik, dan tiket helpdesk operasional."
        breadcrumb={['Dashboard', 'IT Support', 'Ringkasan Sistem']}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={HardDrive}
              onClick={() => onNavigate && onNavigate('it-assets')}
            >
              Kelola Aset IT (CRUD)
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Headphones}
              onClick={() => onNavigate && onNavigate('it-helpdesk')}
            >
              Kelola Tiket (CRUD)
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={handleRefresh}
            >
              Segarkan
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Database}
              loading={backupRunning}
              onClick={handleRunBackup}
              className="shadow-md shadow-red-900/10"
            >
              Snapshot Backup
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Status Sistem & Server"
          value="99.98%"
          subtitle="Uptime operasional 30 hari"
          icon={Server}
          color="green"
        />
        <KpiCard
          title="Perangkat Lapangan"
          value="117 / 120"
          subtitle="97.5% unit aktif terkoneksi"
          icon={HardDrive}
          color="blue"
        />
        <KpiCard
          title="Tiket Helpdesk Aktif"
          value="3 Tiket"
          subtitle="2 Sedang dalam penanganan"
          icon={Headphones}
          color="yellow"
        />
        <KpiCard
          title="Rata-rata Latensi API"
          value="24 ms"
          subtitle="Respon query backend optimal"
          icon={Activity}
          color="dark"
        />
      </div>

      {/* Core Infrastructure & Hardware Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Services Status */}
        <div className="lg:col-span-2 bg-white rounded-card p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-dark" />
              <h3 className="font-bold text-brand-dark text-sm">Status Layanan & Layanan Backend</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Semua Layanan Normal
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {systemServices.map((srv, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{srv.name}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span>Uptime: <strong className="text-slate-700">{srv.uptime}</strong></span>
                      <span>•</span>
                      <span>Latensi: <strong className="text-slate-700">{srv.latency}</strong></span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {srv.status}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Terminal className="w-4 h-4 text-brand-red" />
              <span>Database MySQL Production: <strong>Railway Cloud Instance #1 (Auto-Failover Active)</strong></span>
            </div>
            <span className="text-emerald-700 font-bold text-[11px]">Sync OK</span>
          </div>
        </div>

        {/* Hardware Status on Sites */}
        <div className="bg-white rounded-card p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-brand-dark" />
                <h3 className="font-bold text-brand-dark text-sm">Hardware Operasional Site</h3>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('it-assets')}
                className="text-xs font-bold text-brand-red hover:underline flex items-center gap-0.5"
              >
                Detail <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {hardwareStats.map((hw, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{hw.title}</span>
                    <span className="font-bold text-brand-dark">{hw.online}/{hw.total} Unit</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(hw.online / hw.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-600 font-medium">{hw.online} Aktif Terhubung</span>
                    {hw.offline > 0 && <span className="text-rose-500 font-medium">{hw.offline} Offline/Perlu Cek</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={() => onNavigate && onNavigate('it-assets')}
            >
              Kelola Inventaris Aset IT Lapangan
            </Button>
          </div>
        </div>
      </div>

      {/* Helpdesk & Technical Incidents Section */}
      <div className="bg-white rounded-card p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-brand-dark" />
            <h3 className="font-bold text-brand-dark text-sm">Tiket Kendala & Permintaan Bantuan Teknis Terkini</h3>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('it-helpdesk')}
            className="text-xs font-bold text-brand-red hover:underline flex items-center gap-0.5"
          >
            Lihat Semua Tiket <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentSiteIncidents.map((inc) => (
            <div key={inc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-brand-dark bg-slate-100 px-2 py-0.5 rounded">
                    {inc.id}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{inc.site}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                    inc.priority === 'high' ? 'bg-red-100 text-brand-red' : inc.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {inc.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{inc.issue}</p>
                <p className="text-[11px] text-slate-400">
                  Dilaporkan oleh <strong className="text-slate-600">{inc.reportedBy}</strong> • {inc.time}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <StatusBadge status={inc.status} type="it_ticket" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate && onNavigate('it-helpdesk')}
                >
                  Tindak Lanjut
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
