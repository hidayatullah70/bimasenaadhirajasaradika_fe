/**
 * Role-Based Internal Protected Routes — PT. BARAK IOMS
 * Enforces both RequireAuth and RequireRole guards.
 * Source of Truth: PRD Section 6, 10-18 / Architecture Refactor Step 2.
 */

import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import RequireRole from '@/app/guards/RequireRole';
import { ROLES } from '@/constants/roles';
import PageLoader from '@/components/ui/PageLoader';

// Director Module
const DirectorLayout = lazy(() => import('@/features/director/DirectorLayout'));
const DirectorDashboard = lazy(() => import('@/features/director/DirectorDashboard'));
const ApprovalCenterPage = lazy(() => import('@/features/director/approvals/ApprovalCenterPage'));
const RiskAlertsPage = lazy(() => import('@/features/director/risk/RiskAlertsPage'));
const ExecutiveReportPage = lazy(() => import('@/features/director/reports/ExecutiveReportPage'));
const ExecutiveActivityPage = lazy(() => import('@/features/director/activity/ExecutiveActivityPage'));

// HRD Module
const HRDLayout = lazy(() => import('@/features/hrd/HRDLayout'));
const HRDDashboard = lazy(() => import('@/features/hrd/HRDDashboard'));
const AttendanceSpreadsheetPage = lazy(() => import('@/features/hrd/attendance/AttendanceSpreadsheetPage'));
const AttendancePayrollSummaryPage = lazy(() => import('@/features/hrd/attendance/AttendancePayrollSummaryPage'));
const ContractMonitoringPage = lazy(() => import('@/features/hrd/contracts/ContractMonitoringPage'));
const ApplicantListPage = lazy(() => import('@/features/hrd/applicants/ApplicantListPage'));

// Legal Module
const LegalLayout = lazy(() => import('@/features/legal/LegalLayout'));
const LegalDashboard = lazy(() => import('@/features/legal/LegalDashboard'));
const LegalCaseListPage = lazy(() => import('@/features/legal/cases/LegalCaseListPage'));
const LegalContractListPage = lazy(() => import('@/features/legal/contracts/LegalContractListPage'));
const ComplianceRegisterPage = lazy(() => import('@/features/legal/compliance/ComplianceRegisterPage'));

// Operations Module
const OperationsLayout = lazy(() => import('@/features/operations/OperationsLayout'));
const OperationsDashboard = lazy(() => import('@/features/operations/OperationsDashboard'));
const ManpowerMonitoringPage = lazy(() => import('@/features/operations/manpower/ManpowerMonitoringPage'));
const IncidentListPage = lazy(() => import('@/features/operations/incidents/IncidentListPage'));
const ReplacementListPage = lazy(() => import('@/features/operations/replacement/ReplacementListPage'));
const FieldReportListPage = lazy(() => import('@/features/operations/fieldReports/FieldReportListPage'));
const PicActivityReportPage = lazy(() => import('@/features/operations/activityReports/PicActivityReportPage'));

// Finance Module
const FinanceLayout = lazy(() => import('@/features/finance/FinanceLayout'));
const FinanceDashboard = lazy(() => import('@/features/finance/FinanceDashboard'));
const InvoiceListPage = lazy(() => import('@/features/finance/invoices/InvoiceListPage'));
const PayrollListPage = lazy(() => import('@/features/finance/payroll/PayrollListPage'));
const CODReconciliationPage = lazy(() => import('@/features/finance/cod/CODReconciliationPage'));

// Marketing Module
const MarketingLayout = lazy(() => import('@/features/marketing/MarketingLayout'));
const MarketingDashboard = lazy(() => import('@/features/marketing/MarketingDashboard'));
const LeadListPage = lazy(() => import('@/features/marketing/leads/LeadListPage'));
const OpportunityPipelinePage = lazy(() => import('@/features/marketing/pipeline/OpportunityPipelinePage'));
const ClientHandoverPage = lazy(() => import('@/features/marketing/handover/ClientHandoverPage'));

// IT Support Module
const ITLayout = lazy(() => import('@/features/it/ITLayout'));
const ITDashboard = lazy(() => import('@/features/it/ITDashboard'));
const TicketListPage = lazy(() => import('@/features/it/tickets/TicketListPage'));
const AssetListPage = lazy(() => import('@/features/it/assets/AssetListPage'));
const MaintenancePage = lazy(() => import('@/features/it/maintenance/MaintenancePage'));

