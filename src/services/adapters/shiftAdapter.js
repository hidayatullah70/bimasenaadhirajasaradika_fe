/**
 * Shift Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 20 / API-SPEC Section 3.
 */

import apiClient from '@/services/apiClient';
import { MOCK_SHIFTS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const STORAGE_KEY = 'barak_shifts';

function getStore() {
  return getStoredCollection(STORAGE_KEY, () => [...MOCK_SHIFTS]);
}

function saveStore(store) {
  saveStoredCollection(STORAGE_KEY, store);
}

export const shiftAdapter = {
  async getShifts() {
    if (isMock) {
      return { data: [...getStore()], error: null };
    }
    const { data } = await apiClient.get('/shifts');
    return data;
  },

  async getShiftById(id) {
    if (isMock) {
      const store = getStore();
      const shift = store.find((s) => s.id === id);
      if (!shift) return { data: null, error: { message: 'Shift tidak ditemukan.' } };
      return { data: { ...shift }, error: null };
    }
    const { data } = await apiClient.get(`/shifts/${id}`);
    return data;
  },

  async createShift(payload) {
    if (isMock) {
      const store = getStore();
      const newId = `SH-${payload.code?.toUpperCase() || (store.length + 1).toString()}`;
      const newShift = { ...payload, id: newId };
      const updatedStore = [...store, newShift];
      saveStore(updatedStore);

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
      const store = getStore();
      const idx = store.findIndex((s) => s.id === id);
      if (idx === -1) return { data: null, error: { message: 'Shift tidak ditemukan.' } };

      const updated = { ...store[idx], ...payload };
      store[idx] = updated;
      saveStore(store);

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
