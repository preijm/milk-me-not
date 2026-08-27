import { ChartBar, MapPin, Table2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewType = "table" | "charts" | "map";

interface ResultsViewSwitcherProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  /** Which views to offer. Defaults to all of them. */
  available?: ViewType[];
  className?: string;
}

const VIEWS: { key: ViewType; label: string; icon: LucideIcon }[] = [
  { key: "table", label: "Ranking", icon: Table2 },
  { key: "charts", label: "Charts", icon: ChartBar },
  { key: "map", label: "Map", icon: MapPin },
];

export const ResultsViewSwitcher = ({ view, onViewChange, available, className }: ResultsViewSwitcherProps) => (
  <div
    role="tablist"
    aria-label="Results view"
    className={cn(
      "inline-flex shrink-0 items-center gap-1 rounded-full border-[1.5px] border-story-ink/10 bg-white p-1",
      className,
    )}
  >
    {VIEWS.filter((v) => !available || available.includes(v.key)).map((v) => (
      <button
        key={v.key}
        type="button"
        role="tab"
        aria-selected={view === v.key}
        onClick={() => onViewChange(v.key)}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem] font-bold transition-colors",
          view === v.key ? "bg-story-green text-white" : "text-story-ink-2 hover:bg-story-cream-2",
        )}
      >
        <v.icon className="h-3.5 w-3.5" aria-hidden />
        {v.label}
      </button>
    ))}
  </div>
);
