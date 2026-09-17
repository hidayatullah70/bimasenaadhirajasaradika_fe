import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LandingPage } from '../../features/landing/LandingPage';
import { LoginPage } from '../../features/auth/LoginPage';
import { RegisterPage } from '../../features/auth/RegisterPage';
import { DashboardShell } from '../../components/layout/DashboardShell';

// Owner views
import { OwnerOverview } from '../../features/owner/OwnerOverview';
import { UserManagement } from '../../features/owner/UserManagement';
import { AuditLogView } from '../../features/owner/AuditLogView';

// HRD views
import { HrdOverview } from '../../features/hrd/HrdOverview';
import { EmployeeManagement } from '../../features/hrd/EmployeeManagement';
import { AttendanceSummary } from '../../features/hrd/AttendanceSummary';

// Operasional views
import { OperasionalOverview } from '../../features/operasional/OperasionalOverview';
import { SiteManagement } from '../../features/operasional/SiteManagement';
import { PlacementManagement } from '../../features/operasional/PlacementManagement';

// Finance views
import { FinanceOverview } from '../../features/finance/FinanceOverview';
import { InvoiceManagement } from '../../features/finance/InvoiceManagement';

// Marketing views
import { MarketingOverview } from '../../features/marketing/MarketingOverview';
import { LeadPipeline } from '../../features/marketing/LeadPipeline';

