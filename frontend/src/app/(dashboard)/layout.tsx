"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { AuthShellSkeleton } from "@/components/ui/skeletons"

export default function SubDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <AuthShellSkeleton />
  }

  if (!user) {
    return <AuthShellSkeleton />
  }

  return <DashboardShell>{children}</DashboardShell>
}
