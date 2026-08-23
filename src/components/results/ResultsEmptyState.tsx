import { MilkDrop } from "@/components/story";

type ResultsEmptyStateProps = {
  onClear: () => void;
};

/** A designed empty state instead of a bare "no results" string. */
export const ResultsEmptyState = ({ onClear }: ResultsEmptyStateProps) => (
  <div className="story-hairline flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center">
    <span className="text-story-green-light" aria-hidden>
      <MilkDrop size={64} variant="solid" />
    </span>
    <p className="story-serif text-[1.35rem] font-bold text-story-ink">Nothing matches that.</p>
    <p className="max-w-sm text-[0.9375rem] leading-relaxed text-story-muted">
      Try a different search, or clear the filters and start again.
    </p>
    <button
      type="button"
      onClick={onClear}
      className="rounded-full bg-story-green px-5 py-2.5 text-[0.875rem] font-bold text-white transition-[filter] hover:brightness-[1.07]"
    >
      Clear filters
    </button>
  </div>
);
