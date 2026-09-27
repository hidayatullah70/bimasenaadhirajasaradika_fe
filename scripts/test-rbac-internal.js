/* eslint-disable no-console */
/**
 * Internal Verification Script — PT. BARAK IOMS Granular RBAC Matrix
 * Verifies role definitions, permission mappings, Segregation of Duties (Maker-Checker),
 * and Supreme Authority of Direktur against PRD Section 6.9.
 *
 * Runs natively in Node.js with zero dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load ES module with alias resolution
async function loadModuleWithAlias(relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  let code = fs.readFileSync(fullPath, 'utf8');
  // Replace alias @/ with relative path from src/services/mock/ to src/constants/
  code = code.replace(/from\s+['"]@\/constants\/roles['"]/g, `from '../../constants/roles.js'`);
  code = code.replace(/from\s+['"]@\/constants\/permissions['"]/g, `from '../../constants/permissions.js'`);

  // Write temporary file in same folder to evaluate
  const tempFile = path.join(path.dirname(fullPath), `__temp_test_${path.basename(fullPath)}`);
  fs.writeFileSync(tempFile, code, 'utf8');
  try {
    const mod = await import(`file://${tempFile}`);
    return mod;
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('PT. BARAK IOMS — RBAC MATRIX & ROLE TEST SUITE');
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

  // 1. Load modules
  const { ROLES, ROLE_LABELS, ROLE_DEFAULT_ROUTE } = await import(
    `file://${path.join(rootDir, 'src/constants/roles.js')}`
  );
  const { PERMISSIONS } = await import(
    `file://${path.join(rootDir, 'src/constants/permissions.js')}`
  );
  const { MOCK_USERS } = await loadModuleWithAlias('src/services/mock/mockUsers.js');

  // 2. Roles & Labels Integrity
  assert(Object.keys(ROLES).length === 8, '8 authoritative roles defined');
  assert(ROLES.DIREKTUR === 'DIREKTUR', 'Role DIREKTUR exists');
  assert(ROLES.LEGAL === 'LEGAL', 'Role LEGAL exists');
  assert(ROLES.HRD === 'HRD', 'Role HRD exists');
  assert(ROLES.OPERASIONAL === 'OPERASIONAL', 'Role OPERASIONAL exists');
  assert(ROLES.FINANCE === 'FINANCE', 'Role FINANCE exists');
  assert(ROLES.MARKETING === 'MARKETING', 'Role MARKETING exists');
  assert(ROLES.IT_SUPPORT === 'IT_SUPPORT', 'Role IT_SUPPORT exists');
  assert(ROLES.ADMIN_WEBSITE === 'ADMIN_WEBSITE', 'Role ADMIN_WEBSITE exists');

  // 3. Default Routes Integrity
  assert(ROLE_DEFAULT_ROUTE[ROLES.DIREKTUR] === '/ops/director', 'Direktur default route is /ops/director');
  assert(ROLE_DEFAULT_ROUTE[ROLES.HRD] === '/ops/hrd', 'HRD default route is /ops/hrd');
  assert(ROLE_DEFAULT_ROUTE[ROLES.LEGAL] === '/ops/legal', 'Legal default route is /ops/legal');
  assert(ROLE_DEFAULT_ROUTE[ROLES.OPERASIONAL] === '/ops/operations', 'Operasional default route is /ops/operations');
  assert(ROLE_DEFAULT_ROUTE[ROLES.FINANCE] === '/ops/finance', 'Finance default route is /ops/finance');
  assert(ROLE_DEFAULT_ROUTE[ROLES.MARKETING] === '/ops/marketing', 'Marketing default route is /ops/marketing');
  assert(ROLE_DEFAULT_ROUTE[ROLES.IT_SUPPORT] === '/ops/it', 'IT Support default route is /ops/it');
  assert(ROLE_DEFAULT_ROUTE[ROLES.ADMIN_WEBSITE] === '/ops/website', 'Admin Website default route is /ops/website');

  // 4. Mock Users Map
  const roleUsers = {};
  MOCK_USERS.forEach((u) => {
    roleUsers[u.role] = u;
  });
  assert(Object.keys(roleUsers).length === 8, 'All 8 roles have mock test accounts');

  const hasPerm = (user, perm) => user && Array.isArray(user.permissions) && user.permissions.includes(perm);

  // 5. Supreme Authority of Direktur
  const direktur = roleUsers[ROLES.DIREKTUR];
  assert(hasPerm(direktur, PERMISSIONS.DIRECTOR_DASHBOARD), 'Direktur has DIRECTOR_DASHBOARD');
  assert(hasPerm(direktur, PERMISSIONS.DIRECTOR_APPROVAL), 'Direktur has DIRECTOR_APPROVAL');
  assert(hasPerm(direktur, PERMISSIONS.PAYROLL_APPROVE), 'Direktur has PAYROLL_APPROVE (Supreme Authority)');
  assert(hasPerm(direktur, PERMISSIONS.ATTENDANCE_REOPEN), 'Direktur has ATTENDANCE_REOPEN (Privileged exception)');
  assert(hasPerm(direktur, PERMISSIONS.AUDIT_LOG_VIEW), 'Direktur has AUDIT_LOG_VIEW (Global visibility)');

  // 6. Maker-Checker Integrity: Payroll Approval
  const finance = roleUsers[ROLES.FINANCE];
  const hrd = roleUsers[ROLES.HRD];
  const ops = roleUsers[ROLES.OPERASIONAL];

  assert(hasPerm(finance, PERMISSIONS.PAYROLL_VIEW), 'Finance has PAYROLL_VIEW');
  assert(hasPerm(finance, PERMISSIONS.PAYROLL_CREATE), 'Finance has PAYROLL_CREATE (Maker)');
  assert(!hasPerm(finance, PERMISSIONS.PAYROLL_APPROVE), 'Finance CANNOT have PAYROLL_APPROVE (Maker-Checker strictly enforced)');
  assert(!hasPerm(hrd, PERMISSIONS.PAYROLL_APPROVE), 'HRD CANNOT have PAYROLL_APPROVE');
  assert(!hasPerm(ops, PERMISSIONS.PAYROLL_APPROVE), 'Operasional CANNOT have PAYROLL_APPROVE');

  // 7. Maker-Checker Integrity: Attendance Lock & Reopen
  assert(hasPerm(hrd, PERMISSIONS.ATTENDANCE_FINALIZE), 'HRD can finalize & lock attendance (ATTENDANCE_FINALIZE)');
  assert(!hasPerm(hrd, PERMISSIONS.ATTENDANCE_REOPEN), 'HRD CANNOT reopen attendance (Must request privileged Direktur exception)');
  assert(!hasPerm(ops, PERMISSIONS.ATTENDANCE_FINALIZE), 'Operasional CANNOT finalize attendance');
  assert(!hasPerm(ops, PERMISSIONS.ATTENDANCE_REOPEN), 'Operasional CANNOT reopen attendance');

  // 8. COD Escalation & Reconciliation
  assert(hasPerm(finance, PERMISSIONS.COD_RECONCILE), 'Finance can reconcile COD (COD_RECONCILE)');
  assert(hasPerm(finance, PERMISSIONS.COD_ESCALATE), 'Finance can escalate COD difference (COD_ESCALATE)');
  const legal = roleUsers[ROLES.LEGAL];
  assert(hasPerm(legal, PERMISSIONS.COD_ESCALATE), 'Legal can handle COD escalation (COD_ESCALATE)');
  assert(hasPerm(legal, PERMISSIONS.COD_SETTLE), 'Legal can execute COD legal settlement (COD_SETTLE)');

  // 9. Cross-Department Handover: Marketing & Operations
  const marketing = roleUsers[ROLES.MARKETING];
  assert(hasPerm(marketing, PERMISSIONS.OPPORTUNITY_WIN), 'Marketing can mark deal as WON (OPPORTUNITY_WIN)');
  assert(hasPerm(marketing, PERMISSIONS.CLIENT_CREATE), 'Marketing can initiate client record on WON (CLIENT_CREATE)');
  assert(hasPerm(ops, PERMISSIONS.ASSIGNMENT_CREATE), 'Operasional can create security assignments upon handover');
  assert(hasPerm(finance, PERMISSIONS.INVOICE_CREATE), 'Finance can issue invoices for active clients');

  // 10. IT Support & Admin Website Boundaries
  const itSupport = roleUsers[ROLES.IT_SUPPORT];
  const adminWeb = roleUsers[ROLES.ADMIN_WEBSITE];

  assert(hasPerm(itSupport, PERMISSIONS.IT_TICKET_RESOLVE), 'IT Support can resolve tickets (IT_TICKET_RESOLVE)');
  assert(hasPerm(itSupport, PERMISSIONS.USER_VIEW), 'IT Support has USER_VIEW for password reset');
  assert(!hasPerm(itSupport, PERMISSIONS.USER_MANAGE), 'IT Support CANNOT delete or reassign user roles');
  assert(hasPerm(adminWeb, PERMISSIONS.CMS_PUBLISH), 'Admin Website can publish CMS content');
  assert(!hasPerm(adminWeb, PERMISSIONS.PAYROLL_VIEW), 'Admin Website CANNOT view payroll');
  assert(!hasPerm(adminWeb, PERMISSIONS.INVOICE_VIEW), 'Admin Website CANNOT view invoices');

  // 11. Modal Matrix Consistency Check (PRD 6.9 match)
  const matrixModalPath = path.join(rootDir, 'src/features/master/users/PermissionMatrixModal.jsx');
  const matrixContent = fs.readFileSync(matrixModalPath, 'utf8');
  assert(matrixContent.includes('Executive Dashboard & KPI'), 'PermissionMatrixModal includes Module 1');
  assert(matrixContent.includes('Approval Center (Otoritas Direksi)'), 'PermissionMatrixModal includes Module 2');
  assert(matrixContent.includes('Manajemen Pengguna & Staf'), 'PermissionMatrixModal includes Module 3');
  assert(matrixContent.includes('Tenaga Kerja (Employees)'), 'PermissionMatrixModal includes Module 4');
  assert(matrixContent.includes('Kehadiran Biometrik (Attendance)'), 'PermissionMatrixModal includes Module 5');
  assert(matrixContent.includes('Penempatan & Pos Site (Placements)'), 'PermissionMatrixModal includes Module 6');
  assert(matrixContent.includes('Insiden Lapangan & Relief Guard'), 'PermissionMatrixModal includes Module 7');
  assert(matrixContent.includes('Faktur & Piutang (Invoices)'), 'PermissionMatrixModal includes Module 8');
  assert(matrixContent.includes('Payroll Ketenagakerjaan'), 'PermissionMatrixModal includes Module 9');
  assert(matrixContent.includes('Rekonsiliasi Kas COD Kurir'), 'PermissionMatrixModal includes Module 10');
  assert(matrixContent.includes('Kasus Hukum & Kontrak Mitra (PKS)'), 'PermissionMatrixModal includes Module 11');
  assert(matrixContent.includes('Prospek & CRM Pipeline (Leads)'), 'PermissionMatrixModal includes Module 12');
  assert(matrixContent.includes('Aset IT & Tiket Helpdesk'), 'PermissionMatrixModal includes Module 13');
  assert(matrixContent.includes('CMS Website & SEO Management'), 'PermissionMatrixModal includes Module 14');
  assert(matrixContent.includes('Audit Activity Feed'), 'PermissionMatrixModal includes Module 15');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} tests PASSED`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('All 8 Roles, 15 Modules, and Maker-Checker boundaries PASSED successfully!\n');
  } else {
    console.error('Some tests failed!\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
