"use client"

import React, { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl"
  className?: string
}

/**
 * Adaptive overlay component.
 * Renders as a centered dialog on desktop and an ergonomic bottom-sheet on mobile.
 * Honors safe-area insets, keyboard navigation (Escape), and internal scrolling.
 */
export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  className,
}: ResponsiveModalProps) {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    // Prevent body background scroll when modal is active
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal / Sheet Container */}
      <div
        className={cn(
          "relative w-full bg-white z-10 shadow-2xl transition-all",
          // Mobile: Bottom sheet
          "rounded-t-2xl max-h-[90dvh] flex flex-col animate-in slide-in-from-bottom duration-200",
          // Desktop: Centered card
          "sm:rounded-xl sm:max-h-[85vh] sm:slide-in-from-bottom-0 sm:zoom-in-95",
          maxWidthClasses[maxWidth],
          className
        )}
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Mobile drag handle hint */}
        <div className="w-12 h-1 bg-[#DCE5F1] rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-3 pb-4 border-b border-[#DCE5F1] shrink-0">
          <div>
            <h3
              id="modal-headline"
              className="text-base font-semibold text-[#0F172A] tracking-tight"
            >
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[#667A93] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 text-[#71849B] hover:text-[#0F172A] hover:bg-[#EDF4FC] rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content (Scrollable internally) */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}
