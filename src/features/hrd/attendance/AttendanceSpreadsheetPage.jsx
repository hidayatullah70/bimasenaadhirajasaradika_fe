/**
 * Attendance Spreadsheet Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.2 (REQUIREMENT KHUSUS: Attendance Spreadsheet).
 *
 * Rules:
 * - Dynamic roster from active assignments.
 * - Locked master columns (Nama, NIK, Jabatan, Shift, Jadwal).
 * - HRD inputs Check-In and Check-Out.
 * - Automatic calculation of Total Hours, Late Minutes, Status.
 * - Finalize locks sheet into snapshot; Reopen requires privileged authorization.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet, CheckCircle2, Lock, Unlock, Download,
  RefreshCw, Zap, ShieldCheck, Clock, UserCheck
} from 'lucide-react';
import attendanceAdapter from '@/services/adapters/attendanceAdapter';
import { MOCK_CLIENTS, MOCK_LOCATIONS } from '@/services/mock/mockMasterData';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';
import { STATUS } from '@/constants/status';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import ReopenModal from './ReopenModal';
import toast from 'react-hot-toast';

export default function AttendanceSpreadsheetPage() {
  const { currentUser, hasPermission } = useAuth();
  const canFinalize = hasPermission(PERMISSIONS.ATTENDANCE_FINALIZE);
  const canReopen = hasPermission(PERMISSIONS.ATTENDANCE_REOPEN) || currentUser?.role === 'DIREKTUR';
  const canExport = hasPermission(PERMISSIONS.ATTENDANCE_EXPORT);

  // Selector state
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('9');
  const [clientId, setClientId] = useState(MOCK_CLIENTS[0]?.id || '');
  const [locationId, setLocationId] = useState(MOCK_LOCATIONS[0]?.id || '');

  // Active Sheet & Rows
  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingRowId, setSavingRowId] = useState(null);

  // Validation report modal/alert state
  const [validationReport, setValidationReport] = useState(null);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  // Load sheets matching current year and month
  const loadSheets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceAdapter.getSheets({ year, month });
      if (res.data) {
        setSheets(res.data);
        // Find matching sheet for client/location or pick first
        const match = res.data.find((s) => s.clientId === clientId && s.locationId === locationId);
        if (match) {
          setSelectedSheetId(match.id);
        } else if (res.data.length > 0) {
          setSelectedSheetId(res.data[0].id);
        } else {
          setSelectedSheetId(null);
          setSheetData(null);
        }
      }
    } catch {
      toast.error('Gagal memuat daftar lembar absensi.');
    } finally {
      setLoading(false);
    }
  }, [year, month, clientId, locationId]);

  // Load active sheet rows
  const loadSheetRows = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await attendanceAdapter.getSheetById(id);
      if (res.data) {
        setSheetData(res.data);
        setValidationReport(null);
      }
    } catch {
      toast.error('Gagal memuat baris data absensi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSheets();
  }, [loadSheets]);

  useEffect(() => {
    if (selectedSheetId) {
      loadSheetRows(selectedSheetId);
    }
  }, [selectedSheetId, loadSheetRows]);

  // Handle cell edit (check-in / check-out)
  const handleCellChange = async (rowId, field, value) => {
    if (!sheetData) return;
    const isLocked = sheetData.sheet.status === STATUS.FINALIZED;
    if (isLocked) {
      toast.error('Lembar absensi terkunci (Final). Silakan buka kunci (Reopen) untuk mengubah.');
      return;
    }

    const row = sheetData.rows.find((r) => r.id === rowId);
    if (!row) return;

    const payload = {
      checkIn: field === 'checkIn' ? value : row.checkIn,
      checkOut: field === 'checkOut' ? value : row.checkOut,
    };

    setSavingRowId(rowId);
    try {
      const res = await attendanceAdapter.updateAttendanceRow(sheetData.sheet.id, rowId, payload);
      if (res.data) {
        // Optimistically update local rows
        setSheetData((prev) => ({
          ...prev,
          rows: prev.rows.map((r) => (r.id === rowId ? res.data : r)),
        }));
      }
    } catch {
      toast.error('Gagal menyimpan absensi.');
    } finally {
      setSavingRowId(null);
    }
  };

  // Generate new roster for current client & location
  const handleGenerateRoster = async () => {
    const clientObj = MOCK_CLIENTS.find((c) => c.id === clientId);
    const locObj = MOCK_LOCATIONS.find((l) => l.id === locationId);

    try {
      const res = await attendanceAdapter.generateRoster({
        year,
        month,
        clientId,
        clientName: clientObj ? clientObj.name : 'Client',
        locationId,
        locationName: locObj ? locObj.name : 'Location',
        serviceType: 'security',
      });
      if (res.data) {
        toast.success(`Roster absensi ${res.data.sheetCode} berhasil dibentuk.`);
        loadSheets();
      }
    } catch {
      toast.error('Gagal membuat roster absensi.');
    }
  };

  // Bulk fill time (Isi Otomatis Hadir Tepat Waktu)
  const handleBulkFillOnTime = async () => {
    if (!sheetData) return;
    if (sheetData.sheet.status === STATUS.FINALIZED) {
      toast.error('Lembar absensi berstatus FINAL dan terkunci.');
      return;
    }

    if (!window.confirm('Isi otomatis seluruh baris yang kosong dengan jadwal shift tepat waktu?')) return;

    try {
      await attendanceAdapter.bulkFillTime(sheetData.sheet.id, {
        timeIn: '07:00',
        timeOut: '15:00',
      });
      toast.success('Pengisian otomatis absensi selesai.');
      loadSheetRows(sheetData.sheet.id);
    } catch {
      toast.error('Gagal melakukan pengisian otomatis.');
    }
  };

  // Validate sheet
  const handleValidate = async () => {
    if (!sheetData) return;
    try {
      const res = await attendanceAdapter.validateSheet(sheetData.sheet.id);
      if (res.data) {
        setValidationReport(res.data);
        if (res.data.isValid) {
          toast.success(res.data.message);
        } else {
          toast.error(res.data.message);
        }
      }
    } catch {
      toast.error('Gagal memvalidasi lembar absensi.');
    }
  };

  // Finalize month
  const handleFinalize = async () => {
    if (!sheetData) return;
    if (!window.confirm(`Konfirmasi finalisasi absensi ${sheetData.sheet.periodName}? Lembar akan dikunci permanen untuk input payroll.`)) return;

    try {
      const res = await attendanceAdapter.finalizeSheet(
        sheetData.sheet.id,
        currentUser ? currentUser.name : 'Siti Rahmawati (HRD)'
      );
      if (res.data) {
        toast.success(`Lembar absensi ${sheetData.sheet.periodName} berhasil difinalisasi & dikunci.`);
        loadSheetRows(sheetData.sheet.id);
        loadSheets();
      }
    } catch {
      toast.error('Gagal memfinalisasi absensi.');
    }
  };

  // Reopen sheet
  const handleReopenConfirm = async (reason) => {
    if (!sheetData) return;
    const res = await attendanceAdapter.reopenSheet(sheetData.sheet.id, {
      reason,
      reopenedBy: currentUser ? currentUser.name : 'Juli Priyanto (Direktur)',
    });
    if (res.data) {
      toast.success('Lembar absensi berhasil dibuka kembali (REOPENED).');
      loadSheetRows(sheetData.sheet.id);
      loadSheets();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!sheetData || !sheetData.rows.length) return;
    const headers = [
      'Tanggal', 'ID Karyawan', 'Nama Lengkap', 'NIK', 'Posisi', 'Shift',
      'Jadwal Masuk', 'Jadwal Pulang', 'Jam Datang', 'Jam Pulang', 'Status', 'Terlambat (m)', 'Total Jam',
    ];
    const rows = sheetData.rows.map((r) => [
      r.attendanceDate,
      r.employeeId,
      `"${r.employeeName}"`,
      `"${r.employeeNik}"`,
      r.roleInUnit,
      r.shiftName,
      r.scheduledIn,
      r.scheduledOut,
      r.checkIn || '-',
      r.checkOut || '-',
      r.status,
      r.lateMinutes || 0,
      Math.round(((r.totalMinutes || 0) / 60) * 10) / 10,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${sheetData.sheet.sheetCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Spreadsheet absensi berhasil diekspor.');
  };

  const isFinalized = sheetData?.sheet?.status === STATUS.FINALIZED;

  return (
    <div className="space-y-4">
      {/* Selector Hirarki: Bulan/Tahun → Klien → Lokasi */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Periode Tahun */}
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold border border-border rounded-lg bg-white text-ink"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>

            {/* Periode Bulan */}
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold border border-border rounded-lg bg-white text-ink"
            >
              <option value="9">September</option>
              <option value="8">Agustus</option>
              <option value="7">Juli</option>
            </select>

            {/* Klien */}
            <select
              value={clientId}
              onChange={(e) => {
                const newClientId = e.target.value;
                setClientId(newClientId);
                const matchingLoc = MOCK_LOCATIONS.find((l) => l.clientId === newClientId);
                if (matchingLoc) setLocationId(matchingLoc.id);
              }}
              className="px-3 py-1.5 text-xs border border-border rounded-lg bg-white text-ink max-w-[220px]"
            >
              {MOCK_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Lokasi */}
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="px-3 py-1.5 text-xs border border-border rounded-lg bg-white text-ink max-w-[220px]"
            >
              {MOCK_LOCATIONS.filter((l) => !clientId || l.clientId === clientId).map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Roster Action */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateRoster}
              className="gap-1.5 text-xs"
              title="Buat roster baru dari data penugasan aktif"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Generate Roster</span>
            </Button>
          </div>
        </div>

        {/* Sheet Tabs if multiple sheets for period */}
        {sheets.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border overflow-x-auto scrollbar-none text-xs">
            <span className="text-muted text-[11px] font-medium flex-none">Lembar Tersedia:</span>
            {sheets.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSheetId(s.id)}
                className={`px-3 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  selectedSheetId === s.id
                    ? 'bg-primary-red text-white border-primary-red'
                    : 'bg-white text-muted border-border hover:bg-canvas'
                }`}
              >
                <span>{s.clientName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  s.status === STATUS.FINALIZED ? 'bg-black/20 text-white' : 'bg-success/20 text-white'
                }`}>
                  {s.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spreadsheet Main Section */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat tabel spreadsheet absensi dan menghitung kalkulasi durasi..." />
        </div>
      ) : !sheetData ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Belum ada lembar absensi"
            description="Tidak ditemukan lembar absensi untuk periode dan lokasi yang dipilih."
            actionLabel="Generate Roster dari Penugasan Aktif"
            onAction={handleGenerateRoster}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
          {/* Action & Status Bar */}
          <div className="p-4 border-b border-border bg-canvas/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-ink text-sm sm:text-base">{sheetData.sheet.clientName}</h3>
                  <Badge variant={isFinalized ? 'default' : sheetData.sheet.status === STATUS.REOPENED ? 'warning' : 'success'}>
                    {isFinalized ? (
                      <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> FINALIZED (Snapshot)</span>
                    ) : sheetData.sheet.status === STATUS.REOPENED ? (
                      <span className="flex items-center gap-1"><Unlock className="h-3 w-3" /> REOPENED</span>
                    ) : (
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> OPEN (Editing)</span>
                    )}
                  </Badge>
                </div>
                <p className="text-xs text-muted font-mono mt-0.5">
                  {sheetData.sheet.sheetCode} • {sheetData.sheet.locationName} • {sheetData.sheet.periodName}
                </p>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {!isFinalized && (
                <>
                  <Button variant="outline" size="sm" onClick={handleBulkFillOnTime} className="gap-1.5 text-xs">
                    <Zap className="h-3.5 w-3.5 text-warning" />
                    <span>Isi Cepat On-Time</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleValidate} className="gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-info" />
                    <span>Validasi</span>
                  </Button>
                  {canFinalize && (
                    <Button variant="primary" size="sm" onClick={handleFinalize} className="gap-1.5 text-xs bg-success hover:bg-green-700">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Finalisasi Bulan</span>
                    </Button>
                  )}
                </>
              )}

              {isFinalized && canReopen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReopenModalOpen(true)}
                  className="gap-1.5 text-xs border-warning text-amber-800 hover:bg-warning/10"
                >
                  <Unlock className="h-3.5 w-3.5 text-warning" />
                  <span>Buka Kunci (Reopen)</span>
                </Button>
              )}

              {canExport && (
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </Button>
              )}
            </div>
          </div>

          {/* Validation Alert Box if present */}
          {validationReport && (
            <div className={`p-3.5 border-b text-xs flex items-center justify-between ${
              validationReport.isValid ? 'bg-success/10 border-success/30 text-success' : 'bg-error/10 border-error/30 text-error'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 flex-none" />
                <span className="font-semibold">{validationReport.message}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-ink">
                <span>Total: {validationReport.totalRows}</span>
                <span>Hadir: {validationReport.presentCount}</span>
                <span>Terlambat: {validationReport.lateCount}</span>
                <span>Kosong: {validationReport.unfilledCount}</span>
              </div>
            </div>
          )}

          {/* Locked Notice if Finalized */}
          {isFinalized && (
            <div className="p-2.5 bg-slate/10 text-muted border-b border-border text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Lembar ini telah difinalisasi oleh <strong>{sheetData.sheet.finalizedBy || 'HRD'}</strong> pada {new Date(sheetData.sheet.finalizedAt).toLocaleDateString('id-ID')}. Input terkunci permanen.
              </span>
              <span className="font-mono text-[10px]">Versi Snapshot #{sheetData.sheet.version}</span>
            </div>
          )}

          {/* SPREADSHEET TABLE */}
          <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-canvas/80 text-muted uppercase font-semibold sticky top-0 z-20 border-b border-border shadow-xs backdrop-blur-xs">
                <tr>
                  <th className="px-3 py-3 border-r border-border">Tanggal</th>
                  <th className="px-3 py-3 border-r border-border">Karyawan (Locked)</th>
                  <th className="px-3 py-3 border-r border-border">Shift & Jadwal</th>
                  <th className="px-3 py-3 border-r border-border bg-amber-50/50 text-amber-900">Jam Datang (In)</th>
                  <th className="px-3 py-3 border-r border-border bg-amber-50/50 text-amber-900">Jam Pulang (Out)</th>
                  <th className="px-3 py-3 border-r border-border text-center">Status</th>
                  <th className="px-3 py-3 border-r border-border text-right">Durasi Kerja</th>
                  <th className="px-3 py-3 border-r border-border text-right">Keterlambatan</th>
                  <th className="px-3 py-3">Catatan Sistem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sheetData.rows.map((row) => {
                  const isRowSaving = savingRowId === row.id;
                  const isLate = row.lateMinutes > 0;

                  return (
                    <tr key={row.id} className="hover:bg-primary-red/5 transition-colors group">
                      {/* Tanggal */}
                      <td className="px-3 py-2 font-mono text-[11px] border-r border-border whitespace-nowrap text-muted">
                        {row.attendanceDate}
                      </td>

                      {/* Karyawan (Locked Master Fields) */}
                      <td className="px-3 py-2 border-r border-border whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Lock className="h-3 w-3 text-muted/60 flex-none" title="Kolom Master Terkunci" />
                          <div>
                            <p className="font-semibold text-ink">{row.employeeName}</p>
                            <p className="text-[10px] font-mono text-muted">{row.employeeId} • {row.roleInUnit}</p>
                          </div>
                        </div>
                      </td>

                      {/* Shift & Jadwal (Locked) */}
                      <td className="px-3 py-2 border-r border-border whitespace-nowrap text-muted">
                        <p className="font-medium text-ink">{row.shiftName}</p>
                        <p className="text-[10px] font-mono">{row.scheduledIn} - {row.scheduledOut}</p>
                      </td>

                      {/* Input Jam Datang (Editable) */}
                      <td className="px-2 py-1.5 border-r border-border bg-amber-50/20">
                        <input
                          type="time"
                          disabled={isFinalized || isRowSaving}
                          value={row.checkIn || ''}
                          onChange={(e) => handleCellChange(row.id, 'checkIn', e.target.value)}
                          className={`w-24 px-2 py-1 font-mono text-xs border rounded transition-colors ${
                            isFinalized
                              ? 'bg-transparent border-transparent cursor-not-allowed text-ink'
                              : isLate
                              ? 'border-error bg-error/10 text-error font-bold'
                              : 'border-border bg-white focus:border-primary-red focus:ring-1 focus:ring-primary-red'
                          }`}
                        />
                      </td>

                      {/* Input Jam Pulang (Editable) */}
                      <td className="px-2 py-1.5 border-r border-border bg-amber-50/20">
                        <input
                          type="time"
                          disabled={isFinalized || isRowSaving}
                          value={row.checkOut || ''}
                          onChange={(e) => handleCellChange(row.id, 'checkOut', e.target.value)}
                          className={`w-24 px-2 py-1 font-mono text-xs border rounded transition-colors ${
                            isFinalized
                              ? 'bg-transparent border-transparent cursor-not-allowed text-ink'
                              : 'border-border bg-white focus:border-primary-red focus:ring-1 focus:ring-primary-red'
                          }`}
                        />
                      </td>

                      {/* Status Kehadiran (Calculated) */}
                      <td className="px-3 py-2 border-r border-border text-center whitespace-nowrap">
                        <Badge
                          variant={
                            row.status === STATUS.PRESENT
                              ? 'success'
                              : row.status === STATUS.LATE
                              ? 'danger'
                              : row.status === STATUS.EARLY_LEAVE
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>

                      {/* Durasi Kerja (Calculated) */}
                      <td className="px-3 py-2 border-r border-border text-right font-mono whitespace-nowrap">
                        {row.totalMinutes > 0 ? (
                          <span className="font-semibold text-ink">
                            {Math.floor(row.totalMinutes / 60)}j {row.totalMinutes % 60}m
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>

                      {/* Keterlambatan (Calculated) */}
                      <td className="px-3 py-2 border-r border-border text-right font-mono whitespace-nowrap">
                        {row.lateMinutes > 0 ? (
                          <span className="font-bold text-error">+{row.lateMinutes} m</span>
                        ) : (
                          <span className="text-success text-[11px]">Tepat Waktu</span>
                        )}
                      </td>

                      {/* Catatan Sistem */}
                      <td className="px-3 py-2 text-muted truncate max-w-[200px] text-[11px]">
                        {row.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="p-3.5 border-t border-border bg-canvas/30 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted gap-2">
            <div className="flex items-center gap-4">
              <span>Total Baris Absensi: <strong className="text-ink">{sheetData.rows.length}</strong></span>
              <span className="text-success">Hadir: {sheetData.rows.filter((r) => r.status === STATUS.PRESENT).length}</span>
              <span className="text-error">Terlambat: {sheetData.rows.filter((r) => r.status === STATUS.LATE).length}</span>
            </div>
            <p className="text-[11px]">
              Toleransi Keterlambatan Shift: <strong>15 Menit</strong> • Rumus: PRD §11.2
            </p>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      <ReopenModal
        isOpen={isReopenModalOpen}
        sheet={sheetData?.sheet}
        onClose={() => setIsReopenModalOpen(false)}
        onConfirm={handleReopenConfirm}
      />
    </div>
  );
}
