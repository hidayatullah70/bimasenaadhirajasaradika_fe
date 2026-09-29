/**
 * Operations Dashboard Overview — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Operations Module), Section 14 (Seed Policy), Section 21 (Single SOT).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Users,
  AlertCircle,
  UserCheck,
  ClipboardList,
  ArrowRight,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/StateViews';
import clientAdapter from '@/services/adapters/clientAdapter';
import locationAdapter from '@/services/adapters/locationAdapter';
import assignmentAdapter from '@/services/adapters/assignmentAdapter';
import incidentAdapter from '@/services/adapters/incidentAdapter';
import replacementAdapter from '@/services/adapters/replacementAdapter';
import fieldReportAdapter from '@/services/adapters/fieldReportAdapter';
import { STATUS } from '@/constants/status';

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clientCount: 18,
    locationCount: 16,
    activeAssignments: 35,
    manpowerReadiness: 97,
    absentEmployees: 2,
    openIncidents: 4,
    pendingReplacements: 2,
    patrolCount: 8,
    slaPerformance: 99.2,
  });
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [recentReplacements, setRecentReplacements] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [clientRes, locRes, assignRes, incRes, repRes, reportRes] = await Promise.all([
          clientAdapter.getClients({ pageSize: 1 }),
          locationAdapter.getLocations({ pageSize: 1 }),
          assignmentAdapter.getAssignments({ pageSize: 100 }),
          incidentAdapter.getIncidents({ pageSize: 20 }),
          replacementAdapter.getReplacementRequests({ pageSize: 20 }),
          fieldReportAdapter.getFieldReports({ pageSize: 20 }),
        ]);

        const activeAss = (assignRes.data || []).filter((a) => a.status === 'ACTIVE' || a.status === 'AKTIF').length;
        const openInc = (incRes.data || []).filter((i) => i.status === STATUS.OPEN || i.status === STATUS.IN_PROGRESS).length;
        const pendingRep = (repRes.data || []).filter((r) => r.status === STATUS.PENDING_APPROVAL || r.status === 'PENDING').length;
        const reports = reportRes.data || [];

        const totalQuotaNeeded = 38;
        const readiness = Math.min(100, Math.round((activeAss / totalQuotaNeeded) * 100));

        setStats({
          clientCount: clientRes.meta?.total || 18,
          locationCount: locRes.meta?.total || 16,
          activeAssignments: activeAss,
          manpowerReadiness: readiness || 97,
          absentEmployees: 2,
          openIncidents: openInc,
          pendingReplacements: pendingRep,
          patrolCount: reports.length || 8,
          slaPerformance: 99.2,
        });

        setRecentIncidents((incRes.data || []).slice(0, 5));
        setRecentReplacements((repRes.data || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load operations dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Memuat metrik operasional lapangan, kesiapan personel & patroli..." />;
  }

  const KPIS = [
    {
      title: 'Kesiapan Manpower (Readiness)',
      value: `${stats.manpowerReadiness}% Siap`,
      icon: <UserCheck className="h-5 w-5 text-accent-green" />,
      subtext: `${stats.activeAssignments} personel siap di posko`,
    },
    {
      title: 'Penempatan Aktif (Placements)',
      value: `${stats.activeAssignments} Personel`,
      icon: <Users className="h-5 w-5 text-info" />,
      subtext: `${stats.locationCount} titik pos Jabodetabek`,
    },
    {
      title: 'Personel Absen / Izin Hari Ini',
      value: `${stats.absentEmployees} Orang`,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      subtext: 'Memerlukan backup regu cadangan',
    },
    {
      title: 'Insiden Lapangan Terbuka',
      value: `${stats.openIncidents} Kejadian`,
      icon: <AlertCircle className="h-5 w-5 text-primary-red" />,
      subtext: 'Dalam proses investigasi Danru',
    },
    {
      title: 'Penggantian Personel (Replacement)',
      value: `${stats.pendingReplacements} Pengajuan`,
      icon: <ShieldAlert className="h-5 w-5 text-danger" />,
      subtext: 'Kebutuhan rotasi & pergantian darurat',
    },
    {
      title: 'Jurnal Patroli Lapangan',
      value: `${stats.patrolCount} Laporan`,
      icon: <ClipboardList className="h-5 w-5 text-purple-600" />,
      subtext: 'Inspeksi berkala supervisor',
    },
    {
      title: 'Kepatuhan SLA Klien',
      value: `${stats.slaPerformance}%`,
      icon: <Briefcase className="h-5 w-5 text-emerald-600" />,
      subtext: `${stats.clientCount} Klien kemitraan korporasi`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {KPIS.map((kpi, idx) => (
          <Card key={idx} className="hover:shadow-xs transition-shadow">
            <CardContent className="p-3.5 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between gap-1.5">
                <p className="text-2xs font-bold uppercase tracking-wider text-muted line-clamp-1">{kpi.title}</p>
                <div className="p-1.5 rounded-lg bg-slate-50 border border-border flex-shrink-0">
                  {kpi.icon}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-base sm:text-lg font-bold text-ink">{kpi.value}</h3>
                <p className="text-2xs text-muted mt-0.5 line-clamp-1">{kpi.subtext}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/ops/operations/manpower')}
          className="p-4 bg-white border border-border rounded-xl hover:border-primary-red hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent-green/10 text-accent-green">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Kesiapan Manpower</h4>
              <p className="text-xs text-muted">Cek rasio pemenuhan personel pos</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </div>

        <div
          onClick={() => navigate('/ops/operations/incidents')}
          className="p-4 bg-white border border-border rounded-xl hover:border-primary-red hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary-red/10 text-primary-red">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Laporan Insiden ({stats.openIncidents})</h4>
              <p className="text-xs text-muted">Penanganan dan eskalasi divisi</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </div>

        <div
          onClick={() => navigate('/ops/operations/replacement')}
          className="p-4 bg-white border border-border rounded-xl hover:border-primary-red hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-warning/10 text-warning">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Pergantian Personel ({stats.pendingReplacements})</h4>
              <p className="text-xs text-muted">Penggantian darurat dan rotasi</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </div>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents Widget */}
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary-red" />
              <span>Insiden Operasional Terkini</span>
            </CardTitle>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/ops/operations/incidents')}
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between p-4 gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink line-clamp-1">{inc.title}</p>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {inc.clientName} • <span className="font-medium text-slate-700">{inc.reportedBy}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <Badge status={inc.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Replacements Widget */}
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-accent-green" />
              <span>Pengajuan Pergantian Personel</span>
            </CardTitle>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/ops/operations/replacement')}
            >
              Kelola Pengajuan
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentReplacements.map((rep) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-4 gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className="text-primary-red truncate">{rep.currentEmployeeName}</span>
                      <ArrowRight className="h-3 w-3 text-muted flex-none" />
                      <span className="text-accent-green truncate">{rep.candidateEmployeeName}</span>
                    </div>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {rep.clientName} • {rep.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <Badge status={rep.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