// Website CMS Module
const WebsiteLayout = lazy(() => import('@/features/website/WebsiteLayout'));
const WebsiteDashboard = lazy(() => import('@/features/website/WebsiteDashboard'));
const ArticleListPage = lazy(() => import('@/features/website/articles/ArticleListPage'));
const CareerListPage = lazy(() => import('@/features/website/careers/CareerListPage'));
const FaqListPage = lazy(() => import('@/features/website/faqs/FaqListPage'));
const InquiryListPage = lazy(() => import('@/features/website/inquiries/InquiryListPage'));
const SeoSettingsPage = lazy(() => import('@/features/website/seo/SeoSettingsPage'));

// Master Data Module
const MasterLayout = lazy(() => import('@/features/master/MasterLayout'));
const EmployeeListPage = lazy(() => import('@/features/master/employees/EmployeeListPage'));
const ClientListPage = lazy(() => import('@/features/master/clients/ClientListPage'));
const LocationListPage = lazy(() => import('@/features/master/locations/LocationListPage'));
const ShiftListPage = lazy(() => import('@/features/master/shifts/ShiftListPage'));
const AssignmentListPage = lazy(() => import('@/features/master/assignments/AssignmentListPage'));
const UserListPage = lazy(() => import('@/features/master/users/UserListPage'));

