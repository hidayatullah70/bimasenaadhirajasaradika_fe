/**
 * Client-side audit event emitter.
 * Wraps auditAdapter.createLog for critical UI actions.
 * Source of Truth: PRD §22 / AUDIT_ACTIONS constants.
 *
 * Usage:
 *   import { emitAudit } from '@/utils/auditLogger';
 *   await emitAudit({ action: AUDIT_ACTIONS.ATTENDANCE_FINALIZE, module: 'attendance', entity: 'AttendanceSheet', record_id, old_value, new_value });
 */

import auditAdapter from '@/services/adapters/auditAdapter';
import { AUDIT_ACTIONS } from '@/constants/business';

/**
 * @param {{
 *   actor?: string,
 *   actor_id?: string,
 *   action: string,
 *   module: string,
 *   entity: string,
 *   record_id: string,
 *   old_value?: object,
 *   new_value?: object,
 * }} entry
 */
export async function emitAudit(entry) {
  try {
    await auditAdapter.createLog({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Audit failure must not crash the UI — log to console.error only
    console.error('[AuditLogger] Failed to emit audit event:', err);
  }
}

export { AUDIT_ACTIONS };
