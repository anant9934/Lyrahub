"use client"

import { useContext } from "react"
import { ResponsiveContext, ResponsiveContextValue } from "./ResponsiveProvider"

/**
 * Hook to access centralized responsive state and device capabilities.
 * Safe for use in client components; yields safe SSR defaults before hydration.
 */
export function useResponsive(): ResponsiveContextValue {
  const context = useContext(ResponsiveContext)
  if (!context) {
    throw new Error("useResponsive must be used within a ResponsiveProvider")
  }
  return context
}
