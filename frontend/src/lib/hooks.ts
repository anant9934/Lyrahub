'use client';
/**
 * Shared TanStack Query hooks — single source of truth for hot data.
 * Using these hooks deduplicate concurrent requests via React Query's
 * built-in deduplication: multiple components calling useCurrentUser()
 * at the same time will share one in-flight request.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api, { apiGet } from './api';
import { STALE, GC } from './query-provider';

// Re-export so consumers can import from one place
export { STALE, GC } from './query-provider';

// ── Query Key Registry ──────────────────────────────────────────────────────

export const QK = {
  CURRENT_USER: ['auth', 'me'] as const,
  STUDENT_ME: ['students', 'me'] as const,
  AI_QUOTA: ['ai', 'quota'] as const,
  RANKING: (params: string) => ['ranking', params] as const,
  PROJECTS: (params: string) => ['projects', params] as const,
  COURSES: (params: string) => ['courses', params] as const,
  EVENTS: (page?: number) => ['events', page ?? 1] as const,
  APPROVALS: (page?: number) => ['approvals', page ?? 1] as const,
  DASHBOARD_STATS: ['dashboard', 'stats'] as const,
};

// ── Current user & session ───────────────────────────────────────────────────

export interface CurrentUser {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  role?: string;
  roles?: { name: string }[];
}

/**
 * Fetches authenticated user identity — shared across all components.
 * staleTime = 5 min so navigating between pages doesn't re-fetch on every route.
 */
export function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: QK.CURRENT_USER,
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) return null;
      try {
        const { data } = await api.get('/auth/me');
        return data as CurrentUser;
      } catch {
        return null;
      }
    },
    staleTime: STALE.SESSION,
    gcTime: GC.LONG,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page?: number;
  page_size?: number;
}

/** Derived role helpers from cached current-user */
export function useCurrentRole() {
  const { data: user } = useCurrentUser();
  if (!user) return { role: null, isAdmin: false, isHOD: false, isFaculty: false, isStudent: false };

  const rolesList: string[] = user.roles
    ? user.roles.map((r: { name?: string }) => r.name?.toLowerCase() ?? '')
    : [];

  const isAdmin = rolesList.includes('admin') || user.email === 'admin@aiml.hub';
  const isHOD = rolesList.includes('hod') || user.email === 'hod@aiml.hub';
  const isFaculty = rolesList.includes('faculty');
  const isStudent = !isAdmin && !isHOD && !isFaculty;

  const role = isAdmin ? 'admin' : isHOD ? 'hod' : isFaculty ? 'faculty' : 'student';

  return { role, isAdmin, isHOD, isFaculty, isStudent };
}

/** Student profile for current user */
export function useStudentProfile(enabled = true) {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: QK.STUDENT_ME,
    queryFn: () => apiGet('/students/me').catch(() => null),
    enabled: !!user && enabled,
    staleTime: STALE.MODERATE,
    gcTime: GC.MEDIUM,
  });
}

/** AI quota for current session */
export function useAIQuota(enabled = true) {
  return useQuery({
    queryKey: QK.AI_QUOTA,
    queryFn: () => api.get('/ai/quota').then((r) => r.data).catch(() => null),
    enabled,
    staleTime: STALE.DYNAMIC,
    gcTime: GC.SHORT,
  });
}

/** Rankings list — keeps previous data while refetching (no blank flash) */
export function useRankings(params: { pageSize?: number; section?: string } = {}) {
  const { pageSize = 100, section } = params;
  const qs = new URLSearchParams({ page_size: String(pageSize) });
  if (section && section !== 'all') qs.set('section', section);
  const key = qs.toString();

  return useQuery({
    queryKey: QK.RANKING(key),
    queryFn: () => apiGet(`/ranking?${key}`),
    staleTime: STALE.DYNAMIC,
    gcTime: GC.SHORT,
    placeholderData: (prev) => prev, // keep previous while refetching
  });
}

/** Projects list — keeps previous data while refetching */
export function useProjects<T = unknown>(params: { search?: string; domain?: string; status?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.domain) qs.set('domain', params.domain);
  if (params.status) qs.set('status', params.status);
  const key = qs.toString();

  return useQuery<PaginatedResult<T> | T[]>({
    queryKey: QK.PROJECTS(key),
    queryFn: () => apiGet<PaginatedResult<T> | T[]>(`/projects?${key}`),
    staleTime: STALE.MODERATE,
    gcTime: GC.MEDIUM,
    placeholderData: (prev) => prev,
  });
}

/** Courses list — keeps previous data while refetching */
export function useCourses<T = unknown>(params: {
  search?: string;
  semester?: string | number;
  courseType?: string;
  category?: string;
  page?: number;
} = {}) {
  const qs = new URLSearchParams({ page_size: '30', page: String(params.page ?? 1) });
  if (params.search) qs.set('search', params.search);
  if (params.semester && params.semester !== 'all') qs.set('semester', String(params.semester));
  if (params.courseType && params.courseType !== 'all') qs.set('course_type', params.courseType);
  if (params.category && params.category !== 'all') qs.set('category', params.category);
  const key = qs.toString();

  return useQuery<PaginatedResult<T> | T[]>({
    queryKey: QK.COURSES(key),
    queryFn: () => apiGet<PaginatedResult<T> | T[]>(`/courses?${key}`),
    staleTime: STALE.VERY_STABLE,
    gcTime: GC.LONG,
    placeholderData: (prev) => prev,
  });
}

/** Events preview for dashboard */
export function useEventsPreview(enabled = true) {
  return useQuery({
    queryKey: QK.EVENTS(),
    queryFn: () => apiGet('/events?page_size=5').catch(() => null),
    enabled,
    staleTime: STALE.MODERATE,
    gcTime: GC.MEDIUM,
  });
}

/** Approvals preview for dashboard */
export function useApprovalsPreview(enabled = true) {
  return useQuery({
    queryKey: QK.APPROVALS(),
    queryFn: () => apiGet('/approvals?page_size=5').catch(() => null),
    enabled,
    staleTime: STALE.DYNAMIC,
    gcTime: GC.SHORT,
  });
}

/** Prefetch commonly accessed routes in background */
export function usePrefetchCriticalData() {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  if (user && typeof window !== 'undefined') {
    // Prefetch ranking (highly accessed)
    queryClient.prefetchQuery({
      queryKey: QK.RANKING('page_size=100'),
      queryFn: () => apiGet('/ranking?page_size=100'),
      staleTime: STALE.DYNAMIC,
    });
    // Prefetch events
    queryClient.prefetchQuery({
      queryKey: QK.EVENTS(),
      queryFn: () => apiGet('/events?page_size=5').catch(() => null),
      staleTime: STALE.MODERATE,
    });
    // Prefetch courses (stable)
    queryClient.prefetchQuery({
      queryKey: QK.COURSES('page_size=30&page=1'),
      queryFn: () => apiGet('/courses?page_size=30&page=1'),
      staleTime: STALE.VERY_STABLE,
    });
  }
}
