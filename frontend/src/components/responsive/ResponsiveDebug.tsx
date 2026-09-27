"use client"

import React, { useState } from "react"
import { useResponsive } from "@/responsive/useResponsive"
import { Sliders, X, ChevronUp } from "lucide-react"

/**
 * Development-only responsive telemetry overlay.
 * Displays live viewport, device capabilities, network status, and accessibility indicators.
 * Strictly omitted in production builds.
 */
export function ResponsiveDebug() {
  const [expanded, setExpanded] = useState(false)
  const responsive = useResponsive()

  // Never render in production builds or before client mount
  if (process.env.NODE_ENV === "production" || !responsive.isMounted) {
    return null
  }

  return (
    <aside
      aria-label="Responsive telemetry debug tool"
      className="fixed bottom-2 left-2 z-50 font-mono text-[10px] select-none"
    >
      {expanded ? (
        <div className="bg-neutral-900/95 text-white border border-neutral-700 rounded-lg p-3 shadow-2xl backdrop-blur-md max-w-xs space-y-2">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-1.5 font-bold">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Sliders className="w-3.5 h-3.5" />
              <span>RESPONSIVE DEBUG</span>
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 text-neutral-300">
            <div className="flex justify-between">
              <span className="text-neutral-400">Viewport:</span>
              <span className="text-white font-semibold">
                {responsive.viewportWidth} × {responsive.viewportHeight}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Visual VP:</span>
              <span>
                {Math.round(responsive.visualViewportWidth)} ×{" "}
                {Math.round(responsive.visualViewportHeight)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Screen:</span>
              <span>
                {responsive.screenWidth} × {responsive.screenHeight} (@{responsive.devicePixelRatio}x)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Breakpoint:</span>
              <span className="text-emerald-400 font-semibold">
                {responsive.isMobile
                  ? "Mobile (<640px)"
                  : responsive.isTablet
                  ? "Tablet (640-1023px)"
                  : responsive.isLaptop
                  ? "Laptop (1024-1439px)"
                  : responsive.isDesktop
                  ? "Desktop (1440-1919px)"
                  : "Ultrawide (1920px+)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Orientation:</span>
              <span className="capitalize">{responsive.orientation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Pointer / Hover:</span>
              <span>
                {responsive.pointerCapability} / {responsive.hoverCapability}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Touch:</span>
              <span>
                {responsive.touchSupport ? `Yes (${responsive.maxTouchPoints} pts)` : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Network:</span>
              <span className={responsive.online ? "text-emerald-400" : "text-red-400"}>
                {responsive.online ? responsive.effectiveType?.toUpperCase() || "Online" : "Offline"}
                {responsive.downlink ? ` (${responsive.downlink}Mb/s)` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Save Data:</span>
              <span>{responsive.saveData ? "Active" : "Off"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Reduced Motion:</span>
              <span>{responsive.prefersReducedMotion ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Contrast:</span>
              <span className="capitalize">{responsive.prefersContrast}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">CPU / RAM:</span>
              <span>
                {responsive.hardwareConcurrency ? `${responsive.hardwareConcurrency} cores` : "?"} /{" "}
                {responsive.deviceMemory ? `${responsive.deviceMemory}GB` : "?"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1.5 bg-neutral-900/90 text-white border border-neutral-700 px-2 py-1 rounded-md shadow-lg hover:bg-neutral-800 transition-colors"
          title="Open Responsive Debug Telemetry"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {responsive.viewportWidth}px ·{" "}
            {responsive.isMobile
              ? "XS"
              : responsive.isTablet
              ? "MD"
              : responsive.isLaptop
              ? "LG"
              : responsive.isDesktop
              ? "XL"
              : "2XL"}
          </span>
          <ChevronUp className="w-3 h-3 text-neutral-400" />
        </button>
      )}
    </aside>
  )
}
