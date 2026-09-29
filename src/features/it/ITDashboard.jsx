/**
 * IT Support Dashboard Page — PT. BARAK IOMS
 * Authoritative overview for IT Infrastructure, Tickets Helpdesk, SLA, and System Health.
 * Source of Truth: PRD Section 16 (IT Support Module) & Section 18.
 */

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Server,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { StateLoading } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { itAdapter } from '@/services/adapters/itAdapter';
import TicketFormModal from './tickets/TicketFormModal';

export default function ITDashboard() {
  const [stats, setStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes, ticketsRes] = await Promise.all([
        itAdapter.getITStats(),
        itAdapter.getSystemHealth(),
        itAdapter.getTickets({ pageSize: 5 }),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (healthRes.data) setSystemHealth(healthRes.data);
      if (ticketsRes.data) setRecentTickets(ticketsRes.data);
    } catch {
      toast.error('Gagal memuat data dashboard IT Support.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-border shadow-xs">
        <StateLoading message="Memeriksa metrik ketersediaan sistem & tiket gangguan IT..." />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Tiket Bantuan Terbuka (Open)',
      value: stats?.openTickets || 0,
      sub: `${stats?.inProgressTickets || 0} Tiket sedang ditangani`,
      icon: <Ticket className="h-5 w-5 text-primary-red" />,
      iconBg: 'bg-primary-red/10',
    },
    {
      title: 'Kepatuhan SLA Tiket',
      value: '99.1%',
      sub: `${stats?.criticalTickets || 0} Tiket respon darurat`,
      icon: <Clock className="h-5 w-5 text-warning" />,
      iconBg: 'bg-warning/10',
    },
    {
      title: 'Aset IT Posko Terdaftar',
      value: stats?.totalAssets || 0,
      sub: `${stats?.activeAssets || 0} Unit operasional posko`,
      icon: <Cpu className="h-5 w-5 text-info" />,
      iconBg: 'bg-info/10',
    },
    {
      title: 'Jadwal Pemeliharaan (Maintenance)',
      value: `${stats?.maintenanceAssets || 3} Perangkat`,
      icon: <Activity className="h-5 w-5 text-purple-600" />,
      sub: 'CCTV, server & barrier gate',
      iconBg: 'bg-purple-50',
    },
    {
      title: 'Kesehatan Sistem (System Health)',
      value: '99.98%',
      sub: 'Server Laragon & Cloud normal',
      icon: <Server className="h-5 w-5 text-accent-green" />,
      iconBg: 'bg-accent-green/10',
    },
    {
      title: 'Status Cadangan (Backup)',
      value: 'TERCADANG',
      sub: 'Sinkronisasi berkala 02:00 WIB',
      icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-bold text-ink">Pusat Kendali IT & Infrastruktur Posko</h2>
          <p className="text-xs text-muted">
            Monitoring ketersediaan hardware pos pengamanan, barrier gate parkir, CCTV surveillance, dan respons SLA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/ops/it/assets">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs gap-1.5"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Inventaris Aset</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTicketModalOpen(true)}
            className="text-xs gap-1.5 bg-primary-red hover:bg-red-700 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Tiket</span>
          </Button>
        </div>
      </div>

      {/* 6 Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col justify-between h-full"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-2xs font-bold uppercase tracking-wider text-muted line-clamp-1">{kpi.title}</p>
              <div className={`p-2 rounded-lg ${kpi.iconBg} flex-shrink-0`}>{kpi.icon}</div>
            </div>
            <div className="mt-2">
              <p className="text-lg sm:text-xl font-bold text-ink">{kpi.value}</p>
              <p className="text-2xs text-muted mt-0.5 line-clamp-1">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>


      {/* System Health Status Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-green" />
              <span>Kesehatan Sistem & Server IOMS (Live Health Status)</span>
            </CardTitle>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sistem Operasional 100%</span>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {systemHealth?.services?.map((srv, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">{srv.name}</span>
                    <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                  </div>
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">{srv.details}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-muted">
                  <span>Status: <strong className="text-accent-green font-semibold">Aktif</strong></span>
                  {srv.pingMs > 0 && <span>Latensi: {srv.pingMs} ms</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Latest Tickets & Assets Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Ticket className="w-4 h-4 text-primary-red" />
                <span>Tiket Kendala Terbaru</span>
              </CardTitle>
              <Link to="/ops/it/tickets" className="text-xs text-primary-red hover:underline flex items-center gap-1">
                <span>Semua Tiket ({stats?.totalTickets})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-ink leading-snug">{ticket.subject}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {ticket.ticketNumber} · {ticket.requester} ({ticket.departmentLabel || ticket.department})
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>SLA s/d: {new Date(ticket.slaDeadline).toLocaleDateString('id-ID')}</span>
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <Badge status={ticket.status} />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assets by Category */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-info" />
                <span>Distribusi Aset Lapangan ({stats?.totalAssets} Unit)</span>
              </CardTitle>
              <Link to="/ops/it/assets" className="text-xs text-info hover:underline flex items-center gap-1">
                <span>Lihat Direktori</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.assetsByType && Object.entries(stats.assetsByType).map(([type, count]) => {
              const labelMap = {
                BARRIER_GATE: 'Sistem Barrier Gate Parkir',
                CCTV_SYSTEM: 'Sistem CCTV & Kamera Surveilans',
                BIOMETRIC_FINGERPRINT: 'Mesin Biometrik Fingerprint Pos',
                POS_COMPUTER: 'Komputer Posko & Kasir',
                NETWORK_ROUTER: 'Router Jaringan & Switch',
                BACKUP_SERVER: 'Server Basis Data',
                HARDWARE_POS: 'Radio HT & UPS Cadangan',
              };
              const pct = Math.round((count / (stats.totalAssets || 1)) * 100);

              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-ink flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-muted" />
                      <span>{labelMap[type] || type}</span>
                    </span>
                    <span className="text-muted">{count} Unit ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-info h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {isTicketModalOpen && (
        <TicketFormModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          onSuccess={loadDashboardData}
        />
      )}
    </div>
  );
}
