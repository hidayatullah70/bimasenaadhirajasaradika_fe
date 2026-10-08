/**
 * Attendance Spreadsheet Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.2 (REQUIREMENT KHUSUS: Attendance Spreadsheet).
 *
 * Rules:
 * - Matrix Kalender: 1 baris per karyawan di lokasi penempatan terpilih.
 * - Kolom 1: Nama Karyawan (Locked / Freeze Column di sebelah kiri).
 * - Kolom 2: Jam Datang (input manual per tanggal).
 * - Kolom 3: Jam Pulang (input manual per tanggal).
 * - Kolom 4: Lembur (numeric, hasil rumus: (Jam Pulang - Jam Datang) - Durasi Kerja).
 * - Tanggal 1 s/d 31 memanjang ke kanan (horizontal scrollable).
 * - Dropdown Durasi Kerja di bilah filter: 8 Jam, 10 Jam, 12 Jam, Tambahan Isi Manual.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileSpreadsheet, CheckCircle2, Lock, Unlock, Download,
  RefreshCw, Zap, Clock, Upload, Users, Calendar, RotateCcw, AlertTriangle, Trash2
} from 'lucide-react';
import attendanceAdapter, { isInvalidEmployeeName } from '@/services/adapters/attendanceAdapter';
import * as XLSX from 'xlsx';
import { MOCK_CLIENTS, MOCK_LOCATIONS } from '@/services/mock/mockMasterData';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';
import { STATUS } from '@/constants/status';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import ReopenModal from './ReopenModal';
import AttendanceImportModal from './AttendanceImportModal';
import toast from 'react-hot-toast';

/**
 * Helper untuk menghitung nilai numeric lembar lembur
 * Rumus: (Jam Pulang - Jam Datang) - Durasi Kerja
 */
function calculateOvertime(checkIn, checkOut, workDurationHours) {
  if (!checkIn || !checkOut) return 0;
  const inParts = checkIn.split(':').map(Number);
  const outParts = checkOut.split(':').map(Number);
  if (inParts.length < 2 || outParts.length < 2 || isNaN(inParts[0]) || isNaN(outParts[0])) return 0;

  let inMin = inParts[0] * 60 + inParts[1];
  let outMin = outParts[0] * 60 + outParts[1];
  if (outMin < inMin) outMin += 24 * 60; // Lintas tengah malam (Shift malam)

  const workedMinutes = outMin - inMin;
  const workedHours = workedMinutes / 60;
  const overtime = workedHours - workDurationHours;
  return Math.round(Math.max(0, overtime) * 10) / 10;
}

/**
 * Helper untuk menghitung total jam kerja (numeric desimal)
 */
function calculateWorkHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const inParts = checkIn.split(':').map(Number);
  const outParts = checkOut.split(':').map(Number);
  if (inParts.length < 2 || outParts.length < 2 || isNaN(inParts[0]) || isNaN(outParts[0])) return 0;

  let inMin = inParts[0] * 60 + inParts[1];
  let outMin = outParts[0] * 60 + outParts[1];
  if (outMin < inMin) outMin += 24 * 60;

  return Math.round(((outMin - inMin) / 60) * 10) / 10;
}

/**
 * Normalisasi format jam ke standard HH:mm
 * Mendukung variasi input cepat: "0815", "0800", "08.15", "08.00", "800", "815", "8.15", "8", "17", "1730"
 */
