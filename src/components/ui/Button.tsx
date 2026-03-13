import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "motion/react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-white hover:bg-brand-dark shadow-lg shadow-brand-primary/20",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border-2 border-brand-primary bg-transparent text-brand-primary hover:bg-brand-primary hover:text-white",
        secondary: "bg-brand-secondary text-white hover:bg-brand-primary shadow-md",
        ghost: "hover:bg-slate-100 text-slate-600",
        link: "text-brand-primary underline-offset-4 hover:underline",
        card: "bg-white border border-slate-200 text-slate-900 hover:border-brand-primary hover:shadow-lg transition-all text-left justify-start h-auto py-4 px-6 whitespace-normal rounded-2xl",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 px-4 text-xs",
        lg: "h-16 px-10 text-lg",
        icon: "h-12 w-12",
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
