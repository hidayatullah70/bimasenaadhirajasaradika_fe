import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { INITIAL_EMPLOYEES } from '../../services/mock/mockData';
import {
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  Upload,
  Camera,
  CreditCard,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Award,
  X,
  Building,
  Briefcase,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'barak_employees_data_v2';

const PTKP_OPTIONS = [
  { value: 'TK', label: 'TK - Tidak Kawin (Lajang)' },
  { value: 'K0', label: 'K/0 - Kawin (Tanpa Tanggungan Anak)' },
  { value: 'K1', label: 'K/1 - Kawin (1 Anak)' },
  { value: 'K2', label: 'K/2 - Kawin (2 Anak)' },
  { value: 'K3', label: 'K/3 - Kawin (3 Anak)' }
];

const SERVICE_OPTIONS = [
  { value: 'Security & Guard Services', label: 'Security & Guard Services' },
  { value: 'Commercial Cleaning Service', label: 'Commercial Cleaning Service' },
  { value: 'Valet & Parking Management', label: 'Valet & Parking Management' },
  { value: 'Driver & Chauffeur Services', label: 'Driver & Chauffeur Services' },
  { value: 'Office Support & Administration', label: 'Office Support & Administration' },
  { value: 'General Labor & Warehousing', label: 'General Labor & Warehousing' }
];

// Helper to auto-crop & resize any uploaded image to 3x4 aspect ratio (300 x 400 px)
function resizeImageTo3x4(file, callback, targetWidth = 300, targetHeight = 400) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      const targetAspect = targetWidth / targetHeight; // 3/4 = 0.75
      const imgAspect = img.width / img.height;

      let srcX = 0;
      let srcY = 0;
      let srcW = img.width;
      let srcH = img.height;

      if (imgAspect > targetAspect) {
        // Image is wider than 3:4 -> crop horizontally
        srcW = img.height * targetAspect;
        srcX = (img.width - srcW) / 2;
      } else {
        // Image is taller than 3:4 -> crop vertically
        srcH = img.width / targetAspect;
        srcY = (img.height - srcH) / 2;
      }

      // Background fill
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw centered cropped image
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      callback(resizedDataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function calculateAge(birthDateString) {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : null;
}

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${day} ${months[monthIdx]} ${year}`;
  }
  return dateStr;
}

export function EmployeeManagement() {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, totalPages: 1 });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Form State with complete requested fields
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    employee_no: '',
    phone: '',
    email: '',
    birth_date: '1995-05-15',
    ptkp_status: 'TK',
    bank_account: '',
    npwp: '',
    employment_type: 'kontrak',
    status: 'active',
    join_date: '2026-03-01',
    end_date: '2027-02-28',
    position: 'Garda Pengamanan',
    service: 'Security & Guard Services',
    certification: 'Gada Pratama',
    address: '',
    placement_address: '',
    photo_url: ''
  });

  const getSavedLocalEmployees = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse local storage employees', e);
    }
    return null;
  };

  const saveLocalEmployees = (list) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save employees to local storage', e);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Check local storage first
      const localData = getSavedLocalEmployees();
      let list = localData || INITIAL_EMPLOYEES;

      try {
        const res = await api.getEmployees({
          search,
          status: statusFilter,
          page,
          limit: 100
        });
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          // Merge API data with rich local/initial fields
          const merged = res.data.map(apiEmp => {
            const match = list.find(l => String(l.id) === String(apiEmp.id) || l.nik === apiEmp.nik);
            return {
              ...match,
              ...apiEmp,
              nik: apiEmp.nik || match?.nik || `327501${String(apiEmp.id).padStart(10, '0')}`,
              birth_date: apiEmp.birth_date || match?.birth_date || '1995-01-01',
              ptkp_status: apiEmp.ptkp_status || match?.ptkp_status || 'TK',
              bank_account: apiEmp.bank_account || match?.bank_account || 'BCA 8830192831 a.n ' + (apiEmp.name || 'Karyawan'),
              npwp: apiEmp.npwp || match?.npwp || '09.254.629.8-407.000',
              address: apiEmp.address || match?.address || 'Jl. Jend. Sudirman No. Kav 54-55, Jakarta',
              placement_address: apiEmp.placement_address || match?.placement_address || 'PT Menara Graha Mandiri - Gedung Pusat',
              photo_url: apiEmp.photo_url || match?.photo_url || '/assets/img/team/person-2.jpeg'
            };
          });
          list = merged;
        }
      } catch (apiErr) {
        console.info('Using local / mock employee data store', apiErr.message);
      }

      // Apply client filtering
      let filtered = [...list];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(e =>
          (e.name || '').toLowerCase().includes(q) ||
          (e.nik || '').toLowerCase().includes(q) ||
          (e.employee_no || '').toLowerCase().includes(q) ||
          (e.phone || '').toLowerCase().includes(q) ||
          (e.position || '').toLowerCase().includes(q) ||
          (e.service || '').toLowerCase().includes(q) ||
          (e.placement_address || '').toLowerCase().includes(q)
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(e => e.status === statusFilter);
      }

      setEmployees(filtered);
      setPaginationMeta({
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / 10) || 1
      });
    } catch (err) {
      addToast(err.message || 'Gagal memuat data tenaga kerja', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [srvRes, cliRes] = await Promise.all([
        api.getServices().catch(() => ({ success: false })),
        api.getClients().catch(() => ({ success: false }))
      ]);
      if (srvRes?.success && Array.isArray(srvRes.data)) setServices(srvRes.data);
      if (cliRes?.success && Array.isArray(cliRes.data)) setClients(cliRes.data);
    } catch (e) {
      console.warn('Failed to load dropdown dependencies', e);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, statusFilter, page]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newEmpNo = `BA-2026-${String(employees.length + 1).padStart(3, '0')}`;
    setFormData({
      name: '',
      nik: `327501${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      employee_no: newEmpNo,
      phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      email: '',
      birth_date: '1996-06-15',
      ptkp_status: 'TK',
      bank_account: 'BCA 8830' + randomSuffix + ' a.n ',
      npwp: '09.254.629.8-407.000',
      employment_type: 'kontrak',
      status: 'active',
      join_date: '2026-03-01',
      end_date: '2027-02-28',
      position: 'Garda Pengamanan',
      service: 'Security & Guard Services',
      certification: 'Gada Pratama',
      address: 'Jl. Melati Raya Blok B No. 12 RT 04/RW 08, Jakarta',
      placement_address: 'PT Menara Graha Mandiri, Gedung Graha Mandiri Tower A & B, Sudirman, Jakarta Selatan',
      photo_url: ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setIsEditMode(true);
    setActiveEmployee(emp);
    setFormData({
      name: emp.name || '',
      nik: emp.nik || `327501${String(emp.id).padStart(10, '0')}`,
      employee_no: emp.employee_no || emp.employeeNo || `BA-2024-${String(emp.id).padStart(3, '0')}`,
      phone: emp.phone || '',
      email: emp.email || '',
      birth_date: emp.birth_date || emp.birthDate || '1995-05-15',
      ptkp_status: emp.ptkp_status || emp.marital_status || 'TK',
      bank_account: emp.bank_account || emp.bankAccount || 'BCA 8830192831 a.n ' + (emp.name || ''),
      npwp: emp.npwp || '09.254.629.8-407.000',
      employment_type: emp.employment_type || 'kontrak',
      status: emp.status || 'active',
      join_date: emp.join_date || emp.joinDate || '2026-01-01',
      end_date: emp.end_date || emp.contractEnd || '2027-01-01',
      position: emp.position || 'Garda Pengamanan',
      service: emp.service || 'Security & Guard Services',
      certification: emp.certification || 'Gada Pratama',
      address: emp.address || 'Jl. Melati Raya No. 14 RT 03/RW 05, Kel. Kayuringin Jaya, Kec. Bekasi Selatan',
      placement_address: emp.placement_address || (emp.siteName ? `${emp.clientName || 'Klien'} - ${emp.siteName}` : 'Gedung Graha Mandiri Tower A & B, Jakarta Selatan'),
      photo_url: emp.photo_url || emp.avatar || emp.photo || ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (emp) => {
    setActiveEmployee(emp);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (emp) => {
    setActiveEmployee(emp);
    setIsDeleteConfirmOpen(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar (JPG, PNG, JPEG, WEBP)', 'error');
      return;
    }

    // Auto resize to 3x4 aspect ratio (300 x 400 px)
    resizeImageTo3x4(file, (resizedDataUrl) => {
      setFormData(prev => ({ ...prev, photo_url: resizedDataUrl }));
      addToast('Foto berhasil dimuat dan di-resize pas proporsi 3x4.', 'success');
    });
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    addToast('Foto personil dihapus.', 'info');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('Harap lengkapi nama personil.', 'error');
      return;
    }
    if (!formData.nik) {
      addToast('Harap lengkapi nomor NIK KTP personil.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const currentList = getSavedLocalEmployees() || employees;
      let updatedList = [];

      if (isEditMode && activeEmployee) {
        // Update in backend
        await api.updateEmployee(activeEmployee.id, formData).catch(() => {});

        // Update in local store
        updatedList = currentList.map(emp => {
          if (String(emp.id) === String(activeEmployee.id)) {
            return {
              ...emp,
              ...formData,
              id: activeEmployee.id,
              siteName: formData.placement_address ? formData.placement_address.split(',')[0] : emp.siteName
            };
          }
          return emp;
        });

        saveLocalEmployees(updatedList);
        setEmployees(updatedList);
        addToast(`Data personil ${formData.name} berhasil diperbarui.`, 'success');
        setIsFormModalOpen(false);
      } else {
        // Create in backend
        const newId = `emp-${Date.now()}`;
        const newRecord = {
          id: newId,
          ...formData,
          employee_no: formData.employee_no || `BA-2026-${String(currentList.length + 1).padStart(3, '0')}`,
          siteName: formData.placement_address ? formData.placement_address.split(',')[0] : 'Site Penempatan',
          clientName: 'Mitra Barak Operasional'
        };

        await api.createEmployee(newRecord).catch(() => {});

        updatedList = [newRecord, ...currentList];
        saveLocalEmployees(updatedList);
        setEmployees(updatedList);
        addToast(`Personil baru ${formData.name} berhasil didaftarkan!`, 'success');
        setIsFormModalOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Terjadi kendala penyimpanan di server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeEmployee) return;
    setSubmitting(true);
    try {
      await api.deleteEmployee(activeEmployee.id).catch(() => {});
      const currentList = getSavedLocalEmployees() || employees;
      const updatedList = currentList.filter(e => String(e.id) !== String(activeEmployee.id));
      saveLocalEmployees(updatedList);
      setEmployees(updatedList);

      addToast(`Personil ${activeEmployee.name} berhasil dihapus.`, 'success');
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      addToast(err.message || 'Gagal menghapus data karyawan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Pasfoto & Personel',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-13 aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
            {row.photo_url || row.avatar || row.photo ? (
              <img
                src={row.photo_url || row.avatar || row.photo}
                alt={row.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=991B1B&color=fff`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-brand-red/10 text-brand-red flex items-center justify-center font-bold text-xs">
                {(row.name || 'P').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-brand-dark hover:text-brand-red transition-colors cursor-pointer" onClick={() => handleOpenDetail(row)}>
              {row.name}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
              <span className="font-semibold text-slate-700">{row.employee_no || `BA-${row.id}`}</span>
              <span>•</span>
              <span className="text-slate-400">NIK: {row.nik || '-'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Layanan & Posisi',
      render: (row) => (
        <div>
          <span className="font-semibold text-brand-dark block text-xs">{row.service || 'Security & Guard Services'}</span>
          <p className="text-[11px] text-slate-500">{row.position || 'Garda Pengamanan'}</p>
        </div>
      )
    },
    {
      header: 'Status PTKP & Rekening',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1">
            <span className="inline-block px-1.5 py-0.5 bg-sky-50 text-sky-700 font-bold text-[10px] rounded border border-sky-200">
              {row.ptkp_status || 'TK'}
            </span>
            <span className="text-[11px] text-slate-600 font-mono truncate max-w-[150px]" title={row.bank_account}>
              {row.bank_account || '-'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
            NPWP: {row.npwp || '-'}
          </p>
        </div>
      )
    },
    {
      header: 'Alamat Penempatan Site',
      render: (row) => (
        <div className="max-w-[220px]">
          <p className="text-xs font-semibold text-slate-800 line-clamp-1" title={row.placement_address || row.siteName}>
            {row.placement_address || row.siteName || row.clientName || 'Gedung Graha Mandiri'}
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{row.phone || '-'}</p>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-500 hover:text-brand-dark hover:bg-slate-100"
            title="Lihat Detail Lengkap Personil"
            onClick={() => handleOpenDetail(row)}
          >
            <Eye className="w-4 h-4 text-emerald-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-500 hover:text-brand-blue hover:bg-slate-100"
            title="Ubah Data Personil"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-400 hover:text-brand-red hover:bg-red-50"
            title="Hapus Personil"
            onClick={() => handleOpenDelete(row)}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Data Personel & Tenaga Kerja"
        subtitle="Pengelolaan data induk karyawan alih daya, biodata NIK & NPWP, pasfoto 3x4 resmi, serta riwayat penempatan site."
        breadcrumb={['Dashboard', 'HRD', 'Employees']}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={UserPlus}
            onClick={handleOpenAdd}
            className="shadow-md shadow-red-900/10 font-bold"
          >
            Tambah Personel Baru
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Status Personel' },
              { value: 'active', label: 'Aktif Bekerja (Active)' },
              { value: 'inactive', label: 'Non-Aktif' }
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari berdasarkan nama personel, NIK, No. Rekening, atau alamat penempatan..."
      />

      {/* ========================================================================= */}
      {/* ADD / EDIT MODAL (Tambah Tenaga Kerja Baru & Ubah Data Personil) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditMode ? 'Ubah Data Personil Lengkap' : 'Tambah Tenaga Kerja Baru'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {/* Section 1: Identitas Pokok */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-brand-red" />
              <span>1. Identitas Pokok & Kependudukan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nama Lengkap Karyawan *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                required
              />
              <Input
                label="NIK (Nomor Induk Kependudukan) *"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                placeholder="Contoh: 3275012304950002 (16 digit)"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Nomor Telepon / WhatsApp *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                required
              />
              <Input
                label="Alamat Email (Opsional)"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="budi@example.com"
              />
              <Input
                label="Tanggal Lahir *"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Status PTKP / Pernikahan *"
                value={formData.ptkp_status}
                onChange={(e) => setFormData({ ...formData, ptkp_status: e.target.value })}
                options={PTKP_OPTIONS}
              />
              <Input
                label="Nomor Rekening Bank *"
                value={formData.bank_account}
                onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                placeholder="Contoh: BCA 8830192831 a.n Budi"
                required
              />
              <Input
                label="NPWP (Nomor Pokok Wajib Pajak)"
                value={formData.npwp}
                onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                placeholder="Contoh: 09.254.629.8-407.000"
              />
            </div>
          </div>

          {/* Section 2: Jabatan & Kontrak Kerja */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
              <Briefcase className="w-4 h-4 text-brand-red" />
              <span>2. Posisi, Layanan & Status Kepegawaian</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Pilar Layanan"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                options={SERVICE_OPTIONS}
              />
              <Input
                label="Posisi / Jabatan *"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Contoh: Garda Pengamanan / Danru"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Tipe Kepegawaian"
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                options={[
                  { value: 'kontrak', label: 'PKWT / Kontrak' },
                  { value: 'tetap', label: 'Tetap' },
                  { value: 'magang', label: 'Magang / Trainee' }
                ]}
              />
              <Select
                label="Status Karyawan"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'active', label: 'Aktif Bekerja (Active)' },
                  { value: 'inactive', label: 'Non-Aktif' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Tanggal Mulai Kontrak *"
                type="date"
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                required
              />
              <Input
                label="Tanggal Akhir Kontrak *"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
              <Input
                label="Sertifikasi / Lisensi"
                value={formData.certification}
                onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                placeholder="Contoh: Gada Pratama / K3"
              />
            </div>
          </div>

          {/* Section 3: Alamat Domisili Karyawan */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-red" />
              <span>Alamat Lengkap Domisili Karyawan (Sesuai KTP / Tempat Tinggal) *</span>
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Masukkan alamat lengkap: Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none bg-white transition-all shadow-sm"
              required
            />
          </div>

          {/* Section 4: Alamat Penempatan (Posisi Paling Akhir) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-brand-red" />
              <span>Alamat Penempatan Kerja (Site Klien / Lokasi Gedung) *</span>
            </label>
            <textarea
              rows={2}
              value={formData.placement_address}
              onChange={(e) => setFormData({ ...formData, placement_address: e.target.value })}
              placeholder="Contoh: PT Menara Graha Mandiri, Gedung Graha Mandiri Tower A & B, Jl. Jend. Sudirman Kav. 54-55, Jakarta Selatan"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none bg-white transition-all shadow-sm"
              required
            />
          </div>

          {/* Section 5: Kotak Area Upload Foto Ukuran 3x4 (Paling Bawah) */}
          <div className="p-4 bg-red-50/40 rounded-xl border border-red-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-brand-dark flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-brand-red" />
                <span>Kotak Area Upload Pasfoto Ukuran 3x4 (Resmi)</span>
              </label>
              <span className="text-[11px] bg-red-100/80 text-brand-red font-bold px-2 py-0.5 rounded-full">
                Rasio Pasfoto 3:4
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              {/* 3x4 Frame Container */}
              <div className="relative w-28 h-[148px] aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 flex flex-col items-center justify-center shrink-0 shadow-inner group">
                {formData.photo_url ? (
                  <>
                    <img
                      src={formData.photo_url}
                      alt="Pasfoto 3x4"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow"
                        title="Hapus Pasfoto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-slate-500 block leading-tight">Foto 3x4</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">300 x 400 px</span>
                  </div>
                )}
              </div>

              {/* Upload Action & Resize Note */}
              <div className="flex-1 space-y-2 text-left">
                <p className="text-xs font-bold text-slate-800">
                  {formData.photo_url ? 'Pasfoto 3x4 Terpasang' : 'Pilih File Pasfoto Karyawan'}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Semua file foto yang diunggah akan <strong>otomatis di-crop dan di-resize</strong> ke ukuran standar pasfoto <strong>3x4 (proporsi 3:4)</strong> secara otomatis agar seragam.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-red hover:bg-red-700 px-3 py-1.5 rounded-lg shadow transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{formData.photo_url ? 'Ganti Foto 3x4' : 'Upload Foto 3x4'}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>

                  {formData.photo_url && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              className="font-bold shadow-md shadow-red-900/10"
            >
              {isEditMode ? 'Simpan Perubahan Data Personil' : 'Daftarkan Personel'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* DETAIL MODAL (Lihat Detail Personil Lengkap) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Lengkap Personel Tenaga Kerja"
        maxWidth="max-w-2xl"
      >
        {activeEmployee && (
          <div className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
            {/* ID Card Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-lg border border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* 3x4 Photo in Detail */}
              <div className="relative w-24 h-32 aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-md shrink-0 flex items-center justify-center">
                {activeEmployee.photo_url || activeEmployee.avatar || activeEmployee.photo ? (
                  <img
                    src={activeEmployee.photo_url || activeEmployee.avatar || activeEmployee.photo}
                    alt={activeEmployee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white font-extrabold text-lg">
                    {(activeEmployee.name || 'P').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 bg-black/60 text-[9px] font-mono px-1 rounded text-white/90">
                  3x4
                </span>
              </div>

              {/* Header Info */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 tracking-wider bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    {activeEmployee.employee_no || activeEmployee.employeeNo || `BA-${activeEmployee.id}`}
                  </span>
                  <StatusBadge status={activeEmployee.status} />
                </div>
                <h3 className="text-lg font-black tracking-tight text-white">{activeEmployee.name}</h3>
                <p className="text-slate-300 font-medium text-xs">
                  {activeEmployee.position || 'Garda Keamanan'} • <span className="text-red-400">{activeEmployee.service || 'Security'}</span>
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-400">
                  <span className="bg-white/10 px-2 py-0.5 rounded">NIK: {activeEmployee.nik || '-'}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded">Status: {activeEmployee.ptkp_status || 'TK'}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded capitalize">Tipe: {activeEmployee.employment_type || 'PKWT'}</span>
                </div>
              </div>
            </div>

            {/* Grid Detail Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Data Pribadi & Kontak */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <User className="w-3.5 h-3.5 text-brand-red" />
                  <span>Data Identitas & Kontak</span>
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">NIK KTP:</span>
                    <span className="font-mono font-bold text-slate-800">{activeEmployee.nik || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tanggal Lahir:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateIndo(activeEmployee.birth_date || activeEmployee.birthDate)}
                      {calculateAge(activeEmployee.birth_date || activeEmployee.birthDate) && (
                        <span className="text-slate-500 font-normal ml-1">({calculateAge(activeEmployee.birth_date || activeEmployee.birthDate)} thn)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status PTKP:</span>
                    <span className="font-bold text-brand-red bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                      {activeEmployee.ptkp_status || activeEmployee.marital_status || 'TK'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Telepon:</span>
                    <span className="font-mono font-semibold text-slate-800">{activeEmployee.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">{activeEmployee.email || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Keuangan, Pajak & Lisensi */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-brand-red" />
                  <span>Keuangan, Pajak & Legalitas</span>
                </h4>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nomor Rekening Bank:</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{activeEmployee.bank_account || activeEmployee.bankAccount || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">NPWP:</span>
                    <span className="font-mono font-semibold text-slate-800 text-xs">{activeEmployee.npwp || '-'}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Sertifikasi:</span>
                    <span className="font-semibold text-brand-dark">{activeEmployee.certification || 'Gada Pratama'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Masa Kontrak:</span>
                    <span className="font-mono text-slate-700 font-medium">
                      {activeEmployee.join_date || activeEmployee.joinDate || '-'} s/d {activeEmployee.end_date || activeEmployee.contractEnd || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Alamat Domisili Karyawan */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-red" />
                <span>Alamat Domisili Karyawan (Sesuai KTP):</span>
              </span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed pl-5">
                {activeEmployee.address || 'Jl. Melati Raya No. 14 RT 03/RW 05, Kel. Kayuringin Jaya, Kec. Bekasi Selatan, Kota Bekasi 17144'}
              </p>
            </div>

            {/* Section Alamat Penempatan (Posisi Paling Akhir) */}
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-amber-700" />
                <span>Alamat Penempatan Kerja (Site & Gedung Klien):</span>
              </span>
              <p className="text-xs text-amber-950 font-bold leading-relaxed pl-5">
                {activeEmployee.placement_address || (activeEmployee.siteName ? `${activeEmployee.clientName || 'PT Menara Graha Mandiri'} - ${activeEmployee.siteName}` : 'Gedung Graha Mandiri Tower A & B, Jl. Jend. Sudirman Kav. 54-55, Jakarta Selatan')}
              </p>
            </div>

            {/* Modal Detail Action Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1.5"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEdit(activeEmployee);
                }}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Data Personel Ini</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Personel"
        message={`Apakah Anda yakin ingin menghapus data personil ${activeEmployee?.name}? Tindakan ini akan menghapus data dari sistem.`}
        confirmText="Ya, Hapus Data"
        cancelText="Batal"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
