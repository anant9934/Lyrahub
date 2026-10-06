"use client"

import React, { useEffect } from "react"
import { AntiInspectGuard } from "@/components/security/AntiInspectGuard"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log safe error telemetry without exposing sensitive credentials
    if (process.env.NODE_ENV !== "production") {
      console.error("AIMETRA Global Root Error:", error)
    }
  }, [error])

  const safeDigest = error.digest ? error.digest.slice(0, 12) : undefined

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#0F172A] font-sans antialiased m-0 p-0 flex items-center justify-center">
        <AntiInspectGuard />
        <div className="w-full max-w-xl mx-auto text-center px-6 py-16 space-y-6">
          {/* Brand Eyebrow */}
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-[0.16em] uppercase text-[#0F172A] block">
              AIMETRA
            </span>
            <span className="text-[11px] text-[#667A93] block font-medium">
              AI &amp; ML Education, Talent, Research &amp; Analytics
            </span>
          </div>

          {/* Status Badge */}
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#F6F8FC] text-[#526783] border border-[#DCE5F1]">
              500 — CRITICAL ERROR
            </span>
          </div>

          {/* Heading and message */}
          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A]">
              System Encountered an Exception
            </h1>
            <p className="text-sm text-[#526783] leading-relaxed">
              AIMETRA encountered a critical problem during root application rendering. The system has contained the failure to prevent unauthorized data mutation.
            </p>
          </div>

          {/* Recovery Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-[#0F172A] text-white hover:bg-neutral-800 text-xs font-medium transition-colors shadow-sm cursor-pointer"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/"
                }
              }}
              className="inline-flex items-center justify-center h-10 px-5 rounded-md border border-[#DCE5F1] bg-white text-[#34465E] hover:bg-[#F6F8FC] text-xs font-medium transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>

          {/* Safe Request ID / Error Digest */}
          {safeDigest && (
            <div className="pt-2">
              <span className="text-[10px] font-mono text-[#71849B] bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#EBEBEB] inline-block">
                Reference ID: {safeDigest}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-8 border-t border-[#F0F0F0] text-center">
            <p className="text-[11px] text-[#71849B]">
              AIMETRA · The intelligence layer for the AI &amp; ML department.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
