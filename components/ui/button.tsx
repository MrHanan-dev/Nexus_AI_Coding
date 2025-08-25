import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] [box-shadow:inset_0px_-1px_0px_0px_#2a2a2a,_0px_1px_3px_0px_rgba(0,_0,_0,_0.3)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#3a3a3a,_0px_1px_2px_0px_rgba(0,_0,_0,_0.2)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#1a1a1a,_0px_1px_1px_0px_rgba(0,_0,_0,_0.1)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        secondary: "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] border border-[#3a3a3a] hover:border-[#4a4a4a] [box-shadow:inset_0px_-1px_0px_0px_#3a3a3a,_0px_1px_3px_0px_rgba(0,_0,_0,_0.3)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#4a4a4a,_0px_1px_2px_0px_rgba(0,_0,_0,_0.2)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#2a2a2a,_0px_1px_1px_0px_rgba(0,_0,_0,_0.1)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        outline: "border border-[#3a3a3a] bg-transparent hover:bg-[#1a1a1a] text-white [box-shadow:inset_0px_-1px_0px_0px_#3a3a3a,_0px_1px_3px_0px_rgba(0,_0,_0,_0.3)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#4a4a4a,_0px_1px_2px_0px_rgba(0,_0,_0,_0.2)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#2a2a2a,_0px_1px_1px_0px_rgba(0,_0,_0,_0.1)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        destructive: "bg-red-600 text-white hover:bg-red-700 border border-red-500 hover:border-red-600 [box-shadow:inset_0px_-1px_0px_0px_#dc2626,_0px_1px_3px_0px_rgba(220,_38,_38,_0.3)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#b91c1c,_0px_1px_2px_0px_rgba(185,_28,_28,_0.2)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#991b1b,_0px_1px_1px_0px_rgba(153,_27,_27,_0.1)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        code: "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] border border-[#3a3a3a] hover:border-[#4a4a4a] [box-shadow:inset_0px_-1px_0px_0px_#3a3a3a,_0px_1px_3px_0px_rgba(0,_0,_0,_0.3)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#4a4a4a,_0px_1px_2px_0px_rgba(0,_0,_0,_0.2)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#2a2a2a,_0px_1px_1px_0px_rgba(0,_0,_0,_0.1)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        primary: "bg-[#0066ff] text-white hover:bg-[#0052cc] border border-[#0052cc] hover:border-[#0047b3] [box-shadow:inset_0px_-1px_0px_0px_#0052cc,_0px_1px_3px_0px_rgba(0,_102,_255,_0.3)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#0047b3,_0px_1px_2px_0px_rgba(0,_82,_204,_0.2)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#003d99,_0px_1px_1px_0px_rgba(0,_61,_153,_0.1)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        orange: "bg-orange-600 text-white hover:bg-orange-700 border border-orange-500 hover:border-orange-600 [box-shadow:inset_0px_-1px_0px_0px_#ea580c,_0px_1px_3px_0px_rgba(234,_88,_12,_0.3)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#c2410c,_0px_1px_2px_0px_rgba(194,_65,_12,_0.2)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#9a3412,_0px_1px_1px_0px_rgba(154,_52,_18,_0.1)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100",
        ghost: "hover:bg-[#1a1a1a] hover:text-white text-[#a0a0a0]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 py-1 text-sm",
        lg: "h-11 px-6 py-3",
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
    const Comp = asChild ? "button" : "button"
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