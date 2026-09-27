"use client"

import { useEffect } from "react"
import { BrandedErrorPage } from "@/components/system/BrandedErrorPage"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Dashboard Section Error:", error)
    }
  }, [error])

  return (
    <div className="py-8 px-4">
      <BrandedErrorPage
        status={500}
        title="This section couldn't load."
        description="Something interrupted this part of the AIMETRA dashboard. Your session remains secure and active."
        requestId={error.digest}
        reset={reset}
        compact={true}
      />
    </div>
  )
}
