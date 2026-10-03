/**
 * Attendance Import Modal — PT. BARAK IOMS
 * Allows HRD & Admin HRD to import Check-In & Check-Out times from Excel/CSV files.
 * Provides template generation, flexible header mapping, preview validation, and persistence.
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle,
  X, FileText, ArrowRight, Loader2, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import attendanceAdapter from '@/services/adapters/attendanceAdapter';
import toast from 'react-hot-toast';

export default function AttendanceImportModal({ isOpen, onClose, sheetData, onImportSuccess }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [previewStats, setPreviewStats] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen || !sheetData) return null;

  // Format excel time or decimal or string to "HH:mm"
  const formatTimeVal = (val) => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'number') {
      // Excel fractional day e.g. 0.291666667 = 07:00
      const totalSeconds = Math.round(val * 86400);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    const str = String(val).trim().replace('.', ':');
    // Match "07:00" or "7:00"
    const match = str.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const h = String(match[1]).padStart(2, '0');
      const m = match[2];
      return `${h}:${m}`;
    }
    return str;
  };

  // Format date val to YYYY-MM-DD
  const formatDateVal = (val) => {
    if (!val) return '';
    if (val instanceof Date) {
      return val.toISOString().slice(0, 10);
    }
    if (typeof val === 'number') {
      // Excel serial date number
      const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
      return dateObj.toISOString().slice(0, 10);
    }
    const str = String(val).trim();
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmy) {
      const day = String(dmy[1]).padStart(2, '0');
      const month = String(dmy[2]).padStart(2, '0');
      const year = dmy[3];
      return `${year}-${month}-${day}`;
    }
    return str;
  };

  // Parse uploaded file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setParsedRows([]);
    setPreviewStats(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          toast.error('File Excel kosong atau format baris tidak terbaca.');
          setIsProcessing(false);
          return;
        }

        // Map and validate rows against current sheet personnel
        const matched = [];
        let validWithTimeCount = 0;

        rawJson.forEach((row, idx) => {
          // Normalize row keys (lowercase, trim)
          const norm = {};
          Object.keys(row).forEach((k) => {
            norm[k.trim().toLowerCase()] = row[k];
          });

          // Detect columns
          const dateVal =
            norm['tanggal'] || norm['date'] || norm['tgl'] || norm['attendancedate'] || '';
          const employeeIdVal =
            norm['id karyawan'] || norm['employeeid'] || norm['id'] || norm['id_karyawan'] || '';
          const nikVal =
            norm['nik'] || norm['no ktp'] || norm['nomor ktp'] || norm['employeenik'] || '';
          const nameVal =
            norm['nama lengkap'] || norm['nama'] || norm['employeename'] || norm['karyawan'] || '';
          const checkInVal =
            norm['jam datang'] || norm['jam masuk'] || norm['masuk'] || norm['in'] || norm['checkin'] || norm['check in'] || norm['datang'] || '';
          const checkOutVal =
            norm['jam pulang'] || norm['jam keluar'] || norm['keluar'] || norm['out'] || norm['checkout'] || norm['check out'] || norm['pulang'] || '';
          const notesVal =
            norm['catatan'] || norm['keterangan'] || norm['notes'] || '';

          const attendanceDate = formatDateVal(dateVal);
          const checkIn = formatTimeVal(checkInVal);
          const checkOut = formatTimeVal(checkOutVal);

          // Find match in current sheetData rows
          const existingRow = sheetData.rows.find((r) => {
            const dateMatches = !attendanceDate || r.attendanceDate === attendanceDate;
            const idMatches = employeeIdVal && String(r.employeeId).toUpperCase() === String(employeeIdVal).toUpperCase();
            const nikMatches = nikVal && String(r.employeeNik).trim() === String(nikVal).trim();
            const nameMatches = nameVal && String(r.employeeName).trim().toLowerCase() === String(nameVal).trim().toLowerCase();

            return dateMatches && (idMatches || nikMatches || nameMatches);
          });

          const hasTime = Boolean(checkIn || checkOut);
          if (hasTime && existingRow) validWithTimeCount++;

          matched.push({
            index: idx + 1,
            attendanceDate: attendanceDate || existingRow?.attendanceDate || '-',
            employeeId: employeeIdVal || existingRow?.employeeId || '-',
            employeeNik: nikVal || existingRow?.employeeNik || '-',
            employeeName: nameVal || existingRow?.employeeName || 'Tidak Dikenal',
            checkIn,
            checkOut,
            notes: notesVal,
            isMatched: Boolean(existingRow),
            hasTime,
            targetRowId: existingRow?.id || null,
            originalCheckIn: existingRow?.checkIn || '-',
            originalCheckOut: existingRow?.checkOut || '-',
          });
        });

        setParsedRows(matched);
        setPreviewStats({
          totalInFile: rawJson.length,
          matchedCount: matched.filter((m) => m.isMatched).length,
          readyToUpdate: validWithTimeCount,
        });

        if (validWithTimeCount > 0) {
          toast.success(`Ditemukan ${validWithTimeCount} baris jam datang/pulang yang cocok.`);
        } else {
          toast.error('Tidak ditemukan baris yang cocok dengan personel lembar absensi ini.');
        }
      } catch (err) {
        console.error('Failed to parse excel:', err);
        toast.error('Gagal membaca file excel. Pastikan format file adalah .xlsx atau .csv');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Download pre-filled template for current sheet
  const handleDownloadTemplate = () => {
    try {
      const templateData = sheetData.rows.map((r) => ({
        Tanggal: r.attendanceDate,
        'ID Karyawan': r.employeeId,
        'Nama Lengkap': r.employeeName,
        NIK: r.employeeNik,
        Shift: r.shiftName,
        'Jadwal Masuk': r.scheduledIn,
        'Jadwal Pulang': r.scheduledOut,
        'Jam Datang': r.checkIn || '',
        'Jam Pulang': r.checkOut || '',
        Catatan: r.notes || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 }, // Tanggal
        { wch: 15 }, // ID Karyawan
        { wch: 25 }, // Nama
        { wch: 20 }, // NIK
        { wch: 14 }, // Shift
        { wch: 12 }, // Jadwal Masuk
        { wch: 12 }, // Jadwal Pulang
        { wch: 14 }, // Jam Datang
        { wch: 14 }, // Jam Pulang
        { wch: 25 }, // Catatan
      ];

      const fileName = `Template_Absensi_${sheetData.sheet.sheetCode}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success('Template Excel berhasil diunduh.');
    } catch {
      toast.error('Gagal mengunduh template Excel.');
    }
  };

  // Submit and apply imported attendance rows
  const handleApplyImport = async () => {
    const validItems = parsedRows.filter((r) => r.isMatched && r.hasTime);
    if (validItems.length === 0) {
      toast.error('Tidak ada data jam absensi valid yang dapat diterapkan.');
      return;
    }

    setIsApplying(true);
    try {
      const res = await attendanceAdapter.importAttendanceRows(sheetData.sheet.id, validItems);
      if (res.data?.success) {
        toast.success(`Berhasil memperbarui ${res.data.updatedCount} absensi jam datang & pulang!`);
        if (onImportSuccess) onImportSuccess();
        onClose();
      } else {
        toast.error(res.error?.message || 'Gagal menerapkan data absensi.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses data absensi.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border bg-canvas/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-red/10 text-primary-red">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Import Data Absensi (.xlsx / .csv)</h2>
              <p className="text-xs text-muted">
                {sheetData.sheet.clientName} • {sheetData.sheet.locationName} • {sheetData.sheet.periodName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Step 1: Download Template */}
          <div className="p-4 rounded-xl bg-primary-yellow/10 border border-primary-yellow/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-700 flex-none mt-0.5" />
              <div>
                <p className="font-bold text-ink">Unduh Format Template Excel Terlebih Dahulu</p>
                <p className="text-muted mt-0.5">
                  File template otomatis berisi daftar nama personel dan tanggal periode lembar ini yang siap diisi.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-1.5 text-xs flex-none bg-white text-ink hover:bg-canvas"
            >
              <Download className="h-3.5 w-3.5 text-primary-red" />
              <span>Unduh Template .xlsx</span>
            </Button>
          </div>

          {/* Step 2: Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Pilih / Tarik File Absensi dari Device
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary-red rounded-xl p-6 text-center cursor-pointer transition-colors bg-canvas/30 hover:bg-canvas"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-muted mx-auto mb-2" />
              <p className="text-xs font-semibold text-ink">
                Klik untuk memilih file Excel / CSV dari device
              </p>
              <p className="text-[11px] text-muted mt-1">
                Format didukung: <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>
              </p>
              {file && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-mono font-medium text-ink shadow-xs">
                  <FileText className="h-4 w-4 text-primary-red" />
                  <span>{file.name}</span>
                  <span className="text-muted">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="py-6 text-center text-xs text-muted flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary-red" />
              <span>Membaca dan memverifikasi data personel dari file excel...</span>
            </div>
          )}

          {/* Step 3: Preview Results */}
          {previewStats && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-canvas/50 border border-border rounded-xl">
                  <p className="text-[11px] text-muted">Total Baris File</p>
                  <p className="text-base font-bold text-ink mt-0.5">{previewStats.totalInFile}</p>
                </div>
                <div className="p-3 bg-canvas/50 border border-border rounded-xl">
                  <p className="text-[11px] text-muted">Personel Cocok</p>
                  <p className="text-base font-bold text-ink mt-0.5">{previewStats.matchedCount}</p>
                </div>
                <div className="p-3 bg-accent-green/10 border border-accent-green/30 rounded-xl">
                  <p className="text-[11px] text-accent-green font-semibold">Siap Diperbarui</p>
                  <p className="text-base font-bold text-accent-green mt-0.5">{previewStats.readyToUpdate}</p>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <div className="p-2.5 bg-canvas/60 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-ink">Preview 6 Baris Pertama:</span>
                  <span className="text-muted text-[11px]">
                    Kalkulasi durasi kerja & keterlambatan akan dihitung otomatis.
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-canvas/40 text-[11px] font-bold text-muted border-b border-border">
                      <tr>
                        <th className="px-3 py-2">Tanggal</th>
                        <th className="px-3 py-2">Karyawan</th>
                        <th className="px-3 py-2 text-center">Jam Datang</th>
                        <th className="px-3 py-2 text-center">Jam Pulang</th>
                        <th className="px-3 py-2 text-center">Status Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.slice(0, 6).map((row, i) => (
                        <tr key={i} className={row.isMatched ? 'hover:bg-canvas/30' : 'bg-red-50/30'}>
                          <td className="px-3 py-2 font-mono text-[11px]">{row.attendanceDate}</td>
                          <td className="px-3 py-2">
                            <p className="font-semibold text-ink">{row.employeeName}</p>
                            <p className="text-[10px] text-muted font-mono">{row.employeeId}</p>
                          </td>
                          <td className="px-3 py-2 text-center font-mono">
                            {row.checkIn ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                {row.checkIn}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center font-mono">
                            {row.checkOut ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                {row.checkOut}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {row.isMatched && row.hasTime ? (
                              <span className="inline-flex items-center gap-1 text-accent-green font-semibold text-[11px]">
                                <CheckCircle2 className="h-3 w-3" /> Cocok
                              </span>
                            ) : row.isMatched ? (
                              <span className="inline-flex items-center gap-1 text-amber-600 text-[11px]">
                                <AlertTriangle className="h-3 w-3" /> Jam Kosong
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-error text-[11px]">
                                <X className="h-3 w-3" /> Tidak Dikenal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-canvas/30 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isApplying}>
            Batal
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyImport}
            disabled={!previewStats || previewStats.readyToUpdate === 0 || isApplying}
            className="gap-2 bg-primary-red hover:bg-red-800"
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menerapkan Data...</span>
              </>
            ) : (
              <>
                <span>Terapkan {previewStats?.readyToUpdate || 0} Data ke Spreadsheet</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
