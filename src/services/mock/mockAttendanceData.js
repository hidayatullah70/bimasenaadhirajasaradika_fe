/**
 * Authoritative Attendance Seed Data & Roster Engine — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.2 (Attendance Spreadsheet), Section 14 (Seed Policy: 3 Months Attendance),
 * and Section 21 (Attendance Data Model & Unique Constraint).
 */

import { MOCK_ASSIGNMENTS, MOCK_CLIENTS, MOCK_LOCATIONS, MOCK_SHIFTS } from '@/services/mock/mockMasterData';
import { STATUS } from '@/constants/status';

/**
 * Helper to compute status, late minutes, and work duration
 */
export function calculateAttendanceMetrics(scheduledIn, scheduledOut, checkIn, checkOut, gracePeriod = 15) {
  if (!checkIn && !checkOut) {
    return {
      status: STATUS.UNFILLED,
      totalMinutes: 0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      notes: 'Belum diisi oleh HRD',
    };
  }

  if (!checkIn || !checkOut) {
    return {
      status: STATUS.PRESENT_PARTIAL,
      totalMinutes: 0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      notes: !checkIn ? 'Check-in kosong' : 'Check-out kosong',
    };
  }

  const [sInH, sInM] = scheduledIn.split(':').map(Number);
  const [sOutH, sOutM] = scheduledOut.split(':').map(Number);
  const [cInH, cInM] = checkIn.split(':').map(Number);
  const [cOutH, cOutM] = checkOut.split(':').map(Number);

  const schedInMin = sInH * 60 + sInM;
  let schedOutMin = sOutH * 60 + sOutM;
  if (schedOutMin < schedInMin) schedOutMin += 24 * 60; // Crosses midnight

  const actualInMin = cInH * 60 + cInM;
  let actualOutMin = cOutH * 60 + cOutM;
  if (actualOutMin < actualInMin) actualOutMin += 24 * 60;

  const totalMinutes = Math.max(0, actualOutMin - actualInMin);
  const diffLate = actualInMin - schedInMin;
  const lateMinutes = diffLate > gracePeriod ? diffLate : 0;
  const earlyLeaveMinutes = Math.max(0, schedOutMin - actualOutMin);

  let status = STATUS.PRESENT;
  let notes = 'Hadir normal';

  if (lateMinutes > 0 && earlyLeaveMinutes > 0) {
    status = STATUS.LATE;
    notes = `Terlambat ${lateMinutes} menit & pulang awal ${earlyLeaveMinutes} menit`;
  } else if (lateMinutes > 0) {
    status = STATUS.LATE;
    notes = `Terlambat ${lateMinutes} menit (Toleransi ${gracePeriod}m)`;
  } else if (earlyLeaveMinutes > 15) {
    status = STATUS.EARLY_LEAVE;
    notes = `Pulang lebih awal ${earlyLeaveMinutes} menit`;
  }

  return { status, totalMinutes, lateMinutes, earlyLeaveMinutes, notes };
}

// ── PRE-GENERATED SEED ATTENDANCE SHEETS (3 Months per PRD §14) ─────────────
export const INITIAL_ATTENDANCE_SHEETS = [
  // 1. September 2026 — JNT Central Hub (Current Month - OPEN)
  {
    id: 'SHT-2026-09-001',
    sheetCode: 'ATT-2026-09-JNT-HUB',
    periodYear: 2026,
    periodMonth: 9,
    periodName: 'September 2026',
    clientId: 'CLI-000001',
    clientName: 'JNT LOGISTIK',
    locationId: 'LOC-001',
    locationName: 'Central Hub JNT Rawa Bokor',
    serviceType: 'security',
    status: STATUS.OPEN,
    version: 1,
    generatedAt: '2026-09-01T08:00:00Z',
    finalizedAt: null,
    finalizedBy: null,
    totalPersonnel: 8,
  },
  // 2. September 2026 — Surya Dunia Express (OPEN)
  {
    id: 'SHT-2026-09-002',
    sheetCode: 'ATT-2026-09-SDE-DMO',
    periodYear: 2026,
    periodMonth: 9,
    periodName: 'September 2026',
    clientId: 'CLI-000002',
    clientName: 'PT SURYA DUNIA EXPRESS',
    locationId: 'LOC-002',
    locationName: 'Gateway Surya Dunia Daan Mogot',
    serviceType: 'kurir',
    status: STATUS.OPEN,
    version: 1,
    generatedAt: '2026-09-01T08:30:00Z',
    finalizedAt: null,
    finalizedBy: null,
    totalPersonnel: 6,
  },
  // 3. Agustus 2026 — JNT Central Hub (FINALIZED / Locked)
  {
    id: 'SHT-2026-08-001',
    sheetCode: 'ATT-2026-08-JNT-HUB',
    periodYear: 2026,
    periodMonth: 8,
    periodName: 'Agustus 2026',
    clientId: 'CLI-000001',
    clientName: 'JNT LOGISTIK',
    locationId: 'LOC-001',
    locationName: 'Central Hub JNT Rawa Bokor',
    serviceType: 'security',
    status: STATUS.FINALIZED,
    version: 1,
    generatedAt: '2026-08-01T08:00:00Z',
    finalizedAt: '2026-08-31T17:00:00Z',
    finalizedBy: 'Siti Rahmawati (HRD)',
    totalPersonnel: 8,
  },
  // 4. Juli 2026 — JNT Central Hub (FINALIZED / Locked)
  {
    id: 'SHT-2026-07-001',
    sheetCode: 'ATT-2026-07-JNT-HUB',
    periodYear: 2026,
    periodMonth: 7,
    periodName: 'Juli 2026',
    clientId: 'CLI-000001',
    clientName: 'JNT LOGISTIK',
    locationId: 'LOC-001',
    locationName: 'Central Hub JNT Rawa Bokor',
    serviceType: 'security',
    status: STATUS.FINALIZED,
    version: 1,
    generatedAt: '2026-07-01T08:00:00Z',
    finalizedAt: '2026-07-31T17:00:00Z',
    finalizedBy: 'Siti Rahmawati (HRD)',
    totalPersonnel: 8,
  },
];

