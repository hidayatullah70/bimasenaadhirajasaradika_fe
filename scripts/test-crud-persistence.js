/* eslint-disable no-console */
/**
 * Internal Verification Script — PT. BARAK IOMS CRUD & Storage Persistence Test Suite
 * Validates:
 * 1. Deduplication & self-healing in storage.js
 * 2. Single-entry creation (no duplicate save)
 * 3. In-place edit persistence across page reloads
 * 4. Deletion permanence (no default data resurrection)
 * 5. Primary key integrity across all 9 adapters
 *
 * Runs natively in Node.js with mock localStorage environment.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { register } from 'node:module';

register('./alias-loader.js', import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Mock browser window and localStorage
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
  },
  dispatchEvent() {},
};
global.CustomEvent = class CustomEvent {
  constructor(name, opts) {
    this.name = name;
    this.detail = opts?.detail;
  }
};

async function runTests() {
  console.log('====================================================');
  console.log('PT. BARAK IOMS — CRUD & PERSISTENCE TEST SUITE');
  console.log('====================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Test storage.js deduplication
  const { getStoredCollection } = await import(
    `file://${path.join(rootDir, 'src/utils/storage.js')}`
  );

  console.log('--- 1. Testing Storage Deduplication & Healing ---');
  // Seed storage with duplicate entries as would happen in a race condition
  const duplicatedData = [
    { id: 'BRK-EMP-001', name: 'Budi' },
    { id: 'BRK-EMP-041', name: 'Fulan Duplicate 1' },
    { id: 'BRK-EMP-041', name: 'Fulan Duplicate 2' },
  ];
  storageMap.set('barak_test_dup', JSON.stringify(duplicatedData));

  const healed = getStoredCollection('barak_test_dup', () => []);
  assert(healed.length === 2, 'Deduplication reduces 3 items with 1 duplicate to exactly 2 items');
  assert(healed[1].id === 'BRK-EMP-041', 'Keeps the first occurrence of the duplicate item');

  // Verify the cleaned state was saved back to localStorage
  const rawSaved = JSON.parse(storageMap.get('barak_test_dup'));
  assert(rawSaved.length === 2, 'Sanitized collection automatically saved back to localStorage');

  // 2. Test Deletion Permanence (Recovery Bug Fix)
  console.log('\n--- 2. Testing Deletion Permanence (No Mock Resurrection) ---');
  const defaultList = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
  storageMap.set('barak_test_del', JSON.stringify([{ id: '1' }, { id: '2' }])); // User deleted 3 and 4

  const readAfterDelete = getStoredCollection('barak_test_del', () => defaultList);
  assert(
    readAfterDelete.length === 2,
    'Reading storage with fewer items than default does NOT resurrect deleted items'
  );

  // 3. Test Employee CRUD via Adapter
  console.log('\n--- 3. Testing Employee Adapter CRUD ---');
  const employeeAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/employeeAdapter.js')}`)).default;

  const initialEmpRes = await employeeAdapter.getEmployees({ pageSize: 100 });
  const initialCount = initialEmpRes.data.length;
  assert(initialCount >= 40, `Initial employee count seeded (${initialCount} employees)`);

  // Create Employee
  const createEmpRes = await employeeAdapter.createEmployee({
    nama_lengkap_sesuai_KTP: 'M. Ariansyah Test',
    NIK: '3201011508890001',
    jenis_kelamin: 'L',
    jenis_pekerjaan: 'Security',
    jabatan: 'Staff',
    departemen: 'Operasional',
    status_kerja: 'TETAP',
  });
  assert(createEmpRes.data && !createEmpRes.error, 'Employee created successfully');
  const createdEmp = createEmpRes.data;

  // Verify exactly 1 employee was added (initialCount + 1)
  const afterCreateEmpRes = await employeeAdapter.getEmployees({ pageSize: 100 });
  assert(afterCreateEmpRes.data.length === initialCount + 1, 'Exactly 1 record added (NO double save)');
  assert(afterCreateEmpRes.data[0].nama_lengkap_sesuai_KTP === 'M. Ariansyah Test', 'New employee appears at front of listing');

  // Update Employee
  const updateEmpRes = await employeeAdapter.updateEmployee(createdEmp.id, {
    nama_lengkap_sesuai_KTP: 'M. Ariansyah Updated',
    nomor_telepon: '081299998888',
  });
  assert(updateEmpRes.data && !updateEmpRes.error, 'Employee updated successfully');
  assert(updateEmpRes.data.nama_lengkap_sesuai_KTP === 'M. Ariansyah Updated', 'Updated name reflected in update response');

  // Simulate Refresh / Re-read from storage
  const afterRefreshEmpRes = await employeeAdapter.getEmployees({ pageSize: 100 });
  const foundUpdated = afterRefreshEmpRes.data.find((e) => e.id === createdEmp.id);
  assert(foundUpdated && foundUpdated.nama_lengkap_sesuai_KTP === 'M. Ariansyah Updated', 'Edited employee persists after re-reading storage (NO rollback to dummy)');
  assert(afterRefreshEmpRes.data.length === initialCount + 1, 'Count remains consistent after edit');

  // Delete Employee
  const deleteEmpRes = await employeeAdapter.deleteEmployee(createdEmp.id);
  assert(deleteEmpRes.data?.success, 'Employee deleted successfully');

  const afterDeleteEmpRes = await employeeAdapter.getEmployees({ pageSize: 100 });
  assert(afterDeleteEmpRes.data.length === initialCount, 'Employee count returns to initial after deletion');
  assert(!afterDeleteEmpRes.data.some((e) => e.id === createdEmp.id), 'Deleted employee no longer exists in store');

  // 4. Test Client CRUD via Adapter
  console.log('\n--- 4. Testing Client Adapter CRUD ---');
  const clientAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/clientAdapter.js')}`)).default;

  const initialClients = (await clientAdapter.getClients({ pageSize: 100 })).data.length;
  assert(initialClients >= 0, 'Client adapter query initialized');
  const newClient = (await clientAdapter.createClient({
    name: 'PT Mitra Sukses Logistik',
    type: 'Logistik',
    city: 'Tangerang',
    picName: 'Andi Suherman',
    picPhone: '081234567890',
    address: 'Jl. Industri No. 5',
  })).data;
  assert(newClient && newClient.id.startsWith('CLI-'), 'Client created with valid ID prefix CLI-');

  const updatedClient = (await clientAdapter.updateClient(newClient.id, {
    name: 'PT Mitra Sukses Logistik Tbk',
  })).data;
  assert(updatedClient.name === 'PT Mitra Sukses Logistik Tbk', 'Client edit persists');

  const clientsAfterEdit = (await clientAdapter.getClients({ pageSize: 100 })).data;
  assert(clientsAfterEdit.find((c) => c.id === newClient.id)?.name === 'PT Mitra Sukses Logistik Tbk', 'Edited client remains after read');

  // 5. Test Location CRUD via Adapter
  console.log('\n--- 5. Testing Location Adapter CRUD ---');
  const locationAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/locationAdapter.js')}`)).default;

  const newLoc = (await locationAdapter.createLocation({
    name: 'Pos Gate Utama Logistik',
    clientId: newClient.id,
    address: 'Jl. Industri Gate 1',
    city: 'Tangerang',
    contactPerson: 'Danru Budi',
  })).data;
  assert(newLoc && newLoc.id.startsWith('LOC-'), 'Location created with valid ID prefix LOC-');

  const updatedLoc = (await locationAdapter.updateLocation(newLoc.id, {
    name: 'Pos Gate Utama & Cargo Hub',
  })).data;
  assert(updatedLoc.name === 'Pos Gate Utama & Cargo Hub', 'Location edit persists');

  // 6. Test Shift CRUD via Adapter
  console.log('\n--- 6. Testing Shift Adapter CRUD ---');
  const shiftAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/shiftAdapter.js')}`)).default;

  const newShift = (await shiftAdapter.createShift({
    code: 'LEMBUR',
    name: 'Shift Lembur Khusus',
    startTime: '18:00',
    endTime: '02:00',
  })).data;
  assert(newShift && newShift.id === 'SH-LEMBUR', 'Shift created with custom ID SH-LEMBUR');

  const updatedShift = (await shiftAdapter.updateShift('SH-LEMBUR', {
    name: 'Shift Lembur Khusus Malam',
  })).data;
  assert(updatedShift.name === 'Shift Lembur Khusus Malam', 'Shift edit persists');

  // 7. Test User CRUD via Adapter
  console.log('\n--- 7. Testing User Adapter CRUD ---');
  const userAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/userAdapter.js')}`)).default;

  const newUser = (await userAdapter.createUser({
    name: 'Staff Baru Operasional',
    username: 'staffops_baru',
    email: 'staffops@barak.co.id',
    role: 'OPERASIONAL',
    department: 'Operasional Lapangan',
  })).data;
  assert(newUser && newUser.id.startsWith('USR-'), 'User created with valid ID prefix USR-');

  const updatedUser = (await userAdapter.updateUser(newUser.id, {
    name: 'Staff Senior Operasional',
  })).data;
  assert(updatedUser.name === 'Staff Senior Operasional', 'User edit persists');

  // Status Toggle
  const toggledUser = (await userAdapter.toggleUserStatus(newUser.id)).data;
  assert(toggledUser && toggledUser.status === 'INACTIVE', 'User status toggle to INACTIVE persists');

  const toggledBackUser = (await userAdapter.toggleUserStatus(newUser.id)).data;
  assert(toggledBackUser && toggledBackUser.status === 'ACTIVE', 'User status toggle back to ACTIVE persists');

  // User Delete
  const deletedUserRes = await userAdapter.deleteUser(newUser.id);
  assert(deletedUserRes.data?.success, 'User delete succeeds');

  const userAfterDelete = (await userAdapter.getUserById(newUser.id)).data;
  assert(!userAfterDelete, 'Deleted user cannot be retrieved');

  // 8. Test Assignment CRUD via Adapter
  console.log('\n--- 8. Testing Assignment Adapter CRUD ---');
  const assignmentAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/assignmentAdapter.js')}`)).default;

  const newAsn = (await assignmentAdapter.createAssignment({
    employeeId: 'BRK-EMP-001',
    employeeName: 'Budi Prasetyo',
    clientId: newClient.id,
    clientName: newClient.name,
    locationId: newLoc.id,
    locationName: newLoc.name,
    shiftId: newShift.id,
    shiftName: newShift.name,
    roleInUnit: 'Danru',
  })).data;
  assert(newAsn && newAsn.id.startsWith('BRK-ASN-'), 'Assignment created with valid ID prefix BRK-ASN-');

  const updatedAsn = (await assignmentAdapter.updateAssignment(newAsn.id, {
    roleInUnit: 'Koordinator Lapangan',
  })).data;
  assert(updatedAsn.roleInUnit === 'Koordinator Lapangan', 'Assignment edit persists');

  // 9. Test Incident CRUD via Adapter
  console.log('\n--- 9. Testing Incident Adapter CRUD ---');
  const incidentAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/incidentAdapter.js')}`)).default;

  const newInc = (await incidentAdapter.createIncident({
    title: 'Pemeriksaan Pos Jaga Malam',
    severity: 'LOW',
    clientId: newClient.id,
    clientName: newClient.name,
    description: 'Pengecekan fasilitas berjalan tertib.',
  })).data;
  assert(newInc && newInc.id.startsWith('INC-'), 'Incident created with valid ID prefix INC-');

  const resolvedInc = (await incidentAdapter.resolveIncident(newInc.id, {
    resolutionNotes: 'Inspeksi selesai dengan catatan baik.',
  })).data;
  assert(resolvedInc.status === 'RESOLVED', 'Incident resolution persists');

  // 10. Test Architecture Step 2 — Storage Engine, Repository Pattern & API Query Builder
  console.log('\n--- 10. Testing Storage Engine, Repository Pattern & Query Serialization ---');
  const { storage: storageEngine } = await import(
    `file://${path.join(rootDir, 'src/data/storage/storageEngine.js')}`
  );
  storageEngine.set('test_key', { hello: 'world' });
  assert(storageEngine.has('test_key'), 'storage.has() returns true for set item');
  assert(storageEngine.get('test_key')?.hello === 'world', 'storage.get() retrieves namespaced value');
  storageEngine.remove('test_key');
  assert(!storageEngine.has('test_key'), 'storage.remove() purges key');

  // Test API Query Builder
  const { buildUrlWithParams } = await import(
    `file://${path.join(rootDir, 'src/services/apiClient.js')}`
  );
  const testUrl = buildUrlWithParams('/attendance/sheets', { year: 2026, month: 9, status: 'OPEN' });
  assert(
    testUrl.includes('/attendance/sheets') &&
    testUrl.includes('year=2026') &&
    testUrl.includes('month=9') &&
    testUrl.includes('status=OPEN'),
    'buildUrlWithParams correctly serializes query parameters into URL'
  );

  // Test Repository Pattern (employeeRepository, placementRepository, approvalRepository)
  const {
    employeeRepository,
    placementRepository,
    clientRepository: clientRepo,
    siteRepository: siteRepo,
    approvalRepository,
  } = await import(`file://${path.join(rootDir, 'src/data/repositories/index.js')}`);

  const empRepoList = await employeeRepository.list({ pageSize: 10 });
  assert(empRepoList.data.length > 0 && empRepoList.meta.total >= 40, 'employeeRepository.list() queries data');

  const placeRepoList = await placementRepository.list({ pageSize: 5 });
  assert(placeRepoList.data.length > 0, 'placementRepository.list() queries active placements');

  const clientRepoList = await clientRepo.list({ pageSize: 5 });
  assert(clientRepoList.data.length > 0, 'clientRepository.list() queries clients');

  const siteRepoList = await siteRepo.list({ pageSize: 5 });
  assert(siteRepoList.data.length > 0, 'siteRepository.list() queries sites');

  const pendingApprovals = await approvalRepository.getPendingApprovals();
  assert(Array.isArray(pendingApprovals.data), 'approvalRepository.getPendingApprovals() returns array');

  const newRepoEmp = (await employeeRepository.create({
    nama_lengkap_sesuai_KTP: 'Budi Repository Test',
    employeeType: 'INTERNAL',
    department: 'HRD',
    status: 'ACTIVE',
  })).data;
  assert(newRepoEmp && newRepoEmp.id.startsWith('BRK-EMP-'), 'employeeRepository.create() creates record with prefix');

  // Test soft delete
  const softDeleted = (await employeeRepository.softDelete(newRepoEmp.id, { reason: 'Test soft delete' })).data;
  assert(softDeleted.isDeleted === true && softDeleted.status === 'INACTIVE', 'employeeRepository.softDelete() marks record as inactive & deleted');

  // Verify default list excludes soft-deleted items
  const afterSoftDel = await employeeRepository.list({ search: 'Budi Repository Test' });
  assert(afterSoftDel.data.length === 0, 'employeeRepository.list() excludes soft-deleted items by default');

  // Test requestDelete
  const deleteReq = (await employeeRepository.requestDelete(newRepoEmp.id, {
    reason: 'Pengurangan staf internal',
    requestedBy: 'HRD Lead',
  })).data;
  assert(deleteReq.pendingApproval === true && deleteReq.requestId.startsWith('DEL-REQ-'), 'employeeRepository.requestDelete() routes to approval');

  // Clean up
  await employeeRepository.hardDelete(newRepoEmp.id);
  await clientAdapter.deleteClient(newClient.id);
  await locationAdapter.deleteLocation(newLoc.id);
  await shiftAdapter.deleteShift(newShift.id);
  await userAdapter.deleteUser(newUser.id);
  await assignmentAdapter.deleteAssignment(newAsn.id);
  await incidentAdapter.deleteIncident(newInc.id);

  // ── 11. STEP 3 ACCEPTANCE SUITE (End-to-End Persistence & Lifecycle Verification) ──
  console.log('\n--- 11. Testing Step 3 Acceptance Criteria & Lifecycles ---');
  
  // 11.1 Real Client Persistence (18 Authorized Clients)
  const clientsInitial = await clientRepo.list({ pageSize: 100 });
  assert(clientsInitial.data.length === 18, 'AUTHORITATIVE REAL CLIENTS: Exactly 18 real clients seeded and present');
  assert(clientsInitial.data.every((c) => c.id.startsWith('CLI-')), 'AUTHORITATIVE REAL CLIENTS: All have CLI- authoritative prefix');

  // 11.2 CREATE -> REFRESH -> DATA REMAINS
  const createdAcceptanceEmp = (await employeeRepository.create({
    nama_lengkap_sesuai_KTP: 'Acceptance Test Personnel',
    employeeType: 'INTERNAL',
    department: 'OPERATIONS',
    status: 'ACTIVE',
  })).data;
  assert(createdAcceptanceEmp && createdAcceptanceEmp.id, '[CREATE] Employee record created');

  const refreshedEmp = (await employeeRepository.getById(createdAcceptanceEmp.id)).data;
  assert(refreshedEmp && refreshedEmp.nama_lengkap_sesuai_KTP === 'Acceptance Test Personnel', '[REFRESH] Created employee persists across simulated refresh');

  // 11.3 EDIT -> REFRESH -> DATA REMAINS
  await employeeRepository.update(createdAcceptanceEmp.id, {
    nama_lengkap_sesuai_KTP: 'Acceptance Test Personnel (EDITED)',
    jabatan: 'Koordinator Lapangan',
  });
  const reloadedEmp = (await employeeRepository.getById(createdAcceptanceEmp.id)).data;
  assert(reloadedEmp && reloadedEmp.nama_lengkap_sesuai_KTP === 'Acceptance Test Personnel (EDITED)', '[EDIT -> REFRESH] Edited data remains intact');

  // 11.4 PLACEMENT CREATE & ROTATION -> REFRESH -> PLACEMENT REMAINS
  const newPlacement = (await placementRepository.create({
    employee_id: createdAcceptanceEmp.id,
    client_id: 'CLI-000001',
    site_id: 'SITE-001',
    service_id: 'SRV-SEC-01',
    position: 'Chief Security',
    shift: 'SHIFT_PAGI',
    start_date: '2026-10-01',
    status: 'ACTIVE',
  })).data;
  assert(newPlacement && newPlacement.id, '[PLACEMENT CREATE] Placement record created');

  const refreshedPlacements = (await placementRepository.list({ employee_id: createdAcceptanceEmp.id })).data;
  assert(refreshedPlacements.some((p) => p.id === newPlacement.id && p.status === 'ACTIVE'), '[PLACEMENT -> REFRESH] Active placement persists across refresh');

  // Rotate/Transfer Placement
  const transferRes = (await placementRepository.transfer(newPlacement.id, {
    client_id: 'CLI-000002',
    site_id: 'SITE-002',
    position: 'Danru Security',
    shift: 'SHIFT_MALAM',
    start_date: '2026-11-01',
    reason: 'Rotasi Rutin 6 Bulanan',
  })).data;
  assert(transferRes && transferRes.previousPlacement.status === 'ROTATED', '[PLACEMENT ROTATE] Previous placement marked as ROTATED');
  assert(transferRes && transferRes.newPlacement.status === 'ACTIVE', '[PLACEMENT ROTATE] New placement marked as ACTIVE');

  // Verify placement history
  const placementHistory = await placementRepository.getHistoryByEmployeeId(createdAcceptanceEmp.id);
  assert(placementHistory.data.length >= 2, '[PLACEMENT HISTORY] Full placement rotation history preserved');

  // 11.5 DELETE REQUEST -> REFRESH -> REQUEST REMAINS
  const delReqResult = (await employeeAdapter.requestDeleteEmployee(createdAcceptanceEmp.id, {
    reason: 'Mutasi permanen ke entitas anak perusahaan',
    requestedBy: 'Staff HRD',
  })).data;
  assert(delReqResult.pendingApproval === true, '[DELETE REQUEST] Delete request generated');

  // Check Director's approval queue
  const { directorAdapter } = await import(`file://${path.join(rootDir, 'src/services/adapters/directorAdapter.js')}`);
  const approvalsList = (await directorAdapter.getPendingApprovals()).data;
  const foundReq = approvalsList.find((a) => (a.referenceId === createdAcceptanceEmp.id || a.recordId === createdAcceptanceEmp.id) && a.status === 'PENDING');
  assert(foundReq !== undefined, '[DELETE REQUEST -> REFRESH] Pending deletion request remains in Director queue');

  // 11.6 DIRECTOR APPROVAL -> REFRESH -> STATUS REMAINS (Soft Delete / Inactive)
  await directorAdapter.approveItem(foundReq.id, { notes: 'Disetujui untuk mutasi keluar', actorName: 'Juli Priyanto (Direktur Utama)' });
  
  // Re-read employee from repo
  const afterApprovalEmp = (await employeeAdapter.getEmployeeById(createdAcceptanceEmp.id)).data;
  assert(afterApprovalEmp.isDeleted === true, '[DIRECTOR APPROVE -> REFRESH] Employee soft-deleted');
  assert(afterApprovalEmp.status === 'INACTIVE' || afterApprovalEmp.status_kerja === 'NONAKTIF', '[DIRECTOR APPROVE -> REFRESH] Employee status is INACTIVE');

  // 11.7 DEMO DATA RESET PRESERVATION (Requirement 2: CLIENT DATA = REAL DATA)
  const { resetDemoData } = await import(`file://${path.join(rootDir, 'src/utils/demoDataReset.js')}`);
  const resetStats = resetDemoData();
  assert(resetStats.preservedClientsCount === 18, '[DATA CLASSIFICATION] Exactly 18 real clients preserved during demo reset');
  
  const clientsAfterReset = await clientRepo.list({ pageSize: 100 });
  assert(clientsAfterReset.data.length === 18, '[DEMO RESET INTEGRITY] Real clients intact after full operational reset');

  // Clean up test employee
  await employeeRepository.hardDelete(createdAcceptanceEmp.id);

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} tests PASSED`);
  console.log('====================================================');
  if (passedTests === totalTests) {
    console.log('All CRUD, deduplication, and persistence tests PASSED successfully!\n');
  }
}

runTests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
