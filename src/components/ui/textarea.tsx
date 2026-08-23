import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Matches Input. These two sit side by side in the rating form, so a
          // textarea left on the old system reads as a seam down the middle of
          // the page: 16px radius beside 6px, white beside grey.
          "flex min-h-[80px] w-full rounded-xl border-[1.5px] border-story-ink/12 bg-white px-4 py-3",
          "font-sans text-[0.9375rem] text-story-ink transition-colors placeholder:text-story-muted-2",
          "focus-visible:border-story-green focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
