/**
 * Field Patrol Report Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Field Reports & Patrol Journal).
 */

import apiClient from '@/services/apiClient';
import { MOCK_FIELD_REPORTS } from '@/services/mock/mockOperationsData';
import { emitAudit } from '@/utils/auditLogger';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let fieldReportsStore = [...MOCK_FIELD_REPORTS];

export const fieldReportAdapter = {
  async getFieldReports({ search = '', clientId = '', locationId = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...fieldReportsStore];

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
      const dateStr = new Date().toISOString().slice(0, 10);
      const newId = `REP-FLD-${(fieldReportsStore.length + 1).toString().padStart(3, '0')}`;
      const newReport = {
        ...payload,
        id: newId,
        reportCode: `JRN-${dateStr}-${(fieldReportsStore.length + 1).toString().padStart(2, '0')}`,
        loggedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      fieldReportsStore = [newReport, ...fieldReportsStore];

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
};

export default fieldReportAdapter;
