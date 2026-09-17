import React, { useState, useEffect } from 'react';
import { Menu, Bell, Globe, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../app/context/AuthContext';
import { api } from '../../services/api/apiClient';
import { Avatar } from '../ui/Avatar';

export function DashboardTopbar({ onOpenMobileMenu, onNavigateLanding }) {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.getNotifications();
        if (res.success) setNotifications(res.data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    }
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="h-16 bg-white border-b border-brand-border px-4 sm:px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-brand-dark hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-400">Portal Operasional</span>
          <span>/</span>
          <span className="text-brand-dark font-semibold capitalize">{role} Workspace</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Link back to public landing page */}
        <button
          type="button"
          onClick={onNavigateLanding}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-brand-red bg-slate-50 hover:bg-red-50/50 rounded-btn border border-slate-200 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Lihat Website Publik</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-brand-dark hover:bg-slate-100 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-red rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-card shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">Notifikasi Operasional</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-brand-red text-[10px] font-bold">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-brand-red hover:underline font-medium"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Tidak ada notifikasi baru</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors hover:bg-slate-50 ${
                        n.unread ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex-shrink-0">
                          {n.type === 'finance' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-brand-yellow-dark" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-brand-dark">{n.title}</p>
                          <p className="text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size="md"
            className="shadow-sm ring-1 ring-slate-200"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-brand-dark leading-tight">{user?.name || 'Staff'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.roleLabel || role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
