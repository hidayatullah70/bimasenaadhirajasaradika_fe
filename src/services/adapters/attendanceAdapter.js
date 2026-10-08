/**
 * Attendance Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.2, 21 / API-SPEC Section 4 / AGENTS.md Workflow Rules.
 *
 * Rules:
 * 1. Roster comes from active assignments.
 * 2. Master fields are locked and not editable.
 * 3. HRD can edit checkIn & checkOut only when sheet status is OPEN or REOPENED.
 * 4. Finalize locks the sheet completely.
 * 5. Reopen requires reason + privileged permission and emits audit trail.
 */

import apiClient from '@/services/apiClient';
import {
  INITIAL_ATTENDANCE_SHEETS,
  generateRowsForSheet,
  calculateAttendanceMetrics,
  calculateWorkHours,
  calculateOvertime,
} from '@/services/mock/mockAttendanceData';
import { MOCK_ASSIGNMENTS, MOCK_CLIENTS, MOCK_LOCATIONS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';
import { storage, getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';

/**
 * Helper to detect invalid or header artifact employee names (e.g. '(LOCKED)', 'LOCKED', etc.)
 */
export function isInvalidEmployeeName(name) {
  if (!name || typeof name !== 'string') return true;
  const clean = name.trim().toUpperCase();
  const stripped = clean.replace(/[\s()_.:-]/g, '');
  if (
    !stripped ||
    stripped === 'LOCKED' ||
    stripped === 'LOCK' ||
    stripped === 'INPUTMANUAL' ||
    stripped === 'MANUAL' ||
    stripped === 'RUMUS' ||
    stripped === 'NUMERIC' ||
    stripped === 'NAMAKARYAWAN' ||
    stripped === 'NAMALENGKAP' ||
    stripped === 'NAMA' ||
    stripped === 'KARYAWAN' ||
    stripped === 'TIDAKDIKENAL' ||
    stripped === 'PERSONEL' ||
    stripped === 'PEGAWAI' ||
    (clean.startsWith('(') && clean.endsWith(')')) ||
    (clean.includes('LOCKED') && stripped.length <= 10)
  ) {
    return true;
  }
  return false;
}

function getSheetsStore() {
  return getStoredCollection('attendance_sheets', () => [...INITIAL_ATTENDANCE_SHEETS]);
}

function saveSheetsStore(sheets) {
  saveStoredCollection('attendance_sheets', sheets);
}

function getRowsStore() {
  return getStoredCollection('attendance_rows', () => {
    const initialRows = {};
    const sheets = getSheetsStore();
    sheets.forEach((sheet) => {
      initialRows[sheet.id] = generateRowsForSheet(sheet);
    });
    return initialRows;
  });
}

function saveRowsStore(rows) {
  saveStoredCollection('attendance_rows', rows);
}

/**
 * Generate blank attendance rows for active assignments (jam datang & pulang kosong siap diisi manual)
 */
function createBlankRowsForAssignments(sheet, assignments) {
  const yStr = parseInt(sheet.periodYear, 10) || 2026;
  const mNum = parseInt(sheet.periodMonth, 10) || 9;
  const totalDays = new Date(yStr, mNum, 0).getDate();
  const mStr = String(mNum).padStart(2, '0');
  const daysInPeriod = Array.from({ length: totalDays }, (_, i) => {
    const dStr = String(i + 1).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  });

  const rows = [];
  let rowCounter = 1;
  assignments.forEach((asn) => {
    daysInPeriod.forEach((dateStr) => {
      rows.push({
        id: `ROW-${sheet.id}-${rowCounter.toString().padStart(5, '0')}`,
        sheetId: sheet.id,
        employeeId: asn.employeeId,
        employeeName: asn.employeeName,
        employeeNik: asn.employeeNik || '-',
        assignmentId: asn.id,
        clientName: sheet.clientName,
        locationName: sheet.locationName,
        serviceType: asn.serviceType || sheet.serviceType || 'security',
        roleInUnit: asn.roleInUnit || 'Anggota',
        shiftId: '',
        shiftName: '',
        scheduledIn: '',
        scheduledOut: '',
        attendanceDate: dateStr,
        checkIn: '', // Jam Datang kosong - siap input manual
        checkOut: '', // Jam Pulang kosong - siap input manual
        status: STATUS.UNFILLED,
        totalMinutes: 0,
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        overtimeMinutes: 0,
        notes: '',
        updatedAt: new Date().toISOString(),
      });
      rowCounter++;
    });
  });

  return rows;
}

export const attendanceAdapter = {
  /**
   * Clear all attendance sheet and rows history for an attendance-only inputer (user1, user2)
   * Ensures "Lembar Tersedia" and active sheet rows are completely clean on next login or logout.
   */
  clearInputerHistory(userId) {
    const userIds = new Set();
    if (userId) {
      const cleanId = String(userId).trim();
      userIds.add(cleanId);
      if (cleanId.toLowerCase() === 'user1' || cleanId === 'USR-009') {
        userIds.add('user1');
        userIds.add('USR-009');
      }
      if (cleanId.toLowerCase() === 'user2' || cleanId === 'USR-010') {
        userIds.add('user2');
        userIds.add('USR-010');
      }
    } else {
      userIds.add('user1');
      userIds.add('user2');
      userIds.add('USR-009');
      userIds.add('USR-010');
    }

    userIds.forEach((uid) => {
      const baseKeys = [
        `attendance_sheets_inputer_${uid}`,
        `attendance_rows_inputer_${uid}`,
        `attendance_import_history_${uid}`,
        `attendance_excel_history_${uid}`,
      ];
      baseKeys.forEach((k) => {
        try {
          storage.remove(k);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(k);
            window.sessionStorage.removeItem(k);
            window.localStorage.removeItem(`outsourcing_dev_${k}`);
            window.localStorage.removeItem(`barak_${k}`);
          }
        } catch {
          // ignore
        }
      });
    });

    if (typeof window !== 'undefined') {
      try {
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (
            k &&
            (k.includes('inputer_user1') ||
              k.includes('inputer_user2') ||
              k.includes('inputer_USR-009') ||
              k.includes('inputer_USR-010'))
          ) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      } catch {
        // ignore
      }
    }
  },

  /**
   * Find or create attendance sheet for a specific client & location & period
   */
  async findOrCreateSheet({ year, month, clientId, locationId, isAttendanceOnly = false, userId = null }) {
    if (isMock) {
      const uId = userId || 'default';
      const sheetsKey = isAttendanceOnly
        ? `attendance_sheets_inputer_${uId}`
        : 'attendance_sheets';
      const sheets = isAttendanceOnly
        ? getStoredCollection(sheetsKey, () => [])
        : getSheetsStore();

      const y = parseInt(year, 10) || 2026;
      const m = parseInt(month, 10) || 9;

      let sheet = sheets.find((s) => {
        const yMatch = s.periodYear === y;
        const mMatch = s.periodMonth === m;
        const locMatch = locationId ? s.locationId === locationId : true;
        const clientMatch = clientId ? s.clientId === clientId : true;
        return yMatch && mMatch && locMatch && clientMatch;
      });

      if (!sheet && locationId) {
        const loc = MOCK_LOCATIONS.find((l) => l.id === locationId) || MOCK_LOCATIONS.find((l) => l.clientId === clientId);
        const client = MOCK_CLIENTS.find((c) => c.id === (clientId || loc?.clientId));
        const monthNames = [
          '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ];
        const newId = `SHT-${y}-${String(m).padStart(2, '0')}-${loc ? loc.id : 'GEN'}`;
        sheet = {
          id: newId,
          sheetCode: `ATT-${y}-${String(m).padStart(2, '0')}-${loc ? loc.id : 'LOC'}`,
          periodYear: y,
          periodMonth: m,
          periodName: `${monthNames[m]} ${y}`,
          clientId: client?.id || loc?.clientId || clientId || 'CLI-001',
          clientName: client?.name || loc?.name || 'Klien',
          locationId: loc?.id || locationId || 'LOC-001',
          locationName: loc?.name || 'Lokasi Penempatan',
          serviceType: 'security',
          status: STATUS.OPEN,
          version: 1,
          generatedAt: new Date().toISOString(),
          finalizedAt: null,
          finalizedBy: null,
          totalPersonnel: 0,
        };
        sheets.push(sheet);
        if (isAttendanceOnly) {
          saveStoredCollection(sheetsKey, sheets);
        } else {
          saveSheetsStore(sheets);
        }
      }

      return { data: sheet || null, error: null };
    }

    const { data } = await apiClient.post('/attendance/sheets/find-or-create', {
      year,
      month,
      clientId,
      locationId,
      isAttendanceOnly,
      userId,
    });
    return data;
  },

  /**
   * Get attendance sheets with filtering
   */
  async getSheets({ year, month, clientId, locationId, status, isAttendanceOnly = false, userId = null } = {}) {
    if (isMock) {
      let filtered = [];
      if (isAttendanceOnly) {
        const uId = userId || 'default';
        const inputerSheetsKey = `attendance_sheets_inputer_${uId}`;
        filtered = [...getStoredCollection(inputerSheetsKey, () => [])];
      } else {
        filtered = [...getSheetsStore()];
      }

      if (year) filtered = filtered.filter((s) => s.periodYear === parseInt(year, 10));
      if (month) filtered = filtered.filter((s) => s.periodMonth === parseInt(month, 10));
      if (clientId) filtered = filtered.filter((s) => s.clientId === clientId);
      if (locationId) filtered = filtered.filter((s) => s.locationId === locationId);
      if (status) filtered = filtered.filter((s) => s.status === status);

      return { data: filtered, meta: { total: filtered.length }, error: null };
    }

    const { data } = await apiClient.get('/attendance/sheets', {
      params: { year, month, clientId, locationId, status, isAttendanceOnly, userId },
    });
    return data;
  },

  /**
   * Get single sheet and all its attendance rows
   */
  async getSheetById(sheetId, options = {}) {
    const { isAttendanceOnly = false, userId = null } = options;
    if (isMock) {
      const uId = userId || 'default';
      const inputerSheetsKey = `attendance_sheets_inputer_${uId}`;
      const inputerSheets = isAttendanceOnly ? getStoredCollection(inputerSheetsKey, () => []) : [];

      const sheets = isAttendanceOnly
        ? (inputerSheets.find((s) => s.id === sheetId) ? inputerSheets : getSheetsStore())
        : getSheetsStore();

      const sheet = sheets.find((s) => s.id === sheetId);
      if (!sheet) return { data: null, error: { message: 'Lembar absensi tidak ditemukan.' } };

      if (isAttendanceOnly && !inputerSheets.some((s) => s.id === sheet.id)) {
        inputerSheets.push(sheet);
        saveStoredCollection(inputerSheetsKey, inputerSheets);
      }

      const assignmentsStore = getStoredCollection('barak_assignments', () => [...MOCK_ASSIGNMENTS]);
      const matchingAssignments = assignmentsStore.filter((a) => {
        const locMatch = sheet.locationId ? a.locationId === sheet.locationId : true;
        const clientMatch = sheet.clientId ? a.clientId === sheet.clientId : true;
        return locMatch && clientMatch && a.status === STATUS.ACTIVE;
      });

      if (isAttendanceOnly) {
        // Dedicated persistent storage for attendance inputers (user1, user2)
        const inputerKey = `attendance_rows_inputer_${userId || 'default'}`;
        const inputerStore = getStoredCollection(inputerKey, () => ({}));

        let userRows = inputerStore[sheetId];

        // Jika sheet ini belum memiliki data baris di storage inputer:
        if (userRows === undefined) {
          if (matchingAssignments.length > 0) {
            // Tampilkan nama-nama karyawan pada lokasi penempatan ini dengan jam kosong
            userRows = createBlankRowsForAssignments(sheet, matchingAssignments);
            inputerStore[sheetId] = userRows;
            saveStoredCollection(inputerKey, inputerStore);
          } else {
            // Belum ada data karyawan pada lokasi klien ini
            userRows = [];
            inputerStore[sheetId] = [];
            saveStoredCollection(inputerKey, inputerStore);
          }
        }

        const cleanedRows = userRows.filter((r) => !isInvalidEmployeeName(r.employeeName));
        const distinctEmpIds = new Set(cleanedRows.map((r) => r.employeeId));

        return {
          data: {
            sheet: {
              ...sheet,
              totalPersonnel: distinctEmpIds.size,
            },
            rows: cleanedRows,
            hasEmployees: distinctEmpIds.size > 0,
          },
          error: null,
        };
      }

      const allRows = getRowsStore();
      if (!allRows[sheetId]) {
        const isInitialDemoSheet = INITIAL_ATTENDANCE_SHEETS.some((s) => s.id === sheetId);
        if (isInitialDemoSheet) {
          allRows[sheetId] = generateRowsForSheet(sheet);
        } else if (matchingAssignments.length > 0) {
          allRows[sheetId] = createBlankRowsForAssignments(sheet, matchingAssignments);
        } else {
          allRows[sheetId] = [];
        }
        saveRowsStore(allRows);
      } else {
        // Self-healing: bersihkan baris artefak header seperti '(LOCKED)' yang pernah tersimpan
        const initialCount = allRows[sheetId].length;
        const cleanedRows = allRows[sheetId].filter((r) => !isInvalidEmployeeName(r.employeeName));
        if (cleanedRows.length !== initialCount) {
          allRows[sheetId] = cleanedRows;
          saveRowsStore(allRows);
          const distinctEmpIds = new Set(cleanedRows.map((r) => r.employeeId));
          const sheetsList = getSheetsStore();
          const sIdx = sheetsList.findIndex((s) => s.id === sheetId);
          if (sIdx !== -1) {
            sheetsList[sIdx] = {
              ...sheetsList[sIdx],
              totalPersonnel: distinctEmpIds.size,
              updatedAt: new Date().toISOString(),
            };
            saveSheetsStore(sheetsList);
            sheet.totalPersonnel = distinctEmpIds.size;
          }
        }
      }

      const distinctEmpIds = new Set(allRows[sheetId].map((r) => r.employeeId));

      return {
        data: {
          sheet: {
            ...sheet,
            totalPersonnel: distinctEmpIds.size,
          },
          rows: allRows[sheetId],
          hasEmployees: distinctEmpIds.size > 0,
        },
        error: null,
      };
    }

    const { data } = await apiClient.get(`/attendance/sheets/${sheetId}`);
    return data;
  },

  /**
   * Generate new monthly roster sheet from active assignments
   */
  async generateRoster({ year, month, clientId, clientName, locationId, locationName, serviceType = 'security', isAttendanceOnly = false, userId = null }) {
    if (isMock) {
      const monthNames = [
        '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      const sheetsKey = isAttendanceOnly ? `attendance_sheets_inputer_${userId || 'default'}` : 'attendance_sheets';
      const sheets = isAttendanceOnly ? getStoredCollection(sheetsKey, () => []) : getSheetsStore();

      const newId = `SHT-${year}-${month.toString().padStart(2, '0')}-${(sheets.length + 1).toString().padStart(3, '0')}`;
      const newSheet = {
        id: newId,
        sheetCode: `ATT-${year}-${month.toString().padStart(2, '0')}-${locationId}`,
        periodYear: parseInt(year, 10),
        periodMonth: parseInt(month, 10),
        periodName: `${monthNames[month]} ${year}`,
        clientId,
        clientName,
        locationId,
        locationName,
        serviceType,
        status: STATUS.OPEN,
        version: 1,
        generatedAt: new Date().toISOString(),
        finalizedAt: null,
        finalizedBy: null,
        totalPersonnel: 8,
      };

      if (isAttendanceOnly) {
        saveStoredCollection(sheetsKey, [newSheet, ...sheets]);
        const inputerRowsKey = `attendance_rows_inputer_${userId || 'default'}`;
        const inputerRows = getStoredCollection(inputerRowsKey, () => ({}));
        inputerRows[newId] = generateRowsForSheet(newSheet);
        saveStoredCollection(inputerRowsKey, inputerRows);
      } else {
        saveSheetsStore([newSheet, ...sheets]);
        const allRows = getRowsStore();
        allRows[newId] = generateRowsForSheet(newSheet);
        saveRowsStore(allRows);
      }

      await emitAudit({
        action: 'ATTENDANCE_GENERATE',
        module: 'HRD',
        entity: 'AttendanceSheet',
        entityId: newId,
        details: { client: clientName, location: locationName, period: newSheet.periodName },
      });

      return { data: newSheet, error: null };
    }

    const { data } = await apiClient.post('/attendance/sheets/generate', {
      year,
      month,
      clientId,
      locationId,
      serviceType,
      isAttendanceOnly,
      userId,
    });
    return data;
  },

  /**
   * Update attendance row checkIn and checkOut
   * Gate: HRD can only edit time in/out; master fields cannot be changed.
   */
  async updateAttendanceRow(sheetId, rowId, { checkIn, checkOut, notes = '' }) {
    if (isMock) {
      const sheets = getSheetsStore();
      const sheet = sheets.find((s) => s.id === sheetId);
      if (!sheet) return { data: null, error: { message: 'Lembar absensi tidak ditemukan.' } };
      if (sheet.status === STATUS.FINALIZED) {
        return { data: null, error: { message: 'Lembar absensi sudah final dan terkunci. Reopen terlebih dahulu untuk mengedit.' } };
      }

      const allRows = getRowsStore();
      const rows = allRows[sheetId] || [];
      const rowIndex = rows.findIndex((r) => r.id === rowId);
      if (rowIndex === -1) return { data: null, error: { message: 'Baris absensi tidak ditemukan.' } };

      const currentRow = rows[rowIndex];
      const metrics = calculateAttendanceMetrics(
        currentRow.scheduledIn,
        currentRow.scheduledOut,
        checkIn,
        checkOut,
        15
      );

      const updatedRow = {
        ...currentRow,
        checkIn,
        checkOut,
        status: metrics.status,
        totalMinutes: metrics.totalMinutes,
        lateMinutes: metrics.lateMinutes,
        earlyLeaveMinutes: metrics.earlyLeaveMinutes,
        notes: notes || metrics.notes,
        updatedAt: new Date().toISOString(),
      };

      rows[rowIndex] = updatedRow;
      allRows[sheetId] = [...rows];
      saveRowsStore(allRows);

      return { data: updatedRow, error: null };
    }

    const { data } = await apiClient.patch(`/attendance/sheets/${sheetId}/rows/${rowId}`, {
      checkIn,
      checkOut,
      notes,
    });
    return data;
  },

  /**
   * Update or create cell by employeeId and attendanceDate
   */
  async updateCell(sheetId, { employeeId, attendanceDate, checkIn, checkOut, notes = '', employeeName, employeeNik, roleInUnit }, options = {}) {
    const { isAttendanceOnly = false, userId = null } = options;
    if (isMock) {
      const sheets = getSheetsStore();
      const sheet = sheets.find((s) => s.id === sheetId);
      if (!sheet) return { data: null, error: { message: 'Lembar absensi tidak ditemukan.' } };
      if (sheet.status === STATUS.FINALIZED) {
        return { data: null, error: { message: 'Lembar absensi sudah final dan terkunci.' } };
      }

      const sheetWorkDuration = parseFloat(sheet?.workDuration) || 8;

      if (isAttendanceOnly) {
        const inputerKey = `attendance_rows_inputer_${userId || 'default'}`;
        const inputerStore = getStoredCollection(inputerKey, () => ({}));
        const rows = inputerStore[sheetId] || [];
        const rowIndex = rows.findIndex((r) => r.employeeId === employeeId && r.attendanceDate === attendanceDate);

        let updatedRow;
        if (rowIndex !== -1) {
          const currentRow = rows[rowIndex];
          const newCheckIn = checkIn !== undefined ? checkIn : currentRow.checkIn;
          const newCheckOut = checkOut !== undefined ? checkOut : currentRow.checkOut;
          const metrics = calculateAttendanceMetrics(
            null,
            null,
            newCheckIn,
            newCheckOut
          );
          const overtime = calculateOvertime(newCheckIn, newCheckOut, sheetWorkDuration);
          updatedRow = {
            ...currentRow,
            checkIn: newCheckIn,
            checkOut: newCheckOut,
            status: metrics.status,
            totalMinutes: metrics.totalMinutes,
            lateMinutes: 0,
            earlyLeaveMinutes: 0,
            overtimeMinutes: Math.round(overtime * 60),
            notes: notes || metrics.notes,
            updatedAt: new Date().toISOString(),
          };
          rows[rowIndex] = updatedRow;
        } else {
          const newId = `ROW-${sheetId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const metrics = calculateAttendanceMetrics(
            null,
            null,
            checkIn || '',
            checkOut || ''
          );
          const overtime = calculateOvertime(checkIn || '', checkOut || '', sheetWorkDuration);
          updatedRow = {
            id: newId,
            sheetId,
            employeeId,
            employeeName: employeeName || 'Karyawan',
            employeeNik: employeeNik || '',
            roleInUnit: roleInUnit || 'Anggota',
            attendanceDate,
            scheduledIn: '',
            scheduledOut: '',
            shiftId: '',
            shiftName: '',
            checkIn: checkIn || '',
            checkOut: checkOut || '',
            status: metrics.status,
            totalMinutes: metrics.totalMinutes,
            lateMinutes: 0,
            earlyLeaveMinutes: 0,
            notes: notes || metrics.notes,
            overtimeMinutes: Math.round(overtime * 60),
            updatedAt: new Date().toISOString(),
          };
          rows.push(updatedRow);
        }

        inputerStore[sheetId] = [...rows];
        saveStoredCollection(inputerKey, inputerStore);
        return { data: updatedRow, error: null };
      }

      const allRows = getRowsStore();
      const rows = allRows[sheetId] || [];
      const rowIndex = rows.findIndex((r) => r.employeeId === employeeId && r.attendanceDate === attendanceDate);

      let updatedRow;
      if (rowIndex !== -1) {
        const currentRow = rows[rowIndex];
        const newCheckIn = checkIn !== undefined ? checkIn : currentRow.checkIn;
        const newCheckOut = checkOut !== undefined ? checkOut : currentRow.checkOut;
        const metrics = calculateAttendanceMetrics(
          null,
          null,
          newCheckIn,
          newCheckOut
        );
        const overtime = calculateOvertime(newCheckIn, newCheckOut, sheetWorkDuration);
        updatedRow = {
          ...currentRow,
          checkIn: newCheckIn,
          checkOut: newCheckOut,
          status: metrics.status,
          totalMinutes: metrics.totalMinutes,
          lateMinutes: 0,
          earlyLeaveMinutes: 0,
          overtimeMinutes: Math.round(overtime * 60),
          notes: notes || metrics.notes,
          updatedAt: new Date().toISOString(),
        };
        rows[rowIndex] = updatedRow;
      } else {
        const newId = `ROW-${sheetId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const metrics = calculateAttendanceMetrics(
          null,
          null,
          checkIn || '',
          checkOut || ''
        );
        const overtime = calculateOvertime(checkIn || '', checkOut || '', sheetWorkDuration);
        updatedRow = {
          id: newId,
          sheetId,
          employeeId,
          employeeName: employeeName || 'Karyawan',
          employeeNik: employeeNik || '',
          roleInUnit: roleInUnit || 'Anggota',
          attendanceDate,
          scheduledIn: '',
          scheduledOut: '',
          shiftId: '',
          shiftName: '',
          checkIn: checkIn || '',
          checkOut: checkOut || '',
          status: metrics.status,
          totalMinutes: metrics.totalMinutes,
          lateMinutes: 0,
          earlyLeaveMinutes: 0,
          notes: notes || metrics.notes,
          overtimeMinutes: Math.round(overtime * 60),
          updatedAt: new Date().toISOString(),
        };
        rows.push(updatedRow);
      }

      allRows[sheetId] = [...rows];
      saveRowsStore(allRows);
      return { data: updatedRow, error: null };
    }

    const { data } = await apiClient.post(`/attendance/sheets/${sheetId}/cell`, {
      employeeId,
      attendanceDate,
      checkIn,
      checkOut,
      notes,
    });
    return data;
  },

  /**
   * Update work duration configuration for a sheet
   * Persists to attendance_sheets and inputer sheets so Rekap Input Payroll stays synchronized.
   */
  async updateSheetWorkDuration(sheetId, workDuration, workDurationType = '8', manualHours = '8', options = {}) {
    const { userId = null } = options;
    const durationNum = parseFloat(workDuration) || 8;

    if (isMock) {
      const sheets = getSheetsStore();
      const sheetIdx = sheets.findIndex((s) => s.id === sheetId);
      if (sheetIdx !== -1) {
        sheets[sheetIdx] = {
          ...sheets[sheetIdx],
          workDuration: durationNum,
          workDurationType,
          manualHours,
          updatedAt: new Date().toISOString(),
        };
        saveSheetsStore(sheets);
      }

      // Also update overtimeMinutes for existing rows in regular store
      const allRows = getRowsStore();
      if (allRows[sheetId]) {
        allRows[sheetId] = allRows[sheetId].map((r) => {
          if (r.checkIn && r.checkOut) {
            const ot = calculateOvertime(r.checkIn, r.checkOut, durationNum);
            return {
              ...r,
              overtimeMinutes: Math.round(ot * 60),
            };
          }
          return r;
        });
        saveRowsStore(allRows);
      }

      // Also check/update inputer stores
      const uIds = ['user1', 'user2', 'default', userId].filter(Boolean);
      uIds.forEach((uid) => {
        const inputerKey = `attendance_sheets_inputer_${uid}`;
        const inputerSheets = getStoredCollection(inputerKey, () => []);
        const idx = inputerSheets.findIndex((s) => s.id === sheetId);
        if (idx !== -1) {
          inputerSheets[idx] = {
            ...inputerSheets[idx],
            workDuration: durationNum,
            workDurationType,
            manualHours,
            updatedAt: new Date().toISOString(),
          };
          saveStoredCollection(inputerKey, inputerSheets);
        }

        // Recalculate overtimeMinutes in inputer rows
        const inputerRowsKey = `attendance_rows_inputer_${uid}`;
        const inputerRows = getStoredCollection(inputerRowsKey, () => ({}));
        if (inputerRows[sheetId]) {
          inputerRows[sheetId] = inputerRows[sheetId].map((r) => {
            if (r.checkIn && r.checkOut) {
              const ot = calculateOvertime(r.checkIn, r.checkOut, durationNum);
              return {
                ...r,
                overtimeMinutes: Math.round(ot * 60),
              };
            }
            return r;
          });
          saveStoredCollection(inputerRowsKey, inputerRows);
        }
      });

      // Ensure sheets store has this sheet even if created dynamically in an inputer store
      if (sheetIdx === -1) {
        for (const uid of uIds) {
          const inputerKey = `attendance_sheets_inputer_${uid}`;
          const inputerSheets = getStoredCollection(inputerKey, () => []);
          const found = inputerSheets.find((s) => s.id === sheetId);
          if (found) {
            sheets.push({
              ...found,
              workDuration: durationNum,
              workDurationType,
              manualHours,
              updatedAt: new Date().toISOString(),
            });
            saveSheetsStore(sheets);
            break;
          }
        }
      }

      emitAudit({
        action: 'ATTENDANCE_WORK_DURATION_UPDATE',
        module: 'HRD',
        entity: 'AttendanceSheet',
        entityId: sheetId,
        details: { workDuration: durationNum, workDurationType, manualHours },
      });

      return { data: { success: true, workDuration: durationNum }, error: null };
    }

    const { data } = await apiClient.patch(`/attendance/sheets/${sheetId}/work-duration`, {
      workDuration: durationNum,
      workDurationType,
      manualHours,
    });
    return data;
  },

  /**
   * Bulk fill check-in & check-out time (e.g. fill on-time for multiple personnel)
   */
  async bulkFillTime(sheetId, { timeIn, timeOut, rowIds = [] }, options = {}) {
    const { isAttendanceOnly = false, userId = null } = options;
    if (isMock) {
      const sheets = getSheetsStore();
      const sheet = sheets.find((s) => s.id === sheetId);
      if (!sheet || sheet.status === STATUS.FINALIZED) {
        return { data: null, error: { message: 'Tidak dapat mengisi lembar yang terkunci.' } };
      }

      const sheetWorkDuration = parseFloat(sheet?.workDuration) || 8;

      if (isAttendanceOnly) {
        const inputerKey = `attendance_rows_inputer_${userId || 'default'}`;
        const inputerStore = getStoredCollection(inputerKey, () => ({}));
        const rows = inputerStore[sheetId] || [];
        inputerStore[sheetId] = rows.map((r) => {
          if (rowIds.length === 0 || rowIds.includes(r.id)) {
            const metrics = calculateAttendanceMetrics(null, null, timeIn, timeOut);
            const overtime = calculateOvertime(timeIn, timeOut, sheetWorkDuration);
            return {
              ...r,
              checkIn: timeIn,
              checkOut: timeOut,
              status: metrics.status,
              totalMinutes: metrics.totalMinutes,
              lateMinutes: 0,
              earlyLeaveMinutes: 0,
              overtimeMinutes: Math.round(overtime * 60),
              notes: metrics.notes,
            };
          }
          return r;
        });
        saveStoredCollection(inputerKey, inputerStore);
        return { data: { success: true, count: rowIds.length || rows.length }, error: null };
      }

      const allRows = getRowsStore();
      const rows = allRows[sheetId] || [];
      allRows[sheetId] = rows.map((r) => {
        if (rowIds.length === 0 || rowIds.includes(r.id)) {
          const metrics = calculateAttendanceMetrics(null, null, timeIn, timeOut);
          const overtime = calculateOvertime(timeIn, timeOut, sheetWorkDuration);
          return {
            ...r,
            checkIn: timeIn,
            checkOut: timeOut,
            status: metrics.status,
            totalMinutes: metrics.totalMinutes,
            lateMinutes: 0,
            earlyLeaveMinutes: 0,
            overtimeMinutes: Math.round(overtime * 60),
            notes: metrics.notes,
          };
        }
        return r;
      });
      saveRowsStore(allRows);

      return { data: { success: true, count: rowIds.length || rows.length }, error: null };
    }

    const { data } = await apiClient.post(`/attendance/sheets/${sheetId}/bulk-fill`, {
      timeIn,
      timeOut,
      rowIds,
    });
    return data;
  },

  /**
   * Import attendance rows from Excel / Spreadsheet upload.
   * Supports:
   * 1. Roster Sync Mode: Enrolls / replaces personnel from Excel (e.g. 43 employees) with 31 days initialized for manual entry.
   * 2. Attendance Time Update Mode: Updates matching check-in and check-out rows.
   */
  async importAttendanceRows(sheetId, importedItems = [], options = {}) {
    const { isRosterSync = false, rosterEmployees = [], isAttendanceOnly = false, userId = null } = options;

    if (isMock) {
      const uId = userId || 'default';
      const inputerSheetsKey = isAttendanceOnly ? `attendance_sheets_inputer_${uId}` : null;
      const inputerSheets = isAttendanceOnly ? getStoredCollection(inputerSheetsKey, () => []) : null;

      let sheet = isAttendanceOnly && inputerSheets ? inputerSheets.find((s) => s.id === sheetId) : null;
      let sheetIndex = -1;
      let sheets = null;

      if (!sheet) {
        sheets = getSheetsStore();
        sheetIndex = sheets.findIndex((s) => s.id === sheetId);
        if (sheetIndex !== -1) {
          sheet = sheets[sheetIndex];
        }
      }

      if (!sheet) {
        return { data: null, error: { message: 'Lembar absensi tidak ditemukan.' } };
      }
      if (sheet.status === STATUS.FINALIZED) {
        return { data: null, error: { message: 'Tidak dapat mengimpor data ke lembar absensi yang berstatus FINAL / terkunci.' } };
      }

      const inputerKey = isAttendanceOnly ? `attendance_rows_inputer_${userId || 'default'}` : null;
      const inputerStore = isAttendanceOnly ? getStoredCollection(inputerKey, () => ({})) : null;

      const allRows = isAttendanceOnly ? null : getRowsStore();
      const currentRows = isAttendanceOnly ? (inputerStore[sheetId] || []) : (allRows[sheetId] || []);

      // Determine period dates (Day 1..31)
      const yStr = parseInt(sheet.periodYear, 10) || 2026;
      const mNum = parseInt(sheet.periodMonth, 10) || 9;
      const totalDays = new Date(yStr, mNum, 0).getDate();
      const mStr = String(mNum).padStart(2, '0');
      const daysInPeriod = Array.from({ length: totalDays }, (_, i) => {
        const dStr = String(i + 1).padStart(2, '0');
        return `${yStr}-${mStr}-${dStr}`;
      });

      // MODE 1: Roster Sync Mode (file provides roster list of employees or template with blank/filled times)
      if (isRosterSync || (rosterEmployees && rosterEmployees.length > 0)) {
        // If rosterEmployees is provided, use it; otherwise extract unique employees from importedItems
        let employeesToSync = rosterEmployees;
        if (!employeesToSync || employeesToSync.length === 0) {
          const empMap = new Map();
          importedItems.forEach((item, idx) => {
            const key = (item.employeeId || item.employeeName || `EMP-${idx}`).toUpperCase();
            if (!empMap.has(key)) {
              empMap.set(key, {
                employeeId: item.employeeId || `EMP-${(item.employeeName || 'STAFF').replace(/[^A-Z0-9]/gi, '').slice(0, 6)}-${String(idx + 1).padStart(3, '0')}`,
                employeeName: item.employeeName || 'Karyawan',
                employeeNik: item.employeeNik || '-',
                roleInUnit: item.roleInUnit || 'Anggota',
              });
            }
          });
          employeesToSync = Array.from(empMap.values());
        }

        // Filter out any invalid / header placeholder names like '(LOCKED)'
        employeesToSync = employeesToSync.filter((e) => !isInvalidEmployeeName(e.employeeName));

        // Generate authoritative roster rows for this sheet (totalDays per employee)
        const newSheetRows = [];
        let rowCounter = 1;

        employeesToSync.forEach((emp) => {
          const empId = emp.employeeId;
          const empName = emp.employeeName;
          const empNik = emp.employeeNik || '-';
          const roleInUnit = emp.roleInUnit || 'Anggota';

          daysInPeriod.forEach((dateStr) => {
            // Check if there was an existing row for this employee & date
            const existingRow = currentRows.find((r) => {
              const dateMatch = r.attendanceDate === dateStr;
              const idMatch = empId && String(r.employeeId).toUpperCase() === String(empId).toUpperCase();
              const nameMatch = empName && String(r.employeeName).trim().toLowerCase() === String(empName).trim().toLowerCase();
              const nikMatch = empNik !== '-' && String(r.employeeNik).trim() === String(empNik).trim();
              return dateMatch && (idMatch || nameMatch || nikMatch);
            });

            // Check if importedItems has specific checkIn/checkOut for this employee & date
            const importedMatch = importedItems.find((item) => {
              const dateMatch = item.attendanceDate === dateStr;
              const idMatch = empId && String(item.employeeId).toUpperCase() === String(item.employeeId).toUpperCase();
              const nameMatch = empName && String(item.employeeName).trim().toLowerCase() === String(empName).trim().toLowerCase();
              return dateMatch && (idMatch || nameMatch);
            });

            const checkIn = importedMatch?.checkIn || existingRow?.checkIn || '';
            const checkOut = importedMatch?.checkOut || existingRow?.checkOut || '';
            const notes = importedMatch?.notes || existingRow?.notes || '';

            const metrics = calculateAttendanceMetrics(
              null,
              null,
              checkIn,
              checkOut
            );
            const overtime = calculateOvertime(checkIn, checkOut, 8);

            newSheetRows.push({
              id: existingRow?.id || `ROW-${sheet.id}-${rowCounter.toString().padStart(5, '0')}`,
              sheetId: sheet.id,
              employeeId: empId,
              employeeName: empName,
              employeeNik: empNik,
              assignmentId: existingRow?.assignmentId || `BRK-ASN-${sheet.locationId || 'LOC'}-${empId}`,
              clientName: sheet.clientName,
              locationName: sheet.locationName,
              serviceType: sheet.serviceType || 'security',
              roleInUnit,
              shiftId: '',
              shiftName: '',
              scheduledIn: '',
              scheduledOut: '',
              attendanceDate: dateStr,
              checkIn,
              checkOut,
              status: metrics.status,
              totalMinutes: metrics.totalMinutes,
              lateMinutes: 0,
              earlyLeaveMinutes: 0,
              overtimeMinutes: Math.round(overtime * 60),
              notes,
              updatedAt: new Date().toISOString(),
            });

            rowCounter++;
          });
        });

        if (isAttendanceOnly) {
          inputerStore[sheetId] = newSheetRows;
          saveStoredCollection(inputerKey, inputerStore);
        } else {
          allRows[sheetId] = newSheetRows;
          saveRowsStore(allRows);
        }

        // Update sheet totalPersonnel
        const updatedSheet = {
          ...sheet,
          totalPersonnel: employeesToSync.length,
          updatedAt: new Date().toISOString(),
        };

        if (isAttendanceOnly && inputerSheets) {
          const sIdx = inputerSheets.findIndex((s) => s.id === sheetId);
          if (sIdx !== -1) {
            inputerSheets[sIdx] = updatedSheet;
          } else {
            inputerSheets.push(updatedSheet);
          }
          saveStoredCollection(inputerSheetsKey, inputerSheets);
        } else if (sheets && sheetIndex !== -1) {
          sheets[sheetIndex] = updatedSheet;
          saveSheetsStore(sheets);
        }

        emitAudit({
          action: 'ATTENDANCE_IMPORT_ROSTER',
          module: 'HRD',
          entity: 'AttendanceSheet',
          entityId: sheetId,
          details: {
            message: `Sinkronisasi roster: ${employeesToSync.length} personel didaftarkan ke ${sheet.sheetCode}.`,
            totalPersonnel: employeesToSync.length,
            location: sheet.locationName,
          },
        });

        return {
          data: {
            success: true,
            updatedCount: employeesToSync.length,
            totalPersonnel: employeesToSync.length,
            totalRows: newSheetRows.length,
            sheet: updatedSheet,
          },
          error: null,
        };
      }

      // MODE 2: Standard Attendance Logs Update Mode
      let updatedCount = 0;
      const updatedRows = currentRows.map((r) => {
        const match = importedItems.find((item) => {
          const dateMatch = !item.attendanceDate || item.attendanceDate === r.attendanceDate;
          const idMatch = item.employeeId && item.employeeId.toUpperCase() === r.employeeId.toUpperCase();
          const nikMatch = item.employeeNik && String(item.employeeNik).trim() === String(r.employeeNik).trim();
          const nameMatch = item.employeeName && String(item.employeeName).trim().toLowerCase() === String(r.employeeName).trim().toLowerCase();

          return dateMatch && (idMatch || nikMatch || nameMatch);
        });

        if (match && (match.checkIn || match.checkOut)) {
          updatedCount++;
          const checkIn = match.checkIn || r.checkIn;
          const checkOut = match.checkOut || r.checkOut;
          const metrics = calculateAttendanceMetrics(
            r.scheduledIn,
            r.scheduledOut,
            checkIn,
            checkOut,
            15
          );

          return {
            ...r,
            checkIn,
            checkOut,
            status: metrics.status,
            totalMinutes: metrics.totalMinutes,
            lateMinutes: metrics.lateMinutes,
            earlyLeaveMinutes: metrics.earlyLeaveMinutes,
            notes: match.notes || metrics.notes,
            updatedAt: new Date().toISOString(),
          };
        }

        return r;
      });

      if (isAttendanceOnly) {
        inputerStore[sheetId] = updatedRows;
        saveStoredCollection(inputerKey, inputerStore);
      } else {
        allRows[sheetId] = updatedRows;
        saveRowsStore(allRows);
      }

      emitAudit({
        action: 'ATTENDANCE_IMPORT_EXCEL',
        module: 'attendance',
        targetId: sheetId,
        details: `Imported ${updatedCount} attendance records from Excel file for ${sheet.sheetCode}.`,
      });

      return {
        data: {
          success: true,
          updatedCount,
          totalRows: currentRows.length,
          sheet,
        },
        error: null,
      };
    }

    const { data } = await apiClient.post(`/attendance/sheets/${sheetId}/import-excel`, {
      rows: importedItems,
      options,
    });
    return data;
  },

  /**
   * Validate sheet for completeness before finalization
   */
  async validateSheet(sheetId) {
    if (isMock) {
      const allRows = getRowsStore();
      const rows = allRows[sheetId] || [];
      const totalRows = rows.length;
      const unfilled = rows.filter((r) => r.status === STATUS.UNFILLED).length;
      const partial = rows.filter((r) => r.status === STATUS.PRESENT_PARTIAL).length;
      const late = rows.filter((r) => r.status === STATUS.LATE).length;
      const present = rows.filter((r) => r.status === STATUS.PRESENT).length;

      const isValid = unfilled === 0 && partial === 0;

      return {
        data: {
          isValid,
          totalRows,
          unfilledCount: unfilled,
          partialCount: partial,
          lateCount: late,
          presentCount: present,
          message: isValid
            ? 'Seluruh baris absensi valid dan siap difinalisasi.'
            : `Ditemukan ${unfilled} baris belum diisi dan ${partial} baris belum lengkap.`,
        },
        error: null,
      };
    }

    const { data } = await apiClient.post(`/attendance/sheets/${sheetId}/validate`);
    return data;
  },

  /**
   * Finalize sheet — locks roster, ready for payroll
   */
  async finalizeSheet(sheetId, actorName = 'Siti Rahmawati (HRD)') {
    if (isMock) {
      const sheets = getSheetsStore();
      const idx = sheets.findIndex((s) => s.id === sheetId);
      if (idx === -1) return { data: null, error: { message: 'Lembar tidak ditemukan.' } };

      const updated = {
        ...sheets[idx],
        status: STATUS.FINALIZED,
        finalizedAt: new Date().toISOString(),
        finalizedBy: actorName,
        version: sheets[idx].version + 1,
      };
      sheets[idx] = updated;
      saveSheetsStore(sheets);

      await emitAudit({
        action: 'ATTENDANCE_FINALIZE',
        module: 'HRD',
        entity: 'AttendanceSheet',
        entityId: sheetId,
        details: { finalizedBy: actorName, period: updated.periodName },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/attendance/sheets/${sheetId}/finalize`);
    return data;
  },

  /**
   * Reopen finalized sheet — requires privileged permission + audit trail
   */
  async reopenSheet(sheetId, { reason, reopenedBy = 'Juli Priyanto (Direktur Utama)' }) {
    if (isMock) {
      const sheets = getSheetsStore();
      const idx = sheets.findIndex((s) => s.id === sheetId);
      if (idx === -1) return { data: null, error: { message: 'Lembar tidak ditemukan.' } };

      const updated = {
        ...sheets[idx],
        status: STATUS.REOPENED,
        reopenedAt: new Date().toISOString(),
        reopenedBy,
        reopenReason: reason,
        version: sheets[idx].version + 1,
      };
      sheets[idx] = updated;
      saveSheetsStore(sheets);

      await emitAudit({
        action: 'ATTENDANCE_REOPEN',
        module: 'HRD',
        entity: 'AttendanceSheet',
        entityId: sheetId,
        details: { reason, reopenedBy, period: updated.periodName },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/attendance/sheets/${sheetId}/reopen`, { reason });
    return data;
  },

  /**
   * Generate aggregated attendance summary for Finance Payroll input
   * Aggregates: Hadir, Terlambat, Pulang Awal, Mangkir/Alfa, Total Jam per Employee.
   */
  async getPayrollAttendanceSummary(sheetId, options = {}) {
    if (isMock) {
      const { isAttendanceOnly = false, userId = null } = options;
      let rows = [];
      if (isAttendanceOnly || userId) {
        const inputerKey = `attendance_rows_inputer_${userId || 'default'}`;
        const inputerStore = getStoredCollection(inputerKey, () => ({}));
        rows = inputerStore[sheetId] || [];
      }
      if (!rows || rows.length === 0) {
        const allRows = getRowsStore();
        rows = allRows[sheetId] || [];
      }
      if (!rows || rows.length === 0) {
        const keys = ['attendance_rows_inputer_user1', 'attendance_rows_inputer_user2', 'attendance_rows_inputer_default'];
        for (const k of keys) {
          const s = getStoredCollection(k, () => ({}));
          if (s[sheetId] && s[sheetId].length > 0) {
            rows = s[sheetId];
            break;
          }
        }
      }

      // Cari sheet untuk sinkronisasi jumlah hari kalender bulan bersangkutan dan durasi kerja
      const sheets = getSheetsStore();
      let sheet = sheets.find((s) => s.id === sheetId);
      if (!sheet) {
        const uIds = ['user1', 'user2', 'default', userId].filter(Boolean);
        for (const uid of uIds) {
          const inputerSheets = getStoredCollection(`attendance_sheets_inputer_${uid}`, () => []);
          const found = inputerSheets.find((s) => s.id === sheetId);
          if (found) {
            sheet = found;
            break;
          }
        }
      }

      const year = parseInt(sheet?.periodYear, 10) || 2026;
      const month = parseInt(sheet?.periodMonth, 10) || 9;
      // Durasi kerja acuan dari sheet yang aktif di Attendance Spreadsheet:
      const effectiveWorkDuration = parseFloat(sheet?.workDuration) || 8;
      // Sinkron dengan total hari kalender pada bulan saat input (misal September = 30 Hari):
      const totalDaysInMonth = new Date(year, month, 0).getDate();

      const employeeMap = {};

      rows.forEach((r) => {
        if (!employeeMap[r.employeeId]) {
          employeeMap[r.employeeId] = {
            employeeId: r.employeeId,
            employeeName: r.employeeName,
            employeeNik: r.employeeNik || '-',
            roleInUnit: r.roleInUnit || 'Anggota',
            serviceType: r.serviceType || 'Operasional',
            totalWorkDays: totalDaysInMonth,
            presentDays: 0,
            lateDays: 0,
            totalLateMinutes: 0,
            earlyLeaveDays: 0,
            absentDays: 0,
            totalOvertimeHours: 0,
            totalWorkHours: 0,
          };
        }

        const emp = employeeMap[r.employeeId];

        const hasCheckIn = Boolean(r.checkIn && String(r.checkIn).trim());
        const hasCheckOut = Boolean(r.checkOut && String(r.checkOut).trim());

        if (hasCheckIn || hasCheckOut) {
          emp.presentDays += 1;
        }

        if (hasCheckIn && hasCheckOut) {
          // Akumulasi Lembur: max(0, Jam Kerja - Durasi Standar Sheet)
          const ot = calculateOvertime(r.checkIn, r.checkOut, effectiveWorkDuration);
          emp.totalOvertimeHours = Math.round((emp.totalOvertimeHours + ot) * 10) / 10;

          // Akumulasi Jam Kerja
          const wh = calculateWorkHours(r.checkIn, r.checkOut);
          emp.totalWorkHours = Math.round((emp.totalWorkHours + wh) * 10) / 10;
        }
      });

      // Mangkir / Kosong = Total Hari Kalender Roster - Hari Hadir
      Object.values(employeeMap).forEach((emp) => {
        emp.absentDays = Math.max(0, emp.totalWorkDays - emp.presentDays);
      });

      return { data: Object.values(employeeMap), error: null };
    }

    const { data } = await apiClient.get(`/attendance/sheets/${sheetId}/payroll-summary`);
    return data;
  },

  /**
   * Reset / clear all attendance rows for a sheet
   */
  async resetSheetRows(sheetId, options = {}) {
    const { isAttendanceOnly = false, userId = null } = options;
    if (isMock) {
      if (isAttendanceOnly) {
        const inputerKey = `attendance_rows_inputer_${userId || 'default'}`;
        const inputerStore = getStoredCollection(inputerKey, () => ({}));
        inputerStore[sheetId] = [];
        saveStoredCollection(inputerKey, inputerStore);
        return { data: { success: true }, error: null };
      }

      const allRows = getRowsStore();
      allRows[sheetId] = [];
      saveRowsStore(allRows);
      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.post(`/attendance/sheets/${sheetId}/reset`);
    return data;
  },
};

export default attendanceAdapter;
