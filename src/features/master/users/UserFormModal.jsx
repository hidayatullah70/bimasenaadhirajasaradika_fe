/**
 * User Form Modal (Create / Edit Akun Sistem) — PT. BARAK IOMS
 * Source of Truth: PRD Section 6 & 19 (RBAC Roles).
 */

import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import { STATUS } from '@/constants/status';
import toast from 'react-hot-toast';

const DEFAULT_DEPARTMENTS = {
  [ROLES.DIREKTUR]: 'Direksi',
  [ROLES.HRD]: 'HRD & Personalia',
  [ROLES.LEGAL]: 'Legal & Kepatuhan',
  [ROLES.OPERASIONAL]: 'Operasional Lapangan',
  [ROLES.FINANCE]: 'Finance & Akuntansi',
  [ROLES.MARKETING]: 'Marketing & Business Development',
  [ROLES.IT_SUPPORT]: 'Teknologi Informasi',
  [ROLES.ADMIN_WEBSITE]: 'Media & Publikasi',
};

export default function UserFormModal({ isOpen, user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: ROLES.OPERASIONAL,
    department: 'Operasional Lapangan',
    status: STATUS.ACTIVE,
    subRole: '',
    roleLabel: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || ROLES.OPERASIONAL,
        department: user.department || DEFAULT_DEPARTMENTS[user.role] || 'Operasional Lapangan',
        status: user.status || STATUS.ACTIVE,
        subRole: user.subRole || '',
        roleLabel: user.roleLabel || '',
      });
    } else {
      setFormData({
        name: '',
        username: '',
        email: '',
        role: ROLES.OPERASIONAL,
        department: 'Operasional Lapangan',
        status: STATUS.ACTIVE,
        subRole: '',
        roleLabel: '',
      });
    }
    setErrors({});
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = (newRole) => {
    const defaultDept = DEFAULT_DEPARTMENTS[newRole] || formData.department;
    let nextSubRole = '';
    let nextRoleLabel = '';

    if (newRole === ROLES.HRD && formData.subRole === 'ADMIN_HRD') {
      nextSubRole = 'ADMIN_HRD';
      nextRoleLabel = 'Admin HRD (Inputer Absensi)';
    } else if (newRole === ROLES.OPERASIONAL && formData.subRole === 'PIC_KORLAP') {
      nextSubRole = 'PIC_KORLAP';
      nextRoleLabel = 'PIC Koordinator Lapangan';
    }

    setFormData({
      ...formData,
      role: newRole,
      department: defaultDept,
      subRole: nextSubRole,
      roleLabel: nextRoleLabel,
    });
  };

  const handleSubRoleChange = (subRoleVal) => {
    let label = '';
    if (subRoleVal === 'ADMIN_HRD') {
      label = 'Admin HRD (Inputer Absensi)';
    } else if (subRoleVal === 'PIC_KORLAP') {
      label = 'PIC Koordinator Lapangan';
    }
    setFormData({
      ...formData,
      subRole: subRoleVal,
      roleLabel: label,
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama lengkap wajib diisi.';
    if (!formData.username.trim()) {
      errs.username = 'Username wajib diisi.';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username.trim())) {
      errs.username = 'Username hanya boleh huruf, angka, titik, strip, atau underscore.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email resmi wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Format email tidak valid.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Mohon lengkapi kolom yang wajib diisi dengan format valid.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary-red/10 text-primary-red">
              {user ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink">
                {user ? `Ubah Akun: @${user.username}` : 'Tambah Akun Sistem Baru'}
              </h2>
              <p className="text-xs text-muted">Konfigurasi hak akses role, departemen, dan kredensial IOMS.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              placeholder="Contoh: Ahmad Yani, S.Kom"
            />
            {errors.name && <p className="text-primary-red text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Username Login *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-mono"
                placeholder="ahmad.yani"
              />
              {errors.username && <p className="text-primary-red text-[11px] mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Email Resmi *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
                placeholder="ahmad@bimasenaadhirajasaradika.com"
              />
              {errors.email && <p className="text-primary-red text-[11px] mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Role / Peran Akses Sistem *</label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
              >
                {Object.keys(ROLES).map((key) => (
                  <option key={key} value={ROLES[key]}>
                    {ROLE_LABELS[ROLES[key]] || ROLES[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Status Akun</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
              >
                <option value={STATUS.ACTIVE}>Aktif (Bisa Login)</option>
                <option value={STATUS.INACTIVE}>Non-Aktif (Terkunci)</option>
              </select>
            </div>
          </div>

          {/* Sub-Role Contextual Options */}
          {formData.role === ROLES.HRD && (
            <div>
              <label className="block font-medium text-ink mb-1">Tipe Penugasan Khusus (Sub-Role)</label>
              <select
                value={formData.subRole}
                onChange={(e) => handleSubRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
              >
                <option value="">Staf HRD Umum (Full Access HRD)</option>
                <option value="ADMIN_HRD">Admin HRD — Inputer Absensi Lapangan (User 1 / User 2)</option>
              </select>
            </div>
          )}

          {formData.role === ROLES.OPERASIONAL && (
            <div>
              <label className="block font-medium text-ink mb-1">Tipe Penugasan Khusus (Sub-Role)</label>
              <select
                value={formData.subRole}
                onChange={(e) => handleSubRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
              >
                <option value="">Staf Operasional Umum</option>
                <option value="PIC_KORLAP">PIC Koordinator Lapangan (Laporan Kegiatan)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-medium text-ink mb-1">Departemen / Divisi</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
              placeholder="Operasional Lapangan"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              <span>{user ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

