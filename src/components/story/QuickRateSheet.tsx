import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMilkTestForm } from "@/hooks/useMilkTestForm";
import { useMyRatingForProduct } from "@/hooks/useMyRatingForProduct";
import type { MilkTestResult } from "@/types/milk-test";
import { CountrySelect } from "@/components/milk-test/CountrySelect";
import { BrandMark } from "./BrandMark";
import { StoryButton } from "./primitives";
import { getTier } from "./tiers";
import { cn } from "@/lib/utils";

/**
 * The five values the rating flow writes to `price_quality_ratio`. Kept in the
 * same order and with the same keys as PriceInput so a quick rating is
 * indistinguishable from one entered on the full page.
 */
const PRICE_CHOICES = [
  { value: "waste_of_money", short: "Overpriced" },
  { value: "not_worth_it", short: "Pricey" },
  { value: "fair_price", short: "Fair" },
  { value: "good_deal", short: "Good" },
  { value: "great_value", short: "Great" },
];

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export type QuickRateSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  brandName?: string | null;
  onSaved?: () => void;
};

/**
 * Rating a milk you are already looking at.
 *
 * The full /add page exists because the global call to action starts with no
 * product: the first job there is search, which can branch into registering a
 * product on another page — none of which survives being folded into an
 * overlay. But when the product is already known, everything the database
 * requires is `product_id`, `rating` and `country_code`, and country is filled
 * in from the profile default. That leaves one genuinely required control, so
 * the reader should not have to lose their place to use it.
 *
 * Submission goes through useMilkTestForm unchanged — same validation, same
 * insert, same cache invalidation — with only the closing redirect swapped for
 * staying put.
 */
