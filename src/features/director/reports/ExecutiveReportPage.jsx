/**
 * ExecutiveReportPage — Monthly BOD Executive Management Reports
 * Source of Truth: PRD Section 6.1 (Direktur: Management Reports), Section 10,
 * Section 18 (Cross-department summary), IMPLEMENTATION-PLAN Phase 10.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Printer, Calendar, Download, Building2,
  DollarSign, Users, ShieldCheck, RefreshCw, CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import directorAdapter from '@/services/adapters/directorAdapter';
import toast from 'react-hot-toast';

export default function ExecutiveReportPage() {
  const [period, setPeriod] = useState('September 2026');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await directorAdapter.getExecutiveReportData(period);
      if (res.data) {
        setReport(res.data);
      }
    } catch (err) {
      console.error('Failed to load executive report', err);
      toast.error('Gagal memuat laporan eksekutif.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-red" />
            Laporan Kinerja Manajemen & Dewan Direksi (BOD)
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Format laporan bulanan resmi siap cetak / ekspor PDF untuk pertanggungjawaban operasional dan keuangan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-border rounded-lg text-ink font-semibold"
            >
              <option value="September 2026">September 2026</option>
              <option value="Agustus 2026">Agustus 2026</option>
              <option value="Juli 2026">Juli 2026</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchReport}
            title="Muat Ulang"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-primary-red hover:bg-red-700 text-white font-medium"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>

      {loading || !report ? (
        <div className="p-12 text-center text-xs text-muted bg-white rounded-xl border border-border">
          <RefreshCw className="h-6 w-6 text-primary-red animate-spin mx-auto mb-2" />
          Menyusun lembar laporan eksekutif {period}...
        </div>
      ) : (
        /* Printable Report Container */
        <div className="bg-white rounded-xl border border-border shadow-xs p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">
          {/* 1. Official Header */}
          <div className="border-b-2 border-ink pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-red flex items-center justify-center text-white font-black text-sm">
                  B
                </span>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-ink uppercase">
                    PT. Bhimasena Adhirajasa Radhika
                  </h1>
                  <p className="text-2xs font-semibold text-primary-red tracking-wider uppercase">
                    Integrated Outsourcing Management System (BARAK IOMS)
                  </p>
                </div>
              </div>
              <p className="text-2xs text-muted mt-2">
                Izin Operasional Mabes Polri: SIO/BUJP/POLRI/2024/0912 · Gedung Wisma Barak Lt. 3, Jakarta Barat
              </p>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-md font-bold text-ink uppercase text-2xs mb-1">
                Laporan Kinerja Bulanan
              </span>
              <p className="font-bold text-ink">Periode: {report.period}</p>
              <p className="text-2xs text-muted mt-0.5 font-mono">
                Dicetak: {new Date(report.reportGeneratedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          {/* 2. Executive Financial Summary Cards */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              1. Ikhtisar Finansial & Margin Operasional
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-muted">Omzet Penagihan (Billing)</p>
                <p className="text-base sm:text-lg font-bold text-ink font-mono mt-1">
                  Rp {report.summary.monthlyRevenue.toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-muted mt-0.5">Total penerbitan faktur</p>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200">
                <p className="text-xs text-rose-700">Total Beban Payroll</p>
                <p className="text-base sm:text-lg font-bold text-rose-900 font-mono mt-1">
                  Rp {report.summary.monthlyPayroll.toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-rose-600 mt-0.5">40 karyawan penugasan</p>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <p className="text-xs text-emerald-800">Estimasi Gross Margin</p>
                <p className="text-base sm:text-lg font-bold text-emerald-900 font-mono mt-1">
                  Rp {report.summary.grossMarginEstimate.toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-emerald-700 mt-0.5 font-semibold">
                  Rasio Margin: {report.summary.grossMarginPercentage}%
                </p>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-800">Total Piutang Berjalan</p>
                <p className="text-base sm:text-lg font-bold text-blue-900 font-mono mt-1">
                  Rp {report.summary.outstandingReceivables.toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-blue-700 mt-0.5 font-semibold">
                  Collection Ratio: {report.summary.collectionRatio}%
                </p>
              </div>
            </div>
          </div>

          {/* 3. Service Breakdown Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary-red" />
              2. Kinerja & Kontribusi 6 Bidang Layanan Outsourcing
            </h2>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-muted uppercase text-2xs tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Bidang Layanan</th>
                    <th className="px-4 py-3 font-semibold text-center">Jumlah Personel</th>
                    <th className="px-4 py-3 font-semibold text-right">Kontribusi Omzet</th>
                    <th className="px-4 py-3 font-semibold text-center">Estimasi Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.breakdownByService.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-ink">{item.service}</td>
                      <td className="px-4 py-3 text-center font-mono">{item.count} Personel</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-emerald-700">
                        Rp {item.revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-ink">{item.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Top Clients Portfolio */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-indigo-600" />
              3. Portofolio & Kelancaran Kemitraan Klien Utama
            </h2>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-muted uppercase text-2xs tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nama Klien</th>
                    <th className="px-4 py-3 font-semibold">Kategori</th>
                    <th className="px-4 py-3 font-semibold text-center">Plotting Personel</th>
                    <th className="px-4 py-3 font-semibold text-right">Tagihan Rutin / Bln</th>
                    <th className="px-4 py-3 font-semibold text-center">Status Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.clientPortfolio.map((client, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold text-ink">{client.clientName}</td>
                      <td className="px-4 py-2.5 text-muted">{client.type}</td>
                      <td className="px-4 py-2.5 text-center font-mono">{client.quota} Orang</td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium">
                        Rp {client.monthlyBilling.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-2xs font-bold rounded-full">
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Legal, Compliance & Incident Status */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              4. Catatan Kepatuhan Regulasi & Keselamatan Kerja
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-muted block">Legalitas SIO BUJP Polri:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Aktif & Memenuhi Syarat
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-muted block">Tingkat Kehadiran Personel:</span>
                <span className="font-bold text-ink mt-1 block">
                  {report.summary.attendanceRate}% Rata-rata Penugasan
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-muted block">Insiden Fatalitas / Zero Accident:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Zero Accident
                </span>
              </div>
            </div>
          </div>

          {/* 6. Formal Sign-Off Section */}
          <div className="pt-8 border-t border-slate-200">
            <p className="text-xs text-muted mb-6 text-center">
              Laporan manajemen ini disahkan dan ditandatangani oleh pejabat struktural PT. Bhimasena Adhirajasa Radhika.
            </p>
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <p className="text-muted">Disiapkan Oleh,</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="font-serif italic text-slate-400 text-sm">[Nazi Rinaldi / Finance]</span>
                </div>
                <p className="font-bold text-ink">Nazi Rinaldi</p>
                <p className="text-2xs text-muted">Finance & Accounting Manager</p>
              </div>

              <div>
                <p className="text-muted">Diperiksa Oleh,</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="font-serif italic text-slate-400 text-sm">[Zaenal Arifin / HRD]</span>
                </div>
                <p className="font-bold text-ink">Zaenal Arifin</p>
                <p className="text-2xs text-muted">Head of Human Resources</p>
              </div>

              <div>
                <p className="text-muted">Disahkan & Disetujui Oleh,</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="font-serif italic text-primary-red font-bold text-base">
                    Juli Priyanto
                  </span>
                </div>
                <p className="font-bold text-ink">Juli Priyanto</p>
                <p className="text-2xs text-primary-red font-semibold">Direktur Utama PT. BARAK</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