// Cross-cutting pages
const NotificationPage = lazy(() => import('@/features/notifications/NotificationPage'));
const SearchPage = lazy(() => import('@/features/search/SearchPage'));
const AuditLogPage = lazy(() => import('@/features/audit/AuditLogPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));

export const roleRoutes = [
  // 1. Director Module (Direktur Only)
  {
    path: 'director',
    element: (
      <RequireRole allowedRoles={[ROLES.DIREKTUR]}>
        <Suspense fallback={<PageLoader />}>
          <DirectorLayout />
        </Suspense>
      </RequireRole>
    ),
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><DirectorDashboard /></Suspense> },
      { path: 'approvals', element: <Suspense fallback={<PageLoader />}><ApprovalCenterPage /></Suspense> },
      { path: 'risk', element: <Suspense fallback={<PageLoader />}><RiskAlertsPage /></Suspense> },
      { path: 'reports', element: <Suspense fallback={<PageLoader />}><ExecutiveReportPage /></Suspense> },
      { path: 'activity', element: <Suspense fallback={<PageLoader />}><ExecutiveActivityPage /></Suspense> },
    ],
  },

  // 2. HRD Module (HRD & Direktur)
  {
    path: 'hrd',
    element: (
      <RequireRole allowedRoles={[ROLES.HRD, ROLES.DIREKTUR]}>
        <Suspense fallback={<PageLoader />}>
          <HRDLayout />
        </Suspense>
      </RequireRole>
    ),
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><HRDDashboard /></Suspense> },
      { path: 'attendance', element: <Suspense fallback={<PageLoader />}><AttendanceSpreadsheetPage /></Suspense> },
      { path: 'payroll-summary', element: <Suspense fallback={<PageLoader />}><AttendancePayrollSummaryPage /></Suspense> },
      { path: 'contracts', element: <Suspense fallback={<PageLoader />}><ContractMonitoringPage /></Suspense> },
      { path: 'applicants', element: <Suspense fallback={<PageLoader />}><ApplicantListPage /></Suspense> },
    ],
  },

  // 3. Legal Module (Legal & Direktur)
  {
    path: 'legal',
    element: (
      <RequireRole allowedRoles={[ROLES.LEGAL, ROLES.DIREKTUR]}>
        <Suspense fallback={<PageLoader />}>
          <LegalLayout />
        </Suspense>
      </RequireRole>
    ),
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><LegalDashboard /></Suspense> },
      { path: 'cases', element: <Suspense fallback={<PageLoader />}><LegalCaseListPage /></Suspense> },
      { path: 'contracts', element: <Suspense fallback={<PageLoader />}><LegalContractListPage /></Suspense> },
      { path: 'compliance', element: <Suspense fallback={<PageLoader />}><ComplianceRegisterPage /></Suspense> },
    ],
  },

  // 4. Operations Module (Operasional & Direktur)
  {
    path: 'operations',
    element: (
      <RequireRole allowedRoles={[ROLES.OPERASIONAL, ROLES.DIREKTUR]}>
        <Suspense fallback={<PageLoader />}>
          <OperationsLayout />
        </Suspense>
      </RequireRole>
    ),
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><OperationsDashboard /></Suspense> },
      { path: 'manpower', element: <Suspense fallback={<PageLoader />}><ManpowerMonitoringPage /></Suspense> },
      { path: 'incidents', element: <Suspense fallback={<PageLoader />}><IncidentListPage /></Suspense> },
      { path: 'replacement', element: <Suspense fallback={<PageLoader />}><ReplacementListPage /></Suspense> },
      { path: 'field-reports', element: <Suspense fallback={<PageLoader />}><FieldReportListPage /></Suspense> },
      { path: 'activity-reports', element: <Suspense fallback={<PageLoader />}><PicActivityReportPage /></Suspense> },
    ],
  },

  // 5. Finance Module (Finance & Direktur)
  {
    path: 'finance',
    element: (
      <RequireRole allowedRoles={[ROLES.FINANCE, ROLES.DIREKTUR]}>
        <Suspense fallback={<PageLoader />}>
          <FinanceLayout />
        </Suspense>
      </RequireRole>
    ),
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><FinanceDashboard /></Suspense> },
      { path: 'invoices', element: <Suspense fallback={<PageLoader />}><InvoiceListPage /></Suspense> },
      { path: 'payroll', element: <Suspense fallback={<PageLoader />}><PayrollListPage /></Suspense> },
      { path: 'cod', element: <Suspense fallback={<PageLoader />}><CODReconciliationPage /></Suspense> },
    ],
  },

  // 6. Marketing Module (Marketing & Direktur)
  {
    path: 'marketing',
    element: (
      <RequireRole allowedRoles={[ROLES.MARKETING, ROLES.DIREKTUR]}>
        <Suspense fallback={<PageLoader />}>
          <MarketingLayout />
        </Suspense>
      </RequireRole>
    ),
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><MarketingDashboard /></Suspense> },
      { path: 'leads', element: <Suspense fallback={<PageLoader />}><LeadListPage /></Suspense> },
      { path: 'pipeline', element: <Suspense fallback={<PageLoader />}><OpportunityPipelinePage /></Suspense> },
      { path: 'handover', element: <Suspense fallback={<PageLoader />}><ClientHandoverPage /></Suspense> },
    ],
  },

  // 7. IT Support Module (IT Support & Direktur)
  {
    path: 'it',
    element: (
      <RequireRole allowedRoles={[ROLES.IT_SUPPORT, ROLES.DIREKTUR]}>
        <Suspense fallback={<PageLoader />}>
          <ITLayout />
        </Suspense>
      </RequireRole>
    ),
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><ITDashboard /></Suspense> },
      { path: 'tickets', element: <Suspense fallback={<PageLoader />}><TicketListPage /></Suspense> },
      { path: 'assets', element: <Suspense fallback={<PageLoader />}><AssetListPage /></Suspense> },
      { path: 'maintenance', element: <Suspense fallback={<PageLoader />}><MaintenancePage /></Suspense> },
    ],
  },

  // 8. Website CMS Module (Admin Website & Direktur)
  {
    path: 'website',
    element: (
      <RequireRole allowedRoles={[ROLES.ADMIN_WEBSITE, ROLES.DIREKTUR]}>
        <Suspense fallback={<PageLoader />}>
          <WebsiteLayout />
        </Suspense>
      </RequireRole>
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

  // 9. Master Data Module (Open to all internal authenticated roles)
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

  // 10. Cross-cutting internal pages
  { path: 'notifications', element: <Suspense fallback={<PageLoader />}><NotificationPage /></Suspense> },
  { path: 'search', element: <Suspense fallback={<PageLoader />}><SearchPage /></Suspense> },
  {
    path: 'audit',
    element: (
      <RequireRole allowedRoles={[ROLES.DIREKTUR, ROLES.IT_SUPPORT]}>
        <Suspense fallback={<PageLoader />}>
          <AuditLogPage />
        </Suspense>
      </RequireRole>
    ),
  },
  { path: 'profile', element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
];

export default roleRoutes;
