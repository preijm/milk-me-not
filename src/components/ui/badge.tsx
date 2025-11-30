
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border font-medium",
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
        barista: "bg-white/80 backdrop-blur-sm text-foreground border border-border rounded-md !px-1.5 !py-0.5 text-xs font-medium hover:bg-accent hover:border-accent-foreground whitespace-nowrap",
        category: "bg-white/80 backdrop-blur-sm text-foreground border border-border rounded-md !px-1.5 !py-0.5 text-xs font-medium hover:bg-accent hover:border-accent-foreground whitespace-nowrap",
        flavor: "bg-white/80 backdrop-blur-sm text-foreground border border-border rounded-md !px-1.5 !py-0.5 text-xs font-medium hover:bg-accent hover:border-accent-foreground whitespace-nowrap",
        scoreExcellent: "bg-transparent text-[#00bf63] border-[#00bf63] rounded px-2 py-1 text-[11px] font-medium",
        scoreGood: "bg-transparent text-[#2144ff] border-[#2144ff] rounded px-2 py-1 text-[11px] font-medium",
        scoreFair: "bg-transparent text-[#f59e0b] border-[#f59e0b] rounded px-2 py-1 text-[11px] font-medium",
        scorePoor: "bg-transparent text-[#ff4b51] border-[#ff4b51] rounded px-2 py-1 text-[11px] font-medium",
        // Score badge variants
        scoreBadgeExcellent: "bg-white/80 backdrop-blur-sm text-[#00bf63] border border-[#00bf63] rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center",
        scoreBadgeGood: "bg-white/80 backdrop-blur-sm text-[#2144ff] border border-[#2144ff] rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center",
        scoreBadgeFair: "bg-white/80 backdrop-blur-sm text-[#f59e0b] border border-[#f59e0b] rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center",
        scoreBadgePoor: "bg-white/80 backdrop-blur-sm text-[#ff4b51] border border-[#ff4b51] rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center",
        // Test count badge
        testCount: "bg-transparent text-slate-600 border-slate-600 rounded-md px-2.5 py-1.5 text-sm font-medium min-w-[40px] justify-center",
        // Circular score badges
        circularScoreExcellent: "bg-[#00bf63] text-white rounded-full h-12 w-12 text-sm font-bold flex items-center justify-center shadow-lg",
        circularScoreGood: "bg-[#2144ff] text-white rounded-full h-12 w-12 text-sm font-bold flex items-center justify-center shadow-lg", 
        circularScoreFair: "bg-[#f59e0b] text-white rounded-full h-12 w-12 text-sm font-bold flex items-center justify-center shadow-lg",
        circularScorePoor: "bg-[#ff4b51] text-white rounded-full h-12 w-12 text-sm font-bold flex items-center justify-center shadow-lg",
        // Circular test count badge
        circularTestCount: "bg-gray-200 text-gray-700 rounded-full h-12 w-12 text-sm font-medium flex items-center justify-center shadow-lg",
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
