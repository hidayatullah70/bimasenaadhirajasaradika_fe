import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import {
  Globe,
  Settings,
  Save,
  Radio,
  FileText,
  Shield,
  Layers,
  CheckCircle2,
  Bell
} from 'lucide-react';

export function AdminWebsiteSettings() {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    companyName: 'PT. Bhimasena Adhirajasa Radhika',
    companyShortName: 'BARAK',
    siteTitle: 'PT. Bhimasena Adhirajasa Radhika — Solusi Alih Daya & Pengamanan Terpercaya',
    metaDescription: 'Perusahaan terdepan penyedia jasa alih daya (outsourcing) resmi di Indonesia.',
    contactPhone: '+62 21 8901 2345',
    contactEmail: 'contact@bimasenaadhirajasaradika.com',
    officeAddress: 'Rukan Sentra Niaga Blok B No. 12, Jl. Boulevard Raya, Grand Galaxy City, Kota Bekasi, Jawa Barat 17147',
    maintenanceMode: false,
    broadcastAnnouncement: 'Selamat datang di Portal Operasional Terpadu PT. Bhimasena Adhirajasa Radhika.'
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast('Pengaturan website dan parameter sistem berhasil disimpan!', 'success');
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Pengelolaan Website & Konfigurasi Sistem"
        subtitle="Pengaturan identitas perusahaan, mode pemeliharaan (maintenance), broadcast pengumuman, dan matriks hak akses."
        breadcrumb={['Dashboard', 'Admin', 'Settings']}
      />

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Identitas Website */}
        <Card>
          <CardHeader
            title="Identitas & Meta Data Perusahaan"
            subtitle="Informasi profil resmi yang ditampilkan pada portal publik dan footer"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input
              label="Nama Resmi Perusahaan"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              required
            />
            <Input
              label="Singkatan / Brand Name"
              value={settings.companyShortName}
              onChange={(e) => setSettings({ ...settings, companyShortName: e.target.value })}
              required
            />
            <Input
              label="Nomor Telepon Hotline Kantor"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              required
            />
            <Input
              label="Alamat Email Resmi"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              required
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Alamat Kantor Pusat"
                value={settings.officeAddress}
                onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
                required
              />
            </div>
          </div>
        </Card>

        {/* Broadcast & Maintenance */}
        <Card>
          <CardHeader
            title="Pengumuman Sistem & Status Pemeliharaan"
            subtitle="Broadcast informasi darurat dan kontrol akses publik"
          />
          <div className="space-y-4 text-xs">
            <div>
              <Input
                label="Pesan Broadcast Pengumuman Dashboard"
                value={settings.broadcastAnnouncement}
                onChange={(e) => setSettings({ ...settings, broadcastAnnouncement: e.target.value })}
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-brand-dark text-sm">Mode Pemeliharaan (Maintenance Mode)</h4>
                <p className="text-slate-500 mt-0.5">
                  Jika diaktifkan, halaman publik akan menampilkan status perbaikan dan hanya admin yang dapat mengakses sistem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  settings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {settings.maintenanceMode ? 'Mode Aktif (Maintenance ON)' : 'Normal (OFF)'}
              </button>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="primary" size="md" icon={Save} type="submit" loading={saving}>
            Simpan Konfigurasi
          </Button>
        </div>
      </form>
    </div>
  );
}
