"use client"

import React, { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  caption?: string
  scrollHint?: boolean
}

/**
 * Adaptive Table wrapper.
 * Ensures data tables never destroy mobile layout.
 * Provides smooth touch scrolling and gradient indicators when content overflows.
 */
export function ResponsiveTable({
  children,
  className,
  caption,
  scrollHint = true,
}: ResponsiveTableProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = containerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = containerRef.current
    if (!el) return

    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll, { passive: true })

    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [])

  return (
    <div className="relative w-full my-2">
      {/* Optional scroll instruction for narrow devices */}
      {scrollHint && canScrollRight && (
        <div className="sm:hidden text-[10px] text-[#777777] mb-1.5 flex items-center justify-between">
          <span>{caption || "Table data"}</span>
          <span className="font-medium text-[#2563EB]">Scroll horizontally →</span>
        </div>
      )}

      {/* Left shadow cue */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10 rounded-l-lg transition-opacity" />
      )}

      {/* Right shadow cue */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10 rounded-r-lg transition-opacity" />
      )}

      {/* Table Container */}
      <div
        ref={containerRef}
        className={cn(
          "w-full overflow-x-auto rounded-lg border border-[#E5E5E5] bg-white scrollbar-thin",
          className
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  )
}
