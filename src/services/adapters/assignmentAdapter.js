/**
 * Assignment Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1, 11.2, 20 & 21 / API-SPEC Section 3 & 8.
 * Gate: Master assignments are the authoritative source for attendance and manpower.
 */

import apiClient from '@/services/apiClient';
import { MOCK_ASSIGNMENTS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let assignmentsStore = [...MOCK_ASSIGNMENTS];

export const assignmentAdapter = {
  async getAssignments({ search = '', clientId = '', locationId = '', shiftId = '', status = '', page = 1, pageSize = 20 } = {}) {
    if (isMock) {
      let filtered = [...assignmentsStore];

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
      const asn = assignmentsStore.find((a) => a.id === id || a.assignmentCode === id);
      if (!asn) return { data: null, error: { message: 'Penugasan tidak ditemukan.' } };
      return { data: { ...asn }, error: null };
    }
    const { data } = await apiClient.get(`/assignments/${id}`);
    return data;
  },

  async createAssignment(payload) {
    if (isMock) {
      // Check if employee already has active assignment for same period
      const existing = assignmentsStore.find(
        (a) => a.employeeId === payload.employeeId && a.status === STATUS.ACTIVE
      );
      if (existing) {
        // Warning: overlapping active assignment
        // If necessary, mark previous as TRANSFERRED/COMPLETED
      }

      const newId = `BRK-ASN-${(assignmentsStore.length + 1).toString().padStart(3, '0')}`;
      const newAsn = {
        ...payload,
        id: newId,
        assignmentCode: `ASN-${(assignmentsStore.length + 1).toString().padStart(3, '0')}`,
        status: payload.status || STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      assignmentsStore = [newAsn, ...assignmentsStore];

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
      const idx = assignmentsStore.findIndex((a) => a.id === id || a.assignmentCode === id);
      if (idx === -1) return { data: null, error: { message: 'Penugasan tidak ditemukan.' } };

      const updated = { ...assignmentsStore[idx], ...payload, updatedAt: new Date().toISOString() };
      assignmentsStore[idx] = updated;

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
      const idx = assignmentsStore.findIndex((a) => a.id === id || a.assignmentCode === id);
      if (idx === -1) return { data: null, error: { message: 'Penugasan tidak ditemukan.' } };

      const updated = {
        ...assignmentsStore[idx],
        status: STATUS.CLOSED,
        endDate: new Date().toISOString().split('T')[0],
        notes: `${assignmentsStore[idx].notes || ''} [Selesai: ${reason}]`,
        updatedAt: new Date().toISOString(),
      };
      assignmentsStore[idx] = updated;

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
};

export default assignmentAdapter;
