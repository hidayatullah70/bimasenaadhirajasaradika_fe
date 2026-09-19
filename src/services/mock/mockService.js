// PT. Bhimasena Adhirajasa Radhika — Mock Service Implementation
// Implements async simulation according to 04-API-SPEC.md & synchronizes with Rekapitulasi & Dashboards
// Full Hard-Delete Persistence: Permanently purged items are never displayed again across any view

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

// Storage & Persistent Deletion Tracking
function getDeletedIds(key) {
  try {
    const raw = localStorage.getItem(`barak_deleted_ids_${key}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

function saveDeletedId(key, id) {
  try {
    const set = getDeletedIds(key);
    set.add(String(id));
    localStorage.setItem(`barak_deleted_ids_${key}`, JSON.stringify([...set]));
  } catch (e) {
    console.warn(`Failed to save deleted id for ${key}:`, e);
  }
}

function loadStore(key, defaultData) {
  const deletedSet = getDeletedIds(key);
  const isDeleted = (item) => {
    if (!item) return false;
    if (item.id && deletedSet.has(String(item.id))) return true;
    if (item.email && deletedSet.has(String(item.email).toLowerCase())) return true;
    if (item.nik && deletedSet.has(String(item.nik))) return true;
    if (item.employee_no && deletedSet.has(String(item.employee_no))) return true;
    if (item.employeeNo && deletedSet.has(String(item.employeeNo))) return true;
    if (item.serial_no && deletedSet.has(String(item.serial_no))) return true;
    if (item.serialNo && deletedSet.has(String(item.serialNo))) return true;
    if (item.invoice_no && deletedSet.has(String(item.invoice_no))) return true;
    if (item.invoiceNumber && deletedSet.has(String(item.invoiceNumber))) return true;
    if (item.client_code && deletedSet.has(String(item.client_code))) return true;
    return false;
  };

  try {
    const raw = localStorage.getItem(`barak_store_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => !isDeleted(item));
      }
    }
  } catch (e) {
    console.warn(`Failed to read storage for ${key}:`, e);
  }
  return (defaultData || []).filter(item => !isDeleted(item));
}

function saveStore(key, data) {
  try {
    localStorage.setItem(`barak_store_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save storage for ${key}:`, e);
  }
}

// In-Memory Live Stores initialized from localStorage or baseline mockData
let services = loadStore('services', INITIAL_SERVICES);
let users = loadStore('users', INITIAL_USERS);
let clients = loadStore('clients', INITIAL_CLIENTS);
let sites = loadStore('sites', INITIAL_SITES);
let employees = loadStore('employees', INITIAL_EMPLOYEES);
let invoices = loadStore('invoices', INITIAL_INVOICES);
let leads = loadStore('leads', INITIAL_LEADS);
let attendance = loadStore('attendance', INITIAL_ATTENDANCE);
let activities = loadStore('activities', INITIAL_ACTIVITIES);
let notifications = loadStore('notifications', INITIAL_NOTIFICATIONS);

let placements = loadStore('placements', [
  {
    id: 1,
    employee_id: 'emp-101',
    employee_name: 'Ahmad Faisal',
    client_id: 'cli-1',
    client_name: 'PT Menara Graha Mandiri',
    site_id: 'ste-1',
    site_name: 'Gedung Graha Mandiri Tower A & B',
    service: 'Security & Guard Services',
    position: 'Komandan Regu (Danru)',
    start_date: '2024-01-15',
    end_date: '2026-12-31',
    status: 'active'
  },
  {
    id: 2,
    employee_id: 'emp-102',
    employee_name: 'Bagus Setiawan',
    client_id: 'cli-1',
    client_name: 'PT Menara Graha Mandiri',
    site_id: 'ste-1',
    site_name: 'Gedung Graha Mandiri Tower A & B',
    service: 'Security & Guard Services',
    position: 'Anggota Garda Pengamanan',
    start_date: '2024-03-01',
    end_date: '2026-12-31',
    status: 'active'
  },
  {
    id: 3,
    employee_id: 'emp-103',
    employee_name: 'Rudi Hermawan',
    client_id: 'cli-2',
    client_name: 'PT Logistik Nusantara Prima',
    site_id: 'ste-3',
    site_name: 'Central Distribution Hub Cikarang',
    service: 'General Labor & Warehousing',
    position: 'Lead Rider Ekspedisi',
    start_date: '2024-02-10',
    end_date: '2026-12-31',
    status: 'active'
  }
]);

