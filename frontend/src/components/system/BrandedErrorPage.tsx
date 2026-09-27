"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  ArrowLeft,
  RotateCcw,
  Home,
  LogIn,
  ShieldAlert,
  Sparkles,
  Compass,
  ServerOff,
  Clock,
  Ban,
  FileQuestion,
} from "lucide-react"

export type ErrorStatusCode =
  | 400
  | 401
  | 403
  | 404
  | 408
  | 429
  | 500
  | 502
  | 503
  | 504
  | "ai"
  | "generic"

interface ErrorConfig {
  codeDisplay: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  primaryAction: {
    label: string
    type: "reset" | "signin" | "home" | "back" | "dashboard"
  }
  secondaryAction?: {
    label: string
    type: "home" | "back" | "dashboard"
  }
}

const ERROR_CONFIGS: Record<ErrorStatusCode, ErrorConfig> = {
  400: {
    codeDisplay: "400",
    title: "Invalid request.",
    description: "The information sent to AIMETRA could not be processed. Please check your input and try again.",
    icon: ShieldAlert,
    primaryAction: { label: "Go Home", type: "home" },
    secondaryAction: { label: "Go Back", type: "back" },
  },
  401: {
    codeDisplay: "401",
    title: "Authentication required.",
    description: "Please sign in to continue accessing AIMETRA institutional resources.",
    icon: LogIn,
    primaryAction: { label: "Sign In", type: "signin" },
    secondaryAction: { label: "Go Home", type: "home" },
  },
  403: {
    codeDisplay: "403",
    title: "Access restricted.",
    description: "Your account does not have permission to access this institutional resource or administrative endpoint.",
    icon: Ban,
    primaryAction: { label: "Go Home", type: "home" },
    secondaryAction: { label: "Go Back", type: "back" },
  },
  404: {
    codeDisplay: "404",
    title: "This page could not be found.",
    description: "The page or institutional record you requested may have been moved, removed, or is no longer available.",
    icon: FileQuestion,
    primaryAction: { label: "Back to AIMETRA", type: "home" },
    secondaryAction: { label: "Go to Dashboard", type: "dashboard" },
  },
  408: {
    codeDisplay: "408",
    title: "The request took too long.",
    description: "The departmental network operation timed out before completing. Please verify your connection and try again.",
    icon: Clock,
    primaryAction: { label: "Try Again", type: "reset" },
    secondaryAction: { label: "Go Home", type: "home" },
  },
  429: {
    codeDisplay: "429",
    title: "Too many requests.",
    description: "You have exceeded the operational rate limit threshold. Please wait a moment before trying again.",
    icon: Clock,
    primaryAction: { label: "Try Again", type: "reset" },
    secondaryAction: { label: "Go Home", type: "home" },
  },
  500: {
    codeDisplay: "500",
    title: "Something went wrong.",
    description: "AIMETRA encountered an unexpected problem while processing this request. Your data has not been modified by this error.",
    icon: ServerOff,
    primaryAction: { label: "Try Again", type: "reset" },
    secondaryAction: { label: "Go Home", type: "home" },
  },
  502: {
    codeDisplay: "502",
    title: "Service communication error.",
    description: "AIMETRA is having trouble reaching an upstream internal service. Please try again shortly.",
    icon: ServerOff,
    primaryAction: { label: "Try Again", type: "reset" },
    secondaryAction: { label: "Go Home", type: "home" },
  },
  503: {
    codeDisplay: "503",
    title: "AIMETRA is temporarily unavailable.",
    description: "The departmental services are temporarily undergoing maintenance or experiencing heavy load. Please try again in a moment.",
    icon: ServerOff,
    primaryAction: { label: "Try Again", type: "reset" },
    secondaryAction: { label: "Go Home", type: "home" },
  },
  504: {
    codeDisplay: "504",
    title: "The service took too long to respond.",
    description: "The institutional gateway timed out waiting for the service to respond. Please try again.",
    icon: Clock,
    primaryAction: { label: "Try Again", type: "reset" },
    secondaryAction: { label: "Go Home", type: "home" },
  },
  ai: {
    codeDisplay: "AIDA",
    title: "I couldn't complete that request.",
    description: "The intelligence service is temporarily unavailable or encountered an unexpected interruption. Your request was not completed.",
    icon: Sparkles,
    primaryAction: { label: "Try Again", type: "reset" },
    secondaryAction: { label: "Return to AIDA", type: "dashboard" },
  },
  generic: {
    codeDisplay: "ERROR",
    title: "An unexpected condition occurred.",
    description: "AIMETRA encountered an error while rendering this view. You can safely retry or return to the main dashboard.",
    icon: ShieldAlert,
    primaryAction: { label: "Try Again", type: "reset" },
    secondaryAction: { label: "Go Home", type: "home" },
  },
}

export interface BrandedErrorPageProps {
  status?: ErrorStatusCode | number
  title?: string
  description?: string
  requestId?: string
  reset?: () => void
  showSuggestedLinks?: boolean
  compact?: boolean
}

