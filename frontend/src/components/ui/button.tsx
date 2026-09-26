import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-text disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "bg-[#111111] text-white hover:bg-neutral-800 active:bg-neutral-950",
        primary: "bg-[#111111] text-white hover:bg-neutral-800 active:bg-neutral-950",
        secondary: "bg-white text-[#111111] border border-[#E5E5E5] hover:bg-[#FAFAFA] active:bg-[#F5F5F5]",
        outline: "bg-white text-[#111111] border border-[#E5E5E5] hover:bg-[#FAFAFA]",
        ghost: "bg-transparent text-[#555555] hover:bg-[#F5F5F5] hover:text-[#111111]",
        link: "text-[#111111] underline-offset-4 hover:underline",
        danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
        info: "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
        // legacy compatibility
        accent: "bg-[#111111] text-white hover:bg-neutral-800",
        sage: "bg-[#111111] text-white hover:bg-neutral-800",
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
