/**
 * Replacement Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Replacement).
 * Manages personnel replacement requests, candidate approvals, and handovers.
 */

import apiClient from '@/services/apiClient';
import { MOCK_REPLACEMENTS } from '@/services/mock/mockOperationsData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const STORAGE_KEY = 'barak_replacements';

function getStore() {
  return getStoredCollection(STORAGE_KEY, () => [...MOCK_REPLACEMENTS]);
}

function saveStore(store) {
  saveStoredCollection(STORAGE_KEY, store);
}

export const replacementAdapter = {
  async getReplacementRequests({ search = '', status = '', clientId = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...getStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.requestNumber.toLowerCase().includes(q) ||
            r.currentEmployeeName.toLowerCase().includes(q) ||
            r.candidateEmployeeName.toLowerCase().includes(q) ||
            r.clientName.toLowerCase().includes(q) ||
            r.reason.toLowerCase().includes(q)
        );
      }

      if (status) filtered = filtered.filter((r) => r.status === status);
      if (clientId) filtered = filtered.filter((r) => r.clientId === clientId);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/replacement-requests', {
      params: { search, status, clientId, page, pageSize },
    });
    return data;
  },

  async createReplacementRequest(payload) {
    if (isMock) {
      const store = getStore();
      const maxNum = store.reduce((max, r) => {
        const match = (r.id || r.requestNumber || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const newNum = (maxNum + 1).toString().padStart(3, '0');
      const newId = `REP-2026-09-${newNum}`;
      const newRep = {
        ...payload,
        id: newId,
        requestNumber: `REP/BARAK/2026/09/${newNum}`,
        status: STATUS.PENDING_APPROVAL,
        createdAt: new Date().toISOString(),
      };
      const updatedStore = [newRep, ...store];
      saveStore(updatedStore);

      await emitAudit({
        action: 'REPLACEMENT_CREATE',
        module: 'Operations',
        entity: 'ReplacementRequest',
        entityId: newId,
        details: {
          current: newRep.currentEmployeeName,
          candidate: newRep.candidateEmployeeName,
          reason: newRep.reason,
        },
      });

      return { data: newRep, error: null };
    }

    const { data } = await apiClient.post('/replacement-requests', payload);
    return data;
  },

  async updateReplacement(id, payload) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((r) => r.id === id || r.requestNumber === id);
      if (idx === -1) return { data: null, error: { message: 'Pengajuan tidak ditemukan.' } };

      const oldRep = store[idx];
      const updated = {
        ...oldRep,
        ...payload,
        id: oldRep.id,
        requestNumber: oldRep.requestNumber || oldRep.id,
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'REPLACEMENT_EDIT',
        module: 'Operations',
        entity: 'ReplacementRequest',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/replacement-requests/${id}`, payload);
    return data;
  },

  async approveReplacement(id, actorName = 'Juli Priyanto (Direktur Utama)') {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((r) => r.id === id || r.requestNumber === id);
      if (idx === -1) return { data: null, error: { message: 'Pengajuan tidak ditemukan.' } };

      const updated = {
        ...store[idx],
        status: STATUS.APPROVED,
        approvedBy: actorName,
        approvedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'REPLACEMENT_APPROVE',
        module: 'Operations',
        entity: 'ReplacementRequest',
        entityId: id,
        details: { approvedBy: actorName, employee: updated.currentEmployeeName },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/replacement-requests/${id}/approve`);
    return data;
  },

  async rejectReplacement(id, { reason, actorName = 'Juli Priyanto' }) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((r) => r.id === id || r.requestNumber === id);
      if (idx === -1) return { data: null, error: { message: 'Pengajuan tidak ditemukan.' } };

      const updated = {
        ...store[idx],
        status: STATUS.REJECTED,
        rejectedBy: actorName,
        rejectedReason: reason,
        rejectedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'REPLACEMENT_REJECT',
        module: 'Operations',
        entity: 'ReplacementRequest',
        entityId: id,
        details: { rejectedBy: actorName, reason },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/replacement-requests/${id}/reject`, { reason });
    return data;
  },

  async deleteReplacement(id) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((r) => r.id === id || r.requestNumber === id);
      if (idx === -1) return { data: null, error: { message: 'Pengajuan tidak ditemukan.' } };

      const removed = store[idx];
      const updatedStore = store.filter((r) => r.id !== id && r.requestNumber !== id);
      saveStore(updatedStore);

      await emitAudit({
        action: 'REPLACEMENT_DELETE',
        module: 'Operations',
        entity: 'ReplacementRequest',
        entityId: id,
        details: { employee: removed.currentEmployeeName },
      });

      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.delete(`/replacement-requests/${id}`);
    return data;
  },
};

export default replacementAdapter;
