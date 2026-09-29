/**
 * Field Patrol Report Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Field Reports & Patrol Journal).
 */

import apiClient from '@/services/apiClient';
import { MOCK_FIELD_REPORTS } from '@/services/mock/mockOperationsData';
import { emitAudit } from '@/utils/auditLogger';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const STORAGE_KEY = 'barak_field_reports';

function getStore() {
  return getStoredCollection(STORAGE_KEY, () => [...MOCK_FIELD_REPORTS]);
}

function saveStore(store) {
  saveStoredCollection(STORAGE_KEY, store);
}

export const fieldReportAdapter = {
  async getFieldReports({ search = '', clientId = '', locationId = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...getStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (f) =>
            f.reportCode.toLowerCase().includes(q) ||
            f.clientName.toLowerCase().includes(q) ||
            f.locationName.toLowerCase().includes(q) ||
            f.patrolTeam.toLowerCase().includes(q) ||
            f.observations.toLowerCase().includes(q)
        );
      }

      if (clientId) filtered = filtered.filter((f) => f.clientId === clientId);
      if (locationId) filtered = filtered.filter((f) => f.locationId === locationId);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/field-reports', {
      params: { search, clientId, locationId, page, pageSize },
    });
    return data;
  },

  async createFieldReport(payload) {
    if (isMock) {
      const store = getStore();
      const dateStr = new Date().toISOString().slice(0, 10);
      const maxNum = store.reduce((max, f) => {
        const match = (f.id || f.reportCode || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const newNum = (maxNum + 1).toString().padStart(3, '0');
      const newId = `REP-FLD-${newNum}`;
      const newReport = {
        ...payload,
        id: newId,
        reportCode: `JRN-${dateStr}-${newNum.slice(-2)}`,
        loggedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      const updatedStore = [newReport, ...store];
      saveStore(updatedStore);

      await emitAudit({
        action: 'PATROL_REPORT_CREATE',
        module: 'Operations',
        entity: 'FieldReport',
        entityId: newId,
        details: {
          client: newReport.clientName,
          location: newReport.locationName,
          team: newReport.patrolTeam,
        },
      });

      return { data: newReport, error: null };
    }

    const { data } = await apiClient.post('/field-reports', payload);
    return data;
  },

  async updateFieldReport(id, payload) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((f) => f.id === id || f.reportCode === id);
      if (idx === -1) return { data: null, error: { message: 'Laporan patroli tidak ditemukan.' } };

      const oldReport = store[idx];
      const updated = {
        ...oldReport,
        ...payload,
        id: oldReport.id,
        reportCode: oldReport.reportCode || oldReport.id,
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'PATROL_REPORT_EDIT',
        module: 'Operations',
        entity: 'FieldReport',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/field-reports/${id}`, payload);
    return data;
  },

  async deleteFieldReport(id) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((f) => f.id === id || f.reportCode === id);
      if (idx === -1) return { data: null, error: { message: 'Laporan patroli tidak ditemukan.' } };

      const removed = store[idx];
      const updatedStore = store.filter((f) => f.id !== id && f.reportCode !== id);
      saveStore(updatedStore);

      await emitAudit({
        action: 'PATROL_REPORT_DELETE',
        module: 'Operations',
        entity: 'FieldReport',
        entityId: id,
        details: { team: removed.patrolTeam },
      });

      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.delete(`/field-reports/${id}`);
    return data;
  },
};

export default fieldReportAdapter;
