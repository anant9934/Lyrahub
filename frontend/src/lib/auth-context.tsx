'use client';
import { createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import api from './api';
import { useCurrentUser, QK } from './hooks';

export type { CurrentUser as User } from './hooks';
import type { CurrentUser as User } from './hooks';

interface TokenData {
  access_token: string;
  refresh_token: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token_data: TokenData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading, refetch } = useCurrentUser();

  /**
   * Invalidate and refetch the current-user query from the cache.
   * All components that call useCurrentUser() will reactively update.
   */
  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: QK.CURRENT_USER });
    await refetch();
  }, [queryClient, refetch]);

  /**
   * Called after successful login. Stores tokens, then seeds the cache
   * with the returned user data so /auth/me isn't needed immediately.
   */
  const login = useCallback(
    async (data: TokenData) => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      if (data.user) {
        // Immediate cache seed — zero-latency redirect to dashboard
        queryClient.setQueryData(QK.CURRENT_USER, data.user);
      } else {
        await queryClient.invalidateQueries({ queryKey: QK.CURRENT_USER });
        await refetch();
      }
    },
    [queryClient, refetch]
  );


  /**
   * Logout — clears state immediately then revokes server-side.
   * Uses router.replace (SPA navigation) instead of window.location.href
   * so the app shell is not torn down and rebuilt.
   */
  const logout = useCallback(async () => {
    // 1. Clear local session state FIRST — UI becomes visually logged out immediately
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Optimistically clear the user cache
    queryClient.setQueryData(QK.CURRENT_USER, null);
    queryClient.clear();

    // 2. Revoke server-side session in the background (best-effort)
    try {
      await api.post('/auth/logout');
    } catch {
      // Non-blocking — session is already invalidated client-side
    }

    // 3. SPA transition to login page
    router.replace('/login');
  }, [queryClient, router]);

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

