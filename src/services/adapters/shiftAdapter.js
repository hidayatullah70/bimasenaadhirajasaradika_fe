/**
 * Shift Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 20 / API-SPEC Section 3.
 */

import apiClient from '@/services/apiClient';
import { MOCK_SHIFTS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let shiftsStore = [...MOCK_SHIFTS];

export const shiftAdapter = {
  async getShifts() {
    if (isMock) {
      return { data: [...shiftsStore], error: null };
    }
    const { data } = await apiClient.get('/shifts');
    return data;
  },

  async getShiftById(id) {
    if (isMock) {
      const shift = shiftsStore.find((s) => s.id === id);
      if (!shift) return { data: null, error: { message: 'Shift tidak ditemukan.' } };
      return { data: { ...shift }, error: null };
    }
    const { data } = await apiClient.get(`/shifts/${id}`);
    return data;
  },

  async createShift(payload) {
    if (isMock) {
      const newId = `SH-${payload.code?.toUpperCase() || (shiftsStore.length + 1).toString()}`;
      const newShift = { ...payload, id: newId };
      shiftsStore = [...shiftsStore, newShift];

      await emitAudit({
        action: 'SHIFT_CREATE',
        module: 'Master',
        entity: 'Shift',
        entityId: newId,
        details: { name: newShift.name, hours: `${newShift.startTime}-${newShift.endTime}` },
      });

      return { data: newShift, error: null };
    }

    const { data } = await apiClient.post('/shifts', payload);
    return data;
  },

  async updateShift(id, payload) {
    if (isMock) {
      const idx = shiftsStore.findIndex((s) => s.id === id);
      if (idx === -1) return { data: null, error: { message: 'Shift tidak ditemukan.' } };

      const updated = { ...shiftsStore[idx], ...payload };
      shiftsStore[idx] = updated;

      await emitAudit({
        action: 'SHIFT_EDIT',
        module: 'Master',
        entity: 'Shift',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/shifts/${id}`, payload);
    return data;
  },
};

export default shiftAdapter;
