"use client"

import React, { createContext, useEffect, useState } from "react"
import {
  DeviceCapabilities,
  DEFAULT_CAPABILITIES,
  getLiveCapabilities,
} from "./deviceCapabilities"

export interface ResponsiveContextValue extends DeviceCapabilities {
  // Convenience breakpoints based on usable viewport width
  isMobile: boolean
  isTablet: boolean
  isLaptop: boolean
  isDesktop: boolean
  isUltrawide: boolean

  // Orientation & Touch
  isLandscape: boolean
  isPortrait: boolean
  isTouch: boolean
  isCoarsePointer: boolean

  // Performance hints
  isSlowNetwork: boolean
  isOffline: boolean
  isReducedMotion: boolean
}

function deriveHelpers(caps: DeviceCapabilities): ResponsiveContextValue {
  const w = caps.viewportWidth
  return {
    ...caps,
    isMobile: w < 640,
    isTablet: w >= 640 && w < 1024,
    isLaptop: w >= 1024 && w < 1440,
    isDesktop: w >= 1440 && w < 1920,
    isUltrawide: w >= 1920,

    isLandscape: caps.orientation === "landscape",
    isPortrait: caps.orientation === "portrait",
    isTouch: caps.touchSupport,
    isCoarsePointer: caps.pointerCapability === "coarse",

    isSlowNetwork:
      caps.effectiveType === "slow-2g" ||
      caps.effectiveType === "2g" ||
      caps.saveData,
    isOffline: !caps.online,
    isReducedMotion: caps.prefersReducedMotion,
  }
}

export const ResponsiveContext = createContext<ResponsiveContextValue>(
  deriveHelpers(DEFAULT_CAPABILITIES)
)

export function ResponsiveProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(
    DEFAULT_CAPABILITIES
  )

  useEffect(() => {
    // Initial client read on mount
    setCapabilities(getLiveCapabilities())

    let rafId: number | null = null

    const handleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setCapabilities(getLiveCapabilities())
      })
    }

    // Window events
    window.addEventListener("resize", handleUpdate, { passive: true })
    window.addEventListener("orientationchange", handleUpdate, {
      passive: true,
    })
    window.addEventListener("online", handleUpdate)
    window.addEventListener("offline", handleUpdate)

    // Visual Viewport tracking (important for mobile keyboards / pinch zoom)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleUpdate)
      window.visualViewport.addEventListener("scroll", handleUpdate)
    }

    // Media query change listeners
    const mqls = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(prefers-color-scheme: dark)"),
      window.matchMedia("(forced-colors: active)"),
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(hover: hover)"),
    ]

    mqls.forEach((mql) => {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", handleUpdate)
      } else if (typeof (mql as unknown as { addListener?: (fn: () => void) => void }).addListener === "function") {
        (mql as unknown as { addListener: (fn: () => void) => void }).addListener(handleUpdate)
      }
    })

    // Network Information listener
    const nav = navigator as Navigator & {
      connection?: {
        addEventListener?: (event: string, fn: () => void) => void
      }
    }
    nav.connection?.addEventListener?.("change", handleUpdate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener("resize", handleUpdate)
      window.removeEventListener("orientationchange", handleUpdate)
      window.removeEventListener("online", handleUpdate)
      window.removeEventListener("offline", handleUpdate)

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleUpdate)
        window.visualViewport.removeEventListener("scroll", handleUpdate)
      }

      mqls.forEach((mql) => {
        if (typeof mql.removeEventListener === "function") {
          mql.removeEventListener("change", handleUpdate)
        } else if (typeof (mql as unknown as { removeListener?: (fn: () => void) => void }).removeListener === "function") {
          (mql as unknown as { removeListener: (fn: () => void) => void }).removeListener(handleUpdate)
        }
      })
    }
  }, [])

  const value = deriveHelpers(capabilities)

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  )
}
