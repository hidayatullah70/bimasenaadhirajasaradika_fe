/**
 * Finance Dashboard Overview — PT. BARAK IOMS
 * Source of Truth: PRD Section 14 (Finance Module), Section 18 (Cross-department workflow).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  AlertTriangle,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Clock,
  ArrowLeftRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/StateViews';
import invoiceAdapter from '@/services/adapters/invoiceAdapter';
import payrollAdapter from '@/services/adapters/payrollAdapter';
import codAdapter from '@/services/adapters/codAdapter';
import { STATUS } from '@/constants/status';

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIssued: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    payrollNet: 0,
    payrollStatus: '',
    codDiscrepancy: 0,
    codCasesCount: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [activeCODCases, setActiveCODCases] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [recRes, invRes, periodsRes, codRes] = await Promise.all([
          invoiceAdapter.getReceivablesSummary(),
          invoiceAdapter.getInvoices({ pageSize: 5 }),
          payrollAdapter.getPayrollPeriods(),
          codAdapter.getCODCases({ pageSize: 5 }),
        ]);

        const recData = recRes.data || {};
        const latestPeriod = (periodsRes.data || [])[2] || (periodsRes.data || [])[0] || {};
        const cases = codRes.data || [];
        const discrepancyTotal = cases.reduce((sum, c) => sum + c.outstandingAmount, 0);

        setStats({
          totalIssued: recData.totalIssued || 0,
          totalOutstanding: recData.totalOutstanding || 0,
          overdueAmount: recData.overdueAmount || 0,
          payrollNet: latestPeriod.totalNet || 0,
          payrollStatus: latestPeriod.status || 'DRAFT',
          codDiscrepancy: discrepancyTotal,
          codCasesCount: cases.length,
        });

        if (invRes.data) setRecentInvoices(invRes.data.slice(0, 5));
        setActiveCODCases(cases.filter((c) => c.outstandingAmount > 0).slice(0, 4));
      } catch (err) {
        console.error('Failed to load finance dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Memuat metrik keuangan & penagihan..." />;
  }

  const KPIS = [
    {
      title: 'Piutang Berjalan Klien',
      value: `Rp ${(stats.totalOutstanding / 1000000).toFixed(1)} Jt`,
      icon: <DollarSign className="h-5 w-5 text-warning" />,
      subtext: `Dari Rp ${(stats.totalIssued / 1000000).toFixed(1)} Jt diterbitkan`,
    },
    {
      title: 'Piutang Jatuh Tempo (Overdue)',
      value: `Rp ${(stats.overdueAmount / 1000000).toFixed(1)} Jt`,
      icon: <AlertTriangle className="h-5 w-5 text-primary-red" />,
      subtext: 'Memerlukan surat penagihan',
    },
    {
      title: 'Payroll Bulan Berjalan',
      value: `Rp ${(stats.payrollNet / 1000000).toFixed(1)} Jt`,
      icon: <CreditCard className="h-5 w-5 text-info" />,
      subtext: `Status: ${stats.payrollStatus}`,
    },
    {
      title: 'Selisih Kas COD Ekspedisi',
      value: `Rp ${(stats.codDiscrepancy / 1000000).toFixed(2)} Jt`,
      icon: <ArrowLeftRight className="h-5 w-5 text-accent-green" />,
      subtext: `${stats.codCasesCount} kasus dalam penanganan`,
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
          onClick={() => navigate('/ops/finance/invoices')}
          className="p-4 bg-white border border-border rounded-xl hover:border-primary-red hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-info/10 text-info">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Faktur & Piutang</h4>
              <p className="text-xs text-muted">Tagihan klien & pencatatan bayar</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </div>

        <div
          onClick={() => navigate('/ops/finance/payroll')}
          className="p-4 bg-white border border-border rounded-xl hover:border-primary-red hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent-green/10 text-accent-green">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Penggajian (Payroll)</h4>
              <p className="text-xs text-muted">Slip gaji 40 personel & approval</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </div>

        <div
          onClick={() => navigate('/ops/finance/cod')}
          className="p-4 bg-white border border-border rounded-xl hover:border-primary-red hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary-red/10 text-primary-red">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Rekonsiliasi COD</h4>
              <p className="text-xs text-muted">Selisih setoran & eskalasi legal</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </div>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices Widget */}
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary-red" />
              <span>Faktur Tagihan Terkini</span>
            </CardTitle>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/ops/finance/invoices')}
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink line-clamp-1">{inv.clientName}</p>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {inv.invoiceNumber} • <span className="font-semibold text-ink">Rp {inv.totalAmount.toLocaleString('id-ID')}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <Badge status={inv.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* COD Cases Widget */}
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-warning" />
              <span>Kasus Selisih COD dalam Penanganan</span>
            </CardTitle>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/ops/finance/cod')}
            >
              Kelola Kasus
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {activeCODCases.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">
                      Kurir: {c.courierName} ({c.clientName})
                    </p>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      Kurang Setor: <span className="font-bold text-primary-red">Rp {c.outstandingAmount.toLocaleString('id-ID')}</span> • Tempo: {c.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.legalStatus === 'ESCALATED_TO_LEGAL'
                          ? 'bg-primary-red text-white'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {c.legalStatus === 'ESCALATED_TO_LEGAL' ? 'LEGAL' : 'PENAGIHAN'}
                    </span>
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
