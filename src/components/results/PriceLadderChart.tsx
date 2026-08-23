/**
 * Whether paying more actually buys a better drink.
 *
 * The five verdicts are an ordered scale, so the bars are drawn in that order
 * and the reader can see whether the scores climb with them. They do.
 *
 * One hue, like the brand chart: the bars plot *score*, so colouring them by
 * the price verdict would paint one variable with another and imply the two
 * are the same reading. The verdict is named in text beside its bar instead.
 */
import type { PriceQualityBin } from "./chartData";

const SCALE_MAX = 10;

export const PriceLadderChart = ({
  bins,
  scored,
  total,
}: {
  bins: PriceQualityBin[];
  /** Ratings that carry a price verdict. */
  scored: number;
  /** Ratings in the current slice, verdict or not. */
  total: number;
}) => {
  if (bins.length === 0) {
    return (
      <p className="py-10 text-center text-[0.9375rem] text-story-muted">
        Nobody in this slice said what they thought of the price yet.
      </p>
    );
  }

  return (
    <figure className="m-0">
      <ol className="flex flex-col gap-2.5">
        {bins.map((bin) => (
          <li key={bin.tier.key} className="flex items-center gap-2 sm:gap-4">
            {/* Four columns do not fit a phone, so the sample size tucks under
                the label rather than claiming one of its own. */}
            <span className="w-21 shrink-0 sm:w-28">
              <span className="block text-[0.8125rem] font-bold leading-tight text-story-ink sm:text-sm">
                {bin.tier.label}
              </span>
              <span className="block text-[0.6875rem] font-medium tabular-nums text-story-muted-2 sm:hidden">
                {bin.n} {bin.n === 1 ? "rating" : "ratings"}
              </span>
            </span>
            <span className="h-7 min-w-0 flex-1 overflow-hidden rounded-full bg-story-ink/6 sm:h-8">
              <span
                className="block h-full rounded-full bg-story-green transition-[width] duration-500"
                style={{ width: `${(bin.avg / SCALE_MAX) * 100}%` }}
              />
            </span>
            <span className="story-num w-8 shrink-0 text-right text-[0.9375rem] tabular-nums text-story-ink sm:w-12 sm:text-[1.0625rem]">
              {bin.avg.toFixed(1)}
            </span>
            <span className="hidden w-14 shrink-0 text-right text-[0.6875rem] font-medium tabular-nums text-story-muted-2 sm:block">
              {bin.n} {bin.n === 1 ? "rating" : "ratings"}
            </span>
          </li>
        ))}
      </ol>

      <figcaption className="mt-5 text-[0.8125rem] leading-relaxed text-story-muted">
        Average score at each price verdict. Only {scored} of {total} ratings in this slice say anything about price, so
        read the thin rows lightly — but the order they land in is the point.
      </figcaption>
    </figure>
  );
};

export default PriceLadderChart;
