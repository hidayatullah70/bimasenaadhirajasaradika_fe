/**
 * Replacement Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Replacement).
 * Manages personnel replacement requests, candidate approvals, and handovers.
 */

import apiClient from '@/services/apiClient';
import { MOCK_REPLACEMENTS } from '@/services/mock/mockOperationsData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let replacementsStore = [...MOCK_REPLACEMENTS];

export const replacementAdapter = {
  async getReplacementRequests({ search = '', status = '', clientId = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...replacementsStore];

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
      const newId = `REP-2026-09-${(replacementsStore.length + 1).toString().padStart(3, '0')}`;
      const newRep = {
        ...payload,
        id: newId,
        requestNumber: `REP/BARAK/2026/09/${(replacementsStore.length + 1).toString().padStart(3, '0')}`,
        status: STATUS.PENDING_APPROVAL,
        createdAt: new Date().toISOString(),
      };
      replacementsStore = [newRep, ...replacementsStore];

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

  async approveReplacement(id, actorName = 'Juli Priyanto (Direktur Ops)') {
    if (isMock) {
      const idx = replacementsStore.findIndex((r) => r.id === id);
      if (idx === -1) return { data: null, error: { message: 'Pengajuan tidak ditemukan.' } };

      const updated = {
        ...replacementsStore[idx],
        status: STATUS.APPROVED,
        approvedBy: actorName,
        approvedAt: new Date().toISOString(),
      };
      replacementsStore[idx] = updated;

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
      const idx = replacementsStore.findIndex((r) => r.id === id);
      if (idx === -1) return { data: null, error: { message: 'Pengajuan tidak ditemukan.' } };

      const updated = {
        ...replacementsStore[idx],
        status: STATUS.REJECTED,
        rejectedBy: actorName,
        rejectedReason: reason,
        rejectedAt: new Date().toISOString(),
      };
      replacementsStore[idx] = updated;

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
};

export default replacementAdapter;
