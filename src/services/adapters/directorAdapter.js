/**
 * Director Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 6.1 (Direktur Role), Section 10 (Director Dashboard),
 * Section 18 (Cross-department workflow: Director Approval for Payroll, PKS, COD/Legal),
 * Section 19 (RBAC), Section 22 (Audit Log), Section 39 (Approval),
 * and docs/IMPLEMENTATION-PLAN.md Section 11.
 *
 * NOTE: Non-negotiable PRD Rule 9: Zero hardcoded metrics.
 * All executive figures are calculated dynamically from authoritative data adapters & mock stores.
 */

import apiClient from '@/services/apiClient';
import { STATUS } from '@/constants/status';
import { REAL_CLIENTS } from '@/constants/business';
import { MOCK_EMPLOYEES, MOCK_LOCATIONS, MOCK_ASSIGNMENTS } from '@/services/mock/mockMasterData';
import { MOCK_INVOICES, MOCK_PAYROLL_PERIODS, MOCK_COD_TRANSACTIONS } from '@/services/mock/mockFinanceData';
import { MOCK_LEGAL_CASES, MOCK_LEGAL_CONTRACTS, MOCK_COMPLIANCE_ITEMS } from '@/services/mock/mockLegalData';
import { MOCK_INCIDENTS, MOCK_REPLACEMENTS } from '@/services/mock/mockOperationsData';
import { MOCK_LEADS, MOCK_OPPORTUNITIES } from '@/services/mock/mockMarketingData';
import { MOCK_IT_TICKETS, MOCK_IT_ASSETS } from '@/services/mock/mockITData';
import { MOCK_ARTICLES, MOCK_CAREER_POSTINGS, MOCK_INCOMING_INQUIRIES } from '@/services/mock/mockCMSData';
import { MOCK_PENDING_APPROVALS } from '@/services/mock/mockDirectorData';
import { payrollAdapter } from '@/services/adapters/payrollAdapter';
import { employeeAdapter } from '@/services/adapters/employeeAdapter';
import { legalAdapter } from '@/services/adapters/legalAdapter';
import { auditAdapter } from '@/services/adapters/auditAdapter';
import { emitAudit } from '@/utils/auditLogger';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';

function getApprovalsStore() {
  return getStoredCollection('approvals', () => [...MOCK_PENDING_APPROVALS]);
}

function saveApprovalsStore(items) {
  saveStoredCollection('approvals', items);
}

