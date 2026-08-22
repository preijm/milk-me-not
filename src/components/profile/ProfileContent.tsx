import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StoryButton, ArrowRight } from "@/components/story/primitives";
import { DropGlyph } from "@/components/story/motifs";
import { ProductIdentity } from "@/components/story/ProductIdentity";
import { QuickRateSheet } from "@/components/story/QuickRateSheet";
import { getTier } from "@/components/story/tiers";
import type { MilkTestResult } from "@/types/milk-test";

interface ProfileContentProps {
  username: string;
  email: string;
  avatarUrl?: string | null;
  totalTests: number;
  avgRating: string;
  bestScore: number;
  memberSince: string;
  onEditClick: () => void;
  onSignOut: () => void;
  /** The reader's own ratings, so they can revisit or retract one. */
  ratings?: MilkTestResult[];
}

const PinGlyph = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" className="shrink-0" aria-hidden>
    <path
      d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/**
 * One responsive implementation, not two.
 *
 * This previously branched on a `variant` prop into a card grid for phones and
 * an entirely separate desktop arm built from ProfileHeader / ProfileStats /
 * ProfileActions — the same information twice, drifting apart, with the desktop
 * sign-out styled as a destructive red button as though leaving were dangerous.
 */
export const ProfileContent = ({
  username,
  email,
  avatarUrl,
  totalTests,
  avgRating,
  bestScore,
  memberSince,
  onEditClick,
  onSignOut,
  ratings = [],
}: ProfileContentProps) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState<MilkTestResult | null>(null);

  return (
    <div className="space-y-6">
      {/* The numbers live in the identity card rather than a separate row of
          boxed tiles. The tiles were a second component for a job the homepage
          already does with a bare number over a letter-spaced label, and they
          left the right half of this card empty. */}
      <section className="story-hairline rounded-3xl bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <button
            onClick={onEditClick}
            className="group relative shrink-0 self-start rounded-full sm:self-auto"
            aria-label="Change your picture"
          >
            <Avatar className="h-20 w-20 ring-1 ring-story-ink/10">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-story-green-wash">
                <DropGlyph className="h-8 w-8 text-story-green-dark" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-story-ink/50 text-[0.6875rem] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
              Change
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="story-display truncate text-[1.6rem] text-story-ink">{username}</h2>
            <p className="truncate text-[0.875rem] text-story-muted">{email}</p>
            <p className="mt-1 text-[0.8125rem] text-story-muted-2">Rating since {memberSince}</p>
          </div>

          <StoryButton tone="outline" size="sm" onClick={onSignOut} className="shrink-0 self-start sm:self-auto">
            Sign out
          </StoryButton>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-story-ink/8 pt-5 sm:grid-cols-4">
          {[
            { value: String(totalTests), label: "Ratings" },
            { value: totalTests > 0 ? avgRating : "—", label: "Your average" },
            { value: bestScore > 0 ? String(bestScore) : "—", label: "Best score" },
            { value: memberSince, label: "Joined" },
          ].map((s) => (
            <div key={s.label}>
              <dd className="story-num text-[clamp(1.5rem,5vw,2rem)] leading-none text-story-ink">{s.value}</dd>
              <dt className="story-kicker mt-1.5 text-story-muted-2">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* No alerts card here any more: the bell in the header carries them from
          every page, which beats a card you have to reach the profile to see. */}
      <section>
        <h3 className="story-kicker mb-3 px-1 text-story-muted-2">Carry on</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate("/results", { state: { myResultsOnly: true } })}
            className="story-hairline group flex items-center justify-between rounded-2xl bg-white p-4 text-left transition-colors hover:bg-story-cream-2"
          >
            <span>
              <span className="block text-[0.9375rem] font-bold text-story-ink">Everything you rated</span>
              <span className="block text-[0.8125rem] text-story-muted">Where your scores sit on the board</span>
            </span>
            <ArrowRight className="shrink-0 text-story-muted-2 transition-colors group-hover:text-story-green-dark" />
          </button>
          <button
            onClick={() => navigate("/add")}
            className="group flex items-center justify-between rounded-2xl bg-story-green p-4 text-left text-white story-lift-green transition-transform hover:brightness-[1.07]"
          >
            <span>
              <span className="block text-[0.9375rem] font-bold">Rate another milk</span>
              <span className="block text-[0.8125rem] text-white/80">Takes about a minute</span>
            </span>
            <ArrowRight className="shrink-0" />
          </button>
        </div>
      </section>

      {/* Until now there was no route to your own ratings at all: the components
          for editing one existed but nothing imported them, so a rating could be
          posted and never corrected or withdrawn. */}
      <section>
        <h3 className="story-kicker mb-3 px-1 text-story-muted-2">
          {ratings.length > 0 ? "Every one you have posted" : "Nothing rated yet"}
        </h3>

        {ratings.length === 0 ? (
          <div className="story-hairline rounded-2xl bg-white p-5 text-center">
            <p className="text-[0.9375rem] text-story-muted">
              Rate your first carton and it will show up here, where you can change your mind later.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ratings.map((r) => {
              const tier = getTier(r.rating);
              return (
                <li key={r.id}>
                  <button
                    onClick={() => setEditing(r)}
                    className="story-hairline flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left transition-colors hover:bg-story-cream-2"
                  >
                    <span className="min-w-0 flex-1">
                      <ProductIdentity
                        brand={r.brand_name}
                        product={r.product_name}
                        properties={r.property_names}
                        flavors={r.flavor_names}
                        isBarista={r.is_barista}
                        size="sm"
                      />
                      {/* Your note and where you bought it are context, not part
                          of the product's name. The note used to be glued to the
                          brand with an em dash, which read as though the carton
                          were called "Oatly — Coconut shouldn't be a flavor".
                          shop_name belongs here and only here: the public view
                          withholds it, so it is your record, not the product's. */}
                      {(r.notes || r.shop_name) && (
                        <span className="mt-1.5 block space-y-0.5 pl-12.5">
                          {r.notes && (
                            <span className="block truncate text-[0.8125rem] italic text-story-muted">
                              “{r.notes}”
                            </span>
                          )}
                          {r.shop_name && (
                            <span className="flex items-center gap-1 text-[0.75rem] text-story-muted-2">
                              <PinGlyph />
                              <span className="truncate">{r.shop_name}</span>
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                    <span
                      className="story-num shrink-0 rounded-lg px-2.5 py-1 text-[0.9375rem] text-white"
                      style={{ backgroundColor: tier.color }}
                    >
                      {r.rating}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editing?.product_id && (
        <QuickRateSheet
          open
          onOpenChange={(next) => !next && setEditing(null)}
          productId={editing.product_id}
          productName={editing.product_name || "This milk"}
          brandName={editing.brand_name}
          onSaved={() => setEditing(null)}
        />
      )}
    </div>
  );
};
