import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Band, Display, Kicker, Lede, MilkDrop, StatFigure, StoryButton, useRateCta } from "@/components/story";
import { useStoryHome } from "@/components/home/useStoryHome";
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
    <Band ground="cream" size="md" className="pt-6 sm:pt-10">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 hidden lg:block">
        <div className="relative h-60 w-60 overflow-hidden rounded-full bg-story-blue">
          <span className="absolute right-2 top-6 text-story-blue-light">
            <MilkDrop size={140} variant="solid" />
          </span>
        </div>
      </div>

      <div className="relative max-w-2xl">
        <Kicker>Live from the community</Kicker>
        <Display as="h1" size="xl" className="mt-4 text-story-ink">
          Real people, real cartons,
          <br />
          <span className="text-story-green">poured recently.</span>
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

      <dl className="relative mt-9 grid max-w-lg grid-cols-3 gap-6 border-t border-story-ink/[0.08] pt-7">
        {figures.map((f) => (
          <StatFigure key={f.label} value={f.value} label={f.label} />
        ))}
      </dl>
    </Band>
  );
};
