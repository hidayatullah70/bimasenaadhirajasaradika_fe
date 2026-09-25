/**
 * NotificationPage — full notification center at /ops/notifications.
 * Categories: approval, deadline, contract_expiry, legal, COD, invoice_overdue,
 *             attendance, incident, it_ticket, website_lead (PRD §23).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StateViews';
import notificationAdapter from '@/services/adapters/notificationAdapter';
import { NOTIFICATION_SEVERITY } from '@/constants/business';
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

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await notificationAdapter.getNotifications();
    if (err) { setError(err.message); } else { setNotifications(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    await notificationAdapter.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await notificationAdapter.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarkingAll(false);
  };

  const handleClick = async (notif) => {
    if (!notif.read) await handleMarkRead(notif.id);
    if (notif.target_route) navigate(notif.target_route);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Pusat Notifikasi"
        description={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi telah dibaca'}
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
        <div className="space-y-2">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              id={`notif-${notif.id}`}
              onClick={() => handleClick(notif)}
              className={clsx(
                'w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 hover:shadow-card',
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
                    notif.read ? 'bg-border' : (SEVERITY_DOT[notif.severity] || 'bg-slate')
                  )}
                  aria-hidden
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className={clsx('text-sm font-semibold truncate', notif.read ? 'text-muted' : 'text-ink')}>
                  {notif.title}
                </p>
                <p className="text-sm text-slate mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-xs text-muted mt-1">
                  {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: idLocale })}
                </p>
              </div>

              {!notif.read && (
                <span className="flex-none px-2 py-0.5 rounded-full bg-primary-red/10 text-primary-red text-xs font-medium">
                  Baru
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
