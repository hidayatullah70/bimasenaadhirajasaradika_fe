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
    totalExpenses: 0,
    netCashFlow: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [activeCODCases, setActiveCODCases] = useState([]);
  const [cashFlowData, setCashFlowData] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [recRes, invRes, periodsRes, codRes, cashRes] = await Promise.all([
          invoiceAdapter.getReceivablesSummary(),
          invoiceAdapter.getInvoices({ pageSize: 5 }),
          payrollAdapter.getPayrollPeriods(),
          codAdapter.getCODCases({ pageSize: 5 }),
          invoiceAdapter.getCashFlowSummary(),
        ]);

        const recData = recRes.data || {};
        const latestPeriod = (periodsRes.data || [])[2] || (periodsRes.data || [])[0] || {};
        const cases = codRes.data || [];
        const discrepancyTotal = cases.reduce((sum, c) => sum + c.outstandingAmount, 0);
        const cashFlow = cashRes.data || {};

        setStats({
          totalIssued: recData.totalIssued || 0,
          totalOutstanding: recData.totalOutstanding || 0,
          overdueAmount: recData.overdueAmount || 0,
          payrollNet: latestPeriod.totalNet || 0,
          payrollStatus: latestPeriod.status || 'DRAFT',
          codDiscrepancy: discrepancyTotal,
          codCasesCount: cases.length,
          totalExpenses: cashFlow.totalExpenses || 0,
          netCashFlow: cashFlow.netCashFlow || 0,
        });

        setCashFlowData(cashFlow);
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
    return <LoadingState message="Memuat metrik keuangan, biaya operasional & arus kas..." />;
  }

  const KPIS = [
    {
      title: 'Piutang Berjalan Klien',
      value: `Rp ${(stats.totalOutstanding / 1000000).toFixed(1)} Jt`,
      icon: <DollarSign className="h-5 w-5 text-warning" />,
      subtext: `Dari Rp ${(stats.totalIssued / 1000000).toFixed(1)} Jt faktur`,
    },
    {
      title: 'Piutang Jatuh Tempo (Overdue)',
      value: `Rp ${(stats.overdueAmount / 1000000).toFixed(1)} Jt`,
      icon: <AlertTriangle className="h-5 w-5 text-primary-red" />,
      subtext: 'Memerlukan surat peringatan',
    },
    {
      title: 'Payroll Bulan Berjalan',
      value: `Rp ${(stats.payrollNet / 1000000).toFixed(1)} Jt`,
      icon: <CreditCard className="h-5 w-5 text-info" />,
      subtext: `Status: ${stats.payrollStatus}`,
    },
    {
      title: 'Beban Operasional & CapEx',
      value: `Rp ${(stats.totalExpenses / 1000000).toFixed(1)} Jt`,
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      subtext: 'Sewa, seragam, BBM, BPJS',
    },
    {
      title: 'Estimasi Arus Kas Bersih',
      value: `Rp ${(stats.netCashFlow / 1000000).toFixed(1)} Jt`,
      icon: <CheckCircle2 className="h-5 w-5 text-accent-green" />,
      subtext: 'Inflow dikurangi beban operasional',
    },
    {
      title: 'Selisih Kas COD Ekspedisi',
      value: `Rp ${(stats.codDiscrepancy / 1000000).toFixed(2)} Jt`,
      icon: <ArrowLeftRight className="h-5 w-5 text-amber-600" />,
      subtext: `${stats.codCasesCount} kasus dalam penanganan`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPIS.map((kpi, idx) => (
          <Card key={idx} className="hover:shadow-xs transition-shadow">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between gap-2">
                <p className="text-2xs font-semibold uppercase tracking-wider text-muted line-clamp-1">{kpi.title}</p>
                <div className="p-2 rounded-lg bg-slate-50 border border-border flex-shrink-0">
                  {kpi.icon}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-lg sm:text-xl font-bold text-ink">{kpi.value}</h3>
                <p className="text-2xs text-muted mt-0.5 line-clamp-1">{kpi.subtext}</p>
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


      {/* Cash Flow & Operational Expenses Breakdown */}
      {cashFlowData && (
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-ink flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-green" />
              <span>Ringkasan Arus Kas Operasional ({cashFlowData.periodLabel})</span>
            </CardTitle>
            <span className="text-xs text-muted">
              {cashFlowData.pendingExpenses > 0 ? `${cashFlowData.pendingExpenses} pengajuan beban pending persetujuan` : 'Semua beban operasional terverifikasi'}
            </span>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center sm:divide-x sm:divide-border">
              <div className="p-2">
                <p className="text-xs text-muted">Penerimaan Kas Masuk (Inflow)</p>
                <p className="text-lg font-bold text-accent-green mt-1">
                  Rp {(cashFlowData.totalInflow || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-muted mt-0.5">Dari pelunasan tagihan klien</p>
              </div>
              <div className="p-2">
                <p className="text-xs text-muted">Beban Operasional & Pengadaan</p>
                <p className="text-lg font-bold text-purple-700 mt-1">
                  Rp {(cashFlowData.totalExpenses || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-muted mt-0.5">Sewa, BBM, logistik & BPJS</p>
              </div>
              <div className="p-2">
                <p className="text-xs text-muted">Beban Payroll Personel</p>
                <p className="text-lg font-bold text-primary-red mt-1">
                  Rp {(cashFlowData.payrollEstimate || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-muted mt-0.5">Gaji pokok, tunjangan & lembur</p>
              </div>
              <div className="p-2">
                <p className="text-xs text-muted">Saldo Kas Operasional Bersih</p>
                <p className={`text-lg font-bold mt-1 ${cashFlowData.netCashFlow >= 0 ? 'text-accent-green' : 'text-danger'}`}>
                  Rp {(cashFlowData.netCashFlow || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-muted mt-0.5">Likuiditas kas PT. BARAK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

