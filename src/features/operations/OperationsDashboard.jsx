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
import { STATUS } from '@/constants/status';

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clientCount: 0,
    locationCount: 0,
    activeAssignments: 0,
    openIncidents: 0,
    pendingReplacements: 0,
  });
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [recentReplacements, setRecentReplacements] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [clientRes, locRes, assignRes, incRes, repRes] = await Promise.all([
          clientAdapter.getClients({ pageSize: 1 }),
          locationAdapter.getLocations({ pageSize: 1 }),
          assignmentAdapter.getAssignments({ pageSize: 100 }),
          incidentAdapter.getIncidents({ pageSize: 20 }),
          replacementAdapter.getReplacementRequests({ pageSize: 20 }),
        ]);

        const activeAss = (assignRes.data || []).filter((a) => a.status === 'ACTIVE').length;
        const openInc = (incRes.data || []).filter((i) => i.status === STATUS.OPEN || i.status === STATUS.IN_PROGRESS).length;
        const pendingRep = (repRes.data || []).filter((r) => r.status === STATUS.PENDING_APPROVAL).length;

        setStats({
          clientCount: clientRes.meta?.total || 18,
          locationCount: locRes.meta?.total || 16,
          activeAssignments: activeAss,
          openIncidents: openInc,
          pendingReplacements: pendingRep,
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
    return <LoadingState message="Memuat metrik operasional lapangan..." />;
  }

  const KPIS = [
    {
      title: 'Klien Aktif',
      value: `${stats.clientCount} Perusahaan`,
      icon: <Briefcase className="h-5 w-5 text-primary-red" />,
      subtext: 'Kemitraan korporasi aktif',
    },
    {
      title: 'Titik Pos & Lokasi',
      value: `${stats.locationCount} Lokasi`,
      icon: <MapPin className="h-5 w-5 text-info" />,
      subtext: 'Area penugasan Jabodetabek',
    },
    {
      title: 'Penempatan Personel',
      value: `${stats.activeAssignments} Personel`,
      icon: <Users className="h-5 w-5 text-accent-green" />,
      subtext: 'Bertugas di seluruh sektor',
    },
    {
      title: 'Insiden Perlu Respon',
      value: `${stats.openIncidents} Insiden`,
      icon: <AlertCircle className="h-5 w-5 text-warning" />,
      subtext: `${stats.pendingReplacements} Pengajuan pengganti`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi, idx) => (
          <Card key={idx} className="hover:shadow-xs transition-shadow">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{kpi.title}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-ink mt-1">{kpi.value}</h3>
                <p className="text-xs text-muted mt-1">{kpi.subtext}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                {kpi.icon}
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