export function BrandedErrorPage({
  status = 500,
  title,
  description,
  requestId,
  reset,
  showSuggestedLinks = false,
  compact = false,
}: BrandedErrorPageProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Match config key
  let configKey: ErrorStatusCode = "generic"
  if (status === "ai") {
    configKey = "ai"
  } else if (typeof status === "number" && status in ERROR_CONFIGS) {
    configKey = status as ErrorStatusCode
  }

  const config = ERROR_CONFIGS[configKey]
  const displayTitle = title || config.title
  const displayDesc = description || config.description
  const IconComponent = config.icon

  // Clean, safe Request ID extraction
  const cleanRequestId = requestId
    ? requestId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 16)
    : undefined

  const handleAction = (type: string) => {
    switch (type) {
      case "reset":
        if (reset) {
          reset()
        } else {
          window.location.reload()
        }
        break
      case "signin":
        router.push("/login")
        break
      case "back":
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back()
        } else {
          router.push("/")
        }
        break
      case "dashboard":
        router.push(user ? "/dashboard" : "/login")
        break
      case "home":
      default:
        router.push("/")
        break
    }
  }

  return (
    <div
      role="region"
      aria-label="Application Error"
      className={`min-h-[60vh] flex flex-col items-center justify-center bg-white text-[#111111] px-6 ${
        compact ? "py-10" : "py-20"
      }`}
    >
      <div className="w-full max-w-xl mx-auto text-center space-y-6">
        {/* Brand Header */}
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-[0.16em] uppercase text-[#111111] block">
            AIMETRA
          </span>
          <span className="text-[11px] text-[#777777] block font-medium">
            AI &amp; ML Education, Talent, Research &amp; Analytics
          </span>
        </div>

        {/* Status Badge & Code */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAFAFA] text-[#444444] border border-[#E5E5E5]">
            <IconComponent className="w-3.5 h-3.5 text-[#111111]" />
            <span className="font-mono tracking-tight">{config.codeDisplay}</span>
          </div>
        </div>

        {/* Main Error Copy */}
        <div className="space-y-2.5 max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
            {displayTitle}
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            {displayDesc}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleAction(config.primaryAction.type)}
            className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-[#111111] text-white hover:bg-neutral-800 text-xs font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          >
            {config.primaryAction.type === "reset" && (
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
            )}
            {config.primaryAction.type === "signin" && (
              <LogIn className="w-3.5 h-3.5 mr-2" />
            )}
            {config.primaryAction.type === "home" && (
              <Home className="w-3.5 h-3.5 mr-2" />
            )}
            {config.primaryAction.type === "back" && (
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            )}
            {config.primaryAction.label}
          </button>

          {config.secondaryAction && (
            <button
              type="button"
              onClick={() => handleAction(config.secondaryAction!.type)}
              className="inline-flex items-center justify-center h-10 px-5 rounded-md border border-[#E5E5E5] bg-white text-[#333333] hover:bg-[#F9F9F9] text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              {config.secondaryAction.type === "home" && (
                <Home className="w-3.5 h-3.5 mr-2 text-[#777777]" />
              )}
              {config.secondaryAction.type === "back" && (
                <ArrowLeft className="w-3.5 h-3.5 mr-2 text-[#777777]" />
              )}
              {config.secondaryAction.label}
            </button>
          )}
        </div>

        {/* Optional Safe Request ID Correlation */}
        {cleanRequestId && (
          <div className="pt-3">
            <span className="text-[11px] font-mono text-[#888888] bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#EBEBEB] inline-block">
              Request ID: {cleanRequestId}
            </span>
          </div>
        )}

        {/* Suggested Institutional Navigation for 404s */}
        {showSuggestedLinks && (
          <div className="pt-6 border-t border-[#F0F0F0] max-w-md mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#888888] mb-3">
              Institutional Navigation
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-left">
              <Link
                href="/programs"
                className="p-3 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors bg-[#FAFAFA]"
              >
                <div className="text-xs font-semibold text-[#111111]">Programs</div>
                <div className="text-[11px] text-[#777777]">Degree curricula &amp; specializations</div>
              </Link>
              <Link
                href="/people"
                className="p-3 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors bg-[#FAFAFA]"
              >
                <div className="text-xs font-semibold text-[#111111]">Faculty &amp; Staff</div>
                <div className="text-[11px] text-[#777777]">Scholars &amp; leadership directory</div>
              </Link>
              <Link
                href="/research"
                className="p-3 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors bg-[#FAFAFA]"
              >
                <div className="text-xs font-semibold text-[#111111]">Research Labs</div>
                <div className="text-[11px] text-[#777777]">Publications &amp; compute clusters</div>
              </Link>
              <Link
                href="/events"
                className="p-3 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors bg-[#FAFAFA]"
              >
                <div className="text-xs font-semibold text-[#111111]">Events</div>
                <div className="text-[11px] text-[#777777]">Department schedule &amp; talks</div>
              </Link>
            </div>
          </div>
        )}

        {/* Institutional Positioning Footer */}
        <div className="pt-8 border-t border-[#F0F0F0] text-center">
          <p className="text-[11px] text-[#AAAAAA]">
            AIMETRA · The intelligence layer for the AI &amp; ML department.
          </p>
        </div>
      </div>
    </div>
  )
}
