/**
 * Application Router — PT. BARAK IOMS
 * Public routes: /, /tentang, /layanan/*, /client, /career, /news, /blog, /faq, /contact
 * Internal routes: /ops/login, /ops/* (RequireAuth wrapped)
 *
 * CRITICAL: /ops/login is NOT linked from public navigation per PRD Section 2.2 / AGENTS.md.
 * Source of Truth: PRD Section 7 (Information Architecture).
 */

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import RequireAuth from '@/app/guards/RequireAuth';
import { Loader2 } from 'lucide-react';

// --- Lazy-load pages ---
// Public
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const AboutPage = lazy(() => import('@/features/landing/AboutPage'));
const ServicesPage = lazy(() => import('@/features/landing/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@/features/landing/ServiceDetailPage'));
const ClientsPage = lazy(() => import('@/features/landing/ClientsPage'));
const CareerPage = lazy(() => import('@/features/landing/CareerPage'));
const NewsPage = lazy(() => import('@/features/landing/NewsPage'));
const BlogPage = lazy(() => import('@/features/landing/BlogPage'));
const FaqPage = lazy(() => import('@/features/landing/FaqPage'));
const ContactPage = lazy(() => import('@/features/landing/ContactPage'));
const NotFoundPage = lazy(() => import('@/features/landing/NotFoundPage'));

// Internal auth
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));

// Director Module
const DirectorLayout = lazy(() => import('@/features/director/DirectorLayout'));
const DirectorDashboard = lazy(() => import('@/features/director/DirectorDashboard'));
const ApprovalCenterPage = lazy(() => import('@/features/director/approvals/ApprovalCenterPage'));
const RiskAlertsPage = lazy(() => import('@/features/director/risk/RiskAlertsPage'));
const ExecutiveReportPage = lazy(() => import('@/features/director/reports/ExecutiveReportPage'));
const ExecutiveActivityPage = lazy(() => import('@/features/director/activity/ExecutiveActivityPage'));

// Internal role dashboards (behind RequireAuth)
const AppShell = lazy(() => import('@/components/layout/AppShell'));
const HRDDashboard = lazy(() => import('@/features/hrd/HRDDashboard'));
const LegalDashboard = lazy(() => import('@/features/legal/LegalDashboard'));
const OperationsDashboard = lazy(() => import('@/features/operations/OperationsDashboard'));
const FinanceDashboard = lazy(() => import('@/features/finance/FinanceDashboard'));
const MarketingDashboard = lazy(() => import('@/features/marketing/MarketingDashboard'));
const ITDashboard = lazy(() => import('@/features/it/ITDashboard'));
const WebsiteDashboard = lazy(() => import('@/features/website/WebsiteDashboard'));

// HRD Module
const HRDLayout = lazy(() => import('@/features/hrd/HRDLayout'));
const AttendanceSpreadsheetPage = lazy(() => import('@/features/hrd/attendance/AttendanceSpreadsheetPage'));
const AttendancePayrollSummaryPage = lazy(() => import('@/features/hrd/attendance/AttendancePayrollSummaryPage'));
const ContractMonitoringPage = lazy(() => import('@/features/hrd/contracts/ContractMonitoringPage'));

// Legal Module
const LegalLayout = lazy(() => import('@/features/legal/LegalLayout'));
const LegalCaseListPage = lazy(() => import('@/features/legal/cases/LegalCaseListPage'));
const LegalContractListPage = lazy(() => import('@/features/legal/contracts/LegalContractListPage'));
const ComplianceRegisterPage = lazy(() => import('@/features/legal/compliance/ComplianceRegisterPage'));

// Operations Module
const OperationsLayout = lazy(() => import('@/features/operations/OperationsLayout'));
const ManpowerMonitoringPage = lazy(() => import('@/features/operations/manpower/ManpowerMonitoringPage'));
const IncidentListPage = lazy(() => import('@/features/operations/incidents/IncidentListPage'));
const ReplacementListPage = lazy(() => import('@/features/operations/replacement/ReplacementListPage'));
const FieldReportListPage = lazy(() => import('@/features/operations/fieldReports/FieldReportListPage'));

// Finance Module
const FinanceLayout = lazy(() => import('@/features/finance/FinanceLayout'));
const InvoiceListPage = lazy(() => import('@/features/finance/invoices/InvoiceListPage'));
const PayrollListPage = lazy(() => import('@/features/finance/payroll/PayrollListPage'));
const CODReconciliationPage = lazy(() => import('@/features/finance/cod/CODReconciliationPage'));

// Marketing Module
const MarketingLayout = lazy(() => import('@/features/marketing/MarketingLayout'));
const LeadListPage = lazy(() => import('@/features/marketing/leads/LeadListPage'));
const OpportunityPipelinePage = lazy(() => import('@/features/marketing/pipeline/OpportunityPipelinePage'));
const ClientHandoverPage = lazy(() => import('@/features/marketing/handover/ClientHandoverPage'));

