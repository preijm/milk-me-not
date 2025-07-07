
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border font-medium transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        outline: "text-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold",
        // New minimal outline variants
        barista: "bg-transparent text-amber-600 border-amber-600 rounded px-2 py-1 text-[11px] font-medium hover:shadow-md",
        category: "bg-transparent text-slate-600 border-slate-600 rounded px-2 py-1 text-[11px] font-medium hover:shadow-md",
        flavor: "bg-transparent text-purple-600 border-purple-600 rounded px-2 py-1 text-[11px] font-medium hover:shadow-md",
        scoreExcellent: "bg-transparent text-emerald-600 border-emerald-600 rounded px-2 py-1 text-[11px] font-medium hover:shadow-md",
        scoreGood: "bg-transparent text-sky-700 border-sky-700 rounded px-2 py-1 text-[11px] font-medium hover:shadow-md",
        scoreFair: "bg-transparent text-orange-600 border-orange-600 rounded px-2 py-1 text-[11px] font-medium hover:shadow-md",
        scorePoor: "bg-transparent text-red-600 border-red-600 rounded px-2 py-1 text-[11px] font-medium hover:shadow-md",
        // Score badge variants
        scoreBadgeExcellent: "bg-transparent text-emerald-600 border-2 border-emerald-600 rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center hover:shadow-lg",
        scoreBadgeGood: "bg-transparent text-sky-700 border-2 border-sky-700 rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center hover:shadow-lg",
        scoreBadgeFair: "bg-transparent text-orange-600 border-2 border-orange-600 rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center hover:shadow-lg",
        scoreBadgePoor: "bg-transparent text-red-600 border-2 border-red-600 rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center hover:shadow-lg",
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