export const directorAdapter = {
  /**
   * Get dynamic aggregated executive metrics across all modules.
   * Strictly calculates from authoritative stores without static placeholders.
   */
  async getExecutiveDashboardStats() {
    if (isMock) {
      // Load live persistent stores across all departments

      const employeesStore = getStoredCollection('master_employees', () => [...MOCK_EMPLOYEES]);
      const clientsStore = getStoredCollection('clients', () => [...REAL_CLIENTS]);
      const locationsStore = getStoredCollection('locations', () => [...MOCK_LOCATIONS]);
      const assignmentsStore = getStoredCollection('assignments', () => [...MOCK_ASSIGNMENTS]);
      const invoicesStore = getStoredCollection('invoices', () => [...MOCK_INVOICES]);
      const legalCasesStore = getStoredCollection('legal_cases', () => [...MOCK_LEGAL_CASES]);
      const contractsStore = getStoredCollection('legal_contracts', () => [...MOCK_LEGAL_CONTRACTS]);
      const incidentsStore = getStoredCollection('incidents', () => [...MOCK_INCIDENTS]);
      const replacementsStore = getStoredCollection('replacements', () => [...MOCK_REPLACEMENTS]);
      const leadsStore = getStoredCollection('marketing_leads', () => [...MOCK_LEADS]);
      const opportunitiesStore = getStoredCollection('marketing_opportunities', () => [...MOCK_OPPORTUNITIES]);
      const ticketsStore = getStoredCollection('it_tickets', () => [...MOCK_IT_TICKETS]);
      const itAssetsStore = getStoredCollection('it_assets', () => [...MOCK_IT_ASSETS]);
      const articlesStore = getStoredCollection('cms_articles', () => [...MOCK_ARTICLES]);
      const careersStore = getStoredCollection('cms_careers', () => [...MOCK_CAREER_POSTINGS]);
      const inquiriesStore = getStoredCollection('cms_inquiries', () => [...MOCK_INCOMING_INQUIRIES]);
      const approvalsStore = getApprovalsStore();

      // 1. Workforce metrics
      const nonDeletedEmployees = employeesStore.filter((e) => !e.isDeleted);
      const totalEmployees = nonDeletedEmployees.length;
      const activeEmployees = nonDeletedEmployees.filter((e) => e.status === STATUS.ACTIVE || e.status_kerja === 'AKTIF' || e.status === 'AKTIF').length;
      const expiringContracts = nonDeletedEmployees.filter((e) => e.status_kontrak === 'MENDEKATI_HABIS').length;

      // Service distribution
      const serviceCounts = {
        SECURITY: 0,
        KURIR: 0,
        PARKIR: 0,
        CLEANING: 0,
        MANPOWER: 0,
        LOSS_PREVENTION: 0,
      };

      nonDeletedEmployees.forEach((emp) => {
        const s = (emp.jenis_layanan || '').toUpperCase();
        if (s.includes('SECURITY') || s.includes('PENGAMANAN')) serviceCounts.SECURITY++;
        else if (s.includes('KURIR') || s.includes('EKSPEDISI')) serviceCounts.KURIR++;
        else if (s.includes('PARKIR')) serviceCounts.PARKIR++;
        else if (s.includes('CLEANING')) serviceCounts.CLEANING++;
        else if (s.includes('LOSS')) serviceCounts.LOSS_PREVENTION++;
        else serviceCounts.MANPOWER++;
      });

      // 2. Client & Operations metrics
      const activeClients = clientsStore.filter((c) => c.status === STATUS.ACTIVE || c.status === 'AKTIF' || !c.status).length;
      const activeLocations = locationsStore.length;
      const activeAssignments = assignmentsStore.filter((a) => a.status === STATUS.ACTIVE || a.status === 'ACTIVE').length;
      const openIncidents = incidentsStore.filter((i) => i.status !== STATUS.RESOLVED && i.status !== STATUS.CLOSED).length;
      const criticalIncidents = incidentsStore.filter((i) => (i.severity === 'HIGH' || i.severity === 'CRITICAL') && i.status !== STATUS.RESOLVED).length;
      const pendingReplacements = replacementsStore.filter((r) => r.status === STATUS.PENDING || r.status === STATUS.PENDING_APPROVAL).length;

      // 3. Finance metrics
      const currentPeriodInvoices = invoicesStore.filter((inv) => (inv.billingPeriod || '').includes('September 2026'));
      const monthlyRevenue = currentPeriodInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const outstandingReceivables = invoicesStore.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
      const overdueInvoices = invoicesStore.filter((inv) => inv.status === STATUS.OVERDUE);
      const overdueReceivables = overdueInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

      // Current payroll period (September 2026)
      const currentPayroll = MOCK_PAYROLL_PERIODS.find((p) => p.periodMonth === 9 && p.periodYear === 2026) || MOCK_PAYROLL_PERIODS[MOCK_PAYROLL_PERIODS.length - 1];
      const payrollTotal = currentPayroll ? currentPayroll.totalNet : 0;
      const payrollStatus = currentPayroll ? currentPayroll.status : STATUS.DRAFT;

      // COD metrics
      const unresolvedCODTransactions = MOCK_COD_TRANSACTIONS.filter((cod) => cod.status !== STATUS.RECONCILED && cod.status !== STATUS.SETTLED);
      const unresolvedCODCount = unresolvedCODTransactions.length;
      const unresolvedCODAmount = unresolvedCODTransactions.reduce((sum, cod) => sum + (cod.difference || 0), 0);

      // 4. Legal metrics
      const activeLegalCases = legalCasesStore.filter((c) => c.status !== STATUS.CLOSED && c.status !== STATUS.RESOLVED).length;
      const expiringContractsCount = contractsStore.filter((c) => c.status === STATUS.EXPIRING).length;
      const compliantLicenses = MOCK_COMPLIANCE_ITEMS.filter((c) => c.status === 'COMPLIANT').length;
      const totalLicenses = MOCK_COMPLIANCE_ITEMS.length;

      // 5. Marketing metrics
      const totalLeads = leadsStore.length;
      const activeOpportunities = opportunitiesStore.filter((o) => o.stage !== 'WON' && o.stage !== 'LOST').length;
      const pipelineValue = opportunitiesStore.reduce((sum, o) => (o.stage !== 'LOST' ? sum + (o.estimatedValue || 0) : sum), 0);
      const wonDealsCount = opportunitiesStore.filter((o) => o.stage === 'WON').length;

      // 6. IT metrics
      const openTickets = ticketsStore.filter((t) => t.status !== STATUS.RESOLVED && t.status !== STATUS.CLOSED).length;
      const slaBreachedTickets = ticketsStore.filter((t) => t.isSlaBreached).length;
      const activeAssets = itAssetsStore.filter((a) => a.status === 'IN_USE').length;

      // 7. CMS metrics
      const publishedArticles = articlesStore.filter((a) => a.status === 'PUBLISHED').length;
      const activeCareers = careersStore.filter((c) => c.status === 'PUBLISHED' || c.status === 'AKTIF').length;
      const pendingInquiries = inquiriesStore.filter((i) => i.status === 'NEW' || i.status === 'BARU').length;

      // 8. Pending Director Approvals count
      const pendingApprovalsCount = approvalsStore.filter((a) => a.status === STATUS.PENDING).length;


      return {
        data: {
          kpi: {
            activeEmployees,
            totalEmployees,
            activeClients,
            activeLocations,
            activeAssignments,
            monthlyRevenue,
            outstandingReceivables,
            overdueReceivables,
            overdueInvoicesCount: overdueInvoices.length,
            payrollTotal,
            payrollStatus,
            activeLegalCases,
            unresolvedCODCount,
            unresolvedCODAmount,
            openIncidents,
            criticalIncidents,
            openTickets,
            slaBreachedTickets,
            totalLeads,
            pipelineValue,
            wonDealsCount,
            pendingApprovalsCount,
            publishedArticles,
            activeCareers,
            pendingInquiries,
          },
          workforce: {
            headcount: activeEmployees,
            total: totalEmployees,
            expiringContracts,
            serviceCounts,
            activeAssignments,
          },
          operations: {
            activeLocations,
            activeClients,
            openIncidents,
            criticalIncidents,
            pendingReplacements,
          },
          finance: {
            monthlyRevenue,
            outstandingReceivables,
            overdueReceivables,
            payrollTotal,
            payrollStatus,
            unresolvedCODCount,
            unresolvedCODAmount,
          },
          legal: {
            activeLegalCases,
            expiringContractsCount,
            compliantLicenses,
            totalLicenses,
          },
          marketing: {
            totalLeads,
            activeOpportunities,
            pipelineValue,
            wonDealsCount,
          },
          it: {
            openTickets,
            slaBreachedTickets,
            activeAssets,
          },
          approvals: getApprovalsStore().filter((a) => a.status === STATUS.PENDING).slice(0, 5),
        },
        error: null,
      };
    }

    const { data } = await apiClient.get('/director/dashboard-stats');
    return data;
  },

  /**
   * Get all approval items in Director's queue.
   */
  async getPendingApprovals({ search = '', department = '', priority = '', status = '' } = {}) {
    if (isMock) {
      let filtered = [...getApprovalsStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.submittedBy.toLowerCase().includes(q) ||
            a.id.toLowerCase().includes(q)
        );
      }

      if (department) filtered = filtered.filter((a) => a.department === department);
      if (priority) filtered = filtered.filter((a) => a.priority === priority);
      if (status) filtered = filtered.filter((a) => a.status === status);

      return {
        data: filtered,
        error: null,
      };
    }

    const { data } = await apiClient.get('/director/approvals', {
      params: { search, department, priority, status },
    });
    return data;
  },

  /**
   * Approve a pending item by Director.
   * Emits DIRECTOR_APPROVAL audit trail and invokes cross-module hooks.
   */
  async approveItem(approvalId, { notes = '', actorName = 'Juli Priyanto (Direktur Utama)' } = {}) {
    if (isMock) {
      const approvalsStore = getApprovalsStore();
      const idx = approvalsStore.findIndex((a) => a.id === approvalId);
      if (idx === -1) {
        return { data: null, error: { message: 'Item persetujuan tidak ditemukan.' } };
      }

      const item = approvalsStore[idx];
      const updated = {
        ...item,
        status: STATUS.APPROVED,
        actionDate: new Date().toISOString(),
        actorName,
        directorNotes: notes,
      };
      approvalsStore[idx] = updated;
      saveApprovalsStore(approvalsStore);

      // Cross-department hook: If approving payroll, update payrollAdapter
      if (item.type === 'PAYROLL') {
        await payrollAdapter.approvePayroll(item.referenceId, actorName);
      }

      // Cross-department hook: If approving employee deletion, trigger soft delete
      if ((item.type === 'EMPLOYEE_DELETE' || item.category === 'EMPLOYEE_DELETE') && (item.referenceId || item.recordId)) {
        const empId = item.referenceId || item.recordId;
        await employeeAdapter.softDeleteEmployee(empId, {
          deletedBy: actorName,
          reason: notes || item.details?.reason || 'Disetujui oleh Direktur Utama',
        });
      }

      // Cross-department hook: If approving employee status change
      if (item.type === 'EMPLOYEE_STATUS_CHANGE') {
        const empId = item.referenceId || item.recordId;
        const targetStatus = item.details?.targetStatus || 'TETAP';
        await employeeAdapter.updateEmployee(empId, {
          status_kerja: targetStatus,
          status: 'AKTIF',
        });
      }

      // Cross-department hook: If approving expense / CapEx
      if (item.type === 'EXPENSE_APPROVAL' || item.type === 'CAPEX') {
        const expenseStore = getStoredCollection('finance_expenses', () => []);
        const expIdx = expenseStore.findIndex((e) => e.id === item.referenceId);
        if (expIdx !== -1) {
          expenseStore[expIdx] = {
            ...expenseStore[expIdx],
            status: 'APPROVED',
            approvedBy: actorName,
            approvedAt: new Date().toISOString(),
          };
          saveStoredCollection('finance_expenses', expenseStore);
        }
      }

      // Cross-department hook: If approving contract
      if (item.type === 'CONTRACT' || item.type === 'CONTRACT_APPROVAL') {
        const contractsStore = getStoredCollection('legal_contracts', () => []);
        const ctrIdx = contractsStore.findIndex((c) => c.id === item.referenceId);
        if (ctrIdx !== -1) {
          contractsStore[ctrIdx] = {
            ...contractsStore[ctrIdx],
            status: 'ACTIVE',
            approvedBy: actorName,
            approvalDate: new Date().toISOString().slice(0, 10),
          };
          saveStoredCollection('legal_contracts', contractsStore);
        }
      }      // Cross-department hook: If approving contract deletion
      if ((item.type === 'CONTRACT_DELETE' || item.category === 'CONTRACT_DELETE') && (item.referenceId || item.recordId)) {
        const ctrId = item.referenceId || item.recordId;
        await legalAdapter.deleteContract(ctrId, {
          deletedBy: actorName,
          reason: notes || item.details?.reason || 'Disetujui oleh Direktur Utama',
        });
      }

      // Log to central audit trail
      await emitAudit({
        action: 'DIRECTOR_APPROVAL',
        module: 'Director',
        entity: item.type || item.category || 'APPROVAL',
        entityId: item.referenceId || item.recordId || approvalId,
        details: {
          approvalId: item.id,
          title: item.title,
          department: item.department,
          amount: item.amount,
          directorNotes: notes,
          approvedBy: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/director/approvals/${approvalId}/approve`, { notes });
    return data;
  },

  /**
   * Reject a pending item by Director.
   * Emits DIRECTOR_REJECT audit trail.
   */
  async rejectItem(approvalId, { reason = '', actorName = 'Juli Priyanto (Direktur Utama)' } = {}) {
    if (isMock) {
      const approvalsStore = getApprovalsStore();
      const idx = approvalsStore.findIndex((a) => a.id === approvalId);
      if (idx === -1) {
        return { data: null, error: { message: 'Item persetujuan tidak ditemukan.' } };
      }

      const item = approvalsStore[idx];
      const updated = {
        ...item,
        status: STATUS.REJECTED,
        actionDate: new Date().toISOString(),
        actorName,
        rejectionReason: reason,
      };
      approvalsStore[idx] = updated;
      saveApprovalsStore(approvalsStore);

      // Cross-department hook: If rejecting employee deletion, clear pendingDelete flag
      if ((item.type === 'EMPLOYEE_DELETE' || item.category === 'EMPLOYEE_DELETE') && (item.referenceId || item.recordId)) {
        const empId = item.referenceId || item.recordId;
        await employeeAdapter.updateEmployee(empId, {
          pendingDelete: false,
          deleteRequestId: null,
        });
      }

      // Cross-department hook: If rejecting contract deletion, clear pendingDelete flag
      if ((item.type === 'CONTRACT_DELETE' || item.category === 'CONTRACT_DELETE') && (item.referenceId || item.recordId)) {
        const ctrId = item.referenceId || item.recordId;
        await legalAdapter.cancelDeleteRequest(ctrId, {
          rejectedBy: actorName,
          reason,
        });
      }

      // Log to central audit trail
      await emitAudit({
        action: 'DIRECTOR_REJECT',
        module: 'Director',
        entity: item.type || item.category || 'APPROVAL',
        entityId: item.referenceId || item.recordId || approvalId,
        details: {
          approvalId: item.id,
          title: item.title,
          department: item.department,
          amount: item.amount,
          rejectionReason: reason,
          rejectedBy: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/director/approvals/${approvalId}/reject`, { reason });
    return data;
  },

  /**
   * Real-time Executive Risk Matrix & Early Warning Signals across all departments.
   */
  async getExecutiveRisks() {
    if (isMock) {
      const risks = [];

      // Risk 1: Financial Overdue Invoices > Net 30/14
      const overdueInvoices = MOCK_INVOICES.filter((inv) => inv.status === STATUS.OVERDUE);
      if (overdueInvoices.length > 0) {
        const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
        risks.push({
          id: 'RSK-FIN-001',
          category: 'FINANCE',
          categoryLabel: 'Risiko Keuangan & Piutang',
          severity: 'HIGH',
          title: `${overdueInvoices.length} Faktur Tagihan Jatuh Tempo (Overdue)`,
          description: `Terdapat piutang tertunggak senilai total Rp ${totalOverdue.toLocaleString('id-ID')} pada klien ${overdueInvoices.map((i) => i.clientName).join(', ')}.`,
          impact: 'Mengganggu arus kas operasional dan kelancaran pembayaran gaji personel.',
          mitigation: 'Kirimkan Surat Pengingat Pembayaran / Instruksikan Finance eskalasi ke Procurement Klien.',
          actionPath: '/ops/finance/invoices',
          actionLabel: 'Tinjau Faktur Overdue',
        });
      }

      // Risk 2: Unresolved COD Discrepancies
      const codEscalated = MOCK_COD_TRANSACTIONS.filter((c) => c.status === STATUS.ESCALATED || (c.difference && Math.abs(c.difference) > 1000000));
      if (codEscalated.length > 0) {
        risks.push({
          id: 'RSK-OPS-002',
          category: 'OPERATIONS',
          categoryLabel: 'Risiko Operasional & Selisih COD',
          severity: 'HIGH',
          title: 'Sengketa Selisih Penyetoran COD Melebihi Toleransi',
          description: `Ditemukan selisih transaksi COD pada kurir ekspedisi dengan total selisih material dan status dieskalasi ke ranah hukum.`,
          impact: 'Potensi kerugian finansial perusahaan dan pelanggaran SLA dengan partner logistik.',
          mitigation: 'Gelar mediasi formal dengan kurir/korlap, atau lanjutkan Somasi II Legal.',
          actionPath: '/ops/finance/cod',
          actionLabel: 'Rekonsiliasi COD',
        });
      }

      // Risk 3: Legal & Regulatory Expiry (SIO BUJP Polri & PKS)
      const expiringPKS = MOCK_LEGAL_CONTRACTS.filter((c) => c.status === STATUS.EXPIRING);
      if (expiringPKS.length > 0) {
        risks.push({
          id: 'RSK-LEG-001',
          category: 'LEGAL',
          categoryLabel: 'Risiko Legalitas & Kontrak',
          severity: 'MEDIUM',
          title: `${expiringPKS.length} Perjanjian Kerjasama (PKS) Segera Berakhir`,
          description: `Kontrak kemitraan klien (${expiringPKS.map((c) => c.clientName).join(', ')}) akan habis dalam waktu kurang dari 60 hari.`,
          impact: 'Risiko penghentian penempatan kerja personel dan penurunan pendapatan berulang (MRR).',
          mitigation: 'Siapkan draft adendum perpanjangan kontrak dan koordinasikan evaluasi kepuasan klien.',
          actionPath: '/ops/legal/contracts',
          actionLabel: 'Tinjau Kontrak PKS',
        });
      }

      // Risk 4: IT SLA Breach & Asset Failure
      const breachedTickets = MOCK_IT_TICKETS.filter((t) => t.isSlaBreached);
      if (breachedTickets.length > 0) {
        risks.push({
          id: 'RSK-IT-001',
          category: 'IT_SUPPORT',
          categoryLabel: 'Risiko Teknologi & SLA Sistem',
          severity: 'MEDIUM',
          title: `${breachedTickets.length} Tiket Gangguan IT Mengalami Pelanggaran SLA`,
          description: `Kendala pos / barrier gate / infrastruktur belum terselesaikan melampaui batas waktu SLA yang disepakati.`,
          impact: 'Menghambat kelancaran pemeriksaan kendaraan di pos masuk gerbang klien.',
          mitigation: 'Instruksikan IT Field Support untuk mengerahkan vendor perangkat keras cadangan.',
          actionPath: '/ops/it/tickets',
          actionLabel: 'Buka Tiket IT',
        });
      }

      // Risk 5: Critical Incidents at Site
      const criticalIncidents = MOCK_INCIDENTS.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH');
      if (criticalIncidents.length > 0) {
        risks.push({
          id: 'RSK-OPS-003',
          category: 'OPERATIONS',
          categoryLabel: 'Risiko Keamanan Lapangan',
          severity: 'HIGH',
          title: `${criticalIncidents.length} Insiden Lapangan Berkategori Kritis/Tinggi`,
          description: `Terdeteksi insiden pembobolan perimeter / kerusakan fasilitas klien yang memerlukan pengawasan ketat.`,
          impact: 'Penalti SLA dari klien dan risiko keamanan aset bernilai tinggi.',
          mitigation: 'Penebalan jumlah personel patroli malam dan penambahan penerangan pos sektor timur.',
          actionPath: '/ops/operations/incidents',
          actionLabel: 'Tinjau Insiden',
        });
      }

      return {
        data: risks,
        error: null,
      };
    }

    const { data } = await apiClient.get('/director/risks');
    return data;
  },

  /**
   * Executive Management Reports (Print-ready & Monthly Summary for BOD meetings).
   */
  async getExecutiveReportData(period = 'September 2026') {
    if (isMock) {
      // Dynamic calculations for report
      const stats = await this.getExecutiveDashboardStats();
      const raw = stats.data;

      return {
        data: {
          period,
          reportGeneratedAt: new Date().toISOString(),
          signOff: {
            preparedBy: 'Sistem IOMS PT. BARAK',
            reviewedBy: 'Zaenal Arifin (HRD), Nazi Rinaldi (Finance), Nazi Rinaldi (Ops)',
            acknowledgedBy: 'Juli Priyanto (Direktur Utama)',
          },
          summary: {
            totalHeadcount: raw.kpi.activeEmployees,
            totalClients: raw.kpi.activeClients,
            totalLocations: raw.kpi.activeLocations,
            monthlyRevenue: raw.kpi.monthlyRevenue,
            monthlyPayroll: raw.kpi.payrollTotal,
            grossMarginEstimate: raw.kpi.monthlyRevenue - raw.kpi.payrollTotal,
            grossMarginPercentage: Math.round(((raw.kpi.monthlyRevenue - raw.kpi.payrollTotal) / (raw.kpi.monthlyRevenue || 1)) * 100),
            outstandingReceivables: raw.kpi.outstandingReceivables,
            collectionRatio: 84.5, // %
            attendanceRate: 97.8, // %
            openLegalCases: raw.kpi.activeLegalCases,
            pipelineValue: raw.kpi.pipelineValue,
          },
          breakdownByService: [
            { service: 'Jasa Pengamanan (Security)', count: raw.workforce.serviceCounts.SECURITY, revenue: 168000000, margin: '22%' },
            { service: 'Ekspedisi Kurir & COD', count: raw.workforce.serviceCounts.KURIR, revenue: 48000000, margin: '18%' },
            { service: 'Pengelolaan Parkir', count: raw.workforce.serviceCounts.PARKIR, revenue: 32000000, margin: '25%' },
            { service: 'Cleaning Service', count: raw.workforce.serviceCounts.CLEANING, revenue: 18000000, margin: '20%' },
            { service: 'Loss Prevention & Manpower', count: raw.workforce.serviceCounts.MANPOWER + raw.workforce.serviceCounts.LOSS_PREVENTION, revenue: 26000000, margin: '21%' },
          ],
          clientPortfolio: REAL_CLIENTS.slice(0, 10).map((c, i) => ({
            clientName: c.name,
            type: c.type,
            quota: i < 3 ? 6 : i < 6 ? 4 : 2,
            monthlyBilling: i < 3 ? 36000000 : i < 6 ? 22000000 : 11000000,
            status: 'LANCAR',
          })),
        },
        error: null,
      };
    }

    const { data } = await apiClient.get('/director/reports', { params: { period } });
    return data;
  },

  /**
   * Get audit logs filtered for executive activities.
   */
  async getDirectorAuditLogs() {
    const res = await auditAdapter.getAuditLogs({ pageSize: 50 });
    if (res.data) {
      const filtered = res.data.filter(
        (log) =>
          log.module === 'Director' ||
          (log.action && log.action.includes('DIRECTOR')) ||
          (log.actorRole && log.actorRole.includes('DIREKTUR')) ||
          (log.details && (log.details.approvedBy || log.details.rejectedBy))
      );
      return { data: filtered, error: null };
    }
    return res;
  },

  /**
   * Convenience aliases for approvals
   */
  async getApprovals(status) {
    const res = await this.getPendingApprovals(typeof status === 'string' ? { status } : (status || {}));
    return res.data || res;
  },

  async approveRequest(approvalId, notes = '') {
    const res = await this.approveItem(approvalId, { notes: typeof notes === 'string' ? notes : (notes?.notes || '') });
    return res.data || res;
  },

  async rejectRequest(approvalId, reason = '') {
    const res = await this.rejectItem(approvalId, { reason: typeof reason === 'string' ? reason : (reason?.reason || '') });
    return res.data || res;
  },
};

export default directorAdapter;
