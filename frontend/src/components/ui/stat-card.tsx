import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: string
  trendType?: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
  /** Optional accent color for the left border/icon */
  accentColor?: string
  /** Optional percentage for a mini progress bar inside the card */
  progress?: number
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
  accentColor = "#1478ef",
  progress,
  className,
  highlight = false,
}: StatCardProps) {
  const trendColors = {
    positive: { text: "#15803D", bg: "#DCFCE7", Icon: TrendingUp },
    negative: { text: "#B91C1C", bg: "#FEE2E2", Icon: TrendingDown },
    neutral:  { text: "#526783", bg: "#F0F4FA", Icon: Minus },
  }
  const { text: trendText, bg: trendBg, Icon: TrendIcon } = trendColors[trendType]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[#D4E0F0] bg-white p-5 shadow-[0_1px_3px_rgba(9,25,54,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(9,25,54,0.09)] dark:bg-[#101e35] dark:border-[#1E3456]",
        className
      )}
    >
      {/* Subtle left accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl opacity-70"
        style={{ background: accentColor }}
      />

      {/* Ambient glow in top-right */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: accentColor }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#526783] dark:text-[#7aace0] leading-tight">
          {label}
        </span>
        {icon && (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${accentColor}15`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            "text-[26px] font-black tracking-[-0.045em] leading-none",
            highlight ? "text-[#1478ef]" : "text-[#091936] dark:text-white"
          )}
          style={highlight ? { color: accentColor } : undefined}
        >
          {value}
        </span>
        {subValue && (
          <span className="text-[11px] text-[#9ab5d0] leading-tight">{subValue}</span>
        )}
      </div>

      {/* Mini progress bar */}
      {progress !== undefined && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#E8F0FB] dark:bg-[#1E3456]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, progress)}%`, background: accentColor }}
          />
        </div>
      )}

      {/* Trend pill */}
      {trend && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: trendBg, color: trendText }}
        >
          <TrendIcon className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
  )
}
