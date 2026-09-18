// PT. Bhimasena Adhirajasa Radhika — API Client Abstraction
// Aligned with SOT/04-API-SPEC.md, collection.json & SOT/API-INTEGRATION.md

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bimasenaadhirajasaradikabe-production.up.railway.app/api/v1';

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
  },

  getCurrentUser: async () => {
    return request('/auth/me');
  },

  refreshToken: async () => {
    const res = await request('/auth/refresh', { method: 'POST' });
    if (res?.data?.token) {
      localStorage.setItem('barak_auth_token', res.data.token);
    }
    return res;
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

  // 02. Dashboard KPI Summary (Role-aware)
  getDashboardSummary: async (role = 'direktur') => {
    const roleParam = role === 'owner' ? 'direktur' : role;
    return request(`/dashboard/summary?role=${encodeURIComponent(roleParam)}`);
  },

  // 03. Employees / Karyawan (CRUD)
  getEmployees: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/employees${query ? `?${query}` : ''}`);
  },

  getEmployeeById: async (id) => {
    return request(`/employees/${id}`);
  },

  createEmployee: async (data) => {
    return request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEmployee: async (id, data) => {
    return request(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteEmployee: async (id) => {
    return request(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  // 04. Clients / Mitra Klien (CRUD)
  getClients: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/clients${query ? `?${query}` : ''}`);
  },

  getClientById: async (id) => {
    return request(`/clients/${id}`);
  },

  createClient: async (data) => {
    return request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateClient: async (id, data) => {
    return request(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteClient: async (id) => {
    return request(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  // 05. Sites / Lokasi Kerja (CRUD)
  getSites: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/sites${query ? `?${query}` : ''}`);
  },

  getSiteById: async (id) => {
    return request(`/sites/${id}`);
  },

  createSite: async (data) => {
    return request('/sites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSite: async (id, data) => {
    return request(`/sites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteSite: async (id) => {
    return request(`/sites/${id}`, {
      method: 'DELETE',
    });
  },

  // 06. Services / Layanan Outsourcing (CRUD)
  getServices: async () => {
    return request('/services');
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
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/placements${query ? `?${query}` : ''}`);
  },

  getPlacementById: async (id) => {
    return request(`/placements/${id}`);
  },

  createPlacement: async (data) => {
    return request('/placements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePlacement: async (id, data) => {
    return request(`/placements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deletePlacement: async (id) => {
    return request(`/placements/${id}`, {
      method: 'DELETE',
    });
  },

  // 08. Attendance / Presensi (CRUD)
  getAttendance: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/attendance${query ? `?${query}` : ''}`);
  },

  getTodayAttendance: async () => {
    return request('/attendance/today');
  },

  getAttendanceById: async (id) => {
    return request(`/attendance/${id}`);
  },

  recordAttendance: async (data) => {
    return request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAttendance: async (id, data) => {
    return request(`/attendance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 09. Invoices / Keuangan (CRUD)
  getInvoices: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/invoices${query ? `?${query}` : ''}`);
  },

  getInvoiceById: async (id) => {
    return request(`/invoices/${id}`);
  },

  createInvoice: async (data) => {
    return request('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateInvoiceStatus: async (id, updateData) => {
    const payload = typeof updateData === 'string' ? { status: updateData } : updateData;
    return request(`/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteInvoice: async (id) => {
    return request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },

  // 10. Leads / CRM Marketing (CRUD)
  getLeads: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/leads${query ? `?${query}` : ''}`);
  },

  getLeadById: async (id) => {
    return request(`/leads/${id}`);
  },

  createLead: async (data) => {
    return request('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLead: async (id, data) => {
    return request(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateLeadStage: async (id, stage) => {
    const payload = typeof stage === 'string' ? { status: stage } : stage;
    return request(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteLead: async (id) => {
    return request(`/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // 11. Activities & Audit Trail
  getActivities: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/activities${query ? `?${query}` : ''}`);
  },

  getActivityById: async (id) => {
    return request(`/activities/${id}`);
  },

  // 12. Notifications
  getNotifications: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/notifications${query ? `?${query}` : ''}`);
  },

  markNotificationRead: async (id) => {
    return request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllNotificationsRead: async () => {
    return request('/notifications/mark-all-read', {
      method: 'POST',
    });
  },

  // 13. Users & Roles (Direktur Only)
  getUsers: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },

  getMasterRoles: async () => {
    return request('/users/roles');
  },

  getUserById: async (id) => {
    return request(`/users/${id}`);
  },

  createUser: async (userData) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id, data) => {
    return request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateUserRole: async (id, roleOrData) => {
    const payload = typeof roleOrData === 'object' ? roleOrData : { role: roleOrData };
    return request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteUser: async (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // 14. Public Endpoints
  getPublicServices: async () => {
    return request('/public/services');
  },

  submitContactInquiry: async (data) => {
    // Standard public lead submission
    const payload = {
      company_name: data.company || data.company_name || 'Individual / Personal',
      contact_name: data.name || data.contact_name,
      email: data.email,
      phone: data.phone,
      service_interest: data.service || data.service_interest || 'Security & Guard Services',
      message: data.message || data.notes || 'Permohonan konsultasi alih daya'
    };

    try {
      return await request('/public/lead', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Fallback to /leads if public endpoint routes differently
      return request('/leads', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  },
};
