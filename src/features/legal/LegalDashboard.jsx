/**
 * Legal Dashboard Overview — PT. BARAK IOMS
 * Source of Truth: PRD Section 6.3 & Section 12 (Legal Module).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/StateViews';
import legalAdapter from '@/services/adapters/legalAdapter';
import { STATUS } from '@/constants/status';

export default function LegalDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCases: 0,
    codEscalated: 0,
    expiringContracts: 0,
    compliantLicenses: 0,
  });
  const [recentCases, setRecentCases] = useState([]);
  const [expiringContractsList, setExpiringContractsList] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [casesRes, contractsRes, complianceRes] = await Promise.all([
          legalAdapter.getLegalCases({ pageSize: 10 }),
          legalAdapter.getContracts(),
          legalAdapter.getComplianceRegister(),
        ]);

        const cases = casesRes.data || [];
        const contracts = contractsRes.data || [];
        const compliance = complianceRes.data || [];

        const codCount = cases.filter((c) => c.caseType === 'COD_DISPUTE').length;
        const expiring = contracts.filter((c) => c.status === STATUS.EXPIRING).length;
        const compliant = compliance.filter((i) => i.status === 'COMPLIANT').length;

        setStats({
          activeCases: cases.filter((c) => c.status !== STATUS.CLOSED).length,
          codEscalated: codCount,
          expiringContracts: expiring,
          compliantLicenses: compliant,
        });

        setRecentCases(cases.slice(0, 5));
        setExpiringContractsList(contracts.filter((c) => c.status === STATUS.EXPIRING).slice(0, 4));
      } catch (err) {
        console.error('Failed to load legal dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Memuat metrik hukum & kepatuhan..." />;
  }

  const KPIS = [
    {
      title: 'Perkara Hukum Aktif',
      value: `${stats.activeCases} Kasus`,
      icon: <Scale className="h-5 w-5 text-primary-red" />,
      subtext: 'Dalam penanganan & mediasi',
    },
    {
      title: 'Kasus COD Dilimpahkan',
      value: `${stats.codEscalated} Kasus`,
      icon: <AlertTriangle className="h-5 w-5 text-danger" />,
      subtext: 'Somasi kurir & penjamin kerja',
    },
    {
      title: 'Kontrak PKS Perlu Perpanjangan',
      value: `${stats.expiringContracts} PKS Klien`,
      icon: <FileText className="h-5 w-5 text-warning" />,
      subtext: 'Berakhir dalam 60 hari',
    },
    {
      title: 'Perizinan SIO BUJP Sah',
      value: `${stats.compliantLicenses} Lisensi Patuh`,
      icon: <ShieldCheck className="h-5 w-5 text-accent-green" />,
      subtext: 'Mabes Polri & Polda Metro',
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
          onClick={() => navigate('/ops/legal/cases')}
          className="p-4 bg-white border border-border rounded-xl hover:border-primary-red hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary-red/10 text-primary-red">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Kasus Hukum & Somasi</h4>
              <p className="text-xs text-muted">Penanganan perkara & pelimpahan COD</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </div>

        <div
          onClick={() => navigate('/ops/legal/contracts')}
          className="p-4 bg-white border border-border rounded-xl hover:border-primary-red hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-warning/10 text-warning">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Kontrak & PKS Klien</h4>
              <p className="text-xs text-muted">Masa berlaku perjanjian & adendum</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </div>

        <div
          onClick={() => navigate('/ops/legal/compliance')}
          className="p-4 bg-white border border-border rounded-xl hover:border-primary-red hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent-green/10 text-accent-green">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Perizinan SIO BUJP</h4>
              <p className="text-xs text-muted">Legalitas badan usaha Mabes Polri</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </div>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases Widget */}
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary-red" />
              <span>Berkas Perkara Hukum Terkini</span>
            </CardTitle>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/ops/legal/cases')}
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentCases.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink line-clamp-1">{c.subject}</p>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {c.caseNumber} • <span className="font-semibold text-primary-red">{c.targetEntity}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <Badge status={c.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Contracts Widget */}
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
              <FileText className="h-4 w-4 text-warning" />
              <span>PKS Klien Mendekati Jatuh Tempo</span>
            </CardTitle>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/ops/legal/contracts')}
            >
              Kelola Kontrak
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {expiringContractsList.map((ctr) => (
                <div
                  key={ctr.id}
                  className="flex items-center justify-between p-4 gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{ctr.clientName}</p>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      Berakhir: <span className="font-bold text-primary-red">{ctr.endDate}</span> • {ctr.serviceType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <Badge status={ctr.status} size="xs" />
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
