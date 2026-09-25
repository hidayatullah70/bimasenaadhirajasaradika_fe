/**
 * Mock notification data for development.
 * Source of Truth: PRD Section 23.
 */

import { NOTIFICATION_CATEGORIES, NOTIFICATION_SEVERITY } from '@/constants/business';

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-001',
    title: 'Kontrak Karyawan Akan Berakhir',
    message: 'Kontrak EMP-000012 (Andi Wijaya) akan berakhir dalam 7 hari.',
    category: NOTIFICATION_CATEGORIES.CONTRACT_EXPIRY,
    severity: NOTIFICATION_SEVERITY.WARNING,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    read: false,
    target_route: '/ops/hrd/employees/EMP-000012',
  },
  {
    id: 'notif-002',
    title: 'Invoice Jatuh Tempo',
    message: 'INV-2026-000008 (JNT LOGISTIK) telah melewati jatuh tempo.',
    category: NOTIFICATION_CATEGORIES.INVOICE_OVERDUE,
    severity: NOTIFICATION_SEVERITY.DANGER,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    target_route: '/ops/finance/invoices/INV-2026-000008',
  },
  {
    id: 'notif-003',
    title: 'Lead Website Baru',
    message: 'Ada permintaan konsultasi baru dari PT. Maju Bersama.',
    category: NOTIFICATION_CATEGORIES.WEBSITE_LEAD,
    severity: NOTIFICATION_SEVERITY.INFO,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    target_route: '/ops/marketing/leads',
  },
  {
    id: 'notif-004',
    title: 'Kasus COD Memerlukan Perhatian',
    message: 'COD-2026-000003 belum diselesaikan selama 14 hari.',
    category: NOTIFICATION_CATEGORIES.COD,
    severity: NOTIFICATION_SEVERITY.WARNING,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    target_route: '/ops/finance/cod/cases/COD-2026-000003',
  },
  {
    id: 'notif-005',
    title: 'Approval Payroll Menunggu',
    message: 'Payroll September 2026 memerlukan persetujuan Direktur.',
    category: NOTIFICATION_CATEGORIES.APPROVAL,
    severity: NOTIFICATION_SEVERITY.INFO,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
    target_route: '/ops/finance/payroll',
  },
];
