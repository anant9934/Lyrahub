"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        localStorage.removeItem("access_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-canvas">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
          <Button onClick={handleLogout} variant="secondary">
            Log Out
          </Button>
        </header>
        <main className="rounded-md border border-border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
          <div className="space-y-2 text-ink-700">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Roles:</strong> {user?.roles?.length ? user.roles.map((r: any) => r.name).join(", ") : "None"}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
