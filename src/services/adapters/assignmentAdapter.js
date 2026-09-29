/**
 * Assignment Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1, 11.2, 20 & 21 / API-SPEC Section 3 & 8.
 * Gate: Master assignments are the authoritative source for attendance and manpower.
 */

import apiClient from '@/services/apiClient';
import { MOCK_ASSIGNMENTS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const STORAGE_KEY = 'barak_assignments';

function getStore() {
  return getStoredCollection(STORAGE_KEY, () => [...MOCK_ASSIGNMENTS]);
}

function saveStore(store) {
  saveStoredCollection(STORAGE_KEY, store);
}

export const assignmentAdapter = {
  async getAssignments({ search = '', clientId = '', locationId = '', shiftId = '', status = '', page = 1, pageSize = 20 } = {}) {
    if (isMock) {
      let filtered = [...getStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.employeeName.toLowerCase().includes(q) ||
            a.employeeNik.includes(q) ||
            a.clientName.toLowerCase().includes(q) ||
            a.locationName.toLowerCase().includes(q) ||
            a.assignmentCode.toLowerCase().includes(q)
        );
      }

      if (clientId) {
        filtered = filtered.filter((a) => a.clientId === clientId);
      }

      if (locationId) {
        filtered = filtered.filter((a) => a.locationId === locationId);
      }

      if (shiftId) {
        filtered = filtered.filter((a) => a.shiftId === shiftId);
      }

      if (status) {
        filtered = filtered.filter((a) => a.status === status);
      }

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/assignments', {
      params: { search, clientId, locationId, shiftId, status, page, pageSize },
    });
    return data;
  },

  async getAssignmentById(id) {
    if (isMock) {
      const store = getStore();
      const asn = store.find((a) => a.id === id || a.assignmentCode === id);
      if (!asn) return { data: null, error: { message: 'Penugasan tidak ditemukan.' } };
      return { data: { ...asn }, error: null };
    }

    const { data } = await apiClient.get(`/assignments/${id}`);
    return data;
  },

  async createAssignment(payload) {
    if (isMock) {
      const store = getStore();
      const existing = store.find(
        (a) => a.employeeId === payload.employeeId && a.status === STATUS.ACTIVE
      );
      if (existing) {
        // Warning: overlapping active assignment
      }

      const maxNum = store.reduce((max, a) => {
        const match = (a.id || a.assignmentCode || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const newId = `BRK-ASN-${(maxNum + 1).toString().padStart(3, '0')}`;
      const newAsn = {
        ...payload,
        id: newId,
        assignmentCode: `ASN-${(maxNum + 1).toString().padStart(3, '0')}`,
        status: payload.status || STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedStore = [newAsn, ...store];
      saveStore(updatedStore);

      await emitAudit({
        action: 'ASSIGNMENT_CREATE',
        module: 'Operations',
        entity: 'Assignment',
        entityId: newId,
        details: {
          employee: newAsn.employeeName || newAsn.employeeId,
          client: newAsn.clientName || newAsn.clientId,
          location: newAsn.locationName || newAsn.locationId,
        },
      });

      return { data: newAsn, error: null };
    }

    const { data } = await apiClient.post('/assignments', payload);
    return data;
  },

  async updateAssignment(id, payload) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((a) => a.id === id || a.assignmentCode === id);
      if (idx === -1) return { data: null, error: { message: 'Penugasan tidak ditemukan.' } };

      const oldAsn = store[idx];
      const updated = {
        ...oldAsn,
        ...payload,
        id: oldAsn.id,
        assignmentCode: oldAsn.assignmentCode || oldAsn.id,
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'ASSIGNMENT_EDIT',
        module: 'Operations',
        entity: 'Assignment',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/assignments/${id}`, payload);
    return data;
  },

  async endAssignment(id, reason = 'Rotasi / Selesai Penugasan') {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((a) => a.id === id || a.assignmentCode === id);
      if (idx === -1) return { data: null, error: { message: 'Penugasan tidak ditemukan.' } };

      const updated = {
        ...store[idx],
        status: STATUS.CLOSED,
        endDate: new Date().toISOString().split('T')[0],
        notes: `${store[idx].notes || ''} [Selesai: ${reason}]`,
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'ASSIGNMENT_END',
        module: 'Operations',
        entity: 'Assignment',
        entityId: id,
        details: { reason },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/assignments/${id}/end`, { reason });
    return data;
  },

  async deleteAssignment(id) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((a) => a.id === id || a.assignmentCode === id);
      if (idx === -1) return { data: null, error: { message: 'Penugasan tidak ditemukan.' } };

      const removed = store[idx];
      const updatedStore = store.filter((a) => a.id !== id && a.assignmentCode !== id);
      saveStore(updatedStore);

      await emitAudit({
        action: 'ASSIGNMENT_DELETE',
        module: 'Operations',
        entity: 'Assignment',
        entityId: id,
        details: { employee: removed.employeeName, location: removed.locationName },
      });

      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.delete(`/assignments/${id}`);
    return data;
  },

  async transferAssignment(id, { newClientId, newLocationId, newShiftId, notes = '' }) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((a) => a.id === id || a.assignmentCode === id);
      if (idx === -1) return { data: null, error: { message: 'Penugasan tidak ditemukan.' } };

      const oldAsn = store[idx];
      // Mark old assignment as ROTATED
      store[idx] = {
        ...oldAsn,
        status: 'ROTATED',
        endDate: new Date().toISOString().split('T')[0],
        notes: `${oldAsn.notes || ''} [Rotasi: ${notes}]`.trim(),
        updatedAt: new Date().toISOString(),
      };

      // Create new assignment
      const maxNum = store.reduce((max, a) => {
        const match = (a.id || a.assignmentCode || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const newId = `BRK-ASN-${(maxNum + 1).toString().padStart(3, '0')}`;
      const newAsn = {
        ...oldAsn,
        id: newId,
        assignmentCode: `ASN-${(maxNum + 1).toString().padStart(3, '0')}`,
        clientId: newClientId,
        locationId: newLocationId,
        shiftId: newShiftId,
        status: STATUS.ACTIVE || 'ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedStore = [newAsn, ...store];
      saveStore(updatedStore);

      await emitAudit({
        action: 'ASSIGNMENT_TRANSFER',
        module: 'Operations',
        entity: 'Assignment',
        entityId: newId,
        details: { previousId: id, newClientId, newLocationId, notes },
      });

      return {
        data: {
          previousPlacement: store[idx],
          newPlacement: newAsn,
        },
        error: null,
      };
    }

    const { data } = await apiClient.post(`/assignments/${id}/transfer`, {
      newClientId,
      newLocationId,
      newShiftId,
      notes,
    });
    return data;
  },
};

export default assignmentAdapter;