// IT Support Module
const ITLayout = lazy(() => import('@/features/it/ITLayout'));
const TicketListPage = lazy(() => import('@/features/it/tickets/TicketListPage'));
const AssetListPage = lazy(() => import('@/features/it/assets/AssetListPage'));
const MaintenancePage = lazy(() => import('@/features/it/maintenance/MaintenancePage'));

// Website CMS Module
const WebsiteLayout = lazy(() => import('@/features/website/WebsiteLayout'));
const ArticleListPage = lazy(() => import('@/features/website/articles/ArticleListPage'));
const CareerListPage = lazy(() => import('@/features/website/careers/CareerListPage'));
const FaqListPage = lazy(() => import('@/features/website/faqs/FaqListPage'));
const InquiryListPage = lazy(() => import('@/features/website/inquiries/InquiryListPage'));
const SeoSettingsPage = lazy(() => import('@/features/website/seo/SeoSettingsPage'));

// Cross-cutting internal
const NotificationPage = lazy(() => import('@/features/notifications/NotificationPage'));
const SearchPage = lazy(() => import('@/features/search/SearchPage'));
const AuditLogPage = lazy(() => import('@/features/audit/AuditLogPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));

// Master Data Module
const MasterLayout = lazy(() => import('@/features/master/MasterLayout'));
const EmployeeListPage = lazy(() => import('@/features/master/employees/EmployeeListPage'));
const ClientListPage = lazy(() => import('@/features/master/clients/ClientListPage'));
const LocationListPage = lazy(() => import('@/features/master/locations/LocationListPage'));
const ShiftListPage = lazy(() => import('@/features/master/shifts/ShiftListPage'));
const AssignmentListPage = lazy(() => import('@/features/master/assignments/AssignmentListPage'));
const UserListPage = lazy(() => import('@/features/master/users/UserListPage'));

// Fallback spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-canvas">
    <Loader2 className="h-8 w-8 animate-spin text-primary-red" />
  </div>
);

const router = createBrowserRouter([
  // === PUBLIC ROUTES ===
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/perusahaan',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: '/perusahaan/:tab',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: '/tentang',
    element: <Navigate to="/perusahaan/profil" replace />,
  },
  {
    path: '/portfolio',
    element: <Navigate to="/client?tab=portfolio" replace />,
  },
  {
    path: '/layanan',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ServicesPage />
      </Suspense>
    ),
  },
  {
    path: '/layanan/:slug',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ServiceDetailPage />
      </Suspense>
    ),
  },
  {
    path: '/client',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ClientsPage />
      </Suspense>
    ),
  },
  {
    path: '/career',
    element: (
      <Suspense fallback={<PageLoader />}>
        <CareerPage />
      </Suspense>
    ),
  },
  {
    path: '/news',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NewsPage />
      </Suspense>
    ),
  },
  {
    path: '/blog',
    element: (
      <Suspense fallback={<PageLoader />}>
        <BlogPage />
      </Suspense>
    ),
  },
  {
    path: '/faq',
    element: (
      <Suspense fallback={<PageLoader />}>
        <FaqPage />
      </Suspense>
    ),
  },
  {
    path: '/contact',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ContactPage />
      </Suspense>
    ),
  },

  // === INTERNAL LOGIN — private; not linked from public nav ===
  {
    path: '/ops/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },

  // === INTERNAL PROTECTED AREA ===
  {
    path: '/ops',
    element: (
      <RequireAuth>
        <Suspense fallback={<PageLoader />}>
          <AppShell />
        </Suspense>
      </RequireAuth>
    ),
    children: [
      // Default redirect to role dashboard handled inside AppShell
      { index: true, element: <Navigate to="/ops/director" replace /> },

      // Director Module (Executive Visibility, Approval Center, Risks, Reports, Activity)
      {
        path: 'director',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DirectorLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><DirectorDashboard /></Suspense> },
          { path: 'approvals', element: <Suspense fallback={<PageLoader />}><ApprovalCenterPage /></Suspense> },
          { path: 'risk', element: <Suspense fallback={<PageLoader />}><RiskAlertsPage /></Suspense> },
          { path: 'reports', element: <Suspense fallback={<PageLoader />}><ExecutiveReportPage /></Suspense> },
          { path: 'activity', element: <Suspense fallback={<PageLoader />}><ExecutiveActivityPage /></Suspense> },
        ],
      },

      // HRD Module (Overview, Attendance Spreadsheet, Payroll Summary, Contracts)
      {
        path: 'hrd',
        element: (
          <Suspense fallback={<PageLoader />}>
            <HRDLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><HRDDashboard /></Suspense> },
          { path: 'attendance', element: <Suspense fallback={<PageLoader />}><AttendanceSpreadsheetPage /></Suspense> },
          { path: 'payroll-summary', element: <Suspense fallback={<PageLoader />}><AttendancePayrollSummaryPage /></Suspense> },
          { path: 'contracts', element: <Suspense fallback={<PageLoader />}><ContractMonitoringPage /></Suspense> },
        ],
      },
      // Legal Module
      {
        path: 'legal',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LegalLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><LegalDashboard /></Suspense> },
          { path: 'cases', element: <Suspense fallback={<PageLoader />}><LegalCaseListPage /></Suspense> },
          { path: 'contracts', element: <Suspense fallback={<PageLoader />}><LegalContractListPage /></Suspense> },
          { path: 'compliance', element: <Suspense fallback={<PageLoader />}><ComplianceRegisterPage /></Suspense> },
        ],
      },
      {
        path: 'operations',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OperationsLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><OperationsDashboard /></Suspense> },
          { path: 'manpower', element: <Suspense fallback={<PageLoader />}><ManpowerMonitoringPage /></Suspense> },
          { path: 'incidents', element: <Suspense fallback={<PageLoader />}><IncidentListPage /></Suspense> },
          { path: 'replacement', element: <Suspense fallback={<PageLoader />}><ReplacementListPage /></Suspense> },
          { path: 'field-reports', element: <Suspense fallback={<PageLoader />}><FieldReportListPage /></Suspense> },
        ],
      },
      // Finance Module
      {
        path: 'finance',
        element: (
          <Suspense fallback={<PageLoader />}>
            <FinanceLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><FinanceDashboard /></Suspense> },
          { path: 'invoices', element: <Suspense fallback={<PageLoader />}><InvoiceListPage /></Suspense> },
          { path: 'payroll', element: <Suspense fallback={<PageLoader />}><PayrollListPage /></Suspense> },
          { path: 'cod', element: <Suspense fallback={<PageLoader />}><CODReconciliationPage /></Suspense> },
        ],
      },
      // Marketing Module
      {
        path: 'marketing',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MarketingLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><MarketingDashboard /></Suspense> },
          { path: 'leads', element: <Suspense fallback={<PageLoader />}><LeadListPage /></Suspense> },
          { path: 'pipeline', element: <Suspense fallback={<PageLoader />}><OpportunityPipelinePage /></Suspense> },
          { path: 'handover', element: <Suspense fallback={<PageLoader />}><ClientHandoverPage /></Suspense> },
        ],
      },
      // IT Support Module
      {
        path: 'it',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ITLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><ITDashboard /></Suspense> },
          { path: 'tickets', element: <Suspense fallback={<PageLoader />}><TicketListPage /></Suspense> },
          { path: 'assets', element: <Suspense fallback={<PageLoader />}><AssetListPage /></Suspense> },
          { path: 'maintenance', element: <Suspense fallback={<PageLoader />}><MaintenancePage /></Suspense> },
        ],
      },
      // Website CMS Module
      {
        path: 'website',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WebsiteLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><WebsiteDashboard /></Suspense> },
          { path: 'articles', element: <Suspense fallback={<PageLoader />}><ArticleListPage /></Suspense> },
          { path: 'careers', element: <Suspense fallback={<PageLoader />}><CareerListPage /></Suspense> },
          { path: 'faqs', element: <Suspense fallback={<PageLoader />}><FaqListPage /></Suspense> },
          { path: 'inquiries', element: <Suspense fallback={<PageLoader />}><InquiryListPage /></Suspense> },
          { path: 'seo', element: <Suspense fallback={<PageLoader />}><SeoSettingsPage /></Suspense> },
        ],
      },

      // Cross-cutting
      { path: 'notifications', element: <Suspense fallback={<PageLoader />}><NotificationPage /></Suspense> },
      { path: 'search', element: <Suspense fallback={<PageLoader />}><SearchPage /></Suspense> },
      { path: 'audit', element: <Suspense fallback={<PageLoader />}><AuditLogPage /></Suspense> },
      { path: 'profile', element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },

      // Master Data Module
      {
        path: 'master',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MasterLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Navigate to="employees" replace /> },
          { path: 'employees', element: <Suspense fallback={<PageLoader />}><EmployeeListPage /></Suspense> },
          { path: 'clients', element: <Suspense fallback={<PageLoader />}><ClientListPage /></Suspense> },
          { path: 'locations', element: <Suspense fallback={<PageLoader />}><LocationListPage /></Suspense> },
          { path: 'shifts', element: <Suspense fallback={<PageLoader />}><ShiftListPage /></Suspense> },
          { path: 'assignments', element: <Suspense fallback={<PageLoader />}><AssignmentListPage /></Suspense> },
          { path: 'users', element: <Suspense fallback={<PageLoader />}><UserListPage /></Suspense> },
        ],
      },
    ],
  },

  // 404
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
