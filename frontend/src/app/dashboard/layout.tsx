"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"

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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse space-y-3 w-48 text-center">
          <div className="h-4 bg-[#E5E5E5] rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-[#F0F0F0] rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}
