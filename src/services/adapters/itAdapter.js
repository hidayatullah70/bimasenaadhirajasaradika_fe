/**
 * IT Support Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 16 (IT Support Module), Section 18 (Cross-department workflow), Section 22 (Audit Log).
 */

import apiClient from '@/services/apiClient';
import {
  MOCK_IT_TICKETS,
  MOCK_IT_ASSETS,
  MOCK_MAINTENANCE_SCHEDULES,
  MOCK_SYSTEM_HEALTH,
} from '@/services/mock/mockITData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let ticketsStore = [...MOCK_IT_TICKETS];
let assetsStore = [...MOCK_IT_ASSETS];
let maintenanceStore = [...MOCK_MAINTENANCE_SCHEDULES];

export const itAdapter = {
  // ── 1. TICKETS HELP DESK ──────────────────────────────────────────────
  async getTickets({ search = '', department = '', priority = '', status = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...ticketsStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.ticketNumber.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            t.requester.toLowerCase().includes(q) ||
            t.locationName.toLowerCase().includes(q) ||
            (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
        );
      }

      if (department) filtered = filtered.filter((t) => t.department === department);
      if (priority) filtered = filtered.filter((t) => t.priority === priority);
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

    const { data } = await apiClient.get('/it/tickets', {
      params: { search, department, priority, status, page, pageSize },
    });
    return data;
  },

  async getTicketById(id) {
    if (isMock) {
      const ticket = ticketsStore.find((t) => t.id === id);
      return { data: ticket || null, error: ticket ? null : 'Tiket tidak ditemukan' };
    }
    const { data } = await apiClient.get(`/it/tickets/${id}`);
    return data;
  },

  async createTicket(ticketData) {
    if (isMock) {
      const newId = `TCK-2026-${String(ticketsStore.length + 1).padStart(6, '0')}`;
      const newNumber = `TCK/BRK/2026/09/${String(ticketsStore.length + 1).padStart(3, '0')}`;

      // Calculate SLA deadline based on priority
      const hoursMap = { CRITICAL: 4, HIGH: 8, MEDIUM: 24, LOW: 48 };
      const slaHours = hoursMap[ticketData.priority] || 24;
      const slaDeadline = new Date(Date.now() + slaHours * 3600000).toISOString();

      const newTicket = {
        id: newId,
        ticketNumber: newNumber,
        requester: ticketData.requester,
        department: ticketData.department,
        departmentLabel: ticketData.departmentLabel || ticketData.department,
        category: ticketData.category || 'HARDWARE_POS',
        categoryLabel: ticketData.categoryLabel || ticketData.category,
        priority: ticketData.priority || 'MEDIUM',
        subject: ticketData.subject,
        description: ticketData.description,
        locationName: ticketData.locationName || 'Kantor Pusat PT. BARAK',
        assignedTo: ticketData.assignedTo || 'Bagus Prakoso (IT Field Support)',
        slaDeadline,
        status: STATUS.OPEN,
        resolution: null,
        closedAt: null,
        createdAt: new Date().toISOString(),
      };

      ticketsStore = [newTicket, ...ticketsStore];

      emitAudit({
        action: 'IT_TICKET_CREATE',
        module: 'IT',
        targetId: newId,
        details: {
          ticketNumber: newNumber,
          subject: newTicket.subject,
          requester: newTicket.requester,
          priority: newTicket.priority,
        },
      });

      return { data: newTicket, error: null };
    }

    const { data } = await apiClient.post('/it/tickets', ticketData);
    return data;
  },

  async updateTicketStatus(id, newStatus, note = '', assignedTo = null) {
    if (isMock) {
      const index = ticketsStore.findIndex((t) => t.id === id);
      if (index === -1) return { data: null, error: 'Tiket tidak ditemukan' };

      const oldTicket = ticketsStore[index];
      ticketsStore[index] = {
        ...oldTicket,
        status: newStatus,
        assignedTo: assignedTo || oldTicket.assignedTo,
        updatedAt: new Date().toISOString(),
      };

      emitAudit({
        action: 'IT_TICKET_STATUS_UPDATE',
        module: 'IT',
        targetId: id,
        details: {
          ticketNumber: oldTicket.ticketNumber,
          fromStatus: oldTicket.status,
          toStatus: newStatus,
          note,
        },
      });

      return { data: ticketsStore[index], error: null };
    }

    const { data } = await apiClient.patch(`/it/tickets/${id}/status`, { status: newStatus, note, assignedTo });
    return data;
  },

  async resolveTicket(id, resolution) {
    if (isMock) {
      const index = ticketsStore.findIndex((t) => t.id === id);
      if (index === -1) return { data: null, error: 'Tiket tidak ditemukan' };

      const now = new Date().toISOString();
      ticketsStore[index] = {
        ...ticketsStore[index],
        status: STATUS.RESOLVED,
        resolution,
        closedAt: now,
        updatedAt: now,
      };

      emitAudit({
        action: 'IT_TICKET_RESOLVE',
        module: 'IT',
        targetId: id,
        details: {
          ticketNumber: ticketsStore[index].ticketNumber,
          resolution,
          closedAt: now,
        },
      });

      return { data: ticketsStore[index], error: null };
    }

    const { data } = await apiClient.post(`/it/tickets/${id}/resolve`, { resolution });
    return data;
  },

  // ── 2. IT ASSETS MANAGEMENT ───────────────────────────────────────────
  async getAssets({ search = '', assetType = '', location = '', status = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...assetsStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.assetCode.toLowerCase().includes(q) ||
            a.assetName.toLowerCase().includes(q) ||
            a.serialNumber.toLowerCase().includes(q) ||
            a.locationName.toLowerCase().includes(q) ||
            (a.pic && a.pic.toLowerCase().includes(q))
        );
      }

      if (assetType) filtered = filtered.filter((a) => a.assetType === assetType);
      if (location) filtered = filtered.filter((a) => a.locationName.toLowerCase().includes(location.toLowerCase()));
      if (status) filtered = filtered.filter((a) => a.status === status);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/it/assets', {
      params: { search, assetType, location, status, page, pageSize },
    });
    return data;
  },

  async getAssetById(id) {
    if (isMock) {
      const asset = assetsStore.find((a) => a.id === id);
      return { data: asset || null, error: asset ? null : 'Aset tidak ditemukan' };
    }
    const { data } = await apiClient.get(`/it/assets/${id}`);
    return data;
  },

  async createAsset(assetData) {
    if (isMock) {
      const newId = `AST-2026-${String(assetsStore.length + 1).padStart(3, '0')}`;
      const typeCodeMap = {
        BARRIER_GATE: 'BG',
        CCTV_SYSTEM: 'CCTV',
        BIOMETRIC_FINGERPRINT: 'BIO',
        POS_COMPUTER: 'PC',
        NETWORK_ROUTER: 'NET',
        BACKUP_SERVER: 'SRV',
        HARDWARE_POS: 'HW',
      };
      const prefix = typeCodeMap[assetData.assetType] || 'AST';
      const newCode = `AST/BRK/${prefix}-${String(assetsStore.length + 1).padStart(2, '0')}`;

      const newAsset = {
        id: newId,
        assetCode: newCode,
        assetName: assetData.assetName,
        assetType: assetData.assetType || 'HARDWARE_POS',
        assetTypeLabel: assetData.assetTypeLabel || assetData.assetType,
        serialNumber: assetData.serialNumber,
        locationName: assetData.locationName || 'Kantor Pusat PT. BARAK',
        department: assetData.department || 'OPERATIONS',
        purchaseDate: assetData.purchaseDate || new Date().toISOString().split('T')[0],
        warrantyExpiry: assetData.warrantyExpiry || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        status: assetData.status || 'ACTIVE',
        condition: assetData.condition || 'Baik / Baru Diregistrasi',
        pic: assetData.pic || 'Bagus Prakoso (IT Support)',
        notes: assetData.notes || '',
      };

      assetsStore = [newAsset, ...assetsStore];

      emitAudit({
        action: 'IT_ASSET_REGISTER',
        module: 'IT',
        targetId: newId,
        details: { assetCode: newCode, name: newAsset.assetName, sn: newAsset.serialNumber },
      });

      return { data: newAsset, error: null };
    }

    const { data } = await apiClient.post('/it/assets', assetData);
    return data;
  },

  async updateAssetStatus(id, newStatus, condition = '', note = '') {
    if (isMock) {
      const index = assetsStore.findIndex((a) => a.id === id);
      if (index === -1) return { data: null, error: 'Aset tidak ditemukan' };

      const oldAsset = assetsStore[index];
      assetsStore[index] = {
        ...oldAsset,
        status: newStatus,
        condition: condition || oldAsset.condition,
        notes: note ? `${oldAsset.notes ? oldAsset.notes + ' | ' : ''}${note}` : oldAsset.notes,
        updatedAt: new Date().toISOString(),
      };

      emitAudit({
        action: 'IT_ASSET_UPDATE',
        module: 'IT',
        targetId: id,
        details: {
          assetCode: oldAsset.assetCode,
          fromStatus: oldAsset.status,
          toStatus: newStatus,
          condition,
        },
      });

      return { data: assetsStore[index], error: null };
    }

    const { data } = await apiClient.patch(`/it/assets/${id}/status`, { status: newStatus, condition, note });
    return data;
  },

  // ── 3. PREVENTIVE MAINTENANCE ──────────────────────────────────────────
  async getMaintenanceSchedules() {
    if (isMock) {
      return { data: maintenanceStore, error: null };
    }
    const { data } = await apiClient.get('/it/maintenance');
    return data;
  },

  // ── 4. SYSTEM HEALTH MONITORING ───────────────────────────────────────
  async getSystemHealth() {
    if (isMock) {
      return { data: MOCK_SYSTEM_HEALTH, error: null };
    }
    const { data } = await apiClient.get('/it/health');
    return data;
  },

  // ── 5. KPI SUMMARY & METRICS ──────────────────────────────────────────
  async getITStats() {
    if (isMock) {
      const totalTickets = ticketsStore.length;
      const openTickets = ticketsStore.filter((t) => t.status === STATUS.OPEN).length;
      const assignedTickets = ticketsStore.filter((t) => t.status === STATUS.ASSIGNED).length;
      const inProgressTickets = ticketsStore.filter((t) => t.status === STATUS.IN_PROGRESS).length;
      const waitingTickets = ticketsStore.filter((t) => t.status === STATUS.WAITING).length;
      const resolvedTickets = ticketsStore.filter((t) => t.status === STATUS.RESOLVED).length;
      const closedTickets = ticketsStore.filter((t) => t.status === STATUS.CLOSED).length;

      const activeTicketsCount = openTickets + assignedTickets + inProgressTickets + waitingTickets;
      const criticalTickets = ticketsStore.filter(
        (t) => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== STATUS.RESOLVED && t.status !== STATUS.CLOSED
      ).length;

      const totalAssets = assetsStore.length;
      const activeAssets = assetsStore.filter((a) => a.status === 'ACTIVE').length;
      const maintenanceAssets = assetsStore.filter((a) => a.status === 'MAINTENANCE' || a.status === 'BROKEN').length;

      // Group tickets by department
      const ticketsByDepartment = ticketsStore.reduce((acc, curr) => {
        acc[curr.department] = (acc[curr.department] || 0) + 1;
        return acc;
      }, {});

      // Group assets by type
      const assetsByType = assetsStore.reduce((acc, curr) => {
        acc[curr.assetType] = (acc[curr.assetType] || 0) + 1;
        return acc;
      }, {});

      return {
        data: {
          totalTickets,
          activeTicketsCount,
          openTickets,
          assignedTickets,
          inProgressTickets,
          waitingTickets,
          resolvedTickets,
          closedTickets,
          criticalTickets,
          totalAssets,
          activeAssets,
          maintenanceAssets,
          ticketsByDepartment,
          assetsByType,
          uptimeHours: MOCK_SYSTEM_HEALTH.uptimeHours,
          overallHealth: MOCK_SYSTEM_HEALTH.overallStatus,
        },
        error: null,
      };
    }

    const { data } = await apiClient.get('/it/stats');
    return data;
  },
};
