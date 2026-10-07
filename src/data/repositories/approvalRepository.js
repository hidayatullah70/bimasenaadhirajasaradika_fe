/**
 * Approval & Deletion Request Repository — PT. BARAK IOMS
 * Source of Truth: PRD Section 6.1, 10, 18, 39 / Architecture Refactor Step 2.
 */

import { BaseRepository } from './baseRepository';
import { MOCK_PENDING_APPROVALS } from '@/services/mock/mockDirectorData';
import { STATUS } from '@/constants/status';

export class ApprovalRepository extends BaseRepository {
  constructor() {
    super('approvals', 'APP', () => [...MOCK_PENDING_APPROVALS], 'id');
  }

  /**
   * List all pending approvals for Direktur review.
   */
  async getPendingApprovals() {
    return this.list({
      filters: {
        status: (s) => s === 'PENDING' || s === STATUS.PENDING_APPROVAL,
      },
    });
  }

  /**
   * Approve an approval request.
   */
  async approve(id, { reviewer = 'Juli Priyanto (Direktur Utama)', notes = '' } = {}) {
    return this.update(id, {
      status: STATUS.APPROVED || 'APPROVED',
      reviewedBy: reviewer,
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes,
    });
  }

  /**
   * Reject an approval request.
   */
  async reject(id, { reviewer = 'Juli Priyanto (Direktur Utama)', notes = 'Permohonan ditolak oleh Direktur Utama.' } = {}) {
    return this.update(id, {
      status: STATUS.REJECTED || 'REJECTED',
      reviewedBy: reviewer,
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes,
    });
  }
}

export const approvalRepository = new ApprovalRepository();
export default approvalRepository;
