import React from 'react';
import { Badge } from '../ui/Badge';

export function StatusBadge({ status, type = 'general' }) {
  if (!status) return null;

  const s = String(status).toLowerCase();

  // Roles
  if (type === 'role') {
    const roleLabels = {
      owner: { label: 'Direktur', variant: 'dark' },
      hrd: { label: 'HRD', variant: 'blue' },
      operasional: { label: 'Operasional', variant: 'yellow' },
      finance: { label: 'Finance', variant: 'green' },
      marketing: { label: 'Marketing', variant: 'red' }
    };
    const r = roleLabels[s] || { label: status, variant: 'neutral' };
    return <Badge variant={r.variant}>{r.label}</Badge>;
  }

  // Attendance
  if (type === 'attendance') {
    const map = {
      'on-duty': { label: 'On Duty', variant: 'green' },
      'off': { label: 'Off / Lepas Piket', variant: 'neutral' },
      'permit': { label: 'Izin / Sakit', variant: 'yellow' },
      'absent': { label: 'Alpa / Tanpa Keterangan', variant: 'red' }
    };
    const a = map[s] || { label: status, variant: 'neutral' };
    return <Badge variant={a.variant}>{a.label}</Badge>;
  }

  // Invoice
  if (type === 'invoice') {
    const map = {
      paid: { label: 'Lunas', variant: 'green' },
      pending: { label: 'Menunggu', variant: 'yellow' },
      overdue: { label: 'Jatuh Tempo', variant: 'red' },
      draft: { label: 'Draft', variant: 'neutral' }
    };
    const i = map[s] || { label: status, variant: 'neutral' };
    return <Badge variant={i.variant}>{i.label}</Badge>;
  }

  // Lead / CRM Stages
  if (type === 'lead') {
    const map = {
      baru: { label: '1. Masuk Baru', variant: 'blue' },
      diskusi: { label: '2. Diskusi Kebutuhan', variant: 'neutral' },
      penawaran: { label: '3. Proposal Terkirim', variant: 'yellow' },
      negosiasi: { label: '4. Negosiasi Kontrak', variant: 'yellow' },
      menang: { label: '5. Menang / SPK Terbit', variant: 'green' }
    };
    const l = map[s] || { label: status, variant: 'neutral' };
    return <Badge variant={l.variant}>{l.label}</Badge>;
  }

  // General Status
  if (s === 'active' || s === 'operational') {
    return <Badge variant="green">Aktif</Badge>;
  }
  if (s === 'inactive' || s === 'non-active') {
    return <Badge variant="neutral">Tidak Aktif</Badge>;
  }

  return <Badge variant="neutral">{status}</Badge>;
}
