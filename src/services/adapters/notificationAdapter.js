/**
 * Notification Service Adapter.
 * Interface: getNotifications(), markRead(id), markAllRead()
 * Source of Truth: API-SPEC.md Section 12, PRD Section 23.
 */

import { isMockMode, apiSuccess } from '@/services/apiClient';
import { MOCK_NOTIFICATIONS } from '@/services/mock/mockNotifications';
import restClient from '@/services/apiClient';

// In-memory store for mock (allows read state changes within session)
let mockStore = [...MOCK_NOTIFICATIONS];

const mockNotifications = {
  async getNotifications({ unreadOnly = false } = {}) {
    await new Promise((r) => setTimeout(r, 300));
    const data = unreadOnly ? mockStore.filter((n) => !n.read) : mockStore;
    return apiSuccess(data, { total: data.length, unread: mockStore.filter((n) => !n.read).length });
  },

  async markRead(id) {
    await new Promise((r) => setTimeout(r, 200));
    mockStore = mockStore.map((n) => (n.id === id ? { ...n, read: true } : n));
    return apiSuccess({ id, read: true });
  },

  async markAllRead() {
    await new Promise((r) => setTimeout(r, 200));
    mockStore = mockStore.map((n) => ({ ...n, read: true }));
    return apiSuccess({ updated: mockStore.length });
  },
};

const restNotifications = {
  async getNotifications() {
    return restClient.get('/notifications');
  },
  async markRead(id) {
    return restClient.patch(`/notifications/${id}/read`, {});
  },
  async markAllRead() {
    return restClient.patch('/notifications/read-all', {});
  },
};

const notificationAdapter = isMockMode() ? mockNotifications : restNotifications;
export default notificationAdapter;
