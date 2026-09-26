import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#111111] text-white",
        secondary: "border-[#E5E5E5] bg-[#F5F5F5] text-[#555555]",
        outline: "border border-[#E5E5E5] text-[#111111] bg-white",
        success: "border-transparent bg-[#DCFCE7] text-[#15803D]",
        warning: "border-transparent bg-[#FEF9C3] text-[#A16207]",
        danger: "border-transparent bg-[#FEE2E2] text-[#B91C1C]",
        info: "border-transparent bg-[#DBEAFE] text-[#1D4ED8]",
        pending: "border-transparent bg-[#FEF9C3] text-[#A16207]",
        approved: "border-transparent bg-[#DCFCE7] text-[#15803D]",
        active: "border-transparent bg-[#DCFCE7] text-[#15803D]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
