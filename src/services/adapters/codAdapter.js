/**
 * COD Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.5 (COD Case — INTEGRASI KHUSUS), Section 14 (COD Module),
 * Section 18 (Cross-department workflow: Finance -> Operations -> Collection -> Legal).
 */

import apiClient from '@/services/apiClient';
import { MOCK_COD_TRANSACTIONS, MOCK_COD_CASES } from '@/services/mock/mockFinanceData';
import { emitAudit } from '@/utils/auditLogger';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let codTransactionsStore = [...MOCK_COD_TRANSACTIONS];
let codCasesStore = [...MOCK_COD_CASES];

export const codAdapter = {
  async getCODTransactions({ search = '', clientId = '', status = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...codTransactionsStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.trackingNumber.toLowerCase().includes(q) ||
            t.courierName.toLowerCase().includes(q) ||
            t.clientName.toLowerCase().includes(q) ||
            t.destination.toLowerCase().includes(q)
        );
      }

      if (clientId) filtered = filtered.filter((t) => t.clientId === clientId);
      if (status) filtered = filtered.filter((t) => t.status === status);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/cod/transactions', {
      params: { search, clientId, status, page, pageSize },
    });
    return data;
  },

  async getCODCases({ search = '', collectionStatus = '', legalStatus = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...codCasesStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.caseNumber.toLowerCase().includes(q) ||
            c.courierName.toLowerCase().includes(q) ||
            c.clientName.toLowerCase().includes(q) ||
            c.shipmentReference.toLowerCase().includes(q)
        );
      }

      if (collectionStatus) filtered = filtered.filter((c) => c.collectionStatus === collectionStatus);
      if (legalStatus) filtered = filtered.filter((c) => c.legalStatus === legalStatus);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/cod/cases', {
      params: { search, collectionStatus, legalStatus, page, pageSize },
    });
    return data;
  },

  async getCODCaseById(id) {
    if (isMock) {
      const c = codCasesStore.find((item) => item.id === id);
      if (!c) return { data: null, error: { message: 'Kasus COD tidak ditemukan.' } };
      return { data: { ...c }, error: null };
    }
    const { data } = await apiClient.get(`/cod/cases/${id}`);
    return data;
  },

  async recordCollectionAttempt(caseId, { contactMethod, result, promisedAmount, nextAction, pic = 'Fauzi (Staff Ops & Collection)' }) {
    if (isMock) {
      const idx = codCasesStore.findIndex((c) => c.id === caseId);
      if (idx === -1) return { data: null, error: { message: 'Kasus tidak ditemukan.' } };

      const c = codCasesStore[idx];
      const newAttempt = {
        attemptDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
        contactMethod,
        pic,
        result,
        promisedAmount: Number(promisedAmount) || 0,
        nextAction,
      };

      const updated = {
        ...c,
        contactAttempts: [newAttempt, ...(c.contactAttempts || [])],
      };
      codCasesStore[idx] = updated;

      await emitAudit({
        action: 'COD_COLLECTION_ATTEMPT',
        module: 'Finance',
        entity: 'CODCase',
        entityId: caseId,
        details: {
          courier: c.courierName,
          method: contactMethod,
          promisedAmount,
          pic,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/cod/cases/${caseId}/collection-attempts`, {
      contactMethod,
      result,
      promisedAmount,
      nextAction,
    });
    return data;
  },

  async recordCODSettlement(caseId, { settlementAmount, settlementReceipt, notes, actorName = 'Siti Rahma (Finance)' }) {
    if (isMock) {
      const idx = codCasesStore.findIndex((c) => c.id === caseId);
      if (idx === -1) return { data: null, error: { message: 'Kasus tidak ditemukan.' } };

      const c = codCasesStore[idx];
      const payAmount = Number(settlementAmount) || 0;
      const newOutstanding = Math.max(0, c.outstandingAmount - payAmount);
      const isSettled = newOutstanding === 0;

      const updated = {
        ...c,
        outstandingAmount: newOutstanding,
        collectionStatus: isSettled ? 'SETTLED' : 'PARTIAL_SETTLEMENT',
        settlementDate: new Date().toISOString().slice(0, 10),
        settlementAmount: payAmount,
        settlementReceipt,
        notes: notes || c.notes,
      };
      codCasesStore[idx] = updated;

      await emitAudit({
        action: 'COD_SETTLEMENT',
        module: 'Finance',
        entity: 'CODCase',
        entityId: caseId,
        details: {
          courier: c.courierName,
          amount: payAmount,
          remaining: newOutstanding,
          receipt: settlementReceipt,
          receivedBy: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/cod/cases/${caseId}/settlements`, {
      settlementAmount,
      settlementReceipt,
      notes,
    });
    return data;
  },

  async escalateToLegal(caseId, { reason, actorName = 'Siti Rahma (Finance)' }) {
    if (isMock) {
      const idx = codCasesStore.findIndex((c) => c.id === caseId);
      if (idx === -1) return { data: null, error: { message: 'Kasus tidak ditemukan.' } };

      const c = codCasesStore[idx];
      const updated = {
        ...c,
        legalStatus: 'ESCALATED_TO_LEGAL',
        collectionStatus: 'FAILED',
        escalatedAt: new Date().toISOString(),
        escalatedReason: reason,
        assignedLegal: 'Farhan Maulana (Legal Officer)',
      };
      codCasesStore[idx] = updated;

      await emitAudit({
        action: 'COD_ESCALATE_LEGAL',
        module: 'Finance',
        entity: 'CODCase',
        entityId: caseId,
        details: {
          courier: c.courierName,
          outstandingAmount: c.outstandingAmount,
          reason,
          escalatedBy: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/cod/cases/${caseId}/escalate`, { reason });
    return data;
  },
};

export default codAdapter;
