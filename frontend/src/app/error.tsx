"use client"

import { useEffect } from "react"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { BrandedErrorPage } from "@/components/system/BrandedErrorPage"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log safe error telemetry without exposing sensitive credentials
    if (process.env.NODE_ENV !== "production") {
      console.error("AIMETRA Application Error:", error)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col">
      <PublicNav />
      <main id="main-content" className="flex-1 flex items-center justify-center">
        <BrandedErrorPage
          status={500}
          title="Something went wrong."
          description="AIMETRA encountered an unexpected problem while processing this view. Your institutional data has not been modified."
          requestId={error.digest}
          reset={reset}
        />
      </main>
      <PublicFooter />
    </div>
  )
}
