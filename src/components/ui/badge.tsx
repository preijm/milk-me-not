import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ============================================
   BADGE COMPONENT - Simplified Design System
   ============================================ */

const badgeVariants = cva(
  "inline-flex items-center border font-medium transition-colors",
  {
    variants: {
      variant: {
        // Core variants
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        outline: "text-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold border-border",
        
        // Semantic status variants
        success: "border-transparent bg-success text-success-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold",
        warning: "border-transparent bg-warning text-warning-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold",
        error: "border-transparent bg-error text-error-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold",
        info: "border-transparent bg-info text-info-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold",
        
        // Property badges (unified styling, legacy names kept for backwards compatibility)
        // Note: hover styles removed to prevent conflicts when selected state is applied via className
        property: "bg-background/80 backdrop-blur-sm text-foreground border border-border rounded-md !px-1.5 !py-0.5 text-xs font-medium whitespace-nowrap",
        barista: "bg-background/80 backdrop-blur-sm text-foreground border border-border rounded-md !px-1.5 !py-0.5 text-xs font-medium whitespace-nowrap",
        category: "bg-background/80 backdrop-blur-sm text-foreground border border-border rounded-md !px-1.5 !py-0.5 text-xs font-medium whitespace-nowrap",
        flavor: "bg-background/80 backdrop-blur-sm text-foreground border border-border rounded-md !px-1.5 !py-0.5 text-xs font-medium whitespace-nowrap",
        
        // Score outline variants (for tables/lists) - using design tokens
        score: "bg-transparent rounded px-2 py-1 text-[11px] font-medium",
        scoreExcellent: "bg-transparent text-score-excellent border-score-excellent rounded px-2 py-1 text-[11px] font-medium",
        scoreGood: "bg-transparent text-score-good border-score-good rounded px-2 py-1 text-[11px] font-medium",
        scoreFair: "bg-transparent text-score-fair border-score-fair rounded px-2 py-1 text-[11px] font-medium",
        scorePoor: "bg-transparent text-score-poor border-score-poor rounded px-2 py-1 text-[11px] font-medium",
        
        // Score badge variants (for cards with background) - using design tokens
        scoreBadge: "bg-background/80 backdrop-blur-sm border rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center",
        scoreBadgeExcellent: "bg-background/80 backdrop-blur-sm text-score-excellent border border-score-excellent rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center",
        scoreBadgeGood: "bg-background/80 backdrop-blur-sm text-score-good border border-score-good rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center",
        scoreBadgeFair: "bg-background/80 backdrop-blur-sm text-score-fair border border-score-fair rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center",
        scoreBadgePoor: "bg-background/80 backdrop-blur-sm text-score-poor border border-score-poor rounded-md px-2.5 py-1.5 text-sm font-bold min-w-[50px] justify-center",
        
        // Circular score badges - using design tokens
        circularScore: "text-white rounded-full h-12 w-12 text-sm font-bold flex items-center justify-center shadow-lg",
        circularScoreExcellent: "bg-score-excellent text-white rounded-full h-12 w-12 text-sm font-bold flex items-center justify-center shadow-lg",
        circularScoreGood: "bg-score-good text-white rounded-full h-12 w-12 text-sm font-bold flex items-center justify-center shadow-lg",
        circularScoreFair: "bg-score-fair text-white rounded-full h-12 w-12 text-sm font-bold flex items-center justify-center shadow-lg",
        circularScorePoor: "bg-score-poor text-white rounded-full h-12 w-12 text-sm font-bold flex items-center justify-center shadow-lg",
        
        // Test count badges
        testCount: "bg-transparent text-muted-foreground border-muted-foreground rounded-md px-2.5 py-1.5 text-sm font-medium min-w-[40px] justify-center",
        circularTestCount: "bg-muted text-muted-foreground rounded-full h-12 w-12 text-sm font-medium flex items-center justify-center shadow-lg",
      },
      // Score level for dynamic coloring (optional, for programmatic use)
      scoreLevel: {
        excellent: "",
        good: "",
        fair: "",
        poor: "",
        none: "",
      },
    },
    compoundVariants: [
      // Score outline colors (for programmatic variant + scoreLevel usage)
      { variant: "score", scoreLevel: "excellent", className: "text-score-excellent border-score-excellent" },
      { variant: "score", scoreLevel: "good", className: "text-score-good border-score-good" },
      { variant: "score", scoreLevel: "fair", className: "text-score-fair border-score-fair" },
      { variant: "score", scoreLevel: "poor", className: "text-score-poor border-score-poor" },
      // Score badge colors
      { variant: "scoreBadge", scoreLevel: "excellent", className: "text-score-excellent border-score-excellent" },
      { variant: "scoreBadge", scoreLevel: "good", className: "text-score-good border-score-good" },
      { variant: "scoreBadge", scoreLevel: "fair", className: "text-score-fair border-score-fair" },
      { variant: "scoreBadge", scoreLevel: "poor", className: "text-score-poor border-score-poor" },
      // Circular score colors
      { variant: "circularScore", scoreLevel: "excellent", className: "bg-score-excellent" },
      { variant: "circularScore", scoreLevel: "good", className: "bg-score-good" },
      { variant: "circularScore", scoreLevel: "fair", className: "bg-score-fair" },
      { variant: "circularScore", scoreLevel: "poor", className: "bg-score-poor" },
    ],
    defaultVariants: {
      variant: "default",
      scoreLevel: "none",
    },
  }
)

// Helper function to determine score level from numeric score
export function getScoreLevel(score: number | null | undefined): "excellent" | "good" | "fair" | "poor" | "none" {
  if (score === null || score === undefined) return "none"
  if (score >= 8) return "excellent"
  if (score >= 6) return "good"
  if (score >= 4) return "fair"
  return "poor"
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, scoreLevel, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, scoreLevel }), className)} {...props} />
  )
}

// Legacy variant mappings for backwards compatibility
const legacyVariantMap: Record<string, { variant: BadgeProps["variant"]; scoreLevel?: BadgeProps["scoreLevel"] }> = {
  barista: { variant: "property" },
  category: { variant: "property" },
  flavor: { variant: "property" },
  scoreExcellent: { variant: "score", scoreLevel: "excellent" },
  scoreGood: { variant: "score", scoreLevel: "good" },
  scoreFair: { variant: "score", scoreLevel: "fair" },
  scorePoor: { variant: "score", scoreLevel: "poor" },
  scoreBadgeExcellent: { variant: "scoreBadge", scoreLevel: "excellent" },
  scoreBadgeGood: { variant: "scoreBadge", scoreLevel: "good" },
  scoreBadgeFair: { variant: "scoreBadge", scoreLevel: "fair" },
  scoreBadgePoor: { variant: "scoreBadge", scoreLevel: "poor" },
  circularScoreExcellent: { variant: "circularScore", scoreLevel: "excellent" },
  circularScoreGood: { variant: "circularScore", scoreLevel: "good" },
  circularScoreFair: { variant: "circularScore", scoreLevel: "fair" },
  circularScorePoor: { variant: "circularScore", scoreLevel: "poor" },
}

export { Badge, badgeVariants, legacyVariantMap }
