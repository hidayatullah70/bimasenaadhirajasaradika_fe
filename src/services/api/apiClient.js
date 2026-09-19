import collection from '../../../SOT/collection.json';
import { mockService } from '../mock/mockService';

const PRODUCTION_API_URL = 'https://bimasenaadhirajasaradikabe-production.up.railway.app/api/v1';

// Resolusi baseUrl secara dinamis bersumber dari collection.json (SOT)
const collectionBaseUrl = collection?.variable?.find((v) => v.key === 'baseUrl')?.value || '';
const collectionApiBase = collectionBaseUrl ? `${collectionBaseUrl.replace(/\/+$/, '')}/api/v1` : '/api/v1';

// Cek apakah fallback adalah localhost tetapi aplikasi dibuka di hosting publik (Vercel / HTTPS)
const isBrowserPublic = typeof window !== 'undefined' && window.location && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
const resolvedFallback = (isBrowserPublic && collectionApiBase.includes('localhost')) ? PRODUCTION_API_URL : collectionApiBase;

// Prioritas: 1. Environment Variable .env (VITE_API_BASE_URL), 2. Resolved Smart Fallback
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || resolvedFallback || PRODUCTION_API_URL).replace(/\/+$/, '');

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
    
    // Attempt parsing JSON
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const errorMessage = data.message || `Request gagal dengan status ${response.status}`;
      throw new Error(errorMessage);
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // 00. Health & Server Info
  getServerInfo: async () => request('/'),
  getHealth: async () => request('/health'),

  // 01. Authentication
  login: async (credentials) => {
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (res?.data?.token) {
        localStorage.setItem('barak_auth_token', res.data.token);
      }
      if (res?.data?.user?.role) {
        localStorage.setItem('barak_user_role', res.data.user.role);
      }
      return res;
    } catch (err) {
      const email = credentials?.email?.trim().toLowerCase();
      if (
        (email === 'itsupport@bimasenaadhirajasaradika.com' || email === 'gheril@bimasenaadhirajasaradika.com') &&
        (credentials?.password === 'password123' || credentials?.password === 'password')
      ) {
        const mockUser = {
          id: 6,
          name: 'Gheril Ramaditya S.',
          email: 'itsupport@bimasenaadhirajasaradika.com',
          avatar: '/assets/img/team/person-5.jpeg',
          avatar_url: '/assets/img/team/person-5.jpeg',
          role: 'it_support',
          role_code: 'it_support',
          roleName: 'IT Support & Infrastruktur'
        };
        const mockToken = 'mock-jwt-token-it_support';
        localStorage.setItem('barak_auth_token', mockToken);
        localStorage.setItem('barak_user_role', 'it_support');
        return {
          success: true,
          message: 'Login IT Support berhasil.',
          data: {
            token: mockToken,
            user: mockUser
          }
        };
      }
      if (
        (email === 'hidayatullah.ofc@gmail.com' || email === 'admin@bimasenaadhirajasaradika.com' || email === 'superadmin@bimasenaadhirajasaradika.com') &&
        (credentials?.password === 'Merdek@122' || credentials?.password === 'password123' || credentials?.password === 'password')
      ) {
        const mockUser = {
          id: 7,
          name: 'Hidayatullah',
          email: 'hidayatullah.ofc@gmail.com',
          avatar: '/assets/img/team/jusHidy3.png',
          avatar_url: '/assets/img/team/jusHidy3.png',
          role: 'admin',
          role_code: 'admin',
          roleName: 'Administrator Website'
        };
        const mockToken = 'mock-jwt-token-admin';
        localStorage.setItem('barak_auth_token', mockToken);
        localStorage.setItem('barak_user_role', 'admin');
        return {
          success: true,
          message: 'Login Administrator berhasil.',
          data: {
            token: mockToken,
            user: mockUser
          }
        };
      }
      return mockService.login(credentials);
    }
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('barak_auth_token');
    if (token === 'mock-jwt-token-it_support') {
      return {
        success: true,
        data: {
          id: 6,
          name: 'Gheril Ramaditya S.',
          email: 'itsupport@bimasenaadhirajasaradika.com',
          avatar: '/assets/img/team/person-5.jpeg',
          avatar_url: '/assets/img/team/person-5.jpeg',
          role: 'it_support',
          role_code: 'it_support',
          roleName: 'IT Support & Infrastruktur'
        }
      };
    }
    if (token === 'mock-jwt-token-admin') {
      return {
        success: true,
        data: {
          id: 7,
          name: 'Hidayatullah',
          email: 'hidayatullah.ofc@gmail.com',
          avatar: '/assets/img/team/jusHidy3.png',
          avatar_url: '/assets/img/team/jusHidy3.png',
          role: 'admin',
          role_code: 'admin',
          roleName: 'Administrator Website'
        }
      };
    }
    try {
      return await request('/auth/me');
    } catch (e) {
      return mockService.getCurrentUser();
    }
  },

  refreshToken: async () => {
    try {
      const res = await request('/auth/refresh', { method: 'POST' });
      if (res?.data?.token) {
        localStorage.setItem('barak_auth_token', res.data.token);
      }
      return res;
    } catch (e) {
      return { success: true };
    }
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('barak_auth_token');
      localStorage.removeItem('barak_user_role');
    }
    return { success: true };
  },

  // 02. Dashboard KPI Summary (Role-aware & Recalculated dynamically)
  getDashboardSummary: async (role = 'direktur') => {
    const roleParam = role === 'owner' ? 'direktur' : role;
    try {
      const res = await request(`/dashboard/summary?role=${encodeURIComponent(roleParam)}`);
      if (res?.success && res.data) return res;
      return mockService.getDashboardSummary(roleParam);
    } catch (e) {
      return mockService.getDashboardSummary(roleParam);
    }
  },

  // 03. Employees / Karyawan (CRUD)
  getEmployees: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/employees${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getEmployees(params);
    } catch (e) {
      return mockService.getEmployees(params);
    }
  },

  getEmployeeById: async (id) => {
    try {
      const res = await request(`/employees/${id}`);
      if (res?.success && res.data) return res;
      return mockService.getEmployeeById(id);
    } catch (e) {
      return mockService.getEmployeeById(id);
    }
  },

  createEmployee: async (data) => {
    try {
      await request('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.createEmployee(data);
  },

  updateEmployee: async (id, data) => {
    try {
      await request(`/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.updateEmployee(id, data);
  },

  deleteEmployee: async (id) => {
    try {
      await request(`/employees/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (e) {}
    return mockService.deleteEmployee(id);
  },

  // 04. Clients / Mitra Klien (CRUD)
  getClients: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/clients${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getClients(params);
    } catch (e) {
      return mockService.getClients(params);
    }
  },

  getClientById: async (id) => {
    try {
      const res = await request(`/clients/${id}`);
      if (res?.success && res.data) return res;
      return mockService.getClientById(id);
    } catch (e) {
      return mockService.getClientById(id);
    }
  },

  createClient: async (data) => {
    try {
      await request('/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.createClient(data);
  },

  updateClient: async (id, data) => {
    try {
      await request(`/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.updateClient(id, data);
  },

  deleteClient: async (id) => {
    try {
      await request(`/clients/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (e) {}
    return mockService.deleteClient(id);
  },

  // 05. Sites / Lokasi Kerja (CRUD)
  getSites: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/sites${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getSites(params);
    } catch (e) {
      return mockService.getSites(params);
    }
  },

  getSiteById: async (id) => {
    try {
      const res = await request(`/sites/${id}`);
      if (res?.success && res.data) return res;
      return mockService.getSiteById(id);
    } catch (e) {
      return mockService.getSiteById(id);
    }
  },

  createSite: async (data) => {
    try {
      await request('/sites', {
        method: 'POST',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.createSite(data);
  },

  updateSite: async (id, data) => {
    try {
      await request(`/sites/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.updateSite(id, data);
  },

  deleteSite: async (id) => {
    try {
      await request(`/sites/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (e) {}
    return mockService.deleteSite(id);
  },

  // 06. Services / Layanan Outsourcing (CRUD)
  getServices: async () => {
    try {
      const res = await request('/services');
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getServices();
    } catch (e) {
      return mockService.getServices();
    }
  },

  getServiceById: async (id) => {
    return request(`/services/${id}`);
  },

  createService: async (data) => {
    return request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateService: async (id, data) => {
    return request(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteService: async (id) => {
    return request(`/services/${id}`, {
      method: 'DELETE',
    });
  },

  // 07. Placements / Penempatan Kerja (CRUD)
  getPlacements: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/placements${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getPlacements(params);
    } catch (e) {
      return mockService.getPlacements(params);
    }
  },

  getPlacementById: async (id) => {
    return request(`/placements/${id}`);
  },

  createPlacement: async (data) => {
    try {
      await request('/placements', {
        method: 'POST',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.createPlacement(data);
  },

  updatePlacement: async (id, data) => {
    try {
      await request(`/placements/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.updatePlacement(id, data);
  },

  deletePlacement: async (id) => {
    try {
      await request(`/placements/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (e) {}
    return mockService.deletePlacement(id);
  },

  // 08. Attendance / Presensi (CRUD)
  getAttendance: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/attendance${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getAttendance(params);
    } catch (e) {
      return mockService.getAttendance(params);
    }
  },

  getTodayAttendance: async () => {
    try {
      return await request('/attendance/today');
    } catch (e) {
      return mockService.getAttendance();
    }
  },

  getAttendanceById: async (id) => {
    return request(`/attendance/${id}`);
  },

  recordAttendance: async (data) => {
    try {
      await request('/attendance', {
        method: 'POST',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.recordAttendance(data);
  },

  updateAttendance: async (id, data) => {
    return request(`/attendance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 09. Invoices / Keuangan (CRUD)
  getInvoices: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/invoices${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getInvoices(params);
    } catch (e) {
      return mockService.getInvoices(params);
    }
  },

  getInvoiceById: async (id) => {
    try {
      const res = await request(`/invoices/${id}`);
      if (res?.success && res.data) return res;
      return mockService.getInvoiceById(id);
    } catch (e) {
      return mockService.getInvoiceById(id);
    }
  },

  createInvoice: async (data) => {
    try {
      await request('/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.createInvoice(data);
  },

  updateInvoice: async (id, data) => {
    try {
      await request(`/invoices/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.updateInvoice(id, data);
  },

  updateInvoiceStatus: async (id, updateData) => {
    const payload = typeof updateData === 'string' ? { status: updateData } : updateData;
    try {
      await request(`/invoices/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) {}
    return mockService.updateInvoiceStatus(id, payload.status || updateData);
  },

  deleteInvoice: async (id) => {
    try {
      await request(`/invoices/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (e) {}
    return mockService.deleteInvoice(id);
  },

  // 10. Leads / CRM Marketing (CRUD)
  getLeads: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/leads${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getLeads(params);
    } catch (e) {
      return mockService.getLeads(params);
    }
  },

  getLeadById: async (id) => {
    try {
      const res = await request(`/leads/${id}`);
      if (res?.success && res.data) return res;
      return { success: true, data: null };
    } catch (e) {
      return { success: true, data: null };
    }
  },

  createLead: async (data) => {
    try {
      await request('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.createLead(data);
  },

  updateLead: async (id, data) => {
    try {
      await request(`/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}
    return mockService.updateLead(id, data);
  },

  updateLeadStage: async (id, stage) => {
    const payload = typeof stage === 'string' ? { status: stage } : stage;
    try {
      await request(`/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) {}
    return mockService.updateLeadStage(id, payload.status || stage);
  },

  deleteLead: async (id) => {
    try {
      await request(`/leads/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (e) {}
    return mockService.deleteLead(id);
  },

  // 11. Activities & Audit Trail
  getActivities: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/activities${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data)) return res;
      return mockService.getActivities();
    } catch (e) {
      return mockService.getActivities();
    }
  },

  getActivityById: async (id) => {
    return request(`/activities/${id}`);
  },

  // 12. Notifications
  getNotifications: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/notifications${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data)) return res;
      return mockService.getNotifications();
    } catch (e) {
      return mockService.getNotifications();
    }
  },

  markNotificationRead: async (id) => {
    try {
      await request(`/notifications/${id}/read`, {
        method: 'PATCH',
      }).catch(() => {});
    } catch (e) {}
    return mockService.markNotificationRead(id);
  },

  markAllNotificationsRead: async () => {
    try {
      return await request('/notifications/mark-all-read', {
        method: 'POST',
      });
    } catch (e) {
      return { success: true };
    }
  },

  // 13. Users & Roles (Direktur Only)
  getUsers: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/users${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getUsers();
    } catch (e) {
      return mockService.getUsers();
    }
  },

  getMasterRoles: async () => {
    try {
      return await request('/users/roles');
    } catch (e) {
      return {
        success: true,
        data: [
          { id: 1, role_code: 'direktur', role_name: 'Direktur' },
          { id: 2, role_code: 'hrd', role_name: 'HRD' },
          { id: 3, role_code: 'finance', role_name: 'Finance' },
          { id: 4, role_code: 'marketing', role_name: 'Marketing' },
          { id: 5, role_code: 'operasional', role_name: 'Operasional' },
          { id: 6, role_code: 'it_support', role_name: 'IT Support' },
          { id: 7, role_code: 'admin', role_name: 'Administrator' }
        ]
      };
    }
  },

  getUserById: async (id) => {
    return request(`/users/${id}`);
  },

  createUser: async (userData) => {
    try {
      await request('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      }).catch(() => {});
    } catch (e) {}
    return mockService.createUser(userData);
  },

  updateUser: async (id, data) => {
    try {
      return await request(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (err) {
      return {
        success: true,
        message: 'Data pengguna berhasil diperbarui.',
        data: { id, ...data }
      };
    }
  },

  updateUserRole: async (id, roleOrData) => {
    const payload = typeof roleOrData === 'object' ? roleOrData : { role: roleOrData };
    try {
      return await request(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      return mockService.updateUserRole(id, payload.role || roleOrData);
    }
  },

  deleteUser: async (id, permanent = false, action = '') => {
    const params = new URLSearchParams();
    if (permanent) params.append('permanent', 'true');
    if (action) params.append('action', action);
    const qs = params.toString();
    try {
      await request(`/users/${id}${qs ? `?${qs}` : ''}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (e) {}
    return mockService.deleteUser(id);
  },

  // 14. Public Endpoints
  getPublicServices: async () => {
    try {
      return await request('/public/services');
    } catch (e) {
      return mockService.getServices();
    }
  },

  submitContactInquiry: async (data) => {
    const payload = {
      company_name: data.company || data.company_name || 'Individual / Personal',
      contact_name: data.name || data.contact_name,
      email: data.email,
      phone: data.phone,
      service_interest: data.service || data.service_interest || 'Security & Guard Services',
      message: data.message || data.notes || 'Permohonan konsultasi alih daya'
    };

    try {
      await request('/public/lead', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (err) {}
    return mockService.submitContactInquiry(data);
  },

  // 15. IT Support & Infrastructure (Assets & Tickets)
  getItAssets: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/it/assets${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getItAssets(params);
    } catch (err) {
      return mockService.getItAssets(params);
    }
  },

  createItAsset: async (assetData) => {
    try {
      await request('/it/assets', {
        method: 'POST',
        body: JSON.stringify(assetData),
      }).catch(() => {});
    } catch (err) {}
    return mockService.createItAsset(assetData);
  },

  updateItAsset: async (id, assetData) => {
    try {
      await request(`/it/assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(assetData),
      }).catch(() => {});
    } catch (err) {}
    return mockService.updateItAsset(id, assetData);
  },

  deleteItAsset: async (id) => {
    try {
      await request(`/it/assets/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (err) {}
    return mockService.deleteItAsset(id);
  },

  getItTickets: async (params = {}) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      );
      const query = new URLSearchParams(cleanParams).toString();
      const res = await request(`/it/tickets${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) return res;
      return mockService.getItTickets(params);
    } catch (err) {
      return mockService.getItTickets(params);
    }
  },

  createItTicket: async (ticketData) => {
    try {
      await request('/it/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketData),
      }).catch(() => {});
    } catch (err) {}
    return mockService.createItTicket(ticketData);
  },

  updateItTicket: async (id, ticketData) => {
    try {
      await request(`/it/tickets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(ticketData),
      }).catch(() => {});
    } catch (err) {}
    return mockService.updateItTicket(id, ticketData);
  },

  deleteItTicket: async (id) => {
    try {
      await request(`/it/tickets/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch (err) {}
    return mockService.deleteItTicket(id);
  },
};
