/**
 * User Form Modal (Create / Edit Akun Sistem) — PT. BARAK IOMS
 * Source of Truth: PRD Section 6 & 19 (RBAC Roles).
 */

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import { STATUS } from '@/constants/status';
import toast from 'react-hot-toast';

export default function UserFormModal({ isOpen, user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: ROLES.OPERASIONAL,
    department: 'Operasional Lapangan',
    status: STATUS.ACTIVE,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || ROLES.OPERASIONAL,
        department: user.department || '',
        status: user.status || STATUS.ACTIVE,
      });
    } else {
      setFormData({
        name: '',
        username: '',
        email: '',
        role: ROLES.OPERASIONAL,
        department: 'Operasional Lapangan',
        status: STATUS.ACTIVE,
      });
    }
    setErrors({});
  }, [user, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama lengkap wajib diisi.';
    if (!formData.username.trim()) errs.username = 'Username wajib diisi.';
    if (!formData.email.trim()) errs.email = 'Email resmi wajib diisi.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Mohon lengkapi kolom yang wajib diisi.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {user ? 'Ubah Akun Pengguna' : 'Tambah Akun Sistem Baru'}
            </h2>
            <p className="text-xs text-muted">Konfigurasi hak akses role dan departemen sistem IOMS.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas">
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              placeholder="Contoh: Ahmad Yani, S.Kom"
            />
            {errors.name && <p className="text-error text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Username Login *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
                placeholder="ahmad.yani"
              />
              {errors.username && <p className="text-error text-[11px] mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Email Resmi *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="ahmad@barak.co.id"
              />
              {errors.email && <p className="text-error text-[11px] mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">Role / Peran Akses Sistem *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              {Object.keys(ROLES).map((key) => (
                <option key={key} value={ROLES[key]}>
                  {ROLE_LABELS[ROLES[key]] || ROLES[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">Departemen / Divisi</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Operasional Lapangan"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              Simpan Pengguna
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