/**
 * Generate attendance rows for a sheet based on active assignments.
 * Source of Truth: PRD Section 11.2 & Section 21.
 * Master fields are locked; checkIn and checkOut are editable by HRD.
 */
export function generateRowsForSheet(sheet) {
  // Filter active assignments for this client and location
  const matchingAssignments = MOCK_ASSIGNMENTS.filter(
    (a) => a.clientId === sheet.clientId && a.locationId === sheet.locationId && a.status === STATUS.ACTIVE
  );

  // If fewer than 6, take the first 8 assignments as representation
  const targetAssignments = matchingAssignments.length > 0 ? matchingAssignments : MOCK_ASSIGNMENTS.slice(0, 8);

  const daysInPeriod = [
    '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05',
    '2026-09-06', '2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10',
    '2026-09-11', '2026-09-12', '2026-09-13', '2026-09-14', '2026-09-15',
  ];

  const rows = [];
  let rowCounter = 1;

  targetAssignments.forEach((asn, empIdx) => {
    const shift = MOCK_SHIFTS.find((s) => s.id === asn.shiftId) || MOCK_SHIFTS[0];

    daysInPeriod.forEach((dateStr, dayIdx) => {
      // Simulate realistic attendance data
      let checkIn = shift.startTime;
      let checkOut = shift.endTime;

      if (dayIdx === 3 && empIdx === 1) {
        // Late employee on day 4
        checkIn = '07:35';
      } else if (dayIdx === 5 && empIdx === 2) {
        // Absent / Unfilled on day 6
        checkIn = '';
        checkOut = '';
      } else if (dayIdx === 8 && empIdx === 0) {
        // Early leave on day 9
        checkOut = '14:20';
      }

      const metrics = calculateAttendanceMetrics(
        shift.startTime,
        shift.endTime,
        checkIn,
        checkOut,
        shift.gracePeriodMinutes || 15
      );

      rows.push({
        id: `ROW-${sheet.id}-${rowCounter.toString().padStart(4, '0')}`,
        sheetId: sheet.id,
        // Master Locked Fields (PRD §11.2)
        employeeId: asn.employeeId,
        employeeName: asn.employeeName,
        employeeNik: asn.employeeNik,
        assignmentId: asn.id,
        clientName: sheet.clientName,
        locationName: sheet.locationName,
        serviceType: asn.serviceType || 'security',
        roleInUnit: asn.roleInUnit || 'Anggota',
        shiftId: shift.id,
        shiftName: shift.name,
        scheduledIn: shift.startTime,
        scheduledOut: shift.endTime,
        attendanceDate: dateStr,
        // HRD Input Fields
        checkIn: checkIn,
        checkOut: checkOut,
        // Calculated Fields
        status: metrics.status,
        totalMinutes: metrics.totalMinutes,
        lateMinutes: metrics.lateMinutes,
        earlyLeaveMinutes: metrics.earlyLeaveMinutes,
        notes: metrics.notes,
        overtimeMinutes: 0,
      });

      rowCounter++;
    });
  });

  return rows;
}