let itAssets = loadStore('it_assets', [
  {
    id: 'AST-BIO-001',
    name: 'ZKTeco FacePass 7 Biometric Terminal',
    category: 'Biometric Attendance',
    site: 'PT. Telkom Indonesia Tbk (Lantai 1 Lobi Utama)',
    serial_no: 'ZK-2026-TLK-0199',
    ip_address: '192.168.10.45',
    last_sync: '1 menit yang lalu',
    firmware: 'v4.2.1-prod',
    status: 'online'
  },
  {
    id: 'AST-BIO-002',
    name: 'Hikvision Face & Fingerprint Terminal',
    category: 'Biometric Attendance',
    site: 'PT. Mayora Indah Tbk (Pintu Masuk Karyawan)',
    serial_no: 'HIK-MYR-8821-B',
    ip_address: '192.168.20.12',
    last_sync: '5 menit yang lalu',
    firmware: 'v3.8.0-barak',
    status: 'online'
  },
  {
    id: 'AST-PAT-001',
    name: 'JWM Guard Tour RFID Patrol Wand (V9)',
    category: 'Security Patrol Device',
    site: 'RS Siloam Hospital Lippo Village',
    serial_no: 'JWM-SLM-0044',
    ip_address: 'N/A (Docking Sync)',
    last_sync: '15 menit yang lalu',
    firmware: 'v2.1.0',
    status: 'online'
  },
  {
    id: 'AST-PAT-002',
    name: 'JWM Guard Tour GPS Wand',
    category: 'Security Patrol Device',
    site: 'PT. Gudang Garam Tbk (Area Gudang A)',
    serial_no: 'JWM-GG-0112',
    ip_address: 'Cellular 4G SIM',
    last_sync: '2 jam yang lalu',
    firmware: 'v2.1.0',
    status: 'offline'
  },
  {
    id: 'AST-CCTV-001',
    name: 'Dahua 32-Ch 4K NVR Command Center',
    category: 'CCTV Surveillance',
    site: 'Kantor Pusat PT. BARAK (Security HQ)',
    serial_no: 'DH-NVR-HQ-001',
    ip_address: '10.0.1.50',
    last_sync: 'Realtime Stream',
    firmware: 'v5.0.2',
    status: 'online'
  },
  {
    id: 'AST-LAP-001',
    name: 'ThinkPad T14 Gen 4 - Operasional Dispatch',
    category: 'Office Workstation',
    site: 'Kantor Pusat PT. BARAK (Divisi Operasional)',
    serial_no: 'PF-4X990-2026',
    ip_address: '10.0.1.104',
    last_sync: 'Aktif saat ini',
    firmware: 'Win 11 Pro / BarakOS',
    status: 'online'
  }
]);

