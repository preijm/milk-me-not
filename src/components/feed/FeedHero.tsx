import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Band, Display, Kicker, Lede, MilkDrop, StatFigure, StoryButton, useRateCta } from "@/components/story";
import { useStoryHome } from "@/components/home/useStoryHome";
import { MemberPageHead } from "@/components/story/MemberPageHead";
import { cn } from "@/lib/utils";
import type { MilkTestResult } from "@/types/milk-test";

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`);

type FeedHeroProps = {
  items: MilkTestResult[];
  isLoading: boolean;
  isAuthenticated: boolean;
};

/**
 * The feed's editorial open: this is proof, not a data dump. Real people,
 * real cartons, framed with the community's actual numbers before a single
 * card appears. This is also the page's only sell to a signed-out visitor —
 * there is no second CTA band bolted to the end competing with the sticky
 * mobile bar and the footer's own close; the lede does that job instead.
 */
export const FeedHero = ({ items, isLoading, isAuthenticated }: FeedHeroProps) => {
  const cta = useRateCta();
  const { data } = useStoryHome();

  const latest = items[0];
  const latestAgo = latest ? formatDistanceToNow(new Date(latest.created_at), { addSuffix: true }).replace("about ", "") : null;

  const figures = [
    { value: data ? formatCount(data.totalRatings) : "—", label: "Honest ratings, total" },
    { value: isLoading ? "—" : formatCount(items.length), label: "Verdicts shown here" },
    { value: data ? formatCount(data.brands) : "—", label: "Brands covered" },
  ];

  const proof = isLoading
    ? "Loading the latest pours…"
    : items.length > 0
      ? `${items.length} actual tastings below — the newest one landed ${latestAgo}. No stock photos, no brand copy, nobody paid to be here.`
      : "The moment someone rates a carton, it lands here. No stock photos, no brand copy, nobody paid to be here.";

  const joinPitch = !isLoading && !isAuthenticated
    ? " Join free to comment, like the ones you agree with, and add your own carton to the shelf."
    : "";

  return (
    <>
      {/* A member on a phone gets the page's name and the freshness, not the
          pitch. See MemberPageHead for why. */}
      {isAuthenticated && (
        <MemberPageHead
          kicker="Live from the community"
          title="The feed"
          meta={isLoading ? "Loading the latest pours…" : `${items.length} verdicts${latestAgo ? `, newest ${latestAgo}` : ""}`}
          className="lg:hidden"
        />
      )}

    <Band ground="cream" size="md" className={cn("pt-6 sm:pt-10", isAuthenticated && "hidden lg:block")}>
      {/* Deep forest, not the electric blue this used to be. Two reasons: at
          15rem, fully-saturated `story-blue` fought the green headline beside
          it and the forest band directly below; and Contact had already claimed
          blue as the colour that makes it read as itself, which a main-nav page
          wearing the same hue quietly overrode. The deep tone picks up that band
          so the fold reads as one composition, and stays clear of the bright
          green discs on Home and Discover. */}
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 hidden lg:block">
        <div className="relative h-60 w-60 overflow-hidden rounded-full bg-story-green-deep">
          <span className="absolute right-2 top-6 text-story-green-light">
            <MilkDrop size={140} variant="solid" />
          </span>
        </div>
      </div>

      <div className="relative max-w-2xl">
        <Kicker>Live from the community</Kicker>
        <Display as="h1" size="xl" className="mt-4 text-story-ink">
          Real people, real cartons,
          <br />
          <span className="text-story-green-dark">poured recently.</span>
        </Display>
        <Lede className="mt-5">
          {proof}
          {joinPitch}
        </Lede>
        <div className="mt-7">
          <StoryButton onClick={cta.go} size="md" className="w-full sm:w-auto">
            {cta.label}
            <ArrowRight />
          </StoryButton>
        </div>
      </div>

      <dl className="relative mt-9 grid max-w-lg grid-cols-3 gap-6 border-t border-story-ink/8 pt-7">
        {figures.map((f) => (
          <StatFigure key={f.label} value={f.value} label={f.label} />
        ))}
      </dl>
    </Band>
    </>
  );
};
