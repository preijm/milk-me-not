/**
 * How consistent each brand is, not just how good.
 *
 * An average alone says Oatly! and Picnic are much the same. The range says
 * otherwise: one is a tight cluster, the other runs from 4.0 to a perfect ten
 * depending which carton you picked up. So the bar is the whole span a brand
 * has ever scored and the dot is where it settles.
 *
 * One hue throughout. Brands are a nominal set, so shading them by score would
 * double-encode the dot's position as colour and buy nothing — and the tier
 * palette cannot carry it anyway: Gem and Good sit ΔE 6.4 apart, which is not
 * separable even with full colour vision, let alone with protanopia.
 */
import { BrandMark } from "@/components/story";
import type { BrandRange } from "./chartData";

/** The scale every row is drawn against — the same 0–10 the site scores on. */
const SCALE_MAX = 10;
const TICKS = [0, 2, 4, 6, 8, 10];

const pct = (value: number) => (value / SCALE_MAX) * 100;

/** Label column width, shared by the rows and the axis so ticks line up. */
const LABEL_COL = "w-[7.5rem] flex-shrink-0 sm:w-[11rem]";
const VALUE_COL = "w-11 flex-shrink-0 text-right sm:w-12";

const BrandRangeRow = ({ row }: { row: BrandRange }) => {
  const left = pct(row.min);
  const width = Math.max(pct(row.max) - left, 1.5);
  return (
    <li className="group flex items-center gap-3 sm:gap-4">
      <span className={`${LABEL_COL} flex items-center gap-2 sm:gap-2.5`}>
        <BrandMark brand={row.brand} className="hidden h-7 w-7 text-[0.5rem] sm:flex" radius="rounded-lg" />
        <span className="min-w-0">
          <span className="block truncate text-[0.8125rem] font-bold leading-tight text-story-ink sm:text-sm">
            {row.brand}
          </span>
          <span className="block text-[0.6875rem] font-medium text-story-muted-2">{row.n} ratings</span>
        </span>
      </span>

      <span className="relative h-8 min-w-0 flex-1">
        {/* The unscored remainder of the scale, so a short bar still reads as short. */}
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-story-ink/[0.06]" />

        {/* Lowest to highest this brand has ever scored. */}
        <span
          aria-hidden
          className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-story-green/25 transition-colors group-hover:bg-story-green/40"
          style={{ left: `${left}%`, width: `${width}%` }}
        />

        {/* Where it settles. Ringed so it stays legible on top of its own bar. */}
        <span
          aria-hidden
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-story-green ring-2 ring-white"
          style={{ left: `${pct(row.avg)}%` }}
        />

        {/* The exact span, on hover. The table below carries it without hovering. */}
        <span
          aria-hidden
          className="story-num pointer-events-none absolute -top-0.5 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-story-ink px-2 py-0.5 text-[0.625rem] text-white opacity-0 transition-opacity group-hover:opacity-100 sm:block"
          style={{ left: `${left + width / 2}%` }}
        >
          {row.min.toFixed(1)}–{row.max.toFixed(1)}
        </span>
      </span>

      <span className={`${VALUE_COL} story-num text-[1.0625rem] tabular-nums text-story-ink`}>{row.avg.toFixed(1)}</span>
    </li>
  );
};

export const BrandRangeChart = ({ rows, minRatings }: { rows: BrandRange[]; minRatings: number }) => {
  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-[0.9375rem] text-story-muted">
        No brand in this slice has {minRatings} ratings yet — the ranking still shows every product.
      </p>
    );
  }

  const steadiest = [...rows].sort((a, b) => a.spread - b.spread)[0];

  return (
    <figure className="m-0">
      <ol className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <BrandRangeRow key={row.brand} row={row} />
        ))}
      </ol>

      {/* Axis. Ticks sit under the plot column, so the label and value columns are matched by empty spacers. */}
      <div aria-hidden className="mt-3 flex items-center gap-3 sm:gap-4">
        <span className={LABEL_COL} />
        <span className="relative h-4 min-w-0 flex-1">
          {TICKS.map((tick) => (
            <span
              key={tick}
              className="absolute top-0 -translate-x-1/2 text-[0.625rem] font-bold tabular-nums text-story-muted-2"
              style={{ left: `${pct(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </span>
        <span className={VALUE_COL} />
      </div>

      <figcaption className="mt-5 text-[0.8125rem] leading-relaxed text-story-muted">
        Bar runs lowest to highest score; dot is the average. Brands with fewer than {minRatings} ratings are left out.
        {steadiest && (
          <>
            {" "}
            <strong className="font-bold text-story-ink">{steadiest.brand}</strong> is the steadiest, everything within{" "}
            {steadiest.spread.toFixed(1)} of itself.
          </>
        )}
      </figcaption>

      <details className="mt-4 text-[0.8125rem]">
        <summary className="cursor-pointer font-bold text-story-ink-2 marker:text-story-muted-2">
          Show the numbers
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[26rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-story-ink/10 text-[0.6875rem] uppercase tracking-[0.1em] text-story-muted-2">
                <th scope="col" className="py-2 pr-3 font-bold">Brand</th>
                <th scope="col" className="py-2 pr-3 text-right font-bold">Ratings</th>
                <th scope="col" className="py-2 pr-3 text-right font-bold">Lowest</th>
                <th scope="col" className="py-2 pr-3 text-right font-bold">Average</th>
                <th scope="col" className="py-2 pr-3 text-right font-bold">Highest</th>
                <th scope="col" className="py-2 text-right font-bold">Spread</th>
              </tr>
            </thead>
            <tbody className="tabular-nums text-story-ink-2">
              {rows.map((row) => (
                <tr key={row.brand} className="border-b border-story-ink/[0.06] last:border-0">
                  <th scope="row" className="py-2 pr-3 text-left font-bold text-story-ink">{row.brand}</th>
                  <td className="py-2 pr-3 text-right">{row.n}</td>
                  <td className="py-2 pr-3 text-right">{row.min.toFixed(1)}</td>
                  <td className="py-2 pr-3 text-right font-bold text-story-ink">{row.avg.toFixed(1)}</td>
                  <td className="py-2 pr-3 text-right">{row.max.toFixed(1)}</td>
                  <td className="py-2 text-right">{row.spread.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
};

export default BrandRangeChart;
