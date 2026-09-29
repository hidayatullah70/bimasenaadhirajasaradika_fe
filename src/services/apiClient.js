/**
 * Base API client for PT. BARAK IOMS.
 * Switches between mock and REST mode via VITE_DATA_MODE or VITE_API_MODE.
 * Standard response envelope: { data, meta, error }
 * Source of Truth: API-SPEC.md Section 1 / Section 16 / Architecture Refactor Step 2.
 */

export const DATA_MODE = {
  MOCK: 'mock',
  API: 'api',
  REST: 'rest',
};

const ACTIVE_MODE =
  (import.meta.env.VITE_DATA_MODE || import.meta.env.VITE_API_MODE || DATA_MODE.MOCK).toLowerCase();

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

/** @returns {boolean} */
export const isMockMode = () =>
  ACTIVE_MODE === DATA_MODE.MOCK || ACTIVE_MODE !== DATA_MODE.API && ACTIVE_MODE !== DATA_MODE.REST;

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
 * Serializes query parameters into URL string.
 * @param {string} path
 * @param {object} [params]
 * @returns {string}
 */
export function buildUrlWithParams(path, params) {
  const url = path.startsWith('http://') || path.startsWith('https://')
    ? new URL(path)
    : new URL(`${API_BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`);

  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * REST API client — used when DATA_MODE=api or VITE_API_MODE=rest.
 * All feature components must go through service adapters/repositories, NOT call fetch directly.
 */
export const restClient = {
  /**
   * @param {string} path
   * @param {RequestInit & { params?: object }} [options]
   * @returns {Promise<{ data: any, meta: object, error: object|null }>}
   */
  async request(path, options = {}) {
    const { params, headers: customHeaders, body, ...fetchOpts } = options;
    const fullUrl = buildUrlWithParams(path, params);

    const token =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('barak_token')
        : null;

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    };

    try {
      const response = await fetch(fullUrl, {
        ...fetchOpts,
        headers,
        body: body && typeof body === 'object' && !(body instanceof FormData)
          ? JSON.stringify(body)
          : body,
      });

      const json = await response.json();

      if (!response.ok) {
        return apiError(
          json?.error?.code || `HTTP_${response.status}`,
          json?.error?.message || `HTTP ${response.status}`,
          json?.error?.fields || {}
        );
      }

      return json;
    } catch (err) {
      return apiError('NETWORK_ERROR', err.message || 'Network error');
    }
  },

  get: (path, options = {}) =>
    restClient.request(path, { method: 'GET', ...options }),

  post: (path, body, options = {}) =>
    restClient.request(path, { method: 'POST', body, ...options }),

  put: (path, body, options = {}) =>
    restClient.request(path, { method: 'PUT', body, ...options }),

  patch: (path, body, options = {}) =>
    restClient.request(path, { method: 'PATCH', body, ...options }),

  delete: (path, options = {}) =>
    restClient.request(path, { method: 'DELETE', ...options }),
};

export default restClient;
