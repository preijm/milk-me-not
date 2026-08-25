import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReleaseNotesProps {
  notes: string | null;
  expanded?: boolean;
  /**
   * `ink` on a cream surface, `light` on the green banner.
   *
   * There was one set of colours before, built from `text-muted-foreground`
   * and `bg-muted/50`. On the modal's cream card that reads as grey, which is
   * roughly right; on the banner it is grey on green, which is not. The notes
   * have never actually rendered on either surface — no published row has ever
   * beaten the running build — so this was invisible in both senses.
   */
  tone?: "ink" | "light";
}

const TONE = {
  ink: {
    trigger: "text-story-muted hover:text-story-ink",
    panel: "bg-story-cream-3 story-hairline",
    heading: "text-story-ink",
    body: "text-story-muted",
  },
  light: {
    trigger: "text-white/80 hover:text-white",
    // Recessed, not raised. A white veil over the bar lightens the ground the
    // notes then have to be read against — `bg-white/12` put the body text at
    // 3.98:1, below AA, while the very same words sat at 4.95:1 on the bare
    // bar. Darkening instead digs a well: 6.56:1.
    panel: "bg-black/20 border border-white/15",
    heading: "text-white",
    body: "text-white/85",
  },
} as const;

export function ReleaseNotes({ notes, expanded = false, tone = "ink" }: ReleaseNotesProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const t = TONE[tone];

  if (!notes) return null;

  // Simple markdown-like parsing for release notes
  const parseNotes = (text: string) =>
    text.split("\n").map((line, index) => {
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className={cn("mt-3 text-base font-bold first:mt-0", t.heading)}>
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className={cn("mt-2 text-sm font-bold", t.heading)}>
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className={cn("ml-4 list-disc text-sm", t.body)}>
            {line.replace("- ", "")}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="h-1" />;
      }
      return (
        <p key={index} className={cn("text-sm", t.body)}>
          {line}
        </p>
      );
    });

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-1 rounded-full text-xs font-bold transition-colors",
          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current",
          t.trigger,
        )}
      >
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {isExpanded ? "Hide release notes" : "View release notes"}
      </button>

      {isExpanded && (
        <div className={cn("mt-2 max-h-48 overflow-y-auto rounded-2xl p-3", t.panel)}>
          <ul className="space-y-0.5">{parseNotes(notes)}</ul>
        </div>
      )}
    </div>
  );
}
