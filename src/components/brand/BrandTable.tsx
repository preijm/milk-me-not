import { Link } from "react-router-dom";
import { BrandMark } from "@/components/story";
import { cn } from "@/lib/utils";
import { brandFacts, brandState, type BrandOwner } from "@/lib/brandFacts";
import { brandSlug } from "@/lib/brandLogo";
import { BrandStatusChip } from "./BrandStatusChip";
import type { BrandSummary } from "./brandSummary";
import type { BrandSort, BrandSortKey } from "./brandTableState";

/**
 * What kind of thing this brand is, said in words rather than colour.
 *
 * Colour-coding the three kinds would read as a ranking — independent good,
 * supermarket bad — and that is a judgement this page has no business making.
 * They are categories, not tiers, so they get the neutral chip and the
 * distinction is carried by the word.
 */
const KIND_LABEL: Record<BrandOwner["kind"], string> = {
  "own-label": "Own-label",
  group: "Group",
  independent: "Independent",
};

const OwnerCell = ({ owner }: { owner: BrandOwner | undefined }) => {
  if (!owner) {
    return <span className="text-[0.8125rem] font-medium text-story-muted-2">—</span>;
  }
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <span className="shrink-0 rounded-md bg-story-cream-2 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-story-muted">
        {KIND_LABEL[owner.kind]}
      </span>
      <span className="min-w-0 truncate text-[0.8125rem] font-medium text-story-muted">
        {owner.kind === "own-label" ? (owner.chain ?? owner.name) : owner.name}
      </span>
    </span>
  );
};

/** "2026-08-14" → "Aug 2026". A month is as precise as this needs to be. */
const shortMonth = (iso: string | null) => {
  if (!iso) return "—";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "—";
  return at.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

const COLUMNS: { key: BrandSortKey; label: string; className: string }[] = [
  { key: "name", label: "Brand", className: "flex-1 min-w-0 justify-start" },
  { key: "ratings", label: "Ratings", className: "w-20 shrink-0 justify-end" },
  { key: "recent", label: "Last rated", className: "w-24 shrink-0 justify-end" },
  { key: "score", label: "Score", className: "w-16 shrink-0 justify-end" },
];

export const BrandSortHeader = ({
  sort,
  onSort,
}: {
  sort: BrandSort;
  onSort: (key: BrandSortKey) => void;
}) => (
  <div className="hidden items-center gap-4 border-b-2 border-story-ink/10 pb-3 md:flex">
    <span className="w-10 shrink-0" aria-hidden />
    {COLUMNS.map((c) => (
      <button
        key={c.key}
        type="button"
        onClick={() => onSort(c.key)}
        aria-label={`Sort by ${c.label.toLowerCase()}`}
        className={cn(
          "story-kicker flex items-center gap-1 text-story-muted-2 transition-colors hover:text-story-ink",
          c.className,
          // The owner column is not sortable — it is a category, and sorting
          // by it would just be the kind filter, done worse.
          c.key === "name" && "md:mr-52",
        )}
      >
        {c.label}
        {sort.key === c.key && <span aria-hidden>{sort.direction === "asc" ? "↑" : "↓"}</span>}
      </button>
    ))}
  </div>
);

export const BrandTable = ({ rows }: { rows: BrandSummary[] }) => (
  <ul className="flex flex-col">
    {rows.map((row) => {
      const owner = brandFacts(row.brand)?.owner;
      const state = brandState(row.brand);
      return (
        <li key={row.brand} className="border-b border-story-ink/8">
          <Link
            to={`/brand/${brandSlug(row.brand)}`}
            className="story-linked-product flex items-center gap-3 py-3.5 no-underline md:gap-4"
          >
            <BrandMark brand={row.brand} className="h-10 w-10 shrink-0 text-[0.6875rem]" radius="rounded-xl" />

            <span className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-4">
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="story-product-name min-w-0 truncate text-[0.9375rem] font-bold text-story-ink">
                  {row.brand}
                </span>
                {/* Discontinued is the reason this page exists, so it never
                    waits for a wider screen. */}
                {state === "discontinued" && <BrandStatusChip state={state} />}
              </span>

              {/* On a phone the owner joins the sub-line; from md it is a
                  column of its own, which is what makes the kinds scannable
                  down the page rather than buried in prose. */}
              <span className="md:w-52 md:shrink-0">
                <OwnerCell owner={owner} />
              </span>
            </span>

            <span className="hidden w-20 shrink-0 text-right text-[0.8125rem] font-bold text-story-ink-2 md:block">
              {row.n}
            </span>
            <span className="hidden w-24 shrink-0 text-right text-[0.8125rem] font-medium text-story-muted-2 md:block">
              {shortMonth(row.latest)}
            </span>
            <span className="story-num w-16 shrink-0 text-right text-[1.125rem] leading-none text-story-green-dark">
              {row.avg.toFixed(1)}
            </span>
          </Link>

          {/* The numbers a phone cannot fit into columns, said as a sentence. */}
          <p className="-mt-2 pb-3 pl-13 text-[0.71rem] font-medium text-story-muted-2 md:hidden">
            {row.n} rating{row.n === 1 ? "" : "s"} · {row.products} product{row.products === 1 ? "" : "s"}
            {row.latest ? ` · last rated ${shortMonth(row.latest)}` : ""}
          </p>
        </li>
      );
    })}
  </ul>
);
