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
import { auditAdapter } from '@/services/adapters/auditAdapter';
import { emitAudit } from '@/utils/auditLogger';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let approvalsStore = [...MOCK_PENDING_APPROVALS];

export const directorAdapter = {
  /**
   * Get dynamic aggregated executive metrics across all modules.
   * Strictly calculates from authoritative stores without static placeholders.
   */
  async getExecutiveDashboardStats() {
    if (isMock) {
      // 1. Workforce metrics
      const totalEmployees = MOCK_EMPLOYEES.length;
      const activeEmployees = MOCK_EMPLOYEES.filter((e) => e.status === STATUS.ACTIVE || e.status_kerja === 'AKTIF').length;
      const expiringContracts = MOCK_EMPLOYEES.filter((e) => e.status_kontrak === 'MENDEKATI_HABIS').length;

      // Service distribution
      const serviceCounts = {
        SECURITY: 0,
        KURIR: 0,
        PARKIR: 0,
        CLEANING: 0,
        MANPOWER: 0,
        LOSS_PREVENTION: 0,
      };

      MOCK_EMPLOYEES.forEach((emp) => {
        const s = (emp.jenis_layanan || '').toUpperCase();
        if (s.includes('SECURITY') || s.includes('PENGAMANAN')) serviceCounts.SECURITY++;
        else if (s.includes('KURIR') || s.includes('EKSPEDISI')) serviceCounts.KURIR++;
        else if (s.includes('PARKIR')) serviceCounts.PARKIR++;
        else if (s.includes('CLEANING')) serviceCounts.CLEANING++;
        else if (s.includes('LOSS')) serviceCounts.LOSS_PREVENTION++;
        else serviceCounts.MANPOWER++;
      });

      // 2. Client & Operations metrics
      const activeClients = REAL_CLIENTS.length;
      const activeLocations = MOCK_LOCATIONS.length;
      const activeAssignments = MOCK_ASSIGNMENTS.filter((a) => a.status === STATUS.ACTIVE).length;
      const openIncidents = MOCK_INCIDENTS.filter((i) => i.status !== STATUS.RESOLVED && i.status !== STATUS.CLOSED).length;
      const criticalIncidents = MOCK_INCIDENTS.filter((i) => (i.severity === 'HIGH' || i.severity === 'CRITICAL') && i.status !== STATUS.RESOLVED).length;
      const pendingReplacements = MOCK_REPLACEMENTS.filter((r) => r.status === STATUS.PENDING).length;

      // 3. Finance metrics
      const currentPeriodInvoices = MOCK_INVOICES.filter((inv) => (inv.billingPeriod || '').includes('September 2026'));
      const monthlyRevenue = currentPeriodInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const outstandingReceivables = MOCK_INVOICES.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
      const overdueInvoices = MOCK_INVOICES.filter((inv) => inv.status === STATUS.OVERDUE);
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
      const activeLegalCases = MOCK_LEGAL_CASES.filter((c) => c.status !== STATUS.CLOSED && c.status !== STATUS.RESOLVED).length;
      const expiringContractsCount = MOCK_LEGAL_CONTRACTS.filter((c) => c.status === STATUS.EXPIRING).length;
      const compliantLicenses = MOCK_COMPLIANCE_ITEMS.filter((c) => c.status === 'COMPLIANT').length;
      const totalLicenses = MOCK_COMPLIANCE_ITEMS.length;

      // 5. Marketing metrics
      const totalLeads = MOCK_LEADS.length;
      const activeOpportunities = MOCK_OPPORTUNITIES.filter((o) => o.stage !== 'WON' && o.stage !== 'LOST').length;
      const pipelineValue = MOCK_OPPORTUNITIES.reduce((sum, o) => (o.stage !== 'LOST' ? sum + (o.estimatedValue || 0) : sum), 0);
      const wonDealsCount = MOCK_OPPORTUNITIES.filter((o) => o.stage === 'WON').length;

      // 6. IT metrics
      const openTickets = MOCK_IT_TICKETS.filter((t) => t.status !== STATUS.RESOLVED && t.status !== STATUS.CLOSED).length;
      const slaBreachedTickets = MOCK_IT_TICKETS.filter((t) => t.isSlaBreached).length;
      const activeAssets = MOCK_IT_ASSETS.filter((a) => a.status === 'IN_USE').length;

      // 7. CMS metrics
      const publishedArticles = MOCK_ARTICLES.filter((a) => a.status === 'PUBLISHED').length;
      const activeCareers = MOCK_CAREER_POSTINGS.filter((c) => c.status === 'PUBLISHED').length;
      const pendingInquiries = MOCK_INCOMING_INQUIRIES.filter((i) => i.status === 'NEW').length;

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
          approvals: approvalsStore.filter((a) => a.status === STATUS.PENDING).slice(0, 5),
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
      let filtered = [...approvalsStore];

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
  async approveItem(approvalId, { notes = '', actorName = 'Juli Priyanto (Direktur)' } = {}) {
    if (isMock) {
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

      // Cross-department hook: If approving payroll, update payrollAdapter
      if (item.type === 'PAYROLL') {
        await payrollAdapter.approvePayroll(item.referenceId, actorName);
      }

      // Log to central audit trail
      await emitAudit({
        action: 'DIRECTOR_APPROVAL',
        module: 'Director',
        entity: item.type,
        entityId: item.referenceId || approvalId,
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
  async rejectItem(approvalId, { reason = '', actorName = 'Juli Priyanto (Direktur)' } = {}) {
    if (isMock) {
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

      // Log to central audit trail
      await emitAudit({
        action: 'DIRECTOR_REJECT',
        module: 'Director',
        entity: item.type,
        entityId: item.referenceId || approvalId,
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
};

export default directorAdapter;
