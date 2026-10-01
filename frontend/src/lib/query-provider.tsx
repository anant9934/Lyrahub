'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Cache strategy buckets
export const STALE = {
  // Very stable — programs, syllabi, public research
  VERY_STABLE: 15 * 60 * 1000,     // 15 min
  // Moderately dynamic — projects, faculty, alumni, courses, catalog
  MODERATE: 5 * 60 * 1000,          // 5 min
  // Highly dynamic — ranking, notifications, AI quota
  DYNAMIC: 30 * 1000,               // 30 sec
  // Per-session identity — current user, role
  SESSION: 5 * 60 * 1000,           // 5 min
};

export const GC = {
  LONG: 60 * 60 * 1000,             // 60 min
  MEDIUM: 30 * 60 * 1000,           // 30 min
  SHORT: 5 * 60 * 1000,             // 5 min
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Default: moderate — overridden per query where needed
        staleTime: STALE.MODERATE,
        gcTime: GC.MEDIUM,
        retry: 1,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // Keep previous data visible while refetching (prevents blank-on-refetch)
        placeholderData: (prev: unknown) => prev,
      },
      mutations: {
        retry: 0,
      },
    },
  }));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
