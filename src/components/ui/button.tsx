import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-80  shrink-0 outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/20 hover:scale-102 active:scale-98",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500/70 text-white hover:bg-blue-500/80 border border-transparent",
        destructive:
          "bg-red-500 text-white hover:bg-red-400 border border-transparent",
        outline:
          "border-2 border-blue-500/50 bg-transparent hover:bg-blue-500/10 text-blue-300 hover:text-slate-200 hover:border-blue-500/80",
        secondary:
          "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 hover:border-slate-600",
        ghost:
          "bg-slate-700/60 hover:bg-slate-700/80 text-blue-400 hover:text-slate-200",
        link: "text-blue-400 underline-offset-4 hover:underline",
        success:
          "bg-green-500 text-white hover:bg-green-600 border border-transparent",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
