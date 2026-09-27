/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';

// ── Request timeout (ms) ──────────────────────────────────────────────────────
const REQUEST_TIMEOUT = 15_000; // 15 s

export interface AppApiError {
  status: number;
  code: string;
  message: string;
  requestId?: string;
}

export interface AppAxiosError extends AxiosError {
  normalized?: AppApiError;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  timeout: REQUEST_TIMEOUT,
});

// Attach access token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Token-refresh state ───────────────────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as RetryConfig | undefined;

    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        // Queue subsequent 401 callers while a refresh is already in flight
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refresh },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: REQUEST_TIMEOUT,
          }
        );

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        onRefreshed(data.access_token);

        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        // Refresh failed — clear session and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Sanitize errors — NEVER expose raw provider errors or credentials ──
    const status = err.response?.status || 500;
    const responseData = (err.response?.data || {}) as Record<string, unknown>;
    const requestId =
      (err.response?.headers?.['x-request-id'] as string) ||
      (responseData.request_id as string) ||
      undefined;

    let safeMessage = 'An unexpected error occurred while communicating with AIMETRA services.';
    if (status === 400)
      safeMessage =
        (typeof responseData.detail === 'object' && responseData.detail !== null
          ? (responseData.detail as { title?: string }).title
          : (responseData.detail as string)) || 'Invalid request parameters.';
    else if (status === 401)
      safeMessage = 'Authentication required. Please sign in to continue.';
    else if (status === 403)
      safeMessage = 'Access restricted. You do not have permission for this resource.';
    else if (status === 404)
      safeMessage = 'The requested resource was not found.';
    else if (status === 408 || err.code === 'ECONNABORTED')
      safeMessage = 'The request timed out. Please check your connection and try again.';
    else if (status === 429)
      safeMessage = 'Too many requests. Please wait a moment before trying again.';
    else if (status >= 500)
      safeMessage = 'The server encountered an internal issue. Please try again shortly.';

    const normalizedError: AppApiError = {
      status,
      code: (responseData.code as string) || `HTTP_${status}`,
      message: typeof safeMessage === 'string' ? safeMessage : JSON.stringify(safeMessage),
      requestId,
    };

    const appErr = err as AppAxiosError;
    appErr.normalized = normalizedError;
    return Promise.reject(appErr);
  }
);

export default api;
export const apiGet = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  api.get<T>(url, config).then((r) => r.data);
export const apiPost = <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  api.post<T>(url, data, config).then((r) => r.data);
export const apiPut = <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  api.put<T>(url, data, config).then((r) => r.data);
export const apiPatch = <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  api.patch<T>(url, data, config).then((r) => r.data);
export const apiDelete = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  api.delete<T>(url, config).then((r) => r.data);

