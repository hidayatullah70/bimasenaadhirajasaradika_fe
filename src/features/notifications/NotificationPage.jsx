/**
 * NotificationPage — full notification center at /ops/notifications.
 * Categories: approval, deadline, contract_expiry, legal, COD, invoice_overdue,
 *             attendance, incident, it_ticket, website_lead (PRD §23).
 * RBAC Rule: Direktur can view all notification details.
 *            Each department can view their own notification details.
 *            Accessing another department's notification is denied with a 403 alert.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  Lock,
  Unlock,
  X,
  ExternalLink,
  Calendar,
  FileText,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StateViews';
import notificationAdapter from '@/services/adapters/notificationAdapter';
import { NOTIFICATION_SEVERITY } from '@/constants/business';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLES } from '@/constants/roles';
import clsx from 'clsx';

const SEVERITY_STYLES = {
  [NOTIFICATION_SEVERITY.INFO]: 'border-info/30 bg-info/5',
  [NOTIFICATION_SEVERITY.WARNING]: 'border-warning/30 bg-warning/5',
  [NOTIFICATION_SEVERITY.DANGER]: 'border-danger/30 bg-danger/5',
  [NOTIFICATION_SEVERITY.SUCCESS]: 'border-success/30 bg-success/5',
};

const SEVERITY_DOT = {
  [NOTIFICATION_SEVERITY.INFO]: 'bg-info',
  [NOTIFICATION_SEVERITY.WARNING]: 'bg-warning',
  [NOTIFICATION_SEVERITY.DANGER]: 'bg-danger',
  [NOTIFICATION_SEVERITY.SUCCESS]: 'bg-success',
};

const DEPARTMENT_COLORS = {
  Operasional: 'bg-blue-50 text-blue-700 border-blue-200',
  HRD: 'bg-purple-50 text-purple-700 border-purple-200',
  Keuangan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Marketing: 'bg-amber-50 text-amber-700 border-amber-200',
  Legal: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'IT Support': 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userRole = currentUser?.role;
  const isDirector = userRole === ROLES.DIREKTUR;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  // Modal states for detail and access denial
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deniedNotif, setDeniedNotif] = useState(null);
  const [isDeniedOpen, setIsDeniedOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await notificationAdapter.getNotifications();
    if (err) {
      setError(err.message);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id) => {
    await notificationAdapter.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await notificationAdapter.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarkingAll(false);
  };

  const checkAuthorization = (notif) => {
    if (isDirector) return true;
    if (!notif?.allowed_roles || notif.allowed_roles.length === 0) return true;
    return notif.allowed_roles.includes(userRole);
  };

  const canAccessRoute = (route) => {
    if (!route) return false;
    if (isDirector) return true;
    if (route.startsWith('/ops/master')) return true;
    if (route.startsWith('/ops/hrd') && userRole === ROLES.HRD) return true;
    if (route.startsWith('/ops/finance') && userRole === ROLES.FINANCE) return true;
    if (route.startsWith('/ops/operations') && userRole === ROLES.OPERASIONAL) return true;
    if (route.startsWith('/ops/marketing') && userRole === ROLES.MARKETING) return true;
    if (route.startsWith('/ops/legal') && userRole === ROLES.LEGAL) return true;
    if (route.startsWith('/ops/it') && userRole === ROLES.IT_SUPPORT) return true;
    if (route.startsWith('/ops/website') && userRole === ROLES.ADMIN_WEBSITE) return true;
    return false;
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      await handleMarkRead(notif.id);
    }

    const authorized = checkAuthorization(notif);
    if (authorized) {
      setSelectedNotif(notif);
      setIsDetailOpen(true);
    } else {
      setDeniedNotif(notif);
      setIsDeniedOpen(true);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Pusat Notifikasi"
        description={
          unreadCount > 0
            ? `${unreadCount} notifikasi belum dibaca`
            : 'Semua notifikasi telah dibaca'
        }
        actions={
          unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              loading={markingAll}
              iconLeft={<CheckCheck className="h-4 w-4" />}
              onClick={handleMarkAllRead}
              id="mark-all-read-btn"
            >
              Tandai Semua Dibaca
            </Button>
          )
        }
      />

      {loading && <LoadingState rows={5} />}
      {error && <ErrorState message={error} retry={load} />}

      {!loading && !error && notifications.length === 0 && (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="Tidak ada notifikasi"
          description="Anda tidak memiliki notifikasi saat ini."
        />
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-2.5">
          {notifications.map((notif) => {
            const hasAccess = checkAuthorization(notif);

            return (
              <button
                key={notif.id}
                id={`notif-${notif.id}`}
                onClick={() => handleClick(notif)}
                className={clsx(
                  'w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 hover:shadow-card group',
                  SEVERITY_STYLES[notif.severity] || 'border-border bg-surface',
                  !notif.read && 'ring-1 ring-inset ring-primary-red/10'
                )}
                aria-label={`${notif.title} — ${notif.read ? 'dibaca' : 'belum dibaca'}`}
              >
                {/* Severity dot */}
                <div className="flex-none mt-1">
                  <span
                    className={clsx(
                      'block h-2.5 w-2.5 rounded-full',
                      notif.read
                        ? 'bg-border'
                        : SEVERITY_DOT[notif.severity] || 'bg-slate'
                    )}
                    aria-hidden
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={clsx(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-md border',
                        DEPARTMENT_COLORS[notif.department] ||
                          'bg-canvas text-ink border-border'
                      )}
                    >
                      Divisi: {notif.department || 'Umum'}
                    </span>

                    {hasAccess ? (
                      <span className="text-[11px] text-accent-green font-medium flex items-center gap-1">
                        <Unlock className="h-3 w-3" />
                        {isDirector ? 'Akses Penuh Direktur' : 'Akses Divisi Anda'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted font-medium flex items-center gap-1 bg-canvas/80 px-2 py-0.5 rounded border border-border">
                        <Lock className="h-3 w-3 text-amber-600" />
                        Khusus {notif.department} & Direktur
                      </span>
                    )}
                  </div>

                  <p
                    className={clsx(
                      'text-sm font-semibold truncate',
                      notif.read ? 'text-muted' : 'text-ink'
                    )}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-muted mt-1.5">
                    {formatDistanceToNow(new Date(notif.timestamp), {
                      addSuffix: true,
                      locale: idLocale,
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-none">
                  {!notif.read && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-red/10 text-primary-red text-[11px] font-medium">
                      Baru
                    </span>
                  )}
                  <span className="text-[11px] text-muted group-hover:text-primary-red flex items-center gap-0.5 font-medium transition-colors">
                    Lihat Detail →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Detail Notifikasi Lengkap (Diizinkan: Direktur & Divisi Terkait) */}
      {isDetailOpen && selectedNotif && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-scale-up border border-border">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-start justify-between bg-canvas/40">
              <div className="flex items-start gap-3">
                <div
                  className={clsx('p-2.5 rounded-xl flex-none', {
                    'bg-danger/10 text-danger':
                      selectedNotif.severity === NOTIFICATION_SEVERITY.DANGER,
                    'bg-warning/10 text-warning':
                      selectedNotif.severity === NOTIFICATION_SEVERITY.WARNING,
                    'bg-info/10 text-info':
                      selectedNotif.severity === NOTIFICATION_SEVERITY.INFO,
                    'bg-success/10 text-success':
                      selectedNotif.severity === NOTIFICATION_SEVERITY.SUCCESS,
                  })}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={clsx(
                        'text-xs font-semibold px-2 py-0.5 rounded border',
                        DEPARTMENT_COLORS[selectedNotif.department] ||
                          'bg-white text-ink border-border'
                      )}
                    >
                      Divisi: {selectedNotif.department}
                    </span>
                    <span className="text-[11px] font-mono text-muted">
                      Ref: {selectedNotif.reference_id || selectedNotif.id}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-ink leading-snug">
                    {selectedNotif.title}
                  </h2>
                  <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(selectedNotif.timestamp), 'dd MMMM yyyy, HH:mm', {
                      locale: idLocale,
                    })}{' '}
                    WIB (
                    {formatDistanceToNow(new Date(selectedNotif.timestamp), {
                      addSuffix: true,
                      locale: idLocale,
                    })}
                    )
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              {/* Ringkasan Notifikasi */}
              <div className="p-3.5 bg-canvas rounded-xl border border-border space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pesan Notifikasi
                </p>
                <p className="text-sm font-medium text-ink leading-relaxed">
                  {selectedNotif.message}
                </p>
              </div>

              {/* Rincian Spesifik Dokumen / Entitas */}
              {selectedNotif.details && (
                <div className="p-4 bg-white rounded-xl border border-border space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary-red" />
                    Data Rincian Terkait
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedNotif.details.client && (
                      <div className="p-2.5 rounded-lg bg-canvas border border-border/80">
                        <span className="text-[10px] text-muted block">Mitra Klien</span>
                        <span className="font-semibold text-ink text-xs">
                          {selectedNotif.details.client}
                        </span>
                      </div>
                    )}
                    {selectedNotif.details.location && (
                      <div className="p-2.5 rounded-lg bg-canvas border border-border/80">
                        <span className="text-[10px] text-muted block">Lokasi Posko</span>
                        <span className="font-semibold text-ink text-xs">
                          {selectedNotif.details.location}
                        </span>
                      </div>
                    )}
                    {selectedNotif.details.employeeName && (
                      <div className="p-2.5 rounded-lg bg-canvas border border-border/80">
                        <span className="text-[10px] text-muted block">
                          Personel Bersangkutan
                        </span>
                        <span className="font-semibold text-ink text-xs">
                          {selectedNotif.details.employeeName} (
                          {selectedNotif.details.employeeId})
                        </span>
                      </div>
                    )}
                    {selectedNotif.details.nominal && (
                      <div className="p-2.5 rounded-lg bg-canvas border border-border/80">
                        <span className="text-[10px] text-muted block">
                          Nominal Tagihan
                        </span>
                        <span className="font-semibold text-primary-red font-mono text-xs">
                          {selectedNotif.details.nominal}
                        </span>
                      </div>
                    )}
                    {selectedNotif.details.varianceAmount && (
                      <div className="p-2.5 rounded-lg bg-canvas border border-border/80">
                        <span className="text-[10px] text-muted block">
                          Selisih Kas COD
                        </span>
                        <span className="font-semibold text-error font-mono text-xs">
                          {selectedNotif.details.varianceAmount}
                        </span>
                      </div>
                    )}
                    {selectedNotif.details.prospectName && (
                      <div className="p-2.5 rounded-lg bg-canvas border border-border/80">
                        <span className="text-[10px] text-muted block">
                          Calon Klien Prospek
                        </span>
                        <span className="font-semibold text-ink text-xs">
                          {selectedNotif.details.prospectName}
                        </span>
                      </div>
                    )}
                    {selectedNotif.details.incidentType && (
                      <div className="p-2.5 rounded-lg bg-canvas border border-border/80">
                        <span className="text-[10px] text-muted block">
                          Kategori Insiden
                        </span>
                        <span className="font-semibold text-error text-xs">
                          {selectedNotif.details.incidentType}
                        </span>
                      </div>
                    )}
                    {selectedNotif.details.grossPayroll && (
                      <div className="p-2.5 rounded-lg bg-canvas border border-border/80">
                        <span className="text-[10px] text-muted block">
                          Total Bruto Payroll
                        </span>
                        <span className="font-semibold text-accent-green font-mono text-xs">
                          {selectedNotif.details.grossPayroll}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Kronologi & Konteks */}
                  {selectedNotif.details.summary && (
                    <div className="pt-2 border-t border-border/60">
                      <span className="text-[11px] font-semibold text-ink block mb-1">
                        Konteks & Kronologi:
                      </span>
                      <p className="text-slate text-xs leading-relaxed">
                        {selectedNotif.details.summary}
                      </p>
                    </div>
                  )}

                  {/* Rekomendasi Tindak Lanjut */}
                  {selectedNotif.details.recommendation && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                      <span className="text-[11px] font-bold text-amber-900 block mb-0.5">
                        Rekomendasi Tindak Lanjut SOP:
                      </span>
                      <p className="text-amber-800 text-xs leading-relaxed">
                        {selectedNotif.details.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-canvas/30 flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDetailOpen(false)}
              >
                Tutup
              </Button>

              {selectedNotif.target_route && canAccessRoute(selectedNotif.target_route) && (
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setIsDetailOpen(false);
                    navigate(selectedNotif.target_route);
                  }}
                >
                  <span>Buka Halaman Modul</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Access Denied / 403 (Ditolak: Bagian Lain Mencoba Akses) */}
      {isDeniedOpen && deniedNotif && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-scale-up border border-border">
            {/* Header */}
            <div className="p-5 bg-error/5 border-b border-error/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-error/15 text-error flex-none">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-error uppercase tracking-wider">
                    Akses Ditolak (HTTP 403)
                  </span>
                  <h2 className="text-base font-bold text-ink">
                    Batas Otoritas Lintas Divisi
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsDeniedOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                <span className="text-[10px] text-muted uppercase font-bold">
                  Judul Notifikasi
                </span>
                <p className="font-semibold text-ink text-sm">
                  {deniedNotif.title}
                </p>
                <p className="text-muted text-[11px]">
                  Kategori: {deniedNotif.category} • Waktu:{' '}
                  {formatDistanceToNow(new Date(deniedNotif.timestamp), {
                    addSuffix: true,
                    locale: idLocale,
                  })}
                </p>
              </div>

              <div className="space-y-2.5 text-slate leading-relaxed">
                <p>
                  Anda sedang masuk dengan akun{' '}
                  <strong className="text-ink font-semibold">
                    {currentUser?.name || 'Pengguna'}
                  </strong>{' '}
                  sebagai bagian{' '}
                  <strong className="text-ink font-semibold">
                    {userRole?.toUpperCase()}
                  </strong>
                  .
                </p>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-700" />
                    Khusus Divisi {deniedNotif.department} & Direktur Utama
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Sesuai tata kelola keamanan dan pemisahan tugas (Segregation of
                    Duties / RBAC), rincian data internal divisi lain tidak dapat
                    diakses oleh bagian Anda.
                  </p>
                </div>

                <p className="text-[11px] text-muted">
                  Catatan: Akun <strong>Direktur</strong> memiliki wewenang
                  menyeluruh untuk meninjau dan menindaklanjuti seluruh notifikasi
                  lintas divisi.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-canvas/30 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsDeniedOpen(false)}
              >
                Kembali ke Pusat Notifikasi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

