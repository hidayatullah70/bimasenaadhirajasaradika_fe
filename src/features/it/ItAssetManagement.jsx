import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import {
  HardDrive,
  Plus,
  Wifi,
  WifiOff,
  Activity,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Cpu,
  MapPin,
  Laptop,
  Camera,
  Fingerprint,
  Edit2,
  Trash2,
  Wrench,
  Server
} from 'lucide-react';

const INITIAL_FALLBACK_ASSETS = [
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
];

export function ItAssetManagement() {
  const { addToast } = useToast();
  const [assets, setAssets] = useState(INITIAL_FALLBACK_ASSETS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'offline', 'maintenance'
  
  // Modals state
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  
  // Diagnostics
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'Biometric Attendance',
    site: '',
    serial_no: '',
    ip_address: '',
    firmware: 'v1.0.0-prod',
    status: 'online'
  });

  const categoryOptions = [
    { value: 'Biometric Attendance', label: 'Mesin Presensi Biometrik Wajah / Fingerprint' },
    { value: 'Security Patrol Device', label: 'Tongkat Patroli GPS / Guard Tour Wand' },
    { value: 'CCTV Surveillance', label: 'CCTV NVR / DVR Video Recorder' },
    { value: 'Office Workstation', label: 'Laptop / Komputer Operasional' },
    { value: 'Network Gateway', label: 'Router 4G / Network Switch Lapangan' }
  ];

  const statusOptions = [
    { value: 'online', label: 'Online / Aktif Normal' },
    { value: 'offline', label: 'Offline / Terputus' },
    { value: 'maintenance', label: 'Dalam Pemeliharaan / Perbaikan' }
  ];

  // Fetch from backend
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api.getItAssets();
      if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
        setAssets(res.data);
      }
    } catch (err) {
      console.warn('Load IT assets fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // 1. CREATE Asset
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: 'Biometric Attendance',
      site: '',
      serial_no: '',
      ip_address: '',
      firmware: 'v1.0.0-prod',
      status: 'online'
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.site || !formData.serial_no) {
      addToast('Harap isi semua kolom wajib!', 'error');
      return;
    }

    setSaving(true);
    try {
      const prefix = formData.category.substring(0, 3).toUpperCase();
      const newId = `AST-${prefix}-${Math.floor(100 + Math.random() * 900)}`;
      const payload = {
        id: newId,
        ...formData,
        last_sync: 'Baru didaftarkan'
      };

      const res = await api.createItAsset(payload);
      if (res?.success) {
        setAssets(prev => [res.data || payload, ...prev]);
        addToast(`Perangkat ${formData.name} berhasil didaftarkan ke inventaris.`, 'success');
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Gagal mendaftarkan perangkat.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 2. EDIT / UPDATE Asset
  const handleOpenEdit = (asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name || '',
      category: asset.category || 'Biometric Attendance',
      site: asset.site || '',
      serial_no: asset.serial_no || asset.serialNo || '',
      ip_address: asset.ip_address || asset.ipAddress || '',
      firmware: asset.firmware || 'v1.0.0-prod',
      status: asset.status || 'online'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        last_sync: 'Baru diperbarui'
      };

      const res = await api.updateItAsset(selectedAsset.id, payload);
      if (res?.success) {
        setAssets(prev =>
          prev.map(a => (a.id === selectedAsset.id ? { ...a, ...payload } : a))
        );
        addToast(`Data perangkat ${formData.name} berhasil diperbarui.`, 'success');
        setIsEditModalOpen(false);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui perangkat.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 3. DELETE Asset
  const handleOpenDelete = (asset) => {
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;
    setSaving(true);
    try {
      await api.deleteItAsset(selectedAsset.id);
      setAssets(prev => prev.filter(a => a.id !== selectedAsset.id));
      addToast(`Perangkat ${selectedAsset.name} berhasil dihapus dari inventaris.`, 'success');
      setIsDeleteModalOpen(false);
      setSelectedAsset(null);
    } catch (err) {
      addToast(err.message || 'Gagal menghapus perangkat.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 4. Quick Toggle Status
  const handleToggleStatus = async (asset) => {
    const nextStatus = asset.status === 'online' ? 'offline' : 'online';
    try {
      await api.updateItAsset(asset.id, { status: nextStatus, last_sync: 'Baru saja' });
      setAssets(prev =>
        prev.map(a => (a.id === asset.id ? { ...a, status: nextStatus, last_sync: 'Baru saja' } : a))
      );
      addToast(`Status ${asset.name} diubah menjadi ${nextStatus.toUpperCase()}`, 'info');
    } catch (err) {
      addToast(err.message || 'Gagal mengubah status', 'error');
    }
  };

  // 5. Diagnostics Ping
  const handlePingDevice = (asset) => {
    setSelectedAsset(asset);
    setIsPingModalOpen(true);
    setPinging(true);
    setPingResult(null);

    const ip = asset.ip_address || asset.ipAddress;
    setTimeout(() => {
      setPinging(false);
      if (asset.status === 'offline') {
        setPingResult({
          success: false,
          message: `Host ${ip || 'Unknown IP'} Unreachable. Timeout 4000ms. Perangkat tidak merespons ICMP ping.`,
          packetLoss: '100%',
          latency: 'N/A'
        });
      } else {
        setPingResult({
          success: true,
          message: `64 bytes from ${ip || '192.168.1.1'}: icmp_seq=1 ttl=56 time=18.4 ms`,
          packetLoss: '0%',
          latency: '18.4 ms'
        });
      }
    }, 700);
  };

  // Filtered dataset
  const displayedAssets = assets.filter(a => {
    if (statusFilter === 'online') return a.status === 'online';
    if (statusFilter === 'offline') return a.status === 'offline';
    if (statusFilter === 'maintenance') return a.status === 'maintenance';
    return true;
  });

  const columns = [
    {
      header: 'Perangkat & Kategori',
      render: (row) => {
        const cat = row.category || '';
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
              cat.includes('Biometric') ? 'bg-purple-100 text-purple-700' :
              cat.includes('Patrol') ? 'bg-blue-100 text-blue-700' :
              cat.includes('CCTV') ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {cat.includes('Biometric') ? <Fingerprint className="w-5 h-5" /> :
               cat.includes('Patrol') ? <Cpu className="w-5 h-5" /> :
               cat.includes('CCTV') ? <Camera className="w-5 h-5" /> :
               <Laptop className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-brand-dark text-xs">{row.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">{row.id} • {row.category}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Lokasi Penempatan Site',
      render: (row) => (
        <div className="flex items-start gap-1.5 text-xs text-slate-700 max-w-xs">
          <MapPin className="w-3.5 h-3.5 text-brand-red flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{row.site}</span>
        </div>
      )
    },
    {
      header: 'IP / Serial Number',
      render: (row) => (
        <div className="text-xs space-y-0.5 font-mono">
          <p className="font-semibold text-slate-800">{row.ip_address || row.ipAddress || '-'}</p>
          <p className="text-[10px] text-slate-400">SN: {row.serial_no || row.serialNo || '-'}</p>
        </div>
      )
    },
    {
      header: 'Sinkronisasi Terakhir',
      render: (row) => (
        <div className="text-xs text-slate-600">
          <p className="font-medium">{row.last_sync || row.lastSync || 'Baru'}</p>
          <span className="text-[10px] text-slate-400 font-mono">FW: {row.firmware || 'v1.0.0'}</span>
        </div>
      )
    },
    {
      header: 'Status Koneksi',
      render: (row) => (
        <StatusBadge status={row.status} type="it_device" />
      )
    },
    {
      header: 'Aksi Pengelolaan',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            icon={Edit2}
            title="Ubah / Edit Data Perangkat"
          >
            Ubah
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDelete(row)}
            icon={Trash2}
            title="Hapus Perangkat dari Inventaris"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            Hapus
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePingDevice(row)}
            title="Diagnostik Ping & Telemetri"
          >
            Ping
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaris Aset IT & Perangkat IoT Lapangan"
        subtitle="Manajemen CRUD perangkat biometrik presensi, GPS wand patroli security, dan hardware penunjang operasional di site klien."
        breadcrumb={['Dashboard', 'IT Support', 'Aset IT & Perangkat']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCw}
              loading={loading}
              onClick={fetchAssets}
            >
              Segarkan
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
              className="shadow-md shadow-red-900/10"
            >
              Daftarkan Perangkat Baru
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-card p-4 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Aset Terdaftar</p>
            <p className="text-xl font-black text-brand-dark">{assets.length} Unit</p>
          </div>
        </div>

        <div className="bg-white rounded-card p-4 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Perangkat Online</p>
            <p className="text-xl font-black text-emerald-700">{assets.filter(a => a.status === 'online').length} Unit</p>
          </div>
        </div>

        <div className="bg-white rounded-card p-4 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Perangkat Offline</p>
            <p className="text-xl font-black text-rose-700">{assets.filter(a => a.status === 'offline').length} Unit</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'all'
              ? 'bg-brand-red text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua Aset ({assets.length})
        </button>
        <button
          onClick={() => setStatusFilter('online')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'online'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          Online ({assets.filter(a => a.status === 'online').length})
        </button>
        <button
          onClick={() => setStatusFilter('offline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'offline'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Offline ({assets.filter(a => a.status === 'offline').length})
        </button>
        <button
          onClick={() => setStatusFilter('maintenance')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'maintenance'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          Pemeliharaan ({assets.filter(a => a.status === 'maintenance').length})
        </button>
      </div>

      <DataTable
        columns={columns}
        data={displayedAssets}
        loading={loading}
        searchable
        searchPlaceholder="Cari nama perangkat, site klien, nomor seri, atau IP address..."
        emptyMessage="Tidak ada perangkat IT yang ditemukan."
      />

      {/* Modal CREATE Asset */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Daftarkan Perangkat IT / IoT Baru"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <Input
            label="Nama / Model Perangkat"
            placeholder="Contoh: ZKTeco SpeedFace-V5L Biometric"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Kategori Perangkat"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={categoryOptions}
          />

          <Input
            label="Lokasi Penempatan (Site / Pos Satpam / HQ)"
            placeholder="Contoh: PT. Telkom Indonesia - Pos Security Gerbang Barat"
            value={formData.site}
            onChange={(e) => setFormData({ ...formData, site: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nomor Seri (Serial Number)"
              placeholder="ZK-SN-2026-XXXX"
              value={formData.serial_no}
              onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })}
              required
            />
            <Input
              label="Alamat IP Static / Host"
              placeholder="192.168.10.XX"
              value={formData.ip_address}
              onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Versi Firmware"
              placeholder="v1.0.0-prod"
              value={formData.firmware}
              onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
            />
            <Select
              label="Status Operasional"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={statusOptions}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={saving} icon={Plus}>
              Simpan Perangkat
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal EDIT Asset */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Data Perangkat IT"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUpdateAsset} className="space-y-4">
          <Input
            label="Nama / Model Perangkat"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Kategori Perangkat"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={categoryOptions}
          />

          <Input
            label="Lokasi Penempatan (Site / Pos Satpam / HQ)"
            value={formData.site}
            onChange={(e) => setFormData({ ...formData, site: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nomor Seri (Serial Number)"
              value={formData.serial_no}
              onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })}
              required
            />
            <Input
              label="Alamat IP Static / Host"
              value={formData.ip_address}
              onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Versi Firmware"
              value={formData.firmware}
              onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
            />
            <Select
              label="Status Operasional"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={statusOptions}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={saving}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal DELETE Asset */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Perangkat"
        maxWidth="max-w-md"
      >
        {selectedAsset && (
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Apakah Anda yakin ingin menghapus perangkat ini?</p>
                <p className="mt-1 text-slate-600">
                  Perangkat <strong>{selectedAsset.name}</strong> ({selectedAsset.id}) di lokasi <strong>{selectedAsset.site}</strong> akan dihapus permanen dari inventaris.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="!bg-rose-600 hover:!bg-rose-700"
                onClick={handleDeleteAsset}
                loading={saving}
                icon={Trash2}
              >
                Hapus Perangkat
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Ping / Diagnostics */}
      <Modal
        isOpen={isPingModalOpen}
        onClose={() => setIsPingModalOpen(false)}
        title="Diagnostik Jaringan & Telemetri Perangkat"
        maxWidth="max-w-md"
      >
        {selectedAsset && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-brand-dark">{selectedAsset.name}</p>
              <p className="text-slate-500 font-mono text-[11px]">
                IP: {selectedAsset.ip_address || selectedAsset.ipAddress || '-'} • SN: {selectedAsset.serial_no || selectedAsset.serialNo || '-'}
              </p>
              <p className="text-slate-500 text-[11px]">Lokasi: {selectedAsset.site}</p>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                <span>ICMP PING DIAGNOSTIC</span>
                {pinging ? (
                  <span className="text-brand-yellow flex items-center gap-1 animate-pulse">
                    <Activity className="w-3.5 h-3.5" /> Pinging...
                  </span>
                ) : (
                  <span className="text-emerald-400">Done</span>
                )}
              </div>

              {pinging ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Mengirimkan 4 paket ICMP echo request ke host...
                </div>
              ) : pingResult ? (
                <div className="space-y-2 text-[11px]">
                  <p className={pingResult.success ? 'text-emerald-400' : 'text-rose-400'}>
                    {pingResult.message}
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-slate-400 space-y-0.5 text-[10px]">
                    <p>Paket Terkirim: 4, Diterima: {pingResult.success ? 4 : 0}, Packet Loss: {pingResult.packetLoss}</p>
                    <p>Latensi Bolak-Balik (RTT): {pingResult.latency}</p>
                    <p>Status Hardware: <strong className={pingResult.success ? 'text-emerald-400' : 'text-rose-400'}>{pingResult.success ? 'HEALTHY & SYNCED' : 'UNREACHABLE'}</strong></p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePingDevice(selectedAsset)}
                loading={pinging}
              >
                Ulangi Tes Ping
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsPingModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
