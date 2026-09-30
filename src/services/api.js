// Determine default base API URL intelligently:
// 1. Explicit environment variable (VITE_API_URL) takes highest priority.
// 2. If running on production (e.g. Vercel domain or not localhost), fallback to the deployed backend URL.
// 3. In local development (localhost / 127.0.0.1), fallback to local backend at http://localhost:5000/api.
export const getInitialApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
      return 'https://back-end-ispotec-online-2026.vercel.app/api';
    }
    const port = window.location.port === '5173' ? '5000' : (window.location.port || '5000');
    return `${window.location.protocol}//${window.location.hostname}:${port}/api`;
  }
  return 'https://back-end-ispotec-online-2026.vercel.app/api';
};

export const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_STORAGE_URL) {
    return import.meta.env.VITE_STORAGE_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
  }
  const apiUrl = getInitialApiUrl();
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Resolves any attachment or uploaded file path into a valid, reachable URL.
 * - In production: Rewrites legacy or accidental 'http://localhost:5000' URLs to the production Vercel backend.
 * - Prepends production backend base to relative paths (e.g. /uploads/...)
 * - In local development: Points to local backend at http://localhost:5000
 */
export const getFileUrl = (path) => {
  if (!path || path === '#' || typeof path !== 'string') return '';
  const backendBase = getBackendBaseUrl();
  const isLocal = typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If in production and path points to any localhost/127.0.0.1 address, rewrite it to production backend
  if (!isLocal && (path.includes('localhost') || path.includes('127.0.0.1'))) {
    return path.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, backendBase);
  }

  // If already absolute valid URL (e.g. https://... or blob: or data:)
  if (path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }

  if (path.startsWith('http://')) {
    if (!isLocal && (path.includes('localhost') || path.includes('127.0.0.1'))) {
      return path.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, backendBase);
    }
    return path;
  }

  // Relative path (e.g. /uploads/...)
  return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
};

const API_BASE_URL = getInitialApiUrl();

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = (baseUrl || API_BASE_URL).replace(/\/+$/, '');
  }

  getToken() {
    return localStorage.getItem('ispotec_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('ispotec_token', token);
    } else {
      localStorage.removeItem('ispotec_token');
    }
  }

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const isFormData = options.body instanceof FormData;

    const config = {
      method: options.method || 'GET',
      headers: {
        ...this.getHeaders(isFormData),
        ...(options.headers || {}),
      },
    };

    if (options.body && !isFormData) {
      config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    } else if (options.body && isFormData) {
      config.body = options.body;
    }

    try {
      const response = await fetch(url, config);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { mensagem: text };
      }

      if (!response.ok) {
        // Automatically handle unauthorized
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          localStorage.removeItem('ispotec_token');
          localStorage.removeItem('ispotec_current_user');
        }

        const error = new Error(data.mensagem || 'Não foi possível concluir a operação.');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.status) {
        throw error;
      }
      // Network or connection failure
      const networkError = new Error('Não foi possível ligar ao servidor. Verifique a sua ligação à internet ou se o backend está ativo.');
      networkError.status = 503;
      throw networkError;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async upload(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
