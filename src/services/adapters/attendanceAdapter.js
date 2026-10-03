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
} from '@/services/mock/mockAttendanceData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';

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

export const attendanceAdapter = {
  /**
   * Get attendance sheets with filtering
   */
  async getSheets({ year, month, clientId, locationId, status } = {}) {
    if (isMock) {
      let filtered = [...getSheetsStore()];

      if (year) filtered = filtered.filter((s) => s.periodYear === parseInt(year, 10));
      if (month) filtered = filtered.filter((s) => s.periodMonth === parseInt(month, 10));
      if (clientId) filtered = filtered.filter((s) => s.clientId === clientId);
      if (locationId) filtered = filtered.filter((s) => s.locationId === locationId);
      if (status) filtered = filtered.filter((s) => s.status === status);

      return { data: filtered, meta: { total: filtered.length }, error: null };
    }

    const { data } = await apiClient.get('/attendance/sheets', {
      params: { year, month, clientId, locationId, status },
    });
    return data;
  },

  /**
   * Get single sheet and all its attendance rows
   */
  async getSheetById(sheetId) {
    if (isMock) {
      const sheets = getSheetsStore();
      const sheet = sheets.find((s) => s.id === sheetId);
      if (!sheet) return { data: null, error: { message: 'Lembar absensi tidak ditemukan.' } };

      const allRows = getRowsStore();
      if (!allRows[sheetId]) {
        allRows[sheetId] = generateRowsForSheet(sheet);
        saveRowsStore(allRows);
      }

      return {
        data: {
          sheet,
          rows: allRows[sheetId],
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
  async generateRoster({ year, month, clientId, clientName, locationId, locationName, serviceType = 'security' }) {
    if (isMock) {
      const monthNames = [
        '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      const sheets = getSheetsStore();
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

      saveSheetsStore([newSheet, ...sheets]);
      const allRows = getRowsStore();
      allRows[newId] = generateRowsForSheet(newSheet);
      saveRowsStore(allRows);

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
   * Bulk fill check-in & check-out time (e.g. fill on-time for multiple personnel)
   */
  async bulkFillTime(sheetId, { timeIn, timeOut, rowIds = [] }) {
    if (isMock) {
      const sheets = getSheetsStore();
      const sheet = sheets.find((s) => s.id === sheetId);
      if (!sheet || sheet.status === STATUS.FINALIZED) {
        return { data: null, error: { message: 'Tidak dapat mengisi lembar yang terkunci.' } };
      }

      const allRows = getRowsStore();
      const rows = allRows[sheetId] || [];
      allRows[sheetId] = rows.map((r) => {
        if (rowIds.length === 0 || rowIds.includes(r.id)) {
          const metrics = calculateAttendanceMetrics(r.scheduledIn, r.scheduledOut, timeIn, timeOut, 15);
          return {
            ...r,
            checkIn: timeIn,
            checkOut: timeOut,
            status: metrics.status,
            totalMinutes: metrics.totalMinutes,
            lateMinutes: metrics.lateMinutes,
            earlyLeaveMinutes: metrics.earlyLeaveMinutes,
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
   * Updates matching rows by employeeId / NIK / Nama and date with checkIn and checkOut.
   */
  async importAttendanceRows(sheetId, importedItems = []) {
    if (isMock) {
      const sheets = getSheetsStore();
      const sheet = sheets.find((s) => s.id === sheetId);
      if (!sheet || sheet.status === STATUS.FINALIZED) {
        return { data: null, error: { message: 'Tidak dapat mengimpor data ke lembar absensi yang berstatus FINAL / terkunci.' } };
      }

      const allRows = getRowsStore();
      const currentRows = allRows[sheetId] || [];
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

      allRows[sheetId] = updatedRows;
      saveRowsStore(allRows);

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
  async reopenSheet(sheetId, { reason, reopenedBy = 'Juli Priyanto (Direktur)' }) {
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
  async getPayrollAttendanceSummary(sheetId) {
    if (isMock) {
      const allRows = getRowsStore();
      const rows = allRows[sheetId] || [];
      const employeeMap = {};

      rows.forEach((r) => {
        if (!employeeMap[r.employeeId]) {
          employeeMap[r.employeeId] = {
            employeeId: r.employeeId,
            employeeName: r.employeeName,
            employeeNik: r.employeeNik,
            roleInUnit: r.roleInUnit,
            serviceType: r.serviceType,
            totalWorkDays: 0,
            presentDays: 0,
            lateDays: 0,
            totalLateMinutes: 0,
            earlyLeaveDays: 0,
            absentDays: 0,
            totalWorkHours: 0,
          };
        }

        const emp = employeeMap[r.employeeId];
        emp.totalWorkDays += 1;

        if (r.status === STATUS.PRESENT || r.status === STATUS.LATE || r.status === STATUS.EARLY_LEAVE) {
          emp.presentDays += 1;
        }
        if (r.status === STATUS.LATE) {
          emp.lateDays += 1;
          emp.totalLateMinutes += r.lateMinutes || 0;
        }
        if (r.status === STATUS.EARLY_LEAVE) {
          emp.earlyLeaveDays += 1;
        }
        if (r.status === STATUS.UNFILLED || r.status === STATUS.ABSENT) {
          emp.absentDays += 1;
        }

        emp.totalWorkHours += Math.round(((r.totalMinutes || 0) / 60) * 10) / 10;
      });

      return { data: Object.values(employeeMap), error: null };
    }

    const { data } = await apiClient.get(`/attendance/sheets/${sheetId}/payroll-summary`);
    return data;
  },
};

export default attendanceAdapter;