export const QuickRateSheet = ({
  open,
  onOpenChange,
  productId,
  productName,
  brandName,
  onSaved,
}: QuickRateSheetProps) => {
  const { data: existing, isPending } = useMyRatingForProduct(open ? productId : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="story-surface max-h-[92dvh] overflow-y-auto rounded-t-3xl border-story-ink/10 bg-story-cream px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:mx-auto sm:max-w-lg sm:rounded-3xl"
      >
        <SheetHeader className="space-y-0 text-left">
          <SheetTitle className="sr-only">Rate {productName}</SheetTitle>
          <div className="flex items-center gap-3">
            <BrandMark brand={brandName} className="h-12 w-12 shrink-0" />
            <div className="min-w-0">
              <p className="story-kicker text-story-muted-2">{existing ? "Your rating" : "Your score"}</p>
              <p className="truncate font-display text-[1.15rem] font-extrabold tracking-[-0.03em] text-story-ink">
                {productName}
              </p>
            </div>
          </div>
        </SheetHeader>

        {isPending ? (
          <div className="py-14 text-center text-[0.875rem] text-story-muted">Loading…</div>
        ) : (
          /* useMilkTestForm reads its initial values once, at mount, so the form
             has to be remounted when we learn there is a rating to edit. */
          <QuickRateForm
            key={existing?.id ?? "new"}
            existing={existing ?? undefined}
            productId={productId}
            onDone={() => {
              onOpenChange(false);
              onSaved?.();
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

const QuickRateForm = ({
  existing,
  productId,
  onDone,
}: {
  existing?: MilkTestResult;
  productId: string;
  onDone: () => void;
}) => {
  const { formState, formSetters, handleSubmit, handleDelete } = useMilkTestForm(existing, {
    onSaved: onDone,
    onDeleted: onDone,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  // The product is the one thing the reader has already told us.
  useEffect(() => {
    formSetters.setProductId(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const tier = getTier(formState.rating);
  const needsCountry = !formState.country || formState.country.trim() === "";
  const canSubmit = formState.rating > 0 && !needsCountry && !formState.isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
      {/* The one required control, as ten targets rather than a slider —
          a thumb on a phone cannot place a slider on 7 versus 8. */}
      <div>
        <div className="grid grid-cols-5 gap-1.5">
          {SCORES.map((n) => {
            const active = formState.rating === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => formSetters.setRating(n)}
                aria-pressed={active}
                // Selected scores carry their own tier colour, the same
                // scale the board and the product pages already use.
                style={active ? { backgroundColor: getTier(n).color } : undefined}
                className={cn(
                  "story-num rounded-xl py-3 text-[1.05rem] transition-colors",
                  "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-2 focus-visible:ring-offset-story-cream",
                  active
                    ? "text-white"
                    : "story-hairline bg-white text-story-ink-2 hover:bg-story-cream-2",
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
        <p className="mt-2 min-h-5 text-[0.8125rem] font-bold text-story-muted">
          {formState.rating > 0 ? `${tier.name} — ${tier.blurb}` : "Tap a score from 1 to 10"}
        </p>
      </div>

      {needsCountry && (
        <div>
          <label className="mb-1.5 block text-[0.8125rem] font-bold text-story-ink-2">
            Where did you buy it? <span className="text-story-amber-dark">*</span>
          </label>
          <CountrySelect country={formState.country} setCountry={formSetters.setCountry} />
          <p className="mt-1.5 text-[0.75rem] text-story-muted-2">
            Set a default in your account and we will not ask again.
          </p>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-[0.8125rem] font-bold text-story-ink-2">Worth the money? (optional)</p>
        <div className="grid grid-cols-5 gap-1.5">
          {PRICE_CHOICES.map((choice) => {
            const active = formState.price === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => {
                  const next = active ? "" : choice.value;
                  formSetters.setPrice(next);
                  formSetters.setPriceHasChanged(true);
                }}
                aria-pressed={active}
                className={cn(
                  "rounded-xl px-1 py-2.5 text-[0.625rem] font-bold leading-tight transition-colors sm:text-[0.6875rem]",
                  active
                    ? "bg-story-ink text-story-cream"
                    : "story-hairline bg-white text-story-muted hover:bg-story-cream-2",
                )}
              >
                {choice.short}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="quick-notes" className="mb-1.5 block text-[0.8125rem] font-bold text-story-ink-2">
          Tasting notes (optional)
        </label>
        <textarea
          id="quick-notes"
          value={formState.notes}
          onChange={(e) => formSetters.setNotes(e.target.value)}
          rows={2}
          placeholder="Splits in coffee, tastes like porridge…"
          className="story-hairline w-full resize-none rounded-xl bg-white px-3.5 py-2.5 text-[0.9375rem] text-story-ink placeholder:text-story-muted-2 focus:outline-hidden focus:ring-2 focus:ring-story-green"
        />
      </div>

      <div className="space-y-2.5">
        <StoryButton type="submit" disabled={!canSubmit} className="w-full">
          {formState.isSubmitting ? "Saving…" : existing ? "Update my rating" : "Post my rating"}
        </StoryButton>

        {existing && (
          confirmDelete ? (
            <div className="story-hairline rounded-2xl bg-white p-3.5">
              <p className="text-[0.8125rem] font-bold text-story-ink">Delete this rating for good?</p>
              <p className="mt-0.5 text-[0.75rem] text-story-muted">
                It comes off the product's average and out of the feed.
              </p>
              <div className="mt-3 flex gap-2">
                <StoryButton
                  type="button"
                  tone="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep it
                </StoryButton>
                <StoryButton
                  type="button"
                  size="sm"
                  className="flex-1 bg-[#d8453a] shadow-none hover:brightness-105"
                  disabled={formState.isDeleting}
                  onClick={handleDelete}
                >
                  {formState.isDeleting ? "Deleting…" : "Delete"}
                </StoryButton>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full text-center text-[0.8125rem] font-bold text-story-muted transition-colors hover:text-[#d8453a]"
            >
              Delete this rating
            </button>
          )
        )}
        <p className="text-center text-[0.75rem] text-story-muted-2">
          Want to add a photo or the shop?{" "}
          <Link to="/add" state={{ selectedProductId: productId }} className="font-bold text-story-green-dark">
            Use the full form
          </Link>
        </p>
      </div>
    </form>
  );
};

export default QuickRateSheet;
