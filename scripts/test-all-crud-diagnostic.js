/* eslint-disable no-console */
/**
 * Comprehensive CRUD Diagnostic Suite — PT. BARAK IOMS
 * Tests CREATE, READ, and UPDATE across all 20+ entities and service adapters.
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

async function runDiagnostic() {
  console.log('====================================================');
  console.log('PT. BARAK IOMS — COMPREHENSIVE CRUD DIAGNOSTIC SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const issues = [];

  function test(name, fn) {
    try {
      const res = fn();
      if (res && typeof res.then === 'function') {
        return res.then(() => {
          passed++;
          console.log(`[PASS] ${name}`);
        }).catch((err) => {
          failed++;
          console.error(`[FAIL] ${name} -> ${err.message}`);
          issues.push({ test: name, error: err.message });
        });
      }
      passed++;
      console.log(`[PASS] ${name}`);
    } catch (err) {
      failed++;
      console.error(`[FAIL] ${name} -> ${err.message}`);
      issues.push({ test: name, error: err.message });
    }
  }

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || 'Assertion failed');
  }

  // 1. Client Adapter
  console.log('--- 1. Testing Client Adapter CRUD ---');
  const clientAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/clientAdapter.js')}`)).default;
  let createdClient;
  await test('Client CREATE', async () => {
    const res = await clientAdapter.createClient({
      name: 'PT Mitra Sukses Abadi',
      type: 'Logistik',
      picName: 'Budi Santoso',
      picPhone: '081299990001',
      address: 'Jl. Industri No. 10, Tangerang',
      city: 'Tangerang',
    });
    assert(res.data && res.data.id, 'Client data with id returned');
    assert(res.data.id.startsWith('CLI-'), 'ID prefix is CLI-');
    createdClient = res.data;
  });

  await test('Client READ', async () => {
    const res = await clientAdapter.getClientById(createdClient.id);
    assert(res.data && res.data.name === 'PT Mitra Sukses Abadi', 'Read client matches created data');
  });

  await test('Client UPDATE', async () => {
    const res = await clientAdapter.updateClient(createdClient.id, {
      name: 'PT Mitra Sukses Perkasa',
      picName: 'Budi Santoso, S.T.',
    });
    assert(res.data && res.data.name === 'PT Mitra Sukses Perkasa', 'Updated client name returned');
    // Verify persistence on list
    const list = await clientAdapter.getClients({ search: 'Perkasa' });
    assert(list.data.some(c => c.id === createdClient.id && c.name === 'PT Mitra Sukses Perkasa'), 'Updated client found in list query');
  });

  // 2. Location Adapter
  console.log('\n--- 2. Testing Location Adapter CRUD ---');
  const locationAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/locationAdapter.js')}`)).default;
  let createdLoc;
  await test('Location CREATE', async () => {
    const res = await locationAdapter.createLocation({
      clientId: createdClient.id,
      name: 'Gudang Hub Kosambi',
      address: 'Jl. Raya Salembaran, Kosambi',
      city: 'Kabupaten Tangerang',
      quota: 12,
      picName: 'Ahmad PIC',
      picPhone: '081233334444',
    });
    assert(res.data && res.data.id, 'Location created with ID');
    createdLoc = res.data;
  });

  await test('Location READ & UPDATE', async () => {
    const res = await locationAdapter.updateLocation(createdLoc.id, {
      name: 'Gudang Hub Kosambi Sentral',
      quota: 15,
    });
    assert(res.data && res.data.name === 'Gudang Hub Kosambi Sentral', 'Location updated');
    assert(res.data.quota === 15, 'Location quota updated');
    const locs = await locationAdapter.getLocations({ clientId: createdClient.id });
    assert(locs.data.some(l => l.id === createdLoc.id && l.name === 'Gudang Hub Kosambi Sentral'), 'Updated location found in list');
  });

  // 3. Employee Adapter
  console.log('\n--- 3. Testing Employee Adapter CRUD ---');
  const employeeAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/employeeAdapter.js')}`)).default;
  let createdEmp;
  await test('Employee CREATE', async () => {
    const res = await employeeAdapter.createEmployee({
      nama_lengkap_sesuai_KTP: 'Raden Supriyanto',
      NIK: '3201123456789012',
      jenis_kelamin: 'L',
      departemen: 'Operasional Lapangan',
      jenis_pekerjaan: 'Jasa Pengamanan / Security',
      jenis_layanan: 'security',
      jabatan: 'Danru Pengamanan',
      status_kerja: 'TETAP',
      nomor_telepon: '081298765432',
      penugasan_klien: createdClient.id,
      lokasi_penugasan: createdLoc.id,
    });
    assert(res.data && res.data.id, 'Employee created with ID');
    assert(res.data.id.startsWith('BRK-EMP-'), 'Employee ID prefix is BRK-EMP-');
    createdEmp = res.data;
  });

  await test('Employee READ & UPDATE', async () => {
    const res = await employeeAdapter.updateEmployee(createdEmp.id, {
      nama_lengkap_sesuai_KTP: 'Raden Supriyanto, S.Pd',
      jabatan: 'Chief Security',
    });
    assert(res.data && res.data.nama_lengkap_sesuai_KTP === 'Raden Supriyanto, S.Pd', 'Updated employee name returned');
    assert(res.data.jabatan === 'Chief Security', 'Updated job position returned');
    const list = await employeeAdapter.getEmployees({ search: 'Supriyanto' });
    assert(list.data.some(e => e.id === createdEmp.id && e.jabatan === 'Chief Security'), 'Updated employee found in list');
  });

  // 4. Shift Adapter
  console.log('\n--- 4. Testing Shift Adapter CRUD ---');
  const shiftAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/shiftAdapter.js')}`)).default;
  let createdShift;
  await test('Shift CREATE & UPDATE', async () => {
    const createRes = await shiftAdapter.createShift({
      name: 'Shift Khusus Patroli Malam',
      code: 'PATROLI_MLM',
      startTime: '21:00',
      endTime: '05:00',
      durationHours: 8,
    });
    assert(createRes.data && createRes.data.id, 'Shift created with ID');
    createdShift = createRes.data;

    const updateRes = await shiftAdapter.updateShift(createdShift.id, {
      name: 'Shift Khusus Patroli Subuh',
      startTime: '22:00',
    });
    assert(updateRes.data && updateRes.data.name === 'Shift Khusus Patroli Subuh', 'Shift updated');
  });

  // 5. User Adapter
  console.log('\n--- 5. Testing User Adapter CRUD ---');
  const userAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/userAdapter.js')}`)).default;
  let createdUser;
  await test('User CREATE & UPDATE & RENAME', async () => {
    const createRes = await userAdapter.createUser({
      name: 'Staff Lapangan Diagnostic',
      username: 'diag_staff01',
      email: 'diag.staff@barak.co.id',
      role: 'OPERASIONAL',
      department: 'Operasional Lapangan',
    });
    assert(createRes.data && createRes.data.id, 'User created');
    createdUser = createRes.data;

    const updateRes = await userAdapter.updateUser(createdUser.id, {
      name: 'Staff Lapangan Senior Diagnostic',
      username: 'diag_staff_senior',
    });
    assert(updateRes.data && updateRes.data.username === 'diag_staff_senior', 'User renamed');
    assert(updateRes.data.name === 'Staff Lapangan Senior Diagnostic', 'User name updated');

    const list = await userAdapter.getUsers({ search: 'diag_staff_senior' });
    assert(list.data.some(u => u.username === 'diag_staff_senior'), 'Renamed user found in list');
  });

  // 6. Assignment Adapter
  console.log('\n--- 6. Testing Assignment Adapter CRUD ---');
  const assignmentAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/assignmentAdapter.js')}`)).default;
  let createdAsn;
  await test('Assignment CREATE & UPDATE', async () => {
    const res = await assignmentAdapter.createAssignment({
      employeeId: createdEmp.id,
      employeeName: createdEmp.nama_lengkap_sesuai_KTP,
      clientId: createdClient.id,
      clientName: createdClient.name,
      locationId: createdLoc.id,
      locationName: createdLoc.name,
      serviceType: 'security',
      roleInUnit: 'Chief Security',
      startDate: '2026-10-01',
    });
    assert(res.data && res.data.id, 'Assignment created');
    createdAsn = res.data;

    const updateRes = await assignmentAdapter.updateAssignment(createdAsn.id, {
      roleInUnit: 'Komandan Regu Utama',
    });
    assert(updateRes.data && updateRes.data.roleInUnit === 'Komandan Regu Utama', 'Assignment updated');
  });

  // 7. Incident Adapter
  console.log('\n--- 7. Testing Incident Adapter CRUD ---');
  const incidentAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/incidentAdapter.js')}`)).default;
  let createdInc;
  await test('Incident CREATE & RESOLVE', async () => {
    const createRes = await incidentAdapter.createIncident({
      locationId: createdLoc.id,
      locationName: createdLoc.name,
      clientId: createdClient.id,
      clientName: createdClient.name,
      incidentDate: '2026-10-10',
      title: 'Pintu Gerbang Barat Rusak',
      description: 'Engsel pintu barat patah akibat angin kencang.',
      severity: 'LOW',
    });
    assert(createRes.data && createRes.data.id, 'Incident created');
    createdInc = createRes.data;

    const resolveRes = await incidentAdapter.resolveIncident(createdInc.id, 'Engsel telah dilas kembali oleh teknisi.');
    assert(resolveRes.data && resolveRes.data.status === 'RESOLVED', 'Incident resolved');
  });

  // 8. Replacement Adapter
  console.log('\n--- 8. Testing Replacement Adapter CRUD ---');
  const replacementAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/replacementAdapter.js')}`)).default;
  let createdRepl;
  await test('Replacement CREATE & UPDATE', async () => {
    const createRes = await replacementAdapter.createReplacement({
      employeeId: createdEmp.id,
      employeeName: createdEmp.nama_lengkap_sesuai_KTP,
      clientId: createdClient.id,
      clientName: createdClient.name,
      locationId: createdLoc.id,
      locationName: createdLoc.name,
      reason: 'Cuti Sakit',
      startDate: '2026-10-12',
      endDate: '2026-10-15',
    });
    assert(createRes.data && createRes.data.id, 'Replacement created');
    createdRepl = createRes.data;

    const updateRes = await replacementAdapter.updateReplacement(createdRepl.id, {
      status: 'APPROVED',
      notes: 'Disetujui penggantian oleh Danru',
    });
    assert(updateRes.data && updateRes.data.status === 'APPROVED', 'Replacement updated');
  });

  // 9. Invoice Adapter
  console.log('\n--- 9. Testing Invoice Adapter CRUD ---');
  const invoiceAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/invoiceAdapter.js')}`)).default;
  let createdInv;
  await test('Invoice CREATE & UPDATE & PAYMENT', async () => {
    const createRes = await invoiceAdapter.createInvoice({
      clientId: createdClient.id,
      clientName: createdClient.name,
      periodMonth: 10,
      periodYear: 2026,
      subtotalAmount: 10000000,
      managementFeePercent: 10,
      includePpn: true,
      serviceItems: [
        { description: 'Jasa Pengamanan Posko', quantity: 2, unitPrice: 5000000, total: 10000000 },
      ],
    });
    assert(createRes.data && createRes.data.id, 'Invoice created');
    createdInv = createRes.data;

    const payRes = await invoiceAdapter.recordPayment(createdInv.id, {
      amount: 5000000,
      paymentMethod: 'Bank Transfer (BCA)',
      bankReferenceNumber: 'TRX-BCA-999888',
      paymentDate: '2026-10-11',
    });
    assert(payRes.data && payRes.data.amountPaid >= 5000000, 'Invoice payment recorded');
  });

  // 10. Payroll Adapter
  console.log('\n--- 10. Testing Payroll Adapter CRUD ---');
  const payrollAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/payrollAdapter.js')}`)).default;
  let createdPayroll;
  await test('Payroll CREATE & UPDATE & APPROVE', async () => {
    const createRes = await payrollAdapter.createPayrollPeriod({
      periodMonth: 10,
      periodYear: 2026,
      periodName: 'Oktober 2026 Diagnostic',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    });
    assert(createRes.data && createRes.data.id, 'Payroll period created');
    createdPayroll = createRes.data;

    const updateRes = await payrollAdapter.updatePayrollPeriod(createdPayroll.id, {
      totalEmployees: 40,
      totalGrossAmount: 180000000,
    });
    assert(updateRes.data && updateRes.data.totalEmployees === 40, 'Payroll period updated');

    const approveRes = await payrollAdapter.approvePayroll(createdPayroll.id, {
      approvedBy: 'Juli Priyanto',
      notes: 'Disetujui untuk pencairan',
    });
    assert(approveRes.data && approveRes.data.status === 'APPROVED', 'Payroll approved');
  });

  // 11. COD Adapter
  console.log('\n--- 11. Testing COD Adapter CRUD ---');
  const codAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/codAdapter.js')}`)).default;
  let createdCod;
  await test('COD CREATE & UPDATE & SETTLE', async () => {
    const createRes = await codAdapter.createTransaction({
      trackingNumber: 'BARAK-COD-998877',
      courierId: createdEmp.id,
      courierName: createdEmp.nama_lengkap_sesuai_KTP,
      amount: 450000,
      status: 'COLLECTED',
      recipientName: 'Toko Surya',
    });
    assert(createRes.data && createRes.data.id, 'COD transaction created');
    createdCod = createRes.data;

    const settleRes = await codAdapter.settleTransaction(createdCod.id, {
      settledAmount: 450000,
      notes: 'Uang disetor tunai ke Finance',
    });
    assert(settleRes.data && settleRes.data.status === 'SETTLED', 'COD transaction settled');
  });

  // 12. Contract Adapter
  console.log('\n--- 12. Testing Contract Adapter CRUD ---');
  const contractAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/contractAdapter.js')}`)).default;
  let createdContract;
  await test('Contract CREATE & UPDATE', async () => {
    const createRes = await contractAdapter.createContract({
      clientId: createdClient.id,
      clientName: createdClient.name,
      contractNumber: 'PKS/BRK/2026/X/099',
      title: 'PKS Penyediaan Jasa Security & Kebersihan',
      startDate: '2026-10-01',
      endDate: '2027-10-01',
      contractValue: 120000000,
    });
    assert(createRes.data && createRes.data.id, 'Contract created');
    createdContract = createRes.data;

    const updateRes = await contractAdapter.updateContract(createdContract.id, {
      title: 'PKS Penyediaan Jasa Terpadu Security & Kebersihan',
    });
    assert(updateRes.data && updateRes.data.title.includes('Terpadu'), 'Contract updated');
  });

  // 13. Legal Adapter (Cases & Compliance)
  console.log('\n--- 13. Testing Legal Adapter CRUD ---');
  const legalAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/legalAdapter.js')}`)).default;
  let createdCase;
  let createdComp;
  await test('Legal Case CREATE & UPDATE', async () => {
    const createRes = await legalAdapter.createCase({
      title: 'Sengketa Batas Lahan Gudang',
      clientName: createdClient.name,
      caseType: 'Perdata',
      description: 'Klaim sepihak batas pagar luar.',
      priority: 'MEDIUM',
    });
    assert(createRes.data && createRes.data.id, 'Legal case created');
    createdCase = createRes.data;

    const updateRes = await legalAdapter.updateCase(createdCase.id, {
      status: 'IN_PROGRESS',
      resolutionNotes: 'Mediasi pertama dijadwalkan',
    });
    assert(updateRes.data && updateRes.data.status === 'IN_PROGRESS', 'Legal case updated');
  });

  await test('Legal Compliance CREATE & UPDATE', async () => {
    const createRes = await legalAdapter.createComplianceItem({
      regulationName: 'Sertifikasi KTA Satpam Gada Pratama',
      authority: 'Polda Metro Jaya',
      expiryDate: '2027-12-31',
      status: 'COMPLIANT',
    });
    assert(createRes.data && createRes.data.id, 'Compliance created');
    createdComp = createRes.data;

    const updateRes = await legalAdapter.updateComplianceItem(createdComp.id, {
      notes: 'Dokumen asli tersimpan di brankas Legal',
    });
    assert(updateRes.data && updateRes.data.notes, 'Compliance updated');
  });

  // 14. Marketing Adapter (Leads & Opportunities)
  console.log('\n--- 14. Testing Marketing Adapter CRUD ---');
  const marketingAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/marketingAdapter.js')}`)).default;
  let createdLead;
  let createdOpp;
  await test('Lead CREATE & UPDATE', async () => {
    const createRes = await marketingAdapter.createLead({
      companyName: 'PT Prospek Baru Gemilang',
      contactName: 'Ibu Ratna',
      email: 'ratna@gemilang.co.id',
      phone: '081122334455',
      serviceInterested: 'SECURITY',
      estimatedValue: 50000000,
    });
    assert(createRes.data && createRes.data.id, 'Lead created');
    createdLead = createRes.data;

    const updateRes = await marketingAdapter.updateLead(createdLead.id, {
      contactName: 'Ibu Ratna Sari',
      estimatedValue: 60000000,
    });
    assert(updateRes.data && updateRes.data.contactName === 'Ibu Ratna Sari', 'Lead updated');
  });

  await test('Opportunity CREATE & UPDATE', async () => {
    const createRes = await marketingAdapter.createOpportunity({
      leadId: createdLead.id,
      clientName: 'PT Prospek Baru Gemilang',
      title: 'Tender Pengamanan Fasilitas Pergudangan Gemilang',
      stage: 'PROPOSAL',
      estimatedValue: 60000000,
    });
    assert(createRes.data && createRes.data.id, 'Opportunity created');
    createdOpp = createRes.data;

    const updateRes = await marketingAdapter.updateOpportunity(createdOpp.id, {
      stage: 'NEGOTIATION',
    });
    assert(updateRes.data && updateRes.data.stage === 'NEGOTIATION', 'Opportunity updated');
  });

  // 15. IT Adapter (Tickets, Assets, Maintenance)
  console.log('\n--- 15. Testing IT Adapter CRUD ---');
  const itAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/itAdapter.js')}`)).default;
  let createdTicket;
  let createdAsset;
  let createdMaint;
  await test('IT Ticket CREATE & UPDATE & RESOLVE', async () => {
    const createRes = await itAdapter.createTicket({
      title: 'Koneksi Fingerprint Pos 2 Terputus',
      description: 'Kabel LAN terlepas',
      category: 'HARDWARE',
      priority: 'HIGH',
      reporterName: 'Danru 1',
    });
    assert(createRes.data && createRes.data.id, 'IT ticket created');
    createdTicket = createRes.data;

    const updateRes = await itAdapter.updateTicket(createdTicket.id, {
      status: 'IN_PROGRESS',
      assigneeName: 'Gheril IT',
    });
    assert(updateRes.data && updateRes.data.status === 'IN_PROGRESS', 'IT ticket updated');

    const resolveRes = await itAdapter.resolveTicket(createdTicket.id, 'Kabel LAN telah dikencangkan dan dites ping sukses.');
    assert(resolveRes.data && resolveRes.data.status === 'RESOLVED', 'IT ticket resolved');
  });

  await test('IT Asset CREATE & UPDATE', async () => {
    const createRes = await itAdapter.createAsset({
      assetCode: 'AST-HT-099',
      name: 'Radio HT Baofeng UV-82',
      category: 'COMMUNICATION',
      locationName: createdLoc.name,
      status: 'OPERATIONAL',
    });
    assert(createRes.data && createRes.data.id, 'IT asset created');
    createdAsset = createRes.data;

    const updateRes = await itAdapter.updateAsset(createdAsset.id, {
      name: 'Radio HT Baofeng UV-82 (Unit Cadangan)',
    });
    assert(updateRes.data && updateRes.data.name.includes('Cadangan'), 'IT asset updated');
  });

  await test('IT Maintenance CREATE & UPDATE', async () => {
    const createRes = await itAdapter.createMaintenance({
      assetId: createdAsset.id,
      assetName: createdAsset.name,
      title: 'Pembersihan & Pengecekan Baterai HT Bulanan',
      scheduledDate: '2026-10-25',
    });
    assert(createRes.data && createRes.data.id, 'IT maintenance created');
    createdMaint = createRes.data;

    const updateRes = await itAdapter.updateMaintenance(createdMaint.id, {
      status: 'COMPLETED',
      notes: 'Baterai normal 100%',
    });
    assert(updateRes.data && updateRes.data.status === 'COMPLETED', 'IT maintenance updated');
  });

  // 16. CMS Adapter (Articles, Careers, FAQs, Inquiries)
  console.log('\n--- 16. Testing CMS Adapter CRUD ---');
  const cmsAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/cmsAdapter.js')}`)).default;
  let createdArt;
  let createdCar;
  let createdFaq;
  await test('Article CREATE & UPDATE', async () => {
    const createRes = await cmsAdapter.createArticle({
      title: 'Pelatihan Gabungan Satpam dan Damkar 2026',
      category: 'Berita',
      content: 'PT. BARAK menyelenggarakan simulasi evakuasi darurat...',
      author: 'Admin Website',
      status: 'PUBLISHED',
    });
    assert(createRes.data && createRes.data.id, 'Article created');
    createdArt = createRes.data;

    const updateRes = await cmsAdapter.updateArticle(createdArt.id, {
      title: 'Pelatihan Gabungan Satpam, SAR dan Damkar 2026',
    });
    assert(updateRes.data && updateRes.data.title.includes('SAR'), 'Article updated');
  });

  await test('Career CREATE & UPDATE', async () => {
    const createRes = await cmsAdapter.createCareer({
      title: 'Koordinator Lapangan Operasional',
      department: 'Operasional',
      location: 'Tangerang',
      type: 'Penuh Waktu',
      description: 'Memimpin koordinasi posko...',
    });
    assert(createRes.data && createRes.data.id, 'Career created');
    createdCar = createRes.data;

    const updateRes = await cmsAdapter.updateCareer(createdCar.id, {
      title: 'Senior Koordinator Lapangan Operasional',
    });
    assert(updateRes.data && updateRes.data.title.startsWith('Senior'), 'Career updated');
  });

  await test('FAQ CREATE & UPDATE', async () => {
    const createRes = await cmsAdapter.createFaq({
      question: 'Berapa jumlah personil minimal penempatan posko?',
      answer: 'Jumlah personil minimal disesuaikan dengan luas area...',
      category: 'Layanan',
    });
    assert(createRes.data && createRes.data.id, 'FAQ created');
    createdFaq = createRes.data;

    const updateRes = await cmsAdapter.updateFaq(createdFaq.id, {
      answer: 'Jumlah personil minimal adalah 4 orang per posko 24 jam.',
    });
    assert(updateRes.data && updateRes.data.answer.includes('4 orang'), 'FAQ updated');
  });

  // 17. Applicant Adapter
  console.log('\n--- 17. Testing Applicant Adapter CRUD ---');
  const applicantAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/applicantAdapter.js')}`)).default;
  let createdApp;
  await test('Applicant CREATE & UPDATE', async () => {
    const createRes = await applicantAdapter.createApplicant({
      nama_lengkap: 'Bambang Irawan',
      nik: '3201555566667777',
      no_telepon: '081344445555',
      email: 'bambang.irawan@gmail.com',
      posisi_dilamar: 'Anggota Security',
      jenis_kelamin: 'L',
    });
    assert(createRes.data && createRes.data.id, 'Applicant created');
    createdApp = createRes.data;

    const updateRes = await applicantAdapter.updateApplicant(createdApp.id, {
      posisi_dilamar: 'Komandan Regu Security',
      catatan_interview: 'Pengalaman 5 tahun di mall komersial',
    });
    assert(updateRes.data && updateRes.data.posisi_dilamar === 'Komandan Regu Security', 'Applicant updated');
  });

  // 18. PIC Activity Report & Field Report Adapters
  console.log('\n--- 18. Testing PIC Activity & Field Report Adapters CRUD ---');
  const picAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/picActivityReportAdapter.js')}`)).default;
  const fieldAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/fieldReportAdapter.js')}`)).default;
  let createdPicRep;
  let createdFieldRep;
  await test('PIC Activity Report CREATE & UPDATE', async () => {
    const createRes = await picAdapter.createReport({
      clientId: createdClient.id,
      clientName: createdClient.name,
      locationId: createdLoc.id,
      locationName: createdLoc.name,
      title: 'Briefing Serah Terima Posko Pagi',
      description: 'Pengecekan perlengkapan body vest, tongkat, dan radio HT.',
      activityDate: '2026-10-11',
    });
    assert(createRes.data && createRes.data.id, 'PIC report created');
    createdPicRep = createRes.data;

    const updateRes = await picAdapter.updateReport(createdPicRep.id, {
      title: 'Briefing Serah Terima Posko Pagi & Apel Kedisiplinan',
    });
    assert(updateRes.data && updateRes.data.title.includes('Apel'), 'PIC report updated');
  });

  await test('Field Report CREATE & UPDATE', async () => {
    const createRes = await fieldAdapter.createReport({
      clientId: createdClient.id,
      clientName: createdClient.name,
      locationId: createdLoc.id,
      locationName: createdLoc.name,
      shift: 'Pagi',
      supervisorName: 'Nazi Rinaldi',
      notes: 'Situasi posko aman kondusif',
    });
    assert(createRes.data && createRes.data.id, 'Field report created');
    createdFieldRep = createRes.data;

    const updateRes = await fieldAdapter.updateReport(createdFieldRep.id, {
      notes: 'Situasi posko aman kondusif, seluruh CCTV berfungsi normal.',
    });
    assert(updateRes.data && updateRes.data.notes.includes('CCTV'), 'Field report updated');
  });

  // 19. Director Approval Adapter
  console.log('\n--- 19. Testing Director Approval Adapter ---');
  const directorAdapter = (await import(`file://${path.join(rootDir, 'src/services/adapters/directorAdapter.js')}`)).default;
  await test('Director Approval List & Action', async () => {
    const approvalsRes = await directorAdapter.getPendingApprovals();
    assert(approvalsRes.data && Array.isArray(approvalsRes.data), 'Pending approvals returned as array');
    if (approvalsRes.data.length > 0) {
      const firstAppr = approvalsRes.data[0];
      const actRes = await directorAdapter.approveItem(firstAppr.id, { notes: 'Approved by Director Diagnostic' });
      assert(actRes.data && actRes.data.status === 'APPROVED', 'Approval item approved');
    }
  });

  console.log('\n====================================================');
  console.log(`DIAGNOSTIC SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (issues.length > 0) {
    console.log('\nISSUES FOUND:');
    issues.forEach((iss, idx) => {
      console.log(`${idx + 1}. [${iss.test}]: ${iss.error}`);
    });
  } else {
    console.log('All adapter CRUD methods executed with 100% success!');
  }
}

runDiagnostic();
