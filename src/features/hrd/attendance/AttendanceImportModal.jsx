/**
 * Attendance Import Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.2 & Section 21 / DASHBOARD_UX_V2.md.
 *
 * Mendukung:
 * 1. Mode Roster Sync: Mengimpor daftar personel (misal 43 orang dari file Excel 'JNT Rawa Bokor.xlsx')
 *    meskipun jam datang & pulang kosong karena akan diinput manual dari dashboard.
 * 2. Mode Matriks Horizontal (Tgl 1 s/d 31): Mengimpor jam datang & pulang per tanggal.
 * 3. Mode Log Vertikal: Mengimpor baris absensi per tanggal.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Loader2,
  FileText,
  Sparkles,
  Users,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { attendanceAdapter, isInvalidEmployeeName } from '@/services/adapters/attendanceAdapter';
import toast from 'react-hot-toast';

export default function AttendanceImportModal({
  isOpen,
  onClose,
  sheetData,
  onImportSuccess,
  isAttendanceOnly = false,
  userId = null,
}) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [extractedPersonnel, setExtractedPersonnel] = useState([]);
  const [previewStats, setPreviewStats] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  // Bersihkan seluruh state dan riwayat file import
  const resetModalState = useCallback(() => {
    setFile(null);
    setParsedRows([]);
    setExtractedPersonnel([]);
    setPreviewStats(null);
    setIsProcessing(false);
    setIsApplying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Bersihkan riwayat tampilan setiap kali modal dibuka / dibuka ulang berikutnya
  useEffect(() => {
    if (isOpen) {
      resetModalState();
    }
  }, [isOpen, resetModalState]);

  const handleClose = useCallback(() => {
    resetModalState();
    if (onClose) onClose();
  }, [resetModalState, onClose]);

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
    const str = String(val).trim();
    if (!str || str === '--:--' || str === '-') return '';
    const clean = str.replace(/[.,;]/g, ':');
    const match = clean.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const h = String(match[1]).padStart(2, '0');
      const m = match[2];
      return `${h}:${m}`;
    }
    const digits = str.replace(/\D/g, '');
    if (digits.length === 4) {
      return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }
    return '';
  };

  // Format date val to YYYY-MM-DD
  const formatDateVal = (val) => {
    if (!val) return '';
    if (val instanceof Date) {
      return val.toISOString().slice(0, 10);
    }
    if (typeof val === 'number') {
      // Excel serial date number
      const parsedDate = new Date(Math.round((val - 25569) * 86400 * 1000));
      return parsedDate.toISOString().slice(0, 10);
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

  // Extract employee details from row
  const extractEmployeeFromNorm = (norm, fallbackIdx = 1) => {
    let nameVal = '';
    const exactNameKeys = [
      'nama karyawan (locked)',
      'nama karyawan',
      'nama lengkap',
      'nama personel',
      'nama pegawai',
      'nama',
      'karyawan',
      'personel',
      'pegawai',
      'employee name',
      'employeename',
      'name',
      'nama_karyawan',
      'nama_lengkap',
    ];
    for (const k of exactNameKeys) {
      if (norm[k] !== undefined && String(norm[k]).trim()) {
        nameVal = String(norm[k]).trim();
        break;
      }
    }
    if (!nameVal) {
      const looseKey = Object.keys(norm).find((k) =>
        (k.includes('nama') || k.includes('karyawan') || k.includes('employee')) &&
        !k.includes('ibu') && !k.includes('ayah') && !k.includes('lokasi') && !k.includes('client') && !k.includes('klien')
      );
      if (looseKey && norm[looseKey] !== undefined && String(norm[looseKey]).trim()) {
        nameVal = String(norm[looseKey]).trim();
      }
    }

    let idVal = '';
    const idKeys = ['id karyawan', 'id_karyawan', 'employeeid', 'employee_id', 'id', 'npp'];
    for (const k of idKeys) {
      if (norm[k] !== undefined && String(norm[k]).trim()) {
        idVal = String(norm[k]).trim();
        break;
      }
    }

    let nikVal = '';
    const nikKeys = ['nik', 'no ktp', 'nomor ktp', 'ktp', 'employeenik', 'employee_nik'];
    for (const k of nikKeys) {
      if (norm[k] !== undefined && String(norm[k]).trim()) {
        nikVal = String(norm[k]).trim();
        break;
      }
    }

    let roleVal = '';
    const roleKeys = ['jabatan', 'posisi', 'role', 'role in unit', 'role_in_unit'];
    for (const k of roleKeys) {
      if (norm[k] !== undefined && String(norm[k]).trim()) {
        roleVal = String(norm[k]).trim();
        break;
      }
    }

    if (!idVal && nameVal) {
      const slug = nameVal.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'EMP';
      idVal = `EMP-${slug}-${String(fallbackIdx).padStart(3, '0')}`;
    }

    return { nameVal, idVal, nikVal, roleVal };
  };

  // Parse uploaded file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setParsedRows([]);
    setExtractedPersonnel([]);
    setPreviewStats(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Deteksi baris header secara dinamis (mendukung file dengan kop judul di atas tabel)
        const sheetAoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        let headerRowOffset = 0;
        for (let i = 0; i < Math.min(10, sheetAoa.length); i++) {
          const rowVals = (sheetAoa[i] || []).map((c) => String(c).trim().toLowerCase());
          const hasNo = rowVals.includes('no');
          const hasNama = rowVals.some((c) => c.includes('nama') || c.includes('karyawan') || c.includes('employee'));
          const hasTgl = rowVals.some((c) => c.includes('tgl') || c.includes('tanggal') || c.includes('date'));
          if ((hasNo && hasNama) || (hasNama && hasTgl) || (hasNo && hasTgl)) {
            headerRowOffset = i;
            break;
          }
        }

        const rawJson = XLSX.utils.sheet_to_json(worksheet, { range: headerRowOffset, defval: '' });

        if (!rawJson || rawJson.length === 0) {
          toast.error('File Excel kosong atau format baris tidak terbaca.');
          setIsProcessing(false);
          return;
        }

        const firstRowKeys = Object.keys(rawJson[0]).map((k) => k.trim().toLowerCase());
        const isMatrixFormat = firstRowKeys.some((k) =>
          /tgl\s*\d{1,2}\s*(datang|masuk|in|pulang|keluar|out)/i.test(k) ||
          /\d{1,2}\s*(datang|masuk|in|pulang|keluar|out)/i.test(k)
        );
        const hasDateColumn = firstRowKeys.some((k) =>
          k === 'tanggal' || k === 'date' || k === 'tgl' || k === 'attendancedate' || k.includes('tanggal')
        );

        const matched = [];
        let validWithTimeCount = 0;
        const distinctPersonnelMap = new Map();

        const yStr = sheetData.sheet.periodYear || 2026;
        const mStr = String(sheetData.sheet.periodMonth || 9).padStart(2, '0');

        if (isMatrixFormat) {
          // Matrix horizontal parsing: 1 row = 1 employee across days 1..31
          rawJson.forEach((row, rowIdx) => {
            const norm = {};
            Object.keys(row).forEach((k) => {
              norm[k.trim().toLowerCase()] = row[k];
            });

            const { nameVal, idVal, nikVal, roleVal } = extractEmployeeFromNorm(norm, rowIdx + 1);
            if (!nameVal || isInvalidEmployeeName(nameVal)) return;

            const empKey = (nameVal || idVal).toLowerCase();
            if (!distinctPersonnelMap.has(empKey)) {
              distinctPersonnelMap.set(empKey, {
                employeeId: idVal,
                employeeName: nameVal || 'Karyawan',
                employeeNik: nikVal || '-',
                roleInUnit: roleVal || 'Anggota',
                index: distinctPersonnelMap.size + 1,
              });
            }

            // Find existing employee in sheetData.rows
            const employeeRows = sheetData.rows.filter((r) => {
              const idMatches = idVal && String(r.employeeId).toUpperCase() === String(idVal).toUpperCase();
              const nikMatches = nikVal && String(r.employeeNik).trim() === String(nikVal).trim();
              const nameMatches = nameVal && String(r.employeeName).trim().toLowerCase() === String(nameVal).trim().toLowerCase();
              return idMatches || nikMatches || nameMatches;
            });
            const empSample = employeeRows[0];

            for (let d = 1; d <= 31; d++) {
              const d2 = String(d).padStart(2, '0');
              const targetDate = `${yStr}-${mStr}-${d2}`;

              const inKey = Object.keys(norm).find((k) =>
                (k.includes(`tgl ${d2}`) || k.includes(`tgl ${d}`) || k.startsWith(`${d2} `) || k.startsWith(`${d} `)) &&
                (k.includes('datang') || k.includes('masuk') || k.includes('in'))
              );
              const outKey = Object.keys(norm).find((k) =>
                (k.includes(`tgl ${d2}`) || k.includes(`tgl ${d}`) || k.startsWith(`${d2} `) || k.startsWith(`${d} `)) &&
                (k.includes('pulang') || k.includes('keluar') || k.includes('out'))
              );

              const checkInVal = inKey ? norm[inKey] : '';
              const checkOutVal = outKey ? norm[outKey] : '';
              const checkIn = formatTimeVal(checkInVal);
              const checkOut = formatTimeVal(checkOutVal);

              const existingRow = sheetData.rows.find(
                (r) =>
                  r.attendanceDate === targetDate &&
                  (r.employeeId === (idVal || empSample?.employeeId) ||
                    r.employeeName?.toLowerCase() === nameVal?.toLowerCase())
              );

              const hasTime = Boolean(checkIn || checkOut);
              if (hasTime) validWithTimeCount++;

              if (hasTime || existingRow || d <= 3) {
                matched.push({
                  index: `${rowIdx + 1}.${d}`,
                  attendanceDate: targetDate,
                  employeeId: idVal || existingRow?.employeeId || empSample?.employeeId || '-',
                  employeeNik: nikVal || existingRow?.employeeNik || empSample?.employeeNik || '-',
                  employeeName: nameVal || existingRow?.employeeName || empSample?.employeeName || 'Tidak Dikenal',
                  checkIn,
                  checkOut,
                  notes: '',
                  isMatched: Boolean(existingRow || nameVal),
                  hasTime,
                  targetRowId: existingRow?.id || null,
                  originalCheckIn: existingRow?.checkIn || '-',
                  originalCheckOut: existingRow?.checkOut || '-',
                });
              }
            }
          });
        } else if (!hasDateColumn) {
          // Roster List Format: 1 row = 1 employee for this location (e.g. JNT Rawa Bokor.xlsx)
          rawJson.forEach((row, idx) => {
            const norm = {};
            Object.keys(row).forEach((k) => {
              norm[k.trim().toLowerCase()] = row[k];
            });

            const { nameVal, idVal, nikVal, roleVal } = extractEmployeeFromNorm(norm, idx + 1);
            if (!nameVal || isInvalidEmployeeName(nameVal)) return;

            const checkInVal =
              norm['jam datang'] || norm['jam datang (input manual)'] || norm['jam masuk'] || norm['masuk'] || norm['in'] || norm['datang'] || '';
            const checkOutVal =
              norm['jam pulang'] || norm['jam pulang (input manual)'] || norm['jam keluar'] || norm['keluar'] || norm['out'] || norm['pulang'] || '';
            const checkIn = formatTimeVal(checkInVal);
            const checkOut = formatTimeVal(checkOutVal);
            const hasTime = Boolean(checkIn || checkOut);
            if (hasTime) validWithTimeCount++;

            const empKey = (nameVal || idVal).toLowerCase();
            if (!distinctPersonnelMap.has(empKey)) {
              distinctPersonnelMap.set(empKey, {
                employeeId: idVal,
                employeeName: nameVal || 'Karyawan',
                employeeNik: nikVal || '-',
                roleInUnit: roleVal || 'Anggota',
                index: distinctPersonnelMap.size + 1,
              });
            }

            const existingRow = sheetData.rows.find((r) => {
              const idMatches = idVal && String(r.employeeId).toUpperCase() === String(idVal).toUpperCase();
              const nikMatches = nikVal && String(r.employeeNik).trim() === String(nikVal).trim();
              const nameMatches = nameVal && String(r.employeeName).trim().toLowerCase() === String(nameVal).trim().toLowerCase();
              return idMatches || nikMatches || nameMatches;
            });

            matched.push({
              index: idx + 1,
              attendanceDate: 'Slot Tgl 1 - 31',
              employeeId: idVal || existingRow?.employeeId || '-',
              employeeNik: nikVal || existingRow?.employeeNik || '-',
              employeeName: nameVal || existingRow?.employeeName || 'Karyawan',
              checkIn,
              checkOut,
              notes: '',
              isMatched: true,
              hasTime,
              targetRowId: existingRow?.id || null,
              originalCheckIn: existingRow?.checkIn || '-',
              originalCheckOut: existingRow?.checkOut || '-',
            });
          });
        } else {
          // Standard vertical row-by-row format with explicit Date column
          rawJson.forEach((row, idx) => {
            const norm = {};
            Object.keys(row).forEach((k) => {
              norm[k.trim().toLowerCase()] = row[k];
            });

            const { nameVal, idVal, nikVal, roleVal } = extractEmployeeFromNorm(norm, idx + 1);
            if (!nameVal || isInvalidEmployeeName(nameVal)) return;

            const dateVal = norm['tanggal'] || norm['date'] || norm['tgl'] || norm['attendancedate'] || '';
            const checkInVal =
              norm['jam datang'] || norm['jam datang (input manual)'] || norm['jam masuk'] || norm['masuk'] || norm['in'] || norm['datang'] || '';
            const checkOutVal =
              norm['jam pulang'] || norm['jam pulang (input manual)'] || norm['jam keluar'] || norm['keluar'] || norm['out'] || norm['pulang'] || '';
            const notesVal = norm['catatan'] || norm['keterangan'] || norm['notes'] || '';

            const attendanceDate = formatDateVal(dateVal);
            const checkIn = formatTimeVal(checkInVal);
            const checkOut = formatTimeVal(checkOutVal);

            if (nameVal || idVal) {
              const empKey = (nameVal || idVal).toLowerCase();
              if (!distinctPersonnelMap.has(empKey)) {
                distinctPersonnelMap.set(empKey, {
                  employeeId: idVal,
                  employeeName: nameVal || 'Karyawan',
                  employeeNik: nikVal || '-',
                  roleInUnit: roleVal || 'Anggota',
                  index: distinctPersonnelMap.size + 1,
                });
              }
            }

            const existingRow = sheetData.rows.find((r) => {
              const dateMatches = !attendanceDate || r.attendanceDate === attendanceDate;
              const idMatches = idVal && String(r.employeeId).toUpperCase() === String(idVal).toUpperCase();
              const nikMatches = nikVal && String(r.employeeNik).trim() === String(nikVal).trim();
              const nameMatches = nameVal && String(r.employeeName).trim().toLowerCase() === String(nameVal).trim().toLowerCase();
              return dateMatches && (idMatches || nikMatches || nameMatches);
            });

            const hasTime = Boolean(checkIn || checkOut);
            if (hasTime && existingRow) validWithTimeCount++;

            matched.push({
              index: idx + 1,
              attendanceDate: attendanceDate || existingRow?.attendanceDate || '-',
              employeeId: idVal || existingRow?.employeeId || '-',
              employeeNik: nikVal || existingRow?.employeeNik || '-',
              employeeName: nameVal || existingRow?.employeeName || 'Karyawan',
              checkIn,
              checkOut,
              notes: notesVal,
              isMatched: Boolean(existingRow || nameVal),
              hasTime,
              targetRowId: existingRow?.id || null,
              originalCheckIn: existingRow?.checkIn || '-',
              originalCheckOut: existingRow?.checkOut || '-',
            });
          });
        }

        const distinctEmployees = Array.from(distinctPersonnelMap.values());
        setExtractedPersonnel(distinctEmployees);
        setParsedRows(matched);

        // Smart Mode Detection:
        // If times are empty or if file is a roster list, activate Roster Sync Mode
        const isRosterMode =
          (validWithTimeCount === 0 && distinctEmployees.length > 0) ||
          (!hasDateColumn && !isMatrixFormat && distinctEmployees.length > 0);

        if (isRosterMode) {
          setPreviewStats({
            totalInFile: rawJson.length,
            matchedCount: distinctEmployees.length,
            readyToUpdate: distinctEmployees.length,
            isRosterMode: true,
          });
          toast.success(
            `Ditemukan ${distinctEmployees.length} personel dari file Excel. Siap ditampilkan di dashboard untuk pengisian jam manual.`
          );
        } else if (validWithTimeCount > 0) {
          setPreviewStats({
            totalInFile: rawJson.length,
            matchedCount: matched.filter((m) => m.isMatched).length,
            readyToUpdate: validWithTimeCount,
            isRosterMode: false,
          });
          toast.success(`Ditemukan ${validWithTimeCount} waktu jam datang/pulang yang cocok.`);
        } else {
          setPreviewStats(null);
          toast.error('File Excel tidak memuat nama karyawan atau kolom absensi yang dikenali.');
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

  // Download pre-filled matrix template (Tanggal 1 s/d 31) dengan format 2-row header bertingkat
  const handleDownloadTemplate = () => {
    try {
      const empMap = new Map();
      sheetData.rows.forEach((r) => {
        if (!isInvalidEmployeeName(r.employeeName) && !empMap.has(r.employeeId)) {
          empMap.set(r.employeeId, {
            employeeId: r.employeeId,
            employeeName: r.employeeName,
            employeeNik: r.employeeNik || '-',
            roleInUnit: r.roleInUnit || 'Anggota',
          });
        }
      });
      const employees = Array.from(empMap.values());

      // Header Baris 1: Kolom Utama & Header Tanggal / Rekapitulasi
      const headerRow1 = ['No', 'ID Karyawan', 'Nama Karyawan', 'NIK', 'Jabatan'];
      for (let d = 1; d <= 31; d++) {
        const dStr = String(d).padStart(2, '0');
        headerRow1.push(`Tgl ${dStr}`, '', '');
      }
      headerRow1.push('Rekapitulasi Bulanan', '', '');

      // Header Baris 2: Sub Kolom Datang, Pulang, Lembur & Hadir, Jam Kerja, Lembur
      const headerRow2 = ['', '', '', '', ''];
      for (let d = 1; d <= 31; d++) {
        headerRow2.push('Datang', 'Pulang', 'Lembur');
      }
      headerRow2.push('Hadir (HR)', 'Jam Kerja', 'Lembur (L)');

      // Data Baris Karyawan
      const dataRows = employees.map((emp, idx) => {
        const row = [
          idx + 1,
          emp.employeeId,
          emp.employeeName,
          emp.employeeNik,
          emp.roleInUnit,
        ];

        let presentCount = 0;
        for (let d = 1; d <= 31; d++) {
          const dStr = String(d).padStart(2, '0');
          const dateStr = `${sheetData.sheet.periodYear}-${String(sheetData.sheet.periodMonth).padStart(2, '0')}-${dStr}`;
          const existing = sheetData.rows.find(
            (r) => r.employeeId === emp.employeeId && r.attendanceDate === dateStr
          );
          const cIn = existing?.checkIn || '';
          const cOut = existing?.checkOut || '';
          if (cIn || cOut) presentCount++;
          row.push(cIn, cOut, 0);
        }

        row.push(presentCount, 0, 0);
        return row;
      });

      const aoa = [headerRow1, headerRow2, ...dataRows];
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);

      // Merge cells untuk header bertingkat
      const merges = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
        { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
        { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
      ];

      let colIdx = 5;
      for (let d = 1; d <= 31; d++) {
        merges.push({ s: { r: 0, c: colIdx }, e: { r: 0, c: colIdx + 2 } });
        colIdx += 3;
      }
      merges.push({ s: { r: 0, c: colIdx }, e: { r: 0, c: colIdx + 2 } });
      worksheet['!merges'] = merges;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance_Matrix');

      const fileName = `Template_Absensi_Matrix_${sheetData.sheet.sheetCode}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success('Template Excel Matriks (Tgl 1-31) berhasil diunduh.');
    } catch {
      toast.error('Gagal mengunduh template Excel.');
    }
  };

  // Download simple roster template
  const handleDownloadRosterTemplate = () => {
    try {
      const templateData = [
        {
          No: 1,
          'Nama Karyawan': 'Nama Personel 1',
          'ID Karyawan': 'EMP-001',
          NIK: '3171012345678901',
          Jabatan: 'Anggota',
          'Jam Datang': '',
          'Jam Pulang': '',
          Lembur: '',
        },
        {
          No: 2,
          'Nama Karyawan': 'Nama Personel 2',
          'ID Karyawan': 'EMP-002',
          NIK: '3171012345678902',
          Jabatan: 'Anggota',
          'Jam Datang': '',
          'Jam Pulang': '',
          Lembur: '',
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar_Personel');

      const fileName = `Template_Daftar_Personel_${sheetData.sheet.sheetCode}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success('Template Daftar Personel berhasil diunduh.');
    } catch {
      toast.error('Gagal mengunduh template Excel.');
    }
  };

  // Submit and apply imported attendance rows / roster
  const handleApplyImport = async () => {
    setIsApplying(true);
    try {
      const isRoster = previewStats?.isRosterMode;
      const res = await attendanceAdapter.importAttendanceRows(sheetData.sheet.id, parsedRows, {
        isRosterSync: isRoster,
        rosterEmployees: extractedPersonnel,
        replaceRoster: isRoster,
        isAttendanceOnly,
        userId,
      });

      if (res.data?.success) {
        toast.success(
          isRoster
            ? `Berhasil menampilkan ${res.data.updatedCount} personel di dashboard! Slot tanggal 1 s/d 31 siap diinput manual.`
            : `Berhasil memperbarui ${res.data.updatedCount} absensi jam datang & pulang!`
        );
        resetModalState();
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
              <h2 className="text-base font-bold text-ink">Import Data Absensi / Personel (.xlsx / .csv)</h2>
              <p className="text-xs text-muted">
                {sheetData.sheet.clientName} • {sheetData.sheet.locationName} • {sheetData.sheet.periodName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
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
                <p className="font-bold text-ink">Format Excel yang Didukung</p>
                <p className="text-muted mt-0.5">
                  Dapat mengimpor daftar personel (nama karyawan saja) untuk pengisian jam manual di dashboard, atau template matriks penuh (Tgl 1-31).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadRosterTemplate}
                className="gap-1.5 text-xs bg-white text-ink hover:bg-canvas"
              >
                <Users className="h-3.5 w-3.5 text-primary-red" />
                <span>Template Personel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-1.5 text-xs bg-white text-ink hover:bg-canvas"
              >
                <Download className="h-3.5 w-3.5 text-primary-red" />
                <span>Template Matriks (1-31)</span>
              </Button>
            </div>
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
                  <p className="text-[11px] text-muted">Personel Terdeteksi</p>
                  <p className="text-base font-bold text-ink mt-0.5">{previewStats.matchedCount}</p>
                </div>
                <div className="p-3 bg-accent-green/10 border border-accent-green/30 rounded-xl">
                  <p className="text-[11px] text-accent-green font-semibold">
                    {previewStats.isRosterMode ? 'Siap Input Manual' : 'Siap Diperbarui'}
                  </p>
                  <p className="text-base font-bold text-accent-green mt-0.5">
                    {previewStats.readyToUpdate} {previewStats.isRosterMode ? 'Personel' : 'Data'}
                  </p>
                </div>
              </div>

              {/* Informative Info Box for Roster Import */}
              {previewStats.isRosterMode && (
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                  <Sparkles className="h-4 w-4 text-blue-600 flex-none mt-0.5" />
                  <div>
                    <p className="font-bold">Mode Impor Personel (Input Jam Manual di Dashboard)</p>
                    <p className="text-blue-700 mt-0.5">
                      Ditemukan <strong>{extractedPersonnel.length} personel</strong> pada file ini. Saat tombol di bawah diklik, seluruh personel ini akan langsung ditampilkan di tabel absensi lokasi <strong>{sheetData.sheet.locationName}</strong> dengan slot tanggal 1 s/d 31 siap untuk pengisian jam datang & jam pulang manual langsung dari dashboard.
                    </p>
                  </div>
                </div>
              )}

              {/* Table Preview */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <div className="p-2.5 bg-canvas/60 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    Preview Data File ({previewStats.isRosterMode ? `${extractedPersonnel.length} Personel` : '6 Baris Pertama'}):
                  </span>
                  <span className="text-muted text-[11px]">
                    {previewStats.isRosterMode ? 'Slot 31 hari per personel akan terbuka' : 'Kalkulasi durasi kerja dihitung otomatis'}
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {previewStats.isRosterMode ? (
                    <table className="w-full text-left">
                      <thead className="bg-canvas/40 text-[11px] font-bold text-muted border-b border-border">
                        <tr>
                          <th className="px-3 py-2 text-center w-12">No</th>
                          <th className="px-3 py-2">Nama Karyawan</th>
                          <th className="px-3 py-2">ID / NIK</th>
                          <th className="px-3 py-2 text-center">Periode Slot</th>
                          <th className="px-3 py-2 text-center">Status Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {extractedPersonnel.slice(0, 8).map((emp, i) => (
                          <tr key={i} className="hover:bg-canvas/30">
                            <td className="px-3 py-2 text-center font-mono text-[11px] text-muted">{emp.index || i + 1}</td>
                            <td className="px-3 py-2 font-semibold text-ink">{emp.employeeName}</td>
                            <td className="px-3 py-2 font-mono text-[11px] text-muted">{emp.employeeId || emp.employeeNik || '-'}</td>
                            <td className="px-3 py-2 text-center text-[11px] font-mono text-muted">Tgl 1 - 31</td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex items-center gap-1 text-accent-green font-semibold text-[11px]">
                                <CheckCircle2 className="h-3 w-3" /> Siap Input Manual
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
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
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-canvas/30 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isApplying}>
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
                <span>Menampilkan Data ke Dashboard...</span>
              </>
            ) : (
              <>
                <span>
                  {previewStats?.isRosterMode
                    ? `Tampilkan ${previewStats.readyToUpdate} Personel di Spreadsheet (Siap Input Manual)`
                    : `Terapkan ${previewStats?.readyToUpdate || 0} Data ke Spreadsheet`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
