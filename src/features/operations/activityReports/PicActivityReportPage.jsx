/**
 * PIC Activity Report Page — PT. BARAK IOMS
 * Halaman Laporan Kegiatan Lapangan Koordinator Lapangan (PIC 1 - PIC 8).
 * Fitur: Form Input dengan Auto Resize 16:9, Rekap Mingguan, Rekap Bulanan, dan Integrasi Operasional.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClipboardCheck, Plus, Search, Calendar, MapPin, Building2,
  UserCheck, ShieldCheck, Download, BarChart2,
  TrendingUp, Award, Layers,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import { PIC_LIST, VISIT_REGIONS } from '@/services/mock/mockPicActivityData';
import picActivityReportAdapter from '@/services/adapters/picActivityReportAdapter';
import PicActivityFormModal from './PicActivityFormModal';
import PicActivityDetailModal from './PicActivityDetailModal';
import { useAuth } from '@/app/providers/AuthProvider';
import toast from 'react-hot-toast';

export default function PicActivityReportPage() {
  const { currentUser } = useAuth();
  const canVerify = currentUser?.role === 'OPERASIONAL' || currentUser?.role === 'DIREKTUR';

  // Active view tab: 'LIST' | 'WEEKLY' | 'MONTHLY'
  const [activeTab, setActiveTab] = useState('LIST');

  // Reports state
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedPic, setSelectedPic] = useState('SEMUA');
  const [selectedRegion, setSelectedRegion] = useState('SEMUA');
  const [selectedMonth, setSelectedMonth] = useState('09');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await picActivityReportAdapter.getReports({
        search,
        picName: selectedPic,
        region: selectedRegion,
        month: activeTab === 'MONTHLY' ? selectedMonth : '',
        year: selectedYear,
      });
      if (res.data?.reports) {
        setReports(res.data.reports);
      }
    } catch {
      toast.error('Gagal memuat laporan kegiatan lapangan.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedPic, selectedRegion, selectedMonth, selectedYear, activeTab]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Weekly Rekap Calculations
  const weeklyStats = useMemo(() => {
    const weeks = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    reports.forEach((r) => {
      const w = r.mingguKe || 1;
      if (!weeks[w]) weeks[w] = [];
      weeks[w].push(r);
    });

    const picWeeklyCounts = {};
    PIC_LIST.forEach((p) => {
      picWeeklyCounts[p] = { total: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    });

    reports.forEach((r) => {
      if (picWeeklyCounts[r.picName]) {
        picWeeklyCounts[r.picName].total += 1;
        const w = r.mingguKe || 1;
        if (picWeeklyCounts[r.picName][w] !== undefined) {
          picWeeklyCounts[r.picName][w] += 1;
        }
      }
    });

    return { weeks, picWeeklyCounts };
  }, [reports]);

  // Monthly Rekap Calculations
  const monthlyStats = useMemo(() => {
    const picMonthlyCounts = {};
    PIC_LIST.forEach((p) => {
      picMonthlyCounts[p] = { total: 0, verified: 0, locations: new Set() };
    });

    reports.forEach((r) => {
      if (picMonthlyCounts[r.picName]) {
        picMonthlyCounts[r.picName].total += 1;
        if (r.status === 'DIVERIFIKASI') picMonthlyCounts[r.picName].verified += 1;
        if (r.namaLokasi) picMonthlyCounts[r.picName].locations.add(r.namaLokasi);
      }
    });

    return picMonthlyCounts;
  }, [reports]);

  // Export to CSV
  const handleExportCSV = () => {
    if (reports.length === 0) {
      toast.error('Tidak ada data laporan untuk diekspor.');
      return;
    }

    const headers = [
      'ID Laporan',
      'Nama PIC',
      'Wilayah Kunjungan',
      'Nama Lokasi',
      'Tanggal Kunjungan',
      'Jam Kunjungan',
      'Minggu Ke',
      'Status',
      'Isi Kegiatan Laporan',
    ];

    const rows = reports.map((r) => [
      r.id,
      r.picName,
      `"${r.lokasiKunjungan}"`,
      `"${r.namaLokasi}"`,
      r.tanggalKunjungan,
      r.jamKunjungan,
      r.mingguKe || 1,
      r.status,
      `"${(r.isiKegiatan || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Laporan_Kegiatan_PIC_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rekap laporan kegiatan berhasil diekspor.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary-red" />
            <span>Laporan Kegiatan Lapangan (Koordinator Lapangan / PIC)</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Pencatatan supervisi pos jaga, monitoring personil lapangan, serta rekap kegiatan mingguan & bulanan.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="gap-2 bg-primary-red hover:bg-red-800 self-start sm:self-auto shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Laporan Kunjungan</span>
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-red/10 text-primary-red flex-none">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted font-medium">Total Laporan Terkirim</p>
              <p className="text-xl font-bold text-ink mt-0.5">{reports.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green flex-none">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted font-medium">Laporan Terverifikasi</p>
              <p className="text-xl font-bold text-accent-green mt-0.5">
                {reports.filter((r) => r.status === 'DIVERIFIKASI').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-yellow/20 text-amber-700 flex-none">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted font-medium">PIC Aktif Bertugas</p>
              <p className="text-xl font-bold text-ink mt-0.5">8 Personel</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700 flex-none">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted font-medium">Format Foto Dokumentasi</p>
              <p className="text-xl font-bold text-ink mt-0.5">16:9 HD</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tab Navigation & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-4">
        {/* View Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('LIST')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'LIST'
                  ? 'bg-primary-red text-white'
                  : 'bg-canvas text-muted hover:text-ink hover:bg-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Daftar Laporan Kunjungan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('WEEKLY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'WEEKLY'
                  ? 'bg-primary-red text-white'
                  : 'bg-canvas text-muted hover:text-ink hover:bg-slate-200'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Rekap Kegiatan Mingguan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MONTHLY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'MONTHLY'
                  ? 'bg-primary-red text-white'
                  : 'bg-canvas text-muted hover:text-ink hover:bg-slate-200'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Rekap Kegiatan Bulanan</span>
            </button>
          </div>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs text-ink hover:bg-canvas self-start sm:self-auto"
            title="Download data rekap ke format CSV/Excel"
          >
            <Download className="h-3.5 w-3.5 text-primary-red" />
            <span>Export Rekap (CSV/Excel)</span>
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Cari lokasi, isi kegiatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-white text-ink text-xs focus:outline-none focus:ring-1 focus:ring-primary-red"
            />
          </div>

          {/* Filter PIC */}
          <div>
            <select
              value={selectedPic}
              onChange={(e) => setSelectedPic(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-red"
            >
              <option value="SEMUA">Semua PIC (PIC 1 - PIC 8)</option>
              {PIC_LIST.map((p) => (
                <option key={p} value={p}>
                  {p} (Koordinator Lapangan)
                </option>
              ))}
            </select>
          </div>

          {/* Filter Region */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink text-xs focus:outline-none focus:ring-1 focus:ring-primary-red"
            >
              <option value="SEMUA">Semua Wilayah Kunjungan</option>
              {VISIT_REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Bulan / Tahun (for Monthly View) */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-1/2 px-2.5 py-2 border border-border rounded-lg bg-white text-ink text-xs font-semibold"
            >
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="08">Agustus</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-1/2 px-2.5 py-2 border border-border rounded-lg bg-white text-ink text-xs font-semibold"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat laporan kegiatan lapangan dan rekapitulasi data..." />
        </div>
      ) : activeTab === 'WEEKLY' ? (
        /* ── TAB 1: REKAP MINGGUAN ── */
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-border shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary-red" />
                  <span>Matriks Rekapitulasi Kunjungan Mingguan (PIC 1 s/d PIC 8)</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Distribusi jumlah kunjungan lapangan pos pengamanan per koordinator lapangan tiap minggu.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas/60 text-muted font-bold border-b border-border uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Nama PIC</th>
                    <th className="px-4 py-3 text-center">Minggu 1</th>
                    <th className="px-4 py-3 text-center">Minggu 2</th>
                    <th className="px-4 py-3 text-center">Minggu 3</th>
                    <th className="px-4 py-3 text-center">Minggu 4</th>
                    <th className="px-4 py-3 text-center">Minggu 5</th>
                    <th className="px-4 py-3 text-center">Total Kunjungan</th>
                    <th className="px-4 py-3 text-center">Status Keaktifan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PIC_LIST.map((pic) => {
                    const stat = weeklyStats.picWeeklyCounts[pic] || { total: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    return (
                      <tr key={pic} className="hover:bg-canvas/30">
                        <td className="px-4 py-3 font-bold text-ink flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-primary-red" />
                          <span>{pic}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-medium">{stat[1] || '-'}</td>
                        <td className="px-4 py-3 text-center font-mono font-medium">{stat[2] || '-'}</td>
                        <td className="px-4 py-3 text-center font-mono font-medium">{stat[3] || '-'}</td>
                        <td className="px-4 py-3 text-center font-mono font-medium">{stat[4] || '-'}</td>
                        <td className="px-4 py-3 text-center font-mono font-medium">{stat[5] || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full font-bold bg-primary-red/10 text-primary-red">
                            {stat.total} Kunjungan
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {stat.total >= 2 ? (
                            <span className="inline-flex items-center gap-1 text-accent-green font-semibold text-[11px]">
                              <TrendingUp className="h-3.5 w-3.5" /> Sangat Aktif
                            </span>
                          ) : stat.total === 1 ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                              Normal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted text-[11px]">
                              Belum Ada Laporan
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'MONTHLY' ? (
        /* ── TAB 2: REKAP BULANAN ── */
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-border shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary-red" />
                  <span>Rekapitulasi Kunjungan Bulanan Periode {selectedMonth === '09' ? 'September' : 'Oktober'} {selectedYear}</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Akumulasi performa kunjungan supervisi seluruh PIC beserta jumlah lokasi unik yang disupervisi.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas/60 text-muted font-bold border-b border-border uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Nama PIC</th>
                    <th className="px-4 py-3 text-center">Total Kunjungan</th>
                    <th className="px-4 py-3 text-center">Lokasi Unik Dikunjungi</th>
                    <th className="px-4 py-3 text-center">Terverifikasi</th>
                    <th className="px-4 py-3 text-center">Kontribusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PIC_LIST.map((pic) => {
                    const stat = monthlyStats[pic] || { total: 0, verified: 0, locations: new Set() };
                    const percentage = reports.length > 0 ? Math.round((stat.total / reports.length) * 100) : 0;
                    return (
                      <tr key={pic} className="hover:bg-canvas/30">
                        <td className="px-4 py-3 font-bold text-ink flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary-red" />
                          <span>{pic}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-ink font-mono text-sm">
                          {stat.total}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-medium text-ink">
                            {stat.locations?.size || 0} Pos / Site
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green font-bold">
                            {stat.verified} Disetujui
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary-red h-full rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="font-mono text-muted text-[11px]">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : reports.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-12 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Belum ada laporan kegiatan lapangan"
            description="Klik tombol 'Buat Laporan Kunjungan' untuk mencatat supervisi dan mengunggah foto kunjungan 16:9."
            actionLabel="Buat Laporan Kunjungan"
            onAction={() => setIsFormOpen(true)}
          />
        </div>
      ) : (
        /* ── TAB 3: DAFTAR LAPORAN (CARDS GRID) ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-border shadow-xs overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* 16:9 Photo Thumbnail */}
              <div
                onClick={() => setSelectedReport(report)}
                className="relative aspect-video bg-black cursor-pointer group overflow-hidden"
              >
                <img
                  src={report.fotoKunjungan}
                  alt={`Kunjungan ${report.picName}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                  16:9 HD
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      report.status === 'DIVERIFIKASI'
                        ? 'bg-accent-green text-white'
                        : 'bg-primary-yellow text-ink'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-muted text-[11px]">
                    <span className="font-bold text-primary-red flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5" />
                      {report.picName}
                    </span>
                    <span className="font-mono">{report.tanggalKunjungan} • {report.jamKunjungan}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedReport(report)}
                    className="font-bold text-ink text-sm hover:text-primary-red cursor-pointer truncate"
                    title={report.namaLokasi}
                  >
                    {report.namaLokasi}
                  </h3>

                  <p className="text-[11px] text-muted flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-muted flex-none" />
                    <span className="truncate">{report.lokasiKunjungan}</span>
                  </p>

                  <p className="text-muted line-clamp-2 text-[11px] pt-1 border-t border-border">
                    {report.isiKegiatan}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReport(report)}
                    className="text-xs text-ink w-full"
                  >
                    <span>Lihat Detail & Foto 16:9</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <PicActivityFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => loadReports()}
      />

      {/* Detail Modal */}
      <PicActivityDetailModal
        isOpen={Boolean(selectedReport)}
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        canVerify={canVerify}
        onVerified={() => loadReports()}
      />
    </div>
  );
}
