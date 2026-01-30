import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ============================================
   HEADING COMPONENT
   ============================================ */

const headingVariants = cva(
  "text-foreground tracking-tight",
  {
    variants: {
      level: {
        h1: "text-heading-1",
        h2: "text-heading-2",
        h3: "text-heading-3",
        h4: "text-heading-4",
        h5: "text-heading-5",
        h6: "text-heading-6",
      },
      fluid: {
        // Fluid hero heading: scales from 1.5rem at small viewports to 6rem at large
        hero: "text-[clamp(1.5rem,4vw+1rem,6rem)] leading-[1.1] font-bold",
        // Fluid page heading: scales from 1.5rem to 3rem for secondary pages
        page: "text-[clamp(1.5rem,3vw+0.5rem,3rem)] leading-[1.2] font-bold",
        // Fluid section heading: scales from 1.25rem to 2rem
        section: "text-[clamp(1.25rem,2vw+0.5rem,2rem)] leading-[1.25] font-semibold",
        none: "",
      },
    },
    defaultVariants: {
      level: "h2",
      fluid: "none",
    },
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, fluid, as, children, ...props }, ref) => {
    const Component = as || level || "h2"
    // When fluid is set, don't apply the level-based text size classes
    const isFluid = fluid && fluid !== "none";
    const levelClass = isFluid ? "" : headingVariants({ level: level || as, fluid: "none" });
    const fluidClass = isFluid ? headingVariants({ fluid }) : "";
    return React.createElement(
      Component,
      {
        className: cn(levelClass, fluidClass, className),
        ref,
        ...props,
      },
      children
    )
  }
)
Heading.displayName = "Heading"

/* ============================================
   TEXT COMPONENT
   ============================================ */

const textVariants = cva(
  "text-foreground",
  {
    variants: {
      size: {
        lg: "text-body-lg",
        default: "text-body",
        sm: "text-body-sm",
        xs: "text-body-xs",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        info: "text-info",
      },
    },
    defaultVariants: {
      size: "default",
      weight: "normal",
      variant: "default",
    },
  }
)

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label"
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, weight, variant, as = "p", children, ...props }, ref) => {
    return React.createElement(
      as,
      {
        className: cn(textVariants({ size, weight, variant }), className),
        ref,
        ...props,
      },
      children
    )
  }
)
Text.displayName = "Text"

export { Heading, headingVariants, Text, textVariants }
