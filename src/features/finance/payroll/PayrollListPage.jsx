/**
 * Payroll List Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 14 (Payroll Module), Section 18 (Cross-department workflow: Payroll Approval),
 * and Section 20 (Data Model).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Users,
  Building2,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import payrollAdapter from '@/services/adapters/payrollAdapter';
import { STATUS } from '@/constants/status';

export default function PayrollListPage() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('PAYROLL-2026-09');
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [payrollItems, setPayrollItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [periodsRes, itemsRes] = await Promise.all([
        payrollAdapter.getPayrollPeriods(),
        payrollAdapter.getPayrollItems(selectedPeriodId, { search, position: selectedRole }),
      ]);

      if (periodsRes.data) {
        setPeriods(periodsRes.data);
        const cur = periodsRes.data.find((p) => p.id === selectedPeriodId) || periodsRes.data[0];
        setCurrentPeriod(cur);
      }
      if (itemsRes.data) setPayrollItems(itemsRes.data);
    } catch (err) {
      console.error('Failed to load payroll data:', err);
      toast.error('Gagal memuat data penggajian.');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriodId, search, selectedRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Alur persetujuan bertingkat
  const handleSubmitToDirector = async () => {
    if (!currentPeriod) return;
    try {
      const res = await payrollAdapter.submitToDirector(currentPeriod.id);
      if (res.error) throw res.error;
      toast.success('Batch payroll berhasil diverifikasi dan diajukan ke Direktur.');
      loadData();
    } catch (err) {
      toast.error(err?.message || 'Gagal mengajukan payroll.');
    }
  };

  const handleApproveDirector = async () => {
    if (!currentPeriod) return;
    try {
      const res = await payrollAdapter.approvePayroll(currentPeriod.id);
      if (res.error) throw res.error;
      toast.success('Batch payroll resmi disetujui Direktur Utama.');
      loadData();
    } catch (err) {
      toast.error(err?.message || 'Gagal menyetujui payroll.');
    }
  };

  const handleProcessDisbursement = async () => {
    if (!currentPeriod) return;
    try {
      const res = await payrollAdapter.processDisbursement(currentPeriod.id);
      if (res.error) throw res.error;
      toast.success('Pencairan dana penggajian berhasil diproses (Disbursed).');
      loadData();
    } catch (err) {
      toast.error(err?.message || 'Gagal memproses pencairan gaji.');
    }
  };

  const handleExportCSV = () => {
    if (!payrollItems.length) return;
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Jabatan',
      'Bank',
      'No Rekening',
      'Gaji Pokok',
      'Tunjangan Jabatan',
      'Tunjangan Makan',
      'Tunjangan Transport',
      'Gaji Bruto',
      'Potongan Terlambat',
      'Potongan Mangkir',
      'Iuran BPJS',
      'Total Potongan',
      'Gaji Bersih (Net)',
    ];

    const rows = payrollItems.map((item) => [
      `"${item.nik}"`,
      `"${item.employeeName}"`,
      `"${item.position}"`,
      `"${item.bankName}"`,
      `"${item.bankAccount}"`,
      item.baseSalary,
      item.positionAllowance,
      item.mealAllowance,
      item.transportAllowance,
      item.grossSalary,
      item.lateDeduction,
      item.absenceDeduction,
      item.bpjsDeduction,
      item.totalDeductions,
      item.netSalary,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Payroll_${currentPeriod?.periodLabel.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rekap payroll CSV berhasil diunduh.');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-red" />
            <span>Rekap Penggajian Personel (Payroll)</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Perhitungan gaji berbasis kehadiran terverifikasi HRD, potongan absensi, iuran BPJS, dan alur persetujuan direksi.
          </p>
        </div>

        {/* Period Selector & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="text-xs font-semibold border border-border rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.periodLabel} ({p.status})
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Bank</span>
          </Button>
        </div>
      </div>

      {/* Workflow Progress Banner */}
      {currentPeriod && (
        <Card className="bg-gradient-to-r from-white to-slate-50 border border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-red/10 text-primary-red">
                    {currentPeriod.periodCode}
                  </span>
                  <Badge status={currentPeriod.status} size="sm" />
                </div>
                <h3 className="text-base font-bold text-ink">
                  Batch Penggajian {currentPeriod.periodLabel} — 40 Karyawan
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted pt-1">
                  <span>HRD Review: <strong className="text-ink">{currentPeriod.reviewedByHRD || 'Selesai'}</strong></span>
                  <span>Finance Review: <strong className="text-ink">{currentPeriod.reviewedByFinance || 'Menunggu'}</strong></span>
                  <span>Approval Direktur: <strong className="text-ink">{currentPeriod.approvedByDirector || 'Menunggu'}</strong></span>
                </div>
              </div>

              {/* Action Buttons based on Workflow */}
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                {(currentPeriod.status === STATUS.DRAFT || currentPeriod.status === 'HRD_REVIEW' || !currentPeriod.reviewedByFinance) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSubmitToDirector}
                    className="gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    <span>Verifikasi Finance</span>
                  </Button>
                )}

                {currentPeriod.status === STATUS.PENDING_APPROVAL && !currentPeriod.approvedByDirector && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApproveDirector}
                    className="gap-1.5 bg-accent-green hover:bg-accent-green/90"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Setujui Payroll (Direktur)</span>
                  </Button>
                )}

                {currentPeriod.status === STATUS.APPROVED && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleProcessDisbursement}
                    className="gap-1.5 bg-primary-red hover:bg-primary-red/90"
                  >
                    <Send className="h-4 w-4" />
                    <span>Proses Pencairan Gaji</span>
                  </Button>
                )}

                {currentPeriod.status === STATUS.PROCESSED && (
                  <div className="flex items-center gap-1.5 text-xs text-accent-green font-semibold bg-accent-green/10 px-3 py-2 rounded-lg border border-accent-green/20">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Gaji Telah Ditransfer ke Rekening Karyawan</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Stats */}
      {currentPeriod && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-info">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Gaji Kotor (Gross)</p>
                <h3 className="text-xl sm:text-2xl font-bold text-ink mt-1">
                  Rp {(currentPeriod.totalGross / 1000000).toFixed(2)} Jt
                </h3>
                <p className="text-xs text-muted mt-1">Gaji pokok & tunjangan operasional</p>
              </div>
              <div className="p-3 rounded-xl bg-info/10 text-info">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Potongan Absensi & BPJS</p>
                <h3 className="text-xl sm:text-2xl font-bold text-warning mt-1">
                  Rp {(currentPeriod.totalDeductions / 1000000).toFixed(2)} Jt
                </h3>
                <p className="text-xs text-muted mt-1">Keterlambatan, mangkir, iuran 3%</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 text-warning">
                <AlertCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent-green">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Gaji Bersih (Net Pay)</p>
                <h3 className="text-xl sm:text-2xl font-bold text-accent-green mt-1">
                  Rp {(currentPeriod.totalNet / 1000000).toFixed(2)} Jt
                </h3>
                <p className="text-xs text-muted mt-1">Alokasi kas transfer perbankan</p>
              </div>
              <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari nama karyawan, NIK, atau posisi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Divisi / Jabatan</option>
                <option value="Security">Security Guard / Danru</option>
                <option value="Kurir">Kurir Logistik</option>
                <option value="Cleaning">Cleaning Service</option>
                <option value="Parkir">Petugas Parkir</option>
                <option value="Staff">Staff / Koordinator</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Items Table */}
      {loading ? (
        <LoadingState message="Memuat rincian slip gaji personel..." />
      ) : payrollItems.length === 0 ? (
        <EmptyState
          title="Tidak Ada Data Karyawan"
          description="Tidak ditemukan data slip gaji dengan kriteria pencarian saat ini."
        />
      ) : (
        <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-muted uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4">Karyawan / NIK</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">Rekening Tujuan</th>
                  <th className="py-3 px-4">Gaji Pokok</th>
                  <th className="py-3 px-4">Tunjangan</th>
                  <th className="py-3 px-4">Potongan Absensi</th>
                  <th className="py-3 px-4">Iuran BPJS</th>
                  <th className="py-3 px-4 text-right">Gaji Bersih (Net)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payrollItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-ink block">{item.employeeName}</span>
                      <span className="text-[11px] text-muted block mt-0.5">{item.nik}</span>
                    </td>
                    <td className="py-3 px-4 text-ink font-medium">
                      {item.position || 'Security Guard'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      <span className="text-ink font-semibold">{item.bankName}</span>
                      <span className="text-[11px] text-muted block">{item.bankAccount}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-ink">
                      Rp {item.baseSalary.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-accent-green font-medium">
                      +Rp {(item.positionAllowance + item.mealAllowance + item.transportAllowance).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-primary-red font-medium">
                      {item.lateDeduction + item.absenceDeduction > 0
                        ? `-Rp ${(item.lateDeduction + item.absenceDeduction).toLocaleString('id-ID')}`
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      -Rp {item.bpjsDeduction.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sm text-ink">
                      Rp {item.netSalary.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
