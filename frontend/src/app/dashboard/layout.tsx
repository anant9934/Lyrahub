'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="animate-pulse space-y-4 w-64 text-center">
          <div className="h-4 bg-border rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-border rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Optional: Add a TopNav or Sidebar here in Phase 2 */}
      <main>{children}</main>
    </div>
  );
}
