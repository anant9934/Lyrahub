"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { AuthShellSkeleton } from "@/components/ui/skeletons"

export default function DashboardLayout({
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

  // Show a credible AIMETRA shell skeleton instead of a blank white screen.
  // The shell renders immediately — users never stare at an empty page.
  if (loading) {
    return <AuthShellSkeleton />
  }

  // Auth check complete — redirect handled by effect above
  if (!user) {
    return <AuthShellSkeleton />
  }

  return <DashboardShell>{children}</DashboardShell>
}
