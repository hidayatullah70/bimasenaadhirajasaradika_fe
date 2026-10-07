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
        <>
          {/* Stylesheet khusus untuk cetak/simpan PDF agar pas sempurna di 1 lembar A4 portrait */}
          <style>{`
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                height: auto !important;
                min-height: 100% !important;
                overflow: visible !important;
              }
              nav, header, aside, .print\\:hidden {
                display: none !important;
              }
              body * {
                visibility: hidden !important;
              }
              #barak-printable-executive-report, #barak-printable-executive-report * {
                visibility: visible !important;
              }
              #barak-printable-executive-report {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 6mm 10mm !important;
                background: white !important;
                border: none !important;
                box-shadow: none !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              @page {
                size: A4 portrait;
                margin: 0;
              }
            }
          `}</style>

          <div
            id="barak-printable-executive-report"
            className="bg-white rounded-xl border border-border shadow-xs p-6 sm:p-10 space-y-6 print:space-y-2.5 print:p-0 print:border-none print:shadow-none text-ink text-xs leading-normal"
          >
            {/* 1. Official Header */}
            <div className="border-b-2 border-ink pb-4 print:pb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:gap-1">
              <div>
                <div className="flex items-center gap-3 print:gap-2">
                  <img
                    src="/assets/img/logo/logoAja.png"
                    alt="PT. BIMASENA ADHIRAJASA RADIKA"
                    className="w-10 h-10 print:w-8 print:h-8 object-contain flex-none"
                  />
                  <div>
                    <h1 className="text-xl print:text-sm font-black tracking-tight text-ink uppercase leading-none">
                      PT. BIMASENA ADHIRAJASA RADIKA
                    </h1>
                    <p className="text-2xs print:text-[8px] font-bold text-primary-red tracking-wider uppercase mt-1 print:mt-0.5">
                      Integrated Outsourcing Management System (BARAK IOMS)
                    </p>
                  </div>
                </div>
                <p className="text-2xs print:text-[8px] text-muted mt-2 print:mt-0.5 leading-tight">
                  Jl. Melati I RT. 002/RW.005 Kel. Tanah Tinggi Kec. Tangerang Kota Tangerang, Banten 15119
                </p>
              </div>

              <div className="text-left sm:text-right text-xs print:text-[8px]">
                <span className="inline-block px-3 py-1 print:px-2 print:py-0.5 bg-slate-100 rounded-md font-bold text-ink uppercase text-2xs print:text-[7.5px] mb-1 print:mb-0.5">
                  Laporan Kinerja Bulanan
                </span>
                <p className="font-bold text-ink">Periode: {report.period}</p>
                <p className="text-2xs print:text-[7px] text-muted mt-0.5 font-mono">
                  Dicetak: {new Date(report.reportGeneratedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
              </div>
            </div>

            {/* 2. Executive Financial Summary Cards */}
            <div>
              <h2 className="text-xs print:text-[8.5px] font-bold uppercase tracking-wider text-muted mb-2 print:mb-1 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 print:h-3 print:w-3 text-emerald-600" />
                1. Ikhtisar Finansial & Margin Operasional
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:gap-1.5">
                <div className="p-3 print:p-1.5 bg-slate-50 rounded-xl print:rounded-md border border-slate-200">
                  <p className="text-xs print:text-[7.5px] text-muted">Omzet Penagihan (Billing)</p>
                  <p className="text-base sm:text-lg print:text-[11px] font-bold text-ink font-mono mt-0.5">
                    Rp {report.summary.monthlyRevenue.toLocaleString('id-ID')}
                  </p>
                  <p className="text-2xs print:text-[7px] text-muted mt-0.5">Total penerbitan faktur</p>
                </div>

                <div className="p-3 print:p-1.5 bg-rose-50/50 rounded-xl print:rounded-md border border-rose-200">
                  <p className="text-xs print:text-[7.5px] text-rose-700">Total Beban Payroll</p>
                  <p className="text-base sm:text-lg print:text-[11px] font-bold text-rose-900 font-mono mt-0.5">
                    Rp {report.summary.monthlyPayroll.toLocaleString('id-ID')}
                  </p>
                  <p className="text-2xs print:text-[7px] text-rose-600 mt-0.5">40 karyawan penugasan</p>
                </div>

                <div className="p-3 print:p-1.5 bg-emerald-50/60 rounded-xl print:rounded-md border border-emerald-200">
                  <p className="text-xs print:text-[7.5px] text-emerald-800">Estimasi Gross Margin</p>
                  <p className="text-base sm:text-lg print:text-[11px] font-bold text-emerald-900 font-mono mt-0.5">
                    Rp {report.summary.grossMarginEstimate.toLocaleString('id-ID')}
                  </p>
                  <p className="text-2xs print:text-[7px] text-emerald-700 mt-0.5 font-semibold">
                    Rasio Margin: {report.summary.grossMarginPercentage}%
                  </p>
                </div>

                <div className="p-3 print:p-1.5 bg-blue-50/60 rounded-xl print:rounded-md border border-blue-200">
                  <p className="text-xs print:text-[7.5px] text-blue-800">Total Piutang Berjalan</p>
                  <p className="text-base sm:text-lg print:text-[11px] font-bold text-blue-900 font-mono mt-0.5">
                    Rp {report.summary.outstandingReceivables.toLocaleString('id-ID')}
                  </p>
                  <p className="text-2xs print:text-[7px] text-blue-700 mt-0.5 font-semibold">
                    Collection Ratio: {report.summary.collectionRatio}%
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Service Breakdown Table */}
            <div>
              <h2 className="text-xs print:text-[8.5px] font-bold uppercase tracking-wider text-muted mb-2 print:mb-1 flex items-center gap-1.5">
                <Users className="h-4 w-4 print:h-3 print:w-3 text-primary-red" />
                2. Kinerja & Kontribusi 6 Bidang Layanan Outsourcing
              </h2>
              <div className="border border-border rounded-xl print:rounded-md overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm print:text-[7.5px]">
                  <thead className="bg-slate-50 text-muted uppercase text-2xs print:text-[7px] tracking-wider border-b border-border">
                    <tr>
                      <th className="px-4 py-2 print:px-2 print:py-0.5 font-semibold">Bidang Layanan</th>
                      <th className="px-4 py-2 print:px-2 print:py-0.5 font-semibold text-center">Jumlah Personel</th>
                      <th className="px-4 py-2 print:px-2 print:py-0.5 font-semibold text-right">Kontribusi Omzet</th>
                      <th className="px-4 py-2 print:px-2 print:py-0.5 font-semibold text-center">Estimasi Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.breakdownByService.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 print:px-2 print:py-0.5 font-semibold text-ink">{item.service}</td>
                        <td className="px-4 py-2 print:px-2 print:py-0.5 text-center font-mono">{item.count} Personel</td>
                        <td className="px-4 py-2 print:px-2 print:py-0.5 text-right font-mono font-medium text-emerald-700">
                          Rp {item.revenue.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-2 print:px-2 print:py-0.5 text-center font-semibold text-ink">{item.margin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Top Clients Portfolio */}
            <div>
              <h2 className="text-xs print:text-[8.5px] font-bold uppercase tracking-wider text-muted mb-2 print:mb-1 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 print:h-3 print:w-3 text-indigo-600" />
                3. Portofolio & Kelancaran Kemitraan Klien Utama
              </h2>
              <div className="border border-border rounded-xl print:rounded-md overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm print:text-[7.5px]">
                  <thead className="bg-slate-50 text-muted uppercase text-2xs print:text-[7px] tracking-wider border-b border-border">
                    <tr>
                      <th className="px-4 py-2 print:px-2 print:py-0.5 font-semibold">Nama Klien</th>
                      <th className="px-4 py-2 print:px-2 print:py-0.5 font-semibold">Kategori</th>
                      <th className="px-4 py-2 print:px-2 print:py-0.5 font-semibold text-center">Plotting Personel</th>
                      <th className="px-4 py-2 print:px-2 print:py-0.5 font-semibold text-right">Tagihan Rutin / Bln</th>
                      <th className="px-4 py-2 print:px-2 print:py-0.5 font-semibold text-center">Status Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.clientPortfolio.map((client, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-1.5 print:px-2 print:py-[2px] font-semibold text-ink">{client.clientName}</td>
                        <td className="px-4 py-1.5 print:px-2 print:py-[2px] text-muted">{client.type}</td>
                        <td className="px-4 py-1.5 print:px-2 print:py-[2px] text-center font-mono">{client.quota} Orang</td>
                        <td className="px-4 py-1.5 print:px-2 print:py-[2px] text-right font-mono font-medium">
                          Rp {client.monthlyBilling.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-1.5 print:px-2 print:py-[2px] text-center">
                          <span className="px-2 py-0.5 print:px-1.5 print:py-0 bg-emerald-100 text-emerald-800 text-2xs print:text-[6.5px] font-bold rounded-full">
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
            <div className="p-3 print:p-1.5 bg-slate-50 border border-slate-200 rounded-xl print:rounded-md space-y-2 print:space-y-1">
              <h2 className="text-xs print:text-[8.5px] font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 print:h-3 print:w-3 text-emerald-600" />
                4. Catatan Kepatuhan Regulasi & Keselamatan Kerja
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 print:gap-1.5 text-xs print:text-[7.5px]">
                <div className="p-2.5 print:p-1 bg-white rounded-lg print:rounded-md border border-slate-200">
                  <span className="text-muted block text-2xs print:text-[7px]">Legalitas SIO BUJP Polri:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 print:h-2.5 print:w-2.5" /> Aktif & Memenuhi Syarat
                  </span>
                </div>
                <div className="p-2.5 print:p-1 bg-white rounded-lg print:rounded-md border border-slate-200">
                  <span className="text-muted block text-2xs print:text-[7px]">Tingkat Kehadiran Personel:</span>
                  <span className="font-bold text-ink mt-0.5 block">
                    {report.summary.attendanceRate}% Rata-rata Penugasan
                  </span>
                </div>
                <div className="p-2.5 print:p-1 bg-white rounded-lg print:rounded-md border border-slate-200">
                  <span className="text-muted block text-2xs print:text-[7px]">Insiden Fatalitas / Zero Accident:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 print:h-2.5 print:w-2.5" /> 100% Zero Accident
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Formal Sign-Off Section */}
            <div className="pt-4 print:pt-1.5 border-t border-slate-200">
              <p className="text-xs print:text-[7px] text-muted mb-3 print:mb-1 text-center">
                Laporan manajemen ini disahkan dan ditandatangani oleh pejabat struktural PT. BIMASENA ADHIRAJASA RADIKA.
              </p>
              <div className="grid grid-cols-3 gap-4 print:gap-2 text-center text-xs print:text-[7.5px]">
                <div>
                  <p className="text-muted print:text-[7px]">Disiapkan Oleh,</p>
                  <div className="h-14 print:h-7 flex items-center justify-center">
                  </div>
                  <p className="font-bold text-ink print:text-[8px]">Nazi Rinaldi</p>
                  <p className="text-2xs print:text-[7px] text-muted">Finance & Accounting Manager</p>
                </div>

                <div>
                  <p className="text-muted print:text-[7px]">Diperiksa Oleh,</p>
                  <div className="h-14 print:h-7 flex items-center justify-center">
                  </div>
                  <p className="font-bold text-ink print:text-[8px]">Zaenal Arifin</p>
                  <p className="text-2xs print:text-[7px] text-muted">Head of Human Resources</p>
                </div>

                <div>
                  <p className="text-muted print:text-[7px]">Disahkan & Disetujui Oleh,</p>
                  <div className="h-14 print:h-7 flex items-center justify-center">
                  </div>
                  <p className="font-bold text-ink print:text-[8px]">Juli Priyanto</p>
                  <p className="text-2xs print:text-[7px] text-primary-red font-semibold">Direktur Utama</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