function normalizeTimeString(raw) {
  if (!raw) return '';
  let str = String(raw).trim().replace(/[.,;]/g, ':');
  if (!str) return '';

  // Pola dengan pemisah titik dua (contoh: "8:15", "08:15", "8:0")
  if (str.includes(':')) {
    const [hStr, mStr = '00'] = str.split(':');
    const h = Math.min(23, Math.max(0, parseInt(hStr, 10) || 0));
    const m = Math.min(59, Math.max(0, parseInt(mStr.padEnd(2, '0').slice(0, 2), 10) || 0));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Hanya angka tanpa pemisah
  const digits = str.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 4) {
    // Contoh: "0815" -> "08:15", "0800" -> "08:00", "1730" -> "17:30"
    const h = Math.min(23, parseInt(digits.slice(0, 2), 10));
    const m = Math.min(59, parseInt(digits.slice(2, 4), 10));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  if (digits.length === 3) {
    // Contoh: "815" -> "08:15", "800" -> "08:00", "730" -> "07:30"
    const h = Math.min(23, parseInt(digits.slice(0, 1), 10));
    const m = Math.min(59, parseInt(digits.slice(1, 3), 10));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  if (digits.length <= 2) {
    // Contoh: "8" -> "08:00", "17" -> "17:00"
    const h = Math.min(23, parseInt(digits, 10));
    return `${String(h).padStart(2, '0')}:00`;
  }

  return str.slice(0, 5);
}

/**
 * Format instan saat pengetikan berlangsung (onChange)
 */
function formatTimeOnChange(val) {
  if (!val) return '';
  const clean = val.replace(/[.,;]/g, ':');

  // Jika user mengetik pola 4 digit (misal: "0815", "0800", "1700")
  if (/^\d{4}$/.test(clean)) {
    const h = Math.min(23, parseInt(clean.slice(0, 2), 10));
    const m = Math.min(59, parseInt(clean.slice(2, 4), 10));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Jika user mengetik pola H:MM atau HH:MM (misal "8:15" -> "08:15", "08:00" -> "08:00")
  if (/^\d{1,2}:\d{2}$/.test(clean)) {
    const [h, m] = clean.split(':');
    return `${String(Math.min(23, parseInt(h, 10))).padStart(2, '0')}:${m}`;
  }

  return clean;
}

/**
 * Komponen Input Waktu Cerdas untuk Jam Datang & Jam Pulang
 */
function TimeInputCell({ value, disabled, onSave, ariaLabel }) {
  const [localVal, setLocalVal] = useState(value || '');

  useEffect(() => {
    setLocalVal(value || '');
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    const formatted = formatTimeOnChange(raw);
    setLocalVal(formatted);
    // Jika langsung terbentuk format valid "HH:mm" (panjang 5), simpan instan
    if (/^\d{2}:\d{2}$/.test(formatted)) {
      onSave(formatted);
    }
  };

  const handleBlur = () => {
    if (!localVal) {
      if (value) onSave('');
      return;
    }
    const normalized = normalizeTimeString(localVal);
    setLocalVal(normalized);
    if (normalized !== value) {
      onSave(normalized);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <input
      type="text"
      placeholder="--:--"
      disabled={disabled}
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      maxLength={5}
      aria-label={ariaLabel}
      className={`w-16 px-1 py-1 text-center font-mono text-xs border rounded transition-colors ${
        disabled
          ? 'bg-transparent border-transparent cursor-not-allowed text-ink'
          : 'border-border bg-white text-ink focus:border-primary-red focus:ring-1 focus:ring-primary-red'
      }`}
    />
  );
}

const MONTH_OPTIONS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export default function AttendanceSpreadsheetPage() {
  const { currentUser, hasPermission } = useAuth();
  const canFinalize = hasPermission(PERMISSIONS.ATTENDANCE_FINALIZE);
  const canReopen = hasPermission(PERMISSIONS.ATTENDANCE_REOPEN) || currentUser?.role === 'DIREKTUR';
  const canExport = hasPermission(PERMISSIONS.ATTENDANCE_EXPORT);

  // Deteksi khusus user1 dan user2 (admin HRD inputer absensi lapangan)
  const isAttendanceOnly = Boolean(
    currentUser?.isAttendanceOnly ||
    currentUser?.username === 'user1' ||
    currentUser?.username === 'user2'
  );
  const currentUserId = currentUser?.username || currentUser?.id || 'user';

  // State key untuk unmount/remount modal import sehingga seluruh histori file terhapus bersih saat dibuka ulang
  const [importModalKey, setImportModalKey] = useState(0);

  const handleOpenImportModal = () => {
    setImportModalKey((prev) => prev + 1);
    setIsImportModalOpen(true);
  };

  // Selector filter state
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('9');
  const [clientId, setClientId] = useState('');
  const [locationId, setLocationId] = useState('');

  // Durasi Kerja Dropdown: '8', '10', '12', atau 'manual'
  const [workDurationType, setWorkDurationType] = useState('8');
  const [manualHours, setManualHours] = useState('8');
  const effectiveWorkDuration = useMemo(() => {
    if (workDurationType === 'manual') {
      const val = parseFloat(manualHours);
      return !isNaN(val) && val > 0 ? val : 8;
    }
    return parseFloat(workDurationType) || 8;
  }, [workDurationType, manualHours]);

  // Active Sheet & Rows
  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals & Reports
  const [validationReport, setValidationReport] = useState(null);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Total jumlah hari mengikuti bulan dan tahun yang dipilih pada dropdown
  const totalDaysInMonth = useMemo(() => {
    const y = parseInt(year, 10) || 2026;
    const m = parseInt(month, 10) || 9;
    return new Date(y, m, 0).getDate();
  }, [year, month]);

  // Input manual tanggal awal (N) untuk kolom pertama, default 1
  const [startDay, setStartDay] = useState(1);

  // Jika user ganti bulan dan startDay melebihi jumlah hari bulan baru, sesuaikan ke 1
  useEffect(() => {
    const current = parseInt(startDay, 10);
    if (!isNaN(current) && current > totalDaysInMonth) {
      setStartDay(1);
    }
  }, [totalDaysInMonth, startDay]);

  const effectiveStartDay = useMemo(() => {
    const num = parseInt(startDay, 10);
    if (!isNaN(num) && num >= 1 && num <= totalDaysInMonth) {
      return num;
    }
    return 1;
  }, [startDay, totalDaysInMonth]);

  // Generate daftar tanggal mengikuti bulan aktif (total kolom = totalDaysInMonth)
  const daysInMonth = useMemo(() => {
    const y = parseInt(year, 10) || 2026;
    const m = parseInt(month, 10) || 9;
    const monthStr = String(m).padStart(2, '0');

    // Penanganan rollover tanggal jika melintasi bulan kalender
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear = m === 12 ? y + 1 : y;
    const nextMonthStr = String(nextMonth).padStart(2, '0');

    return Array.from({ length: totalDaysInMonth }, (_, i) => {
      const dayNum = ((effectiveStartDay - 1 + i) % totalDaysInMonth) + 1;
      const dayStr = String(dayNum).padStart(2, '0');
      const isRolledOver = effectiveStartDay > 1 && dayNum < effectiveStartDay;

      const dateStr = `${y}-${monthStr}-${dayStr}`;
      const altDateStr = isRolledOver ? `${nextYear}-${nextMonthStr}-${dayStr}` : dateStr;

      return {
        index: i,
        day: dayNum,
        dayStr,
        dateStr,
        altDateStr,
        label: `Tgl ${dayNum}`,
      };
    });
  }, [year, month, effectiveStartDay, totalDaysInMonth]);

  // Bersihkan riwayat lembar kerja untuk user inputer (user1/user2)
  const handleClearSheetsHistory = async () => {
    if (!window.confirm('Bersihkan seluruh riwayat lembar kerja yang dibuka? Tampilan lembar tersedia akan direset kembali bersih.')) return;
    try {
      attendanceAdapter.clearInputerHistory(currentUserId);
      setSheets([]);
      setSelectedSheetId(null);
      setSheetData(null);
      toast.success('Riwayat lembar kerja berhasil dibersihkan.');
    } catch {
      toast.error('Gagal membersihkan riwayat lembar kerja.');
    }
  };

  // Load sheets matching current year and month
  const loadSheets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceAdapter.getSheets({
        year,
        month,
        isAttendanceOnly,
        userId: currentUserId,
      });
      if (res.data) {
        setSheets(res.data);
        const match = res.data.find((s) => {
          if (clientId && locationId) return s.clientId === clientId && s.locationId === locationId;
          if (clientId) return s.clientId === clientId;
          if (locationId) return s.locationId === locationId;
          return false;
        });
        if (match) {
          setSelectedSheetId(match.id);
        } else if (res.data.length > 0) {
          setSelectedSheetId((prev) => {
            const exists = res.data.some((s) => s.id === prev);
            return exists ? prev : res.data[0].id;
          });
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
  }, [year, month, clientId, locationId, isAttendanceOnly, currentUserId]);

  // Handle pemilihan dropdown Klien
  const handleClientChange = async (newClientId) => {
    setClientId(newClientId);
    const matchingLocations = newClientId
      ? MOCK_LOCATIONS.filter((l) => l.clientId === newClientId)
      : MOCK_LOCATIONS;
    const defaultLoc = matchingLocations[0];
    const newLocId = defaultLoc ? defaultLoc.id : '';
    setLocationId(newLocId);

    if (newLocId) {
      try {
        const res = await attendanceAdapter.findOrCreateSheet({
          year,
          month,
          clientId: newClientId,
          locationId: newLocId,
          isAttendanceOnly,
          userId: currentUserId,
        });
        if (res.data) {
          setSelectedSheetId(res.data.id);
          const sheetsRes = await attendanceAdapter.getSheets({
            year,
            month,
            isAttendanceOnly,
            userId: currentUserId,
          });
          if (sheetsRes.data) setSheets(sheetsRes.data);
        }
      } catch {
        toast.error('Gagal memuat lembar absensi klien.');
      }
    } else {
      setSelectedSheetId(null);
      setSheetData(null);
    }
  };

  // Handle pemilihan dropdown Lokasi Penempatan
  const handleLocationChange = async (newLocId) => {
    setLocationId(newLocId);
    const foundLoc = MOCK_LOCATIONS.find((l) => l.id === newLocId);
    const resolvedClientId = foundLoc?.clientId || clientId;
    if (resolvedClientId && resolvedClientId !== clientId) {
      setClientId(resolvedClientId);
    }

    if (newLocId) {
      try {
        const res = await attendanceAdapter.findOrCreateSheet({
          year,
          month,
          clientId: resolvedClientId,
          locationId: newLocId,
          isAttendanceOnly,
          userId: currentUserId,
        });
        if (res.data) {
          setSelectedSheetId(res.data.id);
          const sheetsRes = await attendanceAdapter.getSheets({
            year,
            month,
            isAttendanceOnly,
            userId: currentUserId,
          });
          if (sheetsRes.data) setSheets(sheetsRes.data);
        }
      } catch {
        toast.error('Gagal memuat lembar absensi lokasi.');
      }
    } else {
      setSelectedSheetId(null);
      setSheetData(null);
    }
  };

  // Load active sheet rows
  const loadSheetRows = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await attendanceAdapter.getSheetById(id, {
        isAttendanceOnly,
        userId: currentUserId,
      });
      if (res.data) {
        setSheetData(res.data);
        setValidationReport(null);
        if (res.data.sheet) {
          if (res.data.sheet.clientId) setClientId(res.data.sheet.clientId);
          if (res.data.sheet.locationId) setLocationId(res.data.sheet.locationId);
          if (res.data.sheet.workDurationType) {
            setWorkDurationType(res.data.sheet.workDurationType);
          } else if (res.data.sheet.workDuration) {
            const durStr = String(res.data.sheet.workDuration);
            if (['8', '10', '12'].includes(durStr)) {
              setWorkDurationType(durStr);
            } else {
              setWorkDurationType('manual');
              setManualHours(durStr);
            }
          } else {
            setWorkDurationType('8');
          }
          if (res.data.sheet.manualHours) {
            setManualHours(String(res.data.sheet.manualHours));
          } else {
            setManualHours('8');
          }
        }

        // Tampilkan notifikasi jika data karyawan di lokasi klien ini kosong
        const hasRows = res.data.rows && res.data.rows.length > 0;
        if (!hasRows) {
          toast.error('Data Karyawan pada lokasi klien ini masih kosong', {
            id: 'empty-emp-location-toast',
            duration: 4000,
          });
        }
      }
    } catch {
      toast.error('Gagal memuat baris data absensi.');
    } finally {
      setLoading(false);
    }
  }, [isAttendanceOnly, currentUserId]);

  // Sinkronisasi Durasi Kerja ke adapter persisten dan Rekap Input Payroll
  const handleWorkDurationTypeChange = (newType) => {
    setWorkDurationType(newType);
    let dur = parseFloat(newType);
    if (newType === 'manual') {
      dur = parseFloat(manualHours) || 8;
    }
    if (!isNaN(dur) && dur > 0 && sheetData?.sheet?.id) {
      attendanceAdapter.updateSheetWorkDuration(sheetData.sheet.id, dur, newType, manualHours, {
        isAttendanceOnly,
        userId: currentUserId,
      });
      setSheetData((prev) =>
        prev
          ? {
              ...prev,
              sheet: {
                ...prev.sheet,
                workDuration: dur,
                workDurationType: newType,
                manualHours,
              },
            }
          : prev
      );
      setSheets((prev) =>
        prev.map((s) =>
          s.id === sheetData.sheet.id
            ? { ...s, workDuration: dur, workDurationType: newType }
            : s
        )
      );
      toast.success(`Durasi kerja diubah ke ${dur} Jam. Rekap Input Payroll otomatis disinkronkan.`, {
        id: 'work-duration-sync-toast',
      });
    }
  };

  const handleManualHoursChange = (newHours) => {
    setManualHours(newHours);
    const dur = parseFloat(newHours);
    if (!isNaN(dur) && dur > 0 && sheetData?.sheet?.id) {
      attendanceAdapter.updateSheetWorkDuration(sheetData.sheet.id, dur, 'manual', newHours, {
        isAttendanceOnly,
        userId: currentUserId,
      });
      setSheetData((prev) =>
        prev
          ? {
              ...prev,
              sheet: {
                ...prev.sheet,
                workDuration: dur,
                workDurationType: 'manual',
                manualHours: newHours,
              },
            }
          : prev
      );
      setSheets((prev) =>
        prev.map((s) =>
          s.id === sheetData.sheet.id
            ? { ...s, workDuration: dur, workDurationType: 'manual', manualHours: newHours }
            : s
        )
      );
    }
  };

  useEffect(() => {
    loadSheets();
  }, [loadSheets]);

  useEffect(() => {
    if (selectedSheetId) {
      loadSheetRows(selectedSheetId);
    }
  }, [selectedSheetId, loadSheetRows]);

  // Daftar seluruh personil unik yang ditempatkan pada sheet / lokasi ini (filter out invalid / placeholder rows)
  const employeesList = useMemo(() => {
    if (!sheetData?.rows) return [];
    const map = new Map();
    sheetData.rows.forEach((r) => {
      if (isInvalidEmployeeName(r.employeeName)) return;
      if (!map.has(r.employeeId)) {
        map.set(r.employeeId, {
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          employeeNik: r.employeeNik || '-',
          roleInUnit: r.roleInUnit || 'Anggota',
          shiftName: r.shiftName || 'Shift Reguler',
        });
      }
    });
    return Array.from(map.values());
  }, [sheetData]);

  // Index map cepat [employeeId_dateStr] -> rowData
  const rowMap = useMemo(() => {
    const map = {};
    if (sheetData?.rows) {
      sheetData.rows.forEach((r) => {
        map[`${r.employeeId}_${r.attendanceDate}`] = r;
      });
    }
    return map;
  }, [sheetData]);

  // Handle cell edit (check-in / check-out pada tanggal tertentu)
  const handleCellChange = async (emp, dateStr, field, value) => {
    if (!sheetData) return;
    if (sheetData.sheet.status === STATUS.FINALIZED) {
      toast.error('Lembar absensi terkunci (Final). Silakan buka kunci untuk mengubah.');
      return;
    }

    const cellKey = `${emp.employeeId}_${dateStr}`;
    const existing = rowMap[cellKey] || {};
    const newCheckIn = field === 'checkIn' ? value : existing.checkIn || '';
    const newCheckOut = field === 'checkOut' ? value : existing.checkOut || '';

    // Optimistic update di tabel UI
    const updatedRows = [...sheetData.rows];
    const existingIdx = updatedRows.findIndex(
      (r) => r.employeeId === emp.employeeId && r.attendanceDate === dateStr
    );

    const updatedRowData = {
      ...(existing.id ? existing : {}),
      id: existing.id || `ROW-OPT-${emp.employeeId}-${dateStr}`,
      sheetId: sheetData.sheet.id,
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      employeeNik: emp.employeeNik,
      roleInUnit: emp.roleInUnit,
      attendanceDate: dateStr,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
    };

    if (existingIdx !== -1) {
      updatedRows[existingIdx] = { ...updatedRows[existingIdx], ...updatedRowData };
    } else {
      updatedRows.push(updatedRowData);
    }

    setSheetData((prev) => ({
      ...prev,
      rows: updatedRows,
    }));

    // Simpan ke adapter persisten
    try {
      await attendanceAdapter.updateCell(sheetData.sheet.id, {
        employeeId: emp.employeeId,
        attendanceDate: dateStr,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        employeeName: emp.employeeName,
        employeeNik: emp.employeeNik,
        roleInUnit: emp.roleInUnit,
      }, {
        isAttendanceOnly,
        userId: currentUserId,
      });
    } catch {
      toast.error('Gagal menyimpan perubahan absensi.');
    }
  };

  // Generate new roster for current client & location
  const handleGenerateRoster = async () => {
    const clientObj = MOCK_CLIENTS.find((c) => c.id === clientId) || MOCK_CLIENTS[0];
    const locObj = MOCK_LOCATIONS.find((l) => l.id === locationId) || MOCK_LOCATIONS.find((l) => l.clientId === clientObj.id) || MOCK_LOCATIONS[0];

    try {
      const res = await attendanceAdapter.generateRoster({
        year,
        month,
        clientId: clientObj.id,
        clientName: clientObj.name,
        locationId: locObj.id,
        locationName: locObj.name,
        serviceType: 'security',
        isAttendanceOnly,
        userId: currentUserId,
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

    if (!window.confirm('Isi otomatis seluruh baris yang kosong dengan jam kerja normal (08:00 - 16:00)?')) return;

    try {
      await attendanceAdapter.bulkFillTime(sheetData.sheet.id, {
        timeIn: '08:00',
        timeOut: '16:00',
      }, {
        isAttendanceOnly,
        userId: currentUserId,
      });
      toast.success('Pengisian otomatis absensi selesai.');
      loadSheetRows(sheetData.sheet.id);
    } catch {
      toast.error('Gagal melakukan pengisian otomatis.');
    }
  };

  // Reset / kosongkan seluruh tabel absensi pada sheet aktif (khusus user1 & user2)
  const handleResetSheet = async () => {
    if (!sheetData) return;
    if (!window.confirm('Kosongkan seluruh data tabel absensi pada lembar ini?')) return;
    try {
      await attendanceAdapter.resetSheetRows(sheetData.sheet.id, {
        isAttendanceOnly,
        userId: currentUserId,
      });
      toast.success('Tabel absensi berhasil dikosongkan.');
      loadSheetRows(sheetData.sheet.id);
    } catch {
      toast.error('Gagal mengosongkan tabel absensi.');
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
      reopenedBy: currentUser ? currentUser.name : 'Juli Priyanto (Direktur Utama)',
    });
    if (res.data) {
      toast.success('Lembar absensi berhasil dibuka kembali (REOPENED).');
      loadSheetRows(sheetData.sheet.id);
      loadSheets();
    }
  };

  // Export CSV dalam format Matriks Kalender Tanggal 1 s/d 31 (2-Tier Header Bertingkat)
  const handleExportCSV = () => {
    if (!sheetData || !employeesList.length) {
      toast.error('Tidak ada data personel untuk diekspor. Silakan import file Excel terlebih dahulu.');
      return;
    }

    // Header Judul Laporan di atas tabel
    const clientName = sheetData?.sheet?.clientName || MOCK_CLIENTS.find((c) => c.id === clientId)?.name || 'Semua Klien';
    const locationName = sheetData?.sheet?.locationName || MOCK_LOCATIONS.find((l) => l.id === locationId)?.name || 'Semua Lokasi Penempatan';
    const monthObj = MONTH_OPTIONS.find((m) => m.value === String(month));
    const monthName = monthObj ? monthObj.label : `Bulan ${month}`;
    const yearVal = year || sheetData?.sheet?.periodYear || '2026';

    const titleRow1 = ['Rekapitulasi Absensi Karyawan'];
    const titleRow2 = [`Klien: ${clientName}`];
    const titleRow3 = [`Lokasi Penempatan: ${locationName}`];
    const titleRow4 = [`Bulan: ${monthName}`, `Tahun: ${yearVal}`];

    // Header Baris 1: Kolom Utama & Header Tanggal / Rekapitulasi (Menaungi sub kolom)
    const headerRow1 = [
      'No',
      'ID Karyawan',
      'Nama Karyawan',
      'NIK',
      'Jabatan',
    ];

    daysInMonth.forEach((d) => {
      headerRow1.push(d.label, '', '');
    });

    headerRow1.push('Rekapitulasi Bulanan', '', '');

    // Header Baris 2: Sub Kolom Datang, Pulang, Lembur & Hadir, Jam Kerja, Lembur
    const headerRow2 = [
      '',
      '',
      '',
      '',
      '',
    ];

    daysInMonth.forEach(() => {
      headerRow2.push('Datang', 'Pulang', 'Lembur');
    });

    headerRow2.push('Hadir (HR)', 'Jam Kerja', 'Lembur (L)');

    // Data Baris Karyawan (Hanya karyawan valid, tanpa (LOCKED))
    const validEmployees = employeesList.filter((e) => !isInvalidEmployeeName(e.employeeName));

    const dataRows = validEmployees.map((emp, idx) => {
      let presentCount = 0;
      let totalWork = 0;
      let totalOvertime = 0;

      const rowValues = [
        idx + 1,
        emp.employeeId,
        emp.employeeName,
        emp.employeeNik || '-',
        emp.roleInUnit || 'Anggota',
      ];

      daysInMonth.forEach((d) => {
        const cell = rowMap[`${emp.employeeId}_${d.dateStr}`] || rowMap[`${emp.employeeId}_${d.altDateStr}`] || {};
        const cIn = cell.checkIn || '';
        const cOut = cell.checkOut || '';
        const ot = calculateOvertime(cIn, cOut, effectiveWorkDuration);
        const wh = calculateWorkHours(cIn, cOut);

        if (cIn || cOut) presentCount++;
        totalWork += wh;
        totalOvertime += ot;

        rowValues.push(cIn || '-', cOut || '-', ot > 0 ? ot : 0);
      });

      rowValues.push(
        presentCount,
        Math.round(totalWork * 10) / 10,
        Math.round(totalOvertime * 10) / 10
      );
      return rowValues;
    });

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const csvLines = [
      titleRow1.map(escapeCSV).join(','),
      titleRow2.map(escapeCSV).join(','),
      titleRow3.map(escapeCSV).join(','),
      titleRow4.map(escapeCSV).join(','),
      headerRow1.map(escapeCSV).join(','),
      headerRow2.map(escapeCSV).join(','),
      ...dataRows.map((row) => row.map(escapeCSV).join(',')),
    ];

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Matrix_${sheetData.sheet.sheetCode}_Durasi${effectiveWorkDuration}Jam.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Matrix absensi CSV berhasil diekspor.');
  };

  // Export Excel (.xlsx) dengan merge cell bertingkat (Tgl 01 -> Datang, Pulang, Lembur)
  const handleExportExcel = () => {
    if (!sheetData || !employeesList.length) {
      toast.error('Tidak ada data personel untuk diekspor. Silakan import file Excel terlebih dahulu.');
      return;
    }

    // Header Judul Laporan di atas tabel
    const clientName = sheetData?.sheet?.clientName || MOCK_CLIENTS.find((c) => c.id === clientId)?.name || 'Semua Klien';
    const locationName = sheetData?.sheet?.locationName || MOCK_LOCATIONS.find((l) => l.id === locationId)?.name || 'Semua Lokasi Penempatan';
    const monthObj = MONTH_OPTIONS.find((m) => m.value === String(month));
    const monthName = monthObj ? monthObj.label : `Bulan ${month}`;
    const yearVal = year || sheetData?.sheet?.periodYear || '2026';

    const titleRow1 = ['Rekapitulasi Absensi Karyawan'];
    const titleRow2 = [`Klien: ${clientName}`];
    const titleRow3 = [`Lokasi Penempatan: ${locationName}`];
    const titleRow4 = [`Bulan: ${monthName}`, `Tahun: ${yearVal}`];

    const headerRow1 = [
      'No',
      'ID Karyawan',
      'Nama Karyawan',
      'NIK',
      'Jabatan',
    ];

    daysInMonth.forEach((d) => {
      headerRow1.push(d.label, '', '');
    });

    headerRow1.push('Rekapitulasi Bulanan', '', '');

    const headerRow2 = [
      '',
      '',
      '',
      '',
      '',
    ];

    daysInMonth.forEach(() => {
      headerRow2.push('Datang', 'Pulang', 'Lembur');
    });

    headerRow2.push('Hadir (HR)', 'Jam Kerja', 'Lembur (L)');

    const validEmployees = employeesList.filter((e) => !isInvalidEmployeeName(e.employeeName));

    const dataRows = validEmployees.map((emp, idx) => {
      let presentCount = 0;
      let totalWork = 0;
      let totalOvertime = 0;

      const rowValues = [
        idx + 1,
        emp.employeeId,
        emp.employeeName,
        emp.employeeNik || '-',
        emp.roleInUnit || 'Anggota',
      ];

      daysInMonth.forEach((d) => {
        const cell = rowMap[`${emp.employeeId}_${d.dateStr}`] || rowMap[`${emp.employeeId}_${d.altDateStr}`] || {};
        const cIn = cell.checkIn || '';
        const cOut = cell.checkOut || '';
        const ot = calculateOvertime(cIn, cOut, effectiveWorkDuration);
        const wh = calculateWorkHours(cIn, cOut);

        if (cIn || cOut) presentCount++;
        totalWork += wh;
        totalOvertime += ot;

        rowValues.push(cIn || '-', cOut || '-', ot > 0 ? ot : 0);
      });

      rowValues.push(
        presentCount,
        Math.round(totalWork * 10) / 10,
        Math.round(totalOvertime * 10) / 10
      );
      return rowValues;
    });

    const aoa = [
      titleRow1,
      titleRow2,
      titleRow3,
      titleRow4,
      headerRow1,
      headerRow2,
      ...dataRows,
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merge configurations (header tabel bergeser ke baris index 4 karena ada 4 baris judul di atas)
    const tableHeaderRowIdx = 4;

    const merges = [
      // Merge vertical No, ID, Nama, NIK, Jabatan
      { s: { r: tableHeaderRowIdx, c: 0 }, e: { r: tableHeaderRowIdx + 1, c: 0 } },
      { s: { r: tableHeaderRowIdx, c: 1 }, e: { r: tableHeaderRowIdx + 1, c: 1 } },
      { s: { r: tableHeaderRowIdx, c: 2 }, e: { r: tableHeaderRowIdx + 1, c: 2 } },
      { s: { r: tableHeaderRowIdx, c: 3 }, e: { r: tableHeaderRowIdx + 1, c: 3 } },
      { s: { r: tableHeaderRowIdx, c: 4 }, e: { r: tableHeaderRowIdx + 1, c: 4 } },
    ];

    let colIdx = 5;
    daysInMonth.forEach(() => {
      merges.push({ s: { r: tableHeaderRowIdx, c: colIdx }, e: { r: tableHeaderRowIdx, c: colIdx + 2 } });
      colIdx += 3;
    });

    // Merge Rekapitulasi Bulanan
    merges.push({ s: { r: tableHeaderRowIdx, c: colIdx }, e: { r: tableHeaderRowIdx, c: colIdx + 2 } });
    ws['!merges'] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance_Matrix');
    XLSX.writeFile(wb, `Attendance_Matrix_${sheetData.sheet.sheetCode}_Durasi${effectiveWorkDuration}Jam.xlsx`);
    toast.success('Matrix absensi Excel (.xlsx) berhasil diekspor.');
  };

  const isFinalized = sheetData?.sheet?.status === STATUS.FINALIZED;

  return (
    <div className="space-y-4">
      {/* Selector Hirarki: Periode → Klien → Lokasi → Durasi Kerja */}
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
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Klien */}
            <select
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="px-3 py-1.5 text-xs border border-border rounded-lg bg-white text-ink max-w-[200px]"
            >
              <option value="">Semua Klien</option>
              {MOCK_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Lokasi Penempatan */}
            <select
              value={locationId}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="px-3 py-1.5 text-xs border border-border rounded-lg bg-white text-ink max-w-[240px]"
            >
              <option value="">Semua Lokasi Penempatan</option>
              {(clientId ? MOCK_LOCATIONS.filter((l) => l.clientId === clientId) : MOCK_LOCATIONS).map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            {/* Dropdown Durasi Kerja di sebelah Lokasi Penempatan */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-border/80">
              <span className="text-xs font-semibold text-muted flex-none flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary-red" />
                Durasi Kerja:
              </span>
              <select
                value={workDurationType}
                onChange={(e) => handleWorkDurationTypeChange(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold border border-primary-red/30 rounded-lg bg-primary-red/5 text-primary-red focus:ring-1 focus:ring-primary-red"
              >
                <option value="8">8 Jam</option>
                <option value="10">10 Jam</option>
                <option value="12">12 Jam</option>
                <option value="manual">Tambahan Isi Manual</option>
              </select>

              {workDurationType === 'manual' && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    step="0.5"
                    value={manualHours}
                    onChange={(e) => handleManualHoursChange(e.target.value)}
                    className="w-16 px-2 py-1 text-xs font-bold border border-primary-red rounded-lg bg-white text-ink text-center focus:ring-1 focus:ring-primary-red"
                    placeholder="8"
                  />
                  <span className="text-xs font-semibold text-muted">jam</span>
                </div>
              )}
            </div>
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
                onClick={() => {
                  setSelectedSheetId(s.id);
                  if (s.clientId) setClientId(s.clientId);
                  if (s.locationId) setLocationId(s.locationId);
                }}
                className={`px-3 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  selectedSheetId === s.id
                    ? 'bg-primary-red text-white border-primary-red shadow-xs font-semibold'
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
            {isAttendanceOnly && (
              <button
                type="button"
                onClick={handleClearSheetsHistory}
                className="ml-auto text-[11px] text-muted hover:text-primary-red transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 flex-none"
                title="Bersihkan riwayat lembar kerja yang dibuka"
              >
                <Trash2 className="h-3 w-3" />
                <span>Bersihkan Riwayat</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Spreadsheet Main Section */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat tabel spreadsheet absensi dan menghitung kalkulasi durasi & lembur..." />
        </div>
      ) : !sheetData ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Belum ada lembar absensi yang dibuka"
            description={
              isAttendanceOnly
                ? "Silakan pilih Klien dan Lokasi Penempatan pada dropdown di atas, atau klik tombol Import Excel untuk mengunggah lembar absensi."
                : "Tidak ditemukan lembar absensi untuk periode dan lokasi yang dipilih."
            }
            actionLabel={isAttendanceOnly ? "Import File Excel (.xlsx)" : "Generate Roster dari Penugasan Aktif"}
            onAction={isAttendanceOnly ? handleOpenImportModal : handleGenerateRoster}
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20">
                    <Users className="h-3 w-3" />
                    {employeesList.length} Personel Terdaftar
                  </span>
                </div>
                <p className="text-xs text-muted font-mono mt-0.5">
                  {sheetData.sheet.sheetCode} • {sheetData.sheet.locationName} • {sheetData.sheet.periodName} • Standar: {effectiveWorkDuration} Jam Kerja
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

              {!isFinalized && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenImportModal}
                  className="gap-1.5 text-xs text-primary-red border-primary-red/40 hover:bg-primary-red/5 font-semibold"
                  title="Import jam datang & pulang dari file Excel (.xlsx / .csv)"
                >
                  <Upload className="h-3.5 w-3.5 text-primary-red" />
                  <span>Import Excel</span>
                </Button>
              )}

              {isAttendanceOnly && employeesList.length > 0 && !isFinalized && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetSheet}
                  className="gap-1.5 text-xs text-muted hover:text-error border-border hover:border-error/40"
                  title="Kosongkan seluruh data tabel absensi pada lembar ini"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-error/80" />
                  <span>Kosongkan Tabel</span>
                </Button>
              )}

              {canExport && (
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5 text-primary-red" />
                    <span>Export CSV</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportExcel}
                    className="gap-1.5 text-xs bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Export Excel (.xlsx)</span>
                  </Button>
                </div>
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

          {/* Notifikasi jika data karyawan pada lokasi klien ini masih kosong */}
          {employeesList.length === 0 && (
            <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs flex items-center justify-between text-amber-900 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-none" />
                <div>
                  <span className="font-bold">
                    Data Karyawan pada lokasi klien ini masih kosong
                  </span>
                  <span className="text-amber-800/90 ml-2 hidden sm:inline">
                    (Belum ada data penugasan personel aktif di {sheetData?.sheet?.locationName || 'lokasi ini'}).
                  </span>
                </div>
              </div>
              {!isFinalized && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenImportModal}
                  className="text-xs border-amber-300 bg-white text-amber-900 hover:bg-amber-100/70 flex-none gap-1 py-1 h-7"
                >
                  <Upload className="h-3.5 w-3.5 text-amber-700" />
                  <span>Import Excel</span>
                </Button>
              )}
            </div>
          )}

          {/* TABEL MATRIKS KALENDER HORIZONTAL (Tanggal 1 s/d 31) */}
          <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse min-w-[3400px]">
              <thead className="sticky top-0 z-30 shadow-xs backdrop-blur-xs">
                {/* Header Tingkat 1: No, Nama Karyawan (Locked), Grup Tanggal 1 s/d 31, Rekap Bulanan */}
                <tr className="bg-canvas border-b border-border text-[11px] font-bold text-ink uppercase tracking-wider">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-40 bg-canvas px-3 py-2 text-center border-r border-border w-12 min-w-[48px]"
                  >
                    No
                  </th>
                  <th
                    rowSpan={2}
                    className="sticky left-12 z-40 bg-canvas px-4 py-2 text-left border-r border-border min-w-[220px] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.12)]"
                  >
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-primary-red" />
                      <span>Nama Karyawan (Locked)</span>
                    </div>
                  </th>

                  {/* Header Tiap Tanggal */}
                  {daysInMonth.map((day, idx) => (
                    <th
                      key={`day-header-${idx}-${day.day}`}
                      colSpan={3}
                      className="px-2 py-1.5 text-center border-r border-border bg-slate-100/80 font-bold text-xs"
                    >
                      {idx === 0 ? (
                        <div className="flex items-center justify-center gap-1.5 text-ink">
                          <Calendar className="h-3.5 w-3.5 text-primary-red flex-none" />
                          <span className="font-bold">TGL</span>
                          <input
                            type="number"
                            min="1"
                            max={totalDaysInMonth}
                            value={startDay}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setStartDay('');
                                return;
                              }
                              const num = parseInt(val, 10);
                              if (!isNaN(num)) {
                                if (num > totalDaysInMonth) {
                                  setStartDay(totalDaysInMonth);
                                } else if (num < 1) {
                                  setStartDay(1);
                                } else {
                                  setStartDay(num);
                                }
                              }
                            }}
                            onBlur={() => {
                              const num = parseInt(startDay, 10);
                              if (isNaN(num) || num < 1) {
                                setStartDay(1);
                              } else if (num > totalDaysInMonth) {
                                setStartDay(totalDaysInMonth);
                              }
                            }}
                            className="w-12 px-1 py-0.5 text-center text-xs font-bold border border-primary-red/50 rounded bg-white text-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red shadow-2xs"
                            title={`Input manual angka tanggal awal (1 s/d ${totalDaysInMonth}). Kolom berikutnya otomatis berlanjut hingga tanggal ${totalDaysInMonth} lalu kembali ke Tgl 1.`}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-ink">
                          <Calendar className="h-3 w-3 text-primary-red flex-none" />
                          <span>{day.label}</span>
                        </div>
                      )}
                    </th>
                  ))}

                  {/* Kolom Rekapitulasi di Paling Kanan */}
                  <th
                    colSpan={3}
                    className="px-3 py-1.5 text-center bg-primary-red/10 text-primary-red border-l border-border font-bold text-xs"
                  >
                    Rekapitulasi Bulanan
                  </th>
                </tr>

                {/* Header Tingkat 2: Sub-kolom (Datang, Pulang, Lembur) per Tanggal */}
                <tr className="bg-canvas/90 border-b border-border text-[10px] font-semibold text-muted uppercase">
                  {daysInMonth.map((day, idx) => (
                    <React.Fragment key={`sub-${idx}-${day.day}`}>
                      <th className="px-1.5 py-1 text-center border-r border-border/50 min-w-[72px] bg-slate-50">
                        Datang
                      </th>
                      <th className="px-1.5 py-1 text-center border-r border-border/50 min-w-[72px] bg-slate-50">
                        Pulang
                      </th>
                      <th className="px-1.5 py-1 text-center border-r border-border min-w-[62px] bg-amber-50 text-amber-900 font-bold">
                        Lembur
                      </th>
                    </React.Fragment>
                  ))}

                  <th className="px-2 py-1 text-center border-r border-border/50 min-w-[70px] bg-primary-red/5 text-primary-red">
                    Hadir (Hr)
                  </th>
                  <th className="px-2 py-1 text-center border-r border-border/50 min-w-[75px] bg-primary-red/5 text-primary-red">
                    Jam Kerja
                  </th>
                  <th className="px-2 py-1 text-center min-w-[80px] bg-primary-yellow/20 text-amber-900 font-bold">
                    Lembur (j)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border bg-white">
                {employeesList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + daysInMonth.length * 3 + 3}
                      className="px-6 py-16 text-center text-muted bg-canvas/10"
                    >
                      <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
                        <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-200">
                          <AlertTriangle className="h-8 w-8 text-amber-600" />
                        </div>
                        <h4 className="text-base font-bold text-ink">
                          Data Karyawan pada lokasi klien ini masih kosong
                        </h4>
                        <p className="text-xs text-muted leading-relaxed">
                          Belum ada data personel / karyawan yang ditugaskan di lokasi{' '}
                          <strong className="text-ink">{sheetData?.sheet?.locationName || 'ini'}</strong>.
                          Anda dapat mengimpor data absensi atau daftar personel melalui menu{' '}
                          <strong className="text-ink">Import Excel</strong> (.xlsx / .csv) untuk mulai pengisian jam datang, pulang, dan lembur secara manual.
                        </p>
                        {!isFinalized && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleOpenImportModal}
                            className="mt-2 gap-2 bg-primary-red hover:bg-red-800 text-xs shadow-xs"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Import File Excel Sekarang</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  employeesList.map((emp, empIdx) => {
                  let totalDaysPresent = 0;
                  let totalWorkHours = 0;
                  let totalOvertimeHours = 0;

                  return (
                    <tr
                      key={emp.employeeId}
                      className="hover:bg-primary-red/5 transition-colors group border-b border-border/70 text-xs"
                    >
                      {/* Kolom 0: Freeze No Urut */}
                      <td className="sticky left-0 z-20 bg-white group-hover:bg-[#FFF7F7] px-2 py-2 text-center text-muted font-mono font-semibold border-r border-border">
                        {empIdx + 1}
                      </td>

                      {/* Kolom 1: Freeze Nama Karyawan (Locked) */}
                      <td className="sticky left-12 z-20 bg-white group-hover:bg-[#FFF7F7] px-3 py-2 border-r border-border shadow-[3px_0_6px_-2px_rgba(0,0,0,0.12)]">
                        <div className="flex items-center gap-2">
                          <Lock className="h-3 w-3 text-muted/60 flex-none" title="Master Terkunci" />
                          <div className="min-w-0">
                            <p className="font-bold text-ink whitespace-nowrap">{emp.employeeName}</p>
                            <p className="text-[10px] font-mono text-muted whitespace-nowrap">
                              {emp.employeeNik !== '-' ? emp.employeeNik : emp.employeeId} • {emp.roleInUnit}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Tanggal: Jam Datang, Jam Pulang, Lembur */}
                      {daysInMonth.map((day, idx) => {
                        const cellKey = `${emp.employeeId}_${day.dateStr}`;
                        const altKey = `${emp.employeeId}_${day.altDateStr}`;
                        const cell = rowMap[cellKey] || rowMap[altKey] || {};
                        const checkIn = cell.checkIn || '';
                        const checkOut = cell.checkOut || '';
                        const overtime = calculateOvertime(checkIn, checkOut, effectiveWorkDuration);
                        const workHours = calculateWorkHours(checkIn, checkOut);

                        if (checkIn || checkOut) {
                          totalDaysPresent++;
                          totalWorkHours += workHours;
                          totalOvertimeHours += overtime;
                        }

                        return (
                          <React.Fragment key={`cell-${emp.employeeId}-${idx}-${day.day}`}>
                            {/* Kolom 2: Jam Datang (Input Manual Cerdas) */}
                            <td className="px-1 py-1 text-center border-r border-border/40">
                              <TimeInputCell
                                disabled={isFinalized}
                                value={checkIn}
                                ariaLabel={`Jam Datang ${emp.employeeName} ${day.label}`}
                                onSave={(val) => handleCellChange(emp, day.dateStr, 'checkIn', val)}
                              />
                            </td>

                            {/* Kolom 3: Jam Pulang (Input Manual Cerdas) */}
                            <td className="px-1 py-1 text-center border-r border-border/40">
                              <TimeInputCell
                                disabled={isFinalized}
                                value={checkOut}
                                ariaLabel={`Jam Pulang ${emp.employeeName} ${day.label}`}
                                onSave={(val) => handleCellChange(emp, day.dateStr, 'checkOut', val)}
                              />
                            </td>

                            {/* Kolom 4: Lembur (Numeric Formula) */}
                            <td
                              className={`px-1 py-1 text-center font-mono font-bold border-r border-border ${
                                overtime > 0
                                  ? 'bg-primary-yellow/20 text-amber-900'
                                  : 'text-muted/50 bg-slate-50/50'
                              }`}
                            >
                              {overtime > 0 ? overtime : 0}
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* Kolom Rekapitulasi per Baris Karyawan */}
                      <td className="px-2 py-2 text-center font-mono font-semibold text-ink border-r border-border/50 bg-canvas/30 whitespace-nowrap">
                        {totalDaysPresent} hr
                      </td>
                      <td className="px-2 py-2 text-center font-mono font-semibold text-ink border-r border-border/50 bg-canvas/30 whitespace-nowrap">
                        {Math.round(totalWorkHours * 10) / 10} j
                      </td>
                      <td className="px-2 py-2 text-center font-mono font-bold text-amber-900 bg-primary-yellow/15 whitespace-nowrap">
                        {Math.round(totalOvertimeHours * 10) / 10} j
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="p-3.5 border-t border-border bg-canvas/30 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted gap-2">
            <div className="flex items-center gap-4">
              <span>Total Personel di Lokasi: <strong className="text-ink">{employeesList.length} Orang</strong></span>
              <span>Total Kolom Tanggal: <strong className="text-ink">{totalDaysInMonth} Hari</strong></span>
              <span className="text-primary-red font-semibold">Rumus Lembur: (Pulang - Datang) - {effectiveWorkDuration} Jam</span>
            </div>
            <p className="text-[11px] font-mono">
              Format Matriks Horizontal • Tanggal 1 s/d {totalDaysInMonth} • PT. BARAK IOMS
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

      {/* Import Excel Modal */}
      <AttendanceImportModal
        key={`import-modal-${importModalKey}`}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        sheetData={sheetData}
        workDuration={effectiveWorkDuration}
        isAttendanceOnly={isAttendanceOnly}
        userId={currentUserId}
        onImportSuccess={() => {
          if (sheetData?.sheet?.id) {
            loadSheetRows(sheetData.sheet.id);
            loadSheets();
          }
        }}
      />
    </div>
  );
}
