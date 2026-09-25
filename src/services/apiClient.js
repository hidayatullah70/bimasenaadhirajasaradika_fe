/**
 * Base API client for PT. BARAK IOMS.
 * Switches between mock and REST adapters via VITE_API_MODE env var.
 * Standard response envelope: { data, meta, error }
 * Source of Truth: API-SPEC.md Section 1 / Section 16.
 */

const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

/** @returns {boolean} */
export const isMockMode = () => API_MODE === 'mock';

/**
 * Standard API response wrapper.
 * @template T
 * @param {T} data
 * @param {object} [meta]
 * @returns {{ data: T, meta: object, error: null }}
 */
export const apiSuccess = (data, meta = {}) => ({ data, meta, error: null });

/**
 * Standard API error wrapper.
 * @param {string} code
 * @param {string} message
 * @param {object} [fields]
 * @returns {{ data: null, meta: object, error: object }}
 */
export const apiError = (code, message, fields = {}) => ({
  data: null,
  meta: {},
  error: { code, message, fields },
});

/**
 * REST API client — used when VITE_API_MODE=rest.
 * All feature components must go through service adapters, NOT call fetch directly.
 */
const restClient = {
  /**
   * @param {string} path
   * @param {RequestInit} [options]
   * @returns {Promise<{ data: any, meta: object, error: object|null }>}
   */
  async request(path, options = {}) {
    const token = sessionStorage.getItem('barak_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });

      const json = await response.json();

      if (!response.ok) {
        return apiError(
          json?.error?.code || 'HTTP_ERROR',
          json?.error?.message || `HTTP ${response.status}`,
          json?.error?.fields || {}
        );
      }

      return json;
    } catch (err) {
      return apiError('NETWORK_ERROR', err.message || 'Network error');
    }
  },

  get: (path) => restClient.request(path, { method: 'GET' }),
  post: (path, body) => restClient.request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => restClient.request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: (path, body) => restClient.request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => restClient.request(path, { method: 'DELETE' }),
};

export default restClient;
