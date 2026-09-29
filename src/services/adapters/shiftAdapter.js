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
      const baseCode = (payload.code || `CUSTOM-${store.length + 1}`).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      const newId = `SH-${baseCode}`;
      const newShift = { ...payload, id: newId, code: baseCode };
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
      const idx = store.findIndex((s) => s.id === id || s.code === id);
      if (idx === -1) return { data: null, error: { message: 'Shift tidak ditemukan.' } };

      const oldShift = store[idx];
      const updated = { ...oldShift, ...payload, id: oldShift.id };
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

  async deleteShift(id) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((s) => s.id === id || s.code === id);
      if (idx === -1) return { data: null, error: { message: 'Shift tidak ditemukan.' } };

      const removed = store[idx];
      const updatedStore = store.filter((s) => s.id !== id && s.code !== id);
      saveStore(updatedStore);

      await emitAudit({
        action: 'SHIFT_DELETE',
        module: 'Master',
        entity: 'Shift',
        entityId: id,
        details: { name: removed.name },
      });

      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.delete(`/shifts/${id}`);
    return data;
  },
};

export default shiftAdapter;