let itTickets = loadStore('it_tickets', [
  {
    id: 'TKT-2026-089',
    title: 'Mesin Absensi Biometrik Lobi Barat Gagal Sinkronisasi',
    category: 'Biometric Attendance',
    site: 'PT. Telkom Indonesia Tbk (Landmark Tower)',
    reported_by: 'Nazi Rinaldi (Operasional)',
    priority: 'high',
    status: 'in_progress',
    created_at: '18 Sep 2026, 08:30',
    description: 'Data tap kartu dan presensi wajah staf keamanan shift malam tidak masuk ke rekap HRD otomatis.',
    resolution_notes: 'Sedang dilakukan remote rebooting pada service biometric listener di port 8080.'
  },
  {
    id: 'TKT-2026-088',
    title: 'GPS Patrol Wand Pos 3 Perlu Penggantian Baterai',
    category: 'Hardware & IoT',
    site: 'PT. Mayora Indah Tbk',
    reported_by: 'Hendrik Gunawan (Chief Security)',
    priority: 'medium',
    status: 'open',
    created_at: '18 Sep 2026, 09:15',
    description: 'Tongkat patroli RFID mati mendadak setelah putaran pos 3 kemarin malam.',
    resolution_notes: ''
  },
  {
    id: 'TKT-2026-087',
    title: 'Permintaan Reset Kata Sandi Akun HRD Staf Baru',
    category: 'Portal & User Access',
    site: 'Kantor Pusat PT. BARAK',
    reported_by: 'Robyn Topani (HRD)',
    priority: 'low',
    status: 'resolved',
    created_at: '18 Sep 2026, 07:45',
    description: 'Staf admin HRD baru lupa password default portal setelah aktivasi.',
    resolution_notes: 'Password telah di-reset ke password123 dan panduan keamanan telah dikirimkan via email internal.'
  },
  {
    id: 'TKT-2026-086',
    title: 'Koneksi Router 4G Backup Pos Gerbang Tol Terputus',
    category: 'Network & Connectivity',
    site: 'PT. Gudang Garam Tbk',
    reported_by: 'Susilo Bambang (Security Leader)',
    priority: 'critical',
    status: 'resolved',
    created_at: '17 Sep 2026, 21:00',
    description: 'Modem SIM card kehabisan kuota data darurat.',
    resolution_notes: 'Kuota data darurat 50GB telah di-topup dan router kembali online dengan latensi normal.'
  }
]);

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  // Auth
  async login({ email, password }) {
    await delay(200);
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (!user) {
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
    await delay(200);
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
    saveStore('users', users);
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
    await delay(100);
    const savedRole = localStorage.getItem('barak_user_role') || 'owner';
    const user = users.find(u => u.role === savedRole) || users[0];
    return {
      success: true,
      data: user
    };
  },

  async logout() {
    await delay(50);
    localStorage.removeItem('barak_auth_token');
    localStorage.removeItem('barak_user_role');
    return { success: true, message: 'Logout berhasil' };
  },

  // Users & Roles (Direktur/Owner only)
  async createUser(userData) {
    await delay(150);
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
    saveStore('users', users);
    return {
      success: true,
      data: newUser,
      message: 'Pengguna berhasil ditambahkan.'
    };
  },

  async getUsers() {
    await delay(150);
    const deletedUserIds = getDeletedIds('users');
    return {
      success: true,
      data: users.filter(u => !deletedUserIds.has(String(u.id)) && !deletedUserIds.has(u.email?.toLowerCase()))
    };
  },

  async updateUserRole(id, newRole) {
    await delay(150);
    const index = users.findIndex(u => String(u.id) === String(id));
    if (index === -1) throw new Error('Pengguna tidak ditemukan');
    users[index] = { ...users[index], role: newRole };
    saveStore('users', users);
    return { success: true, message: 'Role pengguna berhasil diperbarui', data: users[index] };
  },

  async deleteUser(id) {
    await delay(150);
    saveDeletedId('users', id);
    const item = users.find(u => String(u.id) === String(id));
    if (item && item.email) {
      saveDeletedId('users', item.email.toLowerCase());
    }
    users = users.filter(u => String(u.id) !== String(id));
    saveStore('users', users);
    return { success: true, message: 'Pengguna berhasil dihapus permanen' };
  },

  // Services
  async getServices() {
    await delay(100);
    return { success: true, data: [...services] };
  },

  // Employees / Tenaga Kerja
  async getEmployees({ search = '', service = '', status = '', page = 1, limit = 50 } = {}) {
    await delay(150);
    const deletedEmpIds = getDeletedIds('employees');
    let filtered = employees.filter(e => !deletedEmpIds.has(String(e.id)));

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e =>
        (e.name || '').toLowerCase().includes(q) ||
        (e.nik || '').toLowerCase().includes(q) ||
        (e.employee_no || '').toLowerCase().includes(q) ||
        (e.position || '').toLowerCase().includes(q) ||
        (e.siteName || '').toLowerCase().includes(q) ||
        (e.placement_address || '').toLowerCase().includes(q) ||
        (e.clientName || '').toLowerCase().includes(q)
      );
    }

    if (service && service !== 'all') {
      filtered = filtered.filter(e => (e.service || '').toLowerCase().includes(service.toLowerCase()));
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

  async getEmployeeById(id) {
    await delay(100);
    const emp = employees.find(e => String(e.id) === String(id));
    if (!emp) throw new Error('Data karyawan tidak ditemukan');
    return { success: true, data: emp };
  },

  async createEmployee(data) {
    await delay(200);
    const newEmp = {
      id: `emp-${Date.now()}`,
      employee_no: data.employee_no || `BA-${new Date().getFullYear()}-${String(employees.length + 1).padStart(3, '0')}`,
      nik: data.nik || `327501${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name: data.name,
      birth_date: data.birth_date || '1995-05-15',
      ptkp_status: data.ptkp_status || 'TK',
      bank_account: data.bank_account || 'BCA 8830192831 a.n ' + data.name,
      npwp: data.npwp || '09.254.629.8-407.000',
      address: data.address || 'Jl. Jend. Sudirman Kav 54-55, Jakarta',
      placement_address: data.placement_address || 'PT Menara Graha Mandiri - Gedung Pusat',
      photo_url: data.photo_url || '/assets/img/team/person-2.jpeg',
      service: data.service || 'Security & Guard Services',
      position: data.position || 'Garda Pengamanan',
      employment_type: data.employment_type || 'kontrak',
      status: data.status || 'active',
      join_date: data.join_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || `${new Date().getFullYear() + 1}-12-31`,
      certification: data.certification || 'Gada Pratama',
      siteName: data.placement_address ? data.placement_address.split(',')[0] : 'Gedung Graha Mandiri',
      clientName: 'PT Menara Graha Mandiri'
    };
    employees = [newEmp, ...employees];
    saveStore('employees', employees);

    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'HRD Administrator',
      role: 'hrd',
      action: 'Penambahan Tenaga Kerja Baru',
      description: `Menambahkan personil baru: ${newEmp.name} (${newEmp.service})`,
      timestamp: 'Baru saja'
    });
    saveStore('activities', activities);

    return { success: true, message: 'Data tenaga kerja berhasil ditambahkan', data: newEmp };
  },

  async updateEmployee(id, data) {
    await delay(150);
    const index = employees.findIndex(e => String(e.id) === String(id));
    if (index === -1) throw new Error('Data karyawan tidak ditemukan');
    employees[index] = { ...employees[index], ...data };
    saveStore('employees', employees);
    return { success: true, message: 'Data karyawan berhasil diperbarui', data: employees[index] };
  },

  async deleteEmployee(id) {
    await delay(150);
    saveDeletedId('employees', id);
    const item = employees.find(e => String(e.id) === String(id));
    employees = employees.filter(e => String(e.id) !== String(id));
    saveStore('employees', employees);

    // Also purge any active placements associated with this employee
    placements = placements.filter(p => String(p.employee_id) !== String(id));
    saveStore('placements', placements);

    return { success: true, message: `Data karyawan ${item?.name || ''} berhasil dihapus permanen dari sistem` };
  },

  // Clients
  async getClients({ search = '' } = {}) {
    await delay(150);
    const deletedClientIds = getDeletedIds('clients');
    let filtered = clients.filter(c => !deletedClientIds.has(String(c.id)));

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.industry || '').toLowerCase().includes(q) ||
        (c.contactPerson || '').toLowerCase().includes(q)
      );
    }
    return { success: true, data: filtered };
  },

  async getClientById(id) {
    await delay(100);
    const client = clients.find(c => String(c.id) === String(id));
    if (!client) throw new Error('Data klien tidak ditemukan');
    return { success: true, data: client };
  },

  async createClient(data) {
    await delay(200);
    const newClient = {
      id: `cli-${Date.now()}`,
      status: 'active',
      activeSites: 1,
      activeHeadcount: Number(data.activeHeadcount) || 10,
      ...data
    };
    clients = [newClient, ...clients];
    saveStore('clients', clients);

    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'Business Development Lead',
      role: 'marketing',
      action: 'Penambahan Mitra Klien Baru',
      description: `Menambahkan mitra klien baru: ${newClient.name}`,
      timestamp: 'Baru saja'
    });
    saveStore('activities', activities);

    return { success: true, message: 'Mitra klien berhasil didaftarkan', data: newClient };
  },

  async updateClient(id, data) {
    await delay(150);
    const index = clients.findIndex(c => String(c.id) === String(id));
    if (index === -1) throw new Error('Data klien tidak ditemukan');
    clients[index] = { ...clients[index], ...data };
    saveStore('clients', clients);
    return { success: true, message: 'Data mitra klien berhasil diperbarui', data: clients[index] };
  },

  async deleteClient(id) {
    await delay(150);
    saveDeletedId('clients', id);
    clients = clients.filter(c => String(c.id) !== String(id));
    saveStore('clients', clients);
    return { success: true, message: 'Data mitra klien berhasil dihapus permanen' };
  },

  // Sites
  async getSites({ search = '', clientId = 'all' } = {}) {
    await delay(150);
    const deletedSiteIds = getDeletedIds('sites');
    let filtered = sites.filter(s => !deletedSiteIds.has(String(s.id)));

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.clientName || '').toLowerCase().includes(q) ||
        (s.location || '').toLowerCase().includes(q)
      );
    }

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter(s => String(s.clientId) === String(clientId));
    }

    return { success: true, data: filtered };
  },

  async getSiteById(id) {
    await delay(100);
    const site = sites.find(s => String(s.id) === String(id));
    if (!site) throw new Error('Data site tidak ditemukan');
    return { success: true, data: site };
  },

  async createSite(data) {
    await delay(200);
    const newSite = {
      id: `ste-${Date.now()}`,
      status: 'operational',
      totalPersonnel: Number(data.totalPersonnel) || 12,
      slaScore: '99.5%',
      ...data
    };
    sites = [newSite, ...sites];
    saveStore('sites', sites);

    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'Operations Supervisor',
      role: 'operasional',
      action: 'Penambahan Site Operasional Baru',
      description: `Mendaftarkan site baru: ${newSite.name}`,
      timestamp: 'Baru saja'
    });
    saveStore('activities', activities);

    return { success: true, message: 'Site operasional baru berhasil dibuat', data: newSite };
  },

  async updateSite(id, data) {
    await delay(150);
    const index = sites.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Data site tidak ditemukan');
    sites[index] = { ...sites[index], ...data };
    saveStore('sites', sites);
    return { success: true, message: 'Data site operasional berhasil diperbarui', data: sites[index] };
  },

  async deleteSite(id) {
    await delay(150);
    saveDeletedId('sites', id);
    sites = sites.filter(s => String(s.id) !== String(id));
    saveStore('sites', sites);
    return { success: true, message: 'Data site operasional berhasil dihapus permanen' };
  },

  // Placements / Penempatan
  async getPlacements(params = {}) {
    await delay(150);
    const deletedPlacementIds = getDeletedIds('placements');
    return {
      success: true,
      data: placements.filter(p => !deletedPlacementIds.has(String(p.id)))
    };
  },

  async createPlacement(data) {
    await delay(200);
    const newP = {
      id: Date.now(),
      status: 'active',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || `${new Date().getFullYear() + 1}-12-31`,
      ...data
    };
    placements = [newP, ...placements];
    saveStore('placements', placements);
    return { success: true, message: 'Penempatan personil berhasil dibuat', data: newP };
  },

  async updatePlacement(id, data) {
    await delay(150);
    const index = placements.findIndex(p => String(p.id) === String(id));
    if (index !== -1) {
      placements[index] = { ...placements[index], ...data };
      saveStore('placements', placements);
    }
    return { success: true, message: 'Penempatan personil berhasil diperbarui' };
  },

  async deletePlacement(id) {
    await delay(150);
    saveDeletedId('placements', id);
    placements = placements.filter(p => String(p.id) !== String(id));
    saveStore('placements', placements);
    return { success: true, message: 'Penempatan personil berhasil dihapus permanen' };
  },

  // Invoices
  async getInvoices({ search = '', status = 'all', page = 1, limit = 50 } = {}) {
    await delay(150);
    const deletedInvoiceIds = getDeletedIds('invoices');
    let filtered = invoices.filter(i => !deletedInvoiceIds.has(String(i.id)));

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        (i.invoiceNumber || '').toLowerCase().includes(q) ||
        (i.clientName || '').toLowerCase().includes(q) ||
        (i.serviceType || '').toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(i => i.status === status);
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

  async getInvoiceById(id) {
    await delay(100);
    const inv = invoices.find(i => String(i.id) === String(id));
    if (!inv) throw new Error('Invoice tidak ditemukan');
    return { success: true, data: inv };
  },

  async createInvoice(data) {
    await delay(200);
    const subtotal = Number(data.subtotal) || 100000000;
    const ppn = Number(data.ppn) || Math.round(subtotal * 0.11);
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: data.invoiceNumber || `INV/BAR/${new Date().getFullYear()}/${String(invoices.length + 1).padStart(3, '0')}`,
      status: 'pending',
      subtotal,
      ppn,
      total: subtotal + ppn,
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      ...data
    };
    invoices = [newInv, ...invoices];
    saveStore('invoices', invoices);

    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'Finance Billing Staff',
      role: 'finance',
      action: 'Penerbitan Invoice Baru',
      description: `Menerbitkan invoice ${newInv.invoiceNumber} untuk ${newInv.clientName}`,
      timestamp: 'Baru saja'
    });
    saveStore('activities', activities);

    return { success: true, message: 'Invoice baru berhasil diterbitkan', data: newInv };
  },

  async updateInvoice(id, data) {
    await delay(150);
    const index = invoices.findIndex(i => String(i.id) === String(id));
    if (index === -1) throw new Error('Invoice tidak ditemukan');
    invoices[index] = { ...invoices[index], ...data };
    saveStore('invoices', invoices);
    return { success: true, message: 'Data invoice berhasil diperbarui', data: invoices[index] };
  },

  async updateInvoiceStatus(id, newStatus) {
    await delay(150);
    const index = invoices.findIndex(inv => String(inv.id) === String(id));
    if (index === -1) throw new Error('Invoice tidak ditemukan');
    invoices[index] = {
      ...invoices[index],
      status: newStatus,
      paidDate: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : invoices[index].paidDate
    };
    saveStore('invoices', invoices);
    return { success: true, message: `Status invoice berhasil diubah menjadi ${newStatus}`, data: invoices[index] };
  },

  async deleteInvoice(id) {
    await delay(150);
    saveDeletedId('invoices', id);
    invoices = invoices.filter(i => String(i.id) !== String(id));
    saveStore('invoices', invoices);
    return { success: true, message: 'Invoice berhasil dihapus permanen' };
  },

  // Leads & CRM
  async getLeads({ search = '', stage = 'all' } = {}) {
    await delay(150);
    const deletedLeadIds = getDeletedIds('leads');
    let filtered = leads.filter(l => !deletedLeadIds.has(String(l.id)));

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(l =>
        (l.company || '').toLowerCase().includes(q) ||
        (l.picName || '').toLowerCase().includes(q) ||
        (l.serviceInterested || '').toLowerCase().includes(q)
      );
    }

    if (stage && stage !== 'all') {
      filtered = filtered.filter(l => l.stage === stage);
    }

    return { success: true, data: filtered };
  },

  async createLead(data) {
    await delay(200);
    const newLead = {
      id: `led-${Date.now()}`,
      stage: 'baru',
      probability: '30%',
      createdAt: new Date().toISOString().split('T')[0],
      ...data
    };
    leads = [newLead, ...leads];
    saveStore('leads', leads);

    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'Marketing Account Exec',
      role: 'marketing',
      action: 'Pendaftaran Prospek Klien Baru',
      description: `Mendaftarkan prospek baru: ${newLead.company}`,
      timestamp: 'Baru saja'
    });
    saveStore('activities', activities);

    return { success: true, message: 'Prospek baru berhasil dicatat', data: newLead };
  },

  async updateLeadStage(id, newStage) {
    await delay(150);
    const index = leads.findIndex(l => String(l.id) === String(id));
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
    saveStore('leads', leads);
    return { success: true, message: 'Status tahapan prospek berhasil diperbarui', data: leads[index] };
  },

  async updateLead(id, data) {
    await delay(150);
    const index = leads.findIndex(l => String(l.id) === String(id));
    if (index === -1) throw new Error('Data prospek tidak ditemukan');
    leads[index] = { ...leads[index], ...data };
    saveStore('leads', leads);
    return { success: true, message: 'Data prospek berhasil diperbarui', data: leads[index] };
  },

  async deleteLead(id) {
    await delay(150);
    saveDeletedId('leads', id);
    leads = leads.filter(l => String(l.id) !== String(id));
    saveStore('leads', leads);
    return { success: true, message: 'Data prospek berhasil dihapus permanen' };
  },

  // Attendance
  async getAttendance({ search = '', service = 'all', status = 'all' } = {}) {
    await delay(150);
    const deletedAttendanceIds = getDeletedIds('attendance');
    let filtered = attendance.filter(a => !deletedAttendanceIds.has(String(a.id)));

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a =>
        (a.employeeName || '').toLowerCase().includes(q) ||
        (a.siteName || '').toLowerCase().includes(q)
      );
    }

    if (service && service !== 'all') {
      filtered = filtered.filter(a => (a.service || '').toLowerCase().includes(service.toLowerCase()));
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(a => a.status === status);
    }

    return { success: true, data: filtered };
  },

  async recordAttendance(data) {
    await delay(150);
    const newRecord = {
      id: `att-${Date.now()}`,
      date: data.attendance_date || new Date().toISOString().split('T')[0],
      check_in: data.check_in || '08:00',
      check_out: data.check_out || '17:00',
      status: data.status || 'present',
      notes: data.notes || '-',
      ...data
    };
    attendance = [newRecord, ...attendance];
    saveStore('attendance', attendance);
    return { success: true, message: 'Presensi berhasil dicatat', data: newRecord };
  },

  async deleteAttendance(id) {
    await delay(150);
    saveDeletedId('attendance', id);
    attendance = attendance.filter(a => String(a.id) !== String(id));
    saveStore('attendance', attendance);
    return { success: true, message: 'Catatan presensi berhasil dihapus permanen' };
  },

  // Dashboard Role-Aware Summary (Recalculated dynamically from live stores!)
  async getDashboardSummary(role = 'owner') {
    await delay(150);

    const deletedEmpIds = getDeletedIds('employees');
    const deletedSiteIds = getDeletedIds('sites');
    const deletedClientIds = getDeletedIds('clients');
    const deletedInvIds = getDeletedIds('invoices');
    const deletedLeadIds = getDeletedIds('leads');
    const deletedPlcIds = getDeletedIds('placements');

    const liveEmployees = employees.filter(e => !deletedEmpIds.has(String(e.id)));
    const liveSites = sites.filter(s => !deletedSiteIds.has(String(s.id)));
    const liveClients = clients.filter(c => !deletedClientIds.has(String(c.id)));
    const liveInvoices = invoices.filter(i => !deletedInvIds.has(String(i.id)));
    const liveLeads = leads.filter(l => !deletedLeadIds.has(String(l.id)));
    const livePlacements = placements.filter(p => !deletedPlcIds.has(String(p.id)));

    const activeEmployees = liveEmployees.filter(e => e.status === 'active').length;
    const activeSites = liveSites.filter(s => s.status === 'operational' || s.status === 'active').length || liveSites.length;
    const totalInvoicesValue = liveInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const paidInvoicesValue = liveInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const pendingInvoicesValue = liveInvoices.filter(i => i.status === 'pending' || i.status === 'sent' || i.status === 'unpaid').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const totalLeadsValue = liveLeads.reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);
    const activePipelineValue = liveLeads.filter(l => l.stage !== 'menang' && l.stage !== 'kalah').reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);
    const wonLeadsCount = liveLeads.filter(l => l.stage === 'menang').length;

    const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    return {
      success: true,
      data: {
        role,
        kpi: {
          totalEmployees: activeEmployees,
          activeSites: activeSites,
          totalClients: liveClients.length,
          activePlacements: livePlacements.filter(p => p.status === 'active').length || activeEmployees,
          attendanceRate: '99.4%',
          monthlyRevenue: formatRupiah(paidInvoicesValue || totalInvoicesValue),
          pendingReceivables: formatRupiah(pendingInvoicesValue),
          totalInvoiced: formatRupiah(totalInvoicesValue),
          totalPaid: formatRupiah(paidInvoicesValue),
          totalPending: formatRupiah(pendingInvoicesValue),
          totalLeads: liveLeads.length,
          dealsWon: wonLeadsCount,
          activePipelineValue: formatRupiah(activePipelineValue || totalLeadsValue),
          openIncidents: 0,
          shiftCompliance: '99.8%'
        },
        servicesSummary: services.map(s => ({
          title: s.title,
          activePersonnel: s.activePersonnel,
          clientCount: s.clientCount
        })),
        recentActivities: activities.slice(0, 5),
        recentInvoices: liveInvoices.slice(0, 4),
        recentLeads: liveLeads.slice(0, 4),
        recentEmployees: liveEmployees.slice(0, 5),
        recentSites: liveSites.slice(0, 5)
      }
    };
  },

  // Activities & Notifications
  async getActivities() {
    await delay(100);
    return { success: true, data: [...activities] };
  },

  async getNotifications() {
    await delay(100);
    return { success: true, data: [...notifications] };
  },

  async markNotificationRead(id) {
    await delay(50);
    notifications = notifications.map(n => String(n.id) === String(id) ? { ...n, unread: false } : n);
    saveStore('notifications', notifications);
    return { success: true, message: 'Notifikasi ditandai sudah dibaca' };
  },

  // Public Contact Inquiry Submission
  async submitContactInquiry(inquiryData) {
    await delay(300);
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
    saveStore('leads', leads);

    activities.unshift({
      id: `act-${Date.now()}`,
      user: 'Sistem Website',
      role: 'marketing',
      action: 'Inquiry Klien Masuk',
      description: `Inquiry baru dari ${inquiryData.name} (${inquiryData.company || 'Perorangan'}) - Layanan: ${inquiryData.service}`,
      timestamp: 'Baru saja'
    });
    saveStore('activities', activities);

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Inquiry Konsultasi Baru',
      message: `Permintaan konsultasi layanan ${inquiryData.service} dari ${inquiryData.company || inquiryData.name}.`,
      time: 'Baru saja',
      unread: true,
      type: 'marketing'
    });
    saveStore('notifications', notifications);

    return {
      success: true,
      message: 'Terima kasih! Permintaan konsultasi Anda telah berhasil kami terima. Tim Business Development kami akan menghubungi Anda dalam waktu 1x24 jam kerja.',
      data: { ticketId: `BAR-REQ-${Math.floor(100000 + Math.random() * 900000)}` }
    };
  },

  // IT Assets
  async getItAssets(params = {}) {
    await delay(100);
    const deletedAssetIds = getDeletedIds('it_assets');
    let filtered = itAssets.filter(a => !deletedAssetIds.has(String(a.id)) && !deletedAssetIds.has(String(a.serial_no || '')));
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(a =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.site || '').toLowerCase().includes(q) ||
        (a.serial_no || '').toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q)
      );
    }
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter(a => a.status === params.status);
    }
    return { success: true, data: filtered };
  },

  async createItAsset(data) {
    await delay(150);
    const newAsset = {
      id: data.id || `AST-${Date.now()}`,
      last_sync: '1 menit yang lalu',
      ...data
    };
    itAssets = [newAsset, ...itAssets];
    saveStore('it_assets', itAssets);
    return { success: true, message: 'Perangkat IT berhasil ditambahkan', data: newAsset };
  },

  async updateItAsset(id, data) {
    await delay(150);
    const index = itAssets.findIndex(a => String(a.id) === String(id));
    if (index !== -1) {
      itAssets[index] = { ...itAssets[index], ...data, last_sync: 'Baru diperbarui' };
      saveStore('it_assets', itAssets);
    }
    return { success: true, message: 'Perangkat IT berhasil diperbarui', data: itAssets[index] };
  },

  async deleteItAsset(id) {
    await delay(150);
    saveDeletedId('it_assets', id);
    const item = itAssets.find(a => String(a.id) === String(id));
    if (item && item.serial_no) {
      saveDeletedId('it_assets', item.serial_no);
    }
    itAssets = itAssets.filter(a => String(a.id) !== String(id));
    saveStore('it_assets', itAssets);
    return { success: true, message: 'Perangkat IT berhasil dihapus permanen' };
  },

  // IT Tickets
  async getItTickets(params = {}) {
    await delay(100);
    const deletedTicketIds = getDeletedIds('it_tickets');
    let filtered = itTickets.filter(t => !deletedTicketIds.has(String(t.id)));
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.site || '').toLowerCase().includes(q) ||
        (t.reported_by || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
      );
    }
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter(t => t.status === params.status);
    }
    return { success: true, data: filtered };
  },

  async createItTicket(data) {
    await delay(150);
    const newTicket = {
      id: data.id || `TKT-2026-${String(itTickets.length + 1).padStart(3, '0')}`,
      created_at: 'Baru saja',
      ...data
    };
    itTickets = [newTicket, ...itTickets];
    saveStore('it_tickets', itTickets);
    return { success: true, message: 'Tiket bantuan IT berhasil dibuat', data: newTicket };
  },

  async updateItTicket(id, data) {
    await delay(150);
    const index = itTickets.findIndex(t => String(t.id) === String(id));
    if (index !== -1) {
      itTickets[index] = { ...itTickets[index], ...data };
      saveStore('it_tickets', itTickets);
    }
    return { success: true, message: 'Tiket bantuan IT berhasil diperbarui', data: itTickets[index] };
  },

  async deleteItTicket(id) {
    await delay(150);
    saveDeletedId('it_tickets', id);
    itTickets = itTickets.filter(t => String(t.id) !== String(id));
    saveStore('it_tickets', itTickets);
    return { success: true, message: 'Tiket bantuan IT berhasil dihapus permanen' };
  }
};
