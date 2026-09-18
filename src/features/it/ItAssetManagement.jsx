import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
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
  Fingerprint
} from 'lucide-react';

const INITIAL_ASSETS = [
  {
    id: 'AST-BIO-001',
    name: 'ZKTeco FacePass 7 Biometric Terminal',
    category: 'Biometric Attendance',
    site: 'PT. Telkom Indonesia Tbk (Lantai 1 Lobi Utama)',
    serialNo: 'ZK-2026-TLK-0199',
    ipAddress: '192.168.10.45',
    lastSync: '1 menit yang lalu',
    firmware: 'v4.2.1-prod',
    status: 'online'
  },
  {
    id: 'AST-BIO-002',
    name: 'Hikvision Face & Fingerprint Terminal',
    site: 'PT. Mayora Indah Tbk (Pintu Masuk Karyawan)',
    category: 'Biometric Attendance',
    serialNo: 'HIK-MYR-8821-B',
    ipAddress: '192.168.20.12',
    lastSync: '5 menit yang lalu',
    firmware: 'v3.8.0-barak',
    status: 'online'
  },
  {
    id: 'AST-PAT-001',
    name: 'JWM Guard Tour RFID Patrol Wand (V9)',
    category: 'Security Patrol Device',
    site: 'RS Siloam Hospital Lippo Village',
    serialNo: 'JWM-SLM-0044',
    ipAddress: 'N/A (Docking Sync)',
    lastSync: '15 menit yang lalu',
    firmware: 'v2.1.0',
    status: 'online'
  },
  {
    id: 'AST-PAT-002',
    name: 'JWM Guard Tour GPS Wand',
    category: 'Security Patrol Device',
    site: 'PT. Gudang Garam Tbk (Area Gudang A)',
    serialNo: 'JWM-GG-0112',
    ipAddress: 'Cellular 4G SIM',
    lastSync: '2 jam yang lalu',
    firmware: 'v2.1.0',
    status: 'offline'
  },
  {
    id: 'AST-CCTV-001',
    name: 'Dahua 32-Ch 4K NVR Command Center',
    category: 'CCTV Surveillance',
    site: 'Kantor Pusat PT. BARAK (Security HQ)',
    serialNo: 'DH-NVR-HQ-001',
    ipAddress: '10.0.1.50',
    lastSync: 'Realtime Stream',
    firmware: 'v5.0.2',
    status: 'online'
  },
  {
    id: 'AST-LAP-001',
    name: 'ThinkPad T14 Gen 4 - Operasional Dispatch',
    category: 'Office Workstation',
    site: 'Kantor Pusat PT. BARAK (Divisi Operasional)',
    serialNo: 'PF-4X990-2026',
    ipAddress: '10.0.1.104',
    lastSync: 'Aktif saat ini',
    firmware: 'Win 11 Pro / BarakOS',
    status: 'online'
  }
];

export function ItAssetManagement() {
  const { addToast } = useToast();
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Biometric Attendance',
    site: '',
    serialNo: '',
    ipAddress: '',
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

  const handleCreateAsset = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.site || !formData.serialNo) {
      addToast('Harap isi semua kolom wajib!', 'error');
      return;
    }

    const newId = `AST-${formData.category.substring(0, 3).toUpperCase()}-${String(assets.length + 1).padStart(3, '0')}`;
    const newAsset = {
      id: newId,
      ...formData,
      lastSync: 'Baru didaftarkan'
    };

    setAssets([newAsset, ...assets]);
    addToast(`Perangkat ${formData.name} berhasil didaftarkan ke inventaris.`, 'success');
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'Biometric Attendance',
      site: '',
      serialNo: '',
      ipAddress: '',
      firmware: 'v1.0.0-prod',
      status: 'online'
    });
  };

  const handlePingDevice = (asset) => {
    setSelectedAsset(asset);
    setIsPingModalOpen(true);
    setPinging(true);
    setPingResult(null);

    setTimeout(() => {
      setPinging(false);
      if (asset.status === 'offline') {
        setPingResult({
          success: false,
          message: `Host ${asset.ipAddress} Unreachable. Timeout 4000ms. Perangkat tidak merespons ICMP ping.`,
          packetLoss: '100%',
          latency: 'N/A'
        });
      } else {
        setPingResult({
          success: true,
          message: `64 bytes from ${asset.ipAddress || '192.168.1.1'}: icmp_seq=1 ttl=56 time=18.4 ms`,
          packetLoss: '0%',
          latency: '18.4 ms'
        });
      }
    }, 800);
  };

  const handleToggleStatus = (assetId) => {
    setAssets(prev =>
      prev.map(a => {
        if (a.id === assetId) {
          const nextStatus = a.status === 'online' ? 'offline' : 'online';
          addToast(`Status perangkat ${a.name} diubah menjadi ${nextStatus.toUpperCase()}`, 'info');
          return { ...a, status: nextStatus, lastSync: 'Baru saja' };
        }
        return a;
      })
    );
  };

  const columns = [
    {
      header: 'Perangkat & Kategori',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
            row.category.includes('Biometric') ? 'bg-purple-100 text-purple-700' :
            row.category.includes('Patrol') ? 'bg-blue-100 text-blue-700' :
            row.category.includes('CCTV') ? 'bg-amber-100 text-amber-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {row.category.includes('Biometric') ? <Fingerprint className="w-5 h-5" /> :
             row.category.includes('Patrol') ? <Cpu className="w-5 h-5" /> :
             row.category.includes('CCTV') ? <Camera className="w-5 h-5" /> :
             <Laptop className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-bold text-brand-dark text-xs">{row.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{row.id} • {row.category}</p>
          </div>
        </div>
      )
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
          <p className="font-semibold text-slate-800">{row.ipAddress}</p>
          <p className="text-[10px] text-slate-400">SN: {row.serialNo}</p>
        </div>
      )
    },
    {
      header: 'Sinkronisasi Terakhir',
      render: (row) => (
        <div className="text-xs text-slate-600">
          <p className="font-medium">{row.lastSync}</p>
          <span className="text-[10px] text-slate-400 font-mono">FW: {row.firmware}</span>
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
      header: 'Aksi Diagnostik',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePingDevice(row)}
            title="Diagnostik Ping & Telemetri"
          >
            Diagnostik
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(row.id)}
            title="Ubah Status Online/Offline"
            className="!p-2 text-slate-500 hover:text-brand-dark"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaris Aset IT & Perangkat IoT Lapangan"
        subtitle="Manajemen perangkat biometrik presensi, GPS wand patroli security, dan hardware penunjang operasional di site klien."
        breadcrumb={['Dashboard', 'IT Support', 'Aset IT & Perangkat']}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="shadow-md shadow-red-900/10"
          >
            Daftarkan Perangkat Baru
          </Button>
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

      <DataTable
        columns={columns}
        data={assets}
        loading={loading}
        searchable
        searchPlaceholder="Cari nama perangkat, site klien, nomor seri, atau IP address..."
        emptyMessage="Tidak ada perangkat IT yang ditemukan."
      />

      {/* Modal Add Device */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
              value={formData.serialNo}
              onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
              required
            />
            <Input
              label="Alamat IP Static / Host"
              placeholder="192.168.10.XX"
              value={formData.ipAddress}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Perangkat
            </Button>
          </div>
        </form>
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
              <p className="text-slate-500 font-mono text-[11px]">IP: {selectedAsset.ipAddress} • SN: {selectedAsset.serialNo}</p>
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
