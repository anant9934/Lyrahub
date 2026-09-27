import React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  minItemWidth?: number // in px, e.g. 260
  gap?: "sm" | "md" | "lg"
  columns?: 1 | 2 | 3 | 4
  children: React.ReactNode
}

/**
 * Adaptive Grid primitive.
 * Supports auto-fit CSS grids that scale naturally from 1-column mobile to multi-column desktop.
 */
export function ResponsiveGrid({
  minItemWidth = 260,
  gap = "md",
  columns,
  className,
  style,
  children,
  ...props
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  }

  // If specific column count requested, use responsive Tailwind columns
  if (columns) {
    const colClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    }
    return (
      <div
        className={cn("grid", colClasses[columns], gapClasses[gap], className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    )
  }

  // Otherwise, use CSS auto-fit with minmax to avoid breaking at narrow viewports
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minItemWidth}px), 1fr))`,
    ...style,
  }

  return (
    <div
      className={cn("grid", gapClasses[gap], className)}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  )
}
