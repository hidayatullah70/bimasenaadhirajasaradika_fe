/**
 * Employee Repository — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 / Architecture Refactor Step 2.
 */

import { BaseRepository } from './baseRepository';
import { MOCK_EMPLOYEES } from '@/services/mock/mockMasterData';

function employeeFactory() {
  return MOCK_EMPLOYEES.map((e) => ({
    ...e,
    NIK: (e.NIK || '').replace(/\D/g, '').slice(0, 16),
    employeeType: e.departemen === 'Operasional' ? 'OUTSOURCING' : 'INTERNAL',
  }));
}

export class EmployeeRepository extends BaseRepository {
  constructor() {
    super('employees', 'BRK-EMP', employeeFactory, 'id');
  }

  /**
   * Filter specifically for internal employees.
   */
  async listInternal(options = {}) {
    return this.list({
      ...options,
      filters: {
        ...options.filters,
        employeeType: 'INTERNAL',
      },
    });
  }

  /**
   * Filter specifically for outsourcing field employees.
   */
  async listOutsourcing(options = {}) {
    return this.list({
      ...options,
      filters: {
        ...options.filters,
        employeeType: 'OUTSOURCING',
      },
    });
  }
}

export const employeeRepository = new EmployeeRepository();
export default employeeRepository;
