/**
 * COD Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.5 (COD Case — INTEGRASI KHUSUS), Section 14 (COD Module),
 * Section 18 (Cross-department workflow: Finance -> Operations -> Collection -> Legal).
 */

import apiClient from '@/services/apiClient';
import { MOCK_COD_TRANSACTIONS, MOCK_COD_CASES } from '@/services/mock/mockFinanceData';
import { emitAudit } from '@/utils/auditLogger';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';

function getCodTransactionsStore() {
  return getStoredCollection('cod_transactions', () => [...MOCK_COD_TRANSACTIONS]);
}

function getCodCasesStore() {
  return getStoredCollection('cod_cases', () => [...MOCK_COD_CASES]);
}

function saveCodCasesStore(cases) {
  saveStoredCollection('cod_cases', cases);
}

function saveCodTransactionsStore(trxs) {
  saveStoredCollection('cod_transactions', trxs);
}

export const codAdapter = {
  async getCODTransactions({ search = '', clientId = '', status = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...getCodTransactionsStore()];

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

  async createTransaction(payload) {
    if (isMock) {
      const store = getCodTransactionsStore();
      const nextNum = (store.length + 1).toString().padStart(4, '0');
      const newTrx = {
        ...payload,
        id: payload.id || `TRX-COD-${nextNum}`,
        trackingNumber: payload.trackingNumber || `BARAK-COD-${nextNum}`,
        amount: Number(payload.amount) || 0,
        status: payload.status || 'COLLECTED',
        createdAt: new Date().toISOString(),
      };
      saveCodTransactionsStore([newTrx, ...store]);

      await emitAudit({
        action: 'COD_TRANSACTION_CREATE',
        module: 'Finance',
        entity: 'CODTransaction',
        entityId: newTrx.id,
        details: { trackingNumber: newTrx.trackingNumber, amount: newTrx.amount },
      });

      return { data: newTrx, error: null };
    }

    const { data } = await apiClient.post('/cod/transactions', payload);
    return data;
  },

  async updateTransaction(id, payload) {
    if (isMock) {
      const store = getCodTransactionsStore();
      const normId = String(id).toLowerCase().trim();
      const idx = store.findIndex((t) => String(t.id).toLowerCase().trim() === normId || String(t.trackingNumber).toLowerCase().trim() === normId);
      if (idx === -1) return { data: null, error: { message: 'Transaksi COD tidak ditemukan.' } };

      const oldTrx = store[idx];
      const updated = {
        ...oldTrx,
        ...payload,
        id: oldTrx.id,
        trackingNumber: oldTrx.trackingNumber,
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveCodTransactionsStore(store);

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/cod/transactions/${id}`, payload);
    return data;
  },

  async getCODCases({ search = '', collectionStatus = '', legalStatus = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...getCodCasesStore()];

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
      const cases = getCodCasesStore();
      const c = cases.find((item) => item.id === id);
      if (!c) return { data: null, error: { message: 'Kasus COD tidak ditemukan.' } };
      return { data: { ...c }, error: null };
    }
    const { data } = await apiClient.get(`/cod/cases/${id}`);
    return data;
  },

  async createCODCase(payload) {
    if (isMock) {
      const cases = getCodCasesStore();
      const nextNum = (cases.length + 1).toString().padStart(3, '0');
      const newCase = {
        ...payload,
        id: payload.id || `CASE-COD-${nextNum}`,
        caseNumber: payload.caseNumber || `COD/BRK/2026/09/${nextNum}`,
        collectionStatus: payload.collectionStatus || 'OPEN',
        status: payload.status || 'OPEN',
        discrepancyAmount: Number(payload.discrepancyAmount || payload.amount || 0),
        outstandingAmount: Number(payload.outstandingAmount || payload.discrepancyAmount || payload.amount || 0),
        contactAttempts: [],
        createdAt: new Date().toISOString(),
      };
      saveCodCasesStore([newCase, ...cases]);

      await emitAudit({
        action: 'COD_CASE_CREATE',
        module: 'Finance',
        entity: 'CODCase',
        entityId: newCase.id,
        details: { caseNumber: newCase.caseNumber, amount: newCase.discrepancyAmount },
      });

      return { data: newCase, error: null };
    }

    const { data } = await apiClient.post('/cod/cases', payload);
    return data;
  },

  async updateCODCase(id, payload) {
    if (isMock) {
      const cases = getCodCasesStore();
      const normId = String(id).toLowerCase().trim();
      const idx = cases.findIndex((c) => String(c.id).toLowerCase().trim() === normId || String(c.caseNumber).toLowerCase().trim() === normId);
      if (idx === -1) return { data: null, error: { message: 'Kasus COD tidak ditemukan.' } };

      const oldCase = cases[idx];
      const updated = {
        ...oldCase,
        ...payload,
        id: oldCase.id,
        caseNumber: oldCase.caseNumber,
        updatedAt: new Date().toISOString(),
      };
      cases[idx] = updated;
      saveCodCasesStore(cases);

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/cod/cases/${id}`, payload);
    return data;
  },

  async recordCollectionAttempt(caseId, { contactMethod, result, promisedAmount, nextAction, pic = 'Fauzi (Staff Ops & Collection)' }) {
    if (isMock) {
      const cases = getCodCasesStore();
      const idx = cases.findIndex((c) => c.id === caseId);
      if (idx === -1) return { data: null, error: { message: 'Kasus tidak ditemukan.' } };

      const c = cases[idx];
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
      cases[idx] = updated;
      saveCodCasesStore(cases);

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
      const cases = getCodCasesStore();
      const idx = cases.findIndex((c) => c.id === caseId);
      if (idx === -1) return { data: null, error: { message: 'Kasus tidak ditemukan.' } };

      const c = cases[idx];
      const payAmount = Number(settlementAmount) || 0;
      const newOutstanding = Math.max(0, c.outstandingAmount - payAmount);
      const isSettled = newOutstanding === 0;

      const updated = {
        ...c,
        outstandingAmount: newOutstanding,
        collectionStatus: isSettled ? 'SETTLED' : 'PARTIAL_SETTLEMENT',
        status: isSettled ? 'SETTLED' : (c.status || 'PARTIAL_SETTLEMENT'),
        settlementDate: new Date().toISOString().slice(0, 10),
        settlementAmount: payAmount,
        settlementReceipt,
        notes: notes || c.notes,
      };
      cases[idx] = updated;
      saveCodCasesStore(cases);

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

  async settleTransaction(id, payload = {}) {
    if (isMock) {
      const trxs = getCodTransactionsStore();
      const normId = String(id).toLowerCase().trim();
      const trxIdx = trxs.findIndex(
        (t) => String(t.id).toLowerCase().trim() === normId || String(t.trackingNumber).toLowerCase().trim() === normId
      );
      if (trxIdx !== -1) {
        const oldTrx = trxs[trxIdx];
        const updatedTrx = {
          ...oldTrx,
          status: 'SETTLED',
          settledAmount: payload.settledAmount || payload.settlementAmount || oldTrx.amount,
          settledAt: new Date().toISOString(),
          settlementReceipt: payload.settlementReceipt || 'TRX-SETTLED',
          notes: payload.notes || oldTrx.notes || '',
        };
        trxs[trxIdx] = updatedTrx;
        saveCodTransactionsStore(trxs);

        await emitAudit({
          action: 'COD_TRANSACTION_SETTLE',
          module: 'Finance',
          entity: 'CODTransaction',
          entityId: oldTrx.id,
          details: { trackingNumber: oldTrx.trackingNumber, amount: updatedTrx.settledAmount },
        });

        return { data: updatedTrx, error: null };
      }

      return this.recordCODSettlement(id, {
        settlementAmount: payload.settledAmount || payload.settlementAmount || payload.amount,
        settlementReceipt: payload.settlementReceipt || payload.notes || 'TRX-SETTLED',
        notes: payload.notes || '',
        actorName: payload.actorName || 'Siti Rahma (Finance)',
      });
    }

    const { data } = await apiClient.post(`/cod/transactions/${id}/settle`, payload);
    return data;
  },

  async escalateToLegal(caseId, { reason, actorName = 'Siti Rahma (Finance)' }) {
    if (isMock) {
      const cases = getCodCasesStore();
      const idx = cases.findIndex((c) => c.id === caseId);
      if (idx === -1) return { data: null, error: { message: 'Kasus tidak ditemukan.' } };

      const c = cases[idx];
      const updated = {
        ...c,
        legalStatus: 'ESCALATED_TO_LEGAL',
        collectionStatus: 'FAILED',
        escalatedAt: new Date().toISOString(),
        escalatedReason: reason,
        assignedLegal: 'Farhan Maulana (Legal Officer)',
      };
      cases[idx] = updated;
      saveCodCasesStore(cases);

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
