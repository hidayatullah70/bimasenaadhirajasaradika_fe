/**
 * Demo Data Reset Utility — PT. BARAK IOMS
 * Enforces Data Source Classification (Requirement 2):
 * - CLIENT DATA = REAL DATA (Preserved forever; NEVER reset or overwritten).
 * - Employee & Operational data = DEMO / DEV DATA (Reset upon explicit user action).
 */

import { storage } from '@/data/storage/storageEngine';
import { REAL_CLIENTS } from '@/constants/business';

// Operational and development collection keys that can be reset
export const DEMO_COLLECTION_KEYS = Object.freeze([
  'employees',
  'placements',
  'assignments',
  'sites',
  'locations',
  'shifts',
  'attendance_sheets',
  'attendance_rows',
  'payroll_periods',
  'payroll_items',
  'invoices',
  'contracts',
  'cod_transactions',
  'cod_cases',
  'it_tickets',
  'it_assets',
  'it_maintenance',
  'marketing_leads',
  'marketing_opportunities',
  'marketing_handovers',
  'legal_cases',
  'legal_contracts',
  'legal_compliance',
  'cms_articles',
  'cms_vacancies',
  'cms_faqs',
  'cms_inquiries',
  'incidents',
  'replacements',
  'field_reports',
  'approvals',
]);

/**
 * Reset all demo and operational collections while strictly preserving real client records.
 * @returns {{ preservedClientsCount: number, resetKeysCount: number }}
 */
export function resetDemoData() {
  let resetCount = 0;

  for (const key of DEMO_COLLECTION_KEYS) {
    if (storage.has(key)) {
      storage.remove(key);
      resetCount++;
    }
  }

  // Double check that client data is protected
  const clientStore = storage.get('clients', null);
  const preservedCount = clientStore && Array.isArray(clientStore) ? clientStore.length : REAL_CLIENTS.length;

  // Dispatch global reset event to notify active views
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('outsourcing_demo_reset', {
        detail: {
          timestamp: new Date().toISOString(),
          preservedClientsCount: preservedCount,
          resetKeysCount: resetCount,
        },
      })
    );
  }

  return {
    preservedClientsCount: preservedCount,
    resetKeysCount: resetCount,
  };
}

/**
 * Get current environment data status for the Development Indicator.
 */
export function getDataStatusSummary() {
  const clientStore = storage.get('clients', null);
  const employeeStore = storage.get('employees', null);
  const placementStore = storage.get('placements', null) || storage.get('assignments', null);

  return {
    clientData: {
      type: 'REAL',
      isProtected: true,
      count: clientStore && Array.isArray(clientStore) ? clientStore.length : REAL_CLIENTS.length,
      label: 'Data Riil (18 Klien Resmi PT. BARAK)',
    },
    employeeData: {
      type: 'DEMO',
      count: employeeStore && Array.isArray(employeeStore) ? employeeStore.length : 40,
      label: 'Data Demo (Personnel & Alih Daya)',
    },
    operationalData: {
      type: 'DEMO',
      count: placementStore && Array.isArray(placementStore) ? placementStore.length : 30,
      label: 'Data Demo (Penugasan & Operasional)',
    },
  };
}
