/**
 * Payroll Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 14 (Payroll Module) & Section 18 (Cross-department workflow: Payroll Approval).
 */

import apiClient from '@/services/apiClient';
import { MOCK_PAYROLL_PERIODS, MOCK_PAYROLL_ITEMS_SEP } from '@/services/mock/mockFinanceData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let periodsStore = [...MOCK_PAYROLL_PERIODS];
let itemsStore = [...MOCK_PAYROLL_ITEMS_SEP];

export const payrollAdapter = {
  async getPayrollPeriods() {
    if (isMock) {
      return { data: [...periodsStore], error: null };
    }
    const { data } = await apiClient.get('/payroll');
    return data;
  },

  async getPayrollPeriodById(periodId) {
    if (isMock) {
      const p = periodsStore.find((period) => period.id === periodId);
      if (!p) return { data: null, error: { message: 'Periode payroll tidak ditemukan.' } };
      return { data: { ...p }, error: null };
    }
    const { data } = await apiClient.get(`/payroll/${periodId}`);
    return data;
  },

  async getPayrollItems(periodId, { search = '', position = '' } = {}) {
    if (isMock) {
      let filtered = [...itemsStore];
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.employeeName.toLowerCase().includes(q) ||
            item.nik.toLowerCase().includes(q) ||
            item.position?.toLowerCase().includes(q)
        );
      }
      if (position) {
        filtered = filtered.filter((item) => item.position?.toLowerCase().includes(position.toLowerCase()));
      }

      return { data: filtered, error: null };
    }
    const { data } = await apiClient.get(`/payroll/${periodId}/items`, { params: { search, position } });
    return data;
  },

  async submitToDirector(periodId, actorName = 'Siti Rahma (Finance)') {
    if (isMock) {
      const idx = periodsStore.findIndex((p) => p.id === periodId);
      if (idx === -1) return { data: null, error: { message: 'Periode tidak ditemukan.' } };

      const updated = {
        ...periodsStore[idx],
        status: STATUS.PENDING_APPROVAL,
        reviewedByFinance: actorName,
        reviewedByFinanceAt: new Date().toISOString(),
      };
      periodsStore[idx] = updated;

      await emitAudit({
        action: 'PAYROLL_FINANCE_SUBMIT',
        module: 'Finance',
        entity: 'PayrollPeriod',
        entityId: periodId,
        details: {
          period: updated.periodLabel,
          totalNet: updated.totalNet,
          reviewedBy: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/payroll/${periodId}/submit-director`);
    return data;
  },

  async approvePayroll(periodId, actorName = 'Juli Priyanto (Direktur)') {
    if (isMock) {
      const idx = periodsStore.findIndex((p) => p.id === periodId);
      if (idx === -1) return { data: null, error: { message: 'Periode tidak ditemukan.' } };

      const updated = {
        ...periodsStore[idx],
        status: STATUS.APPROVED,
        approvedByDirector: actorName,
        approvedByDirectorAt: new Date().toISOString(),
      };
      periodsStore[idx] = updated;

      await emitAudit({
        action: 'PAYROLL_DIRECTOR_APPROVE',
        module: 'Finance',
        entity: 'PayrollPeriod',
        entityId: periodId,
        details: {
          period: updated.periodLabel,
          approvedBy: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/payroll/${periodId}/approve`);
    return data;
  },

  async processDisbursement(periodId, actorName = 'Siti Rahma (Finance)') {
    if (isMock) {
      const idx = periodsStore.findIndex((p) => p.id === periodId);
      if (idx === -1) return { data: null, error: { message: 'Periode tidak ditemukan.' } };

      const updated = {
        ...periodsStore[idx],
        status: STATUS.PROCESSED,
        disbursedAt: new Date().toISOString(),
      };
      periodsStore[idx] = updated;

      await emitAudit({
        action: 'PAYROLL_DISBURSE',
        module: 'Finance',
        entity: 'PayrollPeriod',
        entityId: periodId,
        details: {
          period: updated.periodLabel,
          totalNet: updated.totalNet,
          disbursedBy: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/payroll/${periodId}/process`);
    return data;
  },
};

export default payrollAdapter;
