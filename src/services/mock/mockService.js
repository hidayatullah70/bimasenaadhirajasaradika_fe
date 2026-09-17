// PT. Bhimasena Adhirajasa Radhika — Mock Service Implementation
// Implements async simulation according to 04-API-SPEC.md

import {
  INITIAL_SERVICES,
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_SITES,
  INITIAL_EMPLOYEES,
  INITIAL_INVOICES,
  INITIAL_LEADS,
  INITIAL_ATTENDANCE,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS
} from './mockData';

// Simulated storage in memory (persisted across component life cycle, resets on hard refresh)
let services = [...INITIAL_SERVICES];
let users = [...INITIAL_USERS];
let clients = [...INITIAL_CLIENTS];
let sites = [...INITIAL_SITES];
let employees = [...INITIAL_EMPLOYEES];
let invoices = [...INITIAL_INVOICES];
let leads = [...INITIAL_LEADS];
let attendance = [...INITIAL_ATTENDANCE];
let activities = [...INITIAL_ACTIVITIES];
let notifications = [...INITIAL_NOTIFICATIONS];

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  // Auth
  async login({ email, password }) {
    await delay(300);
    // Find user by email or fallback for quick demo
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (!user) {
      // Check if matching any role prefix
      const roleMatch = users.find(u => u.role === (email || '').toLowerCase().trim());
      if (roleMatch) {
        const token = `mock-jwt-token-${roleMatch.role}-${Date.now()}`;
        localStorage.setItem('barak_auth_token', token);
        localStorage.setItem('barak_user_role', roleMatch.role);
        return {
          success: true,
          message: 'Login berhasil',
          data: { user: roleMatch, token }
        };
      }
      throw new Error('Email atau kata sandi tidak valid. Silakan periksa kembali.');
    }
    const token = `mock-jwt-token-${user.role}-${Date.now()}`;
    localStorage.setItem('barak_auth_token', token);
    localStorage.setItem('barak_user_role', user.role);
    return {
      success: true,
      message: 'Login berhasil',
      data: { user, token }
    };
  },

  async register({ name, email, password, role = 'operasional', phone = '' }) {
    await delay(300);
    const existing = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (existing) {
      throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau langsung login.');
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || 'Pengguna Baru',
      email: email.trim().toLowerCase(),
      role: role || 'operasional',
      phone: phone || '-',
      avatar: '/assets/img/team/person-4.jpeg',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.unshift(newUser);
    const token = `mock-jwt-token-${newUser.role}-${Date.now()}`;
    localStorage.setItem('barak_auth_token', token);
    localStorage.setItem('barak_user_role', newUser.role);
    return {
      success: true,
      message: 'Registrasi berhasil',
      data: { user: newUser, token }
    };
  },

  async getCurrentUser() {
    await delay(150);
    const savedRole = localStorage.getItem('barak_user_role') || 'owner';
    const user = users.find(u => u.role === savedRole) || users[0];
    return {
      success: true,
      data: user
    };
  },

  async logout() {
    await delay(100);
    localStorage.removeItem('barak_auth_token');
    localStorage.removeItem('barak_user_role');
    return { success: true, message: 'Logout berhasil' };
  },

  // Users & Roles (Owner only)
  async createUser(userData) {
    await delay(200);
    const newUser = {
      id: 'usr-' + (users.length + 1),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'operasional',
      roleLabel: userData.role || 'Operasional',
      phone: userData.phone || '-',
      status: 'active',
      lastLogin: '-',
      avatar: userData.avatar_url || '/assets/img/team/person-2.jpeg'
    };
    users.unshift(newUser);
    return {
      success: true,
      data: newUser,
      message: 'Pengguna berhasil ditambahkan.'
    };
  },

  async getUsers() {
    await delay(200);
    return { success: true, data: [...users] };
  },

  async updateUserRole(id, newRole) {
    await delay(250);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Pengguna tidak ditemukan');
    users[index] = { ...users[index], role: newRole };
    return { success: true, message: 'Role pengguna berhasil diperbarui', data: users[index] };
  },

  // Services
  async getServices() {
    await delay(150);
    return { success: true, data: [...services] };
  },

  // Employees
  async getEmployees({ search = '', service = '', status = '', page = 1, limit = 10 } = {}) {
    await delay(250);
    let filtered = [...employees];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.nik.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.siteName.toLowerCase().includes(q) ||
        e.clientName.toLowerCase().includes(q)
      );
    }

    if (service && service !== 'all') {
      filtered = filtered.filter(e => e.service.toLowerCase().includes(service.toLowerCase()));
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(e => e.status === status);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  async createEmployee(data) {
    await delay(300);
    const newEmp = {
      id: `emp-${Date.now()}`,
      nik: `BA-${new Date().getFullYear()}-${String(employees.length + 1).padStart(3, '0')}`,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      contractEnd: `${new Date().getFullYear() + 1}-12-31`,
      ...data
    };
    employees = [newEmp, ...employees];
    
    // add activity
    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'Siti Nurhaliza, S.Psi',
      role: 'hrd',
      action: 'Penambahan Tenaga Kerja Baru',
      description: `Menambahkan personil baru: ${newEmp.name} (${newEmp.service})`,
      timestamp: 'Baru saja'
    });

    return { success: true, message: 'Data tenaga kerja berhasil ditambahkan', data: newEmp };
  },

  async updateEmployee(id, data) {
    await delay(250);
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Data karyawan tidak ditemukan');
    employees[index] = { ...employees[index], ...data };
    return { success: true, message: 'Data karyawan berhasil diperbarui', data: employees[index] };
  },

  async deleteEmployee(id) {
    await delay(250);
    const item = employees.find(e => e.id === id);
    if (!item) throw new Error('Data karyawan tidak ditemukan');
    employees = employees.filter(e => e.id !== id);
    return { success: true, message: `Data karyawan ${item.name} berhasil dihapus` };
  },

  // Clients & Sites
  async getClients({ search = '' } = {}) {
    await delay(200);
    let filtered = [...clients];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q)
      );
    }
    return { success: true, data: filtered };
  },

  async createClient(data) {
    await delay(300);
    const newClient = {
      id: `cli-${Date.now()}`,
      status: 'active',
      activeSites: 1,
      activeHeadcount: Number(data.activeHeadcount) || 10,
      ...data
    };
    clients = [newClient, ...clients];
    return { success: true, message: 'Klien baru berhasil ditambahkan', data: newClient };
  },

  async getSites() {
    await delay(200);
    return { success: true, data: [...sites] };
  },

  // Invoices & Billing
  async getInvoices({ search = '', status = 'all' } = {}) {
    await delay(250);
    let filtered = [...invoices];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        inv.serviceType.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(inv => inv.status === status);
    }

    return { success: true, data: filtered };
  },

  async createInvoice(data) {
    await delay(300);
    const subtotal = Number(data.subtotal) || 100000000;
    const ppn = Math.round(subtotal * 0.11);
    const total = subtotal + ppn;
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV/BAR/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(invoices.length + 1).padStart(3, '0')}`,
      status: 'pending',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      subtotal,
      ppn,
      total,
      ...data
    };
    invoices = [newInv, ...invoices];

    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'Dewi Kartika, S.E., Ak.',
      role: 'finance',
      action: 'Penerbitan Invoice Baru',
      description: `Menerbitkan invoice ${newInv.invoiceNumber} untuk ${newInv.clientName}`,
      timestamp: 'Baru saja'
    });

    return { success: true, message: 'Invoice baru berhasil diterbitkan', data: newInv };
  },

  async updateInvoiceStatus(id, newStatus) {
    await delay(200);
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) throw new Error('Invoice tidak ditemukan');
    invoices[index] = {
      ...invoices[index],
      status: newStatus,
      paidDate: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : invoices[index].paidDate
    };
    return { success: true, message: `Status invoice berhasil diubah menjadi ${newStatus}`, data: invoices[index] };
  },

  // Leads & CRM
  async getLeads({ search = '', stage = 'all' } = {}) {
    await delay(250);
    let filtered = [...leads];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(l =>
        l.company.toLowerCase().includes(q) ||
        l.picName.toLowerCase().includes(q) ||
        l.serviceInterested.toLowerCase().includes(q)
      );
    }

    if (stage && stage !== 'all') {
      filtered = filtered.filter(l => l.stage === stage);
    }

    return { success: true, data: filtered };
  },

  async createLead(data) {
    await delay(300);
    const newLead = {
      id: `led-${Date.now()}`,
      stage: 'baru',
      probability: '30%',
      createdAt: new Date().toISOString().split('T')[0],
      ...data
    };
    leads = [newLead, ...leads];

    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'Rian Pratama, B.B.A',
      role: 'marketing',
      action: 'Pendaftaran Prospek Klien Baru',
      description: `Mendaftarkan prospek baru: ${newLead.company}`,
      timestamp: 'Baru saja'
    });

    return { success: true, message: 'Prospek baru berhasil dicatat', data: newLead };
  },

  async updateLeadStage(id, newStage) {
    await delay(200);
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Data prospek tidak ditemukan');
    const probabilityMap = {
      baru: '30%',
      diskusi: '50%',
      penawaran: '75%',
      negosiasi: '90%',
      menang: '100%'
    };
    leads[index] = {
      ...leads[index],
      stage: newStage,
      probability: probabilityMap[newStage] || leads[index].probability
    };
    return { success: true, message: 'Status tahapan prospek berhasil diperbarui', data: leads[index] };
  },

  // Attendance
  async getAttendance({ search = '', service = 'all', status = 'all' } = {}) {
    await delay(200);
    let filtered = [...attendance];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.employeeName.toLowerCase().includes(q) ||
        a.siteName.toLowerCase().includes(q)
      );
    }

    if (service && service !== 'all') {
      filtered = filtered.filter(a => a.service.toLowerCase().includes(service.toLowerCase()));
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(a => a.status === status);
    }

    return { success: true, data: filtered };
  },

  // Dashboard Role-Aware Summary
  async getDashboardSummary(role = 'owner') {
    await delay(300);

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const totalClients = clients.length;
    const totalSites = sites.length;
    const totalInvoicesValue = invoices.reduce((sum, i) => sum + i.total, 0);
    const paidInvoicesValue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    const pendingInvoicesValue = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0);
    const overdueInvoicesValue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);
    const totalLeadsValue = leads.reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);
    const openLeadsCount = leads.filter(l => l.stage !== 'menang').length;

    return {
      success: true,
      data: {
        role,
        kpi: {
          totalEmployees: 1520, // Company wide scale as per PRD/SOT
          activeSites: totalSites,
          totalClients: 48,
          attendanceRate: '99.4%',
          monthlyRevenue: 'Rp 1.466.000.000',
          pendingReceivables: 'Rp 505.050.000',
          activePipelineValue: 'Rp 585.000.000',
          openIncidents: 0,
          shiftCompliance: '99.8%'
        },
        servicesSummary: services.map(s => ({
          title: s.title,
          activePersonnel: s.activePersonnel,
          clientCount: s.clientCount
        })),
        recentActivities: activities.slice(0, 5),
        recentInvoices: invoices.slice(0, 4),
        recentLeads: leads.slice(0, 4)
      }
    };
  },

  // Activities & Notifications
  async getActivities() {
    await delay(200);
    return { success: true, data: [...activities] };
  },

  async getNotifications() {
    await delay(150);
    return { success: true, data: [...notifications] };
  },

  async markNotificationRead(id) {
    await delay(100);
    notifications = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    return { success: true, message: 'Notifikasi ditandai sudah dibaca' };
  },

  // Public Contact Inquiry Submission
  async submitContactInquiry(inquiryData) {
    await delay(400);
    // Create new lead in CRM automatically
    const newLead = {
      id: `led-${Date.now()}`,
      company: inquiryData.company || inquiryData.name,
      picName: inquiryData.name,
      picPhone: inquiryData.phone,
      email: inquiryData.email,
      serviceInterested: inquiryData.service || 'Konsultasi Umum',
      requestedHeadcount: Number(inquiryData.headcount) || 10,
      estimatedValue: (Number(inquiryData.headcount) || 10) * 3500000,
      stage: 'baru',
      probability: '30%',
      source: 'Website Landing Page Form',
      notes: inquiryData.message || 'Permintaan konsultasi penawaran',
      createdAt: new Date().toISOString().split('T')[0]
    };
    leads.unshift(newLead);

    // Add activity log
    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'Sistem Website',
      role: 'marketing',
      action: 'Inquiry Klien Masuk',
      description: `Inquiry baru dari ${inquiryData.name} (${inquiryData.company || 'Perorangan'}) - Layanan: ${inquiryData.service}`,
      timestamp: 'Baru saja'
    });

    // Add notification
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Inquiry Konsultasi Baru',
      message: `Permintaan konsultasi layanan ${inquiryData.service} dari ${inquiryData.company || inquiryData.name}.`,
      time: 'Baru saja',
      unread: true,
      type: 'marketing'
    });

    return {
      success: true,
      message: 'Terima kasih! Permintaan konsultasi Anda telah berhasil kami terima. Tim Business Development kami akan menghubungi Anda dalam waktu 1x24 jam kerja.',
      data: { ticketId: `BAR-REQ-${Math.floor(100000 + Math.random() * 900000)}` }
    };
  }
};
