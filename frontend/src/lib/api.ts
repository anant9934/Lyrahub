import axios, { AxiosError } from 'axios';

export interface AppApiError {
  status: number;
  code: string;
  message: string;
  requestId?: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as any;
    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      if (isRefreshing) return Promise.reject(err);
      isRefreshing = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refresh },
          { headers: { 'Content-Type': 'application/json' } }
        );
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        localStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error payload to prevent raw server exception leakage
    const status = err.response?.status || 500;
    const responseData = err.response?.data as any;
    const requestId =
      (err.response?.headers?.['x-request-id'] as string) ||
      responseData?.request_id ||
      undefined;

    let safeMessage = "An unexpected error occurred while communicating with AIMETRA services.";
    if (status === 400) safeMessage = responseData?.detail?.title || responseData?.detail || "Invalid request parameters.";
    else if (status === 401) safeMessage = "Authentication required. Please sign in to continue.";
    else if (status === 403) safeMessage = "Access restricted. You do not have permission for this resource.";
    else if (status === 404) safeMessage = "The requested resource was not found.";
    else if (status === 429) safeMessage = "Too many requests. Please wait a moment before trying again.";
    else if (status >= 500) safeMessage = "The server encountered an internal issue. Please try again shortly.";

    const normalizedError: AppApiError = {
      status,
      code: responseData?.code || `HTTP_${status}`,
      message: typeof safeMessage === 'string' ? safeMessage : JSON.stringify(safeMessage),
      requestId,
    };

    (err as any).normalized = normalizedError;
    return Promise.reject(err);
  }
);

export default api;
export const apiGet = (url: string) => api.get(url).then(r => r.data);
export const apiPost = (url: string, data: any) => api.post(url, data).then(r => r.data);
export const apiPut = (url: string, data: any) => api.put(url, data).then(r => r.data);
export const apiPatch = (url: string, data: any) => api.patch(url, data).then(r => r.data);
export const apiDelete = (url: string) => api.delete(url).then(r => r.data);