import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AppRouter() {
  const { user, role, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'dashboard'
  const [currentDashboardPath, setCurrentDashboardPath] = useState('');

  // Synchronize initial dashboard view when role is established
  useEffect(() => {
    if (role && !currentDashboardPath) {
      setCurrentDashboardPath(`${role}-overview`);
    }
  }, [role, currentDashboardPath]);

  // When user logs in or switches role, adjust default view
  useEffect(() => {
    if (role) {
      const initialPath = (role === 'direktur' || role === 'owner') ? 'owner-overview' : `${role}-overview`;
      setCurrentDashboardPath(initialPath);
    }
  }, [role]);

  // auto-redirect to login when unauthenticated on dashboard
  useEffect(() => {
    if (!isAuthenticated && currentPage === 'dashboard') {
      setCurrentPage('login');
    }
  }, [isAuthenticated, currentPage]);

  const handleNavigate = (page) => {
    if (page === 'dashboard') {
      if (!isAuthenticated) {
        setCurrentPage('login');
      } else {
        setCurrentPage('dashboard');
        setCurrentDashboardPath(`${role}-overview`);
      }
    } else {
      setCurrentPage(page);
    }
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (userRole) => {
    setCurrentPage('dashboard');
    setCurrentDashboardPath(`${userRole}-overview`);
  };

  // Render Public Landing
  if (currentPage === 'landing') {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  // Render Login
  if (currentPage === 'login') {
    return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
  }

  // Render Register
  if (currentPage === 'register') {
    return <RegisterPage onNavigate={handleNavigate} onRegisterSuccess={handleLoginSuccess} />;
  }

  // Check Role Permissions for Dashboard Route
  const renderDashboardContent = () => {
    const isDirekturOrOwner = role === 'direktur' || role === 'owner';

    // 1. Owner / Direktur Views
    if (currentDashboardPath.startsWith('owner') || currentDashboardPath.startsWith('direktur')) {
      if (!isDirekturOrOwner) return <UnauthorizedState onBack={() => setCurrentDashboardPath(`${role}-overview`)} />;
      if (currentDashboardPath === 'owner-overview' || currentDashboardPath === 'direktur-overview') return <OwnerOverview onNavigate={setCurrentDashboardPath} />;
      if (currentDashboardPath === 'owner-users' || currentDashboardPath === 'direktur-users') return <UserManagement />;
      if (currentDashboardPath === 'owner-workforce' || currentDashboardPath === 'direktur-workforce') return <EmployeeManagement />;
      if (currentDashboardPath === 'owner-audit' || currentDashboardPath === 'direktur-audit') return <AuditLogView onNavigate={setCurrentDashboardPath} />;
      return <OwnerOverview onNavigate={setCurrentDashboardPath} />;
    }

    // 2. HRD Views (Direktur memiliki hak supervisi eksekutif)
    if (currentDashboardPath.startsWith('hrd')) {
      if (role !== 'hrd' && !isDirekturOrOwner) return <UnauthorizedState onBack={() => setCurrentDashboardPath(`${role}-overview`)} />;
      if (currentDashboardPath === 'hrd-overview') return <HrdOverview onNavigate={setCurrentDashboardPath} />;
      if (currentDashboardPath === 'hrd-employees') return <EmployeeManagement />;
      if (currentDashboardPath === 'hrd-placements') return <PlacementManagement />;
      if (currentDashboardPath === 'hrd-attendance') return <AttendanceSummary />;
      return <HrdOverview onNavigate={setCurrentDashboardPath} />;
    }

    // 3. Operasional Views (Direktur memiliki hak supervisi eksekutif)
    if (currentDashboardPath.startsWith('operasional')) {
      if (role !== 'operasional' && !isDirekturOrOwner) return <UnauthorizedState onBack={() => setCurrentDashboardPath(`${role}-overview`)} />;
      if (currentDashboardPath === 'operasional-overview') return <OperasionalOverview onNavigate={setCurrentDashboardPath} />;
      if (currentDashboardPath === 'operasional-sites') return <SiteManagement />;
      if (currentDashboardPath === 'operasional-placements') return <PlacementManagement />;
      if (currentDashboardPath === 'operasional-attendance') return <AttendanceSummary />;
      return <OperasionalOverview onNavigate={setCurrentDashboardPath} />;
    }

    // 4. Finance Views (Direktur memiliki hak supervisi eksekutif)
    if (currentDashboardPath.startsWith('finance')) {
      if (role !== 'finance' && !isDirekturOrOwner) return <UnauthorizedState onBack={() => setCurrentDashboardPath(`${role}-overview`)} />;
      if (currentDashboardPath === 'finance-overview') return <FinanceOverview onNavigate={setCurrentDashboardPath} />;
      if (currentDashboardPath === 'finance-invoices') return <InvoiceManagement />;
      if (currentDashboardPath === 'finance-payroll-ops') return <FinanceOverview onNavigate={setCurrentDashboardPath} />;
      return <FinanceOverview onNavigate={setCurrentDashboardPath} />;
    }

    // 5. Marketing Views (Direktur memiliki hak supervisi eksekutif)
    if (currentDashboardPath.startsWith('marketing')) {
      if (role !== 'marketing' && !isDirekturOrOwner) return <UnauthorizedState onBack={() => setCurrentDashboardPath(`${role}-overview`)} />;
      if (currentDashboardPath === 'marketing-overview') return <MarketingOverview onNavigate={setCurrentDashboardPath} />;
      if (currentDashboardPath === 'marketing-leads') return <LeadPipeline />;
      if (currentDashboardPath === 'marketing-proposals') return <LeadPipeline />;
      return <MarketingOverview onNavigate={setCurrentDashboardPath} />;
    }

    // Default Fallback
    return <OwnerOverview onNavigate={setCurrentDashboardPath} />;
  };

  return (
    <DashboardShell
      currentPath={currentDashboardPath}
      onNavigate={setCurrentDashboardPath}
      onNavigateLanding={handleNavigate}
    >
      {renderDashboardContent()}
    </DashboardShell>
  );
}

function UnauthorizedState({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-card border border-red-200 text-center shadow-sm">
      <div className="w-14 h-14 rounded-full bg-red-100 text-brand-red flex items-center justify-center mb-4">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-brand-dark mb-1">Akses Tidak Diizinkan (403 Forbidden)</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        Role Anda tidak memiliki otorisasi untuk mengakses modul ini sesuai ketentuan tata kelola sistem PT. Bhimasena Adhirajasa Radhika.
      </p>
      <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBack}>
        Kembali ke Dashboard Utama Anda
      </Button>
    </div>
  );
}
