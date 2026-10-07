/**
 * Payroll Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 14 (Payroll Module) & Section 18 (Cross-department workflow: Payroll Approval).
 */

import apiClient from '@/services/apiClient';
import { MOCK_PAYROLL_PERIODS, MOCK_PAYROLL_ITEMS_SEP } from '@/services/mock/mockFinanceData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';

function getPeriodsStore() {
  return getStoredCollection('payroll_periods', () => [...MOCK_PAYROLL_PERIODS]);
}

function savePeriodsStore(periods) {
  saveStoredCollection('payroll_periods', periods);
}

function getItemsStore() {
  return getStoredCollection('payroll_items', () => [...MOCK_PAYROLL_ITEMS_SEP]);
}

export const payrollAdapter = {
  async getPayrollPeriods() {
    if (isMock) {
      return { data: [...getPeriodsStore()], error: null };
    }
    const { data } = await apiClient.get('/payroll');
    return data;
  },

  async getPayrollPeriodById(periodId) {
    if (isMock) {
      const periods = getPeriodsStore();
      const p = periods.find((period) => period.id === periodId);
      if (!p) return { data: null, error: { message: 'Periode payroll tidak ditemukan.' } };
      return { data: { ...p }, error: null };
    }
    const { data } = await apiClient.get(`/payroll/${periodId}`);
    return data;
  },

  async getPayrollItems(periodId, { search = '', position = '' } = {}) {
    if (isMock) {
      let filtered = [...getItemsStore()];
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
      const periods = getPeriodsStore();
      const idx = periods.findIndex((p) => p.id === periodId);
      if (idx === -1) return { data: null, error: { message: 'Periode tidak ditemukan.' } };

      const updated = {
        ...periods[idx],
        status: STATUS.PENDING_APPROVAL,
        reviewedByFinance: actorName,
        reviewedByFinanceAt: new Date().toISOString(),
      };
      periods[idx] = updated;
      savePeriodsStore(periods);

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

  async approvePayroll(periodId, actorName = 'Juli Priyanto (Direktur Utama)') {
    if (isMock) {
      const periods = getPeriodsStore();
      const idx = periods.findIndex((p) => p.id === periodId);
      if (idx === -1) return { data: null, error: { message: 'Periode tidak ditemukan.' } };

      const updated = {
        ...periods[idx],
        status: STATUS.APPROVED,
        approvedByDirector: actorName,
        approvedByDirectorAt: new Date().toISOString(),
      };
      periods[idx] = updated;
      savePeriodsStore(periods);

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
      const periods = getPeriodsStore();
      const idx = periods.findIndex((p) => p.id === periodId);
      if (idx === -1) return { data: null, error: { message: 'Periode tidak ditemukan.' } };

      const updated = {
        ...periods[idx],
        status: STATUS.PROCESSED,
        disbursedAt: new Date().toISOString(),
      };
      periods[idx] = updated;
      savePeriodsStore(periods);

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
