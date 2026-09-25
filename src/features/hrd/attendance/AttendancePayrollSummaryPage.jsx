/**
 * Attendance Payroll Summary Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.2 (Payroll Integration: Monthly Attendance Summary).
 *
 * Provides aggregated metrics per employee:
 * Total Hari Kerja, Hari Hadir, Terlambat (Hari & Menit), Pulang Awal, Mangkir/Alfa, Total Jam Kerja.
 * Read-only summary used as authoritative input for Finance Payroll (Phase 5).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, Download, CheckCircle2, AlertTriangle, ChevronRight, FileSpreadsheet } from 'lucide-react';
import attendanceAdapter from '@/services/adapters/attendanceAdapter';
import { MOCK_CLIENTS, MOCK_LOCATIONS } from '@/services/mock/mockMasterData';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';

export default function AttendancePayrollSummaryPage() {
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('9');
  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSheets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceAdapter.getSheets({ year, month });
      if (res.data && res.data.length > 0) {
        setSheets(res.data);
        setSelectedSheetId(res.data[0].id);
      } else {
        setSheets([]);
        setSelectedSheetId(null);
        setSummaryData([]);
      }
    } catch {
      toast.error('Gagal memuat lembar absensi.');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  const loadSummary = useCallback(async (sheetId) => {
    if (!sheetId) return;
    setLoading(true);
    try {
      const res = await attendanceAdapter.getPayrollAttendanceSummary(sheetId);
      if (res.data) setSummaryData(res.data);
    } catch {
      toast.error('Gagal menghitung rekap penggajian.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSheets();
  }, [loadSheets]);

  useEffect(() => {
    if (selectedSheetId) {
      loadSummary(selectedSheetId);
    }
  }, [selectedSheetId, loadSummary]);

  const activeSheet = sheets.find((s) => s.id === selectedSheetId);

  const handleExportSummaryCSV = () => {
    if (!summaryData.length) return;
    const headers = [
      'ID Karyawan', 'Nama Lengkap', 'NIK', 'Posisi', 'Layanan',
      'Total Hari Roster', 'Hari Hadir', 'Hari Telat', 'Total Menit Telat', 'Pulang Awal', 'Mangkir', 'Total Jam Kerja',
    ];
    const rows = summaryData.map((e) => [
      e.employeeId,
      `"${e.employeeName}"`,
      `"${e.employeeNik}"`,
      e.roleInUnit,
      e.serviceType,
      e.totalWorkDays,
      e.presentDays,
      e.lateDays,
      e.totalLateMinutes,
      e.earlyLeaveDays,
      e.absentDays,
      e.totalWorkHours,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Payroll_Absensi_${activeSheet?.sheetCode || 'BARAK'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rekap absensi payroll berhasil diunduh.');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold border border-border rounded-lg bg-white"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold border border-border rounded-lg bg-white"
          >
            <option value="9">September</option>
            <option value="8">Agustus</option>
            <option value="7">Juli</option>
          </select>

          {sheets.length > 0 && (
            <select
              value={selectedSheetId || ''}
              onChange={(e) => setSelectedSheetId(e.target.value)}
              className="px-3 py-1.5 text-xs border border-border rounded-lg bg-white max-w-[280px]"
            >
              {sheets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.clientName} ({s.locationName}) - [{s.status}]
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <Button variant="outline" size="sm" onClick={handleExportSummaryCSV} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Export Rekap Payroll</span>
          </Button>
        </div>
      </div>

      {/* Main Aggregated Table */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border bg-canvas/40 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-ink text-sm sm:text-base">
              Ringkasan Kehadiran Penggajian (Payroll Input Summary)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Data teragregasi resmi dari lembar absensi terverifikasi untuk diteruskan ke Divisi Finance.
            </p>
          </div>
          {activeSheet && (
            <Badge variant={activeSheet.status === 'FINALIZED' ? 'default' : 'success'}>
              Status: {activeSheet.status}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="p-8">
            <StateLoading message="Menghitung rekapitulasi kehadiran per karyawan..." />
          </div>
        ) : summaryData.length === 0 ? (
          <div className="p-8">
            <StateEmpty
              title="Tidak ada data rekap"
              description="Pilih lembar absensi yang memiliki data kehadiran aktif."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas/50 border-b border-border text-muted uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Karyawan</th>
                  <th className="px-4 py-3">Posisi Unit</th>
                  <th className="px-4 py-3 text-center">Hari Roster</th>
                  <th className="px-4 py-3 text-center text-success">Hadir</th>
                  <th className="px-4 py-3 text-center text-error">Terlambat</th>
                  <th className="px-4 py-3 text-right">Total Menit Telat</th>
                  <th className="px-4 py-3 text-center">Pulang Awal</th>
                  <th className="px-4 py-3 text-center text-amber-700">Mangkir / Kosong</th>
                  <th className="px-4 py-3 text-right font-bold">Total Jam Kerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summaryData.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-primary-red/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{emp.employeeName}</p>
                      <p className="text-[11px] font-mono text-muted">{emp.employeeId} ({emp.employeeNik})</p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {emp.roleInUnit} ({emp.serviceType})
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-ink">
                      {emp.totalWorkDays} Hari
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-success">
                      {emp.presentDays}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-error">
                      {emp.lateDays > 0 ? `${emp.lateDays} Hari` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {emp.totalLateMinutes > 0 ? `${emp.totalLateMinutes} m` : '0 m'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {emp.earlyLeaveDays > 0 ? `${emp.earlyLeaveDays} Hari` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-amber-700 font-semibold">
                      {emp.absentDays > 0 ? `${emp.absentDays} Hari` : '0'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-ink">
                      {emp.totalWorkHours} Jam
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3.5 border-t border-border bg-canvas/30 text-xs text-muted flex items-center justify-between">
          <span>Workflow: HRD Attendance → Attendance Validation → Finance Payroll Input</span>
          <span className="font-medium text-ink">Rumus Akumulasi: PRD Section 11.2 & 18</span>
        </div>
      </div>
    </div>
  );
}
