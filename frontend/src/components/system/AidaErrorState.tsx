"use client"

import React from "react"
import { Sparkles, RotateCcw, ArrowLeft } from "lucide-react"

interface AidaErrorStateProps {
  title?: string
  description?: string
  requestId?: string
  onRetry?: () => void
  onReset?: () => void
}

export function AidaErrorState({
  title = "I couldn't complete that request.",
  description = "The intelligence service is temporarily unavailable. Your request was not completed.",
  requestId,
  onRetry,
  onReset,
}: AidaErrorStateProps) {
  const cleanId = requestId?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12)

  return (
    <div
      role="region"
      aria-label="AIDA Intelligence Error"
      className="p-6 rounded-2xl border border-[#DCE5F1] bg-white shadow-sm space-y-4 text-center max-w-lg mx-auto my-6"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F6F8FC] text-[#0F172A] border border-[#DCE5F1]">
        <Sparkles className="w-3.5 h-3.5 text-[#0F172A]" />
        <span>AIDA Intelligence Layer</span>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-[#0F172A] tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-[#526783] leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-2.5">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-[#0F172A] text-white hover:bg-neutral-800 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-[#DCE5F1] bg-white text-[#34465E] hover:bg-[#F6F8FC] text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#667A93]" />
            Return to AIDA
          </button>
        )}
      </div>

      {cleanId && (
        <div className="pt-1">
          <span className="text-[10px] font-mono text-[#71849B] bg-[#F7F7F7] px-2 py-0.5 rounded border border-[#EBEBEB]">
            Ref: {cleanId}
          </span>
        </div>
      )}
    </div>
  )
}
