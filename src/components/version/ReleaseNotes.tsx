import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReleaseNotesProps {
  notes: string | null;
  expanded?: boolean;
}

export function ReleaseNotes({ notes, expanded = false }: ReleaseNotesProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!notes) return null;

  // Simple markdown-like parsing for release notes
  const parseNotes = (text: string) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-base font-semibold text-foreground mt-3 first:mt-0">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="text-sm font-medium text-foreground mt-2">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="text-sm text-muted-foreground ml-4 list-disc">
            {line.replace("- ", "")}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="h-1" />;
      }
      return (
        <p key={index} className="text-sm text-muted-foreground">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3" />
            Hide release notes
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" />
            View release notes
          </>
        )}
      </Button>

      {isExpanded && (
        <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border max-h-48 overflow-y-auto">
          <ul className="space-y-0.5">{parseNotes(notes)}</ul>
        </div>
      )}
    </div>
  );
}
