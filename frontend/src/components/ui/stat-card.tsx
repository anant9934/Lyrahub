import * as React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: string
  trendType?: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
  className?: string
  highlight?: boolean
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  trendType = "neutral",
  icon,
  className,
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#E5E5E5] bg-white p-5 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#777777]">{label}</span>
        {icon && <div className="text-[#888888]">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={cn(
            "text-2xl sm:text-3xl font-semibold tracking-tight",
            highlight ? "text-[#2563EB]" : "text-[#111111]"
          )}
        >
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-normal text-[#888888]">
            {subValue}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2 flex items-center text-xs">
          <span
            className={cn(
              "font-medium",
              trendType === "positive" && "text-[#16A34A]",
              trendType === "negative" && "text-[#DC2626]",
              trendType === "neutral" && "text-[#777777]"
            )}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  )
}
