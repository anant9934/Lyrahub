import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-[background-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "bg-brand-navy text-white hover:bg-[#173667] active:bg-[#0B2852]",
        primary: "bg-brand-navy text-white hover:bg-[#173667] active:bg-[#0B2852]",
        secondary: "border border-border bg-surface text-ink hover:bg-canvas-alt active:bg-canvas",
        outline: "border border-border bg-surface text-ink hover:bg-canvas-alt",
        ghost: "bg-transparent text-ink-500 hover:bg-canvas-alt hover:text-ink",
        link: "text-brand-blue underline-offset-4 hover:underline",
        danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
        info: "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
        // legacy compatibility
        accent: "bg-brand-yellow text-brand-navy hover:bg-[#FFE05B]",
        sage: "bg-sage-bg text-brand-blue hover:bg-[#D9EAFF]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-6 text-sm font-medium",
        xl: "h-11 rounded-lg px-8 text-base font-medium",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
