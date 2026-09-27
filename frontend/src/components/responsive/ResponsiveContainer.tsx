import React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
  size?: "default" | "narrow" | "fluid"
  children: React.ReactNode
}

/**
 * Bounded responsive page container.
 * Automatically adapts padding and prevents overstretching on ultrawide displays.
 */
export function ResponsiveContainer({
  as: Component = "div",
  size = "default",
  className,
  children,
  ...props
}: ResponsiveContainerProps) {
  const sizeClasses = {
    default: "w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 mx-auto",
    narrow: "w-full max-w-4xl px-4 sm:px-6 mx-auto",
    fluid: "w-full px-4 sm:px-6 lg:px-8",
  }

  return (
    <Component
      className={cn(sizeClasses[size], "responsive-container", className)}
      {...props}
    >
      {children}
    </Component>
  )
}
