/**
 * Placement / Assignment Repository — PT. BARAK IOMS
 * Decoupled workforce placement entity with movement history.
 * Source of Truth: PRD Section 11 / Section 13 / Architecture Refactor Step 2.
 */

import { BaseRepository } from './baseRepository';
import { MOCK_ASSIGNMENTS } from '@/services/mock/mockMasterData';
import { PLACEMENT_STATUS } from '@/types';

export class PlacementRepository extends BaseRepository {
  constructor() {
    super('placements', 'BRK-ASN', () => [...MOCK_ASSIGNMENTS], 'id');
  }

  generateNextId(currentItems = null) {
    const items = currentItems || this.getStore();
    let maxNum = 0;
    items.forEach((a) => {
      const match = (a.id || '').match(/BRK-ASN-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `BRK-ASN-${(maxNum + 1).toString().padStart(3, '0')}`;
  }

  /**
   * Get all placements for a specific employee (history).
   * @param {string} employeeId
   */
  async getHistoryByEmployeeId(employeeId) {
    const all = await this.list({ includeDeleted: true, pageSize: 1000 });
    const matches = all.data.filter(
      (p) => p.employee_id === employeeId || p.employeeId === employeeId
    );
    return { data: matches, meta: { total: matches.length } };
  }

  /**
   * Rotate or transfer an employee to a new site/client.
   * Marks previous active placement as ROTATED and creates new active placement.
   */
  async rotatePlacement(currentPlacementId, newPlacementData) {
    const prev = await this.update(currentPlacementId, {
      status: PLACEMENT_STATUS.ROTATED || 'ROTATED',
      endDate: new Date().toISOString().split('T')[0],
      isCurrent: false,
    });

    const empId = prev.data?.employee_id || prev.data?.employeeId || newPlacementData.employee_id || newPlacementData.employeeId;

    const next = await this.create({
      ...newPlacementData,
      employee_id: empId,
      employeeId: empId,
      isCurrent: true,
      status: PLACEMENT_STATUS.ACTIVE || 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
    });

    return {
      data: {
        previousPlacement: prev.data,
        newPlacement: next.data,
      },
    };
  }

  /**
   * Transfer alias for rotatePlacement
   */
  async transfer(currentPlacementId, newPlacementData) {
    return this.rotatePlacement(currentPlacementId, newPlacementData);
  }
}

export const placementRepository = new PlacementRepository();
export default placementRepository;
