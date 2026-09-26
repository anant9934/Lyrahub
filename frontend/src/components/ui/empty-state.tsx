import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-[#D0D0D0] bg-[#FAFAFA] p-8 text-center",
        className
      )}
    >
      {icon && <div className="mb-3 text-[#888888]">{icon}</div>}
      <h3 className="text-sm font-medium text-[#111111]">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-[#555555] max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          size="sm"
          variant="secondary"
          className="mt-4"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#F0F0F0]", className)}
      {...props}
    />
  )
}
