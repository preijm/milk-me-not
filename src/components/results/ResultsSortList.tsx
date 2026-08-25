import { cn } from "@/lib/utils";
import { SORT_CATEGORIES } from "./sortOptions";
import type { SortConfig } from "@/hooks/useAggregatedResults";

type ResultsSortListProps = {
  sortConfig: SortConfig;
  onSelect: (column: string, direction: "asc" | "desc") => void;
};

/** The sort menu body, shared between the desktop popover and the mobile sheet. */
export const ResultsSortList = ({ sortConfig, onSelect }: ResultsSortListProps) => (
  <div className="flex flex-col">
    {SORT_CATEGORIES.map((category) => (
      <div
        key={category.label}
        className="flex items-center gap-3 border-t border-story-ink/6 py-3 first:border-t-0 first:pt-0"
      >
        <category.icon className="h-4 w-4 shrink-0 text-story-muted-2" aria-hidden />
        <span className="w-16 shrink-0 text-[0.8125rem] font-bold text-story-muted">{category.label}</span>
        <div className="flex flex-1 gap-2">
          {category.options.map((option) => {
            const active = sortConfig.column === option.column && sortConfig.direction === option.direction;
            return (
              <button
                key={`${option.column}-${option.direction}`}
                type="button"
                onClick={() => onSelect(option.column, option.direction)}
                className={cn(
                  "flex-1 rounded-full px-2.5 py-2 text-center text-[0.75rem] font-bold transition-colors",
                  active ? "bg-story-green text-story-ink" : "bg-story-ink/5 text-story-ink-2 hover:bg-story-ink/8",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);
