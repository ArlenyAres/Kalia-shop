import axios from 'axios';
import logger from '../utils/logger';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string | undefined) ?? '/api',
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kalia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: { response?: { status: number }; config?: { url?: string } }) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      localStorage.removeItem('kalia_token');
      window.location.href = '/admin/login';
    }

    if (status !== undefined && status >= 500) {
      logger.error('API error', { url, status });
    }

    return Promise.reject(error);
  },
);

export default api;
