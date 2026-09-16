// PT. Bhimasena Adhirajasa Radhika — API Client Abstraction
// Aligned with 04-API-SPEC.md

import { mockService } from '../mock/mockService';

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('barak_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Terjadi kesalahan pada sistem.');
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  login: async (credentials) => {
    if (USE_REAL_API) {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    }
    return mockService.login(credentials);
  },

  register: async (userData) => {
    if (USE_REAL_API) {
      return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    }
    return mockService.register(userData);
  },

  getCurrentUser: async () => {
    if (USE_REAL_API) return request('/auth/me');
    return mockService.getCurrentUser();
  },

  logout: async () => {
    if (USE_REAL_API) return request('/auth/logout', { method: 'POST' });
    return mockService.logout();
  },

  // Users & Roles
  getUsers: async () => {
    if (USE_REAL_API) return request('/users');
    return mockService.getUsers();
  },

  updateUserRole: async (id, role) => {
    if (USE_REAL_API) return request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) });
    return mockService.updateUserRole(id, role);
  },

  // Services
  getServices: async () => {
    if (USE_REAL_API) return request('/services');
    return mockService.getServices();
  },

  // Employees (HRD)
  getEmployees: async (params) => {
    if (USE_REAL_API) {
      const query = new URLSearchParams(params).toString();
      return request(`/employees?${query}`);
    }
    return mockService.getEmployees(params);
  },

  createEmployee: async (data) => {
    if (USE_REAL_API) return request('/employees', { method: 'POST', body: JSON.stringify(data) });
    return mockService.createEmployee(data);
  },

  updateEmployee: async (id, data) => {
    if (USE_REAL_API) return request(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    return mockService.updateEmployee(id, data);
  },

  deleteEmployee: async (id) => {
    if (USE_REAL_API) return request(`/employees/${id}`, { method: 'DELETE' });
    return mockService.deleteEmployee(id);
  },

  // Clients & Sites
  getClients: async (params) => {
    if (USE_REAL_API) {
      const query = new URLSearchParams(params).toString();
      return request(`/clients?${query}`);
    }
    return mockService.getClients(params);
  },

  createClient: async (data) => {
    if (USE_REAL_API) return request('/clients', { method: 'POST', body: JSON.stringify(data) });
    return mockService.createClient(data);
  },

  getSites: async () => {
    if (USE_REAL_API) return request('/sites');
    return mockService.getSites();
  },

  // Invoices (Finance)
  getInvoices: async (params) => {
    if (USE_REAL_API) {
      const query = new URLSearchParams(params).toString();
      return request(`/invoices?${query}`);
    }
    return mockService.getInvoices(params);
  },

  createInvoice: async (data) => {
    if (USE_REAL_API) return request('/invoices', { method: 'POST', body: JSON.stringify(data) });
    return mockService.createInvoice(data);
  },

  updateInvoiceStatus: async (id, status) => {
    if (USE_REAL_API) return request(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    return mockService.updateInvoiceStatus(id, status);
  },

  // Leads (Marketing)
  getLeads: async (params) => {
    if (USE_REAL_API) {
      const query = new URLSearchParams(params).toString();
      return request(`/leads?${query}`);
    }
    return mockService.getLeads(params);
  },

  createLead: async (data) => {
    if (USE_REAL_API) return request('/leads', { method: 'POST', body: JSON.stringify(data) });
    return mockService.createLead(data);
  },

  updateLeadStage: async (id, stage) => {
    if (USE_REAL_API) return request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ stage }) });
    return mockService.updateLeadStage(id, stage);
  },

  // Attendance (HRD / Operasional)
  getAttendance: async (params) => {
    if (USE_REAL_API) {
      const query = new URLSearchParams(params).toString();
      return request(`/attendance?${query}`);
    }
    return mockService.getAttendance(params);
  },

  // Dashboard Summary (Role-aware)
  getDashboardSummary: async (role) => {
    if (USE_REAL_API) return request(`/dashboard/summary?role=${role}`);
    return mockService.getDashboardSummary(role);
  },

  // Activities & Notifications
  getActivities: async () => {
    if (USE_REAL_API) return request('/activities');
    return mockService.getActivities();
  },

  getNotifications: async () => {
    if (USE_REAL_API) return request('/notifications');
    return mockService.getNotifications();
  },

  markNotificationRead: async (id) => {
    if (USE_REAL_API) return request(`/notifications/${id}/read`, { method: 'PATCH' });
    return mockService.markNotificationRead(id);
  },

  // Public Contact Form
  submitContactInquiry: async (data) => {
    if (USE_REAL_API) return request('/public/contact', { method: 'POST', body: JSON.stringify(data) });
    return mockService.submitContactInquiry(data);
  }
};
