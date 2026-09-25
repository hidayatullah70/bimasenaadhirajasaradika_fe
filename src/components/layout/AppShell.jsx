/**
 * AppShell — internal protected layout.
 * Composes: Sidebar + Topbar + main content area.
 * Mounts notification polling and global search.
 * Source of Truth: UI-GUIDELINE §5 / PRD §8.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import GlobalSearch from '@/features/search/GlobalSearch';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_DEFAULT_ROUTE } from '@/constants/roles';
import notificationAdapter from '@/services/adapters/notificationAdapter';

export default function AppShell() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Redirect /ops index to the user's role default route
  useEffect(() => {
    if (currentUser && window.location.pathname === '/ops') {
      const route = ROLE_DEFAULT_ROUTE[currentUser.role] || '/ops/director';
      navigate(route, { replace: true });
    }
  }, [currentUser, navigate]);

  // Poll unread notification count (lightweight)
  const refreshUnread = useCallback(async () => {
    const { data } = await notificationAdapter.getNotifications({ unreadOnly: true });
    if (data) setUnreadCount(Array.isArray(data) ? data.length : (data.length ?? 0));
  }, []);

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 60_000); // every 60s
    return () => clearInterval(interval);
  }, [refreshUnread]);

  // Keyboard shortcut: Ctrl+K → open search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
          unreadCount={unreadCount}
          onSearchOpen={() => setSearchOpen(true)}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
            <Breadcrumb />
            <Outlet context={{ refreshUnread }} />
          </div>
        </main>
      </div>

      {/* Global Search overlay */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
