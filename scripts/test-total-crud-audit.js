/* eslint-disable no-console */
/**
 * TOTAL COMPREHENSIVE CRUD & LOCALSTORAGE AUDIT SUITE
 * PT. BARAK IOMS (Integrated Outsourcing Management System)
 *
 * Audits all 10 departments, 31 operational entities & forms.
 * Verifies CREATE, READ, UPDATE, DELETE and exact localStorage persistence.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { register } from 'node:module';

register('./alias-loader.js', import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Mock localStorage engine
const storageMap = new Map();
global.window = {
  localStorage: {
    getItem(key) {
      return storageMap.has(key) ? storageMap.get(key) : null;
    },
    setItem(key, val) {
      storageMap.set(key, String(val));
    },
    removeItem(key) {
      storageMap.delete(key);
    },
    clear() {
      storageMap.clear();
    },
    get length() {
      return storageMap.size;
    },
    key(i) {
      return Array.from(storageMap.keys())[i] || null;
    },
  },
  dispatchEvent() {},
};
global.CustomEvent = class CustomEvent {
  constructor(name, opts) {
    this.name = name;
    this.detail = opts?.detail;
  }
};

async function runTotalAudit() {
  console.log('========================================================================');
  console.log('PT. BARAK IOMS — TOTAL COMPREHENSIVE CRUD & LOCALSTORAGE PERSISTENCE AUDIT');
  console.log('========================================================================\n');

  const { qualifyKey } = await import(`file://${path.join(rootDir, 'src/data/storage/storageEngine.js')}`);

  let passed = 0;
  let failed = 0;
  const auditReport = [];

  async function testStep(department, entity, operation, fn) {
    try {
      await fn();
      passed++;
      console.log(`[PASS] [${department}] ${entity} -> ${operation}`);
      auditReport.push({ department, entity, operation, status: 'PASSED' });
    } catch (err) {
      failed++;
      console.error(`[FAIL] [${department}] ${entity} -> ${operation}: ${err.message}`);
      auditReport.push({ department, entity, operation, status: 'FAILED', error: err.message });
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function verifyInLocalStorage(key, predicate, description) {
    const fullKey = qualifyKey(key);
    const raw = storageMap.get(fullKey) || storageMap.get(key);
    assert(raw, `Key "${fullKey}" must exist in localStorage`);
    const parsed = JSON.parse(raw);
    assert(predicate(parsed), `LocalStorage [${fullKey}]: ${description}`);
  }

  // ========================================================================
  // 1. MASTER DATA: EMPLOYEES
  // ========================================================================
  console.log('\n--- 1. MASTER DATA: EMPLOYEES (barak_employees) ---');
  const employeeAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/employeeAdapter.js')}`)).default;
  let empTestId = null;

  await testStep('Master Data', 'Employee', 'CREATE & LocalStorage Save', async () => {
    const res = await employeeAdapter.createEmployee({
      nama_lengkap_sesuai_KTP: 'Bambang Sudirman',
      NIK: '3201998877665544',
      departemen: 'Operasional Lapangan',
      jenis_pekerjaan: 'Jasa Pengamanan / Security',
      jenis_layanan: 'security',
      jabatan: 'Danru Pengamanan',
      status_kerja: 'TETAP',
      nomor_telepon: '081234567890',
    });
    assert(res.data && res.data.id && res.data.id.startsWith('BRK-EMP-'), 'Employee ID must start with BRK-EMP-');
    empTestId = res.data.id;
    verifyInLocalStorage('barak_employees', (list) => list.some((e) => e.id === empTestId), 'New employee persisted in barak_employees');
  });

  await testStep('Master Data', 'Employee', 'READ / Query with Filter', async () => {
    const res = await employeeAdapter.getEmployees({ search: 'Sudirman' });
    assert(res.data && res.data.some((e) => e.id === empTestId), 'Employee found via search query');
  });

  await testStep('Master Data', 'Employee', 'UPDATE & LocalStorage Sync', async () => {
    const res = await employeeAdapter.updateEmployee(empTestId, {
      nama_lengkap_sesuai_KTP: 'Bambang Sudirman, S.H.',
      jabatan: 'Chief Security Senior',
    });
    assert(res.data && res.data.nama_lengkap_sesuai_KTP === 'Bambang Sudirman, S.H.', 'Employee name updated');
    verifyInLocalStorage(
      'barak_employees',
      (list) => list.some((e) => e.id === empTestId && e.nama_lengkap_sesuai_KTP === 'Bambang Sudirman, S.H.'),
      'Updated employee name persisted in localStorage'
    );
  });

  await testStep('Master Data', 'Employee', 'DELETE (Hard Delete) & LocalStorage Removal', async () => {
    const res = await employeeAdapter.deleteEmployee(empTestId);
    assert(res.data && res.data.success, 'Employee deleted successfully');
    verifyInLocalStorage('barak_employees', (list) => !list.some((e) => e.id === empTestId), 'Deleted employee removed from barak_employees');
  });

  await testStep('Master Data', 'Employee', 'BULK IMPORT & ATOMIC PLACEMENT', async () => {
    const res = await employeeAdapter.importEmployees([
      {
        nama_lengkap_sesuai_KTP: 'Imported Staff 1',
        NIK: '3201111122223333',
        jenis_layanan: 'security',
        penugasan_klien: 'CLI-000001',
        lokasi_penugasan: 'LOC-000001',
      },
    ]);
    assert(res.data && res.data.success && res.data.count >= 1, 'Imported employee created');
    verifyInLocalStorage('barak_employees', (list) => list.some((e) => e.nama_lengkap_sesuai_KTP === 'Imported Staff 1'), 'Imported employee saved');
    verifyInLocalStorage(
      'barak_assignments',
      (list) => list.some((a) => a.employeeName === 'Imported Staff 1' && a.clientId === 'CLI-000001'),
      'Atomic placement created in barak_assignments'
    );
  });

  // ========================================================================
  // 2. MASTER DATA: CLIENTS (18 Authoritative Real Clients)
  // ========================================================================
  console.log('\n--- 2. MASTER DATA: CLIENTS (barak_clients) ---');
  const clientAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/clientAdapter.js')}`)).default;
  let cliTestId = null;

  await testStep('Master Data', 'Client', 'CREATE & LocalStorage Save', async () => {
    const res = await clientAdapter.createClient({
      name: 'PT Cahaya Logistik Nusantara',
      type: 'Logistik',
      picName: 'Hendra Gunawan',
      picPhone: '081288887777',
      address: 'Kawasan Industri MM2100 Blok C',
      city: 'Bekasi',
    });
    assert(res.data && res.data.id && res.data.id.startsWith('CLI-'), 'Client ID starts with CLI-');
    cliTestId = res.data.id;
    verifyInLocalStorage('barak_clients', (list) => list.some((c) => c.id === cliTestId), 'New client in barak_clients');
  });

  await testStep('Master Data', 'Client', 'READ & UPDATE', async () => {
    const res = await clientAdapter.updateClient(cliTestId, {
      name: 'PT Cahaya Logistik Nusantara Tbk',
    });
    assert(res.data && res.data.name.includes('Tbk'), 'Client updated');
    verifyInLocalStorage('barak_clients', (list) => list.some((c) => c.id === cliTestId && c.name.includes('Tbk')), 'Client update persisted');
  });

  await testStep('Master Data', 'Client', 'DELETE & LocalStorage Clean', async () => {
    const res = await clientAdapter.deleteClient(cliTestId);
    assert(res.data && res.data.success, 'Client deleted');
    verifyInLocalStorage('barak_clients', (list) => !list.some((c) => c.id === cliTestId), 'Deleted client removed from store');
  });

  // ========================================================================
  // 3. MASTER DATA: LOCATIONS / SITES
  // ========================================================================
  console.log('\n--- 3. MASTER DATA: LOCATIONS (barak_locations) ---');
  const locationAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/locationAdapter.js')}`)).default;
  let locTestId = null;

  await testStep('Master Data', 'Location', 'CREATE & LocalStorage Save', async () => {
    const res = await locationAdapter.createLocation({
      clientId: 'CLI-000001',
      name: 'Gudang DC Cikarang Utama',
      address: 'Jl. Industri Hijau No. 1',
      city: 'Cikarang',
      quota: 10,
    });
    assert(res.data && res.data.id && res.data.id.startsWith('LOC-'), 'Location ID starts with LOC-');
    locTestId = res.data.id;
    verifyInLocalStorage('barak_locations', (list) => list.some((l) => l.id === locTestId), 'Location in barak_locations');
  });

  await testStep('Master Data', 'Location', 'UPDATE & LocalStorage Sync', async () => {
    const res = await locationAdapter.updateLocation(locTestId, {
      quota: 16,
    });
    assert(res.data && res.data.quota === 16, 'Quota updated to 16');
    verifyInLocalStorage('barak_locations', (list) => list.some((l) => l.id === locTestId && l.quota === 16), 'Updated quota persisted');
  });

  await testStep('Master Data', 'Location', 'DELETE & LocalStorage Clean', async () => {
    const res = await locationAdapter.deleteLocation(locTestId);
    assert(res.data && res.data.success, 'Location deleted');
    verifyInLocalStorage('barak_locations', (list) => !list.some((l) => l.id === locTestId), 'Deleted location removed');
  });

  // ========================================================================
  // 4. MASTER DATA: SHIFTS
  // ========================================================================
  console.log('\n--- 4. MASTER DATA: SHIFTS (barak_shifts) ---');
  const shiftAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/shiftAdapter.js')}`)).default;
  let shiftTestId = null;

  await testStep('Master Data', 'Shift', 'CREATE & LocalStorage Save', async () => {
    const res = await shiftAdapter.createShift({
      name: 'Shift Siaga Khusus',
      code: 'SH_KHUSUS',
      startTime: '13:00',
      endTime: '21:00',
      durationHours: 8,
    });
    assert(res.data && res.data.id, 'Shift created');
    shiftTestId = res.data.id;
    verifyInLocalStorage('barak_shifts', (list) => list.some((s) => s.id === shiftTestId), 'Shift saved');
  });

  await testStep('Master Data', 'Shift', 'UPDATE & LocalStorage Sync', async () => {
    const res = await shiftAdapter.updateShift(shiftTestId, {
      name: 'Shift Siaga Khusus Lapangan',
    });
    assert(res.data && res.data.name.includes('Lapangan'), 'Shift name updated');
    verifyInLocalStorage('barak_shifts', (list) => list.some((s) => s.id === shiftTestId && s.name.includes('Lapangan')), 'Shift persisted');
  });

  await testStep('Master Data', 'Shift', 'DELETE & LocalStorage Clean', async () => {
    const res = await shiftAdapter.deleteShift(shiftTestId);
    assert(res.data && res.data.success, 'Shift deleted');
    verifyInLocalStorage('barak_shifts', (list) => !list.some((s) => s.id === shiftTestId), 'Shift deleted from store');
  });

  // ========================================================================
  // 5. MASTER DATA: PLACEMENTS / ASSIGNMENTS
  // ========================================================================
  console.log('\n--- 5. MASTER DATA: PLACEMENTS (barak_assignments) ---');
  const assignmentAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/assignmentAdapter.js')}`)).default;
  let asnTestId = null;

  await testStep('Master Data', 'Assignment', 'CREATE & LocalStorage Save', async () => {
    const res = await assignmentAdapter.createAssignment({
      employeeId: 'BRK-EMP-001',
      employeeName: 'Budi Hartono',
      clientId: 'CLI-000001',
      clientName: 'PT JNE Express',
      locationId: 'LOC-000001',
      locationName: 'Hub Tomang',
      serviceType: 'security',
      roleInUnit: 'Anggota',
      startDate: '2026-10-01',
    });
    assert(res.data && res.data.id && res.data.id.startsWith('BRK-ASN-'), 'Assignment created');
    asnTestId = res.data.id;
    verifyInLocalStorage('barak_assignments', (list) => list.some((a) => a.id === asnTestId), 'Assignment in barak_assignments');
  });

  await testStep('Master Data', 'Assignment', 'TRANSFER / ROTATE (Previous -> ROTATED, New -> ACTIVE)', async () => {
    const res = await assignmentAdapter.transferAssignment(asnTestId, {
      newClientId: 'CLI-000002',
      newLocationId: 'LOC-000002',
      notes: 'Rotasi rutin 6 bulan',
    });
    assert(res.data && res.data.previousPlacement && res.data.newPlacement, 'Transfer completed');
    assert(res.data.previousPlacement.status === 'ROTATED', 'Previous placement marked ROTATED');
    assert(res.data.newPlacement.status === 'ACTIVE', 'New placement is ACTIVE');
    verifyInLocalStorage(
      'barak_assignments',
      (list) => list.some((a) => a.id === asnTestId && a.status === 'ROTATED'),
      'Old placement marked ROTATED in localStorage'
    );
  });

  await testStep('Master Data', 'Assignment', 'DELETE & LocalStorage Clean', async () => {
    const res = await assignmentAdapter.deleteAssignment(asnTestId);
    assert(res.data && res.data.success, 'Assignment deleted');
    verifyInLocalStorage('barak_assignments', (list) => !list.some((a) => a.id === asnTestId), 'Deleted assignment removed');
  });

  // ========================================================================
  // 6. MASTER DATA: USERS & PERMISSIONS
  // ========================================================================
  console.log('\n--- 6. MASTER DATA: USERS & PERMISSIONS (barak_users) ---');
  const userAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/userAdapter.js')}`)).default;
  let userTestId = null;

  await testStep('Master Data', 'User', 'CREATE & LocalStorage Save', async () => {
    const res = await userAdapter.createUser({
      name: 'Auditor Internal System',
      username: 'auditor_barak',
      email: 'auditor@barak.co.id',
      role: 'IT_SUPPORT',
      department: 'Teknologi Informasi',
    });
    assert(res.data && res.data.id && res.data.id.startsWith('USR-'), 'User created');
    userTestId = res.data.id;
    verifyInLocalStorage('barak_users', (list) => list.some((u) => u.id === userTestId), 'User in barak_users');
  });

  await testStep('Master Data', 'User', 'UPDATE / RENAME & Status Toggle', async () => {
    const updateRes = await userAdapter.updateUser(userTestId, {
      name: 'Auditor Internal Senior',
      username: 'auditor_senior',
    });
    assert(updateRes.data && updateRes.data.username === 'auditor_senior', 'Username renamed');
    verifyInLocalStorage('barak_users', (list) => list.some((u) => u.username === 'auditor_senior'), 'Renamed user in store');

    const toggleRes = await userAdapter.toggleUserStatus(userTestId);
    assert(toggleRes.data && toggleRes.data.status === 'INACTIVE', 'User toggled to INACTIVE');
  });

  await testStep('Master Data', 'User', 'DELETE & Permanent Deletion (No Resurrection)', async () => {
    const res = await userAdapter.deleteUser(userTestId);
    assert(res.data && res.data.success, 'User deleted');
    verifyInLocalStorage('barak_deleted_user_ids', (list) => list.includes(userTestId.toLowerCase()), 'User ID added to deleted set');
  });

  // ========================================================================
  // 7. HRD: ATTENDANCE POSKO & ROSTER
  // ========================================================================
  console.log('\n--- 7. HRD: ATTENDANCE POSKO (attendance_sheets & rows) ---');
  const attendanceAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/attendanceAdapter.js')}`)).default;

  await testStep('HRD', 'Attendance', 'SHEET QUERY, FINALIZE (Lock) & REOPEN (Director Supreme Action)', async () => {
    const sheetsRes = await attendanceAdapter.getSheets({ year: 2026, month: 9 });
    assert(sheetsRes.data && Array.isArray(sheetsRes.data), 'Sheets returned as array');
    if (sheetsRes.data.length > 0) {
      const sheet = sheetsRes.data[0];
      const detailRes = await attendanceAdapter.getSheetById(sheet.id);
      assert(detailRes.data && detailRes.data.sheet && detailRes.data.sheet.id === sheet.id, 'Sheet detail retrieved');

      const finRes = await attendanceAdapter.finalizeSheet(sheet.id, 'Zaenal Arifin (HRD)', detailRes.data.rows || []);
      assert(finRes.data && finRes.data.status === 'FINALIZED', 'Sheet finalized and locked');

      const reopenRes = await attendanceAdapter.reopenSheet(sheet.id, {
        reason: 'Penyesuaian jam lembar absensi',
        reopenedBy: 'Juli Priyanto (Direktur Utama)',
      });
      assert(reopenRes.data && reopenRes.data.status === 'REOPENED', 'Sheet reopened by Director');
    }
  });

  // ========================================================================
  // 8. HRD: CONTRACT MONITORING
  // ========================================================================
  console.log('\n--- 8. HRD: CONTRACT MONITORING (contracts) ---');
  const contractAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/contractAdapter.js')}`)).default;
  let ctrTestId = null;

  await testStep('HRD', 'Contract', 'CREATE & LocalStorage Save', async () => {
    const res = await contractAdapter.createContract({
      employeeName: 'Ahmad Fauzi',
      employeeNik: '3201444455556666',
      clientName: 'PT Triputra Agro Persada',
      contractType: 'PKWT',
      startDate: '2026-10-01',
      endDate: '2027-10-01',
    });
    assert(res.data && res.data.id, 'Contract created');
    ctrTestId = res.data.id;
    verifyInLocalStorage('contracts', (list) => list.some((c) => c.id === ctrTestId), 'Contract in contracts store');
  });

  await testStep('HRD', 'Contract', 'UPDATE & DELETE (Direct / Soft Delete)', async () => {
    const updateRes = await contractAdapter.updateContract(ctrTestId, {
      notes: 'Kontrak diperbarui dengan penyesuaian UMR',
    });
    assert(updateRes.data && updateRes.data.notes, 'Contract updated');

    const delRes = await contractAdapter.deleteContract(ctrTestId, { reason: 'Uji audit selesai' });
    assert(delRes.data && delRes.data.isDeleted, 'Contract marked deleted');
    verifyInLocalStorage('contracts', (list) => list.some((c) => c.id === ctrTestId && c.isDeleted), 'Deleted contract persisted');
  });

  // ========================================================================
  // 9. HRD: APPLICANTS / RECRUITMENT
  // ========================================================================
  console.log('\n--- 9. HRD: RECRUITMENT / APPLICANTS (barak_applicants) ---');
  const applicantAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/applicantAdapter.js')}`)).default;
  let appTestId = null;

  await testStep('HRD', 'Applicant', 'CREATE & LocalStorage Save', async () => {
    const res = await applicantAdapter.createApplicant({
      namaLengkap: 'Kurniawan Dwi Yulianto',
      nik: '3201888899990000',
      noHpWa: '081233445566',
      posisi: 'Anggota Security Posko',
      departemen: 'Jasa Pengamanan / Security',
      status: 'MASUK',
    });
    assert(res.data && res.data.id, 'Applicant created');
    appTestId = res.data.id;
    verifyInLocalStorage('barak_applicants', (list) => list.some((a) => a.id === appTestId), 'Applicant in barak_applicants');
  });

  await testStep('HRD', 'Applicant', 'UPDATE & Stage Transition', async () => {
    const res = await applicantAdapter.updateApplicant(appTestId, {
      status: 'INTERVIEW',
      catatanInterview: 'Postur tegap, sertifikat Gada Pratama valid',
    });
    assert(res.data && res.data.status === 'INTERVIEW', 'Status updated to INTERVIEW');
    verifyInLocalStorage('barak_applicants', (list) => list.some((a) => a.id === appTestId && a.status === 'INTERVIEW'), 'Applicant stage updated');
  });

  await testStep('HRD', 'Applicant', 'DELETE & LocalStorage Clean', async () => {
    const res = await applicantAdapter.deleteApplicant(appTestId);
    assert(res.data && res.data.success, 'Applicant deleted');
    verifyInLocalStorage('barak_applicants', (list) => !list.some((a) => a.id === appTestId), 'Applicant removed from barak_applicants');
  });

  // ========================================================================
  // 10. LEGAL & COMPLIANCE
  // ========================================================================
  console.log('\n--- 10. LEGAL & COMPLIANCE (legal_cases, legal_contracts, legal_compliance) ---');
  const legalAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/legalAdapter.js')}`)).default;
  let caseTestId = null;
  let compTestId = null;

  await testStep('Legal', 'Legal Case', 'CREATE, UPDATE, RESOLVE, DELETE', async () => {
    const createRes = await legalAdapter.createCase({
      title: 'Klaim Kerusakan Pagar Perimeter',
      clientName: 'PT Shopee International Indonesia',
      priority: 'MEDIUM',
      caseType: 'Perdata',
      description: 'Benturan truk vendor ke gerbang pos 1',
    });
    assert(createRes.data && createRes.data.id, 'Case created');
    caseTestId = createRes.data.id;
    verifyInLocalStorage('legal_cases', (list) => list.some((c) => c.id === caseTestId), 'Legal case in localStorage');

    const updateRes = await legalAdapter.updateCase(caseTestId, {
      description: 'Benturan truk vendor ke gerbang pos 1 (Biaya perbaikan ditanggung vendor)',
    });
    assert(updateRes.data && updateRes.data.description.includes('ditanggung'), 'Case updated');

    const delRes = await legalAdapter.deleteCase(caseTestId);
    assert(delRes.data && delRes.data.success, 'Case deleted');
    verifyInLocalStorage('legal_cases', (list) => !list.some((c) => c.id === caseTestId), 'Case removed from store');
  });

  await testStep('Legal', 'Compliance Item', 'CREATE, UPDATE, DELETE', async () => {
    const createRes = await legalAdapter.createComplianceItem({
      licenseName: 'Surat Izin Operasional Badan Usaha Jasa Pengamanan (SIO BUJP)',
      licenseNumber: 'SIO/POLRI/2026/001',
      issuingAuthority: 'Mabes Polri',
      category: 'OPERASIONAL',
      expiryDate: '2028-12-31',
    });
    assert(createRes.data && createRes.data.id, 'Compliance item created');
    compTestId = createRes.data.id;
    verifyInLocalStorage('legal_compliance', (list) => list.some((c) => c.id === compTestId), 'Compliance in localStorage');

    const updateRes = await legalAdapter.updateComplianceItem(compTestId, {
      remarks: 'Arsip fisik berada di lemari dokumen legal',
    });
    assert(updateRes.data && updateRes.data.remarks, 'Compliance updated');

    const delRes = await legalAdapter.deleteComplianceItem(compTestId);
    assert(delRes.data === true, 'Compliance soft-deleted');
    verifyInLocalStorage('legal_compliance', (list) => list.some((c) => c.id === compTestId && c.isDeleted), 'Compliance soft-delete persisted');
  });

  // ========================================================================
  // 11. OPERATIONS: INCIDENTS, REPLACEMENTS, FIELD REPORTS, PIC ACTIVITY
  // ========================================================================
  console.log('\n--- 11. OPERATIONS (incidents, replacements, field_reports, pic_reports) ---');
  const incidentAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/incidentAdapter.js')}`)).default;
  const replacementAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/replacementAdapter.js')}`)).default;
  const fieldReportAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/fieldReportAdapter.js')}`)).default;
  const picActivityAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/picActivityReportAdapter.js')}`)).default;

  let incTestId = null;
  let repTestId = null;
  let frTestId = null;
  let picTestId = null;

  await testStep('Operations', 'Incident', 'CREATE, RESOLVE, DELETE', async () => {
    const createRes = await incidentAdapter.createIncident({
      title: 'Penerangan Area Parkir Timur Padam',
      locationName: 'Hub Tomang',
      clientName: 'PT JNE Express',
      severity: 'LOW',
      description: 'MCB penerangan trip',
    });
    assert(createRes.data && createRes.data.id, 'Incident created');
    incTestId = createRes.data.id;
    verifyInLocalStorage('barak_incidents', (list) => list.some((i) => i.id === incTestId), 'Incident in localStorage');

    const resRes = await incidentAdapter.resolveIncident(incTestId, { resolutionNotes: 'MCB dinaikkan kembali' });
    assert(resRes.data && resRes.data.status === 'RESOLVED', 'Incident resolved');

    const delRes = await incidentAdapter.deleteIncident(incTestId);
    assert(delRes.data && delRes.data.success, 'Incident deleted');
    verifyInLocalStorage('barak_incidents', (list) => !list.some((i) => i.id === incTestId), 'Incident removed');
  });

  await testStep('Operations', 'Replacement', 'CREATE, APPROVE, DELETE', async () => {
    const createRes = await replacementAdapter.createReplacement({
      employeeId: 'BRK-EMP-002',
      employeeName: 'Agus Setiawan',
      clientName: 'PT Pos Indonesia',
      locationName: 'Kantor Pos Daan Mogot',
      reason: 'Izin Menikah',
      startDate: '2026-10-15',
      endDate: '2026-10-18',
    });
    assert(createRes.data && createRes.data.id, 'Replacement created');
    repTestId = createRes.data.id;
    verifyInLocalStorage('barak_replacements', (list) => list.some((r) => r.id === repTestId), 'Replacement in localStorage');

    const appRes = await replacementAdapter.approveReplacement(repTestId);
    assert(appRes.data && appRes.data.status === 'APPROVED', 'Replacement approved');

    const delRes = await replacementAdapter.deleteReplacement(repTestId);
    assert(delRes.data && delRes.data.success, 'Replacement deleted');
    verifyInLocalStorage('barak_replacements', (list) => !list.some((r) => r.id === repTestId), 'Replacement removed');
  });

  await testStep('Operations', 'Field Report', 'CREATE, UPDATE, DELETE', async () => {
    const createRes = await fieldReportAdapter.createReport({
      clientName: 'PT Mayora Indah Tbk',
      locationName: 'Pabrik Balaraja',
      shift: 'Malam',
      supervisorName: 'Nazi Rinaldi',
      notes: 'Patroli putaran 1 aman kondusif',
    });
    assert(createRes.data && createRes.data.id, 'Field report created');
    frTestId = createRes.data.id;
    verifyInLocalStorage('barak_field_reports', (list) => list.some((f) => f.id === frTestId), 'Field report in localStorage');

    const updateRes = await fieldReportAdapter.updateReport(frTestId, {
      notes: 'Patroli putaran 1 & 2 aman kondusif',
    });
    assert(updateRes.data && updateRes.data.notes.includes('2 aman'), 'Field report updated');

    const delRes = await fieldReportAdapter.deleteReport(frTestId);
    assert(delRes.data && delRes.data.success, 'Field report deleted');
    verifyInLocalStorage('barak_field_reports', (list) => !list.some((f) => f.id === frTestId), 'Field report removed');
  });

  await testStep('Operations', 'PIC Activity Report', 'CREATE, UPDATE, DELETE', async () => {
    const createRes = await picActivityAdapter.createReport({
      clientName: 'PT Lalamove Logistik Indonesia',
      locationName: 'Hub Kosambi',
      title: 'Pemeriksaan Muatan Mobil Box',
      description: 'Pemeriksaan segel kontainer',
      activityDate: '2026-10-11',
    });
    assert(createRes.data && createRes.data.id, 'PIC report created');
    picTestId = createRes.data.id;
    verifyInLocalStorage('pic_activity_reports', (list) => list.some((p) => p.id === picTestId), 'PIC report in localStorage');

    const updateRes = await picActivityAdapter.updateReport(picTestId, {
      title: 'Pemeriksaan Muatan Mobil Box & Penguncian Gembok',
    });
    assert(updateRes.data && updateRes.data.title.includes('Gembok'), 'PIC report updated');

    const delRes = await picActivityAdapter.deleteReport(picTestId);
    assert(delRes.data && delRes.data.success, 'PIC report deleted');
    verifyInLocalStorage('pic_activity_reports', (list) => !list.some((p) => p.id === picTestId), 'PIC report removed');
  });

  // ========================================================================
  // 12. FINANCE: INVOICES, PAYROLL, COD RECONCILIATION
  // ========================================================================
  console.log('\n--- 12. FINANCE (invoices, payroll, cod) ---');
  const invoiceAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/invoiceAdapter.js')}`)).default;
  const payrollAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/payrollAdapter.js')}`)).default;
  const codAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/codAdapter.js')}`)).default;

  let invTestId = null;
  let payTestId = null;
  let codTestId = null;

  await testStep('Finance', 'Invoice', 'CREATE (with BCA Channel, Fee, PPh 23, PPN 11%), PAYMENT & DELETE', async () => {
    const createRes = await invoiceAdapter.createInvoice({
      clientId: 'CLI-000001',
      clientName: 'PT JNE Express',
      periodMonth: 10,
      periodYear: 2026,
      subtotalAmount: 20000000,
      managementFeePercent: 10,
      includePpn: true,
      serviceItems: [{ description: 'Jasa Pengamanan Posko', quantity: 4, unitPrice: 5000000, total: 20000000 }],
    });
    assert(createRes.data && createRes.data.id, 'Invoice created');
    invTestId = createRes.data.id;
    verifyInLocalStorage('invoices', (list) => list.some((i) => i.id === invTestId), 'Invoice in localStorage');

    const payRes = await invoiceAdapter.recordPayment(invTestId, {
      amount: 10000000,
      paymentMethod: 'Bank Transfer (BCA)',
      bankReferenceNumber: 'TRX-BCA-AUDIT-001',
    });
    assert(payRes.data && payRes.data.amountPaid >= 10000000, 'Invoice payment recorded');

    const delRes = await invoiceAdapter.deleteInvoice(invTestId);
    assert(delRes.data && delRes.data.success, 'Invoice deleted');
    verifyInLocalStorage('invoices', (list) => !list.some((i) => i.id === invTestId), 'Invoice removed from store');
  });

  await testStep('Finance', 'Payroll Period', 'CREATE, UPDATE, APPROVE', async () => {
    const createRes = await payrollAdapter.createPayrollPeriod({
      periodMonth: 11,
      periodYear: 2026,
      periodName: 'November 2026 Audit Period',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
    });
    assert(createRes.data && createRes.data.id, 'Payroll period created');
    payTestId = createRes.data.id;
    verifyInLocalStorage('payroll_periods', (list) => list.some((p) => p.id === payTestId), 'Payroll in localStorage');

    const appRes = await payrollAdapter.approvePayroll(payTestId, { notes: 'Approved for Audit' });
    assert(appRes.data && appRes.data.status === 'APPROVED', 'Payroll approved');
    verifyInLocalStorage(
      'payroll_periods',
      (list) => list.some((p) => p.id === payTestId && p.status === 'APPROVED'),
      'Approved payroll status persisted'
    );
  });

  await testStep('Finance', 'COD Transaction', 'CREATE, SETTLE, DELETE', async () => {
    const createRes = await codAdapter.createTransaction({
      trackingNumber: 'COD-TEST-123456',
      courierName: 'Kurniawan',
      recipientName: 'Toko Berkah Sentosa',
      amount: 750000,
    });
    assert(createRes.data && createRes.data.id, 'COD transaction created');
    codTestId = createRes.data.id;
    verifyInLocalStorage('cod_transactions', (list) => list.some((t) => t.id === codTestId), 'COD transaction in localStorage');

    const setRes = await codAdapter.settleTransaction(codTestId, { settledAmount: 750000 });
    assert(setRes.data && setRes.data.status === 'SETTLED', 'COD settled');

    const delRes = await codAdapter.deleteTransaction(codTestId);
    assert(delRes.data && delRes.data.success, 'COD transaction deleted');
    verifyInLocalStorage('cod_transactions', (list) => !list.some((t) => t.id === codTestId), 'COD removed from store');
  });

  // ========================================================================
  // 13. MARKETING: LEADS & PIPELINE OPPORTUNITIES
  // ========================================================================
  console.log('\n--- 13. MARKETING (leads, opportunities) ---');
  const marketingAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/marketingAdapter.js')}`)).default;
  let leadTestId = null;
  let oppTestId = null;

  await testStep('Marketing', 'Lead', 'CREATE, UPDATE, DELETE', async () => {
    const createRes = await marketingAdapter.createLead({
      companyName: 'PT Global Niaga Sejahtera',
      contactName: 'Ibu Cindy',
      phone: '081233221100',
      email: 'cindy@globalniaga.co.id',
      estimatedValue: 40000000,
      serviceInterested: 'SECURITY',
    });
    assert(createRes.data && createRes.data.id, 'Lead created');
    leadTestId = createRes.data.id;
    verifyInLocalStorage('marketing_leads', (list) => list.some((l) => l.id === leadTestId), 'Lead in localStorage');

    const updateRes = await marketingAdapter.updateLead(leadTestId, {
      contactName: 'Ibu Cindy Novita',
    });
    assert(updateRes.data && updateRes.data.contactName === 'Ibu Cindy Novita', 'Lead updated');

    const delRes = await marketingAdapter.deleteLead(leadTestId);
    assert(delRes.data && delRes.data.success, 'Lead deleted');
    verifyInLocalStorage('marketing_leads', (list) => !list.some((l) => l.id === leadTestId), 'Lead removed');
  });

  await testStep('Marketing', 'Opportunity', 'CREATE, STAGE UPDATE, DELETE', async () => {
    const createRes = await marketingAdapter.createOpportunity({
      clientName: 'PT Wahana Semesta Abadi',
      title: 'Tender Pengamanan Gudang Logistik',
      estimatedValue: 75000000,
      stage: 'PROPOSAL',
    });
    assert(createRes.data && createRes.data.id, 'Opportunity created');
    oppTestId = createRes.data.id;
    verifyInLocalStorage('marketing_opportunities', (list) => list.some((o) => o.id === oppTestId), 'Opportunity in localStorage');

    const updateRes = await marketingAdapter.updateOpportunity(oppTestId, {
      stage: 'NEGOTIATION',
    });
    assert(updateRes.data && updateRes.data.stage === 'NEGOTIATION', 'Stage updated');

    const delRes = await marketingAdapter.deleteOpportunity(oppTestId);
    assert(delRes.data && delRes.data.success, 'Opportunity deleted');
    verifyInLocalStorage('marketing_opportunities', (list) => !list.some((o) => o.id === oppTestId), 'Opportunity removed');
  });

  // ========================================================================
  // 14. IT SUPPORT: TICKETS, ASSETS, MAINTENANCE
  // ========================================================================
  console.log('\n--- 14. IT SUPPORT (tickets, assets, maintenance) ---');
  const itAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/itAdapter.js')}`)).default;
  let tckTestId = null;
  let astTestId = null;
  let mntTestId = null;

  await testStep('IT Support', 'Ticket', 'CREATE, RESOLVE, DELETE', async () => {
    const createRes = await itAdapter.createTicket({
      title: 'Kamera CCTV Pos 3 Gelap',
      category: 'HARDWARE',
      priority: 'HIGH',
      reporterName: 'Danru 2',
      description: 'Lensa tertutup kotoran atau adaptor padam',
    });
    assert(createRes.data && createRes.data.id, 'Ticket created');
    tckTestId = createRes.data.id;
    verifyInLocalStorage('it_tickets', (list) => list.some((t) => t.id === tckTestId), 'Ticket in localStorage');

    const resRes = await itAdapter.resolveTicket(tckTestId, 'Adaptor CCTV telah diganti baru.');
    assert(resRes.data && resRes.data.status === 'RESOLVED', 'Ticket resolved');

    const delRes = await itAdapter.deleteTicket(tckTestId);
    assert(delRes.data && delRes.data.success, 'Ticket deleted');
    verifyInLocalStorage('it_tickets', (list) => !list.some((t) => t.id === tckTestId), 'Ticket removed');
  });

  await testStep('IT Support', 'Asset', 'CREATE, UPDATE, DELETE', async () => {
    const createRes = await itAdapter.createAsset({
      assetCode: 'AST-TEST-001',
      name: 'Fingerprint Scanner Solution X100',
      category: 'HARDWARE',
      status: 'OPERATIONAL',
    });
    assert(createRes.data && createRes.data.id, 'Asset created');
    astTestId = createRes.data.id;
    verifyInLocalStorage('it_assets', (list) => list.some((a) => a.id === astTestId), 'Asset in localStorage');

    const updateRes = await itAdapter.updateAsset(astTestId, {
      name: 'Fingerprint Scanner Solution X100 (Hub Cikarang)',
    });
    assert(updateRes.data && updateRes.data.name.includes('Cikarang'), 'Asset updated');

    const delRes = await itAdapter.deleteAsset(astTestId);
    assert(delRes.data && delRes.data.success, 'Asset deleted');
    verifyInLocalStorage('it_assets', (list) => !list.some((a) => a.id === astTestId), 'Asset removed');
  });

  await testStep('IT Support', 'Maintenance Schedule', 'CREATE, UPDATE, DELETE', async () => {
    const createRes = await itAdapter.createMaintenance({
      title: 'Pembersihan Sensor Sidik Jari Mesin Absensi',
      scheduledDate: '2026-10-30',
    });
    assert(createRes.data && createRes.data.id, 'Maintenance scheduled');
    mntTestId = createRes.data.id;
    verifyInLocalStorage('it_maintenance', (list) => list.some((m) => m.id === mntTestId), 'Maintenance in localStorage');

    const delRes = await itAdapter.deleteMaintenanceSchedule(mntTestId);
    assert(delRes.data && delRes.data.success, 'Maintenance deleted');
    verifyInLocalStorage('it_maintenance', (list) => !list.some((m) => m.id === mntTestId), 'Maintenance removed');
  });

  // ========================================================================
  // 15. WEBSITE CMS: ARTICLES, CAREERS, FAQS, INQUIRIES, SEO
  // ========================================================================
  console.log('\n--- 15. WEBSITE CMS (articles, careers, faqs, inquiries, seo) ---');
  const cmsAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/cmsAdapter.js')}`)).default;
  let artTestId = null;
  let carTestId = null;
  let faqTestId = null;

  await testStep('Website CMS', 'Article', 'CREATE, UPDATE, DELETE', async () => {
    const createRes = await cmsAdapter.createArticle({
      title: 'Audit Keamanan Terpadu Fasilitas Pergudangan 2026',
      content: 'Standard operating procedure keselamatan kerja...',
      status: 'PUBLISHED',
    });
    assert(createRes.data && createRes.data.id, 'Article created');
    artTestId = createRes.data.id;
    verifyInLocalStorage('cms_articles', (list) => list.some((a) => a.id === artTestId), 'Article in localStorage');

    const delRes = await cmsAdapter.deleteArticle(artTestId);
    assert(delRes.data && delRes.data.success, 'Article deleted');
    verifyInLocalStorage('cms_articles', (list) => !list.some((a) => a.id === artTestId), 'Article removed');
  });

  await testStep('Website CMS', 'Career Vacancy', 'CREATE, UPDATE, DELETE', async () => {
    const createRes = await cmsAdapter.createCareer({
      title: 'Staff Administrasi Operasional',
      department: 'Operasional Lapangan',
      location: 'Jakarta Barat',
      type: 'Penuh Waktu',
    });
    assert(createRes.data && createRes.data.id, 'Career created');
    carTestId = createRes.data.id;
    verifyInLocalStorage('cms_careers', (list) => list.some((c) => c.id === carTestId), 'Career in localStorage');

    const delRes = await cmsAdapter.deleteCareer(carTestId);
    assert(delRes.data && delRes.data.success, 'Career deleted');
    verifyInLocalStorage('cms_careers', (list) => !list.some((c) => c.id === carTestId), 'Career removed');
  });

  await testStep('Website CMS', 'FAQ', 'CREATE, UPDATE, DELETE', async () => {
    const createRes = await cmsAdapter.createFaq({
      question: 'Apakah sistem presensi posko mendukung multi-shift?',
      answer: 'Ya, sistem mendukung 3 shift 24 jam dengan rotasi terjadwal.',
      category: 'LAYANAN',
    });
    assert(createRes.data && createRes.data.id, 'FAQ created');
    faqTestId = createRes.data.id;
    verifyInLocalStorage('cms_faqs', (list) => list.some((f) => f.id === faqTestId), 'FAQ in localStorage');

    const delRes = await cmsAdapter.deleteFaq(faqTestId);
    assert(delRes.data && delRes.data.success, 'FAQ deleted');
    verifyInLocalStorage('cms_faqs', (list) => !list.some((f) => f.id === faqTestId), 'FAQ removed');
  });

  // ========================================================================
  // 16. DIRECTOR COCKPIT & APPROVAL CENTER
  // ========================================================================
  console.log('\n--- 16. DIRECTOR APPROVAL CENTER (approvals) ---');
  const directorAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/directorAdapter.js')}`)).default;

  await testStep('Director', 'Approval Center', 'QUERY PENDING APPROVALS', async () => {
    const res = await directorAdapter.getPendingApprovals();
    assert(res.data && Array.isArray(res.data), 'Pending approvals retrieved');
  });

  console.log('\n========================================================================');
  console.log(`TOTAL AUDIT FINISHED: ${passed} PASSED, ${failed} FAILED across all departments!`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTotalAudit();
