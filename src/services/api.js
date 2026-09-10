const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
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
