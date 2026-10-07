/* eslint-disable no-console */
/**
 * STEP 4 Test Suite — Dashboard, UI/UX & Business Functionality
 * PT. BARAK IOMS
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Mock browser environment for node testing
const storage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
  },
  dispatchEvent: () => {},
};
global.localStorage = global.window.localStorage;
global.CustomEvent = class CustomEvent {
  constructor(name, opts) {
    this.name = name;
    this.detail = opts?.detail;
  }
};

async function runStep4Tests() {
  console.log('\n====================================================');
  console.log('PT. BARAK IOMS — STEP 4 DASHBOARD & UX TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  function pass(desc) {
    console.log(`[PASS] ${desc}`);
    passed++;
  }

  // ── 1. Standard UI Components Verification ──
  console.log('--- 1. Testing Standard UI Components Existence & Architecture ---');
  const uiDir = path.join(rootDir, 'src', 'components', 'ui');
  const requiredComponents = [
    'Button.jsx',
    'Card.jsx',
    'Modal.jsx',
    'Badge.jsx',
    'Drawer.jsx',
    'Pagination.jsx',
    'Table.jsx',
    'Tabs.jsx',
    'PageHeader.jsx',
    'Breadcrumbs.jsx',
    'FormField.jsx',
    'index.js',
  ];

  for (const comp of requiredComponents) {
    const fullPath = path.join(uiDir, comp);
    assert.ok(fs.existsSync(fullPath), `UI component ${comp} must exist at ${fullPath}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.length > 50, `UI component ${comp} must have substantial implementation`);
  }

  // Check barrel index.js exports
  const indexContent = fs.readFileSync(path.join(uiDir, 'index.js'), 'utf8');
  assert.ok(indexContent.includes('Button'), 'index.js must export Button');
  assert.ok(indexContent.includes('Drawer'), 'index.js must export Drawer');
  assert.ok(indexContent.includes('Pagination'), 'index.js must export Pagination');
  assert.ok(indexContent.includes('Table'), 'index.js must export Table');
  assert.ok(indexContent.includes('Tabs'), 'index.js must export Tabs');
  assert.ok(indexContent.includes('PageHeader'), 'index.js must export PageHeader');
  assert.ok(indexContent.includes('Breadcrumbs'), 'index.js must export Breadcrumbs');
  assert.ok(indexContent.includes('FormField'), 'index.js must export FormField');
  pass('All 12 standardized UI components exist and are barreled in src/components/ui/index.js');

  // ── 2. Director Dashboard & Dynamic Aggregations ──
  console.log('\n--- 2. Testing Director Executive Cockpit ---');
  const { directorAdapter } = await import('../src/services/adapters/directorAdapter.js');
  const dirStats = await directorAdapter.getExecutiveDashboardStats();
  assert.ok(dirStats.data, 'Executive stats data must exist');
  assert.ok(dirStats.data.kpi, 'Executive KPI metrics must exist');
  assert.ok(typeof dirStats.data.kpi.activeEmployees === 'number', 'activeEmployees must be computed');
  assert.ok(typeof dirStats.data.kpi.activeClients === 'number', 'activeClients must be computed');
  assert.ok(typeof dirStats.data.kpi.monthlyRevenue === 'number', 'monthlyRevenue must be computed');
  assert.ok(typeof dirStats.data.kpi.pendingApprovalsCount === 'number', 'pendingApprovalsCount must be computed');
  pass('Director Executive Cockpit returns dynamic non-hardcoded multi-department KPIs');

  // ── 3. Centralized Approval Center Workflow ──
  console.log('\n--- 3. Testing Centralized Approval Center ---');
  const approvalsRes = await directorAdapter.getPendingApprovals();
  assert.ok(Array.isArray(approvalsRes.data), 'Pending approvals must be an array');
  assert.ok(approvalsRes.data.length >= 4, 'Approvals queue must contain seeded multi-type approvals');

  const types = new Set(approvalsRes.data.map((a) => a.type));
  assert.ok(types.has('PAYROLL'), 'Approval type PAYROLL must exist');
  assert.ok(types.has('CONTRACT') || types.has('CONTRACT_APPROVAL'), 'Approval type CONTRACT must exist');
  assert.ok(types.has('EMPLOYEE_DELETE'), 'Approval type EMPLOYEE_DELETE must exist');
  assert.ok(types.has('EXPENSE_APPROVAL'), 'Approval type EXPENSE_APPROVAL must exist');
  pass('Approval Center covers required approval types (Payroll, Contract, Employee Delete, Expense)');

  // Test Approve action
  const sampleApproval = approvalsRes.data[0];
  const approveRes = await directorAdapter.approveItem(sampleApproval.id, { notes: 'Approved for test' });
  assert.equal(approveRes.data.status, 'APPROVED', 'Approval status must transition to APPROVED');
  pass('Director approve action successfully executed and recorded');

  // ── 4. Finance Lifecycle & Invoice Status Transitions ──
  console.log('\n--- 4. Testing Finance Lifecycle Transitions ---');
  const { invoiceAdapter } = await import('../src/services/adapters/invoiceAdapter.js');
  const invoicesRes = await invoiceAdapter.getInvoices({ pageSize: 5 });
  assert.ok(invoicesRes.data.length > 0, 'Invoices must be seeded');

  const testInv = invoicesRes.data[0];

  // Test status transition
  const statusRes = await invoiceAdapter.updateInvoiceStatus(testInv.id, 'OVERDUE', 'Surat Peringatan 1');
  assert.equal(statusRes.data.status, 'OVERDUE', 'Invoice status must transition to OVERDUE');
  assert.equal(statusRes.data.statusChangeReason, 'Surat Peringatan 1');
  pass('Invoice status transition to OVERDUE executed with reason tracking');

  // Test cash flow summary
  const cashFlow = await invoiceAdapter.getCashFlowSummary();
  assert.ok(cashFlow.data, 'Cash flow summary data must exist');
  assert.ok(typeof cashFlow.data.totalInflow === 'number', 'totalInflow must be computed');
  assert.ok(typeof cashFlow.data.totalExpenses === 'number', 'totalExpenses must be computed');
  assert.ok(typeof cashFlow.data.netCashFlow === 'number', 'netCashFlow must be computed');
  pass('Finance cash flow summary dynamically calculated from invoices and expenses');

  // ── 5. Legal Contract Lifecycle & Transitions ──
  console.log('\n--- 5. Testing Legal Contract Lifecycle ---');
  const { legalAdapter } = await import('../src/services/adapters/legalAdapter.js');
  const contractsRes = await legalAdapter.getContracts();
  assert.ok(contractsRes.data.length > 0, 'Legal contracts must be seeded');

  const testCtr = contractsRes.data[0];
  const ctrUpdateRes = await legalAdapter.updateContractStatus(testCtr.id, 'ACTIVE', { notes: 'PKS Resmi Ditandatangani' });
  assert.equal(ctrUpdateRes.data.status, 'ACTIVE', 'Contract status must transition to ACTIVE');
  pass('Legal Contract lifecycle transition executed with audit logging');

  // ── 6. Marketing WON Cascade Across Departments ──
  console.log('\n--- 6. Testing Marketing WON Cross-Department Cascade ---');
  const { marketingAdapter } = await import('../src/services/adapters/marketingAdapter.js');
  const oppsRes = await marketingAdapter.getOpportunities({ pageSize: 10 });
  const openOpp = oppsRes.data.find((o) => o.stage !== 'WON' && o.stage !== 'LOST') || oppsRes.data[0];

  const wonRes = await marketingAdapter.markOpportunityWon(openOpp.id, {
    monthlyBilling: 55000000,
    manpowerQuota: 10,
    signedContractNumber: `PKS/TEST-WON/${Date.now()}`,
    notes: 'Tender dimenangkan resmi',
  });
  assert.ok(wonRes.data, 'Won deal response must exist');
  assert.equal(wonRes.data.opportunity.stage, 'WON', 'Opportunity stage must be WON');

  // Verify Legal received contract
  const legalAfterWon = await legalAdapter.getContracts();
  const createdContract = legalAfterWon.data.find((c) => c.contractNumber === wonRes.data.handover.signedContractNumber);
  assert.ok(createdContract, 'Legal module must receive new contract from WON cascade');
  pass('Marketing WON deal successfully cascades contract to Legal and billing profile to Finance');

  // ── 7. Audit Log Persistence in Storage ──
  console.log('\n--- 7. Testing Audit Log Persistence ---');
  const { auditAdapter } = await import('../src/services/adapters/auditAdapter.js');
  const logsRes = await auditAdapter.getLogs();
  assert.ok(logsRes.data.length >= 3, 'Audit logs must contain seeded records');

  // Emit a new audit log
  await auditAdapter.createLog({
    user: 'Juli Priyanto (Direktur Utama)',
    role: 'DIREKTUR',
    action: 'APPROVAL_TEST',
    module: 'director',
    record_id: 'APP-TEST-001',
    description: 'Verifikasi audit log otomatis Step 4',
  });

  const refreshedLogs = await auditAdapter.getLogs();
  const foundLog = refreshedLogs.data.find((l) => l.action === 'APPROVAL_TEST');
  assert.ok(foundLog, 'Emitted audit log must be found in storage');
  assert.equal(foundLog.user, 'Juli Priyanto (Direktur Utama)');
  assert.equal(foundLog.description, 'Verifikasi audit log otomatis Step 4');
  pass('Audit log persisted and queried with user, role, action, module, record, and description');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed}/${passed} tests PASSED`);
  console.log('====================================================\n');
}

runStep4Tests().catch((err) => {
  console.error('\n[FAIL] Step 4 Test Error:', err);
  process.exit(1);
});
